---
description: Add a new CLI command to Mayor West Mode
---

# Add New CLI Command

## Task
Add a new command `{{command_name}}` to the Mayor West Mode CLI.

## Steps

1. **Read the current CLI source** in `Docs/mayor-west-cli.md`

2. **Add command case** in the `main()` switch statement:
```javascript
case '{{command_name}}':
  await run{{CommandName}}Flow();
  break;
```

3. **Create the flow function**:
```javascript
async function run{{CommandName}}Flow() {
  log.header('{{Command Title}}');
  
  // Add interactive prompts if needed
  const answers = await inquirer.prompt([...]);
  
  // Implement command logic
  const spinner = ora('Processing...').start();
  // ... work
  spinner.succeed('Done!');
}
```

4. **Update help text** in `showHelp()` function

5. **Update documentation**:
   - `Docs/CLI-README.md` - Add to commands table
   - `Docs/cli-guide.md` - Add usage section

6. **Add tests** for the new command

## Checklist
- [ ] Command added to switch statement
- [ ] Flow function implemented
- [ ] Help text updated
- [ ] Documentation updated
- [ ] Tests written
