# Question Field Type Testing Documentation

## Implementation Analysis (2026-03-04)

### Code Changes Verified

1. **Server Types** (`packages/mcp-server/src/types.ts:4`)
   - `FieldType` includes 'question' type
   - Type: `'string' | 'secret' | 'select' | 'boolean' | 'number' | 'file' | 'question' | 'color'`

2. **UI Store Types** (`packages/ui/src/stores/plan-store.ts:6`)
   - Matching 'question' type in UI FieldType
   - Ensures type consistency between server and client

3. **DynamicFieldInput Component** (`packages/ui/src/components/Panel/DynamicFieldInput.tsx:107-134`)
   - Lines 107-134: Question field rendering logic
   - **With Options**: Renders `<select>` dropdown (lines 109-124)
   - **Without Options**: Renders text `<input>` (lines 126-134)
   - Uses same base styling classes as other field types
   - Placeholder text: "Select an answer" for dropdown, "Enter your answer" for text

### Critical Test Areas

#### 1. Conditional Rendering Logic
**Location**: DynamicFieldInput.tsx:109
```typescript
if (field.options) {
  const questionOptions = field.options.split(',').map((o) => o.trim());
  return <select>...</select>
}
return <input type="text">...</input>
```

**Edge Cases to Test**:
- `options=""` (empty string) - should render text input
- `options="   "` (whitespace only) - may render empty dropdown
- `options="SingleOption"` - renders dropdown with one option
- `options="Option1,Option2,Option3"` - normal dropdown
- `options="Opt,ion,With,Commas"` - comma delimiter edge case

#### 2. Option Parsing
**Location**: DynamicFieldInput.tsx:110
- Splits by comma: `field.options.split(',')`
- Trims whitespace: `.map((o) => o.trim())`

**Test Cases**:
- Extra spaces: `"Option1 , Option2 , Option3"`
- Special characters: `"AWS (Amazon),Google Cloud,Azure (MS)"`
- Empty segments: `"Option1,,Option3"` - creates empty option

#### 3. Required Field Validation
**Location**: plan-store.ts:658-662
```typescript
for (const field of dynamicFields) {
  if (field.required && !field.value) {
    console.log(`[canApprove] Missing required field "${field.title}" on node "${node.title}"`);
    return false;
  }
}
```

**Test Cases**:
- Required question with dropdown - must select non-empty option
- Required question with text input - must enter text
- Non-required question - can be left empty

#### 4. Field Value Persistence
**Location**: plan-store.ts:478-493
- Updates field value in node's dynamicFields array
- Must maintain value across UI interactions

### Known Edge Cases

1. **Empty Options String**
   - `options=""` is truthy in JavaScript
   - Will attempt to render dropdown with empty options array
   - **Bug Risk**: May render empty dropdown instead of text input

2. **Whitespace-only Options**
   - `options="   "` splits to `[""]` after trim
   - Creates dropdown with one empty option

3. **Trailing/Leading Commas**
   - `options=",Option1,Option2,"` creates empty string entries
   - Renders empty options in dropdown

### Selector Patterns for Testing

```css
/* Question field container - follows same pattern as other fields */
div:has(> label:contains("Question field title"))

/* Dropdown (with options) */
select[class*="baseInputClass"]

/* Text input (without options) */
input[type="text"][class*="baseInputClass"]

/* Required indicator */
span.text-accent-red  /* Contains '*' */

/* Validation message */
p.text-accent-yellow  /* "Required" message */
```

### Regression Test Checklist

- [ ] String field still works
- [ ] Select field still works (similar dropdown but different type)
- [ ] Boolean field still works
- [ ] Number field still works
- [ ] Secret field still works
- [ ] File field still works (if implemented)
- [ ] Color field still works
- [ ] Mixed fields in same node all render
- [ ] Approval button respects required question fields
- [ ] RequirementsChecklist shows pending question fields

### Test Data Files

Created comprehensive test plan XML:
- `/Users/Opeyemi/Downloads/sixth-mcp/overture/test-question-field.xml`
- Covers 6 test scenarios:
  1. Question with dropdown options
  2. Question with free-form input
  3. Required question with empty options (edge case)
  4. Question with single option (edge case)
  5. Question with special characters in options
  6. Mixed field types in one node

### API Testing Command

```bash
curl -X POST http://localhost:3031/api/test-plan \
  -H "Content-Type: application/json" \
  -d @/Users/Opeyemi/Downloads/sixth-mcp/overture/test-question-field.json
```

### Manual Testing Steps

1. **Start dev environment**: `npm run dev` (ports 3030 WS, 3031 HTTP)
2. **Load test plan**: POST to `/api/test-plan` endpoint
3. **Verify canvas rendering**: All 6 nodes appear
4. **Click Node 1**: Verify dropdown with 4 database options
5. **Click Node 2**: Verify text input (no options)
6. **Click Node 3**: Verify behavior with empty options string
7. **Click Node 4**: Verify dropdown with single option
8. **Click Node 5**: Verify special character handling
9. **Click Node 6**: Verify all 4 field types render correctly
10. **Test required validation**: Try to approve without filling required fields
11. **Test value persistence**: Select values, switch nodes, return - values should persist
12. **Test approval flow**: Fill all required fields, approval button should enable

### Expected Results

| Test Case | Expected Behavior |
|-----------|-------------------|
| Q1 (with options) | Dropdown with 5 options (blank + 4 databases) |
| Q2 (no options) | Text input with placeholder "Enter your answer" |
| Q3 (empty options) | Text input (empty string is falsy) |
| Q4 (single option) | Dropdown with 2 options (blank + OnlyOption) |
| Q5 (special chars) | Dropdown with all 5 deployment options correctly parsed |
| Q6 (mixed fields) | All 4 field types render without interference |

### Potential Bugs Discovered

1. **Empty Options Truthy Check**
   - Line 109: `if (field.options)`
   - Empty string `""` is falsy in JS, so this works correctly
   - BUT: Whitespace `"   "` is truthy, may cause issues

2. **No Fallback for Split Errors**
   - No error handling if `field.options.split(',')` fails
   - Could crash if `options` is unexpectedly non-string

3. **Duplicate Blank Options**
   - Both question and select render `<option value="">` as first option
   - Text differs: "Select an answer" vs "Select {field.title.toLowerCase()}"
   - Inconsistency may confuse users
