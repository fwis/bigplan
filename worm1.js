class Worm1 {
	/**
	 * 创建虫子
	 * @param {BABYLON.Mesh} wormMesh 虫子的3D轮廓
	 * @param {World} world 当前世界
	 * @param {float} x 虫子的初始位置x
	 * @param {float} y 虫子的初始位置y
	 * @param {float} z 虫子的初始位置z
	 * @param {float} d 虫子的初始方位
	 * @param {BABYLON.Scene} scene
	 */
	constructor(world, wormMesh, x, y, z, d) {
		this.name = wormMesh.id;
		this.world = world;
		this.wormMesh = wormMesh;

		this.wormMesh.position.x = 0;
		this.wormMesh.position.y = y;
		this.wormMesh.position.z = 0;

		this.wormMesh.checkCollisions = false;
		this.wormMesh.isVisible = true;
		this.wormMesh.showOBB = false;

		this.obb2d = new OBB2D(x, z, d, 5, 2, this.world.WorldSize, "虫");
		this.obb2d.AttachMesh(this.wormMesh);

		if (Global.ShowOBB) {
			this.boxMesh = BABYLON.MeshBuilder.CreateBox("box", {
				width: 1,
				depth: 1,
				height: 0.2
			}, this.world.scene);

			const material = new BABYLON.StandardMaterial("boxMaterial", this.world.scene);
			material.diffuseColor = new BABYLON.Color3(1, 1, 1);
			this.boxMesh.material = material;
			/*
			this.boxMesh.position.x = 0;
			this.boxMesh.position.y = y;
			this.boxMesh.position.z = 0;

			this.obb2d.ApplyToMesh(this.boxMesh);
			*/
			this.boxMesh.scaling = this.obb2d.aabb.maximum.subtract(this.obb2d.aabb.minimum);
			this.boxMesh.scaling.y = 1;
			this.boxMesh.position = this.obb2d.center;
		}

		this.obb2d.ApplyToMesh();

		this.collidingObject = null;

		this.world.grid.add(this.obb2d);
		//console.log(`${this.name} added into grid!`);
		if (Global.ShowOBB) {
			this.boxMesh = BABYLON.MeshBuilder.CreateBox("box", {
				width: 1,
				depth: 1,
				height: 0.2
			}, this.world.scene);

			const material = new BABYLON.StandardMaterial("boxMaterial", this.world.scene);
			material.diffuseColor = new BABYLON.Color3(1, 1, 1);
			this.boxMesh.material = material;
			/*
			this.boxMesh.position.x = 0;
			this.boxMesh.position.y = y;
			this.boxMesh.position.z = 0;

			this.obb2d.ApplyToMesh(this.boxMesh);
			*/
			this.boxMesh.scaling = this.obb2d.aabb.maximum.subtract(this.obb2d.aabb.minimum);
			this.boxMesh.scaling.y = 1;
			this.boxMesh.position = this.obb2d.center;
		}

		this.obb2d.ApplyToMesh();

		this.collidingObject = null;

		this.world.grid.add(this.obb2d);
		//console.log(`${this.name} added into grid!`);
	}

	/**
	 * 移动虫子
	 * @param {float} distance 运动距离，默认值为0.1
	 */
	Move(distance = 0.1) {
		var rotation = (Math.random() * Math.PI) / 4 - Math.PI / 8;
		if (Global.WormMoveStraight) {
			rotation = 0;
		}

		this.obb2d.Save();
		const oldCellIndices = this.world.grid._getCellIndices(this.obb2d);
		this.obb2d.Move(rotation, distance);
		const newCellIndices = this.world.grid._getCellIndices(this.obb2d);

		this.collidingObject = null;

		var potentialCollisions = null;

		if (Global.DoCollision) {
			potentialCollisions = this.world.grid.getPotentialCollision(this.obb2d, newCellIndices);

			for (const other of potentialCollisions.objects) {
				if (other !== this.obb2d) {
					//console.log(`${this.name} map colliding!`);
					if (this.obb2d.isColliding(other)) {
						this.collidingObject = other;
						//console.log(`${this.name} object colliding!`);
						break;
					}
				}
			}
		}

		// 如果是碰撞到了虫子，保持不动，复原 obb2d
		if (this.collidingObject && this.collidingObject.objType === "虫") {
			this.obb2d.Restore();
			//console.log(`${this.name} 恢复位置!`);
		} else {
			this.world.grid.remove(this.obb2d, oldCellIndices);
			this.world.grid.add(this.obb2d, newCellIndices);

			if (Global.ShowOBB) {
				//this.obb2d.ApplyToMesh(this.boxMesh);
				this.boxMesh.scaling = this.obb2d.aabb.maximum.subtract(this.obb2d.aabb.minimum);
				this.boxMesh.scaling.y = 1;
				this.boxMesh.position = this.obb2d.center;

			}
			this.obb2d.ApplyToMesh();
		}
	}

	/**
	 * 虫子吃草
	 */
	Eat() {
		const potentialCollisions = this.world.grid.getPotentialCollision(this.obb2d);

		for (const other of potentialCollisions.objects) {
			if (other !== this.obb2d && other.objType === "草") {
				if (this.obb2d.isColliding(other)) {
					this.world.removeGrass(other);
					break;
				}
			}
		}
	}
}
