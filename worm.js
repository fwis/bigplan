class Worm {
    constructor(wormMesh, world, showBoundary) {
        this.wormMesh = wormMesh;
        this.world = world;
        this.showBoundary = showBoundary;
        this.wormMesh.showBoundingBox = false;
        this.eatCooldown = 0; // 冷却时间属性，初始化为0
    }

    get Name() {
        return this.wormMesh.Id;
    }

    Move() {
        this.wormMesh.rotation.y += Math.random() * Math.PI / 4 - Math.PI / 8;

        const wormLen = 8;
        var speed = this.world.WormSpeed;
        const vx = wormLen * Math.cos(this.wormMesh.rotation.y);
        const vz = wormLen * Math.sin(this.wormMesh.rotation.y);

        var v = new BABYLON.Vector3(-vx, 0, vz);
        this.wormMesh.position.addInPlace(v.scale(speed));

        const boundary = this.world.WorldSize / 2 - wormLen;

        if (this.wormMesh.position.x > boundary) {
            this.wormMesh.position.x = boundary;
        }
<<<<<<< HEAD

        if (this.wormMesh.position.x < -boundary) {
            this.wormMesh.position.x = -boundary;
        }

        if (this.wormMesh.position.z > boundary) {
            this.wormMesh.position.z = boundary;
        }

        if (this.wormMesh.position.z < -boundary) {
            this.wormMesh.position.z = -boundary;
        }

        // 更新四叉树中的位置
        this.world.quadTree.insert({ x: this.wormMesh.position.x, y: this.wormMesh.position.z, worm: this });
    }

    Eat() {
        if (this.eatCooldown > 0) {
            this.eatCooldown--;
            return;
        }

        const wormBoundingBox = this.wormMesh.getBoundingInfo().boundingBox;
        const range = new Rectangle(this.wormMesh.position.x, this.wormMesh.position.z, 5, 5);
        const found = this.world.quadTree.query(range);

        for (let i = 0; i < found.length; i++) {
            const grass = found[i].grass;
            if (grass) {
                const grassBoundingBox = grass.grassMesh.getBoundingInfo().boundingBox;
                const intersects = BABYLON.BoundingBox.Intersects(wormBoundingBox, grassBoundingBox);

                if (intersects) {
                    if (grass.grassMesh.name.startsWith("grassDense")) {
                        this.world.CreateSingleGrass(grass.grassMesh.position.x, grass.grassMesh.position.z, grass.grassMesh.rotation.y);
                    } else if (grass.grassMesh.name.startsWith("grassFlower")) {
                        this.world.CreateSingleGrass(grass.grassMesh.position.x, grass.grassMesh.position.z, grass.grassMesh.rotation.y);
                    }
                    grass.grassMesh.dispose();
                    this.world.grasses.splice(this.world.grasses.indexOf(grass), 1);

                    this.world.grassRespawnFrames.push({
                        x: grass.grassMesh.position.x,
                        z: grass.grassMesh.position.z,
                        frame: this.world.frameCounter + this.world.respawnFrames
                    });

                    this.eatCooldown = 50; // 设置冷却时间为50帧
                }
            }
        }
    }

=======

        if (this.wormMesh.position.x < -boundary) {
            this.wormMesh.position.x = -boundary;
        }

        if (this.wormMesh.position.z > boundary) {
            this.wormMesh.position.z = boundary;
        }

        if (this.wormMesh.position.z < -boundary) {
            this.wormMesh.position.z = -boundary;
        }
    }

    _checkCollision(position) {
        const nextBoundingBox = new BABYLON.BoundingBox(
          position.subtract(this.wormMesh.scaling.scale(0.5)),
          position.add(this.wormMesh.scaling.scale(0.5))
        );
    
        var i = this.world.worms.length;
        while (i--) {
          const otherWorm = this.world.worms[i];
          if (otherWorm !== this) {
            const otherBoundingBox = otherWorm.wormMesh.getBoundingInfo().boundingBox;
            if (BABYLON.BoundingBox.Intersects(nextBoundingBox, otherBoundingBox)) {
              return otherWorm;
            }
          }
        }
        return null;
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
            const intersects = BABYLON.BoundingBox.Intersects(wormBoundingBox, grassBoundingBox);

            if (intersects) {
                if (grass.grassMesh.name.startsWith("grassDense")) {
                    this.world.CreateSingleGrass(grass.grassMesh.position.x, grass.grassMesh.position.z, grass.grassMesh.rotation.y);
                } else if (grass.grassMesh.name.startsWith("grassFlower")) {
                    this.world.CreateSingleGrass(grass.grassMesh.position.x, grass.grassMesh.position.z, grass.grassMesh.rotation.y);
                }
                grass.grassMesh.dispose();
                this.world.grasses.splice(i, 1);

                this.world.grassRespawnFrames.push({
                    x: grass.grassMesh.position.x,
                    z: grass.grassMesh.position.z,
                    frame: this.world.frameCounter + this.world.respawnFrames
                });

                this.eatCooldown = 50; // 设置冷却时间为50帧
            }
        }
    }
>>>>>>> parent of 3ed4c76 (改了虫子吃草碰撞用了四叉树)
    Attack() {
        const collidedWorm = this._checkCollision(this.wormMesh.position);
        if (collidedWorm) {
          // 随机选择一只虫子死亡
          const wormToDie = Math.random() < 0.5 ? this : collidedWorm;
<<<<<<< HEAD

=======
    
>>>>>>> parent of 3ed4c76 (改了虫子吃草碰撞用了四叉树)
          // 删除死亡的虫子
          wormToDie.wormMesh.dispose();
          const index = this.world.worms.indexOf(wormToDie);
          if (index > -1) {
            this.world.worms.splice(index, 1);
          }
        }
<<<<<<< HEAD
    }

    _checkCollision(position) {
        const nextBoundingBox = new BABYLON.BoundingBox(
          position.subtract(this.wormMesh.scaling.scale(0.5)),
          position.add(this.wormMesh.scaling.scale(0.5))
        );

        var i = this.world.worms.length;
        while (i--) {
          const otherWorm = this.world.worms[i];
          if (otherWorm !== this) {
            const otherBoundingBox = otherWorm.wormMesh.getBoundingInfo().boundingBox;
            if (BABYLON.BoundingBox.Intersects(nextBoundingBox, otherBoundingBox)) {
              return otherWorm;
            }
          }
        }
        return null;
    }

    Think() {}
=======
      }
    

    Think() {}

>>>>>>> parent of 3ed4c76 (改了虫子吃草碰撞用了四叉树)
    Probe() {}
}