# Monaco Editor Test - Sample Execution Outputs

These are sample outputs to submit via `update_node_status` for each test node.

---

## 1. TypeScript File Test

**Node**: `typescript-file`

```xml
<execution_output>
  <overview>Updated TypeScript component with proper typing</overview>
  <files_changed>
    <file path="src/components/TestComponent.tsx" lines_added="5" lines_removed="2">
      <diff><![CDATA[
@@ -1,10 +1,13 @@
 import React, { useState } from 'react';
+import { motion } from 'framer-motion';

-interface Props {
-  name: string;
+interface TestComponentProps {
+  name: string;
+  onSubmit?: () => void;
 }

-export function TestComponent({ name }: Props) {
+export function TestComponent({ name, onSubmit }: TestComponentProps) {
   const [count, setCount] = useState(0);
+
   return (
-    <div>Hello {name}</div>
+    <motion.div animate={{ opacity: 1 }}>
+      Hello {name} - Count: {count}
+      <button onClick={onSubmit}>Submit</button>
+    </motion.div>
   );
 }
]]></diff>
    </file>
  </files_changed>
</execution_output>
```

---

## 2. JavaScript File Test

**Node**: `javascript-file`

```xml
<execution_output>
  <overview>Refactored utility functions to ES6</overview>
  <files_changed>
    <file path="utils/helper.js" lines_added="8" lines_removed="12">
      <diff><![CDATA[
@@ -1,15 +1,11 @@
-function formatDate(date) {
-  return date.toLocaleDateString();
-}
-
-function capitalize(str) {
-  return str.charAt(0).toUpperCase() + str.slice(1);
-}
+export const formatDate = (date) => date.toLocaleDateString();
+export const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

-module.exports = {
-  formatDate: formatDate,
-  capitalize: capitalize
-};
+export const debounce = (func, wait) => {
+  let timeout;
+  return (...args) => {
+    clearTimeout(timeout);
+    timeout = setTimeout(() => func(...args), wait);
+  };
+};
]]></diff>
    </file>
  </files_changed>
</execution_output>
```

---

## 3. Python File Test

**Node**: `python-file`

```xml
<execution_output>
  <overview>Added type hints and improved error handling</overview>
  <files_changed>
    <file path="scripts/analyzer.py" lines_added="6" lines_removed="3">
      <diff><![CDATA[
@@ -1,10 +1,13 @@
 import sys
+from typing import List, Optional

-def analyze_data(data):
+def analyze_data(data: List[dict]) -> Optional[dict]:
+    """Analyze input data and return summary statistics."""
     if not data:
-        return None
+        raise ValueError("Data cannot be empty")

-    total = sum(item['value'] for item in data)
+    total = sum(item.get('value', 0) for item in data)
     average = total / len(data)
+
     return {
         'total': total,
         'average': average,
+        'count': len(data)
     }
]]></diff>
    </file>
  </files_changed>
</execution_output>
```

---

## 4. JSON File Test

**Node**: `json-file`

```xml
<execution_output>
  <overview>Updated package dependencies and scripts</overview>
  <files_changed>
    <file path="package.json" lines_added="3" lines_removed="2">
      <diff><![CDATA[
@@ -8,9 +8,10 @@
   "scripts": {
     "dev": "vite",
     "build": "tsc && vite build",
-    "preview": "vite preview"
+    "preview": "vite preview",
+    "test": "vitest"
   },
   "dependencies": {
-    "react": "^18.2.0",
+    "react": "^18.3.1",
     "react-dom": "^18.2.0"
   }
]]></diff>
    </file>
  </files_changed>
  <packages_installed>
    <package name="vitest" version="1.2.0" dev="true" />
  </packages_installed>
</execution_output>
```

---

## 5. CSS File Test

**Node**: `css-file`

```xml
<execution_output>
  <overview>Added dark theme variables and improved button styles</overview>
  <files_changed>
    <file path="styles/app.css" lines_added="12" lines_removed="5">
      <diff><![CDATA[
@@ -1,8 +1,15 @@
 :root {
-  --primary-color: #3b82f6;
+  --primary-color: #2563eb;
+  --surface-color: #18181b;
+  --text-primary: #fafafa;
+  --text-muted: #71717a;
 }

 .button {
-  background: var(--primary-color);
+  background: linear-gradient(135deg, var(--primary-color), #1d4ed8);
   color: white;
-  padding: 8px 16px;
+  padding: 12px 24px;
+  border-radius: 8px;
+  transition: all 0.2s ease;
+}
+
+.button:hover {
+  transform: translateY(-2px);
+  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
 }
]]></diff>
    </file>
  </files_changed>
</execution_output>
```

