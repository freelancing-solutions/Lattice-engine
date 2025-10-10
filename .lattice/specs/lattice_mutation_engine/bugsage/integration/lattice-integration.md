# BugSage - Project Lattice Integration

## 🔗 Integration Overview

BugSage is designed as the debugging brain within Project Lattice's autonomous development ecosystem. This integration enables seamless error-driven spec evolution, where production errors automatically improve and evolve the system's specifications and behavior patterns.

## 🏗️ Architecture Integration

### System Flow
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Production    │    │   BugSage AI    │    │  Project Lattice │
│    Error        │───▶│   Analysis &    │───▶│   Spec Mutation  │
│  (Sentry/etc)   │    │  Fix Generation │    │   Orchestrator   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Error Data    │    │   Fix & Code    │    │   Updated Spec   │
│   Collection    │    │   Generation    │    │   Evolution      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📁 Lattice Integration Structure

### BugSage Lattice Agent
```typescript
// lattice-agents/bugsage-agent.ts
import { LatticeAgent } from '@lattice/sdk/agents';
import { BugSageAPI } from '../services/bugsage-api';
import { SpecMutation } from '@lattice/sdk/specs';

export class BugSageAgent extends LatticeAgent {
  private bugsageAPI: BugSageAPI;

  constructor(config: BugSageAgentConfig) {
    super({
      name: 'bugsage-agent',
      version: '1.0.0',
      description: 'AI-powered debugging and spec evolution agent'
    });

    this.bugsageAPI = new BugSageAPI(config.bugsageAPI);
  }

  /**
   * Handle error events from monitoring systems
   */
  async handleErrorEvent(event: ErrorEvent): Promise<SpecMutation[]> {
    // Analyze error with BugSage AI
    const analysis = await this.bugsageAPI.analyzeError(event);

    // Generate fix suggestions
    const fixes = await this.bugsageAPI.generateFixes(analysis);

    // Create spec mutations based on analysis and fixes
    const mutations = this.createSpecMutations(analysis, fixes);

    return mutations;
  }

  /**
   * Create spec mutations from BugSage analysis
   */
  private createSpecMutations(
    analysis: ErrorAnalysis,
    fixes: GeneratedFix[]
  ): SpecMutation[] {
    const mutations: SpecMutation[] = [];

    // Error handling spec mutation
    if (analysis.rootCause) {
      mutations.push(SpecMutation.create({
        type: 'error_handling',
        description: `Add error handling for: ${analysis.rootCause}`,
        priority: analysis.riskLevel === 'critical' ? 'high' : 'medium',
        implementation: {
          pattern: analysis.suggestedFixes[0] || '',
          location: this.inferLocation(analysis),
          testRequirements: this.generateTestRequirements(analysis)
        }
      }));
    }

    // Validation spec mutation
    if (analysis.preventionSuggestions.length > 0) {
      mutations.push(SpecMutation.create({
        type: 'validation',
        description: 'Add input validation to prevent similar errors',
        priority: 'medium',
        implementation: {
          pattern: this.createValidationPattern(analysis),
          location: this.inferValidationLocation(analysis),
          testRequirements: this.createValidationTests(analysis)
        }
      }));
    }

    // Fix application spec mutation
    for (const fix of fixes) {
      mutations.push(SpecMutation.create({
        type: 'fix_application',
        description: fix.description,
        priority: this.calculatePriority(fix, analysis),
        implementation: {
          pattern: fix.codeChanges,
          location: fix.filePaths,
          testRequirements: fix.testSuggestions,
          rollbackPlan: fix.rollbackPlan
        }
      }));
    }

    return mutations;
  }

  /**
   * Infer error location from analysis
   */
  private inferLocation(analysis: ErrorAnalysis): string {
    // Extract file path and line number from stack trace
    const stackTrace = analysis.stackTrace || '';
    const locationMatch = stackTrace.match(/at\s+(.+?):(\d+):(\d+)/);

    if (locationMatch) {
      return `${locationMatch[1]}:${locationMatch[2]}`;
    }

    return 'unknown';
  }

  /**
   * Generate test requirements for error handling
   */
  private generateTestRequirements(analysis: ErrorAnalysis): string[] {
    const requirements = [
      `Test error scenario: ${analysis.title}`,
      'Verify graceful degradation',
      'Test error recovery mechanisms'
    ];

    if (analysis.impactAssessment.includes('user')) {
      requirements.push('Test user experience during error');
    }

    return requirements;
  }

  /**
   * Create validation pattern
   */
  private createValidationPattern(analysis: ErrorAnalysis): string {
    return `
