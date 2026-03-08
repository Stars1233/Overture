#!/bin/bash
# Submit test plan for edge pulsation testing
# Usage: ./submit-test-plan.sh

set -e

echo "Submitting test plan to Overture UI..."

curl -X POST http://localhost:3031/api/test-plan \
  -H "Content-Type: application/json" \
  -d '{
  "plan_xml": "<plan>\n  <metadata>\n    <title>Edge Pulsation Test - Multi-Branch</title>\n    <agent>QA Testing Agent</agent>\n    <project_id>test-qa-001</project_id>\n  </metadata>\n\n  <node id=\"n1\">\n    <title>Initial Setup</title>\n    <description>Set up test environment</description>\n  </node>\n\n  <node id=\"n2\">\n    <title>Environment Check</title>\n    <description>Branch point for environment selection</description>\n  </node>\n\n  <node id=\"n3a\">\n    <title>Production Path</title>\n    <description>Production deployment branch</description>\n  </node>\n\n  <node id=\"n4a\">\n    <title>Production Tests</title>\n    <description>Run production tests</description>\n  </node>\n\n  <node id=\"n3b\">\n    <title>Staging Path</title>\n    <description>Staging deployment branch</description>\n  </node>\n\n  <node id=\"n4b\">\n    <title>Staging Tests</title>\n    <description>Run staging tests</description>\n  </node>\n\n  <node id=\"n5\">\n    <title>Nested Branch Point</title>\n    <description>Decide on monitoring strategy</description>\n  </node>\n\n  <node id=\"n6a\">\n    <title>Full Monitoring</title>\n    <description>Comprehensive monitoring</description>\n  </node>\n\n  <node id=\"n6b\">\n    <title>Basic Monitoring</title>\n    <description>Basic monitoring only</description>\n  </node>\n\n  <node id=\"n7\">\n    <title>Final Verification</title>\n    <description>Verify deployments</description>\n  </node>\n\n  <edge id=\"e1\" from=\"n1\" to=\"n2\" />\n  <edge id=\"e2a\" from=\"n2\" to=\"n3a\" />\n  <edge id=\"e2b\" from=\"n2\" to=\"n3b\" />\n  <edge id=\"e3a\" from=\"n3a\" to=\"n4a\" />\n  <edge id=\"e3b\" from=\"n3b\" to=\"n4b\" />\n  <edge id=\"e4a\" from=\"n4a\" to=\"n5\" />\n  <edge id=\"e4b\" from=\"n4b\" to=\"n5\" />\n  <edge id=\"e5a\" from=\"n5\" to=\"n6a\" />\n  <edge id=\"e5b\" from=\"n5\" to=\"n6b\" />\n  <edge id=\"e6a\" from=\"n6a\" to=\"n7\" />\n  <edge id=\"e6b\" from=\"n6b\" to=\"n7\" />\n</plan>"
}'

echo ""
echo "Test plan submitted successfully!"
echo "Open http://localhost:3031 to view the plan"
echo ""
echo "Testing Instructions:"
echo "1. Observe the branch points (n2 and n5)"
echo "2. Select one branch at each branch point"
echo "3. Verify unselected branch edges are dimmed (opacity 0.3)"
echo "4. Verify unselected branch edges do NOT pulsate"
echo "5. Approve and execute the plan"
echo "6. Verify active edges pulsate correctly"
echo "7. Verify disabled edges remain dimmed throughout execution"
