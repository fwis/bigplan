class Grid {
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