// Input validation to prevent: ${analysis.title}
export function validateInput(input: any): ValidationResult {
  if (!input || typeof input !== 'object') {
    throw new ValidationError('Invalid input format');
  }

  // Add specific validations based on error type
  return { valid: true, data: input };
}`;
  }

  /**
   * Calculate mutation priority
   */
  private calculatePriority(fix: GeneratedFix, analysis: ErrorAnalysis): string {
    if (fix.riskScore > 0.7 || analysis.riskLevel === 'critical') {
      return 'high';
    }
    if (fix.confidenceScore > 0.8) {
      return 'medium';
    }
    return 'low';
  }
}

interface BugSageAgentConfig {
  bugsageAPI: {
    endpoint: string;
    apiKey: string;
    timeout: number;
  };
}
```

### Lattice Task Definitions
```typescript
// lattice-tasks/bugsage-tasks.ts
import { LatticeTask, TaskContext } from '@lattice/sdk/tasks';
import { BugSageAgent } from '../agents/bugsage-agent';

export class ErrorAnalysisTask extends LatticeTask {
  constructor(private bugsageAgent: BugSageAgent) {
    super({
      name: 'error-analysis',
      description: 'Analyze production error and generate spec mutations',
      inputs: ['errorEvent'],
      outputs: ['specMutations'],
      estimatedDuration: 300 // 5 minutes
    });
  }

  async execute(context: TaskContext): Promise<SpecMutation[]> {
    const errorEvent = context.getInput('errorEvent');

    // Validate input
    if (!errorEvent || !errorEvent.error) {
      throw new Error('Invalid error event input');
    }

    // Process error through BugSage
    const mutations = await this.bugsageAgent.handleErrorEvent(errorEvent);

    // Log mutation creation
    context.log.info(`Created ${mutations.length} spec mutations from error: ${errorEvent.error.title}`);

    // Store metadata
    context.setMetadata('errorId', errorEvent.error.id);
    context.setMetadata('mutationCount', mutations.length);
    context.setMetadata('analysisTimestamp', new Date().toISOString());

    return mutations;
  }
}

export class FixValidationTask extends LatticeTask {
  constructor(private bugsageAgent: BugSageAgent) {
    super({
      name: 'fix-validation',
      description: 'Validate generated fixes before application',
      inputs: ['fixes'],
      outputs: ['validationResults'],
      estimatedDuration: 120 // 2 minutes
    });
  }

  async execute(context: TaskContext): Promise<ValidationResult[]> {
    const fixes = context.getInput('fixes');
    const validationResults: ValidationResult[] = [];

    for (const fix of fixes) {
      // Validate fix through BugSage
      const validation = await this.bugsageAgent.validateFix(fix);
      validationResults.push(validation);

      context.log.info(`Fix validation: ${fix.id} - ${validation.passed ? 'PASSED' : 'FAILED'}`);
    }

    return validationResults;
  }
}

export class SpecEvolutionTask extends LatticeTask {
  constructor(private bugsageAgent: BugSageAgent) {
    super({
      name: 'spec-evolution',
      description: 'Evolve specifications based on error patterns',
      inputs: ['errorHistory', 'currentSpec'],
      outputs: ['evolvedSpec'],
      estimatedDuration: 600 // 10 minutes
    });
  }

  async execute(context: TaskContext): Promise<Spec> {
    const errorHistory = context.getInput('errorHistory');
    const currentSpec = context.getInput('currentSpec');

    // Analyze error patterns
    const patterns = this.identifyPatterns(errorHistory);

    // Suggest spec improvements
    const improvements = await this.bugsageAgent.suggestSpecImprovements(patterns, currentSpec);

    // Apply improvements to spec
    const evolvedSpec = this.applySpecImprovements(currentSpec, improvements);

    context.log.info(`Evolved spec with ${improvements.length} improvements`);

    return evolvedSpec;
  }

  private identifyPatterns(errors: Error[]): ErrorPattern[] {
    // Identify recurring error patterns
    const patterns: ErrorPattern[] = [];

    // Group errors by similarity
    const groupedErrors = this.groupErrorsBySimilarity(errors);

    for (const [pattern, errorGroup] of groupedErrors) {
      patterns.push({
        pattern,
        frequency: errorGroup.length,
        severity: this.calculateSeverity(errorGroup),
        suggestedFixes: this.extractCommonFixes(errorGroup)
      });
    }

    return patterns;
  }
}
```

