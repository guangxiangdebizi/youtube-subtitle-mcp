#!/usr/bin/env node

/**
 * YouTube Subtitle MCP Server - Streamable HTTP mode (for server deployment)
 * Using latest MCP Protocol 2025-06-18
 */

import express, { Request, Response } from "express";
import cors from "cors";
import { randomUUID } from "node:crypto";
import "dotenv/config";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

// Import business tools
import { fetchYoutubeSubtitles } from "./tools/fetchYoutubeSubtitles.js";

// Create MCP server instance (reusable across requests)
function createMCPServer(): McpServer {
  const server = new McpServer({
    name: "youtube-subtitle-mcp",
    version: "1.0.0",
  });

  // Register YouTube subtitle fetching tool using new API
  server.registerTool(
    fetchYoutubeSubtitles.name,
    {
      title: "Fetch YouTube Subtitles",
      description: fetchYoutubeSubtitles.description,
      inputSchema: {
        url: z
          .string()
          .describe(
            "YouTube video URL or video ID. Supported formats: https://www.youtube.com/watch?v=xxx, https://youtu.be/xxx, or direct video ID"
          ),
        format: z
          .enum(["SRT", "VTT", "TXT", "JSON"])
          .default("JSON")
          .optional()
          .describe(
            "Output format. SRT: subtitle file format (with sequence numbers), VTT: WebVTT format, TXT: plain text (text only), JSON: structured JSON (with timestamps)"
          ),
        lang: z
          .string()
          .optional()
          .describe(
            "Subtitle language code (optional). Examples: zh-Hans (Simplified Chinese), zh-Hant (Traditional Chinese), en (English). Auto-detect if not specified"
          ),
      },
    },
    async (args) => {
      const result = await fetchYoutubeSubtitles.run(args);
      return result;
    }
  );

  return server;
}

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Configure CORS
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Accept",
      "Authorization",
      "Mcp-Session-Id",
      "X-Api-Key",
    ],
    exposedHeaders: ["Content-Type", "Mcp-Session-Id"],
  })
);

app.use(express.json({ limit: "10mb" }));

// Store transports by session ID for stateful mode
const transports: Record<string, StreamableHTTPServerTransport> = {};

// Health check endpoint
app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "healthy",
    transport: "streamable-http",
    protocol: "2025-06-18",
    activeSessions: Object.keys(transports).length,
    name: "youtube-subtitle-mcp",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// Main MCP endpoint using new Streamable HTTP transport
app.post("/mcp", async (req: Request, res: Response) => {
  try {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    let transport: StreamableHTTPServerTransport;

    if (sessionId && transports[sessionId]) {
      // Reuse existing transport for this session
      transport = transports[sessionId];
    } else if (!sessionId && isInitializeRequest(req.body)) {
      // New session initialization
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (id) => {
          transports[id] = transport;
          console.log(`✅ Session initialized: ${id}`);
        },
        onsessionclosed: (id) => {
          delete transports[id];
          console.log(`❌ Session closed: ${id}`);
        },
        enableJsonResponse: true,
        // Disable DNS rebinding protection for local development
        // If deploying to production, enable it and configure allowedHosts properly
        enableDnsRebindingProtection: false,
      });

      // Clean up transport when closed
      transport.onclose = () => {
        if (transport.sessionId) {
          delete transports[transport.sessionId];
        }
      };

      const server = createMCPServer();
      await server.connect(transport);
    } else {
      // Invalid request
      return res.status(400).json({
        jsonrpc: "2.0",
        error: {
          code: -32000,
          message: "Bad Request: No valid session ID provided",
        },
        id: null,
      });
    }

    // Handle the request using new transport API
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error("❌ Error handling MCP request:", error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: {
          code: -32603,
          message: "Internal server error",
        },
        id: null,
      });
    }
  }
});

// Reusable handler for GET and DELETE requests (session management)
const handleSessionRequest = async (req: Request, res: Response) => {
  const sessionId = req.headers["mcp-session-id"] as string | undefined;
  if (!sessionId || !transports[sessionId]) {
    return res.status(400).send("Invalid or missing session ID");
  }

  const transport = transports[sessionId];
  await transport.handleRequest(req, res);
};

// Handle GET requests for server-to-client notifications via SSE
app.get("/mcp", handleSessionRequest);

// Handle DELETE requests for session termination
app.delete("/mcp", handleSessionRequest);

// Start Streamable HTTP server
app.listen(PORT, () => {
  console.log(`\n🚀 YouTube Subtitle MCP Server (Streamable HTTP)`);
  console.log(`📋 Protocol Version: 2025-06-18 (Latest)`);
  console.log(`📡 Listening on: http://localhost:${PORT}`);
  console.log(`🔗 MCP endpoint: http://localhost:${PORT}/mcp`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
  console.log(`\n⚡ Using new McpServer API with registerTool`);
  console.log(`✨ Features: Session management, DNS rebinding protection`);
  console.log(`\nPress Ctrl+C to stop the server\n`);
}).on("error", (error) => {
  console.error("❌ Server error:", error);
  process.exit(1);
});

