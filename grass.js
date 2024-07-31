class Grass {
    constructor(grassMesh, scene, world) {
        this.objType = "草";
        this.grassMesh = grassMesh;
        //this.grassMesh.showBoundingBox = true;
        this.scene = scene;
        this.world = world;

        // Create OBB2D for grass
        const position = grassMesh.position;
        this.obb2d = new OBB2D(position.x, position.z, 0, 5, 2, world.WorldSize, "草");
        this.obb2d.AttachMesh(grassMesh);

        // Add grass's OBB2D to the grid
        this.world.grid.add(this.obb2d);
    }

    get Name() {
        return this.grassMesh.id;
    }
}