### Lattice Workflow Integration
```typescript
// lattice-workflows/bugsage-workflow.ts
import { LatticeWorkflow, WorkflowStep } from '@lattice/sdk/workflows';
import { ErrorAnalysisTask, FixValidationTask, SpecEvolutionTask } from '../tasks/bugsage-tasks';

export class BugSageErrorWorkflow extends LatticeWorkflow {
  constructor() {
    super({
      name: 'bugsage-error-workflow',
      description: 'Complete error handling workflow with BugSage integration',
      version: '1.0.0'
    });
  }

  defineSteps(): WorkflowStep[] {
    return [
      // Step 1: Error Detection & Analysis
      {
        name: 'detect-error',
        task: 'error-detection',
        description: 'Monitor for production errors',
        triggers: ['sentry-webhook', 'github-webhook', 'manual-trigger'],
        retryPolicy: {
          maxRetries: 3,
          backoffMultiplier: 2
        }
      },

      // Step 2: AI Analysis (BugSage)
      {
        name: 'analyze-error',
        task: 'error-analysis',
        description: 'Analyze error with BugSage AI',
        dependsOn: ['detect-error'],
        timeout: 600000, // 10 minutes
        onTimeout: {
          action: 'escalate',
          escalateTo: 'human-review'
        }
      },

      // Step 3: Fix Generation
      {
        name: 'generate-fixes',
        task: 'fix-generation',
        description: 'Generate fixes using BugSage',
        dependsOn: ['analyze-error'],
        condition: (context) => {
          const analysis = context.getOutput('errorAnalysis');
          return analysis.confidence > 0.7;
        }
      },

      // Step 4: Fix Validation
      {
        name: 'validate-fixes',
        task: 'fix-validation',
        description: 'Validate generated fixes',
        dependsOn: ['generate-fixes'],
        parallel: true
      },

      // Step 5: Human Review (if needed)
      {
        name: 'human-review',
        task: 'human-approval',
        description: 'Human review for high-risk fixes',
        dependsOn: ['validate-fixes'],
        condition: (context) => {
          const validationResults = context.getOutput('validationResults');
          return validationResults.some(r => r.riskScore > 0.7);
        },
        approvers: ['tech-lead', 'senior-developer']
      },

      // Step 6: Apply Fix
      {
        name: 'apply-fix',
        task: 'fix-application',
        description: 'Apply validated fix to codebase',
        dependsOn: ['validate-fixes', 'human-review'],
        condition: (context) => {
          const validationResults = context.getOutput('validationResults');
          return validationResults.every(r => r.passed);
        },
        rollbackPlan: {
          enabled: true,
          timeout: 1800000 // 30 minutes
        }
      },

      // Step 7: Spec Evolution
      {
        name: 'evolve-spec',
        task: 'spec-evolution',
        description: 'Evolve specifications based on learnings',
        dependsOn: ['apply-fix'],
        async: true // Don't block the workflow
      }
    ];
  }
}

// Error monitoring workflow
export class ErrorMonitoringWorkflow extends LatticeWorkflow {
  constructor() {
    super({
      name: 'error-monitoring',
      description: 'Continuous error monitoring and pattern detection',
      version: '1.0.0',
      schedule: '*/5 * * * *' // Every 5 minutes
    });
  }

  defineSteps(): WorkflowStep[] {
    return [
      {
        name: 'collect-metrics',
        task: 'metrics-collection',
        description: 'Collect error metrics and patterns'
      },
      {
        name: 'detect-anomalies',
        task: 'anomaly-detection',
        description: 'Detect error rate anomalies',
        dependsOn: ['collect-metrics']
      },
      {
        name: 'trigger-analysis',
        task: 'workflow-trigger',
        description: 'Trigger BugSage analysis for critical errors',
        dependsOn: ['detect-anomalies'],
        condition: (context) => {
          const anomalies = context.getOutput('anomalies');
          return anomalies.some(a => a.severity === 'critical');
        }
      }
    ];
  }
}
```

