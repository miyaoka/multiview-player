import { describe, it, expect } from "vitest";
import { getYouTubeVideoId, getThumbnailById } from "./youtube";

describe("getYouTubeVideoId", () => {
  it("watch URL からIDを取得できる", () => {
    expect(
      getYouTubeVideoId("https://www.youtube.com/watch?v=abc123")
    ).toBe("abc123");
  });

  it("パラメータ付き watch URL でも ID を取得できる", () => {
    expect(
      getYouTubeVideoId("https://www.youtube.com/watch?v=abc123&t=30s")
    ).toBe("abc123");
  });

  it("クエリの順序が違っても ID を取得できる", () => {
    expect(
      getYouTubeVideoId("https://www.youtube.com/watch?t=30s&v=abc123")
    ).toBe("abc123");
  });

  it("embed URL からIDを取得できる", () => {
    expect(
      getYouTubeVideoId("https://www.youtube.com/embed/abc123")
    ).toBe("abc123");
  });

  it("youtu.be URL からIDを取得できる", () => {
    expect(getYouTubeVideoId("https://youtu.be/abc123")).toBe("abc123");
  });

  it("v URL からIDを取得できる", () => {
    expect(getYouTubeVideoId("https://www.youtube.com/v/abc123")).toBe(
      "abc123"
    );
  });

  it("live URL からIDを取得できる", () => {
    expect(getYouTubeVideoId("https://www.youtube.com/live/abc123")).toBe(
      "abc123"
    );
  });
});

describe("getThumbnailById", () => {
  it("正しいURLを生成する", () => {
    expect(getThumbnailById("abc123", "")).toBe(
      "https://i.ytimg.com/vi/abc123/default.jpg"
    );
    expect(getThumbnailById("abc123", "mq")).toBe(
      "https://i.ytimg.com/vi/abc123/mqdefault.jpg"
    );
  });
});
