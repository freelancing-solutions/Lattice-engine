/**
 * Payment Methods Card
 *
 * A component for displaying and managing payment methods with support
 * for cards and PayPal payment methods.
 */

import { CreditCard, Plus, Trash, Star, Wallet } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PaymentMethod } from '@/types';

interface PaymentMethodsCardProps {
  paymentMethods: PaymentMethod[];
  onAdd: () => Promise<void>;
  onRemove?: (methodId: string) => Promise<void>;
  isLoading?: boolean;
}

export function PaymentMethodsCard({
  paymentMethods,
  onAdd,
  onRemove,
  isLoading = false,
}: PaymentMethodsCardProps) {
  const getCardBrandIcon = (brand: string | null) => {
    switch (brand?.toLowerCase()) {
      case 'visa':
        return (
          <div className="w-10 h-6 bg-gradient-to-r from-blue-600 to-blue-400 rounded flex items-center justify-center">
            <span className="text-white font-bold text-xs">VISA</span>
          </div>
        );
      case 'mastercard':
        return (
          <div className="w-10 h-6 bg-gradient-to-r from-red-600 to-orange-400 rounded flex items-center justify-center">
            <span className="text-white font-bold text-xs">MC</span>
          </div>
        );
      case 'amex':
        return (
        <div className="w-10 h-6 bg-gradient-to-r from-blue-800 to-blue-600 rounded flex items-center justify-center">
            <span className="text-white font-bold text-xs">AMEX</span>
        </div>
        );
      default:
        return (
          <div className="w-10 h-6 bg-gradient-to-r from-gray-600 to-gray-400 rounded flex items-center justify-center">
            <CreditCard className="h-4 w-4 text-white" />
          </div>
        );
    }
  };

  const getPayPalIcon = () => (
    <div className="w-10 h-6 bg-gradient-to-r from-blue-500 to-blue-300 rounded flex items-center justify-center">
      <Wallet className="h-4 w-4 text-white" />
    </div>
  );

  const formatExpiry = (month: number | null, year: number | null) => {
    if (!month || !year) return '--/--';
    return `${month.toString().padStart(2, '0')}/${year.toString().slice(-2)}`;
  };

  const handleRemove = async (methodId: string) => {
    if (!onRemove) return;
    try {
      await onRemove(methodId);
    } catch (error) {
      console.error('Failed to remove payment method:', error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Methods
            </div>
            <Badge variant="outline" className="ml-auto">
              {paymentMethods.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="w-10 h-6 bg-gray-200 rounded"></div>
                  <div className="flex-1 space-y-2 ml-4">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Methods
          </div>
          <Badge variant="outline" className="ml-auto">
            {paymentMethods.length}
          </Badge>
        </CardTitle>
        <CardDescription>
          Manage your payment methods for subscription billing.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {paymentMethods.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No payment methods added
            </h3>
            <p className="text-gray-500 mb-4">
              Add a payment method to manage your subscription billing.
            </p>
            <Button onClick={onAdd} disabled={isLoading}>
              <Plus className="h-4 w-4 mr-2" />
              Add Payment Method
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {/* Payment Method Icon */}
                    {method.type === 'card' ? (
                      getCardBrandIcon(method.brand)
                    ) : (
                      getPayPalIcon()
                    )}

                    {/* Card Details */}
                    <div className="flex flex-col">
                      <div className="font-medium">
                        {method.type === 'card' ? (
                          <>Card ending in {method.last4}</>
                        ) : (
                          <>PayPal Account</>
                        )}
                      </div>
                      {method.type === 'card' && (
                        <div className="text-sm text-gray-500">
                          Expires {formatExpiry(method.expiryMonth, method.expiryYear)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status and Actions */}
                  <div className="flex items-center gap-2">
                    {method.isDefault && (
                      <Badge variant="default" className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        Default
                      </Badge>
                    )}

                    {/* Remove Button */}
                    {onRemove && !method.isDefault && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemove(method.id)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
                        disabled={isLoading}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Add Payment Method Button */}
            <div className="pt-4 border-t">
              <Button
                onClick={onAdd}
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Payment Method
              </Button>
            </div>

            {/* Payment Method Info */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <div className="w-4 h-4 text-blue-600 mt-0.5">
                  <CreditCard className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Payment Security</div>
                  <div className="mt-1">
                    Your payment information is encrypted and securely stored by Paddle.com.
                    We never store your complete card details on our servers.
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}