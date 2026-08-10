export function getAlignedPlacementIndexes(itemCount, columns, rows, alignment = 'top-left') {
  const count = Math.min(Math.max(Math.trunc(Number(itemCount)) || 0, 0), columns * rows)
  if (!count || !(columns > 0) || !(rows > 0)) return []

  const [vertical = 'top', horizontal = 'left'] = alignment.split('-')
  const usedRows = Math.ceil(count / columns)
  const rowOffset = vertical === 'bottom'
    ? rows - usedRows
    : vertical === 'middle'
      ? Math.floor((rows - usedRows) / 2)
      : 0
  const indexes = []
  let remaining = count

  for (let row = 0; row < usedRows; row += 1) {
    const rowCount = Math.min(columns, remaining)
    const columnOffset = horizontal === 'right'
      ? columns - rowCount
      : horizontal === 'center'
        ? Math.floor((columns - rowCount) / 2)
        : 0

    for (let column = 0; column < rowCount; column += 1) {
      indexes.push((rowOffset + row) * columns + columnOffset + column)
    }
    remaining -= rowCount
  }

  return indexes
}
