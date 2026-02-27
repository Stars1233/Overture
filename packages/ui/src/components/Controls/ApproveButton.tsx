import { motion } from 'framer-motion';
import { Play, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { usePlanStore } from '@/stores/plan-store';
import { useMultiProjectStore } from '@/stores/multi-project-store';
import { useWebSocket } from '@/hooks/useWebSocket';
import { clsx } from 'clsx';

export function ApproveButton() {
  const { plans, canApprove } = usePlanStore();
  const { activeTabId } = useMultiProjectStore();
  const { approvePlan } = useWebSocket();

  // Find the most recent plan that's in 'ready' status
  const readyPlan = [...plans].reverse().find(p => p.plan.status === 'ready');
  const plan = readyPlan?.plan || (plans.length > 0 ? plans[plans.length - 1].plan : null);

  const isReady = plan?.status === 'ready';
  const isApproved = plan?.status === 'approved';
  const isExecuting = plan?.status === 'executing';
  const isCompleted = plan?.status === 'completed';
  const isFailed = plan?.status === 'failed';

  // Check validation for the ready plan
  const canApproveNow = readyPlan ? canApprove(readyPlan.plan.id) : false;

  const handleApprove = () => {
    // Debug - this should ALWAYS show
    console.log('[Overture] BUTTON CLICKED - canApproveNow:', canApproveNow, 'readyPlan:', !!readyPlan);

    if (canApproveNow && readyPlan) {
      console.log('[Overture] Calling approvePlan with:', activeTabId);
      approvePlan(activeTabId || undefined);
    } else {
      console.log('[Overture] NOT calling approvePlan - conditions not met');
    }
  };

  // Don't show during streaming, executing, or paused (ExecutionControls handles those)
  if (!plan || plan.status === 'streaming' || plan.status === 'executing' || plan.status === 'paused') {
    return null;
  }

  return (
    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-2"
      >
        {/* Main button */}
        <motion.button
          whileHover={{ scale: canApproveNow ? 1.02 : 1 }}
          whileTap={{ scale: canApproveNow ? 0.98 : 1 }}
          onClick={handleApprove}
          disabled={!canApproveNow || isApproved || isExecuting || isCompleted}
          className={clsx(
            'flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm',
            'transition-all duration-200 shadow-lg',
            {
              // Ready and can approve
              'bg-gradient-to-r from-accent-green to-emerald-500 text-white shadow-glow-green hover:shadow-lg':
                isReady && canApproveNow,
              // Ready but cannot approve
              'bg-surface border border-border text-text-muted cursor-not-allowed':
                isReady && !canApproveNow,
              // Approved / Executing
              'bg-accent-blue/20 text-accent-blue cursor-wait':
                isApproved || isExecuting,
              // Completed
              'bg-accent-green/20 text-accent-green cursor-default': isCompleted,
              // Failed
              'bg-accent-red/20 text-accent-red cursor-default': isFailed,
            }
          )}
        >
          {isReady && canApproveNow && (
            <>
              <Play className="w-4 h-4" />
              Approve & Execute
            </>
          )}
          {isReady && !canApproveNow && (
            <>
              <AlertCircle className="w-4 h-4" />
              Complete Requirements
            </>
          )}
          {(isApproved || isExecuting) && (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Executing...
            </>
          )}
          {isCompleted && (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Completed
            </>
          )}
          {isFailed && (
            <>
              <AlertCircle className="w-4 h-4" />
              Failed
            </>
          )}
        </motion.button>

        {/* Hint */}
        {isReady && canApproveNow && (
          <span className="text-xs text-text-muted">
            Press <kbd className="px-1 py-0.5 bg-surface rounded font-mono">Enter</kbd> to approve
          </span>
        )}

        {/* Hint for incomplete requirements */}
        {isReady && !canApproveNow && (
          <span className="text-xs text-text-muted">
            See requirements checklist on the left
          </span>
        )}
      </motion.div>
    </div>
  );
}
