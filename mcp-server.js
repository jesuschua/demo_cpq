#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import * as fs from 'fs/promises';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);
const server = new Server({
    name: "demo-cpq-mcp-server",
    version: "0.1.0",
}, {
    capabilities: {
        tools: {},
    },
});
// List of tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "run_tests",
                description: "Run the test suite for the project",
                inputSchema: {
                    type: "object",
                    properties: {
                        testType: {
                            type: "string",
                            enum: ["unit", "e2e", "all"],
                            description: "Type of tests to run",
                            default: "all"
                        }
                    }
                }
            },
            {
                name: "build_project",
                description: "Build the React project",
                inputSchema: {
                    type: "object",
                    properties: {}
                }
            },
            {
                name: "start_dev_server",
                description: "Start the development server",
                inputSchema: {
                    type: "object",
                    properties: {}
                }
            },
            {
                name: "analyze_project_structure",
                description: "Analyze the current project structure and dependencies",
                inputSchema: {
                    type: "object",
                    properties: {}
                }
            },
            {
                name: "lint_code",
                description: "Run linting on the codebase",
                inputSchema: {
                    type: "object",
                    properties: {}
                }
            },
            {
                name: "check_component_usage",
                description: "Check which components are being used in the project",
                inputSchema: {
                    type: "object",
                    properties: {
                        componentName: {
                            type: "string",
                            description: "Name of the component to search for"
                        }
                    }
                }
            }
        ],
    };
});
// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        switch (name) {
            case "run_tests": {
                const testType = args?.testType || "all";
                let command = "npm test -- --watchAll=false";
                if (testType === "e2e") {
                    command = "npx playwright test";
                }
                const { stdout, stderr } = await execAsync(command);
                return {
                    content: [
                        {
                            type: "text",
                            text: `Test Results:\n${stdout}\n${stderr ? `Errors: ${stderr}` : ''}`
                        }
                    ]
                };
            }
            case "build_project": {
                const { stdout, stderr } = await execAsync("npm run build");
                return {
                    content: [
                        {
                            type: "text",
                            text: `Build Results:\n${stdout}\n${stderr ? `Errors: ${stderr}` : ''}`
                        }
                    ]
                };
            }
            case "start_dev_server": {
                return {
                    content: [
                        {
                            type: "text",
                            text: "To start the dev server, run: npm start\nThis will start the React development server on http://localhost:3000"
                        }
                    ]
                };
            }
            case "analyze_project_structure": {
                const packageJson = JSON.parse(await fs.readFile('package.json', 'utf-8'));
                const srcFiles = await getFiles('./src');
                const componentFiles = srcFiles.filter(file => file.includes('/components/') && (file.endsWith('.tsx') || file.endsWith('.ts')));
                return {
                    content: [
                        {
                            type: "text",
                            text: `Project Analysis:
              
Name: ${packageJson.name}
Version: ${packageJson.version}

Dependencies: ${Object.keys(packageJson.dependencies || {}).length}
Dev Dependencies: ${Object.keys(packageJson.devDependencies || {}).length}

Components (${componentFiles.length}):
${componentFiles.map(file => `- ${path.basename(file)}`).join('\n')}

Source Files (${srcFiles.length}):
${srcFiles.map(file => `- ${file.replace('./src/', '')}`).join('\n')}

Available Scripts:
${Object.keys(packageJson.scripts || {}).map(script => `- npm run ${script}`).join('\n')}`
                        }
                    ]
                };
            }
            case "check_component_usage": {
                const componentName = args?.componentName;
                if (!componentName) {
                    return {
                        content: [{ type: "text", text: "Please provide a component name to search for" }],
                        isError: true
                    };
                }
                const srcFiles = await getFiles('./src');
                const usages = [];
                for (const file of srcFiles) {
                    if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                        const content = await fs.readFile(file, 'utf-8');
                        if (content.includes(componentName)) {
                            usages.push(file);
                        }
                    }
                }
                return {
                    content: [
                        {
                            type: "text",
                            text: `Component "${componentName}" Usage:\n${usages.length > 0 ? usages.map(file => `- ${file}`).join('\n') : 'No usages found'}`
                        }
                    ]
                };
            }
            case "lint_code": {
                try {
                    const { stdout, stderr } = await execAsync("npm run lint 2>/dev/null || npx eslint src --ext .ts,.tsx,.js,.jsx");
                    return {
                        content: [
                            {
                                type: "text",
                                text: `Lint Results:\n${stdout}\n${stderr ? `Warnings/Errors: ${stderr}` : ''}`
                            }
                        ]
                    };
                }
                catch (error) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: `Linting not configured. Consider adding ESLint to your project.`
                            }
                        ]
                    };
                }
            }
            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error executing ${name}: ${error.message}`
                }
            ],
            isError: true,
        };
    }
});
async function getFiles(dir, fileList = []) {
    const files = await fs.readdir(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = await fs.stat(filePath);
        if (stat.isDirectory()) {
            await getFiles(filePath, fileList);
        }
        else {
            fileList.push(filePath);
        }
    }
    return fileList;
}
async function runServer() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Demo CPQ MCP Server running on stdio");
}
runServer().catch(console.error);
