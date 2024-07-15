class World {
    constructor(worldSize, miniMapCanvas) {
        this.WorldSize = worldSize;
        this.scene = null;
        this.wormTemplate = null;
        this.wormIndex = 0;
        this.groundY = 0.5;
        this.wormMovementEnabled = true;
        this.wormSpeed = 0.1;

        this.grassTemplate0 = null;
        this.groundY0 = -6;
        this.grassIndex = 0;

        this.worms = []; // 存储虫子的数组
        this.grasses = [];

        this.wormCount = 0;
        this.grassCount = 0;

        this.miniMapCanvas = miniMapCanvas;
    }

    LoadWormModel(wormModelURL) { // "worm2.glb"
        const that = this;
        BABYLON.SceneLoader.LoadAssetContainer("", wormModelURL, world.scene, function (container) {
            var mymeshes = container.meshes.filter(mesh => mesh.geometry);
            const disposeSource = true; //是否在合并后释放原始网格
            const allow32BitsIndices = false; //使用 32 位索引来处理合并的网格
            const meshSubclass = null; //指定要创建的合并后网格的子类类型
            const subdivideWithSubMeshes = false; //subdivide mesh to his subMesh array with meshes source
            const multiMultiMaterial = true; //subdivide mesh and accept multiple multi materials, ignores subdivideWithSubMeshes

            that.wormTemplate = BABYLON.Mesh.MergeMeshes(
                mymeshes, 
                disposeSource, 
                allow32BitsIndices, 
                meshSubclass, 
                subdivideWithSubMeshes, 
                multiMultiMaterial);
            
            that.wormTemplate.isVisible = true;
        });
    }

    CreateWorm(x,z,rotation,usingInstance) {
        const that = this;

        const name = "worm_"+that.wormIndex;
        that.wormIndex++;

        var wormMesh = null;

        if (usingInstance) {
            wormMesh  = that.wormTemplate.createInstance(name);
        } else {
            wormMesh  = that.wormTemplate.clone(name);
        }
        
        wormMesh.position.x = x;
        wormMesh.position.y = that.groundY;
        wormMesh.rotation.y = rotation;
        wormMesh.position.z = z;
        wormMesh.checkCollisions = false;

        if (!usingInstance) {
            const material1 = new BABYLON.StandardMaterial("material1", scene);
            material1.diffuseColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());

            const material2 = new BABYLON.StandardMaterial("material2", scene);
            material2.diffuseColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());

            const material_eye = new BABYLON.StandardMaterial("material_eye", scene);
            material_eye.diffuseColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());

            const multiMaterial = new BABYLON.MultiMaterial("multiMaterial", scene);
            multiMaterial.subMaterials.push(material1);
            multiMaterial.subMaterials.push(material2);
            multiMaterial.subMaterials.push(material_eye);

            wormMesh.material = multiMaterial;
        }

        const worm = new Worm(wormMesh, this);
        that.worms.push(worm);
        this.wormCount++;
        this.updateCountDisplay();
        return worm;
    }


    _buildGrassMesh0() {
        const that = this;
        var items = [];
        for (var i = 0; i < 5; i++) {
            var blade = BABYLON.MeshBuilder.CreateCylinder("blade", {
                height: 12, // 放大草的高度
                diameterTop: 0,
                diameterBottom: 1.2, // 放大草的底部直径
                tessellation: 3
            }, that.scene);
            blade.material = new BABYLON.StandardMaterial("grassMaterial", that.scene);
            blade.material.diffuseColor = new BABYLON.Color3(0, 1, 0);
            blade.position.y = 6;
            blade.rotation.z = Math.PI / 6 * (i - 2);
            items.push(blade);
        }

        var grassMesh = BABYLON.Mesh.MergeMeshes(items, true, false, null, false, true);
        
        return grassMesh;
    }

    LoadGrassModel(grassURL) {
        this.grassTemplate0 = this._buildGrassMesh0();
        this.grassTemplate0.isVisible = false;
    }

    CreateGrass(x,z,rotation) {
        var grassMesh = this.grassTemplate0.createInstance("grass"+this.grassIndex);
        this.grassIndex++;

        grassMesh.position.x = x;//Math.random() * 1000 - 500;
        grassMesh.position.z = z;//Math.random() * 1000 - 500;
        grassMesh.position.y = this.groundY0;
        grassMesh.rotation.y = rotation;
        grassMesh.checkCollisions = false;
        const grass = new Grass(grassMesh, this);
        this.grasses.push(grass);
        this.grassCount++;
        this.updateCountDisplay();
        return grass;
    }

    updateCountDisplay() {
        document.getElementById("wormCountDisplay").textContent = `虫子数量: ${this.wormCount}`;
        document.getElementById("grassCountDisplay").textContent = `草的数量: ${this.grassCount}`;
    }

    drawOnMiniMap(miniMapContext, miniMapCanvas, position, color) {
        const mapScale = miniMapCanvas.width / this.WorldSize;
        const x = (position.x + this.WorldSize / 2) * mapScale;
        const z = (position.z + this.WorldSize / 2) * mapScale;
        miniMapContext.fillStyle = color;
        miniMapContext.fillRect(x - 2, z - 2, 4, 4);
    }

    IsReady() {
        return (this.worms && this.grasses)
    }

    toggleWormMovement() {
        this.wormMovementEnabled = !this.wormMovementEnabled;
    }

    updateWormSpeed(speed) {
        this.wormSpeed = speed;
    }

    updateToggleButton() {
        const button = document.getElementById("toggleMovement");
        if (world.wormMovementEnabled) {
            button.textContent = "暂停虫子运动";
        } else {
            button.textContent = "开启虫子运动";
        }
    }

    RunFrame() {
        if (this.wormMovementEnabled) {
            this.worms.forEach(function(worm) {
                worm.Move();
            });
        }
    }
}