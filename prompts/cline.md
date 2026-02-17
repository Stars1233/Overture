# Overture Integration for Cline

Overture is an MCP server that displays your execution plans as visual flowcharts. Users can review, modify, and approve plans before you execute them.

## Integration with Cline Plan Mode

Overture complements Cline's existing plan mode by providing:
- Visual graph representation instead of text
- Interactive branch selection
- Dynamic field inputs for configuration
- Real-time execution progress

## MCP Tools

Use these tools via `use_mcp_tool` with server name `overture`:

| Tool | Input | Purpose |
|------|-------|---------|
| `submit_plan` | `{ plan_xml: string }` | Submit complete XML plan |
| `stream_plan_chunk` | `{ xml_chunk: string }` | Stream XML incrementally |
| `get_approval` | `{}` | Wait for user approval |
| `update_node_status` | `{ node_id, status, output? }` | Update execution progress |
| `plan_completed` | `{}` | Mark plan done |
| `plan_failed` | `{ error: string }` | Mark plan failed |

## XML Plan Schema

```xml
<plan id="plan_id" title="Plan Title" agent="cline">
  <nodes>
    <!-- Task node -->
    <node id="n1" type="task" status="pending">
      <title>Task title</title>
      <description>What this task does</description>
      <complexity>low|medium|high</complexity>
      <expected_output>Results of this task</expected_output>
      <risks>Potential issues</risks>

      <!-- Optional: Dynamic input fields -->
      <dynamic_field
        id="f1" name="var_name" type="string|secret|select|boolean|number"
        required="true|false" title="Label" description="Help text"
        value="default" options="a,b,c" setup_instructions="How to get this"
      />
    </node>

    <!-- Decision node -->
    <node id="n2" type="decision" status="pending">
      <title>Decision title</title>
      <description>What to decide</description>

      <branch id="b1" label="Option 1">
        <description>About this option</description>
        <pros>Advantages</pros>
        <cons>Disadvantages</cons>
      </branch>

      <branch id="b2" label="Option 2">
        <description>About this option</description>
        <pros>Advantages</pros>
        <cons>Disadvantages</cons>
      </branch>
    </node>

    <!-- Task attached to a branch -->
    <node id="n3" type="task" status="pending" branch_parent="n2" branch_id="b1">
      <title>Task for Option 1</title>
      <description>Only runs if Option 1 is selected</description>
    </node>
  </nodes>

  <edges>
    <edge id="e1" from="n1" to="n2" />
  </edges>
</plan>
```

## Example Usage

```xml
<use_mcp_tool>
<server_name>overture</server_name>
<tool_name>submit_plan</tool_name>
<arguments>
{
  "plan_xml": "<plan id=\"plan_001\" title=\"Create REST API\" agent=\"cline\"><nodes><node id=\"n1\" type=\"task\" status=\"pending\"><title>Set up Express server</title><description>Initialize Express.js with TypeScript</description><complexity>low</complexity></node></nodes><edges></edges></plan>"
}
</arguments>
</use_mcp_tool>
```

Then wait for approval:

```xml
<use_mcp_tool>
<server_name>overture</server_name>
<tool_name>get_approval</tool_name>
<arguments>{}</arguments>
</use_mcp_tool>
```

Update status during execution:

```xml
<use_mcp_tool>
<server_name>overture</server_name>
<tool_name>update_node_status</tool_name>
<arguments>
{
  "node_id": "n1",
  "status": "active"
}
</arguments>
</use_mcp_tool>
```

## Workflow

1. Generate comprehensive plan XML
2. Call `submit_plan`
3. Call `get_approval` (waits for user)
4. When approved, iterate through nodes:
   - `update_node_status(id, "active")`
   - Do the work
   - `update_node_status(id, "completed", output)`
5. Call `plan_completed` when done

## Best Practices

- Use decision nodes when multiple approaches are valid
- Add dynamic fields for any configuration needed at runtime
- Break large tasks into smaller, trackable nodes
- Always update status to "active" before starting a node
- Include meaningful output in completed status updates
