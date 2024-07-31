class OBB2D {
	/**
	 * 创建二维 OBB
	 * @param {float} x 中心X
	 * @param {float} z 中心Z
	 * @param {float} d 方位弧度
	 * @param {float} w 未旋转时x方向的长度
	 * @param {float} h 未旋转时z方向的长度
	 */
	constructor(x, z, d, w, h, worldSize, objType) {
		this.fixedY = 0.5;
		this.objType = objType;
		this.center = new BABYLON.Vector3(x, this.fixedY, z);
		this.d = d; // 方位弧度
		this.w = w; // 长
		this.h = h; // 宽
		this.halfw = this.w / 2;
		this.worldBoundary = worldSize / 2 - this.halfw - 2;

		if (this.center.x > this.worldBoundary) this.center.x = this.worldBoundary;
		if (this.center.x < -this.worldBoundary) this.center.x = -this.worldBoundary;
		if (this.center.z > this.worldBoundary) this.center.z = this.worldBoundary;
		if (this.center.z < -this.worldBoundary) this.center.z = -this.worldBoundary;

		this.mesh = null;
	}

	/**
	 * 将OBB2D对象与一个网格关联
	 * @param {BABYLON.Mesh} mesh 关联的网格
	 */
	AttachMesh(mesh) {
		this.mesh = mesh;

		this.mesh.position.x = this.center.x;
		this.mesh.position.z = this.center.z;
		this.mesh.rotation.y = this.d;

		this._aabb = {
			minimum:new BABYLON.Vector3(0,0),
			maximum:new BABYLON.Vector3(0,0)
		};

		this.compute();
	}

	/**
	* 重新根据 center 和 d 计算 matrix、vertices、aabb
	*/
	compute0() {
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

		// 找到最小和最大的 X 和 Z 坐标
		let minX = Infinity;
		let maxX = -Infinity;
		let minZ = Infinity;
		let maxZ = -Infinity;

		var newVertices = [];
		for (var i = 0; i < this.originalVertices.length; i++) {
			const originalVertex = this.originalVertices[i];
			const newVertex = BABYLON.Vector3.TransformCoordinates(originalVertex, this.matrix);

			newVertices.push(newVertex);

			minX = Math.min(minX, newVertex.x);
			maxX = Math.max(maxX, newVertex.x);
			minZ = Math.min(minZ, newVertex.z);
			maxZ = Math.max(maxZ, newVertex.z);
		}

		this.vertices = newVertices;
		
		this._aabb = new BABYLON.BoundingBox(
			new BABYLON.Vector3(minX, this.fixedY, minZ),
			new BABYLON.Vector3(maxX, this.fixedY, maxZ)
		);
		
	}

	/**
	 * 根据当前中心和方向计算AABB
	 */
	compute() {
		this._aabb.minimum.x =  this.center.x - this.halfw;
		this._aabb.minimum.z =  this.center.z - this.halfw;

		this._aabb.maximum.x =  this.center.x + this.halfw;
		this._aabb.maximum.z =  this.center.z + this.halfw;
	}

	/**
	 * 获取AABB
	 * @returns {BABYLON.BoundingBox} AABB对象
	 */
	get aabb() {
		return this._aabb;
	}

	/**
	 * 将矩阵应用到网格
	 * @param {BABYLON.Mesh} mesh 应用的网格
	 */
	ApplyToMesh0(mesh) {
		if (!mesh) mesh = this.mesh;
		
		mesh.setPreTransformMatrix(this.matrix);
	}

	/**
	 * 应用中心位置和方向到网格
	 * @param {BABYLON.Mesh} mesh 应用的网格
	 */
	ApplyToMesh(mesh) {
		if (!mesh) mesh = this.mesh;
		mesh.position.x = this.center.x;
		mesh.position.z = this.center.z;
		mesh.rotation.y = this.d;
	}

	/**
	 * 保存当前状态
	 */
	Save() {
		//if (!mesh) mesh = this.mesh;

		this.oldX = this.center.x;
		this.oldZ = this.center.z;
		this.oldD = this.d;
	}

	/**
	 * 复原到保存的状态（不应用到网格）
	 */
	Restore0() {
		//if (!mesh) mesh = this.mesh;

		this.center.x = this.oldX;
		this.center.z = this.oldZ;
		this.d = this.oldD;
		this.compute();
	}

	/**
	 * 复原到保存的状态并应用到网格
	 */
	Restore() {
		this.center.x = this.oldX;
		this.center.z = this.oldZ;
		this.d = this.oldD;
		this.mesh.position.x = this.center.x;
		this.mesh.position.z = this.center.z;
		this.mesh.rotation.y = this.d;
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

		if (this.center.x > this.worldBoundary) this.center.x = this.worldBoundary;
		if (this.center.x < -this.worldBoundary) this.center.x = -this.worldBoundary;
		if (this.center.z > this.worldBoundary) this.center.z = this.worldBoundary;
		if (this.center.z < -this.worldBoundary) this.center.z = -this.worldBoundary;

		this.compute();
	}

	/**
	 * 检测与另一个OBB2D对象的碰撞
	 * @param {OBB2D} other 另一个OBB2D对象
	 * @returns {boolean} 如果发生碰撞返回true，否则返回false
	 */
	isColliding(other) {
		if (!this._checkAABBCollision(other)) return false;
		
		if (!Global.DisableSATCollision) {
			// 使用 SAT 算法进行精确碰撞检测
			return this._checkSATCollision(other);
		} else {
			return true;
		}
	}

	/**
	 * 检查AABB碰撞
	 * @param {OBB2D} other 另一个OBB2D对象
	 * @returns {boolean} 如果发生AABB碰撞返回true，否则返回false
	 */
	_checkAABBCollision(other) {
		const selfaabb = this.aabb;
		const otheraabb = other.aabb;

		if (selfaabb.maximum.x < otheraabb.minimum.x || otheraabb.maximum.x < selfaabb.minimum.x) {
			return false; // x轴上没有重叠
		}

		// 检查z轴上的重叠
		if (selfaabb.maximum.z < otheraabb.minimum.z || otheraabb.maximum.z < selfaabb.minimum.z) {
			return false; // z轴上没有重叠
		}

		// 如果在x轴和y轴上都有重叠，则发生碰撞
		return true;
	}

	/**
	 * 使用 SAT 算法进行精确碰撞检测
	 * @param {OBB2D} other 另一个OBB2D对象
	 * @returns {boolean} 如果发生碰撞返回true，否则返回false
	 */
	_checkSATCollision(other) {
		// 分离轴定理：如果两个凸多边形没有重叠，则存在一条轴将它们分开
		const axes = this._getAxes().concat(other._getAxes());

		for (let axis of axes) {
			const projection1 = this._projectOntoAxis(axis);
			const projection2 = other._projectOntoAxis(axis);
			if (!this._overlap(projection1, projection2)) {
				return false; 
			}
		}

		return true;
	}

	/**
	 * 获取 OBB2D 对象的投影轴
	 * @returns {BABYLON.Vector3[]} 投影轴数组
	 */
	_getAxes() {
		// 对于矩形，只需计算两个唯一的边向量的法向量
		const axes = [];

		// 获取矩形的顶点（假设已按顺时针或逆时针顺序排列）
		const p0 = this.vertices[0];
		const p1 = this.vertices[1];
		const p2 = this.vertices[2];

		// 计算边向量
		const edge1 = p1.subtract(p0); // 第一条边
		const edge2 = p2.subtract(p1); // 第二条边

		// 计算边1的法向量，并标准化
		const normal1 = new BABYLON.Vector3(-edge1.z, 0, edge1.x).normalize();
		// 计算边2的法向量，并标准化
		const normal2 = new BABYLON.Vector3(-edge2.z, 0, edge2.x).normalize();

		// 将两个唯一的法向量添加到投影轴数组中
		axes.push(normal1);
		axes.push(normal2);

		return axes;
	}

	/**
	 * 将 OBB2D 对象投影到指定轴上
	 * @param {BABYLON.Vector3} axis 投影轴
	 * @returns {{min: number, max: number}} 投影的最小值和最大值
	 */
	_projectOntoAxis(axis) {
		let min = Infinity;
		let max = -Infinity;
		for (let vertex of this.vertices) {
			const projection = BABYLON.Vector3.Dot(vertex, axis);
			min = Math.min(min, projection);
			max = Math.max(max, projection);
		}
		return { min, max };
	}

	/**
	 * 检测两个投影是否重叠
	 * @param {{min: number, max: number}} projection1 第一个投影
	 * @param {{min: number, max: number}} projection2 第二个投影
	 * @returns {boolean} 如果投影重叠返回true，否则返回false
	 */
	_overlap(projection1, projection2) {
		return !(projection1.max < projection2.min || projection2.max < projection1.min);
	}
}
