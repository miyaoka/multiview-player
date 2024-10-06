type YoutubeImageQuality = "" | "mq" | "hq" | "sd" | "maxres";

const base = "https://i.ytimg.com/vi/";
export function getThumnailById(id: string, quality: YoutubeImageQuality) {
  return `${base}${id}/${quality}default.jpg`;
}

// YouTubeのURLから動画IDを取得する
// 標準URL: https://www.youtube.com/watch?v=videoId
// 短縮URL: https://youtu.be/videoId
// 埋め込みURL: https://www.youtube.com/embed/videoId
// 短縮URL: https://www.youtube.com/v/videoId
// ライブURL: https://www.youtube.com/live/videoId
const videoIdPattern = /(?:v=|\/(?:embed|v|live)\/|youtu\.be\/)([0-9A-Za-z_-]+)/;
export function getYouTubeVideoId(url: string): string | undefined {
  const videoId = url.match(videoIdPattern)?.[1];
  return videoId;
}
