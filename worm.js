class Worm {
	constructor(wormMesh, world, showBoundary, grid) {
		this.wormMesh = wormMesh;
		this.world = world;
		this.showBoundary = showBoundary;
		this.wormMesh.showBoundingBox = false;
		this.eatCooldown = 0;
		this.grid = grid;
		this.occupiedCells = [];
	}

	get Name() {
		return this.wormMesh.Id;
	}

	Move() {
		const wormLen = 8;
		const speed = this.world.WormSpeed;

		// 随机更新方向（但不改变 wormMesh 的实际方向）
		const rotation = (Math.random() * Math.PI) / 4 - Math.PI / 8;
		const direction = this.wormMesh.rotation.y + rotation;

		// 计算速度向量的 x 和 z 分量
		const vx = wormLen * Math.cos(direction);
		const vz = wormLen * Math.sin(direction);

		// 创建速度向量
		const v = new BABYLON.Vector3(-vx, 0, vz);

		// 计算新的位置（基于速度向量）
		const position = this.wormMesh.position.add(v.scale(speed));


		// 获取 BoundingBox
		const boundingBox = this.wormMesh.getBoundingInfo().boundingBox;
		const center = boundingBox.centerWorld;

		// 旋转 BoundingBox
		const rotationMatrix = Matrix.RotationY(Math.PI / 4); // 旋转 45 度
		const transformedCorners = boundingBox.corners.map(corner => {
			const localPoint = Vector3.TransformCoordinates(corner, mesh.getWorldMatrix());
			return Vector3.TransformCoordinates(localPoint, rotationMatrix);
		});

		// 平移 BoundingBox
		const forwardVector = new Vector3(0, 0, 1); // 假设沿 Z 轴前进
		const distance = 10;
		const translationMatrix = Matrix.Translation(forwardVector.x * distance, forwardVector.y * distance, forwardVector.z * distance);

		const translatedCorners = transformedCorners.map(corner => Vector3.TransformCoordinates(corner, translationMatrix));

	}

	Move() {
		const wormLen = 8;
		const speed = this.world.WormSpeed;

		// 随机调整虫子的方向
		this.wormMesh.rotation.y += (Math.random() * Math.PI) / 4 - Math.PI / 8;

		let direction = this.wormMesh.rotation.y;
		let newPosition;
		let collisionDetected = false;

		// 移除对象在旧网格中的位置
		this.occupiedCells.forEach(cell => this.grid.remove(this, cell.cellX, cell.cellZ));

		do {
			const vx = wormLen * Math.cos(direction);
			const vz = wormLen * Math.sin(direction);
			const v = new BABYLON.Vector3(-vx, 0, vz);
			newPosition = this.wormMesh.position.add(v.scale(speed));

			const nextBoundingBox = new BABYLON.BoundingBox(
				newPosition.subtract(this.wormMesh.scaling.scale(0.5)),
				newPosition.add(this.wormMesh.scaling.scale(0.5))
			);

			collisionDetected = this.grid.getObjectsInCell(newPosition.x, newPosition.z).some(object => {
				if (object !== this) {
					const otherBoundingBox = object.wormMesh.getBoundingInfo().boundingBox;
					return BABYLON.BoundingBox.Intersects(nextBoundingBox, otherBoundingBox);
				}
				return false;
			});

			if (collisionDetected) {
				// 如果发生碰撞，则选择一个随机方向并移动一段距离
				const avoidDirections = [Math.PI / 2, -Math.PI / 2, Math.PI, -Math.PI];
				direction = this.wormMesh.rotation.y + avoidDirections[Math.floor(Math.random() * avoidDirections.length)];
				const retreatDistance = 2;
				newPosition = this.wormMesh.position.add(new BABYLON.Vector3(
					Math.cos(direction) * retreatDistance,
					0,
					Math.sin(direction) * retreatDistance
				));
				break;
			}
		} while (collisionDetected);

		// 更新虫子的位置和旋转
		this.wormMesh.rotation.y = direction;
		this.wormMesh.position = newPosition;

		const boundary = this.world.WorldSize / 2 - wormLen;

		// 边界检查并调整位置
		if (this.wormMesh.position.x > boundary) {
			this.wormMesh.position.x = boundary;
		}
		if (this.wormMesh.position.x < -boundary) {
			this.wormMesh.position.x = -boundary;
		}
		if (this.wormMesh.position.z > boundary) {
			this.wormMesh.position.z = boundary;
		}
		if (this.wormMesh.position.z < -boundary) {
			this.wormMesh.position.z = -boundary;
		}

		// 更新网格中的对象位置
		this.occupiedCells = BoundingBoxUtils.getOccupiedCells(this.wormMesh.getBoundingInfo().boundingBox, this.grid);
		this.occupiedCells.forEach(cell => this.grid.add(this, cell.cellX, cell.cellZ));
	}

	/*
	Eat() {
	  if (this.eatCooldown > 0) {
		this.eatCooldown--;
		return;
	  }
  
	  const wormBoundingBox = this.wormMesh.getBoundingInfo().boundingBox;
  
	  var i = this.world.grasses.length;
	  while (i--) {
		const grass = this.world.grasses[i];
		const grassBoundingBox = grass.grassMesh.getBoundingInfo().boundingBox;
		const intersects = BABYLON.BoundingBox.Intersects(
		  wormBoundingBox,
		  grassBoundingBox
		);
  
		if (intersects) {
		  if (grass.grassMesh.name.startsWith("grassDense")) {
			this.world.CreateSingleGrass(
			  grass.grassMesh.position.x,
			  grass.grassMesh.position.z,
			  grass.grassMesh.rotation.y
			);
		  } else if (grass.grassMesh.name.startsWith("grassFlower")) {
			this.world.CreateSingleGrass(
			  grass.grassMesh.position.x,
			  grass.grassMesh.position.z,
			  grass.grassMesh.rotation.y
			);
		  }
		  grass.grassMesh.dispose();
		  this.world.grasses.splice(i, 1);
  
		  this.world.grassRespawnFrames.push({
			x: grass.grassMesh.position.x,
			z: grass.grassMesh.position.z,
			frame: this.world.frameCounter + this.world.respawnFrames,
		  });
  
		  this.eatCooldown = 50; // 设置冷却时间为50帧
		}
	  }
	}
  
	Attack() {
	  // 获取邻近单元格的虫子
	  const neighbors = this.world.uniformGrid.getNeighbors(this);
	  let collidedWorm = null;
  
	  // 碰撞检测
	  for (const neighbor of neighbors) {
		  if (neighbor !== this) {
			  const dx = this.wormMesh.position.x - neighbor.wormMesh.position.x;
			  const dz = this.wormMesh.position.z - neighbor.wormMesh.position.z;
			  const distance = Math.sqrt(dx * dx + dz * dz);
			  if (distance < 8) { // 假设虫子的直径为8
				  collidedWorm = neighbor;
				  break;
			  }
		  }
	  }
  
	  if (collidedWorm) {
		  // 随机选择一只虫子死亡
		  const wormToDie = Math.random() < 0.5 ? this : collidedWorm;
  
		  // 删除死亡的虫子
		  wormToDie.wormMesh.dispose();
		  const index = this.world.worms.indexOf(wormToDie);
		  if (index > -1) {
			  this.world.worms.splice(index, 1);
		  }
  
		  // 从Uniform Grid中移除死亡的虫子
		  this.world.uniformGrid.remove(wormToDie);
	  }
  }*/

	Think() { }

	Probe() { }
}
