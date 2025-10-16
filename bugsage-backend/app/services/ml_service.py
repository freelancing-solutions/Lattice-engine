from typing import List, Dict, Any, Optional
import json
import re
from datetime import datetime

from app.core.logging import get_logger

logger = get_logger(__name__)


class MLService:
    def __init__(self):
        # In a real implementation, this would load a trained model
        # For now, we'll use rule-based classification
        self.error_patterns = {
            "syntax": [
                r"syntax error",
                r"unexpected token",
                r"invalid syntax",
                r"parse error"
            ],
            "null_pointer": [
                r"null pointer",
                r"nullreferenceexception",
                r"object reference not set",
                r"noneType"
            ],
            "type_error": [
                r"type error",
                r"cannot convert",
                r"invalid cast",
                r"mismatch"
            ],
            "import": [
                r"import error",
                r"module not found",
                r"cannot import",
                r"no module named"
            ],
            "dependency": [
                r"dependency",
                r"version conflict",
                r"compatibility",
                r"requirement"
            ],
            "performance": [
                r"timeout",
                r"slow",
                r"performance",
                r"memory leak"
            ],
            "network": [
                r"connection",
                r"network",
                r"http",
                r"socket"
            ],
            "database": [
                r"database",
                r"sql",
                r"query",
                r"connection"
            ],
            "security": [
                r"security",
                r"authentication",
                r"authorization",
                r"vulnerability"
            ]
        }
        
        self.fix_suggestions = {
            "syntax": [
                "Check for missing semicolons, brackets, or quotes",
                "Verify proper indentation and formatting",
                "Review syntax for the specific programming language"
            ],
            "null_pointer": [
                "Add null checks before accessing object properties",
                "Initialize variables before use",
                "Consider using optional chaining or safe navigation operators"
            ],
            "type_error": [
                "Verify data types match expected types",
                "Add type checking or casting",
                "Review variable assignments and function returns"
            ],
            "import": [
                "Check if the module is installed",
                "Verify correct spelling of module names",
                "Check import path and module location"
            ],
            "dependency": [
                "Update or downgrade package versions",
                "Check for conflicting dependencies",
                "Review package requirements and compatibility"
            ],
            "performance": [
                "Optimize algorithms and data structures",
                "Add caching mechanisms",
                "Consider asynchronous processing"
            ],
            "network": [
                "Check network connectivity",
                "Verify API endpoints and URLs",
                "Add error handling for network failures"
            ],
            "database": [
                "Check database connection",
                "Review SQL query syntax",
                "Verify table and column names"
            ],
            "security": [
                "Implement proper authentication",
                "Add input validation and sanitization",
                "Review security best practices"
            ]
        }

    def classify_error(self, error_message: str, stack_trace: Optional[str] = None) -> Dict[str, Any]:
        """
        Classify an error based on its message and stack trace.
        
        Args:
            error_message: The error message to classify
            stack_trace: Optional stack trace for additional context
            
        Returns:
            Dictionary with classification results and confidence
        """
        if not error_message:
            return {"error_type": "unknown", "confidence": 0.0}
        
        # Combine error message and stack trace for analysis
        full_text = error_message.lower()
        if stack_trace:
            full_text += " " + stack_trace.lower()
        
        # Check against patterns
        scores = {}
        for error_type, patterns in self.error_patterns.items():
            score = 0
            for pattern in patterns:
                if re.search(pattern, full_text):
                    score += 1
            scores[error_type] = score
        
        # Find the best match
        if not scores or max(scores.values()) == 0:
            return {"error_type": "unknown", "confidence": 0.0}
        
        best_type = max(scores, key=scores.get)
        confidence = scores[best_type] / len(self.error_patterns[best_type])
        
        return {
            "error_type": best_type,
            "confidence": confidence,
            "all_scores": scores
        }

    def suggest_fixes(self, error_type: str, error_message: str, context: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """
        Suggest fixes based on error type and message.
        
        Args:
            error_type: The classified error type
            error_message: The original error message
            context: Optional context information
            
        Returns:
            List of fix suggestions with confidence scores
        """
        if error_type not in self.fix_suggestions:
            return []
        
        # Get base suggestions for the error type
        base_suggestions = self.fix_suggestions[error_type]
        
        # Create suggestions with confidence scores
        suggestions = []
        for i, suggestion in enumerate(base_suggestions):
            # In a real implementation, this would use more sophisticated logic
            # to determine confidence based on context, error message, etc.
            confidence = 0.8 - (i * 0.1)  # Decrease confidence for later suggestions
            
            suggestions.append({
                "fix": suggestion,
                "confidence": confidence,
                "category": error_type
            })
        
        return suggestions

    def analyze_fix_effectiveness(self, fix: str, error_type: str) -> float:
        """
        Analyze how effective a fix might be for a given error type.
        
        Args:
            fix: The proposed fix
            error_type: The error type
            
        Returns:
            Effectiveness score between 0.0 and 1.0
        """
        # In a real implementation, this would use historical data
        # to determine fix effectiveness
        
        # For now, we'll use a simple heuristic
        if error_type not in self.fix_suggestions:
            return 0.5  # Default medium effectiveness
        
        base_suggestions = self.fix_suggestions[error_type]
        for i, suggestion in enumerate(base_suggestions):
            if suggestion.lower() in fix.lower():
                # Higher effectiveness for suggestions that match our base suggestions
                return 0.9 - (i * 0.1)
        
        # Default effectiveness for unknown fixes
        return 0.5

    def batch_classify(self, error_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Classify multiple errors at once.
        
        Args:
            error_data: List of error dictionaries with message and optional stack_trace
            
        Returns:
            List of classification results
        """
        results = []
        for error in error_data:
            error_message = error.get("message", "")
            stack_trace = error.get("stack_trace")
            
            classification = self.classify_error(error_message, stack_trace)
            
            # Include the original error in the result
            result = {
                "id": error.get("id"),
                "original_error": error_message,
                "classification": classification
            }
            
            results.append(result)
        
        return results

    def train_model(self, training_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Train a model with new data.
        
        Args:
            training_data: List of training examples with error messages and labels
            
        Returns:
            Training metrics
        """
        # In a real implementation, this would train a machine learning model
        # For now, we'll just log the request
        logger.info(f"Received {len(training_data)} training examples")
        
        return {
            "status": "success",
            "message": "Training completed",
            "examples_processed": len(training_data),
            "timestamp": datetime.utcnow().isoformat()
        }

    def get_model_info(self) -> Dict[str, Any]:
        """
        Get information about the current model.
        
        Returns:
            Model information
        """
        return {
            "model_type": "rule-based",
            "version": "1.0.0",
            "supported_categories": list(self.error_patterns.keys()),
            "last_updated": datetime.utcnow().isoformat()
        }


# Create a singleton instance
ml_service = MLService()