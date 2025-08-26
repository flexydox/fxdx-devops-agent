## Documentation Instructions

### Generate Documentation Comment

Add a comprehensive documentation comment above the selected code that includes:

- Brief description of the function/method purpose
- Parameter descriptions with types and expected values
- Return value description with type
- Usage examples
- Any exceptions or error conditions that may occur
- Related functions or dependencies if applicable

### Update README Instructions

Update the project README.md file to include:

#### Overview

- List all available commands with subcommands, args and outputs
- Use one table for each set of commands (one for jira, one for github, etc.)
- subcommand is non breaking
- subcommand should be bold
- each argument on one line inside table cell

#### Each Command with Subcommands

- Document all subcommands for each main command
- Include hierarchical structure (command -> subcommand)
- Provide description of what each subcommand does
- add usage examples for each subcommand
- do not use table for formatting

#### Arguments Section

- List all argument on separate lines

#### Examples Section

- Provide practical usage examples for common scenarios
- Include both basic and advanced use cases
- Show expected output where helpful
- Cover error handling examples
- Include examples for all major command combinations

#### Format Structure

- Format json args:

```
  args: |
  {
    "key": "value"
  }
```

- each arg on separate line