---

## 6. HTML File Test

**Node**: `html-file`

```xml
<execution_output>
  <overview>Added meta tags for SEO and social sharing</overview>
  <files_changed>
    <file path="public/index.html" lines_added="6" lines_removed="1">
      <diff><![CDATA[
@@ -2,7 +2,12 @@
 <html lang="en">
   <head>
     <meta charset="UTF-8" />
-    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
+    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
+    <meta name="description" content="Overture - Visual plan execution for AI agents" />
+    <meta property="og:title" content="Overture MCP Server" />
+    <meta property="og:description" content="Interactive visual workflows for AI coding" />
+    <meta property="og:type" content="website" />
+    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
     <title>Overture</title>
   </head>
   <body>
]]></diff>
    </file>
  </files_changed>
</execution_output>
```

---

## 7. Markdown File Test

**Node**: `markdown-file`

```xml
<execution_output>
  <overview>Enhanced README with installation instructions and examples</overview>
  <files_changed>
    <file path="README.md" lines_added="15" lines_removed="3">
      <diff><![CDATA[
@@ -1,6 +1,18 @@
 # Overture

-Visual plan execution for AI agents.
+**Visual plan execution workflows for AI coding agents**
+
+## Features
+
+- 🎯 Interactive visual flowcharts for AI plans
+- 🔄 Real-time plan execution tracking
+- 🌿 Multi-branch decision support
+- 📊 Structured output parsing
+- 🎨 Beautiful dark theme UI

 ## Installation

-Coming soon.
+```bash
+npm install -g overture-mcp
+```
+
+## Usage
+
+See [documentation](./docs) for detailed usage instructions.
]]></diff>
    </file>
  </files_changed>
</execution_output>
```

---

## 8. Dockerfile Test

**Node**: `dockerfile-test`

```xml
<execution_output>
  <overview>Optimized Dockerfile with multi-stage build</overview>
  <files_changed>
    <file path="Dockerfile" lines_added="8" lines_removed="4">
      <diff><![CDATA[
@@ -1,8 +1,12 @@
-FROM node:18
+FROM node:18-alpine AS builder
+
 WORKDIR /app
 COPY package*.json ./
 RUN npm ci
 COPY . .
-RUN npm run build
-CMD ["npm", "start"]
+RUN npm run build
+
+FROM node:18-alpine
+WORKDIR /app
+COPY --from=builder /app/dist ./dist
+CMD ["node", "dist/index.js"]
]]></diff>
    </file>
  </files_changed>
</execution_output>
```

---

## 9. YAML File Test

**Node**: `yaml-file`

```xml
<execution_output>
  <overview>Updated CI workflow with test coverage</overview>
  <files_changed>
    <file path=".github/workflows/test.yml" lines_added="10" lines_removed="3">
      <diff><![CDATA[
@@ -5,12 +5,19 @@ on:
     branches: [main]

 jobs:
-  test:
+  test:
     runs-on: ubuntu-latest
+    strategy:
+      matrix:
+        node-version: [18, 20]
     steps:
       - uses: actions/checkout@v3
-      - name: Install dependencies
+      - name: Setup Node.js ${{ matrix.node-version }}
+        uses: actions/setup-node@v3
+        with:
+          node-version: ${{ matrix.node-version }}
+      - name: Install dependencies
         run: npm ci
-      - name: Run tests
-        run: npm test
+      - name: Run tests with coverage
+        run: npm run test:coverage
+      - name: Upload coverage
+        uses: codecov/codecov-action@v3
]]></diff>
    </file>
  </files_changed>
</execution_output>
```

---

## 10. Shell Script Test

**Node**: `shell-file`

