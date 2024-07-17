class Worm {
    constructor(wormMesh, world, showBoundary) {
        this.wormMesh = wormMesh;
        this.world = world;
        this.showBoundary = showBoundary;
        //that.wormTemplate.isVisible = false;
        if (showBoundary) {
            const bi = this.wormMesh.getBoundingInfo();
            const bb = bi.boundingBox;
    
            this.plane = BABYLON.MeshBuilder.CreatePlane("plane", {
                width: (bb.maximum.x - bb.minimum.x),
                height: (bb.maximum.z - bb.minimum.z)
            }, scene);
            this.plane.position.x = this.wormMesh.position.x;
            this.plane.position.z = this.wormMesh.position.z;
            this.plane.rotation.y = this.wormMesh.rotation.y;
            this.plane.rotation.x = Math.PI / 2;
            this.plane.position.y = 3;
        }
    }

    get Name() {
        return this.wormMesh.Id;
    }

    get BoundRect() {

    }

    Move() {
        //that.wormTemplate.isVisible = true;
        this.wormMesh.rotation.y += Math.random() * Math.PI/4 - Math.PI/8;

        const wormLen = 8;
        var speed = this.world.WormSpeed;
        const vx = wormLen * Math.cos(this.wormMesh.rotation.y);
        const vz = wormLen * Math.sin(this.wormMesh.rotation.y);

        var v = new BABYLON.Vector3(-vx, 0, vz);
        //this.wormMesh.moveWithCollisions(v.scale(speed));
        this.wormMesh.position.addInPlace(v.scale(speed));
        
        const boundary = this.world.WorldSize / 2 - wormLen;

        if (this.wormMesh.position.x > boundary) {
            this.wormMesh.position.x = boundary;
        }

        if (this.wormMesh.position.x < -boundary) {
            this.wormMesh.position.x = -boundary;
        }

        if (this.wormMesh.position.z > boundary) {
            this.wormMesh.position.z = boundary;
        }

        if (this.wormMesh.position.z < -boundary) {
            this.wormMesh.position.z = -boundary;
        }

        if (this.showBoundary) {
            this.plane.position.x = this.wormMesh.position.x;
            this.plane.position.z = this.wormMesh.position.z;
            this.plane.rotation.y = this.wormMesh.rotation.y;
            this.plane.rotation.x = Math.PI / 2;
            this.plane.position.y = 3;
        }
    }

    Eat() {

    }

    Attack() {

    }

    Think() {

    }

    Probe() {

    }
}