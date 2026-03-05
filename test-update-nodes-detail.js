/**
 * Test script for update_nodes_detail MCP tool (batch update)
 * Tests all scenarios from the QA task requirements
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';
import WebSocket from 'ws';

// ANSI color codes for better visibility
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(msg, color = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

function logTest(testName) {
  console.log(`\n${colors.bright}${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}TEST: ${testName}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
}

function logPass(msg) {
  log(`✓ PASS: ${msg}`, 'green');
}

function logFail(msg) {
  log(`✗ FAIL: ${msg}`, 'red');
}

function logInfo(msg) {
  log(`ℹ INFO: ${msg}`, 'blue');
}

// Sample plan XML with 5+ nodes
const testPlanXml = `
<plan id="test_plan_batch_update" title="Batch Update Test Plan" agent="test">
  <node id="node1" type="task" title="Setup Environment">
    <description>Initialize the test environment</description>
    <complexity>low</complexity>
  </node>
  <node id="node2" type="task" title="Fetch Data">
    <description>Retrieve data from API</description>
    <complexity>medium</complexity>
  </node>
  <node id="node3" type="task" title="Process Data">
    <description>Transform and validate data</description>
    <complexity>high</complexity>
  </node>
  <node id="node4" type="task" title="Store Results">
    <description>Save processed data to database</description>
    <complexity>medium</complexity>
  </node>
  <node id="node5" type="task" title="Send Notifications">
    <description>Notify users of completion</description>
    <complexity>low</complexity>
  </node>

  <edge id="e1" from="node1" to="node2" />
  <edge id="e2" from="node2" to="node3" />
  <edge id="e3" from="node3" to="node4" />
  <edge id="e4" from="node4" to="node5" />
</plan>
`;

let client;
let testResults = {
  passed: 0,
  failed: 0,
  total: 0,
};

async function callTool(toolName, args) {
  logInfo(`Calling tool: ${toolName}`);
  logInfo(`Args: ${JSON.stringify(args, null, 2)}`);

  const result = await client.callTool({
    name: toolName,
    arguments: args,
  });

  logInfo(`Result: ${JSON.stringify(result, null, 2)}`);
  return result;
}

async function setupMcpClient() {
  log('Setting up MCP client...', 'bright');

  const serverProcess = spawn('node', [
    '/Users/Opeyemi/Downloads/sixth-mcp/overture/packages/mcp-server/dist/index.js'
  ], {
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  const transport = new StdioClientTransport({
    command: 'node',
    args: ['/Users/Opeyemi/Downloads/sixth-mcp/overture/packages/mcp-server/dist/index.js'],
    stderr: 'inherit',
  });

  client = new Client(
    {
      name: 'overture-test-client',
      version: '1.0.0',
    },
    {
      capabilities: {},
    }
  );

  await client.connect(transport);
  logPass('MCP client connected');
}

async function submitTestPlan() {
  logTest('Submitting Test Plan');

  const result = await callTool('submit_plan', {
    plan_xml: testPlanXml,
    workspace_path: '/tmp/overture-test-batch-update',
    agent_type: 'test',
  });

  const content = result.content[0];

  if (content.type === 'text' && content.text.includes('success')) {
    logPass('Test plan submitted successfully');

    // Extract projectId from response
    const match = content.text.match(/project_id "([^"]+)"/);
    if (match) {
      const projectId = match[1];
      logInfo(`Project ID: ${projectId}`);
      return projectId;
    }
  }

  logFail('Failed to submit test plan');
  return null;
}

async function test1_BatchUpdateMultipleNodes(projectId) {
  logTest('Test 1: Batch Update Multiple Nodes');
  testResults.total++;

  try {
    const result = await callTool('update_nodes_detail', {
      updates: [
        {
          node_id: 'node1',
          title: 'UPDATED: Setup Environment',
          description: 'UPDATED: Initialize the test environment with all dependencies',
        },
        {
          node_id: 'node2',
          title: 'UPDATED: Fetch Data',
          complexity: 'high',
        },
        {
          node_id: 'node3',
          expectedOutput: 'Validated and transformed data ready for storage',
          risks: 'Data validation may fail for edge cases',
        },
      ],
      project_id: projectId,
    });

    const content = result.content[0];
    const parsed = JSON.parse(content.text);

    if (parsed.updatedCount === 3 && parsed.success === true) {
      logPass('Successfully updated 3 nodes');
      testResults.passed++;
    } else {
      logFail(`Expected updatedCount: 3, got: ${parsed.updatedCount}`);
      testResults.failed++;
    }

    // Verify UI received WebSocket message
    await new Promise(resolve => setTimeout(resolve, 500));
    logInfo('WebSocket message should have been broadcast to UI');

  } catch (error) {
    logFail(`Test threw error: ${error.message}`);
    testResults.failed++;
  }
}

async function test2_PartialSuccess(projectId) {
  logTest('Test 2: Partial Success (Some Invalid Node IDs)');
  testResults.total++;

  try {
    const result = await callTool('update_nodes_detail', {
      updates: [
        {
          node_id: 'node1',
          title: 'Valid Update',
        },
        {
          node_id: 'INVALID_NODE_123',
          title: 'Should Fail',
        },
        {
          node_id: 'node2',
          description: 'Another Valid Update',
        },
      ],
      project_id: projectId,
    });

    const content = result.content[0];
    const parsed = JSON.parse(content.text);

    logInfo(`Updated: ${parsed.updatedCount}, Errors: ${parsed.errors?.length || 0}`);

    if (parsed.updatedCount === 2 && parsed.errors && parsed.errors.length === 1) {
      logPass('Partial success: 2 valid updates applied, 1 error reported');

      if (parsed.errors[0].includes('INVALID_NODE_123')) {
        logPass('Error message correctly identifies invalid node');
      }

      testResults.passed++;
    } else {
      logFail(`Expected updatedCount: 2, errors: 1, got updatedCount: ${parsed.updatedCount}, errors: ${parsed.errors?.length}`);
      testResults.failed++;
    }

  } catch (error) {
    logFail(`Test threw error: ${error.message}`);
    testResults.failed++;
  }
}

async function test3_AllInvalidNodes(projectId) {
  logTest('Test 3: All Invalid Node IDs');
  testResults.total++;

  try {
    const result = await callTool('update_nodes_detail', {
      updates: [
        {
          node_id: 'INVALID_1',
          title: 'Should Fail',
        },
        {
          node_id: 'INVALID_2',
          title: 'Should Also Fail',
        },
      ],
      project_id: projectId,
    });

    const content = result.content[0];
    const parsed = JSON.parse(content.text);

    if (parsed.updatedCount === 0 && parsed.errors && parsed.errors.length === 2) {
      logPass('All updates failed as expected');
      logPass(`Errors: ${parsed.errors.join(', ')}`);
      testResults.passed++;
    } else {
      logFail(`Expected updatedCount: 0, errors: 2, got updatedCount: ${parsed.updatedCount}, errors: ${parsed.errors?.length}`);
      testResults.failed++;
    }

  } catch (error) {
    logFail(`Test threw error: ${error.message}`);
    testResults.failed++;
  }
}

async function test4_EmptyUpdatesArray(projectId) {
  logTest('Test 4: Empty Updates Array');
  testResults.total++;

  try {
    const result = await callTool('update_nodes_detail', {
      updates: [],
      project_id: projectId,
    });

    const content = result.content[0];
    const parsed = JSON.parse(content.text);

    if (parsed.updatedCount === 0 && parsed.success === true) {
      logPass('Empty updates array handled gracefully');
      testResults.passed++;
    } else {
      logFail(`Expected updatedCount: 0, success: true, got: ${JSON.stringify(parsed)}`);
      testResults.failed++;
    }

  } catch (error) {
    logFail(`Test threw error: ${error.message}`);
    testResults.failed++;
  }
}

async function test5_UpdateDifferentFields(projectId) {
  logTest('Test 5: Update Different Fields on Different Nodes');
  testResults.total++;

  try {
    const result = await callTool('update_nodes_detail', {
      updates: [
        {
          node_id: 'node1',
          title: 'Title Only Update',
        },
        {
          node_id: 'node2',
          description: 'Description Only Update',
        },
        {
          node_id: 'node3',
          complexity: 'low',
        },
        {
          node_id: 'node4',
          expectedOutput: 'Expected output update',
          risks: 'Potential risks identified',
        },
      ],
      project_id: projectId,
    });

    const content = result.content[0];
    const parsed = JSON.parse(content.text);

    if (parsed.updatedCount === 4 && parsed.success === true) {
      logPass('Successfully updated different fields on 4 nodes');
      testResults.passed++;
    } else {
      logFail(`Expected updatedCount: 4, got: ${parsed.updatedCount}`);
      testResults.failed++;
    }

  } catch (error) {
    logFail(`Test threw error: ${error.message}`);
    testResults.failed++;
  }
}

async function test6_WebSocketBroadcast() {
  logTest('Test 6: WebSocket Broadcast Verification');
  testResults.total++;

  try {
    logInfo('Connecting to WebSocket server...');
    const ws = new WebSocket('ws://localhost:3030');

    await new Promise((resolve, reject) => {
      ws.on('open', resolve);
      ws.on('error', reject);
      setTimeout(() => reject(new Error('WebSocket connection timeout')), 5000);
    });

    logPass('WebSocket connected');

    // Set up message listener
    let receivedMessage = null;
    ws.on('message', (data) => {
      const message = JSON.parse(data.toString());
      if (message.type === 'nodes_detail_updated') {
        receivedMessage = message;
      }
    });

    // Now submit a plan and perform batch update
    const testProjectId = await submitTestPlan();
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Perform batch update
    await callTool('update_nodes_detail', {
      updates: [
        {
          node_id: 'node1',
          title: 'WebSocket Test Update 1',
        },
        {
          node_id: 'node2',
          title: 'WebSocket Test Update 2',
        },
      ],
      project_id: testProjectId,
    });

    // Wait for WebSocket message
    await new Promise(resolve => setTimeout(resolve, 1000));

    ws.close();

    if (receivedMessage) {
      logPass('WebSocket message received');
      logInfo(`Message type: ${receivedMessage.type}`);
      logInfo(`Updates count: ${receivedMessage.updates?.length || 0}`);

      if (receivedMessage.updates && receivedMessage.updates.length === 2) {
        logPass('Correct number of updates in WebSocket message');
        testResults.passed++;
      } else {
        logFail(`Expected 2 updates, got: ${receivedMessage.updates?.length}`);
        testResults.failed++;
      }
    } else {
      logFail('No WebSocket message received');
      testResults.failed++;
    }

  } catch (error) {
    logFail(`Test threw error: ${error.message}`);
    testResults.failed++;
  }
}

async function test7_MultiProjectContext() {
  logTest('Test 7: Multi-Project Context');
  testResults.total++;

  try {
    // Submit two different plans with different project IDs
    const projectId1 = await submitTestPlan();

    // Submit another plan with a different workspace path
    const result2 = await callTool('submit_plan', {
      plan_xml: testPlanXml,
      workspace_path: '/tmp/overture-test-batch-update-project2',
      agent_type: 'test',
    });

    const content2 = result2.content[0];
    const match2 = content2.text.match(/project_id "([^"]+)"/);
    const projectId2 = match2 ? match2[1] : null;

    if (!projectId2) {
      logFail('Failed to get second project ID');
      testResults.failed++;
      return;
    }

    logInfo(`Project 1 ID: ${projectId1}`);
    logInfo(`Project 2 ID: ${projectId2}`);

    // Update nodes in project 1
    await callTool('update_nodes_detail', {
      updates: [
        {
          node_id: 'node1',
          title: 'Project 1 Update',
        },
      ],
      project_id: projectId1,
    });

    // Update nodes in project 2
    await callTool('update_nodes_detail', {
      updates: [
        {
          node_id: 'node1',
          title: 'Project 2 Update',
        },
      ],
      project_id: projectId2,
    });

    logPass('Successfully updated nodes in different projects');
    testResults.passed++;

  } catch (error) {
    logFail(`Test threw error: ${error.message}`);
    testResults.failed++;
  }
}

async function test8_GetNodeInfoVerification(projectId) {
  logTest('Test 8: Verify Updates with get_node_info');
  testResults.total++;

  try {
    // First, update a node
    await callTool('update_nodes_detail', {
      updates: [
        {
          node_id: 'node1',
          title: 'Verified Title',
          description: 'Verified Description',
          complexity: 'high',
          expectedOutput: 'Verified output',
          risks: 'Verified risks',
        },
      ],
      project_id: projectId,
    });

    // Now use get_node_info to verify the update
    const nodeInfo = await callTool('get_node_info', {
      node_id: 'node1',
      project_id: projectId,
    });

    const content = nodeInfo.content[0];
    const parsed = JSON.parse(content.text);

    if (parsed.success && parsed.node) {
      const node = parsed.node;

      let allMatch = true;
      if (node.title !== 'Verified Title') {
        logFail(`Title mismatch: expected "Verified Title", got "${node.title}"`);
        allMatch = false;
      }
      if (node.description !== 'Verified Description') {
        logFail(`Description mismatch: expected "Verified Description", got "${node.description}"`);
        allMatch = false;
      }
      if (node.complexity !== 'high') {
        logFail(`Complexity mismatch: expected "high", got "${node.complexity}"`);
        allMatch = false;
      }

      if (allMatch) {
        logPass('All fields verified correctly with get_node_info');
        testResults.passed++;
      } else {
        testResults.failed++;
      }
    } else {
      logFail('get_node_info failed');
      testResults.failed++;
    }

  } catch (error) {
    logFail(`Test threw error: ${error.message}`);
    testResults.failed++;
  }
}

async function runAllTests() {
  log('\n═══════════════════════════════════════════════════════════════', 'bright');
  log('  OVERTURE MCP: update_nodes_detail COMPREHENSIVE TEST SUITE', 'bright');
  log('═══════════════════════════════════════════════════════════════\n', 'bright');

  try {
    await setupMcpClient();

    const projectId = await submitTestPlan();

    if (!projectId) {
      log('\n✗ Failed to submit test plan. Aborting tests.', 'red');
      process.exit(1);
    }

    // Wait for plan to be ready
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Run all tests
    await test1_BatchUpdateMultipleNodes(projectId);
    await test2_PartialSuccess(projectId);
    await test3_AllInvalidNodes(projectId);
    await test4_EmptyUpdatesArray(projectId);
    await test5_UpdateDifferentFields(projectId);
    await test6_WebSocketBroadcast();
    await test7_MultiProjectContext();
    await test8_GetNodeInfoVerification(projectId);

    // Print final results
    log('\n═══════════════════════════════════════════════════════════════', 'bright');
    log('  TEST RESULTS', 'bright');
    log('═══════════════════════════════════════════════════════════════\n', 'bright');

    log(`Total Tests: ${testResults.total}`, 'bright');
    log(`Passed: ${testResults.passed}`, 'green');
    log(`Failed: ${testResults.failed}`, testResults.failed > 0 ? 'red' : 'green');
    log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`,
        testResults.failed === 0 ? 'green' : 'yellow');

    if (testResults.failed === 0) {
      log('\n✓ ALL TESTS PASSED ✓', 'green');
    } else {
      log('\n✗ SOME TESTS FAILED ✗', 'red');
    }

    log('\n═══════════════════════════════════════════════════════════════\n', 'bright');

  } catch (error) {
    log(`\n✗ Fatal error: ${error.message}`, 'red');
    console.error(error);
  } finally {
    process.exit(testResults.failed === 0 ? 0 : 1);
  }
}

runAllTests();
