class World {
	constructor(worldSize, miniMapCanvas, trendChart) {
		this.WorldSize = worldSize;
		this.WormSpeed = 0.1;
		this.scene = null;
		this.wormTemplate = null;
		this.wormIndex = 0;
		this.groundY = 0.5;
		this.wormMovementEnabled = true;

		this.grassTemplate0 = null;
		this.grassTemplate1 = null;
		this.grassTemplate2 = null;
		this.groundY0 = -6;
		this.grassIndex = 0;

		this.worms = [];
		this.grasses = [];
		this.grassRespawnFrames = [];
		this.respawnFrames = 300;

		this.singleGrassCount = [];
		this.denseGrassCount = [];
		this.flowerGrassCount = [];
		this.wormCount = [];

		this.miniMapCanvas = miniMapCanvas;
		this.miniMapContext = miniMapCanvas.getContext("2d");
		this.miniMapWidth = this.miniMapCanvas.width;
		this.miniMapHeight = this.miniMapCanvas.height;

		this.miniMapScale = this.miniMapWidth / this.WorldSize;

		this.trendPanel = new TrendPanel(trendChart, 10);
		this.trendPanel.AddSerie("虫数", "red");
		this.trendPanel.AddSerie("草数", "green");
		this.trendPanel.AddSerie("FPS", "white");

		this.growInterval = 100;

		this.isMiniMapVisible = true; // 小地图可见状态

		this.previousTime = performance.now(); // 用于 FPS 计算的初始时间

		this.grid = new Grid(30, this.WorldSize);
	}

	LoadWormModel(wormModelURL) {
		const that = this;
		BABYLON.SceneLoader.LoadAssetContainer(
			"",
			wormModelURL,
			world.scene,
			function (container) {
				var mymeshes = container.meshes.filter((mesh) => mesh.geometry);
				const disposeSource = true;
				const allow32BitsIndices = false;
				const meshSubclass = null;
				const subdivideWithSubMeshes = false;
				const multiMultiMaterial = true;

				that.wormTemplate = BABYLON.Mesh.MergeMeshes(
					mymeshes,
					disposeSource,
					allow32BitsIndices,
					meshSubclass,
					subdivideWithSubMeshes,
					multiMultiMaterial
				);

				that.wormTemplate.isVisible = false;
			}
		);
	}

	CreatWormsRandomly(count, usingInstance) {
		
		for (var i = 0; i < count; i++) {
			const x = Math.random() * this.WorldSize - this.WorldSize / 2;
			const z = Math.random() * this.WorldSize - this.WorldSize / 2;
			const rotation = Math.random() * Math.PI * 2 - Math.PI;

			this.CreateWorm(x, z, rotation, usingInstance);
		}
		
		/*
		this.WormSpeed = 0.01;
		this.CreateWorm(4, 0, 0, usingInstance);
		this.CreateWorm(-4, 0, Math.PI, usingInstance);
		*/
		
	}

	CreateWorm(x, z, rotation, usingInstance) {
		const that = this;

		const name = "worm_" + that.wormIndex;
		that.wormIndex++;

		var wormMesh = null;

		if (usingInstance) {
			wormMesh = that.wormTemplate.createInstance(name);
		} else {
			wormMesh = that.wormTemplate.clone(name);
		}

		if (!usingInstance) {
			const material1 = new BABYLON.StandardMaterial("material1", scene);
			material1.diffuseColor = new BABYLON.Color3(
				Math.random(),
				Math.random(),
				Math.random()
			);

			const material2 = new BABYLON.StandardMaterial("material2", scene);
			material2.diffuseColor = new BABYLON.Color3(
				Math.random(),
				Math.random(),
				Math.random()
			);

			const material_eye = new BABYLON.StandardMaterial("material_eye", scene);
			material_eye.diffuseColor = new BABYLON.Color3(
				Math.random(),
				Math.random(),
				Math.random()
			);

			const multiMaterial = new BABYLON.MultiMaterial("multiMaterial", scene);
			multiMaterial.subMaterials.push(material1);
			multiMaterial.subMaterials.push(material2);
			multiMaterial.subMaterials.push(material_eye);

			wormMesh.material = multiMaterial;
		}

		const worm = new Worm1(this, wormMesh, x, this.groundY, z, rotation);
		that.worms.push(worm);
		return worm;
	}

