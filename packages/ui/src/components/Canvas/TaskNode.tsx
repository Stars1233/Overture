import { memo, useState, useRef } from 'react';
import { Handle, Position } from '@xyflow/react';
import { motion } from 'framer-motion';
import type { PlanNode, NodeStatus } from '@/stores/plan-store';
import { CheckCircle2, Circle, Loader2, XCircle, SkipForward, Plus, Minus, GitBranch, type LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';

interface BranchTarget {
  id: string;
  title: string;
  description?: string;
}

interface TaskNodeData extends PlanNode {
  isDisabledBranch?: boolean;
  isUnexecuted?: boolean;
  isExecuting?: boolean;
  isCompleted?: boolean;
  isNextToExecute?: boolean;
  canModify?: boolean;
  canInsertAfter?: boolean;
  canInsertBefore?: boolean;
  canRemove?: boolean;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  canShowContextMenu?: boolean;
  planId?: string;
  onInsertNode?: (afterNodeId: string) => void;
  onRemoveNode?: (nodeId: string) => void;
  onContextMenu?: (event: React.MouseEvent, nodeId: string, planId: string) => void;
  // Branch point info
  isBranchPoint?: boolean;
  branchTargetIds?: string[];
  branchTargets?: BranchTarget[];
  onSelectBranch?: (nodeId: string, targetId: string) => void;
}

interface TaskNodeProps {
  data: TaskNodeData;
  selected?: boolean;
}

const statusIcons: Record<NodeStatus, LucideIcon> = {
  pending: Circle,
  active: Loader2,
  completed: CheckCircle2,
  failed: XCircle,
  skipped: SkipForward,
};

const complexityColors: Record<string, string> = {
  low: 'bg-accent-green/10 text-accent-green',
  medium: 'bg-accent-yellow/10 text-accent-yellow',
  high: 'bg-accent-red/10 text-accent-red',
};

export const TaskNode = memo(function TaskNode({ data, selected }: TaskNodeProps) {
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const StatusIcon = statusIcons[data.status];
  const isDisabled = data.isDisabledBranch;
  const isUnexecuted = data.isUnexecuted;
  const canModify = data.canModify && !isDisabled;

  const handleContextMenu = (event: React.MouseEvent) => {
    // ALWAYS prevent the browser's default context menu
    event.preventDefault();
    event.stopPropagation();

    // Only show our custom context menu if conditions are met
    if (data.canShowContextMenu && data.onContextMenu && data.planId) {
      data.onContextMenu(event, data.id, data.planId);
    }
  };

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    // Delay hiding to allow clicking on buttons
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 300);
  };

  const isActive = data.status === 'active' && !isDisabled;
  const isNextToExecute = data.isNextToExecute && !isDisabled;

  // Determine pulsing animation based on state
  const getBoxShadow = () => {
    if (isActive) {
      // Yellow pulse for active
      return [
        '0 0 0 0 rgba(234, 179, 8, 0.4), 0 0 20px 5px rgba(234, 179, 8, 0.3)',
        '0 0 0 0 rgba(234, 179, 8, 0.7), 0 0 30px 10px rgba(234, 179, 8, 0.5)',
        '0 0 0 0 rgba(234, 179, 8, 0.4), 0 0 20px 5px rgba(234, 179, 8, 0.3)',
      ];
    }
    if (isNextToExecute) {
      // Blue pulse for next to execute
      return [
        '0 0 0 0 rgba(59, 130, 246, 0.3), 0 0 15px 3px rgba(59, 130, 246, 0.2)',
        '0 0 0 0 rgba(59, 130, 246, 0.6), 0 0 25px 8px rgba(59, 130, 246, 0.4)',
        '0 0 0 0 rgba(59, 130, 246, 0.3), 0 0 15px 3px rgba(59, 130, 246, 0.2)',
      ];
    }
    return '0 0 0 0 rgba(0, 0, 0, 0)';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{
        opacity: isDisabled ? 0.35 : isUnexecuted ? 0.5 : 1,
        scale: isDisabled ? 0.95 : 1,
        y: 0,
        filter: isDisabled ? 'grayscale(0.8)' : isUnexecuted ? 'grayscale(0.5)' : 'grayscale(0)',
        boxShadow: getBoxShadow(),
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 25,
        boxShadow: (isActive || isNextToExecute)
          ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
          : { duration: 0.3 },
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onContextMenu={handleContextMenu}
      className={clsx(
        'px-4 py-3 rounded-xl min-w-[200px] max-w-[280px] relative overflow-visible',
        'bg-surface/80 backdrop-blur-sm',
        'border-2 transition-colors duration-200',
        {
          'border-border hover:border-border-subtle': data.status === 'pending' && !isDisabled && !isUnexecuted && !isNextToExecute,
          'border-accent-blue': isNextToExecute && !isDisabled,
          'border-status-active': data.status === 'active' && !isDisabled,
          'border-status-completed shadow-glow-green': data.status === 'completed' && !isDisabled,
          'border-status-failed shadow-glow-red': data.status === 'failed' && !isDisabled,
          'border-border opacity-50': data.status === 'skipped' || isDisabled,
          'border-border/50': isUnexecuted && !isNextToExecute,
          'ring-2 ring-accent-blue ring-offset-2 ring-offset-canvas': selected && !isDisabled,
          'pointer-events-none': isDisabled,
        }
      )}
    >
      {/* Remove button - right side of top edge */}
      {isHovered && canModify && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            data.onRemoveNode?.(data.id);
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="absolute -top-5 left-[calc(50%+16px)] z-50 text-white/60 hover:text-white hover:scale-110 transition-all"
          title="Remove node"
        >
          <Minus className="w-5 h-5" />
        </button>
      )}

      {/* Insert button - right side of bottom edge */}
      {isHovered && canModify && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            data.onInsertNode?.(data.id);
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="absolute -bottom-8 left-[calc(50%+16px)] z-50 text-white/60 hover:text-white hover:scale-110 transition-all"
          title="Insert node after"
        >
          <Plus className="w-5 h-5" />
        </button>
      )}
      {/* Top handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-border !border-2 !border-surface"
      />

      {/* Header */}
      <div className="flex items-start gap-3">
        <div
          className={clsx('mt-0.5', {
            'text-text-muted': data.status === 'pending' || data.status === 'skipped',
            'text-status-active': data.status === 'active',
            'text-status-completed': data.status === 'completed',
            'text-status-failed': data.status === 'failed',
          })}
        >
          {data.status === 'active' ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <StatusIcon className="w-4 h-4" />
            </motion.div>
          ) : (
            <StatusIcon className="w-4 h-4" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm text-text-primary truncate">
            {data.title}
          </h3>

          {data.description && (
            <p className="text-xs text-text-muted mt-1 line-clamp-2">
              {data.description}
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border">
        {data.complexity && (
          <span
            className={clsx(
              'text-[10px] font-medium px-1.5 py-0.5 rounded',
              complexityColors[data.complexity]
            )}
          >
            {data.complexity}
          </span>
        )}

        {data.dynamicFields && data.dynamicFields.length > 0 && (
          <span className="text-[10px] text-text-muted">
            {data.dynamicFields.filter((f) => f.required && !f.value).length > 0
              ? `${data.dynamicFields.filter((f) => f.required && !f.value).length} fields required`
              : `${data.dynamicFields.length} fields`}
          </span>
        )}

        {/* Branch point indicator */}
        {data.isBranchPoint && data.branchTargets && data.branchTargets.length > 1 && (
          <div className="flex items-center gap-1 ml-auto">
            <GitBranch className="w-3 h-3 text-accent-purple" />
            <span className="text-[10px] text-accent-purple font-medium">
              {data.branchTargets.length} paths
            </span>
          </div>
        )}
      </div>

      {/* Branch selection hint - actual selection happens in sidebar */}
      {data.isBranchPoint && data.branchTargets && data.branchTargets.length > 1 && !data.selectedBranchId && (
        <div className="mt-2 pt-2 border-t border-border">
          <span className="text-[10px] text-accent-yellow">
            Click to select a path
          </span>
        </div>
      )}

      {/* Bottom handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-border !border-2 !border-surface"
      />
    </motion.div>
  );
});
