# 🎬 YouTube Subtitle MCP Server

A Model Context Protocol (MCP) server for fetching YouTube video subtitles/transcripts with support for multiple output formats (SRT, VTT, TXT, JSON).

[![smithery badge](https://smithery.ai/badge/@guangxiangdebizi/youtube-subtitle-mcp)](https://smithery.ai/server/@guangxiangdebizi/youtube-subtitle-mcp)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![MCP](https://img.shields.io/badge/MCP-0.6.0-green.svg)](https://modelcontextprotocol.io)

## ✨ Features

- 🎥 Fetch subtitles from any public YouTube video
- 📝 Multiple output formats: SRT, VTT, TXT, JSON
- 🌍 Multi-language subtitle support
- ⚡ Two deployment modes: stdio (local) and HTTP (server)
- 🔧 Zero-configuration setup with npx
- 📊 Complete timestamp information
- 🚀 Production-ready with TypeScript
- 🔥 Built with youtubei.js for reliable and stable subtitle extraction

## 🚀 Quick Start

### ⭐ Method 1: stdio Mode (Recommended for Local Use)

**Zero configuration required!** Simply use npx:

```bash
npx -y youtube-subtitle-mcp
```

Or install globally:

```bash
npm install -g youtube-subtitle-mcp
youtube-subtitle-mcp
```

### 🌐 Method 2: HTTP Mode (For Server Deployment)

```bash
# Clone repository
git clone https://github.com/guangxiangdebizi/youtube-subtitle-mcp.git
cd youtube-subtitle-mcp

# Install dependencies
npm install

# Build
npm run build

# Start HTTP server
npm run start:http
```

Server will start at `http://localhost:3000`

## 📦 Installation

### For Development

```bash
# Clone repository
git clone https://github.com/guangxiangdebizi/youtube-subtitle-mcp.git
cd youtube-subtitle-mcp

# Install dependencies
npm install

# Build
npm run build
```

### For Production

```bash
npm install -g youtube-subtitle-mcp
```

## 🔧 Configuration

### ⭐ stdio Mode Configuration (Recommended)

Add to your MCP client configuration file:

**Claude Desktop / Cursor Configuration:**

- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "youtube-subtitle": {
      "command": "npx",
      "args": ["-y", "youtube-subtitle-mcp"]
    }
  }
}
```

**For local development:**

```json
{
  "mcpServers": {
    "youtube-subtitle": {
      "command": "node",
      "args": ["C:/path/to/youtube-subtitle-mcp/build/index.js"]
    }
  }
}
```

### 🌐 HTTP Mode Configuration

```json
{
  "mcpServers": {
    "youtube-subtitle": {
      "type": "streamableHttp",
      "url": "http://localhost:3000/mcp",
      "timeout": 600
    }
  }
}
```

## 🛠️ Tool: fetch_youtube_subtitles

### Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `url` | string | ✅ Yes | YouTube video URL or video ID | `https://www.youtube.com/watch?v=dQw4w9WgXcQ` |
| `format` | string | ❌ No | Output format (default: JSON) | `SRT`, `VTT`, `TXT`, `JSON` |
| `lang` | string | ❌ No | Language code (default: auto) | `zh-Hans`, `en`, `ja` |

### Supported URL Formats

- Standard: `https://www.youtube.com/watch?v=VIDEO_ID`
- Short: `https://youtu.be/VIDEO_ID`
- Embed: `https://www.youtube.com/embed/VIDEO_ID`
- Direct ID: `VIDEO_ID`

### Language Codes

- `zh-Hans` - Simplified Chinese
- `zh-Hant` - Traditional Chinese
- `en` - English
- `ja` - Japanese
- `ko` - Korean
- `es` - Spanish
- `fr` - French
- `de` - German

## 📝 Usage Examples

### Example 1: Fetch JSON Format Subtitles (Default)

```
Please fetch subtitles from this video:
https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

### Example 2: Fetch SRT Format Subtitles

```
Please fetch subtitles in SRT format from:
https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

### Example 3: Fetch Specific Language Subtitles

```
Please fetch Simplified Chinese subtitles in VTT format from:
https://www.youtube.com/watch?v=dQw4w9WgXcQ
Language code: zh-Hans
```

### Example 4: Fetch Plain Text Content

```
Please fetch plain text subtitles from:
https://youtu.be/dQw4w9WgXcQ
Format: TXT
```

## 📊 Output Format Examples

### JSON Format

```json
[
  {
    "text": "Hello world",
    "start": 0,
    "end": 2000,
    "duration": 2000
  },
  {
    "text": "Welcome to YouTube",
    "start": 2000,
    "end": 5000,
    "duration": 3000
  }
]
```

### SRT Format

```srt
1
00:00:00,000 --> 00:00:02,000
Hello world

2
00:00:02,000 --> 00:00:05,000
Welcome to YouTube
```

### VTT Format

```vtt
WEBVTT

00:00:00.000 --> 00:00:02.000
Hello world

00:00:02.000 --> 00:00:05.000
Welcome to YouTube
```

