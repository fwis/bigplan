class OBB2D {
    /**
     * 创建一个OBB2D
     * @param {float} x 中心X
     * @param {float} z 中心Z
     * @param {float} d 方位弧度
     * @param {float} w 未旋转时x方向的长度
     * @param {float} h 未旋转时z方向的长度
     */
    constructor(x, z, d, w, h) {
        const y = 10;

        this.center = new BABYLON.Vector3(x, y, z);
        this.d = d; // 方位弧度
        this.w = w; // 长
        this.h = h; // 宽

        const halfw = this.w / 2;
        const halfh = this.h / 2;

        this.p0 = new BABYLON.Vector3(this.center.x - halfw, y, this.center.z - halfh);
        this.p1 = new BABYLON.Vector3(this.center.x - halfw, y, this.center.z + halfh);
        this.p2 = new BABYLON.Vector3(this.center.x + halfw, y, this.center.z - halfh);
        this.p3 = new BABYLON.Vector3(this.center.x + halfw, y, this.center.z + halfh);

        this.matrix = BABYLON.Matrix.RotationY(this.d);
        this.p0 = BABYLON.Vector3.TransformCoordinates(this.p0, this.matrix);
        this.p1 = BABYLON.Vector3.TransformCoordinates(this.p1, this.matrix);
        this.p2 = BABYLON.Vector3.TransformCoordinates(this.p2, this.matrix);
        this.p3 = BABYLON.Vector3.TransformCoordinates(this.p3, this.matrix);
    }

    /**
     * 旋转并且移动
     * @param {float} r 旋转弧度
     * @param {float} distance 运动距离
     */
    Move(r, distance) {
		this.d = this.d + r;

		const vx = Math.cos(this.d);
		const vz = Math.sin(this.d);

        this.center.x = this.center.x - distance * vx;
        this.center.z = this.center.z + distance * vz;

        /*
        const rotationMatrix = BABYLON.Matrix.RotationY(rotationAngle);
        const translationMatrix = BABYLON.Matrix.Translation(speed, 0, speed);
        this.matrix = rotationMatrix.multiply(translationMatrix);
        */

        this.matrix = BABYLON.Matrix.Compose(
            new BABYLON.Vector3(1, 1, 1), // 缩放向量
            BABYLON.Quaternion.FromEulerAngles(0, this.d, 0), // 旋转四元数
            new BABYLON.Vector3(this.center.x, 0, this.center.z) // 平移向量
        );

        this.p0 = BABYLON.Vector3.TransformCoordinates(this.p0, this.matrix);
        this.p1 = BABYLON.Vector3.TransformCoordinates(this.p1, this.matrix);
        this.p2 = BABYLON.Vector3.TransformCoordinates(this.p2, this.matrix);
        this.p3 = BABYLON.Vector3.TransformCoordinates(this.p3, this.matrix);
    }
}

class Worm1 {
    /**
     * 
     * @param {BABYLON.Mesh} wormMesh 虫子的3D轮廓
     * @param {World} world 当前世界
     * @param {float} x 虫子的初始位置x
     * @param {float} y 虫子的初始位置y
     * @param {float} z 虫子的初始位置z
     * @param {float} d 虫子的初始方位
     * @param {BABYLON.Scene} scene 
     */
    constructor(wormMesh, world, x, y, z, d, scene) {
        this.world = world;

		this.wormMesh = wormMesh;
        
        this.wormMesh.position.x = x;
        this.wormMesh.position.y = y;
        this.wormMesh.position.z = z;
        
        this.wormMesh.checkCollisions = false;
        this.wormMesh.isVisible = true;
        this.wormMesh.showBoundingBox = false;

        this.obb2d = new OBB2D(x,z,d,5,2);

        this.boxMesh = BABYLON.MeshBuilder.CreateBox("box", {
            width: this.obb2d.w,
            depth: this.obb2d.h,
            height: 0.2}, scene);
        
        const material = new BABYLON.StandardMaterial("boxMaterial", scene);
        material.diffuseColor = new BABYLON.Color3(1, 1, 1);
        this.boxMesh.material = material;
        this.boxMesh.position.x = x;
        this.boxMesh.position.y = y;
        this.boxMesh.position.z = z;

        this.wormMesh.setPreTransformMatrix (this.obb2d.matrix);
        this.boxMesh.setPreTransformMatrix (this.obb2d.matrix);
	}

    Move() {
        const rotation = (Math.random() * Math.PI) / 4 - Math.PI / 8;
        this.obb2d.Move(rotation, 0.1);

        this.boxMesh.setPreTransformMatrix (this.obb2d.matrix);
        this.wormMesh.setPreTransformMatrix (this.obb2d.matrix);
    }
}
