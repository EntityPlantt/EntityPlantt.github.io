Math.degToRad = deg => deg / 180 * Math.PI;
Math.radToDeg = rad => rad * 180 / Math.PI;
function innerSmaller() {
	return innerWidth < innerHeight ? innerWidth : innerHeight;
}
function innerLarger() {
	return innerWidth > innerHeight ? innerWidth : innerHeight;
}
window.onload = function() {
	window.scene = new THREE.Scene();
	scene.rotation.z = Math.degToRad(-15);
	scene.background = new THREE.Color(0xffffff);
	window.camera = new THREE.PerspectiveCamera(75, 1, 0.01, 1000);
	camera.position.set(0, 2, 3);
	window.renderer = new THREE.WebGLRenderer();
	document.getElementById("canvas-container").appendChild(renderer.domElement);
	renderer.domElement.id = "threejs-canvas";
	window.Elements = new Object();
	var canvas = document.createElement("canvas");
	canvas.width = canvas.height = 1000;
	var context = canvas.getContext("2d");
	context.fillStyle = "#111";
	context.fillRect(0, 0, 1000, 1000);
	context.fillStyle = "red";
	context.font = "200px Arial";
	context.textAlign = "center";
	context.fillText("H", 200, 250);
	context.fillText("M", 200, 550);
	{
		var img = document.createElement("img");
		img.src = document.getElementById("sun-data-url").innerHTML;
		img.onload = () => {
			context.drawImage(img, 100, 700);
			Elements.watch.material[2] = new THREE.MeshPhongMaterial({map: new THREE.TextureLoader().load(canvas.toDataURL())});
		};
	}
	var phongBlack = new THREE.MeshPhongMaterial({color: 0});
	Elements.watchFrame = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.45, 1.1), new THREE.MeshPhongMaterial({color: 0x808080}));
	Elements.watchFrame.position.set(0, 0, 0);
	Elements.watchWall = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.25, 1.3), new THREE.MeshPhongMaterial({map: new THREE.TextureLoader().load("data:image/jpeg;base64,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")}));
	Elements.watchWall.position.set(0, 0, 0);
	Elements.dirLight = new THREE.DirectionalLight(0xffffff, 1);
	Elements.dirLight.position.set(0.5, 1, 0.5);
	Elements.watch = new THREE.Mesh(new THREE.BoxGeometry(1, 0.5, 1), [
		phongBlack,
		phongBlack,
		null,
		phongBlack,
		phongBlack,
		phongBlack
	]);
	Elements.watch.position.set(0, 0, 0);
	window.ElementItems = new Object();
	ElementItems.ledGeometry = new THREE.BoxGeometry(0.0675, 0.05, 0.2);
	ElementItems.ledOffMaterial = new THREE.MeshPhongMaterial({color: 0xdddddd});
	ElementItems.ledOnMaterial = new THREE.MeshBasicMaterial({color: 0xff0000});
	[
		["H8", 400, 150],
		["H4", 500, 150],
		["H2", 600, 150],
		["H1", 700, 150],
		["M32", 400, 450],
		["M16", 500, 450],
		["M8", 600, 450],
		["M4", 700, 450],
		["M2", 800, 450],
		["M1", 900, 450],
		["AM", 400, 800],
		["PM", 500, 800]
	].forEach(elm => {
		Elements["led" + elm[0]] = new THREE.Mesh(ElementItems.ledGeometry, ElementItems.ledOffMaterial);
		Elements["led" + elm[0]].position.set(elm[1] / 1000 - 0.5, 0.25, elm[2] / 1000 - 0.5);
		Elements["ledLight" + elm[0]] = new THREE.PointLight(0xff0000, 0.5);
		Elements["ledLight" + elm[0]].position = Elements["led" + elm[0]].position;
	});
	Object.values(Elements).forEach(elm => scene.add(elm));
	document.getElementById("inp-set-time").onchange = () => {
		var time = document.getElementById("inp-set-time").value.split(":"), pm = false;
		time[0] = parseInt(time[0]); time[1] = parseInt(time[1]);
		if (time[0] >= 12) {
			pm = true;
			time[0] -= 12;
		}
		if (time[0] == 0) time[0] = 12;
		[
			["H8", time[0] % 16 >= 8],
			["H4", time[0] % 8 >= 4],
			["H2", time[0] % 4 >= 2],
			["H1", time[0] % 2 == 1],
			["M32", time[1] % 64 >= 32],
			["M16", time[1] % 32 >= 16],
			["M8", time[1] % 16 >= 8],
			["M4", time[1] % 8 >= 4],
			["M2", time[1] % 4 >= 2],
			["M1", time[1] % 2 == 1],
			["AM", !pm],
			["PM", pm]
		].forEach(elm => {
			Elements["led" + elm[0]].material = elm[1] ? ElementItems.ledOnMaterial : ElementItems.ledOffMaterial;
			Elements["ledLight" + elm[0]].intensity = elm[1] ? 1 : 0;
		});
	}
	function frame() {
		if (camera.position.z > 0.5) {
			camera.position.z -= 0.05;
			camera.lookAt(0, 0, 0);
		}
		requestAnimationFrame(frame);
		if (document.getElementById("rd-setTime-sync").checked || document.getElementById("inp-set-time").value == "") {
			var d = new Date(), oldD = document.getElementById("inp-set-time").value;
			document.getElementById("inp-set-time").value = d.getHours() + ":" + ((d.getMinutes() > 9) ? d.getMinutes() : ("0" + d.getMinutes()));
			if (oldD != d.getHours() + ":" + ((d.getMinutes() > 9) ? d.getMinutes() : ("0" + d.getMinutes()))) {document.getElementById("inp-set-time").onchange()}
		}
		renderer.setSize(innerSmaller(), innerSmaller());
		renderer.render(scene, camera);
	}
	frame();
}
function toggleMenu() {
	document.getElementById("menu").classList.toggle("shown");
}