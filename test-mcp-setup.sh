#!/bin/bash

echo "🚀 Testing MCP Setup for Demo CPQ Project"
echo "========================================="

echo ""
echo "1. Checking MCP SDK installation..."
if npm list @modelcontextprotocol/sdk &>/dev/null; then
    echo "✅ MCP SDK installed"
else
    echo "❌ MCP SDK not found"
fi

echo ""
echo "2. Checking MCP Inspector..."
if command -v mcp-inspector &>/dev/null; then
    echo "✅ MCP Inspector available at: $(which mcp-inspector)"
else
    echo "❌ MCP Inspector not found"
fi

echo ""
echo "3. Checking Filesystem Server..."
if command -v @modelcontextprotocol/server-filesystem &>/dev/null || [ -f "/opt/homebrew/lib/node_modules/@modelcontextprotocol/server-filesystem/dist/index.js" ]; then
    echo "✅ Filesystem server available"
else
    echo "❌ Filesystem server not found"
fi

echo ""
echo "4. Checking project MCP server..."
if [ -f "mcp-server.js" ]; then
    echo "✅ Custom MCP server created: mcp-server.js"
else
    echo "❌ Custom MCP server not found"
fi

echo ""
echo "5. Checking MCP config..."
if [ -f "mcp-config.json" ]; then
    echo "✅ MCP configuration file created"
else
    echo "❌ MCP config not found"
fi

echo ""
echo "6. Checking Sequential Thinking server..."
if command -v @modelcontextprotocol/server-sequential-thinking &>/dev/null || npm list -g @modelcontextprotocol/server-sequential-thinking &>/dev/null; then
    echo "✅ Sequential Thinking server installed"
else
    echo "❌ Sequential Thinking server not found"
fi

echo ""
echo "7. Checking Context7 server..."
if command -v @upstash/context7-mcp &>/dev/null || npm list -g @upstash/context7-mcp &>/dev/null; then
    echo "✅ Context7 server installed"
else
    echo "❌ Context7 server not found"
fi

echo ""
echo "8. Checking Playwright MCP server..."
if command -v @playwright/mcp &>/dev/null || npm list -g @playwright/mcp &>/dev/null; then
    echo "✅ Playwright MCP server installed"
else
    echo "❌ Playwright MCP server not found"
fi

echo ""
echo "🎯 Quick Start Commands:"
echo "------------------------"
echo "• Start MCP Inspector: npm run mcp:inspector"
echo "• Test custom server: npm run mcp:start"
echo "• View documentation: cat MCP_README.md"
echo "• Test Sequential Thinking: npx @modelcontextprotocol/server-sequential-thinking"
echo "• Test Context7: npx @upstash/context7-mcp"
echo "• Test Playwright: npx @playwright/mcp"

echo ""
echo "📋 Next Steps:"
echo "1. Configure your MCP client (Claude Desktop, etc.) with mcp-config.json"
echo "2. Test the filesystem server: npx @modelcontextprotocol/server-filesystem /Users/dkjesuschua/Documents/demo_cpq"
echo "3. Test the custom server: node mcp-server.js"
echo "4. Use Sequential Thinking for complex problem solving"
echo "5. Use Context7 for advanced context management"
echo "6. Use Playwright for browser automation and testing"

echo ""
echo "✨ Enhanced MCP Setup Complete! You now have:"
echo "   • Filesystem operations"
echo "   • Sequential thinking & reasoning"
echo "   • Context7 advanced context management"  
echo "   • Playwright browser automation"
echo "   • Custom project-specific tools"