## 🔌 API Integration Points

### BugSage-Lattice Bridge API
```python
# lattice_bridge/api.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Any
import asyncio

from database.connection import get_async_session
from services.error_service import ErrorService
from services.fix_service import FixService
from services.analysis_service import AnalysisService
from schemas.lattice import (
    ErrorEvent,
    SpecMutationRequest,
    SpecMutationResponse,
    ValidationRequest,
    ValidationResponse
)
from utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/lattice", tags=["lattice"])

@router.post("/error-events", response_model=Dict[str, Any])
async def handle_lattice_error_event(
    event: ErrorEvent,
    db: AsyncSession = Depends(get_async_session)
):
    """Handle error events from Project Lattice"""
    try:
        # Create or update error
        error_service = ErrorService(db)
        analysis_service = AnalysisService(db)

        # Store error
        error_data = {
            "title": event.error.title,
            "description": event.error.description,
            "severity": event.error.severity,
            "source": event.source,
            "source_id": event.error.id,
            "context": event.context,
            "metadata": event.metadata,
            "project_id": event.projectId
        }

        error = await error_service.create_error(error_data)

        # Trigger AI analysis
        await analysis_service.trigger_analysis(error.id)

        # Generate spec mutations
        mutations = await generate_spec_mutations(error, db)

        return {
            "errorId": error.id,
            "status": "processing",
            "mutations": mutations,
            "workflowId": f"bugsage-error-{error.id}"
        }

    except Exception as e:
        logger.error(f"Failed to handle lattice error event: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/spec-mutations", response_model=SpecMutationResponse)
async def create_spec_mutations(
    request: SpecMutationRequest,
    db: AsyncSession = Depends(get_async_session)
):
    """Create spec mutations based on BugSage analysis"""
    try:
        error_service = ErrorService(db)

        # Get error details
        error = await error_service.get_error(request.errorId)

        if not error:
            raise HTTPException(status_code=404, detail="Error not found")

        # Generate mutations
        mutations = await generate_spec_mutations(error, db)

        return SpecMutationResponse(
            errorId=request.errorId,
            mutations=mutations,
            status="ready",
            estimatedDuration=estimate_mutation_duration(mutations)
        )

    except Exception as e:
        logger.error(f"Failed to create spec mutations: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/validate-fix", response_model=ValidationResponse)
async def validate_fix_for_lattice(
    request: ValidationRequest,
    db: AsyncSession = Depends(get_async_session)
):
    """Validate fix for Lattice application"""
    try:
        fix_service = FixService(db)

        # Validate fix
        validation_result = await fix_service.validate_fix(
            request.fixId,
            request.context
        )

        return ValidationResponse(
            fixId=request.fixId,
            validationPassed=validation_result.passed,
            confidence=validation_result.confidence,
            riskScore=validation_result.riskScore,
            recommendations=validation_result.recommendations,
            canApply=validation_result.can_apply
        )

    except Exception as e:
        logger.error(f"Failed to validate fix: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def generate_spec_mutations(error, db: AsyncSession) -> List[Dict[str, Any]]:
    """Generate spec mutations from error analysis"""
    mutations = []

    # Error handling mutation
    if error.ai_analysis:
        mutations.append({
            "type": "error_handling",
            "description": f"Add error handling for: {error.title}",
            "priority": "high" if error.severity == "critical" else "medium",
            "spec": {
                "pattern": error.ai_analysis.get("suggested_fixes", []),
                "location": extract_location(error),
                "testRequirements": [
                    f"Test error scenario: {error.title}",
                    "Verify graceful degradation"
                ]
            }
        })

    # Validation mutation
    if error.category:
        mutations.append({
            "type": "validation",
            "description": f"Add validation for {error.category} errors",
            "priority": "medium",
            "spec": {
                "pattern": generate_validation_pattern(error),
                "location": infer_validation_location(error),
                "testRequirements": generate_validation_tests(error)
            }
        })

    return mutations

def extract_location(error) -> str:
    """Extract location from error stack trace"""
    if error.stack_trace:
        # Extract first stack frame location
        import re
        match = re.search(r'at\s+(.+?):(\d+):(\d+)', error.stack_trace)
        if match:
            return f"{match[1]}:{match[2]}"
    return "unknown"

def generate_validation_pattern(error) -> str:
    """Generate validation pattern for error type"""
    return f"""
// Validation to prevent {error.category} errors
export function validate{error.category.title()}(input: any): ValidationResult {{
  // Add specific validation logic
  return {{ valid: true, data: input }};
}}
"""

def infer_validation_location(error) -> str:
    """Infer best location for validation code"""
    # This would analyze codebase structure
    return "src/middleware/validation.ts"

def generate_validation_tests(error) -> List[str]:
    """Generate test requirements for validation"""
    return [
        f"Test validation prevents {error.title}",
        "Test validation with valid inputs",
        "Test validation with invalid inputs"
    ]

def estimate_mutation_duration(mutations: List[Dict[str, Any]]) -> int:
    """Estimate time to apply mutations in seconds"""
    base_time = 300  # 5 minutes base
    per_mutation_time = 120  # 2 minutes per mutation
    return base_time + (len(mutations) * per_mutation_time)
```

