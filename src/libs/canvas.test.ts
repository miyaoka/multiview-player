import { describe, it, expect } from "vitest";
import {
  calculateArea,
  calculateAreaInCell,
  calculateOptimalCellCount,
  enumerateCellCounts,
} from "./canvas";

describe("calculateOptimalCellCount", () => {
  it("", () => {
    const result = calculateOptimalCellCount(800, 100, 2, 4);
    expect(result).toEqual({ rows: 4, cols: 1 });
  });
  it("", () => {
    const result = calculateOptimalCellCount(700, 100, 2, 4);
    expect(result).toEqual({ rows: 4, cols: 1 });
  });
});

describe("calculateArea", () => {
  it("800x100, 4x1", () => {
    const result = calculateArea({
      containerWidth: 800,
      containerHeight: 100,
      aspectRatio: 2,
      rows: 4,
      cols: 1,
    });
    expect(result).toEqual({ width: 200, height: 100 });
  });
  it("800x100, 3x2", () => {
    const result = calculateArea({
      containerWidth: 800,
      containerHeight: 100,
      aspectRatio: 2,
      rows: 3,
      cols: 2,
    });
    expect(result).toEqual({ width: 100, height: 50 });
  });
  it("800x100, 2x2", () => {
    const result = calculateArea({
      containerWidth: 800,
      containerHeight: 100,
      aspectRatio: 2,
      rows: 2,
      cols: 2,
    });
    expect(result).toEqual({ width: 100, height: 50 });
  });
  it("800x100, 1x4", () => {
    const result = calculateArea({
      containerWidth: 800,
      containerHeight: 100,
      aspectRatio: 2,
      rows: 1,
      cols: 4,
    });
    expect(result).toEqual({ width: 50, height: 25 });
  });

  it("200x200, 2/1 4x1", () => {
    const result = calculateArea({
      containerWidth: 200,
      containerHeight: 200,
      aspectRatio: 2,
      rows: 4,
      cols: 1,
    });
    expect(result).toEqual({ width: 50, height: 25 });
  });
  it("200x200, 2/1 3x2", () => {
    const result = calculateArea({
      containerWidth: 200,
      containerHeight: 200,
      aspectRatio: 2,
      rows: 3,
      cols: 2,
    });
    expect(result).toEqual({ width: 200 / 3, height: 100 / 3 });
  });
  it("200x200, 2/1 2x2", () => {
    const result = calculateArea({
      containerWidth: 200,
      containerHeight: 200,
      aspectRatio: 2,
      rows: 2,
      cols: 2,
    });
    expect(result).toEqual({ width: 100, height: 50 });
  });
  it("200x200, 2/1 2x3", () => {
    const result = calculateArea({
      containerWidth: 200,
      containerHeight: 200,
      aspectRatio: 2,
      rows: 2,
      cols: 3,
    });
    expect(result).toEqual({ width: 100, height: 50 });
  });
  it("200x200, 2/1 1x4", () => {
    const result = calculateArea({
      containerWidth: 200,
      containerHeight: 200,
      aspectRatio: 2,
      rows: 1,
      cols: 4,
    });
    expect(result).toEqual({ width: 100, height: 50 });
  });
});
describe("calculateAreaInCell", () => {
  it("cellのaspect ratioのほうが大きい場合、cellの高さに合わせる", () => {
    const result = calculateAreaInCell(300, 100, 2);
    expect(result).toEqual({ width: 200, height: 100 });
  });

  it("cellのaspect ratioのほうが小さい場合、cellの幅に合わせる", () => {
    const result = calculateAreaInCell(100, 200, 2);
    expect(result).toEqual({ width: 100, height: 50 });
  });

  it("アスペクト比が同じ場合", () => {
    const result = calculateAreaInCell(100, 100, 1);
    expect(result).toEqual({ width: 100, height: 100 });
  });

  it("cellWidthが0の場合", () => {
    const result = calculateAreaInCell(0, 100, 2);
    expect(result).toEqual({ width: 0, height: 0 });
  });

  it("cellHeightが0の場合", () => {
    const result = calculateAreaInCell(100, 0, 2);
    expect(result).toEqual({ width: 0, height: 0 });
  });

  it("アスペクト比が0の場合、エラーを返す", () => {
    expect(() => {
      calculateAreaInCell(100, 100, 0);
    }).toThrowError("aspectRatio must be greater than 0");
  });
});
describe("enumerateCellCounts", () => {
  it("countが1の場合", () => {
    const result = enumerateCellCounts({ count: 1 });
    expect(result).toEqual([{ rows: 1, cols: 1 }]);
  });

  it("countが2の場合", () => {
    const result = enumerateCellCounts({ count: 2 });
    expect(result).toEqual([
      { rows: 1, cols: 2 },
      { rows: 2, cols: 1 },
    ]);
  });

  it("countが3の場合", () => {
    const result = enumerateCellCounts({ count: 3 });
    expect(result).toEqual([
      { rows: 1, cols: 3 },
      { rows: 2, cols: 2 },
      { rows: 3, cols: 1 },
    ]);
  });

  it("countが4の場合", () => {
    const result = enumerateCellCounts({ count: 4 });
    expect(result).toEqual([
      { rows: 1, cols: 4 },
      { rows: 2, cols: 2 },
      { rows: 3, cols: 2 },
      { rows: 4, cols: 1 },
    ]);
  });

  it("countが5の場合", () => {
    const result = enumerateCellCounts({ count: 5 });
    expect(result).toEqual([
      { rows: 1, cols: 5 },
      { rows: 2, cols: 3 },
      { rows: 3, cols: 2 },
      { rows: 4, cols: 2 },
      { rows: 5, cols: 1 },
    ]);
  });
});
