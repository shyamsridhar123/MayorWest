---
description: Add a new file template to Mayor West Mode CLI
---

# Add New File Template

## Task
Add a new file template that the CLI will generate in target repositories.

## Steps

1. **Add to FILES_TO_CREATE** in `Docs/mayor-west-cli.md`:
```javascript
const FILES_TO_CREATE = {
  // ... existing entries
  '{{file_path}}': {
    displayName: '{{Display Name}}',
    category: '{{category}}',  // configuration, agent, workflow, template
    critical: {{true|false}},
  },
};
```

2. **Add template function** to `fileTemplates`:
```javascript
const fileTemplates = {
  // ... existing templates
  '{{file_path}}': () => `{{template_content}}`,
};
```

3. **Escaping rules**:
   - JSON: `JSON.stringify({...}, null, 2)`
   - Regex in JSON: Double-escape `\\s+`
   - GitHub Actions `$`: Escape as `\${{ }}`
   - Backticks: Escape as `` \` ``

4. **Update documentation**:
   - `Docs/CLI-README.md` - Add to "Configuration Files Created" section
   - `Docs/mayor_west_mode_trd.md` - Add specification if significant

5. **Add template validation test**:
```javascript
test('{{file_path}} template is valid', () => {
  const content = fileTemplates['{{file_path}}']();
  // Validate format (JSON.parse, yaml.load, etc.)
});
```

## Consult @template-author
For complex templates, invoke the template-author agent.

## Checklist
- [ ] Added to FILES_TO_CREATE
- [ ] Template function created
- [ ] Escaping verified
- [ ] Documentation updated
- [ ] Validation test added
