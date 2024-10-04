import { describe, it, expect } from "vitest";
import { calculateVideoRects } from "./canvas";

describe("calculateVideoRects", () => {
  it("1つ", () => {
    const result = calculateVideoRects({
      containerWidth: 400,
      containerHeight: 200,
      videoAspectRatio: 2,
      videoCount: 1,
    });
    expect(result).toEqual([
      { x: 0, y: 0, width: 400, height: 200, videoWidth: 400, videoHeight: 200 },
    ]);
  });
  it("ぴったり横並び", () => {
    const result = calculateVideoRects({
      containerWidth: 600,
      containerHeight: 100,
      videoAspectRatio: 2,
      videoCount: 3,
    });
    expect(result).toEqual([
      { x: 0, y: 0, width: 200, height: 100, videoWidth: 200, videoHeight: 100 },
      { x: 200, y: 0, width: 200, height: 100, videoWidth: 200, videoHeight: 100 },
      { x: 400, y: 0, width: 200, height: 100, videoWidth: 200, videoHeight: 100 },
    ]);
  });
  it("ぴったり縦並び", () => {
    const result = calculateVideoRects({
      containerWidth: 200,
      containerHeight: 300,
      videoAspectRatio: 2,
      videoCount: 3,
    });
    expect(result).toEqual([
      { x: 0, y: 0, width: 200, height: 100, videoWidth: 200, videoHeight: 100 },
      { x: 0, y: 100, width: 200, height: 100, videoWidth: 200, videoHeight: 100 },
      { x: 0, y: 200, width: 200, height: 100, videoWidth: 200, videoHeight: 100 },
    ]);
  });
  it("ぴったり折り返し", () => {
    const result = calculateVideoRects({
      containerWidth: 400,
      containerHeight: 200,
      videoAspectRatio: 2,
      videoCount: 4,
    });
    expect(result).toEqual([
      { x: 0, y: 0, width: 200, height: 100, videoWidth: 200, videoHeight: 100 },
      { x: 200, y: 0, width: 200, height: 100, videoWidth: 200, videoHeight: 100 },
      { x: 0, y: 100, width: 200, height: 100, videoWidth: 200, videoHeight: 100 },
      { x: 200, y: 100, width: 200, height: 100, videoWidth: 200, videoHeight: 100 },
    ]);
  });
  it("折り返しで余り", () => {
    const result = calculateVideoRects({
      containerWidth: 400,
      containerHeight: 200,
      videoAspectRatio: 2,
      videoCount: 3,
    });
    expect(result).toEqual([
      { x: 0, y: 0, width: 200, height: 100, videoWidth: 200, videoHeight: 100 },
      { x: 200, y: 0, width: 200, height: 100, videoWidth: 200, videoHeight: 100 },
      { x: 0, y: 100, width: 400, height: 100, videoWidth: 200, videoHeight: 100 },
    ]);
  });
  it("折返しより横並びを優先", () => {
    const result = calculateVideoRects({
      containerWidth: 600,
      containerHeight: 100,
      videoAspectRatio: 2,
      videoCount: 4,
    });
    expect(result).toEqual([
      { x: 0, y: 0, width: 150, height: 100, videoWidth: 150, videoHeight: 75 },
      { x: 150, y: 0, width: 150, height: 100, videoWidth: 150, videoHeight: 75 },
      { x: 300, y: 0, width: 150, height: 100, videoWidth: 150, videoHeight: 75 },
      { x: 450, y: 0, width: 150, height: 100, videoWidth: 150, videoHeight: 75 },
    ]);
  });
  it("横並びより折り返しを優先", () => {
    const result = calculateVideoRects({
      containerWidth: 600,
      containerHeight: 100,
      videoAspectRatio: 2,
      videoCount: 7,
    });
    const expectResult = expect(result);
    // 横並びにした場合より、折り返しにした場合の方がvideoの面積を最大化できる
    expectResult.not.toEqual([
      { x: 0, y: 0, width: 85, height: 100, videoWidth: 85, videoHeight: 42.5 },
      { x: 85, y: 0, width: 85, height: 100, videoWidth: 85, videoHeight: 42.5 },
      { x: 170, y: 0, width: 85, height: 100, videoWidth: 85, videoHeight: 42.5 },
      { x: 255, y: 0, width: 85, height: 100, videoWidth: 85, videoHeight: 42.5 },
      { x: 340, y: 0, width: 85, height: 100, videoWidth: 85, videoHeight: 42.5 },
      { x: 425, y: 0, width: 85, height: 100, videoWidth: 85, videoHeight: 42.5 },
      { x: 510, y: 0, width: 85, height: 100, videoWidth: 85, videoHeight: 42.5 },
    ]);
    // 折り返した場合
    expectResult.toEqual([
      { x: 0, y: 0, width: 150, height: 50, videoWidth: 100, videoHeight: 50 },
      { x: 150, y: 0, width: 150, height: 50, videoWidth: 100, videoHeight: 50 },
      { x: 300, y: 0, width: 150, height: 50, videoWidth: 100, videoHeight: 50 },
      { x: 450, y: 0, width: 150, height: 50, videoWidth: 100, videoHeight: 50 },
      { x: 0, y: 50, width: 200, height: 50, videoWidth: 100, videoHeight: 50 },
      { x: 200, y: 50, width: 200, height: 50, videoWidth: 100, videoHeight: 50 },
      { x: 400, y: 50, width: 200, height: 50, videoWidth: 100, videoHeight: 50 },
    ]);
  });
  it("折り返しより縦並びを優先", () => {
    const result = calculateVideoRects({
      containerWidth: 200,
      containerHeight: 300,
      videoAspectRatio: 2,
      videoCount: 4,
    });
    const expectResult = expect(result);
    // 折り返しにした場合より、縦並びにした場合の方がvideoの面積を最大化できる
    expect(result).not.toEqual([
      { x: 0, y: 0, width: 100, height: 150, videoWidth: 100, videoHeight: 50 },
      { x: 100, y: 0, width: 100, height: 150, videoWidth: 100, videoHeight: 50 },
      { x: 0, y: 150, width: 100, height: 150, videoWidth: 100, videoHeight: 50 },
      { x: 100, y: 150, width: 100, height: 150, videoWidth: 100, videoHeight: 50 },
    ]);
    // 縦並びにした場合
    expectResult.toEqual([
      { x: 0, y: 0, width: 200, height: 75, videoWidth: 150, videoHeight: 75 },
      { x: 0, y: 75, width: 200, height: 75, videoWidth: 150, videoHeight: 75 },
      { x: 0, y: 150, width: 200, height: 75, videoWidth: 150, videoHeight: 75 },
      { x: 0, y: 225, width: 200, height: 75, videoWidth: 150, videoHeight: 75 },
    ]);
  });

  it("縦並びより折り返しを優先", () => {
    const result = calculateVideoRects({
      containerWidth: 200,
      containerHeight: 300,
      videoAspectRatio: 2,
      videoCount: 7,
    });
    const expectResult = expect(result);
    // 縦並びにした場合より、折り返しにした場合の方がvideoの面積を最大化できる
    expectResult.not.toEqual([
      { x: 0, y: 0, width: 200, height: 42, videoWidth: 84, videoHeight: 42 },
      { x: 0, y: 42, width: 200, height: 42, videoWidth: 84, videoHeight: 42 },
      { x: 0, y: 84, width: 200, height: 42, videoWidth: 84, videoHeight: 42 },
      { x: 0, y: 126, width: 200, height: 42, videoWidth: 84, videoHeight: 42 },
      { x: 0, y: 168, width: 200, height: 42, videoWidth: 84, videoHeight: 42 },
      { x: 0, y: 210, width: 200, height: 42, videoWidth: 84, videoHeight: 42 },
      { x: 0, y: 252, width: 200, height: 42, videoWidth: 84, videoHeight: 42 },
    ]);
    // 折り返した場合
    expectResult.toEqual([
      { x: 0, y: 0, width: 100, height: 75, videoWidth: 100, videoHeight: 50 },
      { x: 100, y: 0, width: 100, height: 75, videoWidth: 100, videoHeight: 50 },
      { x: 0, y: 75, width: 100, height: 75, videoWidth: 100, videoHeight: 50 },
      { x: 100, y: 75, width: 100, height: 75, videoWidth: 100, videoHeight: 50 },
      { x: 0, y: 150, width: 100, height: 75, videoWidth: 100, videoHeight: 50 },
      { x: 100, y: 150, width: 100, height: 75, videoWidth: 100, videoHeight: 50 },
      { x: 0, y: 225, width: 200, height: 75, videoWidth: 150, videoHeight: 75 },
    ]);
  });
});
