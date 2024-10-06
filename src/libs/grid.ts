interface GridDimensions {
  columns: number; // 横セル数
  rows: number; // 縦セル数
}

export interface GridCell {
  span: number;
  isHorizontal: boolean;
}

export interface GridLayout {
  contentAreaTotal: number;
  cellList: GridCell[];
  gridStyle: Record<string, string>;
}

// 指定したカウントで必要な縦横セル数の組み合わせを列挙
export function enumerateGridDimensions({ count }: { count: number }): GridDimensions[] {
  const results: GridDimensions[] = [];
  for (let horizontal = 1; horizontal <= count; horizontal++) {
    const vertical = Math.ceil(count / horizontal);
    results.push({ columns: horizontal, rows: vertical });
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

export function calculateGridLayout({
  containerWidth,
  containerHeight,
  gridDimension,
  contentCount,
  contentAspectRatio,
}: {
  containerWidth: number;
  containerHeight: number;
  gridDimension: GridDimensions;
  contentCount: number;
  contentAspectRatio: number;
}): GridLayout {
  const { columns, rows } = gridDimension;

  const totalCellCount = columns * rows;
  // 余るcellの数
  const remainingCells = totalCellCount - contentCount;

  // 1列目はは余るcellの分減らしてカラム幅を広げる
  const firstRowColumns = columns - remainingCells;
  // 2列目以降はそのまま
  const otherRowColumns = columns;

  // gridのspan数を計算
  // 1列目と2列目のカラム数の最小公倍数を使って基本単位を決定
  const spanCount = getLCM(firstRowColumns, otherRowColumns);

  // グリッドテンプレート列を設定
  const gridStyle = {
    gridTemplateColumns: `repeat(${spanCount}, 1fr)`, // horizontal列
    gridTemplateRows: Array.from({ length: rows }, () => "1fr").join(" "), // vertical行
  };

  // span幅
  const spanWidth = containerWidth / spanCount;
  // cellの高さ
  const cellHeight = containerHeight / rows;

  let contentAreaTotal = 0;
  const cellList: GridCell[] = [];
  for (let v = 0; v < rows; v++) {
    for (let h = 0; h < columns; h++) {
      const cellIndex = v * columns + h;
      // cellに割り当てるspan数
      const span = spanCount / (cellIndex < firstRowColumns ? firstRowColumns : otherRowColumns);

      // セル幅とアスペクト比を算出
      const cellWidth = spanWidth * span;
      const cellAspectRatio = cellWidth / cellHeight;

      // cellがcontentより横長か
      const isHorizontal = cellAspectRatio > contentAspectRatio;

      const contentWidth = isHorizontal ? cellHeight * contentAspectRatio : cellWidth;
      const contentHeight = isHorizontal ? cellHeight : cellWidth / contentAspectRatio;

      cellList.push({
        span,
        isHorizontal,
      });

      contentAreaTotal += contentWidth * contentHeight;
    }
  }

  return {
    cellList,
    contentAreaTotal,
    gridStyle,
  };
}

// 最大公約数を求める関数
function getGCD(a: number, b: number): number {
  return b === 0 ? a : getGCD(b, a % b);
}

// 最小公倍数を求める関数
function getLCM(a: number, b: number): number {
  return (a * b) / getGCD(a, b);
}
