class Grass {
    constructor(world, mesh, x, y, z, d, initialEnergy) {
        this.objType = "草";
        this.name = mesh.id;
        this.world = world;
        this.mesh = mesh;

        this.mesh.position.x = 0;
        this.mesh.position.y = y;
        this.mesh.position.z = 0;

        this.mesh.checkCollisions = false;
        this.mesh.isVisible = true;
        this.mesh.showOBB = false;

        this.obb2d = new OBB2D(this, x, z, d, 4, 4, this.world.WorldSize);

        if (Global.ShowOBB) {
            this.obb2d.CreateDebugAABBMesh(this.world.scene, new BABYLON.Color3(1, 0, 0));
        }

        this.obb2d.ApplyToMesh();

        // 将草的OBB2D添加到网格中
        this.world.grid.add(this.obb2d);

        this.energy = initialEnergy;
        this.initialEnergy = initialEnergy;
        this.dying = false; // 正在死亡
        this.dead = false; // 已经死亡
    }

    get Mesh() {
        return this.mesh;
    }

    Do(index = -1) {
        if (this.dead) {
            console.log(`${this.name} dead`);
            return;
        }

        if (this.dying) {
            this.world.grid.remove(this.obb2d);
            if (index < 0) {
                index = this.world.grasses.indexOf(this);
            }
            this.world.grasses.splice(index, 1);

            this.obb2d.Clean();
            this.mesh.dispose();
            this.mesh = undefined;

            this.dying = false;
            this.dead = true;

            console.log(`${this.name} removed from world`);
        }
    }

    ReduceEnergy(eg) {
        if (this.energy <= 0) return 0;

        const oldeg = this.energy;
        var remained = this.energy - eg;
        if (remained < 0) remained = 0;

        this.energy = remained;

        console.log(`${this.name} energy reduced to ${this.energy}`);

        // 草能量消耗到一定程度后进行形态变化
        this.CheckEnergyAndUpdateState();

        if (this.energy <= 0) {
            console.log(`${this.name} is dying`);
            this.dying = true;
            this.Do(); // 立即处理消失
        }
        return (oldeg - this.energy);
    }

    CheckEnergyAndUpdateState() {
        console.log(`Checking energy for ${this.name}. Current energy: ${this.energy}, Initial energy: ${this.initialEnergy}`);
        if (this.energy <= this.initialEnergy * 0.5) {
            // 变为单个草
            const newGrassMesh = this.world.grassTemplate0.createInstance(this.mesh.name + "_transformed");
            newGrassMesh.position = this.mesh.position.clone();
            newGrassMesh.rotation = this.mesh.rotation.clone();
            newGrassMesh.isVisible = true; // 确保新实例可见
            this.mesh.dispose();
            this.mesh = newGrassMesh;
            this.obb2d.ApplyToMesh();
            console.log(`${this.name} transformed to single grass`);
        }
    }
}
