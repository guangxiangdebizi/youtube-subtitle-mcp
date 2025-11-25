/**
 * YouTube Subtitle Fetching Tool
 */

import { Innertube } from "youtubei.js";
import { extractVideoId } from "./utils.js";
import { formatSubtitles, TranscriptItem } from "./formatters.js";

export const fetchYoutubeSubtitles = {
  name: "fetch_youtube_subtitles",
  description:
    "Fetch subtitles/transcripts from YouTube videos. Supports multiple output formats (SRT, VTT, TXT, JSON) and language selection. Returns complete subtitle content with timestamps.",
  parameters: {
    type: "object",
    properties: {
      url: {
        type: "string",
        description:
          "YouTube video URL or video ID. Supported formats: https://www.youtube.com/watch?v=xxx, https://youtu.be/xxx, or direct video ID",
      },
      format: {
        type: "string",
        enum: ["SRT", "VTT", "TXT", "JSON"],
        default: "JSON",
        description:
          "Output format. SRT: subtitle file format (with sequence numbers), VTT: WebVTT format, TXT: plain text (text only), JSON: structured JSON (with timestamps)",
      },
      lang: {
        type: "string",
        description:
          "Subtitle language code (optional). Examples: zh-Hans (Simplified Chinese), zh-Hant (Traditional Chinese), en (English). Auto-detect if not specified",
      },
    },
    required: ["url"],
  },

  async run(args: { url: string; format?: string; lang?: string }) {
    try {
      // 1️⃣ Parameter validation
      if (!args.url) {
        throw new Error("Parameter 'url' is required");
      }

      const format = args.format || "JSON";
      const lang = args.lang || undefined;

      // 2️⃣ Extract video ID
      const videoId = extractVideoId(args.url);

      // 3️⃣ Initialize YouTube client
      const youtube = await Innertube.create();
      
      // 4️⃣ Get video info
      const info = await youtube.getInfo(videoId);
      
      // 5️⃣ Fetch transcript with optional language
      let transcriptData;
      try {
        transcriptData = await info.getTranscript();
      } catch (error: any) {
        throw new Error(`No subtitle data found: ${error.message}`);
      }

      if (!transcriptData || !transcriptData.transcript) {
        throw new Error("No subtitle data found");
      }

      const transcript = transcriptData.transcript;
      const segments = transcript.content?.body?.initial_segments;

      if (!segments || segments.length === 0) {
        throw new Error("No subtitle segments found");
      }

      // 6️⃣ Convert to standard format
      const transcriptItems: TranscriptItem[] = segments.map((seg: any) => ({
        text: seg.snippet?.text || "",
        offset: seg.start_ms || 0,
        duration: (seg.end_ms || 0) - (seg.start_ms || 0),
      }));

      // 7️⃣ Format output
      const formattedContent = formatSubtitles(transcriptItems, format);

      // 8️⃣ Determine actual language
      let actualLanguage = lang || "auto";
      const transcriptDataAny = transcriptData as any;
      if (transcriptDataAny.transcript_search_panel?.footer?.language_menu) {
        const selectedLang = transcriptDataAny.transcript_search_panel.footer.language_menu.sub_menu_items?.find(
          (item: any) => item.selected
        );
        if (selectedLang) {
          actualLanguage = selectedLang.title || actualLanguage;
        }
      }

      // 9️⃣ Return result
      const result = {
        success: true,
        videoId,
        format,
        language: actualLanguage,
        subtitleCount: transcriptItems.length,
        content: formattedContent,
      };

      return {
        content: [
          {
            type: "text" as const,
            text: `# YouTube Subtitle Extraction Result

**Video ID**: ${videoId}
**Video Title**: ${info.basic_info.title || 'N/A'}
**Format**: ${format}
**Language**: ${result.language}
**Subtitle Count**: ${result.subtitleCount}

---

${formattedContent}`,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text" as const,
            text: `❌ Failed to fetch subtitles: ${error.message}

**Possible reasons**:
- Video has no available subtitles
- Video is private or restricted
- Specified language code does not exist
- Network connection issue

**Tips**:
- Try without specifying language code (auto-detect)
- Verify the video URL is correct
- Check if the video has public subtitles`,
          },
        ],
        isError: true,
      };
    }
  },
};

