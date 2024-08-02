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

        //将草的OBB2D添加到网格中
        this.world.grid.add(this.obb2d);

        this.energy  = initialEnergy;
        this.dying = false; //正在死亡
        this.dead = false; //已经死亡
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

            //console.log(`${this.name} remove self`);
        }
    }

    ReduceEnergy(eg) {
        if (this.energy <=0) return 0;

        console.log(`Grass ${this.name} energy before reduction: ${this.energy}`);
       /* if (eg === -1) {
            const r = this.energy;
            this.energy = 0;
            this.dying = true;
            //console.log(`${this.name} dying`);
            return r;
        }*/

        const oldeg = this.energy;
        var remained = this.energy - eg;
        if (remained < 0) remained = 0;

        this.energy = remained;

        if (this.energy <= 0) {
            console.log(`${this.name} dying`);
            this.dying = true;
        }
        console.log(`Grass ${this.name} energy after reduction: ${this.energy}`);
        return (oldeg - this.energy);
    }
}
