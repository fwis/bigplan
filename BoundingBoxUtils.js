class BoundingBoxUtils {
  static getOccupiedCells(boundingBox, grid) {
    const min = boundingBox.minimum;
    const max = boundingBox.maximum;
    const minCell = grid.getCell(min.x, min.z);
    const maxCell = grid.getCell(max.x, max.z);

    const cells = [];
    for (let i = minCell.cellX; i <= maxCell.cellX; i++) {
      for (let j = minCell.cellZ; j <= maxCell.cellZ; j++) {
        cells.push({ cellX: i, cellZ: j });
      }
    }

    return cells;
  }
}
