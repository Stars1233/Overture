import { useCallback } from 'react';
import dagre from 'dagre';
import { Node, Edge } from '@xyflow/react';

const NODE_WIDTH = 280;
const NODE_HEIGHT = 140;

export function useAutoLayout() {
  const layoutNodes = useCallback((nodes: Node[], edges: Edge[]): Node[] => {
    if (nodes.length === 0) return nodes;

    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    // Configure the layout with generous spacing
    dagreGraph.setGraph({
      rankdir: 'TB', // Top to bottom
      nodesep: 100, // Horizontal spacing between nodes (for branches)
      ranksep: 200, // Vertical spacing between ranks (generous spacing)
      marginx: 60,
      marginy: 60,
      edgesep: 50, // Extra space for edges
    });

    // Add nodes to the graph
    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, {
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
      });
    });

    // Add edges to the graph
    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    // Run the layout algorithm
    dagre.layout(dagreGraph);

    // Get the positioned nodes
    return nodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      return {
        ...node,
        position: {
          x: nodeWithPosition.x - NODE_WIDTH / 2,
          y: nodeWithPosition.y - NODE_HEIGHT / 2,
        },
      };
    });
  }, []);

  return { layoutNodes };
}
