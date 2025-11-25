/**
 * Subtitle format converters
 */

import { formatSRTTime, formatVTTTime } from "./utils.js";

export interface TranscriptItem {
  text: string;
  offset: number;
  duration: number;
}

/**
 * Convert transcript to SRT format
 */
export function convertToSRT(transcript: TranscriptItem[]): string {
  let srt = "";
  transcript.forEach((item, index) => {
    const startTime = formatSRTTime(item.offset);
    const endTime = formatSRTTime(item.offset + item.duration);

    srt += `${index + 1}\n`;
    srt += `${startTime} --> ${endTime}\n`;
    srt += `${item.text}\n\n`;
  });
  return srt.trim();
}

/**
 * Convert transcript to VTT format
 */
export function convertToVTT(transcript: TranscriptItem[]): string {
  let vtt = "WEBVTT\n\n";
  transcript.forEach((item) => {
    const startTime = formatVTTTime(item.offset);
    const endTime = formatVTTTime(item.offset + item.duration);

    vtt += `${startTime} --> ${endTime}\n`;
    vtt += `${item.text}\n\n`;
  });
  return vtt.trim();
}

/**
 * Convert transcript to plain text format
 */
export function convertToTXT(transcript: TranscriptItem[]): string {
  return transcript.map((item) => item.text).join("\n");
}

/**
 * Convert transcript to JSON format
 */
export function convertToJSON(transcript: TranscriptItem[]): string {
  const formatted = transcript.map((item) => ({
    text: item.text,
    start: item.offset,
    end: item.offset + item.duration,
    duration: item.duration,
  }));
  return JSON.stringify(formatted, null, 2);
}

/**
 * Format subtitles to specified format
 */
export function formatSubtitles(transcript: TranscriptItem[], format: string): string {
  switch (format.toUpperCase()) {
    case "SRT":
      return convertToSRT(transcript);
    case "VTT":
      return convertToVTT(transcript);
    case "TXT":
      return convertToTXT(transcript);
    case "JSON":
      return convertToJSON(transcript);
    default:
      throw new Error(`Unsupported format: ${format}. Supported formats: SRT, VTT, TXT, JSON`);
  }
}

