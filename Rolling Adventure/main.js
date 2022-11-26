Math.toRadians = v => v * Math.PI / 180;
Math.toDegrees = v => v / Math.PI * 180;
var scene, camera, renderer, clock, rigidBodies = [], tmpTrans, plane, player, tl = new THREE.TextureLoader,
	lastClick = 0, platformMaterial = new THREE.MeshPhongMaterial({map: tl.load("textures/floor.png")});
Ammo().then(async() => {
	tmpTrans = new Ammo.btTransform;
	var collisionConfiguration = new Ammo.btDefaultCollisionConfiguration,
		dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration),
		overlappingPairCache = new Ammo.btDbvtBroadphase,
		solver = new Ammo.btSequentialImpulseConstraintSolver;
	physicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
	physicsWorld.setGravity(new Ammo.btVector3(0, -9.81, 0));
	clock = new THREE.Clock;
	scene = new THREE.Scene;
	scene.background = new THREE.Color(0xbfd1e5);
	camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.2, 5000);
	var hemiLight = new THREE.HemisphereLight(0xffffff, 0x808080, 0.1);
	hemiLight.color.setHSL(0.6, 0.6, 0.6);
	hemiLight.groundColor.setHSL(0.1, 1, 0.4);
	hemiLight.position.set(0, 50, 0);
	scene.add(hemiLight);
	let dirLight = new THREE.DirectionalLight(0xffffff, 1);
	dirLight.color.setHSL(0.1, 1, 0.95);
	dirLight.position.set(-1, 1.75, 1);
	dirLight.position.multiplyScalar(100);
	scene.add(dirLight);
	dirLight.castShadow = true;
	dirLight.shadow.mapSize.width = 4096;
	dirLight.shadow.mapSize.height = 4096;
	dirLight.shadow.camera.left = -200;
	dirLight.shadow.camera.right = 200;
	dirLight.shadow.camera.top = 200;
	dirLight.shadow.camera.bottom = -200;
	dirLight.shadow.camera.far = 13500;
	let ambLight = new THREE.AmbientLight(0xffffff, 0.1);
	scene.add(ambLight);
	renderer = new THREE.WebGLRenderer({antialias: true, canvas: document.getElementById("display")});
	renderer.setClearColor(0xbfd1e5);
	renderer.setPixelRatio(devicePixelRatio);
	renderer.setSize(innerWidth, innerHeight);
	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	renderer.shadowMap.enabled = true;
	var level = await fetch("levels/0.json").then(arg => arg.json());
	function convertVector(array = [0, 0, 0]) {
		return new THREE.Vector3(...array);
	}
	function convertQuaternion(array = [0, 0, 0]) {
		return new THREE.Quaternion().setFromEuler(new THREE.Euler(...array));
	}
	function getRigidBodyById(id) {
		for (var i of rigidBodies) {
			if (i.name == id) {
				return i.userData.physicsBody;
			}
		}
		return null;
	}
	for (var body of level) {
		switch (body.type) {
		case "block":
			createBlock(body.id, convertVector(body.pos), convertVector(body.scale), body.mass, new THREE.MeshPhongMaterial(body.material), convertQuaternion(body.rotation));
			break;
		case "platform":
			createPlatform(body.id, convertVector(body.pos), convertVector(body.scale), convertQuaternion(body.rotation));
			break;
		case "ball":
			createBall(body.id, convertVector(body.pos), body.radius, body.mass, new THREE.MeshPhongMaterial(body.material), convertQuaternion(body.rotation));
			break;
		case "constraint":
			createConstraint(getRigidBodyById(body.body1), getRigidBodyById(body.body2), convertVector(body.point1), convertVector(body.point2));
			break;
		}
	}
	player = createBall("player", {x: 0, y: 10, z: 0}, 1, 1, new THREE.MeshPhongMaterial({color: 0xff0000}));
	player.userData.physicsBody.applyImpulse(new Ammo.btVector3(0.5, 0, 0));
	function frame() {
		if (player.position.y < -10) {
			player.userData.physicsBody.getWorldTransform().setOrigin(new Ammo.btVector3(0, 25, 0));
			player.userData.physicsBody.setLinearVelocity(new Ammo.btVector3(0, 0, 0));
		}
		updatePhysics(clock.getDelta());
		camera.position.set(
			player.position.x + Math.sin(rotX) * Math.sin(rotY) * 7.5,
			player.position.y + Math.cos(rotY) * 7.5,
			player.position.z + Math.cos(rotX) * Math.sin(rotY) * 7.5
		);
		camera.lookAt(player.position);
		camera.updateProjectionMatrix();
		renderer.render(scene, camera);
		requestAnimationFrame(frame);
	}
	frame();
	onresize = () => {
		renderer.setSize(innerWidth, innerHeight);
		camera.aspect = innerWidth / innerHeight;
	}
	var rotX = 0, rotY = -45;
	onmousemove = event => {
		if (!document.pointerLockElement) {
			return;
		}
		rotX += Math.toRadians(event.movementX / -2);
		rotY += Math.toRadians(event.movementY / 2);
		rotY = Math.min(Math.max(rotY, Math.toRadians(-179)), Math.toRadians(-1));
	}
	onmousedown = event => {
		var now = new Date().getTime();
		if (!document.pointerLockElement || lastClick + 200 > now) {
			return;
		}
		lastClick = now;
		player.userData.physicsBody.applyImpulse(new Ammo.btVector3(
			Math.sin(rotX) * Math.sin(rotY) * -3,
			Math.cos(rotY) * -3,
			Math.cos(rotX) * Math.sin(rotY) * -3
		));
	}
});
function createPlatform(id, pos, scale, quat) {
	return createBlock(id, pos, scale, 0, platformMaterial, quat);
}
function createBlock(id, pos, scale, mass, material, quat = {x: 0, y: 0, z: 0, w: 1}) {
	var blockPlane = new THREE.Mesh(new THREE.BoxGeometry(), material);
	blockPlane.name = id;
	blockPlane.position.set(pos.x, pos.y, pos.z);
	blockPlane.scale.set(scale.x, scale.y, scale.z);
	blockPlane.castShadow = true;
	blockPlane.receiveShadow = true;
	scene.add(blockPlane);
	let transform = new Ammo.btTransform();
	transform.setIdentity();
	transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
	transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
	let motionState = new Ammo.btDefaultMotionState(transform);
	let colShape = new Ammo.btBoxShape(new Ammo.btVector3(scale.x * 0.5, scale.y * 0.5, scale.z * 0.5));
	colShape.setMargin(0.05);
	let localInertia = new Ammo.btVector3(0, 0, 0);
	colShape.calculateLocalInertia(mass, localInertia);
	let rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, colShape, localInertia);
	let body = new Ammo.btRigidBody(rbInfo);
	physicsWorld.addRigidBody(body);
	blockPlane.userData.physicsBody = body;
	rigidBodies.push(blockPlane);
	return blockPlane;
}
function createBall(id, pos, radius, mass, material, quat = {x: 0, y: 0, z: 0, w: 1}) {
	let ball = new THREE.Mesh(new THREE.SphereGeometry(radius), material);
	ball.name = id;
	ball.position.set(pos);
	ball.castShadow = ball.receiveShadow = true;
	scene.add(ball);
	let transform = new Ammo.btTransform;
	transform.setIdentity();
	transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
	transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
	let motionState = new Ammo.btDefaultMotionState(transform);
	let colShape = new Ammo.btSphereShape(radius);
	colShape.setMargin(0.05);
	let localInertia = new Ammo.btVector3(0, 0, 0);
	colShape.calculateLocalInertia(mass, localInertia);
	let rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, colShape, localInertia);
	let body = new Ammo.btRigidBody(rbInfo);
	physicsWorld.addRigidBody(body);
	ball.userData.physicsBody = body;
	rigidBodies.push(ball);
	return ball;
}
function createConstraint(body1, body2, point1, point2) {
	point1 = new Ammo.btVector3(point1);
	point2 = new Ammo.btVector3(point2);
	physicsWorld.addConstraint(new Ammo.btPoint2PointConstraint(body1, body2, point1, point2), false);
}
function updatePhysics(deltaTime) {
	physicsWorld.stepSimulation(deltaTime, 10);
	for (var i = 0; i < rigidBodies.length; i++) {
		var objThree = rigidBodies[i],
			objAmmo = objThree.userData.physicsBody,
			ms = objAmmo.getMotionState();
		if (ms) {
			ms.getWorldTransform(tmpTrans);
			var p = tmpTrans.getOrigin(), q = tmpTrans.getRotation();
			objThree.position.set(p.x(), p.y(), p.z());
			objThree.quaternion.set(q.x(), q.y(), q.z(), q.w());
		}
	}
}