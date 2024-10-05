interface CalculateVideoRectsParams {
  containerWidth: number;
  containerHeight: number;
  aspectRatio: number;
  count: number;
}

// 最適な縦横セル数を計算
export function calculateOptimalCellCount(
  containerWidth: number,
  containerHeight: number,
  aspectRatio: number,
  count: number,
): { rows: number; cols: number } {
  const rows = Math.ceil(Math.sqrt((count * containerWidth) / containerHeight / aspectRatio));
  const cols = Math.ceil(count / rows);
  return { rows, cols };
}

// 指定の縦横セル数で分割したセルに配置できる指定アスペクト比の矩形面積を計算
export function calculateArea({
  containerWidth,
  containerHeight,
  aspectRatio,
  rows,
  cols,
}: {
  containerWidth: number;
  containerHeight: number;
  aspectRatio: number;
  rows: number;
  cols: number;
}): { width: number; height: number } {
  const cellWidth = containerWidth / rows;
  const cellHeight = containerHeight / cols;

  const areaInCell = calculateAreaInCell(cellWidth, cellHeight, aspectRatio);

  return areaInCell;
}

// 指定したカウントで必要な縦横セル数の組み合わせを列挙
export function enumerateCellCounts({
  count,
}: {
  count: number;
}): { horizontal: number; vertical: number }[] {
  const results: { horizontal: number; vertical: number }[] = [];
  for (let horizontal = 1; horizontal <= count; horizontal++) {
    const vertical = Math.ceil(count / horizontal);
    results.push({ horizontal, vertical });
  }
  return results;
}

// cellの中に収められる指定アスペクト比の矩形面積
export function calculateAreaInCell(
  cellWidth: number,
  cellHeight: number,
  aspectRatio: number,
): { width: number; height: number } {
  if (aspectRatio <= 0) {
    throw new Error("aspectRatio must be greater than 0");
  }
  const cellAspectRatio = cellWidth / cellHeight;
  // cellのほうが横長
  if (cellAspectRatio > aspectRatio) {
    return {
      width: cellHeight * aspectRatio,
      height: cellHeight,
    };
  }
  // cellのほうが縦長
  return {
    width: cellWidth,
    height: cellWidth / aspectRatio,
  };
}
