import {
  Rocket,
  Play,
  GitBranch,
  FormInput,
  Server,
  AlertTriangle,
  Keyboard,
  MousePointer,
  type LucideIcon,
} from 'lucide-react';

export interface HelpSection {
  id: string;
  title: string;
  content: string;
}

export interface HelpCategory {
  id: string;
  title: string;
  icon: LucideIcon;
  sections: HelpSection[];
}

export const helpCategories: HelpCategory[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: Rocket,
    sections: [
      {
        id: 'what-is-overture',
        title: 'What is Overture?',
        content: `Overture is a visual plan approval system for AI coding agents. It intercepts the planning phase of AI assistants (like Claude Code, Cursor, Cline, and GitHub Copilot) and presents the plan as an interactive flowchart.

**Key Benefits:**
- Review AI-generated plans before code is written
- Modify plans by adding, editing, or removing steps
- Select which branches to follow at decision points
- Pause execution to make changes mid-flight
- Attach MCP servers to enhance node capabilities

**How It Works:**
1. Your AI agent submits a plan to Overture
2. The plan appears as a visual flowchart
3. You review and optionally modify the plan
4. Once approved, the agent executes each step
5. You can monitor progress and pause/resume as needed`,
      },
      {
        id: 'first-plan',
        title: 'Your First Plan',
        content: `When you first start Overture, you'll see an empty canvas. Here's what happens when a plan arrives:

**Plan Arrival:**
1. The canvas populates with connected task nodes
2. Each node represents a step the AI will take
3. Edges show the execution order and dependencies

**Understanding Node States:**
- **Pending** (gray): Not yet started
- **Active** (blue pulse): Currently being executed
- **Completed** (green): Successfully finished
- **Failed** (red): Encountered an error
- **Skipped** (dimmed): Not executed due to branch selection

**Quick Actions:**
- Click any node to see its details in the side panel
- Use the Approve button (or press Enter) to start execution
- Press Space to pause/resume during execution`,
      },
      {
        id: 'ui-overview',
        title: 'UI Overview',
        content: `**Header Bar:**
- Logo and plan title
- Progress indicator during execution
- Pause/Resume button
- Status badge (streaming, ready, executing, etc.)
- History button to view past plans
- Settings for configuration
- Connection status

**Canvas Area:**
- Drag to pan around the plan
- Scroll to zoom in/out
- Click nodes to select and view details
- Nodes auto-layout for optimal viewing

**Side Panel (when node selected):**
- Node title and description
- Required fields and file attachments
- MCP server attachments
- Execution output and results

**Bottom Bar:**
- Requirements checklist before approval
- Branch selection prompts
- Approve button when ready`,
      },
    ],
  },
  {
    id: 'plan-workflow',
    title: 'Plan Workflow',
    icon: Play,
    sections: [
      {
        id: 'submitting-plans',
        title: 'Submitting Plans',
        content: `Plans are submitted by your AI coding agent through the MCP protocol. This happens automatically when:

**Automatic Submission:**
- The agent receives a complex task
- Multiple steps are identified
- The agent's prompt includes Overture instructions

**Plan Structure:**
Each plan contains:
- **Title**: Brief description of the overall task
- **Nodes**: Individual steps with titles, descriptions, and requirements
- **Edges**: Connections showing execution order
- **Branches**: Optional decision points with multiple paths

**Plan States:**
- \`streaming\`: Plan is being received from the agent
- \`ready\`: Plan is complete and awaiting approval
- \`approved\`: User has approved, execution pending
- \`executing\`: Steps are being carried out
- \`paused\`: Execution temporarily halted
- \`completed\`: All steps finished successfully
- \`failed\`: One or more steps encountered errors`,
      },
      {
        id: 'approving-plans',
        title: 'Approving Plans',
        content: `Before a plan executes, you must review and approve it.

**Review Checklist:**
The requirements checklist shows what's needed before approval:
- Required fields must be filled
- Branch selections must be made at decision points
- File attachments may be required for certain nodes

**Approval Methods:**
1. **Button**: Click the "Approve Plan" button
2. **Keyboard**: Press Enter when plan is ready
3. **Voice** (if enabled): Say "approve"

**What Happens After Approval:**
1. Status changes to "approved"
2. Agent begins executing from the first node
3. Nodes light up as they're processed
4. Progress bar shows completion percentage

**Important Notes:**
- You cannot un-approve a plan once execution starts
- Use Pause to halt execution if you spot issues
- Failed nodes can be re-run after fixing issues`,
      },
      {
        id: 'execution-monitoring',
        title: 'Monitoring Execution',
        content: `Once approved, you can monitor the plan's execution in real-time.

**Visual Indicators:**
- **Pulsing blue border**: Node currently executing
- **Green checkmark**: Node completed successfully
- **Red X**: Node failed with error
- **Gray dot**: Node pending or skipped

**Progress Tracking:**
- Header shows completed/total node count
- Progress bar fills as nodes complete
- Status badge updates (executing, paused, completed)

**Node Output:**
Click any completed node to view:
- Execution output and logs
- Files created or modified
- Error messages (if failed)
- Timing information

**Handling Failures:**
When a node fails:
1. Execution pauses automatically
2. Error details appear in the node panel
3. You can re-run the failed node
4. Or modify the plan and continue`,
      },
      {
        id: 'pausing-resuming',
        title: 'Pausing and Resuming',
        content: `You can pause execution at any time to review progress or make changes.

**How to Pause:**
- Click the Pause button in the header
- Press Space (when not in a text field)
- Execution stops after the current node completes

**While Paused:**
- Review completed node outputs
- Check upcoming nodes
- Modify the plan if needed
- The agent waits for your signal

**How to Resume:**
- Click the Resume button
- Press Space again
- Execution continues from where it stopped

**Use Cases for Pausing:**
- Reviewing intermediate results
- Checking if the approach is correct
- Making manual changes before continuing
- Taking a break during long operations

**Important:**
Pausing is graceful - the current node always completes first to avoid leaving things in a broken state.`,
      },
    ],
  },
  {
    id: 'node-operations',
    title: 'Node Operations',
    icon: MousePointer,
    sections: [
      {
        id: 'selecting-nodes',
        title: 'Selecting Nodes',
        content: `Click any node to select it and view its details.

**Single Selection:**
- Click a node to select it
- Side panel opens with node details
- Press Escape to deselect

**Node Details Panel:**
When selected, you can see:
- **Title**: Node's name
- **Description**: What this step will do
- **Required Fields**: Input fields that need values
- **File Attachments**: Files to provide to this step
- **MCP Servers**: External tools attached to this node
- **Output**: Results after execution (if completed)

**Visual Feedback:**
- Selected nodes have a highlighted border
- The side panel slides in from the right
- Related nodes may be highlighted`,
      },
      {
        id: 'adding-nodes',
        title: 'Adding Nodes',
        content: `You can add new nodes to expand the plan.

**Insert Between Nodes:**
1. Hover over an edge (connection line)
2. Click the "+" button that appears
3. Fill in the new node details
4. The node is inserted in the sequence

**Add to End:**
1. Select the last node in a branch
2. Use the "Add Node" action
3. New node becomes the final step

**Node Fields:**
When adding a node, specify:
- **Title**: Clear, action-oriented name
- **Description**: What the agent should do
- **Type**: task, decision, or other
- **Dependencies**: Which nodes must complete first

**Best Practices:**
- Keep node titles concise but descriptive
- One logical action per node
- Description should be detailed enough for the agent`,
      },
      {
        id: 'editing-nodes',
        title: 'Editing Nodes',
        content: `Modify existing nodes to refine the plan.

**Editable Properties:**
- **Title**: Rename the step
- **Description**: Update instructions
- **Required Fields**: Add or modify input fields
- **File Attachments**: Attach reference files

**How to Edit:**
1. Select the node by clicking
2. Click in any editable field in the side panel
3. Make your changes
4. Changes save automatically

**Editing During Execution:**
- Cannot edit nodes that are currently executing
- Cannot edit completed nodes
- Can edit upcoming (pending) nodes

**Bulk Operations:**
Currently, nodes must be edited individually. For large changes, consider creating a new plan.`,
      },
      {
        id: 'deleting-nodes',
        title: 'Deleting Nodes',
        content: `Remove unnecessary nodes from the plan.

**How to Delete:**
1. Select the node to delete
2. Click the delete button (trash icon)
3. Confirm the deletion

**What Happens:**
- The node is removed
- Edges are reconnected automatically
- If it was a branch point, branches merge

**Restrictions:**
- Cannot delete nodes during execution
- Cannot delete the only node in a plan
- Cannot delete nodes with active dependencies

**Recovery:**
Currently, deletion is permanent within a session. However, you can:
- Load a previous plan from history
- Ask the agent to regenerate the plan`,
      },
      {
        id: 'moving-nodes',
        title: 'Moving and Reordering',
        content: `Change the execution order by moving nodes.

**Drag and Drop:**
- Click and hold a node
- Drag to a new position
- Release to drop

**Auto-Layout:**
After moving nodes, the canvas may auto-adjust for optimal viewing. You can also:
- Click the layout button to reorganize
- Zoom out to see the full plan
- Pan around to navigate

**Changing Dependencies:**
Moving a node may change its dependencies:
- Dropped before another node: executes first
- Dropped after: executes after
- The agent follows the visual order

**Limitations:**
- Cannot create circular dependencies
- Some node types have fixed positions
- Branch nodes have special ordering rules`,
      },
    ],
  },
  {
    id: 'branches',
    title: 'Branch Selection',
    icon: GitBranch,
    sections: [
      {
        id: 'understanding-branches',
        title: 'Understanding Branches',
        content: `Branches represent decision points in a plan where multiple paths are possible.

**What Creates Branches:**
- Alternative approaches to solve a problem
- Error handling paths
- Optional features
- Conditional logic based on results

**Visual Representation:**
- Branch points have multiple outgoing edges
- Each branch is labeled with its purpose
- Unselected branches appear dimmed
- Selected branch path is highlighted

**Branch Types:**
- **Either/Or**: Choose one path only
- **Conditional**: Path depends on previous results
- **Error Handling**: Fallback if something fails`,
      },
      {
        id: 'selecting-branches',
        title: 'Selecting a Branch',
        content: `You must select which branch to follow at each decision point before approval.

**Selection Process:**
1. Click on a branch point node
2. A modal appears showing all options
3. Each option shows:
   - Branch title
   - Description of what it does
   - Pros and cons (if provided)
4. Click to select your preferred path
5. Modal closes and selection is saved

**Visual Feedback:**
- Selected branch edge becomes solid
- Unselected branches become dashed/dimmed
- Nodes on unselected paths are skipped

**Changing Selection:**
Before approval, you can change your selection:
1. Click the branch point node again
2. Select a different option
3. The path updates accordingly

**After Approval:**
Branch selections are locked once execution begins. Plan carefully!`,
      },
      {
        id: 'branch-comparison',
        title: 'Comparing Branches',
        content: `The branch selection modal helps you make informed decisions.

**Side-by-Side View:**
When there are exactly two options:
- Both branches shown side by side
- Easy visual comparison
- Pros/cons listed for each

**List View:**
For three or more options:
- Branches listed vertically
- Expand each for details
- Clear selection indicator

**Information Provided:**
- **Title**: What this branch does
- **Description**: Detailed explanation
- **Pros**: Advantages of this approach
- **Cons**: Potential drawbacks
- **Estimated Impact**: Time/complexity hints

**Decision Tips:**
- Read descriptions carefully
- Consider your specific context
- Look for agent recommendations
- When unsure, choose the simpler path first`,
      },
    ],
  },
  {
    id: 'dynamic-fields',
    title: 'Dynamic Fields',
    icon: FormInput,
    sections: [
      {
        id: 'field-types',
        title: 'Field Types',
        content: `Nodes can have various input fields that you must fill before approval.

**Text Fields:**
- Single line text input
- Used for names, paths, short values
- May have validation rules

**Text Areas:**
- Multi-line text input
- Used for descriptions, code snippets
- Supports longer content

**Select/Dropdown:**
- Choose from predefined options
- Single or multiple selection
- Options provided by the agent

**File Attachments:**
- Upload files for the node to process
- Supports various file types
- Files are made available to the agent

**Boolean/Checkbox:**
- Yes/No choices
- Toggle features on/off
- Simple binary decisions`,
      },
      {
        id: 'required-fields',
        title: 'Required Fields',
        content: `Some fields must be filled before the plan can be approved.

**Identifying Required Fields:**
- Marked with asterisk (*) or "Required" label
- Listed in the requirements checklist
- Red indicators when empty

**Filling Required Fields:**
1. Select the node with required fields
2. Find the field in the side panel
3. Enter the required value
4. Indicator turns green when valid

**Validation:**
Fields may have validation rules:
- Minimum/maximum length
- Specific formats (email, URL, path)
- Must match a pattern
- Invalid values show error messages

**Requirements Checklist:**
The bottom panel shows all unfilled requirements across the entire plan, making it easy to see what's missing.`,
      },
      {
        id: 'file-attachments',
        title: 'File Attachments',
        content: `Some nodes accept file attachments as input.

**Supported Files:**
- Documents (txt, md, pdf)
- Images (png, jpg, svg)
- Code files (js, ts, py, etc.)
- Data files (json, csv, xml)

**Attaching Files:**
1. Select the node
2. Find the file attachment field
3. Click to open file picker
4. Select the file(s)
5. Files upload and attach

**File Size Limits:**
- Individual files: typically 10MB
- Total attachments: varies by server
- Large files may need compression

**Using Attachments:**
The agent receives the file content and can:
- Read and parse the content
- Reference it in code generation
- Use it as a template or example
- Process images for context`,
      },
    ],
  },
  {
    id: 'mcp-servers',
    title: 'MCP Servers',
    icon: Server,
    sections: [
      {
        id: 'what-are-mcps',
        title: 'What are MCP Servers?',
        content: `MCP (Model Context Protocol) servers extend what AI agents can do.

**Purpose:**
MCP servers provide additional tools and capabilities:
- Browser automation
- Image generation
- Database access
- API integrations
- File system operations
- And much more

**How They Work:**
1. MCP server runs locally or remotely
2. Agent connects via the MCP protocol
3. Server exposes tools the agent can use
4. Agent calls tools during node execution

**Benefits:**
- Extend agent capabilities without custom code
- Standardized protocol works with many agents
- Growing ecosystem of servers
- Easy to add and configure`,
      },
      {
        id: 'adding-mcps',
        title: 'Adding MCP Servers',
        content: `Attach MCP servers to nodes to give them extra capabilities.

**Per-Node Attachment:**
1. Select a node
2. Click "Add MCP Server" in the side panel
3. Browse the marketplace or enter details
4. Provide usage description
5. Server attaches to that node

**Attach to All Nodes:**
When adding from marketplace:
- Check "Attach to all nodes" option
- Server becomes available everywhere
- Useful for commonly-needed tools

**Manual Configuration:**
For custom MCP servers:
- Enter server name
- Provide connection details
- Configure any required API keys

**Usage Description:**
Always describe how you want to use the MCP:
- Helps the agent understand your intent
- Guides tool selection and usage
- Makes results more relevant`,
      },
      {
        id: 'mcp-marketplace',
        title: 'MCP Marketplace',
        content: `Browse and discover MCP servers from the marketplace.

**Opening the Marketplace:**
1. Select a node
2. Click "Add MCP Server"
3. Click "Browse Marketplace"

**Finding Servers:**
- **Search**: Find by name, description, or tags
- **Categories**: Filter by use case
- **Sort**: By stars, downloads, or recency
- **Tags**: Common functionality labels

**Server Information:**
Each listing shows:
- Name and description
- GitHub stars and downloads
- Author information
- Required API keys
- Category and tags

**Featured Servers:**
Look for the "Featured" badge - these are:
- Well-maintained and popular
- Verified to work well
- Recommended for common tasks

**External Links:**
Click "View on GitHub" for:
- Full documentation
- Configuration details
- Issue tracking
- Source code review`,
      },
    ],
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    icon: AlertTriangle,
    sections: [
      {
        id: 'connection-issues',
        title: 'Connection Issues',
        content: `If Overture shows "Disconnected" or plans don't appear:

**Check WebSocket Connection:**
- Look for "Connected" indicator in header
- If disconnected, the UI auto-reconnects
- Refresh the page if stuck

**Server Not Running:**
1. Ensure MCP server is started
2. Check the terminal for errors
3. Verify ports 3030 (WS) and 3031 (HTTP)
4. Look for port conflicts

**Firewall/Network:**
- Allow localhost connections
- Check if VPN is blocking local traffic
- Disable browser extensions that block WebSockets

**Agent Configuration:**
Ensure your agent is configured to use Overture:
- MCP server URL is correct
- Protocol version matches
- Agent has Overture instructions loaded`,
      },
      {
        id: 'plan-not-appearing',
        title: 'Plan Not Appearing',
        content: `If you expect a plan but the canvas stays empty:

**Check Agent Configuration:**
- Is Overture enabled in the agent?
- Does the task trigger planning?
- Check agent logs for errors

**Plan Rejection:**
Plans may be rejected if:
- Too few nodes (check Settings)
- Invalid XML structure
- Missing required elements

**Multiple Projects:**
- Check if you're viewing the right project tab
- Switch tabs to find the plan
- Plans are scoped by project ID

**WebSocket Messages:**
Open browser DevTools > Network > WS:
- Look for incoming messages
- Check for error responses
- Verify plan submission messages`,
      },
      {
        id: 'execution-stuck',
        title: 'Execution Stuck',
        content: `If execution seems frozen or unresponsive:

**Node Taking Too Long:**
- Some operations are slow (API calls, builds)
- Check agent terminal for progress
- Node may be waiting for external resources

**Agent Disconnected:**
- Check if agent process is still running
- Look for crashes in terminal
- Restart agent and resume plan

**Deadlock Detection:**
If a node never completes:
1. Pause execution
2. Check node output for hints
3. Consider marking node as failed
4. Re-run with modified approach

**Manual Intervention:**
Sometimes you may need to:
- Manually complete a step
- Mark a node as done
- Skip to the next node
- Restart from a checkpoint`,
      },
      {
        id: 'node-failures',
        title: 'Handling Node Failures',
        content: `When a node fails, execution pauses automatically.

**Understanding the Error:**
1. Select the failed node
2. Check the output panel
3. Read error message carefully
4. Look for stack traces or details

**Common Failure Causes:**
- **Missing files**: Path doesn't exist
- **Permission denied**: Can't write/read
- **API errors**: Rate limits, auth issues
- **Syntax errors**: Generated code has bugs
- **Timeout**: Operation took too long

**Recovery Options:**
1. **Re-run**: Try the same node again
2. **Edit and Re-run**: Modify description, try again
3. **Skip**: Mark as skipped, continue to next
4. **Abort**: Stop and create new plan

**Preventing Failures:**
- Provide detailed node descriptions
- Include error handling instructions
- Attach relevant context files
- Use appropriate MCP servers`,
      },
      {
        id: 'performance-issues',
        title: 'Performance Issues',
        content: `If the UI is slow or unresponsive:

**Large Plans:**
- Plans with 50+ nodes may be slow
- Consider breaking into smaller plans
- Use "Zoom to Fit" for overview

**Memory Usage:**
- Close unused browser tabs
- Clear browser cache
- Restart the browser if needed

**Layout Calculations:**
- Auto-layout runs on changes
- Disable auto-layout for manual arrangement
- Wait for layout to complete before editing

**WebSocket Traffic:**
- High-frequency updates can lag
- Check network tab for message volume
- Report excessive traffic as a bug

**Browser Recommendations:**
- Chrome or Firefox recommended
- Keep browser updated
- Disable unnecessary extensions`,
      },
    ],
  },
  {
    id: 'keyboard-shortcuts',
    title: 'Keyboard Shortcuts',
    icon: Keyboard,
    sections: [
      {
        id: 'shortcuts-reference',
        title: 'Shortcuts Reference',
        content: `Master these keyboard shortcuts for efficient workflow:

**Plan Actions:**
| Shortcut | Action |
|----------|--------|
| \`Enter\` | Approve plan (when ready) |
| \`Space\` | Pause/Resume execution |
| \`Escape\` | Deselect current node |

**Navigation:**
| Shortcut | Action |
|----------|--------|
| Arrow keys | Pan canvas |
| \`+\` / \`-\` | Zoom in/out |
| \`0\` | Reset zoom to 100% |
| \`F\` | Fit all nodes in view |

**Node Operations:**
| Shortcut | Action |
|----------|--------|
| \`Delete\` | Delete selected node |
| \`D\` | Duplicate selected node |
| \`E\` | Edit selected node |

**General:**
| Shortcut | Action |
|----------|--------|
| \`?\` | Open this help modal |
| \`H\` | Toggle history panel |
| \`S\` | Open settings |

**Tips:**
- Shortcuts work when not typing in inputs
- Some shortcuts require node selection
- Combine with modifier keys for variations`,
      },
    ],
  },
];

/**
 * Get all searchable content from help categories
 */
export function getSearchableContent(): Array<{
  categoryId: string;
  categoryTitle: string;
  sectionId: string;
  sectionTitle: string;
  content: string;
}> {
  const results: Array<{
    categoryId: string;
    categoryTitle: string;
    sectionId: string;
    sectionTitle: string;
    content: string;
  }> = [];

  for (const category of helpCategories) {
    for (const section of category.sections) {
      results.push({
        categoryId: category.id,
        categoryTitle: category.title,
        sectionId: section.id,
        sectionTitle: section.title,
        content: section.content,
      });
    }
  }

  return results;
}