	_buildGrassMesh0() {
		const that = this;
		var items = [];
		for (var i = 0; i < 5; i++) {
			var blade = BABYLON.MeshBuilder.CreateCylinder(
				"blade",
				{
					height: 12,
					diameterTop: 0,
					diameterBottom: 1.2,
					tessellation: 3,
				},
				that.scene
			);
			blade.material = new BABYLON.StandardMaterial(
				"grassMaterial",
				that.scene
			);
			blade.material.diffuseColor = new BABYLON.Color3(0, 1, 0);
			blade.position.y = 6;
			blade.rotation.z = (Math.PI / 6) * (i - 2);
			items.push(blade);
		}

		var grassMesh = BABYLON.Mesh.MergeMeshes(
			items,
			true,
			false,
			null,
			false,
			true
		);

		return grassMesh;
	}

	_buildDenseGrassMesh() {
		const that = this;
		var items = [];
		for (var i = 0; i < 7; i++) {
			var grass = that._buildGrassMesh0();
			grass.scaling = new BABYLON.Vector3(1, 1, 1);
			grass.rotation.y = (Math.PI / 3.5) * i;
			items.push(grass);
		}
		var denseGrassMesh = BABYLON.Mesh.MergeMeshes(
			items,
			true,
			false,
			null,
			false,
			true
		);
		denseGrassMesh.position.y = -6;
		return denseGrassMesh;
	}

	_buildFlowerGrassMesh() {
		const that = this;
		var items = [];
		for (var i = 0; i < 5; i++) {
			var blade = BABYLON.MeshBuilder.CreateCylinder(
				"blade",
				{
					height: 12,
					diameterTop: 0,
					diameterBottom: 1.2,
					tessellation: 3,
				},
				that.scene
			);
			blade.material = new BABYLON.StandardMaterial(
				"grassMaterial",
				that.scene
			);
			blade.material.diffuseColor = new BABYLON.Color3(0, 1, 0);
			blade.position.y = 6;
			blade.rotation.z = (Math.PI / 6) * (i - 2);
			items.push(blade);
		}
		var flowerRadius = 0.6;
		var flowerCount = 5;
		for (var i = 0; i < flowerCount; i++) {
			var angle = (i / flowerCount) * 2 * Math.PI;
			var flowerPetal = BABYLON.MeshBuilder.CreateSphere(
				"flowerPetal" + i,
				{ diameter: 0.4 },
				that.scene
			);
			flowerPetal.material = new BABYLON.StandardMaterial(
				"flowerMaterial",
				that.scene
			);
			flowerPetal.material.diffuseColor = new BABYLON.Color3(1, 0, 0);
			flowerPetal.position.y = 12;
			flowerPetal.position.x = Math.cos(angle) * flowerRadius;
			flowerPetal.position.z = Math.sin(angle) * flowerRadius;
			items.push(flowerPetal);
		}
		var flowerGrassMesh = BABYLON.Mesh.MergeMeshes(
			items,
			true,
			false,
			null,
			false,
			true
		);
		flowerGrassMesh.position.y = -3;
		return flowerGrassMesh;
	}

	LoadGrassModel(grassURL) {
		this.grassTemplate0 = this._buildGrassMesh0();
		this.grassTemplate0.isVisible = false;

		this.grassTemplate1 = this._buildDenseGrassMesh();
		this.grassTemplate1.isVisible = false;

		this.grassTemplate2 = this._buildFlowerGrassMesh();
		this.grassTemplate2.isVisible = false;
	}

