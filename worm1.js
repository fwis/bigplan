class Worm1 {
	/**
	 * 创建虫子
	 * @param {BABYLON.Mesh} mesh 虫子的3D轮廓
	 * @param {World} world 当前世界
	 * @param {float} x 虫子的初始位置x
	 * @param {float} y 虫子的初始位置y
	 * @param {float} z 虫子的初始位置z
	 * @param {float} d 虫子的初始方位
	 * @param {BABYLON.Scene} scene
	 */
	constructor(world, mesh, x, y, z, d) {
		this.objType = "虫";
		this.name = mesh.id;
		this.world = world;
		this.mesh = mesh;

		this.mesh.position.x = 0;
		this.mesh.position.y = y;
		this.mesh.position.z = 0;

		this.mesh.checkCollisions = false;
		this.mesh.isVisible = true;
		this.mesh.showOBB = false;

		this.obb2d = new OBB2D(this, x, z, d, 5, 2, this.world.WorldSize);
		
		if (Global.ShowOBB) {
			this.obb2d.CreateDebugAABBMesh(this.world.scene, new BABYLON.Color3(1, 1, 1));
		}

		this.obb2d.ApplyToMesh();

		this.collidingBox = null;

		this.world.grid.add(this.obb2d);
		//console.log(`${this.name} added into grid!`);
		this.energy = parseInt(document.getElementById("initialWormEnergy").value) || 100;
        this.dying = false; 
        this.dead = false;  
	}

	get Mesh() {
        return this.mesh;
    }

	/*Do(index = -1, distance = 0.1) {
		this.Move(distance);
		this.Eat();
	}*/
	Do(index = -1, distance = 0.1) {
        if (this.dead) {
            console.log(`${this.name} is dead`);
            return;
        }

        if (this.dying) {
            this.world.grid.remove(this.obb2d);
            if (index < 0) {
                index = this.world.worms.indexOf(this);
            }
            this.world.worms.splice(index, 1);

            this.obb2d.Clean();
            this.mesh.dispose();
            this.mesh = undefined;

            this.dying = false;
            this.dead = true;

            console.log(`${this.name} removed from world`);
            return;
        }

        this.Move(distance);
        this.Eat();
    }

	/**
	 * 移动虫子
	 * @param {float} distance 运动距离，默认值为0.1
	 */
	Move(distance) {
		const energyPerMove = parseInt(document.getElementById("energyPerMove").value) || 1;
		
        if (this.energy <= 0) {
            this.dying = true;
            return;
        }

        this.ReduceEnergy(energyPerMove);
		
		var rotation = (Math.random() * Math.PI) / 4 - Math.PI / 8;
		if (Global.WormMoveStraight) {
			rotation = 0;
		}

		this.obb2d.Save();
		const oldCellIndices = this.world.grid._getCellIndices(this.obb2d);
		this.obb2d.Move(rotation, distance);
		const newCellIndices = this.world.grid._getCellIndices(this.obb2d);

		this.collidingBox = null;

		var potentialCollisions = null;

		if (Global.DoCollision) {
			potentialCollisions = this.world.grid.getPotentialCollision(this.obb2d, newCellIndices);

			for (const other of potentialCollisions.objects) {
				if (other !== this.obb2d) {
					//console.log(`${this.name} map colliding!`);
					if (this.obb2d.isColliding(other)) {
						if (!other.obj) {
							//console.log(`${this.name} colliding obj is empty!`);
						} else if (other.obj.dying || other.obj.dead) {
							//console.log(`${this.name} colliding obj ${other.obj.name} is dead!`);
						} else {
							this.collidingBox = other;
							break;
						}
						
						//console.log(`${this.name} object colliding!`);
					}
				}
			}
		}

		// 如果是碰撞到了虫子，保持不动，复原 obb2d
		/*
		if (this.collidingBox && this.collidingBox.objType === "虫") {
			this.obb2d.Restore();
			//console.log(`${this.name} 恢复位置!`);
		} else {
			this.world.grid.remove(this.obb2d, oldCellIndices);
			this.world.grid.add(this.obb2d, newCellIndices);
		}
		*/
		this.world.grid.remove(this.obb2d, oldCellIndices);
		this.world.grid.add(this.obb2d, newCellIndices);
		this.obb2d.ApplyToMesh();
	}

	/**
	 * 虫子吃草
	 */
	/*Eat() {
		if (this.collidingBox && this.collidingBox.obj.objType === "草") {
			//console.log(`${this.name} ${this.collidingBox.obj.name} collided, center=(${this.collidingBox.x}, ${this.collidingBox.z}), d=${this.collidingBox.d}`);
            //const energy = this.collidingBox.obj.ReduceEnergy(-1);
			
			//this.AddEnergy(energy);
			const energyGain = parseInt(document.getElementById("energyPerEat").value) || 5;
            const grass = this.collidingBox.obj;

            console.log(`Worm ${this.name} is eating grass ${grass.name}`);

            const energy = grass.ReduceEnergy(energyGain);

            console.log(`Worm ${this.name} gained ${energy} energy from grass ${grass.name}`);
		}
	}*/

	Eat() {
        if (this.collidingBox && this.collidingBox.obj.objType === "草") {
            const energyGain = this.collidingBox.obj.ReduceEnergy(5);

            this.AddEnergy(energyGain);
           // console.log(`${this.name} gained ${energyGain} energy from eating grass ${this.collidingBox.obj.name}`);
        }
    }

	 /**
     * 减少虫子的能量
     * @param {number} amount 要减少的能量
     */
	 ReduceEnergy(amount) {
        const oldEnergy = this.energy;
        this.energy -= amount;

        console.log(`${this.name} energy reduced from ${oldEnergy} to ${this.energy}`);

        if (this.energy <= 0) {
            this.dying = true;
            console.log(`${this.name} is dying`);
        }
    }

    /**
     * 增加虫子的能量
     * @param {number} amount 要增加的能量
     */
    AddEnergy(amount) {
        this.energy += amount;
       // console.log(`${this.name} energy increased to ${this.energy}`);
    }
}
