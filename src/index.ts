#!/usr/bin/env node

/**
 * YouTube Subtitle MCP Server - stdio mode (recommended for local use)
 * Using latest MCP Protocol 2025-06-18
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Import business tools
import { fetchYoutubeSubtitles } from "./tools/fetchYoutubeSubtitles.js";

// Create MCP server using new API
const server = new McpServer({
  name: "youtube-subtitle-mcp",
  version: "1.0.0",
});

// Register YouTube subtitle fetching tool using new registerTool API
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
    outputSchema: {
      success: z.boolean(),
      videoId: z.string(),
      format: z.string(),
      language: z.string(),
      subtitleCount: z.number(),
      content: z.string(),
    },
  },
  async (args) => {
    return await fetchYoutubeSubtitles.run(args);
  }
);

// 🚀 Start stdio transport
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("✨ YouTube Subtitle MCP Server (stdio mode)");
  console.error("📋 Protocol Version: 2025-06-18 (Latest)");
  console.error("⚡ Using new McpServer API with registerTool");
  console.error("✅ Server started successfully\n");
}

main().catch((error) => {
  console.error("❌ Server error:", error);
  process.exit(1);
});

