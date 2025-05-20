type YoutubeImageQuality = "" | "mq" | "hq" | "sd" | "maxres";

const base = "https://i.ytimg.com/vi/";
export function getThumbnailById(id: string, quality: YoutubeImageQuality) {
  return `${base}${id}/${quality}default.jpg`;
}

// YouTube の URL から動画 ID を取得する
// 標準 URL: https://www.youtube.com/watch?v=videoId
// 短縮 URL: https://youtu.be/videoId
// 埋め込み URL: https://www.youtube.com/embed/videoId
// 短縮 URL: https://www.youtube.com/v/videoId
// ライブ URL: https://www.youtube.com/live/videoId
export function getYouTubeVideoId(url: string): string | undefined {
  try {
    const parsed = new URL(url);
    const searchId = parsed.searchParams.get("v");
    if (searchId) return searchId;

    if (parsed.hostname === "youtu.be") {
      const id = parsed.pathname.slice(1);
      return id || undefined;
    }

    const match = parsed.pathname.match(/\/(?:embed|v|live)\/([0-9A-Za-z_-]+)/);
    return match?.[1];
  } catch {
    return undefined;
  }
}