### TXT Format

```text
Hello world
Welcome to YouTube
This is a subtitle example
```

## 🏗️ Project Structure

```
youtube-subtitle-mcp/
├── src/
│   ├── index.ts              # stdio mode entry (recommended for local use)
│   ├── httpServer.ts         # HTTP mode entry (for server deployment)
│   └── tools/
│       ├── fetchYoutubeSubtitles.ts  # Main tool implementation
│       ├── formatters.ts     # Format converters (SRT/VTT/TXT/JSON)
│       └── utils.ts          # Utility functions
├── build/                    # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
└── README.md
```

## 📚 Development

### Build

```bash
npm run build
```

### Watch Mode

```bash
npm run watch
```

### Start stdio Mode

```bash
npm run start:stdio
```

### Start HTTP Mode

```bash
npm run start:http
```

### Custom Port (HTTP Mode)

```bash
PORT=8080 npm run start:http
```

## 🐳 Docker Deployment

### Using Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start:http"]
```

```bash
# Build image
docker build -t youtube-subtitle-mcp .

# Run container
docker run -d -p 3000:3000 --name youtube-mcp youtube-subtitle-mcp
```

### Using Docker Compose

```yaml
version: '3.8'
services:
  youtube-subtitle-mcp:
    build: .
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
    restart: unless-stopped
```

```bash
docker-compose up -d
```

## 🚀 Deployment

### PM2 (Process Manager)

```bash
# Install PM2
npm install -g pm2

# Start service
pm2 start build/httpServer.js --name youtube-subtitle-mcp

# View status
pm2 status

# View logs
pm2 logs youtube-subtitle-mcp

# Restart
pm2 restart youtube-subtitle-mcp

# Stop
pm2 stop youtube-subtitle-mcp
```

## 🔍 API Reference

### Health Check (HTTP Mode)

**Endpoint:** `GET /health`

**Response:**

```json
{
  "status": "healthy",
  "transport": "streamable-http",
  "activeSessions": 0,
  "name": "youtube-subtitle-mcp",
  "version": "1.0.0",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### MCP Endpoint (HTTP Mode)

**Endpoint:** `POST /mcp`

**Headers:**
- `Content-Type: application/json`
- `Mcp-Session-Id: <session-id>` (after initialization)

**Request Body:** JSON-RPC 2.0 format

## ⚠️ Notes

1. **Public videos only**: Cannot fetch subtitles from private or restricted videos
2. **Subtitles required**: Video must have available subtitles (auto-generated or uploaded)
3. **Language codes**: If specified language doesn't exist, an error will be returned
4. **Network required**: Requires stable network connection to access YouTube
5. **Terms of Service**: Please comply with YouTube's Terms of Service, use for research/analysis purposes only

## ❓ FAQ

### Q: Server started but client can't connect?

A: Check the following:
1. Verify server is running: visit `http://localhost:3000/health`
2. Check URL in configuration file: `http://localhost:3000/mcp`
3. Ensure firewall isn't blocking port 3000
4. Restart Cursor/Claude Desktop

### Q: Why can't I fetch subtitles?

A: Possible reasons:
- Video has no subtitles
- Video is private or region-restricted
- Specified language code doesn't exist
- Network connection issue
- Server network can't access YouTube

### Q: Do you support auto-generated subtitles?

A: Yes, supports YouTube auto-generated subtitles.

### Q: Can I batch process multiple videos?

A: Current version processes one video at a time. For batch processing, loop the tool call on the client side.

### Q: What's the timestamp unit?

A: Timestamps in JSON format are in milliseconds (ms).

### Q: Can I deploy on a remote server?

A: Yes! Just:
1. Install Node.js on remote server
2. Clone project and run `npm install`
3. Start server with `npm run start:http`
4. Use remote URL in client configuration: `http://your-server:3000/mcp`
5. Recommend using HTTPS and reverse proxy (e.g., Nginx) for security

### Q: How to change port?

A: Two methods:
1. Environment variable: `PORT=8080 npm run start:http`
2. Create `.env` file: add `PORT=8080`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Xingyu Chen**

- LinkedIn: [https://www.linkedin.com/in/xingyu-chen-b5b3b0313/](https://www.linkedin.com/in/xingyu-chen-b5b3b0313/)
- Email: guangxiangdebizi@gmail.com
- GitHub: [https://github.com/guangxiangdebizi/](https://github.com/guangxiangdebizi/)
- NPM: [https://www.npmjs.com/~xingyuchen](https://www.npmjs.com/~xingyuchen)

## 🙏 Acknowledgments

- [Model Context Protocol](https://modelcontextprotocol.io) - MCP SDK
- [youtubei.js](https://www.npmjs.com/package/youtubei.js) - Powerful YouTube API wrapper for reliable subtitle extraction

## 📮 Support

If you have any questions or suggestions, please create an [Issue](https://github.com/guangxiangdebizi/youtube-subtitle-mcp/issues).

---

Made with ❤️ by Xingyu Chen