	CreateSingleGrass(x, z, rotation) {
        var grassMesh = this.grassTemplate0.createInstance(
            "grass" + this.grassIndex
        );
        this.grassIndex++;

        grassMesh.position.x = x;
        grassMesh.position.z = z;
        grassMesh.position.y = this.groundY0;
        grassMesh.rotation.y = rotation + Math.random() * Math.PI * 2; // 随机旋转方向
        grassMesh.checkCollisions = false;

        const grass = new Grass(grassMesh, this.scene, this);
        this.grasses.push(grass);
        return grass;
    }

    CreateDenseGrass(x, z, rotation) {
        var denseGrassMesh = this.grassTemplate1.createInstance(
            "grassDense" + this.grassIndex
        );
        this.grassIndex++;
        denseGrassMesh.position.x = x;
        denseGrassMesh.position.z = z;
        denseGrassMesh.position.y = this.groundY0;
        denseGrassMesh.rotation.y = rotation + Math.random() * Math.PI * 2; // 随机旋转方向
        denseGrassMesh.checkCollisions = false;

        const grass = new Grass(denseGrassMesh, this.scene, this);
        this.grasses.push(grass);
        return grass;
    }

    CreateFlowerGrass(x, z, rotation) {
        var flowerGrassMesh = this.grassTemplate2.createInstance(
            "grassFlower" + this.grassIndex
        );
        this.grassIndex++;

        flowerGrassMesh.position.x = x;
        flowerGrassMesh.position.z = z;
        flowerGrassMesh.position.y = this.groundY0;
        flowerGrassMesh.rotation.y = rotation + Math.random() * Math.PI * 2; // 随机旋转方向
        flowerGrassMesh.checkCollisions = false;

        const grass = new Grass(flowerGrassMesh, this.scene, this);
        this.grasses.push(grass);
        return grass;
    }

	
	removeGrass(grassOBB) {
		const grass = this.grasses.find(g => g.obb2d === grassOBB);
		if (grass) {
			const index = this.grasses.indexOf(grass);
			if (index > -1) {
				this.grasses.splice(index, 1);
				const cellIndices = this.grid._getCellIndices(grass.obb2d);
				this.grid.remove(grass.obb2d, cellIndices);
				grass.grassMesh.dispose();
			}
		}
	}

	ToggleWormMovement() {
		this.wormMovementEnabled = !this.wormMovementEnabled;
		this._updateToggleButton();
	}

	UpdateWormSpeed(speed) {
		this.WormSpeed = speed;
	}

	_updateToggleButton() {
		const button = document.getElementById("toggleMovement");
		if (world.wormMovementEnabled) {
			button.textContent = "暂停虫子运动";
		} else {
			button.textContent = "开启虫子运动";
		}
	}

	_drawOnMiniMap(position, color, size = 2) {
		const x = (position.x + this.WorldSize / 2) * this.miniMapScale;
		const z = (position.z + this.WorldSize / 2) * this.miniMapScale;

		this.miniMapContext.fillStyle = color;
		this.miniMapContext.fillRect(x, z, size, size);
	}

	RunFrame(cameraPos) {
        const that = this;
        if (!that.wormMovementEnabled) return;

        that.worms.forEach(function (worm) {
            worm.Move(that.WormSpeed);
            worm.Eat(); // 检查并处理虫子吃草
        });

		const currentTime = performance.now();
		const deltaTime = currentTime - this.previousTime;
		this.previousTime = currentTime;
		const currentFPS = 1000 / deltaTime;
		
		if (this.trendPanel.IsVisible()) {
			const grassCount = this.grasses.length;
			const wormCount = this.worms.length;

			this.trendPanel.Add(wormCount, grassCount, currentFPS);
		}

		if (true) {
			this.miniMapContext.clearRect(
				0,
				0,
				this.miniMapWidth,
				this.miniMapHeight
			);

			this.worms.forEach((worm) => {
				this._drawOnMiniMap(worm.obb2d.center, "red");
			});
			this.grasses.forEach((grass) => {
				//that._drawOnMiniMap(grass.position, "green");
			});

			this._drawOnMiniMap(cameraPos, "yellow", 4);
		}
	}
}
