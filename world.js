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

		this.grassGrowthRate = 0.01; // 草生长的初始速率
        this.grassGrowthEnabled = false; // 草生长初始为禁用状态
		//帧率可调节
		this.growInterval = 200; // 草每200帧生长一次
        this.frameCounter = 0; // 帧计数器

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

		const initialEnergy = parseInt(document.getElementById("initialWormEnergy").value) || 100;
		const worm = new Worm1(this, wormMesh, x, this.groundY, z, rotation, initialEnergy);
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

	CreateGrass(x, z, rotation, grassType,initialEnergy ){
		var grassMeshTemplate = null;
		if (grassType <= 1) {
			grassMeshTemplate = this.grassTemplate0;
		} else if (grassType <= 2) {
			grassMeshTemplate = this.grassTemplate1;
		} else {
			grassMeshTemplate = this.grassTemplate2;
		}

		var grassMesh = grassMeshTemplate.createInstance(
			"grass" + this.grassIndex
		);

		this.grassIndex++;

		const grass = new Grass(this, grassMesh, x, this.groundY0, z, rotation,initialEnergy);

		this.grasses.push(grass);
	}

	CreateGrassRandomly(count, grassType0) {
		const worldSize = this.WorldSize - 4;
		var grassType= grassType0;
		const initialEnergy = parseInt(document.getElementById("grassEnergy").value) || 50;
		for (var i = 0; i < count; i++) {
			const x = Math.random() * worldSize - worldSize / 2;
			const z = Math.random() * worldSize - worldSize / 2;
			const rotation = Math.random() * Math.PI * 2 - Math.PI;
			if (!grassType0) {
				grassType = Math.random() * 3;
			}
			
			this.CreateGrass(x, z, rotation, grassType, initialEnergy);
		}
	}
	
	PrepareDebug() {
		this.WormSpeed = 0.01;
		Global.WormMoveStraight = true;
		Global.ShowOBB = true;
		/*
		this.CreateWorm(4, 0, 0, true);
		//this.CreateWorm(-4, 0, Math.PI, usingInstance);
		
		this.CreateGrass(-4, 0, 0, 2);
		*/
		this.CreateWorm(88.103, -33.209 + 20, -Math.PI/2, true);
		this.CreateGrass(88.103, -33.209, 0.3811, 1);
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

	 // 定期调用这个方法来增加新的草
	 GrowGrass() {
        if (this.grassGrowthEnabled && this.frameCounter >= this.growInterval) {
            const newGrassCount = Math.floor(Math.random() * 3) + 1; // 每次生长 1 到 3 棵草
            this.CreateGrassRandomly(newGrassCount);
            console.log(`新增 ${newGrassCount} 棵草，当前草总数：${this.grasses.length}`);
            this.frameCounter = 0; // 重置帧计数器
        }
        this.frameCounter++;
    }
	
	
	

	RunFrame(cameraPos) {
        const that = this;

		if (!that.wormMovementEnabled) return;

		if (that.isMiniMapVisible) {
			that.miniMapContext.clearRect(
				0,
				0,
				that.miniMapWidth,
				that.miniMapHeight
			);
		}
	
		for (let i = that.worms.length - 1; i >= 0; i--) {
			const worm = that.worms[i];
			worm.Do(i, that.WormSpeed);
	
			if (that.isMiniMapVisible) {
				that._drawOnMiniMap(worm.obb2d.center, "red");
			}
		}
		
		for (let i = that.grasses.length - 1; i >= 0; i--) {
			const grass = that.grasses[i];
			grass.Do(i);
			if (that.isMiniMapVisible) {
				that._drawOnMiniMap(grass.obb2d.center, "green");
			}
		}
		
		if (that.isMiniMapVisible) {
			that._drawOnMiniMap(cameraPos, "yellow", 4);
		}
	
		const currentTime = performance.now();
		const deltaTime = currentTime - that.previousTime;
		that.previousTime = currentTime;
		const currentFPS = 1000 / deltaTime;
		
		if (that.trendPanel.IsVisible()) {
			const grassCount = that.grasses.length;
			const wormCount = that.worms.length;
	
			that.trendPanel.Add(wormCount, grassCount, currentFPS);
		}
	}
}
