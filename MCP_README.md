# MCP Setup for Demo CPQ Project

This project now includes Model Context Protocol (MCP) integration to enhance development workflows.

## What's Installed

1. **@modelcontextprotocol/sdk** - Core MCP SDK for TypeScript
2. **@modelcontextprotocol/inspector** - Global MCP inspector for debugging
3. **@modelcontextprotocol/server-filesystem** - Filesystem operations server
4. **@modelcontextprotocol/server-sequential-thinking** - Sequential thinking and problem solving
5. **@upstash/context7-mcp** - Advanced context management server
6. **@playwright/mcp** - Browser automation and testing server

## Files Added

- `mcp-config.json` - MCP server configuration
- `mcp-server.ts` - Custom TypeScript MCP server for your project
- `mcp-server.js` - Compiled JavaScript version
- `MCP_README.md` - This documentation

## Available MCP Tools

The custom MCP server provides these tools:

1. **run_tests** - Run unit tests, e2e tests, or all tests
2. **build_project** - Build the React project
3. **start_dev_server** - Get instructions to start dev server
4. **analyze_project_structure** - Analyze project structure and dependencies
5. **lint_code** - Run code linting
6. **check_component_usage** - Find where specific components are used

## Usage

### 1. Start the MCP Inspector (for debugging)
```bash
npm run mcp:inspector
```

### 2. Run the custom MCP server
```bash
npm run mcp:start
```

### 3. Compile TypeScript MCP server
```bash
npm run mcp:compile
```

## Integration with VS Code

To use MCP with VS Code and Claude/other AI assistants:

1. Configure your MCP client to use all the servers:
   ```json
   {
     "mcpServers": {
       "filesystem": {
         "command": "npx",
         "args": ["@modelcontextprotocol/server-filesystem", "/Users/dkjesuschua/Documents/demo_cpq"]
       },
       "sequential-thinking": {
         "command": "npx",
         "args": ["@modelcontextprotocol/server-sequential-thinking"]
       },
       "context7": {
         "command": "npx",
         "args": ["@upstash/context7-mcp"]
       },
       "playwright": {
         "command": "npx",
         "args": ["@playwright/mcp"]
       },
       "demo-cpq": {
         "command": "node",
         "args": ["mcp-server.js"],
         "cwd": "/Users/dkjesuschua/Documents/demo_cpq"
       }
     }
   }
   ```

## Benefits for Your Project

- **Automated Testing**: Easily run your test suites + Playwright browser testing
- **Project Analysis**: Get insights into component usage and structure
- **Build Management**: Streamlined build processes
- **Code Quality**: Integrated linting and code analysis
- **File Operations**: Enhanced file system interactions through MCP
- **Sequential Thinking**: Complex problem-solving and reasoning workflows
- **Context Management**: Advanced context tracking with Context7
- **Browser Automation**: Full browser testing and automation with Playwright

## Next Steps

1. Test the MCP server with: `npm run mcp:start`
2. Use the inspector to debug: `npm run mcp:inspector`
3. Integrate with your preferred MCP client (Claude Desktop, etc.)
4. Customize the server tools based on your specific needs

## Customization

You can extend `mcp-server.ts` to add more tools specific to your CPQ application:
- Quote validation tools
- Product catalog analysis
- Component dependency tracking
- Performance monitoring
- Automated screenshot comparison for UI testing

## Troubleshooting

If you encounter issues:
1. Ensure all MCP packages are installed: `npm ls @modelcontextprotocol/sdk`
2. Check the MCP server logs when running
3. Use the inspector to debug tool interactions
4. Verify file paths in `mcp-config.json` are correct
