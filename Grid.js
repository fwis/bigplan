class Grid {
	constructor(cellSize, worldSize) {
		this.cellSize = cellSize;
		this.worldSize = worldSize;
		this.rowCount = Math.ceil(this.worldSize / this.cellSize);
		this.colCount = Math.ceil(this.worldSize / this.cellSize);
		this.cells = [];
		for(const i=0; i < this.rowCount * this.colCount; i++) {
			const cell = []; // objects
			this.cells.push(cell);
		}
	}

	add(object) {
		const box = object.getBoundingBox();
		
		const minColIndex = (box.min.x / this.cellSize) | 0; //取整
		const minRowIndex = (box.min.z / this.cellSize) | 0; //取整
		
		const maxColIndex = (box.max.x / this.cellSize) | 0; //取整
		const maxRowIndex = (box.max.z / this.cellSize) | 0; //取整

		object.cellIndices.clear();
		for(var row = minRowIndex; row < maxRowIndex; row++) {
			for(var col = minColIndex; col < maxColIndex; col++) {
				const cellIndex = row * this.colCount + col;
				const objectsInCell = this.cells[cellIndex];
				object.cellIndices.push(cellIndex);
				objectsInCell.push(object);
			}
		}
	}

	remove(object) {
		object.cellIndices.forEach(cellIndex => {
			this.cells[cellIndex].remove(object);
		});
		
		object.cellIndices = [];
	}

	/**
	 * 更新潜在的碰撞更新碰撞地图
	 * @param {has getBoundingBox} object 
	 * @param {see getPotentialCollisionByBox return} potentialCollision 
	 */
	update(object, potentialCollision) {
		const o = object.cellIndices;
		const n = potentialCollision.cellIndices;

		const onlyInO = o.filter(item => !n.includes(item));
		onlyInO.forEach(cellIndex => {
			this.cells[cellIndex].remove(object);
		});

		const onlyInN = n.filter(item => !o.includes(item));
		onlyInN.forEach(cellIndex => {
			this.cells[cellIndex].push(object); // 是否需要考虑，多次插入相同object?
		});
	}

	/**
	 * 根据当前 BoundingBox 获取潜在的碰撞信息
	 * @param {BoundingBox} box 
	 * @returns 
	 */
	getPotentialCollisionByBox(box) {
		const minColIndex = (box.min.x / this.cellSize) | 0; //取整
		const minRowIndex = (box.min.z / this.cellSize) | 0; //取整
		
		const maxColIndex = (box.max.x / this.cellSize) | 0; //取整
		const maxRowIndex = (box.max.z / this.cellSize) | 0; //取整
		var cellIndices = [];
		var objects = [];
		for(var row = minRowIndex; row < maxRowIndex; row++) {
			for(var col = minColIndex; col < maxColIndex; col++) {
				const cellIndex = row * this.colCount + col;
				const objectsInCell = this.cells[cellIndex];
				objects.push(...objectsInCell);
				cellIndices.push(cellIndex);
			}
		}

		return {box:box, cellIndices:cellIndices, objects:objects};
	}
}