```xml
<execution_output>
  <overview>Enhanced build script with error handling</overview>
  <files_changed>
    <file path="build.sh" lines_added="12" lines_removed="4">
      <diff><![CDATA[
@@ -1,9 +1,17 @@
 #!/bin/bash
+set -euo pipefail

-echo "Building..."
-npm run build
+readonly BUILD_DIR="dist"
+readonly LOG_FILE="build.log"

-if [ $? -eq 0 ]; then
-  echo "Build successful"
+cleanup() {
+  echo "Cleaning up..."
+  rm -rf "$BUILD_DIR"
+}
+
+echo "Building project..." | tee "$LOG_FILE"
+npm run build >> "$LOG_FILE" 2>&1
+
+if [ $? -eq 0 ]; then
+  echo "✅ Build successful"
 else
-  echo "Build failed"
+  echo "❌ Build failed. Check $LOG_FILE for details"
+  exit 1
 fi
]]></diff>
    </file>
  </files_changed>
</execution_output>
```

---

## 11. Large Diff Test (300+ lines)

**Node**: `large-diff`

```xml
<execution_output>
  <overview>Major refactor of core module (300+ lines changed)</overview>
  <files_changed>
    <file path="src/large-module.ts" lines_added="180" lines_removed="150">
      <diff><![CDATA[
@@ -1,5 +1,7 @@
 import { EventEmitter } from 'events';
+import { Logger } from './utils/logger';

-class DataProcessor {
+export class DataProcessor extends EventEmitter {
+  private logger: Logger;
   private cache: Map<string, any>;
   private config: ProcessorConfig;

@@ -10,15 +12,20 @@ class DataProcessor {
   }

-  process(data: any) {
+  async process(data: unknown): Promise<ProcessResult> {
+    this.logger.info('Processing data', { size: data.length });
+
     if (!this.validate(data)) {
-      throw new Error('Invalid data');
+      this.emit('error', new ValidationError('Invalid data format'));
+      throw new ValidationError('Invalid data format');
     }

     const cached = this.cache.get(this.hash(data));
     if (cached) {
+      this.logger.debug('Returning cached result');
       return cached;
     }

-    const result = this.transform(data);
+    const result = await this.transform(data);
+    this.emit('processed', result);
     this.cache.set(this.hash(data), result);
     return result;
   }

[... 250 more lines of diff content ...]

@@ -280,10 +290,15 @@ class DataProcessor {
   }

   private cleanup() {
+    this.logger.info('Cleaning up processor');
     this.cache.clear();
+    this.removeAllListeners();
   }
 }

-export default DataProcessor;
+export interface ProcessorConfig {
+  maxCacheSize: number;
+  timeout: number;
+  enableLogging: boolean;
+}
]]></diff>
    </file>
  </files_changed>
</execution_output>
```

---

## 12. Small Diff Test (3 lines)

**Node**: `small-diff`

```xml
<execution_output>
  <overview>Fixed typo in config constant</overview>
  <files_changed>
    <file path="config.ts" lines_added="1" lines_removed="1">
      <diff><![CDATA[
@@ -5,7 +5,7 @@
 export const CONFIG = {
   API_URL: 'https://api.example.com',
   TIMEOUT: 5000,
-  MAX_RETRIES: 3,
+  MAX_RETRIES: 5,
 };
]]></diff>
    </file>
  </files_changed>
</execution_output>
```

---

## 13. Files Created Test

**Node**: `create-files`

```xml
<execution_output>
  <overview>Created new test suite and documentation</overview>
  <files_created>
    <file path="tests/unit/processor.test.ts" lines="145" />
    <file path="tests/integration/api.test.ts" lines="89" />
    <file path="docs/API.md" lines="234" />
    <file path="docs/examples/basic-usage.md" lines="67" />
    <file path=".github/CONTRIBUTING.md" lines="102" />
  </files_created>
</execution_output>
```

---

## 14. Files Deleted Test

**Node**: `delete-files`

```xml
<execution_output>
  <overview>Removed deprecated files and old configs</overview>
  <files_deleted>
    <file path="src/legacy/old-processor.js" />
    <file path="config/deprecated.json" />
    <file path="scripts/unused.sh" />
  </files_deleted>
</execution_output>
```

---

## 15. Edge Case: Unusual Diff Formatting

**Node**: `edge-case-diff`

