# Overture Integration for Cursor

You have access to Overture, an MCP server that visualizes execution plans as interactive flowcharts before you write code.

## Why Use Overture

- **Transparency**: Users see exactly what you plan to do before you do it
- **Control**: Users can modify the plan, fill in configuration, choose between approaches
- **Progress**: Real-time visual feedback as you execute each step
- **Reduced Waste**: Catch misunderstandings before writing code

## Workflow

```
1. User gives you a task
2. You generate a detailed XML plan
3. Submit plan using submit_plan or stream_plan_chunk
4. Call get_approval (blocks until user approves in UI)
5. Execute plan step by step, calling update_node_status for each
6. Call plan_completed or plan_failed when done
```

## MCP Tools

### submit_plan
```json
{
  "plan_xml": "<plan id=\"...\" title=\"...\" agent=\"cursor\">...</plan>"
}
```

### stream_plan_chunk
```json
{
  "xml_chunk": "<node id=\"n1\">..."
}
```

### get_approval
```json
{}
```
Returns: `{ approved: boolean, fieldValues: {}, selectedBranches: {} }`

### update_node_status
```json
{
  "node_id": "n1",
  "status": "active" | "completed" | "failed" | "skipped",
  "output": "Optional result text"
}
```

### plan_completed
```json
{}
```

### plan_failed
```json
{
  "error": "What went wrong"
}
```

## Plan XML Structure

```xml
<plan id="plan_123" title="Build Feature X" agent="cursor">
  <nodes>
    <!-- Regular task -->
    <node id="n1" type="task" status="pending">
      <title>Initialize project</title>
      <description>Set up the project structure</description>
      <complexity>low</complexity>
      <expected_output>Project scaffolded</expected_output>
      <risks>None</risks>

      <!-- User input field -->
      <dynamic_field
        id="f1"
        name="project_name"
        type="string"
        required="true"
        title="Project Name"
        description="Name for the project"
        value="my-project"
      />
    </node>

    <!-- Decision point -->
    <node id="n2" type="decision" status="pending">
      <title>Select database</title>
      <description>Choose which database to use</description>

      <branch id="b1" label="PostgreSQL">
        <description>Relational database</description>
        <pros>ACID compliance, complex queries</pros>
        <cons>Requires server setup</cons>
      </branch>

      <branch id="b2" label="SQLite">
        <description>File-based database</description>
        <pros>Zero setup, portable</pros>
        <cons>Not suitable for high concurrency</cons>
      </branch>
    </node>

    <!-- Task linked to a branch -->
    <node id="n3" type="task" status="pending" branch_parent="n2" branch_id="b1">
      <title>Set up PostgreSQL</title>
      <description>Configure PostgreSQL connection</description>
      <complexity>medium</complexity>

      <dynamic_field
        id="f2"
        name="db_url"
        type="secret"
        required="true"
        title="Database URL"
        description="PostgreSQL connection string"
        setup_instructions="Format: postgres://user:pass@host:5432/db"
      />
    </node>
  </nodes>

  <edges>
    <edge id="e1" from="n1" to="n2" />
  </edges>
</plan>
```

## Field Types

- `string` - Regular text
- `secret` - Hidden input (API keys, passwords)
- `select` - Dropdown, use `options="opt1,opt2,opt3"`
- `boolean` - Checkbox
- `number` - Numeric input

## Tips

1. **Break it down**: More nodes = more control for user
2. **Use branches**: Don't assume - let user choose
3. **Add fields**: Collect config before starting
4. **Update often**: Call update_node_status as you work
5. **Be specific**: Good descriptions = confident users
