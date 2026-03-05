/**
 * Direct test of update_nodes_detail handler function
 * Tests batch update functionality without full MCP client
 */

import { handleSubmitPlan, handleUpdateNodesDetail, handleGetNodeInfo } from './packages/mcp-server/dist/tools/handlers.js';

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

const testPlanXml = `
<plan id="test_plan_batch" title="Batch Update Test Plan" agent="test">
  <node id="node1" type="task" title="Setup Environment">
    <description>Initialize the test environment</description>
    <complexity>low</complexity>
    <expectedOutput>Environment ready</expectedOutput>
    <risks>None</risks>
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

let testResults = {
  passed: 0,
  failed: 0,
  total: 0,
};

let testProjectId = null;

async function setupTestPlan() {
  log('Setting up test plan...', 'bright');

  const result = handleSubmitPlan(
    testPlanXml,
    '/tmp/overture-test-batch-update-direct',
    'test'
  );

  if (result.success && result.projectId) {
    testProjectId = result.projectId;
    logPass(`Test plan submitted. Project ID: ${testProjectId}`);
    return testProjectId;
  } else {
    logFail('Failed to submit test plan');
    return null;
  }
}

async function test1_BatchUpdateMultipleNodes() {
  logTest('Test 1: Batch Update Multiple Nodes');
  testResults.total++;

  try {
    const result = handleUpdateNodesDetail(
      [
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
      testProjectId
    );

    logInfo(`Result: ${JSON.stringify(result, null, 2)}`);

    if (result.updatedCount === 3 && result.success === true) {
      logPass('Successfully updated 3 nodes');
      testResults.passed++;
    } else {
      logFail(`Expected updatedCount: 3, got: ${result.updatedCount}`);
      testResults.failed++;
    }

    // Verify with get_node_info
    const nodeInfo = handleGetNodeInfo('node1', testProjectId);
    if (nodeInfo.success && nodeInfo.node.title === 'UPDATED: Setup Environment') {
      logPass('Node 1 title verified via get_node_info');
    } else {
      logFail(`Node 1 title not updated correctly: ${nodeInfo.node?.title}`);
    }

  } catch (error) {
    logFail(`Test threw error: ${error.message}`);
    console.error(error.stack);
    testResults.failed++;
  }
}

async function test2_PartialSuccess() {
  logTest('Test 2: Partial Success (Some Invalid Node IDs)');
  testResults.total++;

  try {
    const result = handleUpdateNodesDetail(
      [
        {
          node_id: 'node1',
          title: 'Valid Update Test 2',
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
      testProjectId
    );

    logInfo(`Updated: ${result.updatedCount}, Errors: ${result.errors?.length || 0}`);

    if (result.updatedCount === 2 && result.errors && result.errors.length === 1) {
      logPass('Partial success: 2 valid updates applied, 1 error reported');

      if (result.errors[0].includes('INVALID_NODE_123')) {
        logPass('Error message correctly identifies invalid node');
      }

      testResults.passed++;
    } else {
      logFail(`Expected updatedCount: 2, errors: 1, got updatedCount: ${result.updatedCount}, errors: ${result.errors?.length}`);
      testResults.failed++;
    }

  } catch (error) {
    logFail(`Test threw error: ${error.message}`);
    testResults.failed++;
  }
}

async function test3_AllInvalidNodes() {
  logTest('Test 3: All Invalid Node IDs');
  testResults.total++;

  try {
    const result = handleUpdateNodesDetail(
      [
        {
          node_id: 'INVALID_1',
          title: 'Should Fail',
        },
        {
          node_id: 'INVALID_2',
          title: 'Should Also Fail',
        },
      ],
      testProjectId
    );

    if (result.updatedCount === 0 && result.errors && result.errors.length === 2) {
      logPass('All updates failed as expected');
      logPass(`Errors: ${result.errors.join(', ')}`);
      testResults.passed++;
    } else {
      logFail(`Expected updatedCount: 0, errors: 2, got updatedCount: ${result.updatedCount}, errors: ${result.errors?.length}`);
      testResults.failed++;
    }

  } catch (error) {
    logFail(`Test threw error: ${error.message}`);
    testResults.failed++;
  }
}

async function test4_EmptyUpdatesArray() {
  logTest('Test 4: Empty Updates Array');
  testResults.total++;

  try {
    const result = handleUpdateNodesDetail(
      [],
      testProjectId
    );

    if (result.updatedCount === 0 && result.success === true) {
      logPass('Empty updates array handled gracefully');
      testResults.passed++;
    } else {
      logFail(`Expected updatedCount: 0, success: true, got: ${JSON.stringify(result)}`);
      testResults.failed++;
    }

  } catch (error) {
    logFail(`Test threw error: ${error.message}`);
    testResults.failed++;
  }
}

async function test5_UpdateDifferentFields() {
  logTest('Test 5: Update Different Fields on Different Nodes');
  testResults.total++;

  try {
    const result = handleUpdateNodesDetail(
      [
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
      testProjectId
    );

    if (result.updatedCount === 4 && result.success === true) {
      logPass('Successfully updated different fields on 4 nodes');

      // Verify each update
      const node1 = handleGetNodeInfo('node1', testProjectId);
      const node2 = handleGetNodeInfo('node2', testProjectId);
      const node3 = handleGetNodeInfo('node3', testProjectId);
      const node4 = handleGetNodeInfo('node4', testProjectId);

      if (node1.node.title === 'Title Only Update') {
        logPass('Node 1 title updated correctly');
      }
      if (node2.node.description === 'Description Only Update') {
        logPass('Node 2 description updated correctly');
      }
      if (node3.node.complexity === 'low') {
        logPass('Node 3 complexity updated correctly');
      }
      if (node4.node.expectedOutput === 'Expected output update' &&
          node4.node.risks === 'Potential risks identified') {
        logPass('Node 4 expectedOutput and risks updated correctly');
      }

      testResults.passed++;
    } else {
      logFail(`Expected updatedCount: 4, got: ${result.updatedCount}`);
      testResults.failed++;
    }

  } catch (error) {
    logFail(`Test threw error: ${error.message}`);
    testResults.failed++;
  }
}

async function test6_UpdateAllFieldsAtOnce() {
  logTest('Test 6: Update All Fields on Single Node');
  testResults.total++;

  try {
    const result = handleUpdateNodesDetail(
      [
        {
          node_id: 'node5',
          title: 'Complete Update',
          description: 'All fields updated',
          complexity: 'high',
          expectedOutput: 'Complete output',
          risks: 'Complete risks',
        },
      ],
      testProjectId
    );

    if (result.updatedCount === 1 && result.success === true) {
      logPass('Successfully updated all fields on 1 node');

      const node5 = handleGetNodeInfo('node5', testProjectId);
      const node = node5.node;

      let allCorrect = true;
      if (node.title !== 'Complete Update') {
        logFail(`Title mismatch: ${node.title}`);
        allCorrect = false;
      }
      if (node.description !== 'All fields updated') {
        logFail(`Description mismatch: ${node.description}`);
        allCorrect = false;
      }
      if (node.complexity !== 'high') {
        logFail(`Complexity mismatch: ${node.complexity}`);
        allCorrect = false;
      }
      if (node.expectedOutput !== 'Complete output') {
        logFail(`ExpectedOutput mismatch: ${node.expectedOutput}`);
        allCorrect = false;
      }
      if (node.risks !== 'Complete risks') {
        logFail(`Risks mismatch: ${node.risks}`);
        allCorrect = false;
      }

      if (allCorrect) {
        logPass('All fields verified correctly');
        testResults.passed++;
      } else {
        testResults.failed++;
      }
    } else {
      logFail(`Expected updatedCount: 1, got: ${result.updatedCount}`);
      testResults.failed++;
    }

  } catch (error) {
    logFail(`Test threw error: ${error.message}`);
    testResults.failed++;
  }
}

async function test7_NoProjectPlan() {
  logTest('Test 7: Update with Invalid Project ID');
  testResults.total++;

  try {
    const result = handleUpdateNodesDetail(
      [
        {
          node_id: 'node1',
          title: 'Should Fail',
        },
      ],
      'INVALID_PROJECT_ID'
    );

    if (!result.success && result.errors && result.errors[0].includes('No active plan')) {
      logPass('Invalid project ID handled correctly');
      testResults.passed++;
    } else {
      logFail(`Expected error for invalid project, got: ${JSON.stringify(result)}`);
      testResults.failed++;
    }

  } catch (error) {
    logFail(`Test threw error: ${error.message}`);
    testResults.failed++;
  }
}

async function runAllTests() {
  log('\n═══════════════════════════════════════════════════════════════', 'bright');
  log('  OVERTURE: update_nodes_detail DIRECT HANDLER TEST SUITE', 'bright');
  log('═══════════════════════════════════════════════════════════════\n', 'bright');

  try {
    const projectId = await setupTestPlan();

    if (!projectId) {
      log('\n✗ Failed to setup test plan. Aborting tests.', 'red');
      process.exit(1);
    }

    // Run all tests
    await test1_BatchUpdateMultipleNodes();
    await test2_PartialSuccess();
    await test3_AllInvalidNodes();
    await test4_EmptyUpdatesArray();
    await test5_UpdateDifferentFields();
    await test6_UpdateAllFieldsAtOnce();
    await test7_NoProjectPlan();

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
    console.error(error.stack);
  }
}

runAllTests();
