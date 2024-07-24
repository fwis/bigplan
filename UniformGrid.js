class UniformGrid {
  constructor(cellSize, worldSize) {
    this.cellSize = cellSize;
    this.cols = Math.ceil(worldSize / cellSize);
    this.rows = Math.ceil(worldSize / cellSize);
    this.grid = Array.from({ length: this.cols * this.rows }, () => []);
    this.worldSize = worldSize; 
  }

  _getCellIndex(x, z) {
    const col = Math.floor((x + this.worldSize / 2) / this.cellSize);
    const row = Math.floor((z + this.worldSize / 2) / this.cellSize);
    return col + row * this.cols;
  }

  add(obj) {
    const cellIndex = this._getCellIndex(
      obj.wormMesh.position.x,
      obj.wormMesh.position.z
    );
    this.grid[cellIndex].push(obj);
    obj.cellIndex = cellIndex;
  }

  update(obj) {
    const newCellIndex = this._getCellIndex(
      obj.wormMesh.position.x,
      obj.wormMesh.position.z
    );
    if (newCellIndex !== obj.cellIndex) {
      this.remove(obj);
      this.grid[newCellIndex].push(obj);
      obj.cellIndex = newCellIndex;
    }
  }

  remove(obj) {
    const cell = this.grid[obj.cellIndex];
    const index = cell.indexOf(obj);
    if (index !== -1) {
      cell.splice(index, 1);
    }
  }

  getNeighbors(obj) {
    const cellIndex = obj.cellIndex;
    const neighbors = [];
    const col = cellIndex % this.cols;
    const row = Math.floor(cellIndex / this.cols);

    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        const neighborCol = col + i;
        const neighborRow = row + j;
        if (
          neighborCol >= 0 &&
          neighborCol < this.cols &&
          neighborRow >= 0 &&
          neighborRow < this.rows
        ) {
          const neighborIndex = neighborCol + neighborRow * this.cols;
          neighbors.push(...this.grid[neighborIndex]);
        }
      }
    }

    return neighbors;
  }
}