## 📊 Data Synchronization

### Lattice-BugSage Sync Service
```python
# lattice_bridge/sync.py
import asyncio
from typing import Dict, Any, List
from datetime import datetime, timedelta

from services.error_service import ErrorService
from services.fix_service import FixService
from integrations.lattice import LatticeClient
from utils.logger import get_logger

logger = get_logger(__name__)

class LatticeSyncService:
    """Service for synchronizing data between BugSage and Project Lattice"""

    def __init__(self):
        self.lattice_client = LatticeClient()
        self.sync_interval = 300  # 5 minutes

    async def start_sync_service(self):
        """Start the synchronization service"""
        logger.info("Starting Lattice-BugSage sync service")

        while True:
            try:
                await self.perform_sync()
                await asyncio.sleep(self.sync_interval)
            except Exception as e:
                logger.error(f"Sync failed: {e}")
                await asyncio.sleep(60)  # Wait 1 minute before retry

    async def perform_sync(self):
        """Perform full synchronization"""
        logger.info("Starting sync cycle")

        # Sync error status
        await self.sync_error_status()

        # Sync fix applications
        await self.sync_fix_status()

        # Sync spec updates
        await self.sync_spec_updates()

        logger.info("Sync cycle completed")

    async def sync_error_status(self):
        """Synchronize error status with Lattice"""
        try:
            # Get recent errors
            recent_errors = await self.get_recent_errors(hours=1)

            for error in recent_errors:
                # Update Lattice with error status
                await self.lattice_client.update_error_status(
                    error_id=error.uuid,
                    status=error.status,
                    updated_at=error.updated_at
                )

                # Send notifications for status changes
                if self.has_status_change(error):
                    await self.send_status_notification(error)

        except Exception as e:
            logger.error(f"Error status sync failed: {e}")

    async def sync_fix_status(self):
        """Synchronize fix status with Lattice"""
        try:
            # Get recent fixes
            recent_fixes = await self.get_recent_fixes(hours=1)

            for fix in recent_fixes:
                # Update Lattice with fix status
                await self.lattice_client.update_fix_status(
                    fix_id=fix.uuid,
                    status=fix.status,
                    applied_at=fix.applied_at,
                    confidence=fix.confidence_score
                )

                # Trigger Lattice workflow for applied fixes
                if fix.status == "applied":
                    await self.trigger_lattice_workflow(fix)

        except Exception as e:
            logger.error(f"Fix status sync failed: {e}")

    async def sync_spec_updates(self):
        """Synchronize specification updates"""
        try:
            # Get recent spec updates from BugSage
            recent_updates = await self.get_recent_spec_updates(hours=1)

            for update in recent_updates:
                # Update Lattice specifications
                await self.lattice_client.update_specification(
                    spec_id=update.spec_id,
                    mutations=update.mutations,
                    version=update.version,
                    created_at=update.created_at
                )

        except Exception as e:
            logger.error(f"Spec update sync failed: {e}")

    async def trigger_lattice_workflow(self, fix):
        """Trigger Lattice workflow for applied fix"""
        try:
            workflow_data = {
                "trigger": "fix_applied",
                "fixId": fix.uuid,
                "errorId": fix.error.uuid,
                "appliedAt": fix.applied_at.isoformat(),
                "confidence": fix.confidence_score
            }

            await self.lattice_client.trigger_workflow(
                workflow_name="bugsage-fix-monitoring",
                data=workflow_data
            )

            logger.info(f"Triggered Lattice workflow for fix {fix.uuid}")

        except Exception as e:
            logger.error(f"Failed to trigger Lattice workflow: {e}")

    def has_status_change(self, error) -> bool:
        """Check if error has recent status change"""
        if error.updated_at:
            time_diff = datetime.utcnow() - error.updated_at
            return time_diff.total_seconds() < 3600  # Within last hour
        return False

    async def send_status_notification(self, error):
        """Send notification for error status change"""
        notification = {
            "type": "error_status_change",
            "errorId": error.uuid,
            "oldStatus": error.metadata.get("previous_status"),
            "newStatus": error.status,
            "timestamp": datetime.utcnow().isoformat()
        }

        # Send through notification service
        await self.lattice_client.send_notification(notification)
```

