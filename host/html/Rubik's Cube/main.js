Array.prototype.count = function(val) {
	var c = 0;
	for (var x of this) {
		if (x == val)
			c++;
	}
	return c;
};
Math.degToRad = deg => deg / 180 * Math.PI;
Math.radToDeg = rad => rad * 180 / Math.PI;
var selectedClr = 0, colorPickerEnabled = false;
onload = () => {
	for (var e of document.querySelectorAll("[onclick]")) {
		e.onkeypress = event => {
			if ([" ", "Enter", "\n"].includes(event.key)) {
				event.target.onclick();
			}
		}
	}
	window.cubeEditingEnabled = true;
	window.cubeMovementEnabled = true;
	window.raycaster = new THREE.Raycaster;
	window.scene = new THREE.Scene;
	// scene.background = new THREE.Color(0x808080);
	window.camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight);
	window.renderer = new THREE.WebGLRenderer;
	renderer.domElement.id = "display";
	document.body.prepend(renderer.domElement);
	window.frame = () => {
		requestAnimationFrame(frame);
		camera.aspect = innerWidth / innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(innerWidth, innerHeight);
		renderer.render(scene, camera);
	}
	frame();
	window.cubeMaterials = [
		new THREE.MeshBasicMaterial({color: 0xff0000}), // red
		new THREE.MeshBasicMaterial({color: 0xff8000}), // orange
		new THREE.MeshBasicMaterial({color: 0xffffff}), // white
		new THREE.MeshBasicMaterial({color: 0xffff00}), // yellow
		new THREE.MeshBasicMaterial({color: 0x00ff00}), // green
		new THREE.MeshBasicMaterial({color: 0x0000ff})  // blue
	];
	cubeMaterials[0].userData.type = "r";
	cubeMaterials[1].userData.type = "o";
	cubeMaterials[2].userData.type = "w";
	cubeMaterials[3].userData.type = "y";
	cubeMaterials[4].userData.type = "g";
	cubeMaterials[5].userData.type = "b";
	window.cubeVoidMaterial = new THREE.MeshBasicMaterial({color: 0});
	cubeVoidMaterial.userData.isVoid = true;
	window.rotators = [
		new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.75, 0.75), new THREE.MeshBasicMaterial({color: 0x800000})), // red
		new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.75, 0.75), new THREE.MeshBasicMaterial({color: 0x804000})), // orange
		new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.1, 0.75), new THREE.MeshBasicMaterial({color: 0x808080})), // white
		new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.1, 0.75), new THREE.MeshBasicMaterial({color: 0x808000})), // yellow
		new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.75, 0.1), new THREE.MeshBasicMaterial({color: 0x008000})), // green
		new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.75, 0.1), new THREE.MeshBasicMaterial({color: 0x000080})) // blue
	];
	rotators[0].position.x = 1.6;
	rotators[1].position.x = -1.6;
	rotators[2].position.y = 1.6;
	rotators[3].position.y = -1.6;
	rotators[4].position.z = 1.6;
	rotators[5].position.z = -1.6;
	for (var i = 0; i < 6; i++) {
		rotators[i].userData.index = i;
	}
	rotators.forEach(e => {
		e.name = "Rotator";
		scene.add(e);
	});
	window.smallCube = new THREE.Mesh(new THREE.BoxGeometry, cubeMaterials);
	smallCube.name = "Small Cube";
	camera.position.z = 5;
	window.cubes = new Object;
	window.space = 1.1;
	reset();
	function mouseDown(event) {
		var prevX = event.clientX, prevY = event.clientY, moved = 0;
		onmousedown = null;
		onmousemove = event => {
			if (cubeMovementEnabled) {
				if (Math.radToDeg(scene.rotation.x) > 90 || Math.radToDeg(scene.rotation.x) < -90)
					scene.rotation.y += Math.degToRad(prevX - event.clientX);
				else
					scene.rotation.y -= Math.degToRad(prevX - event.clientX);
				scene.rotation.x -= Math.degToRad(prevY - event.clientY);
				scene.rotation.x %= Math.degToRad(360);
			}
			moved += Math.sqrt(Math.pow(prevX - event.clientX, 2) + Math.pow(prevY - event.clientY, 2));
			prevX = event.clientX;
			prevY = event.clientY;
		}
		onmouseup = event => {
			if (moved < 5) {
				raycaster.setFromCamera(new THREE.Vector2(
					(event.clientX / window.innerWidth) * 2 - 1,
					-(event.clientY / window.innerHeight) * 2 + 1
				), camera);
				var intersects = raycaster.intersectObjects(scene.children);
				if (intersects.length && cubeEditingEnabled) {
					if (colorPickerEnabled && intersects[0].object.name == "Small Cube")
						colorSide(intersects);
					else if (intersects[0].object.name == "Rotator") {
						rotate(intersects, event.which == 3 || event.button == 2);
					}
				}
			}
			onmousemove = null;
			onmousedown = mouseDown;
		}
	}
	onmousedown = mouseDown;
}
function selectClr(clrIdx) {
	var clrs = document.querySelectorAll("#colorpicker tbody tr td");
	selectedClr = clrIdx;
	for (var i = 0; i < clrs.length; i++) {
		if (clrIdx == i) {
			clrs[i].classList.add("cp-selected");
		}
		else {
			clrs[i].classList.remove("cp-selected");
		}
	}
}
function colorSide(intersects) {
	if (!intersects[0].object.material[intersects[0].face.materialIndex].userData.isVoid) {
		intersects[0].object.material[intersects[0].face.materialIndex] = cubeMaterials[selectedClr];
		if (isValid()) {
			document.getElementById("invalid").style.display = "none";
		}
		else {
			document.getElementById("invalid").style.display = "";
		}
	}
}
async function rotate(intersects, right) {
	await rotateSide(intersects[0].object.userData.index, right, 5);
}
function wait(ms) {
	return new Promise(r => setTimeout(r, ms));
}
async function rotateSide(index, clockwise, speed = 25) {
	cubeEditingEnabled = false;
	var td = document.createElement("td");
	td.tabindex = 2;
	td.style.backgroundColor = ["#ff0000", "#ff8000", "#ffffff", "#ffff00", "#00ff00", "#0000ff"][index];
	if (clockwise) {
		td.style.backgroundImage = "url(clockwise.png)";
	}
	else {
		td.style.backgroundImage = "url(counter-clockwise.png)";
	}
	td.setAttribute("movedata", index + (clockwise ? "r" : "l"));
	if ((document.getElementById("moves-row").lastChild || {getAttribute: e => "6r"})
		.getAttribute("movedata")[0] == "" + index
	 && (document.getElementById("moves-row").lastChild || {getAttribute: e => "6r"})
		.getAttribute("movedata")[1] != (clockwise ? "r" : "l")) {
		(document.getElementById("moves-row").lastChild || {remove() {}}).remove();
	}
	else
		document.getElementById("moves-row").appendChild(td);
	if (document.querySelectorAll("#moves-row td").length > 2
	 && document.getElementById("moves-row").lastChild.getAttribute("movedata")
	 == document.getElementById("moves-row").lastChild.previousSibling.getAttribute("movedata")
	 && document.getElementById("moves-row").lastChild.previousSibling.getAttribute("movedata")
	 == document.getElementById("moves-row").lastChild.previousSibling.previousSibling.getAttribute("movedata")) {
		document.getElementById("moves-row").lastChild.remove();
		document.getElementById("moves-row").lastChild.remove();
		if (document.getElementById("moves-row").lastChild.getAttribute("movedata")[1] == "r") {
			document.getElementById("moves-row").lastChild.setAttribute("movedata", 
			document.getElementById("moves-row").lastChild.getAttribute("movedata")[0] + "l");
		  document.getElementById("moves-row").lastChild.style.backgroundImage = "url(counter-clockwise.png)";
		}
		else {
			document.getElementById("moves-row").lastChild.setAttribute("movedata", 
			document.getElementById("moves-row").lastChild.getAttribute("movedata")[0] + "r");
		  document.getElementById("moves-row").lastChild.style.backgroundImage = "url(clockwise.png)";
		}
	}
	var group = new THREE.Group;
	for (var i = -1; i <= 1; i++) {
		for (var j = -1; j <= 1; j++) {
			switch (index) {
				case 0:
				group.add(cubes[1][i][j]);
				break;
				case 1:
				group.add(cubes[-1][i][j]);
				break;
				case 2:
				group.add(cubes[i][1][j]);
				break;
				case 3:
				group.add(cubes[i][-1][j]);
				break;
				case 4:
				group.add(cubes[i][j][1]);
				break;
				case 5:
				group.add(cubes[i][j][-1]);
				break;
			}
		}
	}
	scene.add(group);
	await new Promise(r => {
		var i = 0, interval;
		interval = setInterval(() => {
			if (i == 90) {
				clearInterval(interval);
				r();
				return;
			}
			switch (index * 2 + Number(Boolean(clockwise))) {
				case 0:
				case 3:
				group.rotation.x += Math.degToRad(1);
				break;
				case 1:
				case 2:
				group.rotation.x -= Math.degToRad(1);
				break;
				case 4:
				case 7:
				group.rotation.y += Math.degToRad(1);
				break;
				case 5:
				case 6:
				group.rotation.y -= Math.degToRad(1);
				break;
				case 8:
				case 11:
				group.rotation.z += Math.degToRad(1);
				break;
				case 9:
				case 10:
				group.rotation.z -= Math.degToRad(1);
				break;
			}
			i++;
		}, speed);
	});
	scene.remove(group);
	for (var i = -1; i <= 1; i++) {
		for (var j = -1; j <= 1; j++) {
			switch (index) {
				case 0:
				scene.add(cubes[1][i][j]);
				break;
				case 1:
				scene.add(cubes[-1][i][j]);
				break;
				case 2:
				scene.add(cubes[i][1][j]);
				break;
				case 3:
				scene.add(cubes[i][-1][j]);
				break;
				case 4:
				scene.add(cubes[i][j][1]);
				break;
				case 5:
				scene.add(cubes[i][j][-1]);
				break;
			}
		}
	}
	switch (index * 2 + Number(Boolean(clockwise))) {
		case 0:
		swap4(
			cubes[1][1][1].material, 0,
			cubes[1][1][-1].material, 0,
			cubes[1][-1][-1].material, 0,
			cubes[1][-1][1].material, 0
		);
		swap4(
			cubes[1][1][0].material, 0,
			cubes[1][0][-1].material, 0,
			cubes[1][-1][0].material, 0,
			cubes[1][0][1].material, 0
		);
		swap4(
			cubes[1][1][1].material, 2,
			cubes[1][1][-1].material, 5,
			cubes[1][-1][-1].material, 3,
			cubes[1][-1][1].material, 4
		);
		swap4(
			cubes[1][1][0].material, 2,
			cubes[1][0][-1].material, 5,
			cubes[1][-1][0].material, 3,
			cubes[1][0][1].material, 4
		);
		swap4(
			cubes[1][1][-1].material, 2,
			cubes[1][-1][-1].material, 5,
			cubes[1][-1][1].material, 3,
			cubes[1][1][1].material, 4
		);
		break;
		case 1:
		swap4(
			cubes[1][-1][1].material, 0,
			cubes[1][-1][-1].material, 0,
			cubes[1][1][-1].material, 0,
			cubes[1][1][1].material, 0
		);
		swap4(
			cubes[1][0][1].material, 0,
			cubes[1][-1][0].material, 0,
			cubes[1][0][-1].material, 0,
			cubes[1][1][0].material, 0
		);
		swap4(
			cubes[1][-1][1].material, 4,
			cubes[1][-1][-1].material, 3,
			cubes[1][1][-1].material, 5,
			cubes[1][1][1].material, 2
		);
		swap4(
			cubes[1][0][1].material, 4,
			cubes[1][-1][0].material, 3,
			cubes[1][0][-1].material, 5,
			cubes[1][1][0].material, 2
		);
		swap4(
			cubes[1][1][1].material, 4,
			cubes[1][-1][1].material, 3,
			cubes[1][-1][-1].material, 5,
			cubes[1][1][-1].material, 2
		);
		break;
		case 2:
		swap4(
			cubes[-1][-1][1].material, 1,
			cubes[-1][-1][-1].material, 1,
			cubes[-1][1][-1].material, 1,
			cubes[-1][1][1].material, 1
		);
		swap4(
			cubes[-1][0][1].material, 1,
			cubes[-1][-1][0].material, 1,
			cubes[-1][0][-1].material, 1,
			cubes[-1][1][0].material, 1
		);
		swap4(
			cubes[-1][-1][1].material, 4,
			cubes[-1][-1][-1].material, 3,
			cubes[-1][1][-1].material, 5,
			cubes[-1][1][1].material, 2
		);
		swap4(
			cubes[-1][0][1].material, 4,
			cubes[-1][-1][0].material, 3,
			cubes[-1][0][-1].material, 5,
			cubes[-1][1][0].material, 2
		);
		swap4(
			cubes[-1][1][1].material, 4,
			cubes[-1][-1][1].material, 3,
			cubes[-1][-1][-1].material, 5,
			cubes[-1][1][-1].material, 2
		);
		break;
		case 3:
		swap4(
			cubes[-1][1][1].material, 1,
			cubes[-1][1][-1].material, 1,
			cubes[-1][-1][-1].material, 1,
			cubes[-1][-1][1].material, 1
		);
		swap4(
			cubes[-1][1][0].material, 1,
			cubes[-1][0][-1].material, 1,
			cubes[-1][-1][0].material, 1,
			cubes[-1][0][1].material, 1
		);
		swap4(
			cubes[-1][1][1].material, 2,
			cubes[-1][1][-1].material, 5,
			cubes[-1][-1][-1].material, 3,
			cubes[-1][-1][1].material, 4
		);
		swap4(
			cubes[-1][1][0].material, 2,
			cubes[-1][0][-1].material, 5,
			cubes[-1][-1][0].material, 3,
			cubes[-1][0][1].material, 4
		);
		swap4(
			cubes[-1][1][-1].material, 2,
			cubes[-1][-1][-1].material, 5,
			cubes[-1][-1][1].material, 3,
			cubes[-1][1][1].material, 4
		);
		break;
		case 4:
		swap4(
			cubes[-1][1][1].material, 2,
			cubes[-1][1][-1].material, 2,
			cubes[1][1][-1].material, 2,
			cubes[1][1][1].material, 2
		);
		swap4(
			cubes[-1][1][0].material, 2,
			cubes[0][1][-1].material, 2,
			cubes[1][1][0].material, 2,
			cubes[0][1][1].material, 2
		);
		swap4(
			cubes[-1][1][1].material, 1,
			cubes[-1][1][-1].material, 5,
			cubes[1][1][-1].material, 0,
			cubes[1][1][1].material, 4
		);
		swap4(
			cubes[-1][1][0].material, 1,
			cubes[0][1][-1].material, 5,
			cubes[1][1][0].material, 0,
			cubes[0][1][1].material, 4
		);
		swap4(
			cubes[-1][1][1].material, 4,
			cubes[-1][1][-1].material, 1,
			cubes[1][1][-1].material, 5,
			cubes[1][1][1].material, 0
		);
		break;
		case 5:
		swap4(
			cubes[1][1][1].material, 2,
			cubes[1][1][-1].material, 2,
			cubes[-1][1][-1].material, 2,
			cubes[-1][1][1].material, 2
		);
		swap4(
			cubes[0][1][1].material, 2,
			cubes[1][1][0].material, 2,
			cubes[0][1][-1].material, 2,
			cubes[-1][1][0].material, 2
		);
		swap4(
			cubes[1][1][1].material, 4,
			cubes[1][1][-1].material, 0,
			cubes[-1][1][-1].material, 5,
			cubes[-1][1][1].material, 1
		);
		swap4(
			cubes[0][1][1].material, 4,
			cubes[1][1][0].material, 0,
			cubes[0][1][-1].material, 5,
			cubes[-1][1][0].material, 1
		);
		swap4(
			cubes[1][1][1].material, 0,
			cubes[1][1][-1].material, 5,
			cubes[-1][1][-1].material, 1,
			cubes[-1][1][1].material, 4
		);
		break;
		case 6:
		swap4(
			cubes[1][-1][1].material, 3,
			cubes[1][-1][-1].material, 3,
			cubes[-1][-1][-1].material, 3,
			cubes[-1][-1][1].material, 3
		);
		swap4(
			cubes[0][-1][1].material, 3,
			cubes[1][-1][0].material, 3,
			cubes[0][-1][-1].material, 3,
			cubes[-1][-1][0].material, 3
		);
		swap4(
			cubes[1][-1][1].material, 4,
			cubes[1][-1][-1].material, 0,
			cubes[-1][-1][-1].material, 5,
			cubes[-1][-1][1].material, 1
		);
		swap4(
			cubes[0][-1][1].material, 4,
			cubes[1][-1][0].material, 0,
			cubes[0][-1][-1].material, 5,
			cubes[-1][-1][0].material, 1
		);
		swap4(
			cubes[1][-1][1].material, 0,
			cubes[1][-1][-1].material, 5,
			cubes[-1][-1][-1].material, 1,
			cubes[-1][-1][1].material, 4
		);
		break;
		case 7:
		swap4(
			cubes[-1][-1][1].material, 3,
			cubes[-1][-1][-1].material, 3,
			cubes[1][-1][-1].material, 3,
			cubes[1][-1][1].material, 3
		);
		swap4(
			cubes[-1][-1][0].material, 3,
			cubes[0][-1][-1].material, 3,
			cubes[1][-1][0].material, 3,
			cubes[0][-1][1].material, 3
		);
		swap4(
			cubes[-1][-1][1].material, 1,
			cubes[-1][-1][-1].material, 5,
			cubes[1][-1][-1].material, 0,
			cubes[1][-1][1].material, 4
		);
		swap4(
			cubes[-1][-1][0].material, 1,
			cubes[0][-1][-1].material, 5,
			cubes[1][-1][0].material, 0,
			cubes[0][-1][1].material, 4
		);
		swap4(
			cubes[-1][-1][1].material, 4,
			cubes[-1][-1][-1].material, 1,
			cubes[1][-1][-1].material, 5,
			cubes[1][-1][1].material, 0
		);
		break;
		case 8:
		swap4(
			cubes[1][1][1].material, 4,
			cubes[1][-1][1].material, 4,
			cubes[-1][-1][1].material, 4,
			cubes[-1][1][1].material, 4
		);
		swap4(
			cubes[1][0][1].material, 4,
			cubes[0][-1][1].material, 4,
			cubes[-1][0][1].material, 4,
			cubes[0][1][1].material, 4
		);
		swap4(
			cubes[1][1][1].material, 2,
			cubes[1][-1][1].material, 0,
			cubes[-1][-1][1].material, 3,
			cubes[-1][1][1].material, 1
		);
		swap4(
			cubes[1][0][1].material, 0,
			cubes[0][-1][1].material, 3,
			cubes[-1][0][1].material, 1,
			cubes[0][1][1].material, 2
		);
		swap4(
			cubes[1][1][1].material, 0,
			cubes[1][-1][1].material, 3,
			cubes[-1][-1][1].material, 1,
			cubes[-1][1][1].material, 2
		);
		break;
		case 9:
		swap4(
			cubes[-1][1][1].material, 4,
			cubes[-1][-1][1].material, 4,
			cubes[1][-1][1].material, 4,
			cubes[1][1][1].material, 4
		);
		swap4(
			cubes[0][1][1].material, 4,
			cubes[-1][0][1].material, 4,
			cubes[0][-1][1].material, 4,
			cubes[1][0][1].material, 4
		);
		swap4(
			cubes[-1][1][1].material, 1,
			cubes[-1][-1][1].material, 3,
			cubes[1][-1][1].material, 0,
			cubes[1][1][1].material, 2
		);
		swap4(
			cubes[0][1][1].material, 2,
			cubes[-1][0][1].material, 1,
			cubes[0][-1][1].material, 3,
			cubes[1][0][1].material, 0
		);
		swap4(
			cubes[-1][1][1].material, 2,
			cubes[-1][-1][1].material, 1,
			cubes[1][-1][1].material, 3,
			cubes[1][1][1].material, 0
		);
		break;
		case 10:
		swap4(
			cubes[-1][1][-1].material, 5,
			cubes[-1][-1][-1].material, 5,
			cubes[1][-1][-1].material, 5,
			cubes[1][1][-1].material, 5
		);
		swap4(
			cubes[0][1][-1].material, 5,
			cubes[-1][0][-1].material, 5,
			cubes[0][-1][-1].material, 5,
			cubes[1][0][-1].material, 5
		);
		swap4(
			cubes[-1][1][-1].material, 1,
			cubes[-1][-1][-1].material, 3,
			cubes[1][-1][-1].material, 0,
			cubes[1][1][-1].material, 2
		);
		swap4(
			cubes[0][1][-1].material, 2,
			cubes[-1][0][-1].material, 1,
			cubes[0][-1][-1].material, 3,
			cubes[1][0][-1].material, 0
		);
		swap4(
			cubes[-1][1][-1].material, 2,
			cubes[-1][-1][-1].material, 1,
			cubes[1][-1][-1].material, 3,
			cubes[1][1][-1].material, 0
		);
		break;
		case 11:
		swap4(
			cubes[1][1][-1].material, 5,
			cubes[1][-1][-1].material, 5,
			cubes[-1][-1][-1].material, 5,
			cubes[-1][1][-1].material, 5
		);
		swap4(
			cubes[1][0][-1].material, 5,
			cubes[0][-1][-1].material, 5,
			cubes[-1][0][-1].material, 5,
			cubes[0][1][-1].material, 5
		);
		swap4(
			cubes[1][1][-1].material, 2,
			cubes[1][-1][-1].material, 0,
			cubes[-1][-1][-1].material, 3,
			cubes[-1][1][-1].material, 1
		);
		swap4(
			cubes[1][0][-1].material, 0,
			cubes[0][-1][-1].material, 3,
			cubes[-1][0][-1].material, 1,
			cubes[0][1][-1].material, 2
		);
		swap4(
			cubes[1][1][-1].material, 0,
			cubes[1][-1][-1].material, 3,
			cubes[-1][-1][-1].material, 1,
			cubes[-1][1][-1].material, 2
		);
		break;
	}
	cubeEditingEnabled = true;
}
function swap4(...args) {
	var visokSwap = args[0][args[1]];
	args[0][args[1]] = args[2][args[3]];
	args[2][args[3]] = args[4][args[5]];
	args[4][args[5]] = args[6][args[7]];
	args[6][args[7]] = visokSwap;
}
async function randomize(button) {
	button.classList.add("enabled");
	for (var i = 0; i < 10; i++) {
		await rotateSide(Math.floor(Math.random() * 6), Math.random() < 0.5, 1);
	}
	button.classList.remove("enabled");
}
function reset() {
	document.getElementById("moves-row").innerHTML = null;
	document.getElementById("invalid").style.display = "none";
	for (var i = scene.children.length - 1; i >= 0; i--) {
		if (scene.children[i].name == "Small Cube")
			scene.remove(scene.children[i]);
	}
	for (var i = -1; i <= 1; i++) {
		cubes[i] = new Object;
		for (var j = -1; j <= 1; j++) {
			cubes[i][j] = new Object;
			for (var k = -1; k <= 1; k++) {
				cubes[i][j][k] = smallCube.clone();
				cubes[i][j][k].material = Array.from(cubes[i][j][k].material);
				cubes[i][j][k].position.set(i * space, j * space, k * space);
				if (i < 1) {
					cubes[i][j][k].material[0] = cubeVoidMaterial;
				}
				if (i > -1) {
					cubes[i][j][k].material[1] = cubeVoidMaterial;
				}
				if (j < 1) {
					cubes[i][j][k].material[2] = cubeVoidMaterial;
				}
				if (j > -1) {
					cubes[i][j][k].material[3] = cubeVoidMaterial;
				}
				if (k < 1) {
					cubes[i][j][k].material[4] = cubeVoidMaterial;
				}
				if (k > -1) {
					cubes[i][j][k].material[5] = cubeVoidMaterial;
				}
				scene.add(cubes[i][j][k]);
			}
		}
	}
}
function toggleColorPicker(colorPickerButton) {
	colorPickerEnabled = !colorPickerEnabled;
	if (colorPickerEnabled) {
		colorPickerButton.classList.add("enabled");
		document.body.classList.add("cp-enabled");
	}
	else {
		colorPickerButton.classList.remove("enabled");
		document.body.classList.remove("cp-enabled");
	}
}
class Direction {
	constructor(side = "g", up = "w") {
		this.side = side;
		this.up = up;
	}
	side = "g";
	up = "w";
	rotateRight() {
		var r = {
			gw: "rw",
			rw: "bw",
			bw: "ow",
			ow: "gw",
			gy: "oy",
			ry: "gy",
			by: "ry",
			oy: "by"
		}[this.side + this.up];
		this.side = r[0];
		this.up = r[1];
		return this;
	}
	rotateLeft() {
		var r = {
			gw: "ow",
			rw: "gw",
			bw: "rw",
			ow: "bw",
			gy: "ry",
			ry: "by",
			by: "oy",
			oy: "gy"
		}[this.side + this.up];
		this.side = r[0];
		this.up = r[1];
		return this;
	}
	rotate180() {
		this.up = (this.up == "w") ? "y" : "w";
		return this;
	}
	get sideIndex() {
		return {
			g: 4,
			r: 0,
			b: 5,
			o: 1,
			w: 2,
			y: 3
		}[this.side];
	}
	clone() {
		return new Direction(this.side, this.up);
	}
}
function findPiece(sides) {
	if (!sides.length || sides.length > 3)
		return null;
	sides = sides.split("");
	sides.sort();
	for (var i = -1; i <= 1; i++) {
		for (var j = -1; j <= 1; j++) {
			for (var k = -1; k <= 1; k++) {
				var sidesOnThis = new Array;
				for (var side = 0; side < 6; side++) {
					if (!cubes[i][j][k].material[side].userData.isVoid) {
						sidesOnThis.push(cubes[i][j][k].material[side].userData.type);
					}
				}
				if (sidesOnThis.length != sides.length)
					continue;
				sidesOnThis.sort();
				var good = true;
				for (var t = 0; t < sides.length; t++) {
					if (!good)
						continue;
					if (sidesOnThis[t] != sides[t]) {
						good = false;
					}
				}
				if (good)
					return {
						x: i,
						y: j,
						z: k
					};
			}
		}
	}
	return null;
}
function opposite(direction) {
	return {
		g: "b",
		b: "g",
		r: "o",
		o: "r",
		y: "w",
		w: "y"
	}[direction];
}
async function performMoves(direction, moves) {
	moves = moves.split(" ");
	for (var i = 0; i < moves.length; i++) {
		await performMove(direction, moves[i]);
	}
}
async function performMove(direction, move) {
	var dCopy = direction.clone(), index;
	switch (move[0]) {
		case "R":
		index = dCopy.rotateRight().sideIndex;
		break;
		case "L":
		index = dCopy.rotateLeft().sideIndex;
		break;
		case "B":
		index = dCopy.rotateLeft().rotateLeft().sideIndex;
		break;
		case "F":
		index = dCopy.sideIndex;
		break;
		case "D":
		index = new Direction(opposite(dCopy.up)).sideIndex;
		break;
		case "U":
		index = new Direction(dCopy.up).sideIndex;
		break;
	}
	await rotateSide(index, move[1] != "i");
}
function isValid() {
	var sides = {
		r: 0,
		o: 0,
		w: 0,
		y: 0,
		g: 0,
		b: 0
	};
	for (var i = -1; i <= 1; i++) {
		for (var j = -1; j <= 1; j++) {
			for (var k = -1; k <= 1; k++) {
				for (var s = 0; s < 6; s++) {
					if (!cubes[i][j][k].material[s].userData.isVoid) {
						sides[cubes[i][j][k].material[s].userData.type]++;
					}
				}
			}
		}
	}
	for (var value of Object.values(sides)) {
		if (value != 9)
			return false;
	}
	return true;
}
async function solve(button) {
	if (!isValid()) {
		alert("Cube invalid!");
		return;
	}
	button.classList.add("enabled");
	cubeEditingEnabled = false;
	var progress = document.getElementById("progress");
	progress.value = 0;
	progress.max = 7;
	progress.classList.add("enabled");
	await solve1();
	setProgressValue(1);
	await solve2();
	setProgressValue(2);
	await solve3();
	setProgressValue(3);
	await solve4();
	setProgressValue(4);
	await solve5();
	while (!isSolved()) {
		setProgressValue(5);
		await solve6();
		setProgressValue(6);
		await solve7();
	}
	setProgressValue(7);
	progress.classList.remove("enabled");
	button.classList.remove("enabled");
	cubeEditingEnabled = true;
	function setProgressValue(value, time = 21) {
		var pr = -0.05, oldVal = progress.value;
		var interval = setInterval(() => {
			pr += 0.05;
			progress.value = (value - oldVal) * (-(Math.cos(Math.PI * pr) - 1) / 2) + oldVal;
			if (pr >= 1)
				clearInterval(interval);
		}, time);
	}
}
async function solve1() {
	var direction = new Direction, sideToBeRotated = null, rotatingTimes = 0;
	for (var i = 0; i < 4; i++) {
		var place = findPiece(direction.side + "w");
		if (place.y == 1) {
			if (place.x == 0 && place.z == 1) {
				await rotateSide(4, false);
				sideToBeRotated = 4;
				rotatingTimes++;
			}
			else if (place.x == 1 && place.z == 0) {
				await rotateSide(0, false);
				sideToBeRotated = 0;
				rotatingTimes++;
			}
			else if (place.x == 0 && place.z == -1) {
				await rotateSide(5, false);
				sideToBeRotated = 5;
				rotatingTimes++;
			}
			else if (place.x == -1 && place.z == 0) {
				await rotateSide(1, false);
				sideToBeRotated = 1;
				rotatingTimes++;
			}
			place = findPiece(direction.side + "w");
		}
		if (place.y == 0) {
			if (place.x == 1 && place.z == 1) {
				await rotateSide(0, false);
				sideToBeRotated = 0;
				rotatingTimes++;
			}
			else if (place.x == 1 && place.z == -1) {
				await rotateSide(5, false);
				sideToBeRotated = 5;
				rotatingTimes++;
			}
			else if (place.x == -1 && place.z == -1) {
				await rotateSide(1, false);
				sideToBeRotated = 1;
				rotatingTimes++;
			}
			else if (place.x == -1 && place.z == 1) {
				await rotateSide(4, false);
				sideToBeRotated = 4;
				rotatingTimes++;
			}
			place = findPiece(direction.side + "w");
		}
		await rotateSide(3, false);
		while (rotatingTimes > 0) {
			await rotateSide(sideToBeRotated, true);
			rotatingTimes--;
		}
		var temp1 = findPiece(direction.side);
		while (temp1.x != findPiece(direction.side + "w").x
			|| temp1.z != findPiece(direction.side + "w").z) {
			await rotateSide(3, false);
		}
		await rotateSide(direction.sideIndex, false);
		await rotateSide(direction.sideIndex, false);
		place = findPiece(direction.side + "w");
		if (cubes[place.x][place.y][place.z].material[2].userData.type != "w") {
			await performMoves(direction.clone().rotateLeft(), "Ri U Fi Ui");
		}
		direction.rotateRight();
	}
}
async function solve2() {
	var direction = new Direction;
	for (var i = 0; i < 4; i++) {
		var place = findPiece(direction.side + "w" + direction.clone().rotateRight().side);
		if (place.y == 1) {
			if (place.x == 1 && place.z == 1) {
				await performMoves(new Direction, "Ri Di R");
			}
			else if (place.x == 1 && place.z == -1) {
				await performMoves(new Direction("r"), "Ri Di R");
			}
			else if (place.x == -1 && place.z == -1) {
				await performMoves(new Direction("b"), "Ri Di R");
			}
			else if (place.x == -1 && place.z == 1) {
				await performMoves(new Direction("o"), "Ri Di R");
			}
			place = findPiece(direction.side + "w" + direction.clone().rotateRight().side);
		}
		var pos = {x: 0, z: 0};
		if (findPiece(direction.side).z != 0) {
			pos.z = findPiece(direction.side).z;
			pos.x = findPiece(direction.clone().rotateRight().side).x;
		}
		else {
			pos.x = findPiece(direction.side).x;
			pos.z = findPiece(direction.clone().rotateRight().side).z;
		}
		while (place.x != pos.x || place.z != pos.z) {
			await rotateSide(3, false);
			place = findPiece(direction.side + "w" + direction.clone().rotateRight().side);
		}
		while (cubes[pos.x][1][pos.z].material[2].userData.type != "w"
			|| cubes[pos.x][1][pos.z].material[direction.sideIndex].userData.type != direction.side
			|| cubes[pos.x][1][pos.z].material[direction.clone().rotateRight().sideIndex]
			.userData.type != direction.clone().rotateRight().side) {
			await performMoves(direction, "Ri Di R D");
		}
		direction.rotateRight();
	}
}
async function solve3() {
	var direction = new Direction("g", "y");
	for (var i = 0; i < 4; i++) {
		var place = findPiece(direction.side + direction.clone().rotateRight().side);
		if (place.y == 0) {
			if (place.x == 1 && place.z == 1) {
				await performMoves(new Direction("r", "y"), "U R Ui Ri Ui Fi U F");
			}
			else if (place.x == 1 && place.z == -1) {
				await performMoves(new Direction("b", "y"), "U R Ui Ri Ui Fi U F");
			}
			else if (place.x == -1 && place.z == -1) {
				await performMoves(new Direction("o", "y"), "U R Ui Ri Ui Fi U F");
			}
			else if (place.x == -1 && place.z == 1) {
				await performMoves(new Direction("g", "y"), "U R Ui Ri Ui Fi U F");
			}
			place = findPiece(direction.side + direction.clone().rotateRight().side);
		}
		if (cubes[place.x][place.y][place.z].material[3].userData.type != direction.side) {
			var pos = findPiece(direction.side);
			while (pos.x != place.x || pos.z != place.z) {
				await rotateSide(3, true);
				place = findPiece(direction.side + direction.clone().rotateRight().side);
			}
			await performMoves(direction, "U R Ui Ri Ui Fi U F");
		}
		else {
			var pos = findPiece(direction.clone().rotateRight().side);
			while (pos.x != place.x || pos.z != place.z) {
				await rotateSide(3, true);
				place = findPiece(direction.side + direction.clone().rotateRight().side);
			}
			await performMoves(direction.clone().rotateRight(), "Ui Li U L U F Ui Fi");
		}
		direction.rotateRight();
	}
}
async function solve4() {
	while (cubes[1][-1][0].material[3].userData.type != "y"
		|| cubes[-1][-1][0].material[3].userData.type != "y"
		|| cubes[0][-1][1].material[3].userData.type != "y"
		|| cubes[0][-1][-1].material[3].userData.type != "y") {
		if (cubes[1][-1][0].material[3].userData.type == "y"
		 && cubes[-1][-1][0].material[3].userData.type == "y") {
			await performMoves(new Direction("b", "y"), "F R U Ri Ui Fi");
		}
		else if (cubes[0][-1][1].material[3].userData.type == "y"
			  && cubes[0][-1][-1].material[3].userData.type == "y") {
			await performMoves(new Direction("o", "y"), "F R U Ri Ui Fi");
		}
		else if (cubes[0][-1][-1].material[3].userData.type == "y"
			  && cubes[-1][-1][0].material[3].userData.type == "y") {
			await performMoves(new Direction("r", "y"), "F U R Ui Ri Fi");
		}
		else if (cubes[0][-1][1].material[3].userData.type == "y"
			  && cubes[-1][-1][0].material[3].userData.type == "y") {
			await performMoves(new Direction("b", "y"), "F U R Ui Ri Fi");
		}
		else if (cubes[0][-1][1].material[3].userData.type == "y"
			  && cubes[1][-1][0].material[3].userData.type == "y") {
			await performMoves(new Direction("o", "y"), "F U R Ui Ri Fi");
		}
		else if (cubes[0][-1][-1].material[3].userData.type == "y"
			  && cubes[1][-1][0].material[3].userData.type == "y") {
			await performMoves(new Direction("g", "y"), "F U R Ui Ri Fi");
		}
		else {
			await performMoves(new Direction("g", "y"), "F U R Ui Ri Fi");
		}
	}
}
async function solve5() {
	while (cubes[1][-1][1].material[3].userData.type != "y"
		|| cubes[1][-1][-1].material[3].userData.type != "y"
		|| cubes[-1][-1][-1].material[3].userData.type != "y"
		|| cubes[-1][-1][1].material[3].userData.type != "y") {
		if ([cubes[1][-1][1].material[3].userData.type == "y",
			cubes[1][-1][-1].material[3].userData.type == "y",
			cubes[-1][-1][-1].material[3].userData.type == "y",
			cubes[-1][-1][1].material[3].userData.type == "y"].count(true) >= 2) {
			while (cubes[1][-1][1].material[4].userData.type != "y") {
				await rotateSide(3, false);
			}
		}
		else if ([cubes[1][-1][1].material[3].userData.type == "y",
			cubes[1][-1][-1].material[3].userData.type == "y",
			cubes[-1][-1][-1].material[3].userData.type == "y",
			cubes[-1][-1][1].material[3].userData.type == "y"].count(true) == 1) {
			while (cubes[1][-1][1].material[3].userData.type != "y") {
				await rotateSide(3, false);
			}
		}
		else {
			while (cubes[1][-1][1].material[0].userData.type != "y") {
				await rotateSide(3, false);
			}
		}
		await performMoves(new Direction("g", "y"), "R U Ri U R U U Ri");
	}
}
async function solve6() {
	while ([cubes[1][-1][1].material[0].userData.type == "r",
			cubes[1][-1][-1].material[0].userData.type == "r",
			cubes[-1][-1][1].material[1].userData.type == "o",
			cubes[-1][-1][-1].material[1].userData.type == "o"].count(true) < 2) {
		await rotateSide(3, false);
	}
	if (cubes[1][-1][1].material[0].userData.type == "r"
	 && cubes[1][-1][-1].material[0].userData.type == "r"
	 && cubes[-1][-1][1].material[1].userData.type == "o"
	 && cubes[-1][-1][-1].material[1].userData.type == "o") {
		return;
	}
	if ((cubes[1][-1][1].material[0].userData.type == "r"
	 && cubes[-1][-1][-1].material[1].userData.type == "o")
	 || (cubes[-1][-1][1].material[0].userData.type == "r"
	 && cubes[1][-1][-1].material[1].userData.type == "o")) {
		await performMoves(new Direction("g", "y"), "Ri F Ri B B R Fi Ri B B R R Ui");
	}
	if (cubes[1][-1][1].material[0].userData.type == "r"
	 && cubes[1][-1][-1].material[0].userData.type == "r") {
		await performMoves(new Direction("o", "y"), "Ri F Ri B B R Fi Ri B B R R Ui");
	}
	else if (cubes[-1][-1][1].material[1].userData.type == "o"
	 && cubes[-1][-1][-1].material[1].userData.type == "o") {
		await performMoves(new Direction("r", "y"), "Ri F Ri B B R Fi Ri B B R R Ui");
	}
	else if (cubes[-1][-1][1].material[1].userData.type == "o"
	 && cubes[1][-1][1].material[0].userData.type == "r") {
		await performMoves(new Direction("b", "y"), "Ri F Ri B B R Fi Ri B B R R Ui");
	}
	else if (cubes[-1][-1][-1].material[1].userData.type == "o"
	 && cubes[1][-1][-1].material[0].userData.type == "r") {
		await performMoves(new Direction("g", "y"), "Ri F Ri B B R Fi Ri B B R R Ui");
	}
}
async function solve7() {
	var direction = new Direction("g", "y");
	if (cubes[1][-1][0].material[0].userData.type == "r")
		direction.side = "o";
	else if (cubes[-1][-1][0].material[1].userData.type == "o")
		direction.side = "r";
	else if (cubes[0][-1][1].material[4].userData.type == "g")
		direction.side = "b";
	await performMoves(direction, "F F U L Ri F F Li R U F F");
	if (cubes[1][-1][0].material[0].userData.type == "r")
		direction.side = "o";
	else if (cubes[-1][-1][0].material[1].userData.type == "o")
		direction.side = "r";
	else if (cubes[0][-1][1].material[4].userData.type == "g")
		direction.side = "b";
	else if (cubes[0][-1][-1].material[5].userData.type == "b")
		direction.side = "g";
	while (cubes[findPiece(direction.side).x][-1][findPiece(direction.side).z]
		  .material[direction.sideIndex].userData.type != direction.side) {
		await performMoves(direction, "F F U L Ri F F Li R U F F");
	}
}
function isSolved() {
	for (var i = -1; i <= 1; i++) {
		for (var j = -1; j <= 1; j++) {
			for (var k = -1; k <= 1; k++) {
				var arr = Array.from(cubeMaterials);
				if (i < 1) {
					arr[0] = cubeVoidMaterial;
				}
				if (i > -1) {
					arr[1] = cubeVoidMaterial;
				}
				if (j < 1) {
					arr[2] = cubeVoidMaterial;
				}
				if (j > -1) {
					arr[3] = cubeVoidMaterial;
				}
				if (k < 1) {
					arr[4] = cubeVoidMaterial;
				}
				if (k > -1) {
					arr[5] = cubeVoidMaterial;
				}
				for (var s = 0; s < 6; s++) {
					if (arr[s].uuid != cubes[i][j][k].material[s].uuid)
						return false;
				}
			}
		}
	}
	return true;
}
async function makeCreditText(text, direction) {
	var obj = new THREE.Mesh(
		new THREE.TextGeometry(text, {
			font: MontserratFont,
			size: 0.5,
			height: 0.05
		}).center(),
		new THREE.MeshBasicMaterial({
			color: [0xff8000, 0xff0000, 0xffff00, 0xffffff, 0xff, 0xff00][direction.sideIndex],
			transparent: true
		})
	);
	switch (direction.side) {
		case "r":
		obj.position.x = 2;
		obj.rotation.y = Math.degToRad(90);
		break;
		case "o":
		obj.position.x = -2;
		obj.rotation.y = Math.degToRad(-90);
		break;
		case "g":
		obj.position.z = 2;
		obj.rotation.y = Math.degToRad(0);
		break;
		case "b":
		obj.position.z = -2;
		obj.rotation.y = Math.degToRad(180);
		break;
	}
	scene.add(obj);
	obj.position.y = -2;
	obj.material.opacity = 0;
	await new Promise(r => {
		var interval = setInterval(() => {
			obj.position.y += 0.05;
			if (obj.position.y < 1) {
				obj.material.opacity = Math.min(obj.material.opacity + 0.05, 1);
			}
			else {
				obj.material.opacity -= 0.05;
			}
			if (obj.position.y >= 2) {
				scene.remove(obj);
				clearInterval(interval);
				r();
			}
		}, 60);
	});
}
async function credits(button) {
	var direction = new Direction;
	button.classList.add("enabled");
	cubeEditingEnabled = false;
	makeCreditText("Developers", direction);
	await wait(1500);
	makeCreditText("Nikola Stojkovski", direction);
	await wait(1000);
	await makeCreditText("Filip Kalkashliev", direction);
	direction.rotateRight();
	makeCreditText("Coding", direction);
	await wait(1500);
	await makeCreditText("Nikola Stojkovski", direction);
	direction.rotateRight();
	makeCreditText("Debugging", direction);
	await wait(1500);
	await makeCreditText("Filip Kalkashliev", direction);
	direction.rotateRight();
	makeCreditText("Special thanks to", direction);
	await wait(1500);
	makeCreditText("Three.js", direction);
	await wait(1000);
	await makeCreditText("Sublime Text", direction);
	direction.rotateRight();
	makeCreditText("Thank you", direction);
	await wait(1000);
	await makeCreditText("for using!", direction);
	button.classList.remove("enabled");
	cubeEditingEnabled = true;
}
function showHelp(button) {
	cubeEditingEnabled = false;
	cubeMovementEnabled = false;
	button.classList.add("enabled");
	document.getElementById("help").classList.add("enabled");
	document.getElementById("help-blur").classList.add("enabled");
}
function hideHelp(button) {
	cubeEditingEnabled = true;
	cubeMovementEnabled = true;
	button.classList.remove("enabled");
	document.getElementById("help").classList.remove("enabled");
	document.getElementById("help-blur").classList.remove("enabled");
}