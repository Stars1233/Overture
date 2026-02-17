import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import open from 'open';
import { wsManager } from './websocket/ws-server.js';
import { startHttpServer } from './http/server.js';
import {
  handleStreamPlanChunk,
  handleSubmitPlan,
  handleGetApproval,
  handleUpdateNodeStatus,
  handlePlanCompleted,
  handlePlanFailed,
} from './tools/handlers.js';
import { NodeStatus } from './types.js';

// Configuration
const HTTP_PORT = parseInt(process.env.OVERTURE_HTTP_PORT || '3031', 10);
const WS_PORT = parseInt(process.env.OVERTURE_WS_PORT || '3030', 10);
const AUTO_OPEN_BROWSER = process.env.OVERTURE_AUTO_OPEN !== 'false';

// Tool schemas
const StreamPlanChunkSchema = z.object({
  xml_chunk: z.string().describe('A chunk of the plan XML to process'),
});

const SubmitPlanSchema = z.object({
  plan_xml: z.string().describe('The complete plan XML'),
});

const UpdateNodeStatusSchema = z.object({
  node_id: z.string().describe('The ID of the node to update'),
  status: z
    .enum(['pending', 'active', 'completed', 'failed', 'skipped'])
    .describe('The new status of the node'),
  output: z.string().optional().describe('Optional output/result from the node execution'),
});

const PlanFailedSchema = z.object({
  error: z.string().describe('The error message'),
});

// Tool definitions
const TOOLS = [
  {
    name: 'stream_plan_chunk',
    description:
      'Stream a chunk of the plan XML to Overture. Use this to send the plan incrementally as it is generated. Each chunk will be parsed and nodes/edges will appear in real-time on the canvas.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        xml_chunk: {
          type: 'string',
          description: 'A chunk of the plan XML to process',
        },
      },
      required: ['xml_chunk'],
    },
  },
  {
    name: 'submit_plan',
    description:
      'Submit a complete plan XML to Overture. Use this if you have the entire plan ready at once. The plan will be parsed and displayed on the canvas.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        plan_xml: {
          type: 'string',
          description: 'The complete plan XML',
        },
      },
      required: ['plan_xml'],
    },
  },
  {
    name: 'get_approval',
    description:
      'Wait for user approval of the plan in the Overture UI. Returns status: "approved" (with field values and selected branches), "cancelled" (user rejected), or "pending" (still waiting). If status is "pending", call this tool again to continue waiting - the user may need up to 15-30 minutes to review and customize the plan.',
    inputSchema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'update_node_status',
    description:
      'Update the status of a node during execution. Use this to show progress as you work through the plan. The node will visually update on the canvas.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        node_id: {
          type: 'string',
          description: 'The ID of the node to update',
        },
        status: {
          type: 'string',
          enum: ['pending', 'active', 'completed', 'failed', 'skipped'],
          description: 'The new status of the node',
        },
        output: {
          type: 'string',
          description: 'Optional output/result from the node execution',
        },
      },
      required: ['node_id', 'status'],
    },
  },
  {
    name: 'plan_completed',
    description: 'Mark the plan as successfully completed. Call this after all nodes have been executed.',
    inputSchema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'plan_failed',
    description: 'Mark the plan as failed. Call this if an unrecoverable error occurs during execution.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        error: {
          type: 'string',
          description: 'The error message',
        },
      },
      required: ['error'],
    },
  },
];

async function main() {
  // Start HTTP server for the UI
  startHttpServer(HTTP_PORT);

  // Start WebSocket server for real-time updates
  wsManager.start(WS_PORT);

  // Open browser to the UI
  if (AUTO_OPEN_BROWSER) {
    setTimeout(() => {
      open(`http://localhost:${HTTP_PORT}`);
    }, 500);
  }

  // Create MCP server
  const server = new Server(
    {
      name: 'overture',
      version: '0.1.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Handle list tools request
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools: TOOLS };
  });

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        case 'stream_plan_chunk': {
          const parsed = StreamPlanChunkSchema.parse(args);
          const result = handleStreamPlanChunk(parsed.xml_chunk);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result),
              },
            ],
          };
        }

        case 'submit_plan': {
          const parsed = SubmitPlanSchema.parse(args);
          const result = handleSubmitPlan(parsed.plan_xml);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result),
              },
            ],
          };
        }

        case 'get_approval': {
          const result = await handleGetApproval();
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result),
              },
            ],
          };
        }

        case 'update_node_status': {
          const parsed = UpdateNodeStatusSchema.parse(args);
          const result = handleUpdateNodeStatus(
            parsed.node_id,
            parsed.status as NodeStatus,
            parsed.output
          );
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result),
              },
            ],
          };
        }

        case 'plan_completed': {
          const result = handlePlanCompleted();
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result),
              },
            ],
          };
        }

        case 'plan_failed': {
          const parsed = PlanFailedSchema.parse(args);
          const result = handlePlanFailed(parsed.error);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result),
              },
            ],
          };
        }

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ success: false, error: message }),
          },
        ],
        isError: true,
      };
    }
  });

  // Start the server
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('[Overture] MCP server started');
  console.error(`[Overture] UI: http://localhost:${HTTP_PORT}`);
  console.error(`[Overture] WebSocket: ws://localhost:${WS_PORT}`);
}

main().catch((error) => {
  console.error('[Overture] Fatal error:', error);
  process.exit(1);
});
