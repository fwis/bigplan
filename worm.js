class Worm {
  constructor(wormMesh, world, showBoundary) {
    this.wormMesh = wormMesh;
    this.world = world;
    this.showBoundary = showBoundary;
    this.wormMesh.showBoundingBox = false;
    this.eatCooldown = 0;
    this.cellIndex = -1;
  }

  get Name() {
    return this.wormMesh.Id;
  }

  Move() {
    // 随机调整虫子的方向
    this.wormMesh.rotation.y += (Math.random() * Math.PI) / 4 - Math.PI / 8;

    // 定义虫子的长度和速度
    const wormLen = 8;
    var speed = this.world.WormSpeed;
    const vx = wormLen * Math.cos(this.wormMesh.rotation.y);
    const vz = wormLen * Math.sin(this.wormMesh.rotation.y);
    var v = new BABYLON.Vector3(-vx, 0, vz);

    // 计算下一个位置
    var nextPosition = this.wormMesh.position.add(v.scale(speed));

    // 更新Uniform Grid中的位置
    this.world.uniformGrid.update(this);

    // 获取邻近单元格的虫子
    const neighbors = this.world.uniformGrid.getNeighbors(this);
    let collided = false;

    // 遍历邻居进行碰撞检测
    for (const neighbor of neighbors) {
        if (neighbor !== this) {
            const dx = nextPosition.x - neighbor.wormMesh.position.x;
            const dz = nextPosition.z - neighbor.wormMesh.position.z;
            const distance = Math.sqrt(dx * dx + dz * dz);
            if (distance < 8) { // 假设虫子的直径为8
                collided = true;
                break;
            }
        }
    }

    // 如果没有碰撞，更新虫子的位置
    if (!collided) {
        this.wormMesh.position = nextPosition;
    } else {
        // 如果发生碰撞，选择一个避让方向
        const avoidDirections = [Math.PI / 2, -Math.PI / 2, Math.PI, -Math.PI];
        const chosenDirection = avoidDirections[Math.floor(Math.random() * avoidDirections.length)];
        this.wormMesh.rotation.y += chosenDirection;

        // 按避让方向移动一段距离
        const retreatDistance = 2;
        this.wormMesh.position.addInPlace(
            new BABYLON.Vector3(
                Math.cos(this.wormMesh.rotation.y) * retreatDistance,
                0,
                Math.sin(this.wormMesh.rotation.y) * retreatDistance
            )
        );
    }

    // 确保虫子在世界范围内
    const boundary = this.world.WorldSize / 2 - wormLen;
    if (this.wormMesh.position.x > boundary) this.wormMesh.position.x = boundary;
    if (this.wormMesh.position.x < -boundary) this.wormMesh.position.x = -boundary;
    if (this.wormMesh.position.z > boundary) this.wormMesh.position.z = boundary;
    if (this.wormMesh.position.z < -boundary) this.wormMesh.position.z = -boundary;
}


  
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
}

  Think() {}

  Probe() {}
}
