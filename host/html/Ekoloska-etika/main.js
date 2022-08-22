var music, assets = {images: {}};
onload = () => {
	assets.images.earth = new ImageAsset("earth", 100, 100, 800, 800);
	assets.images.main_poster = new ImageAsset("main-poster", 250, -750, 500, 750);
}
function start() {
	music = new Audio("music.mp3");
	music.play();
	document.html = document.getElementById("root");
	document.html.classList.add("started");
	setTimeout(() => {
		document.getElementById("start").remove();
		document.getElementById("attribution-block").remove();
		document.body.style.backgroundColor = "black";
		assets.scene.add(assets.images.main_poster);
		assets.images.main_poster.rotation = 10;
		var int = setInterval(() => {
			assets.images.main_poster.y += 2;
			assets.scene.draw();
			if (assets.images.main_poster.y >= 0) {
				clearInterval(int);
			}
		}, 1);
	}, 2000);
	document.body.appendChild(document.getElementById("draw-canvas"));
	assets.scene = new Scene(document.getElementById("draw-canvas"));
	assets.scene.add(assets.images.earth);
	assets.scene.draw();
}
class Scene {
	background = "black";
	constructor(canvas) {
		this.assets = new Array;
		this.canvas = canvas;
		this.context = canvas.getContext("2d");
	}
	add(asset) {
		if (asset.parent) {
			asset.parent.remove(asset);
		}
		this.assets.push(asset);
		asset.parent = this;
	}
	remove(asset) {
		for (var i = this.assets.length - 1; i >= 0; i--) {
			if (this.assets[i].uuid == asset.uuid) {
				this.assets[i].parent = null;
				this.assets.splice(i, 1);
			}
		}
	}
	draw() {
		this.context.fillStyle = this.background;
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
		this.assets.forEach(asset => {
			asset.draw();
		});
	}
}
class Asset {
	parent = null;
	constructor() {
		this.uuid = crypto.randomUUID();
	}
}
class ImageAsset extends Asset {
	constructor(image, x = 0, y = 0, width = 100, height = 100, rotation = 0) {
		super();
		this.width = width;
		this.height = height;
		this.x = x;
		this.y = y;
		this.image = document.createElement("img");
		this.image.src = `assets/${image}.png`;
		this.rotation = rotation;
	}
	draw() {
		var ctx = this.parent.context;
		ctx.save();
		//ctx.translate(this.parent.canvas.width / 2, this.parent.canvas.height / 2);
		ctx.rotate(this.rotation * Math.PI / 180);
		ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
		ctx.restore();
	}
	set rotation(value) {
		this.image.style.transform = `rotate(${value}deg)`;
		this._rotation = value;
	}
	get rotation() {
		return this._rotation;
	}
}
class TextAsset extends Asset {
	constructor(text, x = 0, y = 0, color = "black", font = "15px Arial") {
		super();
		this.text = text;
		this.x = x;
		this.y = y;
		this.color = color;
		this.font = font;
		this.stroke = false;
		this.align = "start";
	}
	draw() {
		var ctx = this.parent.context;
		ctx.textAlign = this.align;
		ctx[this.stroke ? "strokeStyle" : "fillStyle"] = this.color;
		ctx.font = this.font;
		ctx[this.stroke ? "strokeText" : "fillText"](this.text, this.x, this.y);
	}
}