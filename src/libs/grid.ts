interface GridDimensions {
  columns: number; // 横セル数
  rows: number; // 縦セル数
}

export interface GridCell {
  span: number;
  isHorizontal: boolean;
}

export interface GridLayout {
  id: string;
  contentArea: {
    total: number;
    min: number;
    max: number;
  };
  gridTemplate: string;
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

function repeat(str: string, count: number): string[] {
  return Array.from({ length: count }, () => str);
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
  // gridDimensionからidを作成する
  const id = `${gridDimension.columns}x${gridDimension.rows}`;

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

  const firstRowSpan = spanCount / firstRowColumnCount;
  const secondRowSpan = spanCount / secondRowColumnCount;
  // 各cellのspan数と横長フラグを計算
  let contentAreaTotal = 0;
  const spanList: string[] = [];

  // コンテンツ以外の余白を計算
  const rowSpace =
    containerHeight - (firstRowContentHeight + secondRowContentHeight * secondRowCount);

  const gridFirstRowHeight = secondRowCount > 0 ? `${firstRowHeight + rowSpace / rows}px` : "1fr";

  for (let row = 0; row < rows; row++) {
    if (row === 0) {
      const span = Array.from({ length: firstRowColumnCount }, (_, index) => {
        return repeat(`a${index}`, firstRowSpan).join(" ");
      }).join(" ");
      spanList.push(`"${span}" ${gridFirstRowHeight}`);

      contentAreaTotal += firstRowContentArea * firstRowColumnCount;
      continue;
    }
    const baseIndex = (row - 1) * secondRowColumnCount + firstRowColumnCount;
    const span = Array.from({ length: secondRowColumnCount }, (_, index) => {
      return repeat(`a${baseIndex + index}`, secondRowSpan).join(" ");
    }).join(" ");
    spanList.push(`"${span}" 1fr`);
    contentAreaTotal += secondRowContentArea * secondRowColumnCount;
  }

  return {
    id,
    contentArea: {
      total: contentAreaTotal,
      min: secondRowContentArea,
      max: firstRowContentArea,
    },
    gridTemplate: spanList.join("\n"),
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
export function sortOptimalLayout({
  containerWidth,
  containerHeight,
  contentCount,
  contentAspectRatio = 16 / 9,
}: {
  containerWidth: number;
  containerHeight: number;
  contentCount: number;
  contentAspectRatio?: number;
}): {
  minAreaDeviation: number;
  totalAreaDeviation: number;
  minAndtotalAreaDeviation: number;
  layout: GridLayout;
}[] {
  const gridDimensionList = enumerateGridDimensions({ count: contentCount });

  const result = gridDimensionList.map((gridDimension) => {
    return calculateGridLayout({
      containerWidth,
      containerHeight,
      gridDimension,
      contentCount,
      contentAspectRatio,
    });
  });

  // 平均と分散を1回のreduceで計算
  const {
    minSum,
    totalSum,
    minSquareSum,
    totalSquareSum,
  } = result.reduce(
    (acc, item) => {
      const min = item.contentArea.min;
      const total = item.contentArea.total;
      acc.minSum += min;
      acc.totalSum += total;
      acc.minSquareSum += min * min;
      acc.totalSquareSum += total * total;
      return acc;
    },
    { minSum: 0, totalSum: 0, minSquareSum: 0, totalSquareSum: 0 },
  );

  const minAreaAverage = minSum / result.length;
  const totalAreaAverage = totalSum / result.length;

  const minVariance = Math.sqrt(
    Math.max(minSquareSum / result.length - minAreaAverage ** 2, 0),
  );
  const totalVariance = Math.sqrt(
    Math.max(totalSquareSum / result.length - totalAreaAverage ** 2, 0),
  );

  // 偏差値を計算
  const result2 = result.map((item) => {
    // minareaの偏差値
    const minAreaDeviation = (item.contentArea.min - minAreaAverage) / minVariance;
    // totalareaの偏差値
    const totalAreaDeviation = (item.contentArea.total - totalAreaAverage) / totalVariance;
    // minareaとtotalareaの偏差値の合計値
    const minAndtotalAreaDeviation = minAreaDeviation + totalAreaDeviation;

    return {
      layout: item,
      minAreaDeviation,
      totalAreaDeviation,
      minAndtotalAreaDeviation,
    };
  });

  // 偏差値の合計値でソート
  result2.sort((a, b) => b.minAndtotalAreaDeviation - a.minAndtotalAreaDeviation);

  return result2;
}
