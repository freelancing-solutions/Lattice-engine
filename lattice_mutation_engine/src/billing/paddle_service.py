"""
Paddle.com API service for subscription and billing management.

This module provides a service class to encapsulate all Paddle.com interactions
including customer management, subscription operations, and webhook verification.
"""

import hashlib
import hmac
import logging
import time
from typing import Dict, Any, List, Optional, Tuple
from urllib.parse import urlencode

import httpx
from fastapi import HTTPException

from src.config.settings import config as engine_config
from src.models.billing_models import PaymentMethod

logger = logging.getLogger(__name__)


class PaddleService:
    """Service for interacting with Paddle.com API"""

    def __init__(self, vendor_id: str, api_key: str, environment: str = "sandbox"):
        """
        Initialize Paddle service

        Args:
            vendor_id: Paddle vendor/seller ID
            api_key: Paddle API authentication key
            environment: 'sandbox' or 'production'
        """
        self.vendor_id = vendor_id
        self.api_key = api_key
        self.environment = environment

        # Set base URL based on environment
        if environment == "production":
            self.base_url = "https://api.paddle.com"
        else:
            self.base_url = "https://sandbox-api.paddle.com"

        # Initialize HTTP client with authentication
        self.client = httpx.AsyncClient(
            base_url=self.base_url,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            timeout=30.0
        )

    async def create_customer(self, email: str, organization_id: str) -> str:
        """
        Create a new customer in Paddle

        Args:
            email: Customer email address
            organization_id: Internal organization ID for passthrough

        Returns:
            str: Paddle customer ID

        Raises:
            HTTPException: If customer creation fails
        """
        try:
            response = await self._make_request_with_retry(
                "POST",
                "/customers",
                json={
                    "email": email,
                    "name": email,  # Paddle requires name field
                    "custom_data": {
                        "organization_id": organization_id
                    }
                }
            )

            customer_id = response["data"]["id"]
            logger.info(f"Created Paddle customer {customer_id} for organization {organization_id}")
            return customer_id

        except Exception as e:
            logger.error(f"Failed to create Paddle customer: {e}")
            raise HTTPException(status_code=500, detail="Failed to create customer")

    async def create_subscription(
        self,
        customer_id: str,
        plan_id: str,
        billing_interval: str
    ) -> Dict[str, Any]:
        """
        Create a new subscription

        Args:
            customer_id: Paddle customer ID
            plan_id: Paddle plan ID
            billing_interval: 'month' or 'year'

        Returns:
            Dict: Subscription data from Paddle
        """
        try:
            response = await self._make_request_with_retry(
                "POST",
                "/subscriptions",
                json={
                    "customer_id": customer_id,
                    "items": [
                        {
                            "price_id": plan_id,
                            "quantity": 1
                        }
                    ],
                    "billing_details": {
                        "po_number": None,
                        "tax_number": None
                    }
                }
            )

            subscription_data = response["data"]
            logger.info(f"Created Paddle subscription {subscription_data['id']} for customer {customer_id}")
            return subscription_data

        except Exception as e:
            logger.error(f"Failed to create Paddle subscription: {e}")
            raise HTTPException(status_code=500, detail="Failed to create subscription")

    async def update_subscription(self, subscription_id: str, plan_id: str) -> Dict[str, Any]:
        """
        Update an existing subscription (plan change)

        Args:
            subscription_id: Paddle subscription ID
            plan_id: New Paddle plan ID

        Returns:
            Dict: Updated subscription data
        """
        try:
            response = await self._make_request_with_retry(
                "PATCH",
                f"/subscriptions/{subscription_id}",
                json={
                    "items": [
                        {
                            "price_id": plan_id,
                            "quantity": 1
                        }
                    ],
                    "proration_billing_mode": "prorated_immediately"
                }
            )

            subscription_data = response["data"]
            logger.info(f"Updated Paddle subscription {subscription_id} to plan {plan_id}")
            return subscription_data

        except Exception as e:
            logger.error(f"Failed to update Paddle subscription: {e}")
            raise HTTPException(status_code=500, detail="Failed to update subscription")

    async def cancel_subscription(
        self,
        subscription_id: str,
        cancel_at_period_end: bool = True
    ) -> Dict[str, Any]:
        """
        Cancel a subscription

        Args:
            subscription_id: Paddle subscription ID
            cancel_at_period_end: Whether to cancel at period end or immediately

        Returns:
            Dict: Cancellation confirmation
        """
        try:
            response = await self._make_request_with_retry(
                "POST",
                f"/subscriptions/{subscription_id}/cancel",
                json={
                    "effective_from": "next_billing_period" if cancel_at_period_end else "immediately"
                }
            )

            logger.info(f"Cancelled Paddle subscription {subscription_id}")
            return response["data"]

        except Exception as e:
            logger.error(f"Failed to cancel Paddle subscription: {e}")
            raise HTTPException(status_code=500, detail="Failed to cancel subscription")

    async def get_subscription(self, subscription_id: str) -> Dict[str, Any]:
        """
        Get subscription details

        Args:
            subscription_id: Paddle subscription ID

        Returns:
            Dict: Subscription data
        """
        try:
            response = await self._make_request_with_retry(
                "GET",
                f"/subscriptions/{subscription_id}"
            )

            return response["data"]

        except Exception as e:
            logger.error(f"Failed to get Paddle subscription: {e}")
            raise HTTPException(status_code=404, detail="Subscription not found")

    async def list_invoices(self, customer_id: str) -> List[Dict[str, Any]]:
        """
        List invoices for a customer

        Args:
            customer_id: Paddle customer ID

        Returns:
            List[Dict]: List of invoice data
        """
        try:
            response = await self._make_request_with_retry(
                "GET",
                "/invoices",
                params={"customer_id": customer_id}
            )

            return response["data"]

        except Exception as e:
            logger.error(f"Failed to list Paddle invoices: {e}")
            raise HTTPException(status_code=500, detail="Failed to list invoices")

    async def get_invoice(self, invoice_id: str) -> Dict[str, Any]:
        """
        Get invoice details

        Args:
            invoice_id: Paddle invoice ID

        Returns:
            Dict: Invoice data with download URL
        """
        try:
            response = await self._make_request_with_retry(
                "GET",
                f"/invoices/{invoice_id}"
            )

            return response["data"]

        except Exception as e:
            logger.error(f"Failed to get Paddle invoice: {e}")
            raise HTTPException(status_code=404, detail="Invoice not found")

    async def create_checkout_session(
        self,
        customer_id: str,
        plan_id: str,
        success_url: str,
        cancel_url: str
    ) -> str:
        """
        Create a checkout session for subscription or payment method update

        Args:
            customer_id: Paddle customer ID
            plan_id: Paddle plan ID (for subscription)
            success_url: URL to redirect after successful payment
            cancel_url: URL to redirect after cancelled payment

        Returns:
            str: Checkout URL for redirect
        """
        try:
            response = await self._make_request_with_retry(
                "POST",
                "/checkout/sessions",
                json={
                    "customer_id": customer_id,
                    "items": [
                        {
                            "price_id": plan_id,
                            "quantity": 1
                        }
                    ],
                    "success_url": success_url,
                    "cancel_url": cancel_url
                }
            )

            checkout_url = response["data"]["checkout_url"]
            logger.info(f"Created Paddle checkout session for customer {customer_id}")
            return checkout_url

        except Exception as e:
            logger.error(f"Failed to create Paddle checkout session: {e}")
            raise HTTPException(status_code=500, detail="Failed to create checkout session")

    async def get_payment_methods(self, customer_id: str) -> List[PaymentMethod]:
        """
        Get payment methods for a customer

        Args:
            customer_id: Paddle customer ID

        Returns:
            List[PaymentMethod]: List of payment methods
        """
        try:
            response = await self._make_request_with_retry(
                "GET",
                f"/customers/{customer_id}/payment-methods"
            )

            payment_methods = []
            for method in response["data"]:
                payment_method = PaymentMethod(
                    id=method["id"],
                    type=method["type"],
                    last4=method.get("card", {}).get("last4"),
                    brand=method.get("card", {}).get("brand"),
                    expiry_month=method.get("card", {}).get("expiry_month"),
                    expiry_year=method.get("card", {}).get("expiry_year"),
                    is_default=method.get("is_default", False)
                )
                payment_methods.append(payment_method)

            return payment_methods

        except Exception as e:
            logger.error(f"Failed to get Paddle payment methods: {e}")
            raise HTTPException(status_code=500, detail="Failed to get payment methods")

    def verify_webhook_signature(self, payload: bytes, signature: str) -> bool:
        """
        Verify Paddle webhook signature

        Args:
            payload: Raw webhook payload bytes
            signature: Paddle signature from request

        Returns:
            bool: True if signature is valid
        """
        try:
            webhook_secret = engine_config.paddle_webhook_secret
            if not webhook_secret:
                logger.error("Paddle webhook secret not configured")
                return False

            # Create HMAC signature
            expected_signature = hmac.new(
                webhook_secret.encode('utf-8'),
                payload,
                hashlib.sha256
            ).hexdigest()

            # Compare signatures
            is_valid = hmac.compare_digest(expected_signature, signature)

            if not is_valid:
                logger.warning("Invalid Paddle webhook signature")

            return is_valid

        except Exception as e:
            logger.error(f"Error verifying Paddle webhook signature: {e}")
            return False

    async def _make_request_with_retry(
        self,
        method: str,
        url: str,
        max_retries: int = 3,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Make HTTP request with retry logic

        Args:
            method: HTTP method
            url: API endpoint URL
            max_retries: Maximum number of retry attempts
            **kwargs: Additional arguments for httpx request

        Returns:
            Dict: Response data

        Raises:
            Exception: If all retry attempts fail
        """
        last_exception = None

        for attempt in range(max_retries + 1):
            try:
                response = await self.client.request(method, url, **kwargs)

                # Handle different status codes
                if response.status_code == 401:
                    raise HTTPException(status_code=401, detail="Paddle API authentication failed")
                elif response.status_code == 404:
                    raise HTTPException(status_code=404, detail="Resource not found in Paddle")
                elif response.status_code == 429:
                    retry_after = int(response.headers.get("Retry-After", 60))
                    logger.warning(f"Paddle API rate limited, retrying in {retry_after} seconds")
                    time.sleep(retry_after)
                    continue
                elif response.status_code >= 500:
                    if attempt < max_retries:
                        wait_time = 2 ** attempt  # Exponential backoff
                        logger.warning(f"Paddle API error {response.status_code}, retrying in {wait_time} seconds")
                        time.sleep(wait_time)
                        continue
                    else:
                        raise HTTPException(status_code=500, detail="Paddle API server error")

                response.raise_for_status()
                return response.json()

            except httpx.HTTPStatusError as e:
                last_exception = e
                if attempt < max_retries and e.response.status_code >= 500:
                    wait_time = 2 ** attempt
                    logger.warning(f"Paddle API error, retrying in {wait_time} seconds")
                    time.sleep(wait_time)
                    continue
                break
            except Exception as e:
                last_exception = e
                if attempt < max_retries:
                    wait_time = 2 ** attempt
                    logger.warning(f"Paddle API request failed, retrying in {wait_time} seconds")
                    time.sleep(wait_time)
                    continue
                break

        raise last_exception or Exception("Failed to complete Paddle API request")

    async def close(self):
        """Close HTTP client"""
        await self.client.aclose()


# Singleton instance
_paddle_service: Optional[PaddleService] = None


def get_paddle_service() -> PaddleService:
    """Get or create Paddle service singleton"""
    global _paddle_service

    if _paddle_service is None:
        if not all([
            engine_config.paddle_vendor_id,
            engine_config.paddle_api_key,
        ]):
            raise ValueError("Paddle configuration missing. Please set paddle_vendor_id and paddle_api_key")

        _paddle_service = PaddleService(
            vendor_id=engine_config.paddle_vendor_id,
            api_key=engine_config.paddle_api_key,
            environment=engine_config.paddle_environment
        )

        logger.info(f"Initialized Paddle service in {engine_config.paddle_environment} environment")

    return _paddle_service