# Overture Integration for Claude Code

You have access to Overture, an MCP server that visualizes your execution plans as interactive flowcharts.

## When to Use Overture

Use Overture for any task that involves:
- Multiple steps or files
- Architectural decisions
- User configuration (API keys, preferences)
- Complex implementations

Do NOT use Overture for:
- Simple questions or explanations
- Single-file edits
- Quick fixes

## Quick Start

1. **Generate XML Plan** → 2. **Submit to Overture** → 3. **Wait for Approval** → 4. **Execute with Updates** → 5. **Complete**

## MCP Tools Available

| Tool | Purpose |
|------|---------|
| `submit_plan` | Submit complete plan XML |
| `stream_plan_chunk` | Stream plan XML incrementally |
| `get_approval` | Block until user approves |
| `update_node_status` | Update node status during execution |
| `plan_completed` | Mark plan as done |
| `plan_failed` | Mark plan as failed |

## XML Plan Format

```xml
<plan id="plan_001" title="Your Plan Title" agent="claude-code">
  <nodes>
    <node id="n1" type="task" status="pending">
      <title>Step title</title>
      <description>What this step does</description>
      <complexity>low|medium|high</complexity>
      <expected_output>What this produces</expected_output>
      <risks>Potential issues</risks>

      <dynamic_field
        id="f1" name="api_key" type="secret" required="true"
        title="API Key" description="Your API key"
        setup_instructions="Get from dashboard.example.com"
      />
    </node>

    <node id="n2" type="decision" status="pending">
      <title>Choose approach</title>
      <branch id="b1" label="Option A">
        <description>First option</description>
        <pros>Benefits</pros>
        <cons>Drawbacks</cons>
      </branch>
      <branch id="b2" label="Option B">
        <description>Second option</description>
        <pros>Benefits</pros>
        <cons>Drawbacks</cons>
      </branch>
    </node>
  </nodes>

  <edges>
    <edge id="e1" from="n1" to="n2" />
  </edges>
</plan>
```

## Dynamic Field Types

| Type | Use For |
|------|---------|
| `string` | Text input |
| `secret` | API keys, passwords (masked) |
| `select` | Dropdown choices (use `options="a,b,c"`) |
| `boolean` | Yes/no toggle |
| `number` | Numeric input |

## Execution Pattern

```javascript
// After get_approval returns { approved: true, fieldValues, selectedBranches }

for (const node of orderedNodes) {
  update_node_status(node.id, "active")

  try {
    // Do the work using fieldValues for any dynamic field values
    const result = await executeNode(node, fieldValues)
    update_node_status(node.id, "completed", result)
  } catch (error) {
    update_node_status(node.id, "failed", error.message)
    plan_failed(error.message)
    return
  }
}

plan_completed()
```

## Best Practices

1. **Atomic Steps**: Each node should be a single, clear action
2. **Use Decision Nodes**: When multiple valid approaches exist
3. **Add Dynamic Fields**: For any runtime configuration
4. **Document Everything**: Description, expected output, and risks
5. **Logical Order**: Edges should reflect true dependencies
6. **Real-time Updates**: Always update node status during execution
