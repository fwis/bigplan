class Grid {
	/**
     * 创建网格
     * @param {float} cellSize 单元格大小
     * @param {float} worldSize 世界大小
     * @param {Object} worldCenter 世界中心坐标（可选），默认在世界的中心
     */
	constructor(cellSize, worldSize, worldCenter) {
		this.cellSize = cellSize;
		this.worldSize = worldSize;
		this.rowCount = Math.ceil(this.worldSize / this.cellSize);
		this.colCount = Math.ceil(this.worldSize / this.cellSize);
		this.cells = [];
		for (var i = 0; i < this.rowCount * this.colCount; i++) {
			const cell = []; // objects
			this.cells.push(cell);
		}
		if (!worldCenter) {
			worldCenter = {x: worldSize/2, z: worldSize/2};
		}

		this.worldCenter = worldCenter;
	}

	/**
     * 获取对象所在的单元格索引
     * @param {OBB2D} object 需要获取单元格索引的对象
     * @returns {Array} 对象所在的单元格索引数组
     */
	_getCellIndices(object) {
		const aabb = object.aabb;

		const cellIndices =[];

		const minColIndex = Math.floor((aabb.minimum.x + this.worldCenter.x) / this.cellSize);
		const minRowIndex = Math.floor((aabb.minimum.z + this.worldCenter.z) / this.cellSize);

		const maxColIndex = Math.floor((aabb.maximum.x + this.worldCenter.x) / this.cellSize);
		const maxRowIndex = Math.floor((aabb.maximum.z + this.worldCenter.z) / this.cellSize);

		if (maxColIndex >= this.colCount) {
			console.log(`maxColIndex=${maxColIndex}, but colCount=${this.colCount}]`);
		}

		if (maxRowIndex >= this.rowCount) {
			console.log(`maxRowIndex=${maxRowIndex}, but rowCount=${this.rowCount}]`);
		}

		for(let colIndex = minColIndex; colIndex <= maxColIndex; colIndex++) {
			for(let rowIndex = minRowIndex; rowIndex <= maxRowIndex; rowIndex++) {
				const cellIndex = rowIndex * this.colCount + colIndex;
				cellIndices.push(cellIndex);
				//console.log(`${object.name} add into cell[${cellIndex}]`);
			}
		}
		return cellIndices;
	}

	/**
     * 将对象添加到网格中
     * @param {OBB2D} object 需要添加到网格中的对象
     * @param {Array} cellIndices 对象所在的单元格索引数组（可选）
     */
	add(object, cellIndices) {
		if (!cellIndices) {
			cellIndices = this._getCellIndices(object);
		}

		for (const cellIndex of cellIndices) {
			var objectsIncell = this.cells[cellIndex];

			if (objectsIncell) {
				objectsIncell.push(object);
			}
		}
	}

	/**
     * 从网格中移除对象
     * @param {OBB2D} object 需要从网格中移除的对象
     * @param {Array} cellIndices 对象所在的单元格索引数组（可选）
     */
	remove(object, cellIndices) {
		if (!cellIndices) {
			cellIndices = this._getCellIndices(object);
		}
		
		for (const cellIndex of cellIndices) {
			const objectsInCell = this.cells[cellIndex];

			const indexToRemove = objectsInCell.indexOf(object);
			if (indexToRemove > -1) {
				objectsInCell.splice(indexToRemove, 1);
			}
		}
	}

	/**
	 * 根据当前 obb2d 获取潜在的碰撞信息
	 * @param {OBB2D} object 
	 * @returns 
	 */
	getPotentialCollision(object, cellIndices) {
		if (!cellIndices) {
			cellIndices = this._getCellIndices(object);
		}
		
		var objects = [];
		for (const cellIndex of cellIndices) {
			// console.log(`${objName} cellIndex=${cellIndex}`);
			const objectsIncell = this.cells[cellIndex];
			if (objectsIncell && objectsIncell.length > 1) {
				objects.push(...objectsIncell);
			}
		}

		return { box: object, cellIndices: cellIndices, objects: objects };
	}
}
