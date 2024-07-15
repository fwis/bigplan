class Grass {
    constructor(grassMesh, scene) {
        this.grassMesh = grassMesh;
        this.scene = scene;
    }

    get Name() {
        return this.grassMesh.Id;
    }
}
