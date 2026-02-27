import { useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  ConnectionMode,
  type Node,
  type Edge,
  type NodeTypes,
  type EdgeTypes,
} from '@xyflow/react';
import { usePlanStore, type PlanNode, type Plan, type PlanData, type PlanEdge } from '@/stores/plan-store';
import { useWebSocket } from '@/hooks/useWebSocket';
import { TaskNode } from './TaskNode';
import { DecisionNode } from './DecisionNode';
import { InsertableEdge } from './InsertableEdge';
import { useAutoLayout } from '@/hooks/useAutoLayout';
import { AnimatePresence, motion } from 'framer-motion';
import { User, Zap, CheckCircle, XCircle, Clock, Loader2, Pause, X } from 'lucide-react';

// Constants for Figma-style artboard layout
const PLAN_HORIZONTAL_GAP = 150; // Gap between plans
const PLAN_HEADER_HEIGHT = 50; // Height reserved for plan header

// Register custom node types - use any to bypass strict typing
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const nodeTypes: NodeTypes = {
  task: TaskNode,
  decision: DecisionNode,
} as any;

// Register custom edge types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const edgeTypes: EdgeTypes = {
  insertable: InsertableEdge,
} as any;

interface PlanHeaderProps {
  plan: Plan;
  completedCount: number;
  totalCount: number;
  onClose?: () => void;
}

