# MCP E-commerce Server

A comprehensive Model Context Protocol (MCP) server for e-commerce product management with CRUD operations, AI-powered descriptions, and database integration.

## Features

- 🛍️ **Complete CRUD Operations** - Create, read, update, delete products
- 🤖 **AI-Powered Descriptions** - Automatic product description generation using MCP sampling
- 📊 **Database Integration** - MySQL database with proper schema
- 🔍 **Smart Search** - Search products by name with pagination
- 📦 **Low Stock Monitoring** - Resource for tracking inventory levels
- 🔧 **TypeScript** - Fully typed with Zod validation
- 📋 **MCP Resources** - Product catalog and low-stock resources
- 🎯 **MCP Prompts** - Pre-built prompt templates


## Quick start
```bash
# 1) Install deps
npm i

# 2) Prepare env
cp .env.example .env

# 3) Create schema (optional, run in your MySQL)
# See sql/schema.sql

# 4) Run demo (non-MCP) usage
npm run dev:demo

# 5) Run MCP server (stdio transport)
npm run dev:mcp
```
The MCP server prints nothing special; it waits on stdio for a client like Claude Desktop / MCP Inspector / Apps SDK to connect.

## Notes
- All database params come from environment variables.
- Can be extended with transactions, pagination, auth, etc.

## Deploying to NPM registry for public access
- Add following to #package.json
    ```
    "main": "dist/mcp/server.js",
    "bin": {
        "ecommerce-products-mcp": "dist/mcp/server.js"
    },
    ```
- Add following to server.js
  `#!/usr/bin/env node`
- Add Permission
    `chmod +x dist/mcp/server.js`
- Run NPM Link to add Node module Globally
    `npm link`
- Start Server using global name
    ecommerce-products-mcp
- Login to NPM registry
    `npm login`
- Publish package
    `npm publish --access public`
