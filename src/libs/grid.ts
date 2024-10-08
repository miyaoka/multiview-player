interface GridDimensions {
  columns: number; // 横セル数
  rows: number; // 縦セル数
}

export interface GridCell {
  span: number;
  isHorizontal: boolean;
}

export interface GridLayout {
  contentArea: {
    total: number;
    min: number;
    max: number;
  };
  // contentAreaTotal: number;
  cellList: GridCell[];
  gridStyle: Record<string, string>;
}

// 指定したカウントで必要な縦横セル数の組み合わせを列挙
export function enumerateGridDimensions({ count }: { count: number }): GridDimensions[] {
  const results: GridDimensions[] = [];
  for (let columns = 1; columns <= count; columns++) {
    const rows = Math.ceil(count / columns);
    results.push({ columns, rows });
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

  // cellの総数
  const totalCellCount = columns * rows;
  // 余るcellの数
  const remainingCells = totalCellCount - contentCount;

  // 1列目はは余るcellの分減らしてカラム幅を広げる
  const firstRowColumnCount = columns - remainingCells;
  // 2列目以降はそのまま
  const secondRowColumnCount = columns;

  // gridのspan数を計算
  // 1列目と2列目のカラム数の最小公倍数を使って基本単位を決定
  const spanCount = getLCM(firstRowColumnCount, secondRowColumnCount);

  // cellの高さ
  const cellHeight = containerHeight / rows;

  let contentAreaTotal = 0;
  const cellList: GridCell[] = [];

  // 1列目の最大height
  const firstRowCellWidth = containerWidth / firstRowColumnCount;
  const firstRowMaxHeight = firstRowCellWidth / contentAspectRatio;

  // 2列目以降の最小height
  const secondRowCellWidth = containerWidth / secondRowColumnCount;
  const secondRowMinHeight = Math.min(cellHeight, secondRowCellWidth / contentAspectRatio);

  const secondRowCount = rows - 1;
  // 2列目以降の最小heightの合計
  const secondRowMinHeightTotal = secondRowCount * secondRowMinHeight;

  // 1行目の高さを決定
  const firstRowHeight =
    secondRowCount === 0
      ? containerHeight
      : Math.min(containerHeight - secondRowMinHeightTotal, firstRowMaxHeight);

  // 2行目以降の高さを決定
  const secondRowHeight = (containerHeight - firstRowHeight) / secondRowCount;

  const firstRowCellAspectRatio = firstRowCellWidth / firstRowHeight;
  const firstRowCellIsHorizontal = firstRowCellAspectRatio > contentAspectRatio;
  const firstRowContentHeight = firstRowCellIsHorizontal
    ? firstRowHeight
    : firstRowCellWidth / contentAspectRatio;
  const firstRowContentArea = firstRowContentHeight * firstRowContentHeight * contentAspectRatio;

  const secondRowCellAspectRatio = secondRowCellWidth / secondRowHeight;
  const secondRowCellIsHorizontal = secondRowCellAspectRatio > contentAspectRatio;
  const secondRowContentHeight = secondRowCellIsHorizontal
    ? secondRowHeight
    : secondRowCellWidth / contentAspectRatio;
  const secondRowContentArea = secondRowContentHeight * secondRowContentHeight * contentAspectRatio;

  // 各cellのspan数と横長フラグを計算
  for (let cellIndex = 0; cellIndex < contentCount; cellIndex++) {
    const isFirstRow = cellIndex < firstRowColumnCount;
    // cellに割り当てるspan数
    const span = spanCount / (isFirstRow ? firstRowColumnCount : secondRowColumnCount);
    const isHorizontal = isFirstRow ? firstRowCellIsHorizontal : secondRowCellIsHorizontal;
    const contentArea = isFirstRow ? firstRowContentArea : secondRowContentArea;

    cellList.push({
      span,
      isHorizontal,
    });

    contentAreaTotal += contentArea;
  }

  // グリッドテンプレート列を設定
  const gridStyle = {
    gridTemplateColumns: `repeat(${spanCount}, 1fr)`, // horizontal列
    gridTemplateRows:
      secondRowCount > 0
        ? `${firstRowHeight}px ${Array.from({ length: secondRowCount }, () => "1fr").join(" ")}`
        : "1fr", // vertical行
  };

  return {
    cellList,
    contentArea: {
      total: contentAreaTotal,
      min: secondRowContentArea,
      max: firstRowContentArea,
    },
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

// 候補の中から最適なレイアウトを選択
export function selectOptimalLayout({
  gridDimensionList,
  containerWidth,
  containerHeight,
  contentCount,
  contentAspectRatio,
}: {
  gridDimensionList: GridDimensions[];
  containerWidth: number;
  containerHeight: number;
  contentCount: number;
  contentAspectRatio: number;
}): {
  minAreaDeviation: number;
  totalAreaDeviation: number;
  minAndtotalAreaDeviation: number;
  id: string;
  layout: GridLayout;
}[] {
  const result = gridDimensionList.map((gridDimension) => {
    // gridDimensionからidを作成する
    const id = `${gridDimension.columns}x${gridDimension.rows}`;
    return {
      id,
      layout: calculateGridLayout({
        containerWidth,
        containerHeight,
        gridDimension,
        contentCount,
        contentAspectRatio,
      }),
    };
  });

  // min, totalの合計値を計算
  let minAreaSum = 0;
  let totalAreaSum = 0;
  result.forEach((item) => {
    minAreaSum += item.layout.contentArea.min;
    totalAreaSum += item.layout.contentArea.total;
  });

  // min, totalの平均値を計算
  const minAreaAverage = minAreaSum / result.length;
  const totalAreaAverage = totalAreaSum / result.length;

  // 分散を計算
  let minVariance = 0;
  let totalVariance = 0;
  result.forEach((item) => {
    minVariance += Math.pow(item.layout.contentArea.min - minAreaAverage, 2);
    totalVariance += Math.pow(item.layout.contentArea.total - totalAreaAverage, 2);
  });

  // 分散のsqrtを計算
  minVariance = Math.sqrt(minVariance / result.length);
  totalVariance = Math.sqrt(totalVariance / result.length);

  // 偏差値を計算
  const result2 = result.map((item) => {
    // minの偏差値
    const minAreaDeviation = (item.layout.contentArea.min - minAreaAverage) / minVariance;
    const totalAreaDeviation = (item.layout.contentArea.total - totalAreaAverage) / totalVariance;

    return {
      ...item,
      minAreaDeviation,
      totalAreaDeviation,
      minAndtotalAreaDeviation: minAreaDeviation + totalAreaDeviation,
    };
  });

  result2.sort((a, b) => b.minAndtotalAreaDeviation - a.minAndtotalAreaDeviation);
  console.log("result2", result2);

  return result2;
}