```xml
<execution_output>
  <overview>Testing diff with unusual formatting (leading spaces, mixed line endings)</overview>
  <files_changed>
    <file path="weird-format.ts" lines_added="4" lines_removed="2">
      <diff><![CDATA[


        @@ -1,5 +1,7 @@
        export function test() {
        -  const x = 1;
        -  return x;
        +  const x = 1;
        +  const y = 2;
        +  const z = x + y;
        +  return z;
        }


]]></diff>
    </file>
  </files_changed>
</execution_output>
```

---

## 16. Combined Output Test

**Node**: `combined-output`

```xml
<execution_output>
  <overview>Complete feature implementation with all output types</overview>

  <notes>
    <note type="info">This test demonstrates all structured output types working together</note>
    <note type="warning">Monaco editor should handle multiple file types simultaneously</note>
  </notes>

  <files_changed>
    <file path="src/api/client.ts" lines_added="20" lines_removed="10">
      <diff><![CDATA[
@@ -1,15 +1,25 @@
 import axios from 'axios';
+import { retry } from './utils/retry';

 export class ApiClient {
   private baseUrl: string;
+  private timeout: number;

-  constructor(baseUrl: string) {
+  constructor(baseUrl: string, timeout = 5000) {
     this.baseUrl = baseUrl;
+    this.timeout = timeout;
   }

-  async get(path: string) {
-    return axios.get(`${this.baseUrl}${path}`);
+  async get<T>(path: string): Promise<T> {
+    return retry(async () => {
+      const response = await axios.get<T>(`${this.baseUrl}${path}`, {
+        timeout: this.timeout,
+      });
+      return response.data;
+    }, 3);
   }
 }
]]></diff>
    </file>
    <file path="styles/components.css" lines_added="5" lines_removed="2">
      <diff><![CDATA[
@@ -10,5 +10,8 @@
 .card {
-  padding: 16px;
-  border: 1px solid #ccc;
+  padding: 24px;
+  border: 1px solid var(--border-color);
+  border-radius: 12px;
+  background: var(--surface-color);
+  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
 }
]]></diff>
    </file>
  </files_changed>

  <files_created>
    <file path="src/utils/retry.ts" lines="42" />
  </files_created>

  <packages_installed>
    <package name="axios" version="1.6.0" />
  </packages_installed>

  <tool_calls>
    <tool name="Read" count="5" />
    <tool name="Edit" count="3" />
    <tool name="Write" count="1" />
  </tool_calls>

  <preview_urls>
    <url type="Development Server">http://localhost:3031</url>
  </preview_urls>
</execution_output>
```

---

## How to Use These Test Outputs

### Method 1: API Endpoint (Recommended for automated testing)

```bash
# Submit plan
curl -X POST http://localhost:3031/api/test-plan \
  -H "Content-Type: application/xml" \
  -d @monaco-test-data.xml

# Then manually execute nodes and submit these outputs via update_node_status
```

### Method 2: MCP Tool Calls

If testing through MCP client:

```typescript
// Submit plan
await client.callTool('submit_plan', { plan_xml: planXml });

// Update node with output
await client.callTool('update_node_status', {
  node_id: 'typescript-file',
  status: 'completed',
  output: '<execution_output>...</execution_output>'
});
```

### Method 3: Copy-Paste for Manual Testing

1. Open browser DevTools console
2. Manually trigger node execution
3. Submit these XML outputs via WebSocket message simulation

---

## Expected Visual Results

### TypeScript File
- **Syntax**: Keywords (import, interface, export) in purple/blue
- **Strings**: Green
- **JSX**: Tags in light blue, attributes in yellow
- **Height**: ~200px (medium diff)

### JSON File
- **Syntax**: Keys in white, values colored by type
- **Braces**: White
- **Strings**: Green
- **Numbers**: Light blue

### Python File
- **Syntax**: def, import keywords in purple
- **Type hints**: Colored differently
- **Strings**: Green (including docstrings)

### Large Diff
- **Height**: 300px (max, with scrollbar)
- **Scroll**: Smooth vertical scrolling
- **Performance**: No lag

### Small Diff
- **Height**: ~80px (minimum)
- **No scroll**: Content fits without scrolling

### Combined Output
- **All sections**: Expand independently
- **Monaco**: Renders for each file type
- **Performance**: No cumulative lag
