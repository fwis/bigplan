class Grass {
    /**
     * 创建草对象
     * @param {BABYLON.Mesh} grassMesh 草的3D网格
     * @param {BABYLON.Scene} scene 场景对象
     * @param {World} world 当前世界对象
     */
    constructor(grassMesh, scene, world) {
        this.objType = "草";
        this.grassMesh = grassMesh;
        //this.grassMesh.showBoundingBox = true;
        this.scene = scene;
        this.world = world;

        //创建草的OBB2D
        const position = grassMesh.position;
        this.obb2d = new OBB2D(position.x, position.z, 0, 2, 2, world.WorldSize, "草");
        this.obb2d.AttachMesh(grassMesh);

        //将草的OBB2D添加到网格中
        this.world.grid.add(this.obb2d);
    }

    /**
     * 获取草的名称
     * @returns {string} 草的名称
     */
    get Name() {
        return this.grassMesh.id;
    }
}
