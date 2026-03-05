import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, GitBranch, FormInput, ChevronRight } from 'lucide-react';
import { usePlanStore } from '@/stores/plan-store';
import { clsx } from 'clsx';

interface RequirementItem {
  id: string;
  nodeId: string;
  nodeTitle: string;
  planId: string;
  type: 'field' | 'branch';
  label: string;
  description?: string;
  isComplete: boolean;
  isOptional?: boolean;
  value?: string;
}

export function RequirementsChecklist() {
  const { plans, setSelectedNodeId, selectedNodeId } = usePlanStore();

  // DEBUG: Log at the very start - BUILD ID: 20260226-v2
  console.log('[RequirementsChecklist BUILD-v2] Component rendered, plans count:', plans.length);
  if (plans.length > 0) {
    console.log('[RequirementsChecklist BUILD-v2] Plan statuses:', plans.map(p => `${p.plan.id}: ${p.plan.status}`));
  }

  // Find the most recent plan that's in 'ready' status
  const readyPlan = [...plans].reverse().find(p => p.plan.status === 'ready');

  // Only show when there's a ready plan
  if (!readyPlan) {
    return null;
  }

  const { plan, nodes, edges } = readyPlan;

  // DEBUG: Log immediately after finding ready plan
  console.log('[RequirementsChecklist] READY PLAN FOUND:', plan.id);
  console.log('[RequirementsChecklist] Nodes count:', nodes?.length, 'Edges count:', edges?.length);
  console.log('[RequirementsChecklist] Nodes:', nodes?.map(n => `${n.id}:${n.title}(fields:${n.dynamicFields?.length || 0})`));

  console.log('[RequirementsChecklist] Plan:', plan.id, 'Nodes:', nodes.length, 'Edges:', edges.length);
  console.log('[RequirementsChecklist] All nodes:', nodes.map(n => `${n.id}: ${n.title}`));
  console.log('[RequirementsChecklist] All edges:', edges.map(e => `${e.from} -> ${e.to}`));

  // Only filter out explicit type="decision" nodes (legacy)
  const decisionNodeIds = new Set(nodes.filter(n => n.type === 'decision').map(n => n.id));
  const visibleNodes = nodes.filter(n => n.type !== 'decision');

  // Build outgoing edges map directly from edges (skip decision node edges)
  const outgoingEdgesMap: Record<string, string[]> = {};
  for (const edge of edges) {
    if (decisionNodeIds.has(edge.from) || decisionNodeIds.has(edge.to)) continue;
    if (!outgoingEdgesMap[edge.from]) {
      outgoingEdgesMap[edge.from] = [];
    }
    if (!outgoingEdgesMap[edge.from].includes(edge.to)) {
      outgoingEdgesMap[edge.from].push(edge.to);
    }
  }

  console.log('[RequirementsChecklist] Outgoing edges map:', JSON.stringify(outgoingEdgesMap));

  // Find all branch points and their selections
  // branchPointSelections: { branchPointNodeId: selectedTargetNodeId }
  const branchPointSelections: Record<string, string | undefined> = {};
  const branchTargetToSource: Record<string, string> = {}; // targetNodeId -> branchPointNodeId

  for (const [nodeId, targets] of Object.entries(outgoingEdgesMap)) {
    if (targets.length > 1) {
      const node = visibleNodes.find(n => n.id === nodeId);
      branchPointSelections[nodeId] = node?.selectedBranchId;
      // Mark each target as belonging to this branch point
      for (const targetId of targets) {
        branchTargetToSource[targetId] = nodeId;
      }
    }
  }

  // Determine which nodes are disabled (unselected branch siblings)
  const disabledNodeIds = new Set<string>();
  for (const [branchPointId, selectedTargetId] of Object.entries(branchPointSelections)) {
    if (selectedTargetId) {
      // A selection was made - disable all OTHER targets
      const allTargets = outgoingEdgesMap[branchPointId] || [];
      for (const targetId of allTargets) {
        if (targetId !== selectedTargetId) {
          disabledNodeIds.add(targetId);
        }
      }
    }
  }

  console.log('[RequirementsChecklist] Branch points found:', Object.keys(branchPointSelections));
  console.log('[RequirementsChecklist] Branch selections:', JSON.stringify(branchPointSelections));
  console.log('[RequirementsChecklist] Disabled nodes:', Array.from(disabledNodeIds));
  console.log('[RequirementsChecklist] Visible nodes count:', visibleNodes.length);

  // Collect all requirements from ALL nodes (excluding disabled branch siblings)
  const requirements: RequirementItem[] = [];

  for (const node of visibleNodes) {
    // Skip disabled nodes (unselected branch paths)
    if (disabledNodeIds.has(node.id)) {
      continue;
    }

    // ALL fields - required or not
    const dynamicFields = node.dynamicFields || [];
    for (const field of dynamicFields) {
      const isRequired = field.required === true;
      const hasValue = !!field.value;

      requirements.push({
        id: `${node.id}-field-${field.id}`,
        nodeId: node.id,
        nodeTitle: node.title,
        planId: plan.id,
        type: 'field',
        label: field.title,
        description: field.description,
        // Required fields: complete when has value
        // Optional fields: complete when has value (but not required)
        isComplete: hasValue,
        isOptional: !isRequired,
        value: field.value,
      });
    }

    // Branch points (detected from graph structure - nodes with multiple outgoing edges)
    const outgoingTargets = outgoingEdgesMap[node.id] || [];
    if (outgoingTargets.length > 1) {
      requirements.push({
        id: `${node.id}-branch`,
        nodeId: node.id,
        nodeTitle: node.title,
        planId: plan.id,
        type: 'branch',
        label: `Branch: ${node.title}`,
        description: `Choose from ${outgoingTargets.length} paths`,
        isComplete: !!node.selectedBranchId,
      });
    }
  }

  console.log('[RequirementsChecklist] Total requirements found:', requirements.length);

  // If no requirements, don't show anything
  if (requirements.length === 0) {
    return null;
  }

  // Only required items (non-optional) count toward completion progress
  const requiredItems = requirements.filter(r => !r.isOptional);
  const completedRequiredCount = requiredItems.filter(r => r.isComplete).length;
  const totalRequiredCount = requiredItems.length;
  const allRequiredComplete = totalRequiredCount === 0 || completedRequiredCount === totalRequiredCount;
  const progress = totalRequiredCount > 0 ? (completedRequiredCount / totalRequiredCount) * 100 : 100;

  // For display, show all items completed vs total
  const completedCount = requirements.filter(r => r.isComplete).length;
  const totalCount = requirements.length;

  const handleItemClick = (nodeId: string, planId: string) => {
    setSelectedNodeId(nodeId, planId);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed left-4 top-1/2 -translate-y-1/2 z-20 w-72"
    >
      <div className="bg-surface/95 backdrop-blur-md border border-border rounded-xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-border bg-surface-raised/50">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-text-primary">
              Requirements
            </h3>
            <span className={clsx(
              'text-xs font-medium px-2 py-0.5 rounded-full',
              allRequiredComplete
                ? 'bg-accent-green/20 text-accent-green'
                : 'bg-accent-yellow/20 text-accent-yellow'
            )}>
              {completedCount}/{totalCount}
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-surface rounded-full overflow-hidden">
            <motion.div
              className={clsx(
                'h-full rounded-full',
                allRequiredComplete ? 'bg-accent-green' : 'bg-accent-blue'
              )}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Requirements list */}
        <div className="max-h-80 overflow-y-auto">
          <AnimatePresence mode="popLayout">
            {requirements.map((req, index) => (
              <motion.button
                key={req.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => handleItemClick(req.nodeId, req.planId)}
                className={clsx(
                  'w-full px-4 py-3 flex items-start gap-3 text-left',
                  'border-b border-border/50 last:border-b-0',
                  'hover:bg-surface-raised/50 transition-colors',
                  'focus:outline-none focus:bg-surface-raised/50',
                  selectedNodeId === req.nodeId && 'bg-accent-blue/10'
                )}
              >
                {/* Checkbox */}
                <div className="mt-0.5 flex-shrink-0">
                  {req.isComplete ? (
                    <CheckCircle2 className="w-4 h-4 text-accent-green" />
                  ) : req.isOptional ? (
                    <Circle className="w-4 h-4 text-text-muted/50" />
                  ) : (
                    <Circle className="w-4 h-4 text-accent-yellow" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {req.type === 'field' ? (
                      <FormInput className={clsx(
                        'w-3 h-3 flex-shrink-0',
                        req.isOptional ? 'text-text-muted' : 'text-accent-blue'
                      )} />
                    ) : (
                      <GitBranch className="w-3 h-3 text-accent-purple flex-shrink-0" />
                    )}
                    <span className={clsx(
                      'text-sm font-medium truncate',
                      req.isComplete
                        ? 'text-text-muted'
                        : req.isOptional
                          ? 'text-text-secondary'
                          : 'text-text-primary'
                    )}>
                      {req.label}
                    </span>
                    {req.isOptional && (
                      <span className="text-[10px] text-text-muted/70 flex-shrink-0">
                        (optional)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs text-text-muted truncate">
                      {req.nodeTitle}
                    </p>
                    {req.value && (
                      <span className="text-[10px] text-accent-green truncate max-w-[100px]">
                        {req.value}
                      </span>
                    )}
                  </div>
                </div>

                {/* Arrow indicator */}
                <ChevronRight className={clsx(
                  'w-4 h-4 flex-shrink-0 transition-colors',
                  selectedNodeId === req.nodeId
                    ? 'text-accent-blue'
                    : 'text-text-muted'
                )} />
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        {/* Footer hint */}
        {!allRequiredComplete && (
          <div className="px-4 py-2 border-t border-border bg-surface-raised/30">
            <p className="text-[10px] text-text-muted text-center">
              Click an item to open its details
            </p>
          </div>
        )}

        {/* All complete message */}
        {allRequiredComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-4 py-3 border-t border-border bg-accent-green/10"
          >
            <p className="text-xs text-accent-green text-center font-medium">
              All requirements complete! Ready to approve.
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
