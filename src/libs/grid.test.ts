import { describe, it, expect } from "vitest";
import { calculateAreaInCell, enumerateGridDimensions, sortOptimalLayout } from "./grid";

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
    const result = enumerateGridDimensions({ count: 1 });
    expect(result).toEqual([{ columns: 1, rows: 1 }]);
  });

  it("countが2の場合", () => {
    const result = enumerateGridDimensions({ count: 2 });
    expect(result).toEqual([
      { columns: 1, rows: 2 },
      { columns: 2, rows: 1 },
    ]);
  });

  it("countが3の場合", () => {
    const result = enumerateGridDimensions({ count: 3 });
    expect(result).toEqual([
      { columns: 1, rows: 3 },
      { columns: 2, rows: 2 },
      { columns: 3, rows: 1 },
    ]);
  });

  it("countが4の場合", () => {
    const result = enumerateGridDimensions({ count: 4 });
    expect(result).toEqual([
      { columns: 1, rows: 4 },
      { columns: 2, rows: 2 },
      { columns: 3, rows: 2 },
      { columns: 4, rows: 1 },
    ]);
  });

  it("countが5の場合", () => {
    const result = enumerateGridDimensions({ count: 5 });
    expect(result).toEqual([
      { columns: 1, rows: 5 },
      { columns: 2, rows: 3 },
      { columns: 3, rows: 2 },
      { columns: 4, rows: 2 },
      { columns: 5, rows: 1 },
    ]);
  });
});

describe("sortOptimalLayout", () => {
  it("コンテナが16:9でコンテンツが3つの場合、最適レイアウトは2x2", () => {
    const result = sortOptimalLayout({
      containerWidth: 1920,
      containerHeight: 1080,
      contentCount: 3,
      contentAspectRatio: 16 / 9,
    });
    expect(result[0].layout.id).toBe("2x2");
    expect(result).toHaveLength(3);
    // ソート順が偏差値の降順になっているか確認
    const sorted = [...result].sort(
      (a, b) => b.minAndtotalAreaDeviation - a.minAndtotalAreaDeviation,
    );
    expect(result.map((v) => v.minAndtotalAreaDeviation)).toEqual(
      sorted.map((v) => v.minAndtotalAreaDeviation),
    );
  });
});