## 🔄 Event-Driven Integration

### Event Handlers
```typescript
// lattice-events/event-handlers.ts
import { EventHandler, EventContext } from '@lattice/sdk/events';
import { BugSageEventService } from '../services/bugsage-events';

export class ErrorEventHandler implements EventHandler {
  constructor(private bugsageService: BugSageEventService) {}

  async handle(event: ErrorEvent, context: EventContext): Promise<void> {
    switch (event.type) {
      case 'error.detected':
        await this.handleErrorDetected(event, context);
        break;
      case 'error.resolved':
        await this.handleErrorResolved(event, context);
        break;
      case 'fix.generated':
        await this.handleFixGenerated(event, context);
        break;
      case 'fix.applied':
        await this.handleFixApplied(event, context);
        break;
      default:
        context.log.warn(`Unknown event type: ${event.type}`);
    }
  }

  private async handleErrorDetected(event: ErrorEvent, context: EventContext): Promise<void> {
    // Trigger BugSage analysis
    await this.bugsageService.triggerAnalysis({
      errorId: event.error.id,
      source: event.source,
      priority: this.calculatePriority(event.error),
      context: event.context
    });

    // Create Lattice task
    await this.createAnalysisTask(event, context);

    context.log.info(`Triggered BugSage analysis for error ${event.error.id}`);
  }

  private async handleErrorResolved(event: ErrorEvent, context: EventContext): Promise<void> {
    // Update BugSage status
    await this.bugsageService.updateErrorStatus(
      event.error.id,
      'resolved',
      event.resolution
    );

    // Trigger spec evolution
    await this.triggerSpecEvolution(event, context);

    context.log.info(`Marked error ${event.error.id} as resolved`);
  }

  private async handleFixGenerated(event: FixEvent, context: EventContext): Promise<void> {
    // Validate fix with BugSage
    const validation = await this.bugsageService.validateFix(event.fix.id);

    if (validation.passed) {
      // Create Lattice task for fix application
      await this.createFixApplicationTask(event, context);
    } else {
      // Request human review
      await this.requestHumanReview(event, validation, context);
    }

    context.log.info(`Generated fix ${event.fix.id} validation: ${validation.passed ? 'PASSED' : 'FAILED'}`);
  }

  private async handleFixApplied(event: FixEvent, context: EventContext): Promise<void> {
    // Monitor fix effectiveness
    await this.bugsageService.startFixMonitoring({
      fixId: event.fix.id,
      errorId: event.error.id,
      appliedAt: event.appliedAt
    });

    // Update specifications
    await this.updateSpecifications(event, context);

    context.log.info(`Applied fix ${event.fix.id}, started monitoring`);
  }

  private calculatePriority(error: ErrorInfo): 'low' | 'medium' | 'high' | 'critical' {
    if (error.severity === 'critical' || error.affectedUsers > 100) {
      return 'critical';
    }
    if (error.severity === 'high' || error.affectedUsers > 10) {
      return 'high';
    }
    if (error.severity === 'medium') {
      return 'medium';
    }
    return 'low';
  }

  private async createAnalysisTask(event: ErrorEvent, context: EventContext): Promise<void> {
    const task = {
      name: 'bugsage-error-analysis',
      inputs: {
        errorEvent: event
      },
      priority: this.calculatePriority(event.error),
      timeout: 600000, // 10 minutes
      metadata: {
        source: 'error-detected-event',
        errorId: event.error.id,
        timestamp: event.timestamp
      }
    };

    await context.taskClient.createTask(task);
  }

  private async createFixApplicationTask(event: FixEvent, context: EventContext): Promise<void> {
    const task = {
      name: 'bugsage-fix-application',
      inputs: {
        fixEvent: event
      },
      priority: 'medium',
      timeout: 1800000, // 30 minutes
      requiresApproval: event.fix.riskScore > 0.7,
      metadata: {
        source: 'fix-generated-event',
        fixId: event.fix.id,
        errorId: event.error.id
      }
    };

    await context.taskClient.createTask(task);
  }

  private async requestHumanReview(event: FixEvent, validation: any, context: EventContext): Promise<void> {
    const reviewRequest = {
      type: 'fix-review',
      fixId: event.fix.id,
      errorId: event.error.id,
      validation: validation,
      priority: 'high',
      assignedTo: ['tech-lead', 'senior-developer'],
      metadata: {
        source: 'bugsage-validation-failed',
        timestamp: new Date().toISOString()
      }
    };

    await context.reviewService.createRequest(reviewRequest);
  }

  private async triggerSpecEvolution(event: ErrorEvent, context: EventContext): Promise<void> {
    const evolutionTask = {
      name: 'bugsage-spec-evolution',
      inputs: {
        resolvedError: event.error,
        resolution: event.resolution
      },
      priority: 'low',
      async: true,
      metadata: {
        source: 'error-resolved-event',
        errorId: event.error.id
      }
    };

    await context.taskClient.createTask(evolutionTask);
  }

  private async updateSpecifications(event: FixEvent, context: EventContext): Promise<void> {
    // Extract patterns from applied fix
    const patterns = await this.extractFixPatterns(event.fix);

    // Update relevant specifications
    for (const pattern of patterns) {
      await context.specService.updatePattern({
        patternId: pattern.id,
        implementation: pattern.implementation,
        testRequirements: pattern.tests,
        source: 'bugsage-fix-applied'
      });
    }
  }

  private async extractFixPatterns(fix: FixInfo): Promise<FixPattern[]> {
    // Extract reusable patterns from applied fix
    return [
      {
        id: `error-handling-${fix.category}`,
        type: 'error_handling',
        implementation: fix.codeChanges,
        tests: fix.testSuggestions,
        description: `Error handling pattern for ${fix.category} errors`
      }
    ];
  }
}
```

