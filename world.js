class World {
  constructor(worldSize, miniMapCanvas) {
    this.WorldSize = worldSize;
    this.WormSpeed = 0.05;
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

    this.worms = []; // 存储虫子的数组
    this.grasses = [];

    this.miniMapCanvas = miniMapCanvas;
    this.miniMapContext = miniMapCanvas.getContext("2d");
    this.miniMapWidth = miniMapCanvas.width;
    this.miniMapHeight = miniMapCanvas.height;

    this.miniMapScale = this.miniMapWidth / this.WorldSize;
  }

  LoadWormModel(wormModelURL) {
    // "worm2.glb"
    const that = this;
    BABYLON.SceneLoader.LoadAssetContainer(
      "",
      wormModelURL,
      world.scene,
      function (container) {
        var mymeshes = container.meshes.filter((mesh) => mesh.geometry);
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
          multiMultiMaterial
        );

        that.wormTemplate.isVisible = false;
      }
    );
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

    wormMesh.position.x = x;
    wormMesh.position.y = that.groundY;
    wormMesh.rotation.y = rotation;
    wormMesh.position.z = z;
    wormMesh.checkCollisions = false;
    wormMesh.isVisible = true; // 确保新创建的虫子是可见的

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

    const worm = new Worm(wormMesh, this);
    that.worms.push(worm);
    this._updateCountDisplay();
    return worm;
  }

  _buildGrassMesh0() {
    const that = this;
    var items = [];
    for (var i = 0; i < 5; i++) {
      var blade = BABYLON.MeshBuilder.CreateCylinder(
        "blade",
        {
          height: 12, // 放大草的高度
          diameterTop: 0,
          diameterBottom: 1.2, // 放大草的底部直径
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

  // 创建草丛
  _buildDenseGrassMesh() {
    const that = this;
    var items = [];
    for (var i = 0; i < 7; i++) {
      var grass = that._buildGrassMesh0(); // 假设 _buildGrassMesh0 方法创建单个草
      grass.scaling = new BABYLON.Vector3(1, 1, 1); // 将草丛高度增加到1.5倍
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
  //花朵函数
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

  // 创建单个草的方法
  CreateSingleGrass(x, z, rotation) {
    var grassMesh = this.grassTemplate0.createInstance(
      "grass" + this.grassIndex
    );
    this.grassIndex++;

    grassMesh.position.x = x; // 设置 x 坐标
    grassMesh.position.z = z; // 设置 z 坐标
    grassMesh.position.y = this.groundY0; // 设置 y 坐标
    grassMesh.rotation.y = rotation; // 设置旋转角度
    grassMesh.checkCollisions = false; // 禁用碰撞检测

    const grass = new Grass(grassMesh, this);
    this.grasses.push(grass);
    this._updateCountDisplay();
    return grass;
  }

  // 创建草丛的方法
  CreateDenseGrass(x, z, rotation) {
    var denseGrassMesh = this.grassTemplate1.createInstance(
      "grass" + this.grassIndex
    );
    this.grassIndex++;
    // 设置草丛的位置
    denseGrassMesh.position.x = x;
    denseGrassMesh.position.z = z;
    denseGrassMesh.position.y = this.groundY0;
    // 设置草丛的旋转角度
    denseGrassMesh.rotation.y = rotation;
    // 禁用草丛的碰撞检测
    denseGrassMesh.checkCollisions = false;
    // 创建一个新的 Grass 对象，并将草丛网格和当前对象传递给它
    const grass = new Grass(denseGrassMesh, this);
    // 将新创建的 Grass 对象添加到 grasses 数组中
    this.grasses.push(grass);
    this._updateCountDisplay();
    return grass;
  }
  // 创建带有花的草的方法
  CreateFlowerGrass(x, z, rotation) {
    var flowerGrassMesh = this.grassTemplate2.createInstance(
      "grass" + this.grassIndex
    );
    this.grassIndex++;

    // 设置草丛的位置
    flowerGrassMesh.position.x = x;
    flowerGrassMesh.position.z = z;
    flowerGrassMesh.position.y = this.groundY0;

    // 设置草丛的旋转角度
    flowerGrassMesh.rotation.y = rotation;

    // 禁用草丛的碰撞检测
    flowerGrassMesh.checkCollisions = false;

    // 创建一个新的 Grass 对象，并将草丛网格和当前对象传递给它
    const grass = new Grass(flowerGrassMesh, this);

    // 将新创建的 Grass 对象添加到 grasses 数组中
    this.grasses.push(grass);
    this._updateCountDisplay();
    return grass;
  }

  _updateCountDisplay() {
    document.getElementById(
      "wormCountDisplay"
    ).textContent = `虫子数量: ${this.worms.length}`;
    document.getElementById(
      "grassCountDisplay"
    ).textContent = `草的数量: ${this.grasses.length}`;
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

  _drawOnMiniMap(position, color) {
    const x = (position.x + this.WorldSize / 2) * this.miniMapScale;
    const z = (position.z + this.WorldSize / 2) * this.miniMapScale;

    this.miniMapContext.fillStyle = color;
    this.miniMapContext.fillRect(x, z, 2, 2);
  }

  RunFrame() {
    if (!this.wormMovementEnabled) return;

    this.worms.forEach(function (worm) {
      worm.Move();
    });

    // 绘制小地图
    this.miniMapContext.clearRect(0, 0, this.miniMapWidth, this.miniMapHeight);

    this.worms.forEach((worm) => {
      this._drawOnMiniMap(worm.wormMesh.position, "red");
    });
    this.grasses.forEach((grass) => {
      this._drawOnMiniMap(grass.grassMesh.position, "green");
    });
  }
}
