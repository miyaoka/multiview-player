// 最適な縦横セル数を計算
export function calculateOptimalCellCount(
  containerWidth: number,
  containerHeight: number,
  contentAspectRatio: number,
  contentCount: number,
): GridCellCount {
  const hCellCount = Math.ceil(
    Math.sqrt((contentCount * containerWidth) / containerHeight / contentAspectRatio),
  );
  const vCellCount = Math.ceil(contentCount / hCellCount);
  return { hCellCount, vCellCount };
}

interface GridCellCount {
  hCellCount: number;
  vCellCount: number;
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
export function enumerateCellCounts({ count }: { count: number }): GridCellCount[] {
  const results: GridCellCount[] = [];
  for (let horizontal = 1; horizontal <= count; horizontal++) {
    const vertical = Math.ceil(count / horizontal);
    results.push({ hCellCount: horizontal, vCellCount: vertical });
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
  canvasWidth,
  canvasHeight,
  cellCount,
  contentCount,
  contentAspectRatio,
}: {
  canvasWidth: number;
  canvasHeight: number;
  cellCount: GridCellCount;
  contentCount: number;
  contentAspectRatio: number;
}): GridLayout {
  const { hCellCount, vCellCount } = cellCount;

  // const title = `${hCellCount}x${vCellCount}`;

  const totalCellCount = hCellCount * vCellCount;
  // 余るcellの数
  const remainingCells = totalCellCount - contentCount;

  // 1列目はは余るcellの分減らしてカラム幅を広げる
  const firstRowColumns = hCellCount - remainingCells;
  // 2列目以降はそのまま
  const otherRowColumns = hCellCount;

  // gridのspan数を計算
  // 1列目と2列目のカラム数の最小公倍数を使って基本単位を決定
  const spanCount = getLCM(firstRowColumns, otherRowColumns);

  // グリッドテンプレート列を設定
  const gridStyle = {
    gridTemplateColumns: `repeat(${spanCount}, 1fr)`, // horizontal列
    gridTemplateRows: Array.from({ length: vCellCount }, () => "1fr").join(" "), // vertical行
  };

  // span幅
  const spanWidth = canvasWidth / spanCount;
  // cellの高さ
  const cellHeight = canvasHeight / vCellCount;

  let contentAreaTotal = 0;
  const cellList: GridCell[] = [];
  for (let v = 0; v < vCellCount; v++) {
    for (let h = 0; h < hCellCount; h++) {
      const cellIndex = v * hCellCount + h;
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