## 📈 Monitoring & Analytics

### Integration Metrics
```python
# lattice_bridge/metrics.py
from dataclasses import dataclass
from typing import Dict, Any, List
from datetime import datetime, timedelta

@dataclass
class LatticeIntegrationMetrics:
    """Metrics for BugSage-Lattice integration"""

    # Error processing metrics
    errors_processed: int = 0
    analysis_success_rate: float = 0.0
    average_analysis_time: float = 0.0

    # Fix generation metrics
    fixes_generated: int = 0
    fixes_applied: int = 0
    fix_success_rate: float = 0.0

    # Spec evolution metrics
    specs_evolved: int = 0
    mutations_applied: int = 0
    evolution_success_rate: float = 0.0

    # Workflow metrics
    workflows_triggered: int = 0
    workflow_completion_rate: float = 0.0
    average_workflow_time: float = 0.0

    # System health metrics
    api_response_time: float = 0.0
    error_rate: float = 0.0
    uptime_percentage: float = 100.0

class LatticeMetricsCollector:
    """Collect and track integration metrics"""

    def __init__(self):
        self.metrics = LatticeIntegrationMetrics()
        self.start_time = datetime.utcnow()

    async def collect_metrics(self) -> LatticeIntegrationMetrics:
        """Collect current metrics"""
        # Collect from various sources
        self.metrics.errors_processed = await self.get_error_count()
        self.metrics.fixes_generated = await self.get_fix_count()
        self.metrics.workflows_triggered = await self.get_workflow_count()

        # Calculate rates and averages
        self.metrics.analysis_success_rate = await self.calculate_success_rate()
        self.metrics.fix_success_rate = await self.calculate_fix_success_rate()
        self.metrics.average_analysis_time = await self.get_average_analysis_time()

        # Health metrics
        self.metrics.api_response_time = await self.get_api_response_time()
        self.metrics.error_rate = await self.get_error_rate()
        self.metrics.uptime_percentage = self.calculate_uptime()

        return self.metrics

    async def get_error_count(self) -> int:
        """Get total errors processed"""
        # Query database or metrics service
        return 1000  # Placeholder

    async def get_fix_count(self) -> int:
        """Get total fixes generated"""
        return 250  # Placeholder

    async def get_workflow_count(self) -> int:
        """Get total workflows triggered"""
        return 150  # Placeholder

    async def calculate_success_rate(self) -> float:
        """Calculate analysis success rate"""
        # (successful_analyses / total_analyses) * 100
        return 95.0  # Placeholder

    async def calculate_fix_success_rate(self) -> float:
        """Calculate fix success rate"""
        # (successful_fixes / total_fixes) * 100
        return 88.0  # Placeholder

    async def get_average_analysis_time(self) -> float:
        """Get average analysis time in seconds"""
        return 45.0  # Placeholder

    async def get_api_response_time(self) -> float:
        """Get API response time in milliseconds"""
        return 150.0  # Placeholder

    async def get_error_rate(self) -> float:
        """Get error rate as percentage"""
        return 2.5  # Placeholder

    def calculate_uptime(self) -> float:
        """Calculate uptime percentage"""
        uptime = datetime.utcnow() - self.start_time
        total_time = datetime.utcnow() - self.start_time

        # For now, return 100% (would calculate from downtime events)
        return 100.0

# Health check endpoint
@router.get("/health", response_model=Dict[str, Any])
async def lattice_integration_health():
    """Health check for Lattice integration"""
    metrics_collector = LatticeMetricsCollector()
    metrics = await metrics_collector.collect_metrics()

    # Determine health status
    health_status = "healthy"
    if metrics.error_rate > 5.0:
        health_status = "degraded"
    if metrics.error_rate > 10.0 or metrics.uptime_percentage < 95.0:
        health_status = "unhealthy"

    return {
        "status": health_status,
        "metrics": {
            "errors_processed": metrics.errors_processed,
            "fixes_generated": metrics.fixes_generated,
            "workflows_triggered": metrics.workflows_triggered,
            "analysis_success_rate": metrics.analysis_success_rate,
            "fix_success_rate": metrics.fix_success_rate,
            "api_response_time": metrics.api_response_time,
            "error_rate": metrics.error_rate,
            "uptime_percentage": metrics.uptime_percentage
        },
        "timestamp": datetime.utcnow().isoformat()
    }
```

This comprehensive integration between BugSage and Project Lattice creates a powerful autonomous development ecosystem where production errors automatically drive system improvements through AI-powered analysis, fix generation, and spec evolution. The integration is designed to be reliable, scalable, and maintainable with proper error handling, monitoring, and fallback mechanisms.