function PlanHeader({ plan, completedCount, totalCount, onClose }: PlanHeaderProps) {
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const getStatusIcon = () => {
    switch (plan.status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-accent-green" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-accent-red" />;
      case 'executing':
        return <Loader2 className="w-4 h-4 text-accent-yellow animate-spin" />;
      case 'paused':
        return <Pause className="w-4 h-4 text-accent-orange" />;
      case 'streaming':
        return <Loader2 className="w-4 h-4 text-accent-blue animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-text-muted" />;
    }
  };

  const getStatusColor = () => {
    switch (plan.status) {
      case 'completed':
        return 'bg-accent-green/10 text-accent-green';
      case 'failed':
        return 'bg-accent-red/10 text-accent-red';
      case 'executing':
        return 'bg-accent-yellow/10 text-accent-yellow';
      case 'paused':
        return 'bg-accent-orange/10 text-accent-orange';
      case 'streaming':
        return 'bg-accent-blue/10 text-accent-blue';
      case 'ready':
        return 'bg-accent-blue/10 text-accent-blue';
      case 'approved':
        return 'bg-accent-purple/10 text-accent-purple';
      default:
        return 'bg-surface-raised text-text-muted';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 px-3 py-2 rounded-lg bg-surface/90 backdrop-blur-sm border border-border shadow-lg"
    >
      {getStatusIcon()}
      <div className="flex flex-col">
        <span className="text-sm font-medium text-text-primary">{plan.title}</span>
        <span className="text-xs text-text-muted flex items-center gap-1">
          <User className="w-3 h-3" />
          {plan.agent}
        </span>
      </div>

      {/* Progress indicator */}
      {totalCount > 0 && (
        <div className="flex items-center gap-2 pl-3 border-l border-border">
          <div className="flex flex-col items-end">
            <span className="text-xs text-text-muted">{completedCount}/{totalCount}</span>
            <span className="text-[10px] text-text-muted">{progress}%</span>
          </div>
          <div className="w-16 h-1.5 bg-surface-raised rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                plan.status === 'completed'
                  ? 'bg-accent-green'
                  : plan.status === 'failed'
                    ? 'bg-accent-red'
                    : 'bg-accent-blue'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Status badge */}
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor()}`}>
        {plan.status}
      </span>

      {/* Close button - only show if there are multiple plans */}
      {onClose && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="ml-1 p-1 rounded hover:bg-surface-raised transition-colors text-text-muted hover:text-text-primary"
          title="Remove plan from canvas"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </motion.div>
  );
}

// Helper to convert a single plan's nodes/edges to ReactFlow format
function convertPlanToReactFlow(
  planData: PlanData,
  xOffset: number,
  setPendingInsert: (afterNodeId: string | null) => void,
  removeNode: (nodeId: string) => void,
  layoutNodes: (nodes: Node[], edges: Edge[]) => Node[]
): { nodes: Node[]; edges: Edge[]; width: number } {
  const { plan, nodes: allPlanNodes, edges: allPlanEdges } = planData;

  // Only filter out explicit type="decision" nodes (legacy)
  // Branch nodes with "(branch)" in title ARE rendered - server handles skipping them during execution
  const decisionNodeIds = new Set(allPlanNodes.filter(n => n.type === 'decision').map(n => n.id));
  const planNodes = allPlanNodes.filter(n => n.type !== 'decision');
  const planEdges = allPlanEdges.filter(e => !decisionNodeIds.has(e.from) && !decisionNodeIds.has(e.to));

  const isExecuting = plan.status === 'executing';
  const isPaused = plan.status === 'paused';
  const isCompleted = plan.status === 'completed';
  const canModifyPlan = plan.status === 'ready' || plan.status === 'approved' || plan.status === 'streaming';

  // Build executed node IDs set
  const executedNodeIds = new Set<string>();
  const completedNodeIds = new Set<string>();
  let activeNodeId: string | null = null;
  planNodes.forEach(n => {
    if (n.status === 'completed' || n.status === 'active' || n.status === 'failed') {
      executedNodeIds.add(n.id);
    }
    if (n.status === 'completed') {
      completedNodeIds.add(n.id);
    }
    if (n.status === 'active') {
      activeNodeId = n.id;
    }
  });

  // Build branch selections map (now from branch points, not decision nodes)
  const branchSelections: Record<string, string | undefined> = {};
  planNodes.forEach((node: PlanNode) => {
    // Use selectedBranchId which now stores the selected target node ID for branch points
    if (node.selectedBranchId) {
      branchSelections[node.id] = node.selectedBranchId;
    }
  });

  // Detect branch points from graph structure (nodes with multiple outgoing edges)
  // IMPORTANT: This must be computed BEFORE the "next node to execute" logic
  const outgoingEdgesMap: Record<string, string[]> = {};
  planEdges.forEach((edge: PlanEdge) => {
    if (!outgoingEdgesMap[edge.from]) {
      outgoingEdgesMap[edge.from] = [];
    }
    outgoingEdgesMap[edge.from].push(edge.to);
  });

  // Mark branch points and their targets
  const branchPointInfo: Record<string, { isBranchPoint: boolean; branchTargetIds: string[] }> = {};
  const branchTargetInfo: Record<string, string> = {}; // targetId -> branchPointId

  for (const [nodeId, targets] of Object.entries(outgoingEdgesMap)) {
    if (targets.length > 1) {
      branchPointInfo[nodeId] = { isBranchPoint: true, branchTargetIds: targets };
      for (const targetId of targets) {
        branchTargetInfo[targetId] = nodeId;
      }
    }
  }

  // Find the "next" node to execute (first pending node connected to a completed node)
  // Only show if plan is approved/executing and there's no active node
  let nextNodeId: string | null = null;
  if ((plan.status === 'approved' || plan.status === 'executing' || plan.status === 'paused') && !activeNodeId) {
    for (const edge of planEdges) {
      if (completedNodeIds.has(edge.from)) {
        const targetNode = planNodes.find(n => n.id === edge.to);
        if (targetNode && targetNode.status === 'pending') {
          // Check if it's not a disabled branch using graph-computed info
          let isDisabled = false;

          // Check if this is a DIRECT branch target that wasn't selected
          const branchSourceFromGraph = branchTargetInfo[targetNode.id];
          if (branchSourceFromGraph) {
            const sourceNode = planNodes.find(n => n.id === branchSourceFromGraph);
            if (sourceNode?.selectedBranchId && sourceNode.selectedBranchId !== targetNode.id) {
              isDisabled = true;
            }
          }

          // Legacy check (only if not already handled)
          if (!isDisabled && !branchSourceFromGraph && targetNode.branchParent && targetNode.branchId) {
            const parentNode = planNodes.find(n => n.id === targetNode.branchParent);
            if (parentNode?.selectedBranchId && parentNode.selectedBranchId !== targetNode.branchId) {
              isDisabled = true;
            }
          }

          if (!isDisabled) {
            nextNodeId = targetNode.id;
            break;
          }
        }
      }
    }
    // If no next node found via edges, check if first node is pending (plan just started)
    if (!nextNodeId && planNodes.length > 0) {
      const firstNode = planNodes[0];
      if (firstNode.status === 'pending') {
        nextNodeId = firstNode.id;
      }
    }
  }

  // Build edge connection counts
  const outgoingEdgesCount: Record<string, number> = {};
  const incomingEdgesCount: Record<string, number> = {};
  planEdges.forEach((edge: PlanEdge) => {
    outgoingEdgesCount[edge.from] = (outgoingEdgesCount[edge.from] || 0) + 1;
    incomingEdgesCount[edge.to] = (incomingEdgesCount[edge.to] || 0) + 1;
  });

  // Convert nodes
  const rfNodes = planNodes.map((node: PlanNode) => {
    let isDisabledBranch = false;

    // ONLY check branchTargetInfo (computed from current graph structure)
    // This ensures we only disable DIRECT branch targets, not downstream nodes
    const branchSourceFromGraph = branchTargetInfo[node.id];
    if (branchSourceFromGraph) {
      const selectedTargetId = branchSelections[branchSourceFromGraph];
      if (selectedTargetId && selectedTargetId !== node.id) {
        isDisabledBranch = true;
      }
    }

    // Legacy support: check branchParent/branchId (but ONLY if not already handled)
    if (!isDisabledBranch && !branchSourceFromGraph && node.branchParent && node.branchId) {
      const selectedBranch = branchSelections[node.branchParent];
      if (selectedBranch && selectedBranch !== node.branchId) {
        isDisabledBranch = true;
      }
    }

    const isUnexecuted = isExecuting && !executedNodeIds.has(node.id) && !isDisabledBranch;
    const hasMultipleOutgoing = (outgoingEdgesCount[node.id] || 0) > 1;
    const hasMultipleIncoming = (incomingEdgesCount[node.id] || 0) > 1;
    const canInsertAfter = canModifyPlan && !hasMultipleOutgoing;
    const canRemove = canModifyPlan && !hasMultipleOutgoing && !hasMultipleIncoming;

    // Get branch point info for this node
    const branchInfo = branchPointInfo[node.id];
    const isBranchPoint = node.isBranchPoint || branchInfo?.isBranchPoint || false;
    const branchTargetIds = node.branchTargetIds || branchInfo?.branchTargetIds || [];

    return {
      id: `${plan.id}:${node.id}`, // Prefix with plan ID to make unique across plans
      type: 'task', // Always render as task - decision nodes are filtered out
      position: { x: 0, y: 0 },
      data: {
        ...node,
        planId: plan.id, // Add plan ID to data
        isDisabledBranch,
        isUnexecuted,
        isExecuting: isExecuting || isPaused,
        isCompleted,
        isNextToExecute: node.id === nextNodeId, // Mark the next node to execute
        canModify: canModifyPlan,
        canInsertAfter,
        canRemove,
        onInsertNode: setPendingInsert,
        onRemoveNode: removeNode,
        // Branch point info
        isBranchPoint,
        branchTargetIds,
        branchSourceId: branchSourceFromGraph || node.branchSourceId,
        // Pass target node titles for branch selection UI
        branchTargets: isBranchPoint ? branchTargetIds.map(targetId => {
          const targetNode = planNodes.find(n => n.id === targetId);
          return targetNode ? { id: targetId, title: targetNode.title, description: targetNode.description } : null;
        }).filter(Boolean) : [],
        // Branch selection callback - needed for TaskNode branch UI
        onSelectBranch: (nodeId: string, targetId: string) => {
          // Import setSelectedBranch from store - this needs to be passed from parent
          // For now, we'll emit an event that PlanCanvas can handle
          const event = new CustomEvent('selectBranch', {
            detail: { nodeId, targetId, planId: plan.id }
          });
          window.dispatchEvent(event);
        },
      },
    };
  });

  // Convert edges
  const rfEdges = planEdges.map((edge: PlanEdge) => {
    const sourceNode = planNodes.find((n: PlanNode) => n.id === edge.from);
    const targetNode = planNodes.find((n: PlanNode) => n.id === edge.to);

    let isDisabledEdge = false;

    // ONLY check branchTargetInfo (computed from current graph structure)
    // This ensures we only disable edges to DIRECT branch targets, not downstream nodes
    const targetBranchSourceFromGraph = branchTargetInfo[edge.to];
    if (targetBranchSourceFromGraph) {
      const selectedTargetId = branchSelections[targetBranchSourceFromGraph];
      if (selectedTargetId && selectedTargetId !== edge.to) {
        isDisabledEdge = true;
      }
    }

    // Legacy support (but ONLY if not already handled)
    if (!isDisabledEdge && !targetBranchSourceFromGraph && targetNode?.branchParent && targetNode?.branchId) {
      const selectedBranch = branchSelections[targetNode.branchParent];
      if (selectedBranch && selectedBranch !== targetNode.branchId) {
        isDisabledEdge = true;
      }
    }

    const isActiveEdge = targetNode?.status === 'active';
    const isExecutedEdge = sourceNode && executedNodeIds.has(sourceNode.id) &&
                           targetNode && executedNodeIds.has(targetNode.id);
    const isUnexecutedEdge = isExecuting && !isExecutedEdge && !isDisabledEdge;

    let strokeColor = '#3f3f46';
    if (isDisabledEdge) {
      strokeColor = '#27272a';
    } else if (isActiveEdge) {
      strokeColor = '#eab308';
    } else if (isExecutedEdge) {
      strokeColor = '#22c55e';
    } else if (isUnexecutedEdge) {
      strokeColor = '#27272a';
    }

    return {
      id: `${plan.id}:${edge.id}`,
      source: `${plan.id}:${edge.from}`,
      target: `${plan.id}:${edge.to}`,
      type: 'insertable',
      animated: isActiveEdge,
      className: isActiveEdge ? 'edge-active-pulse' : '',
      data: {
        planId: plan.id,
        isActiveEdge,
        isExecutedEdge,
        isDisabledEdge,
        isUnexecutedEdge,
      },
      style: {
        stroke: strokeColor,
        strokeWidth: isActiveEdge ? 3 : 2,
        opacity: isDisabledEdge ? 0.3 : isUnexecutedEdge ? 0.4 : 1,
      },
    };
  });

  // Apply auto-layout
  const layoutedNodes = layoutNodes(rfNodes as unknown as Node[], rfEdges as unknown as Edge[]);

  // Calculate plan width
  let maxX = 0;
  layoutedNodes.forEach(node => {
    const nodeRight = node.position.x + 280; // Approximate node width
    if (nodeRight > maxX) maxX = nodeRight;
  });

  // Apply X offset for horizontal positioning
  const offsetNodes = layoutedNodes.map(node => ({
    ...node,
    position: {
      x: node.position.x + xOffset,
      y: node.position.y + PLAN_HEADER_HEIGHT, // Leave room for header
    },
  }));

  return {
    nodes: offsetNodes,
    edges: rfEdges as unknown as Edge[],
    width: maxX,
  };
}

export function PlanCanvas() {
  const {
    plans,
    setSelectedNodeId,
    setPendingInsert,
    clearPlan,
    setSelectedBranch,
  } = usePlanStore();
  const { removeNode } = useWebSocket();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Auto-layout hook
  const { layoutNodes } = useAutoLayout();

  // Listen for branch selection events from TaskNode
  useEffect(() => {
    const handleSelectBranch = (event: CustomEvent<{ nodeId: string; targetId: string; planId: string }>) => {
      const { nodeId, targetId, planId } = event.detail;
      setSelectedBranch(nodeId, targetId, planId);
    };

    window.addEventListener('selectBranch', handleSelectBranch as EventListener);
    return () => {
      window.removeEventListener('selectBranch', handleSelectBranch as EventListener);
    };
  }, [setSelectedBranch]);

  // Convert all plans to ReactFlow nodes and edges
  useEffect(() => {
    if (plans.length === 0) {
      setNodes([]);
      setEdges([]);
      return;
    }

    const allNodes: Node[] = [];
    const allEdges: Edge[] = [];
    let currentX = 0;

    plans.forEach((planData) => {
      const { nodes: planNodes, edges: planEdges, width } = convertPlanToReactFlow(
        planData,
        currentX,
        setPendingInsert,
        removeNode,
        layoutNodes
      );

      allNodes.push(...planNodes);
      allEdges.push(...planEdges);
      currentX += width + PLAN_HORIZONTAL_GAP;
    });

    setNodes(allNodes as unknown as never[]);
    setEdges(allEdges as unknown as never[]);
  }, [plans, layoutNodes, setNodes, setEdges, setPendingInsert, removeNode]);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      // Extract the actual node ID (remove plan prefix)
      const nodeId = (node.id as string).split(':')[1];
      const planId = (node.id as string).split(':')[0];
      setSelectedNodeId(nodeId, planId);
    },
    [setSelectedNodeId]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, [setSelectedNodeId]);

  // Handle closing a plan (removing from canvas)
  const handleClosePlan = useCallback((planId: string) => {
    clearPlan(planId);
  }, [clearPlan]);

  return (
    <div className="w-full h-full relative">
      {/* Multiple plan headers - Figma-style artboard labels */}
      {plans.length > 0 && (
        <div className="absolute top-3 left-3 z-10 flex items-start gap-3 flex-wrap max-w-[calc(100%-24px)]">
          {plans.map((planData) => (
            <PlanHeader
              key={planData.plan.id}
              plan={planData.plan}
              completedCount={planData.completedCount}
              totalCount={planData.totalCount}
              onClose={plans.length > 1 ? () => handleClosePlan(planData.plan.id) : undefined}
            />
          ))}
        </div>
      )}

      <AnimatePresence>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          connectionMode={ConnectionMode.Loose}
          fitView
          fitViewOptions={{
            padding: 0.2,
            maxZoom: 1.5,
          }}
          minZoom={0.1}
          maxZoom={2}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color="#27272a"
          />
          <Controls
            showInteractive={false}
            className="!bg-surface !border-border !rounded-lg"
          />
          <MiniMap
            nodeColor={(node) => {
              const data = node.data as unknown as PlanNode | undefined;
              const status = data?.status;
              switch (status) {
                case 'completed':
                  return '#22c55e';
                case 'active':
                  return '#eab308';
                case 'failed':
                  return '#ef4444';
                default:
                  return '#3f3f46';
              }
            }}
            maskColor="rgba(10, 10, 11, 0.8)"
            className="!bg-surface/80 !border-border !rounded-lg"
          />
        </ReactFlow>
      </AnimatePresence>

      {/* Empty state */}
      {plans.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface/50 border border-border flex items-center justify-center">
              <Zap className="w-8 h-8 text-text-muted" />
            </div>
            <h3 className="text-lg font-medium text-text-primary mb-2">
              Waiting for plan...
            </h3>
            <p className="text-sm text-text-muted max-w-xs">
              Give your AI agent a task and watch the execution plan appear here in real-time.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
