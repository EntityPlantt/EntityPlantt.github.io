let rx = 0, ry = 0, touches = {}, keys = new Set, mousedown = false, moved = false;

/**
 * @typedef {"stars" | "sound" | "sensitivity" | "zoom" | "clamp" | "save"} Setting
 * @type {Record<Setting, {selected: number, options: [string, any][], onchange?: (val: any) => any}>}
 */
const settings = {
	stars: {
		options: [
			["Enabled", true],
			["Disabled", false],
		],
		selected: 0,
		onchange: v => document.getElementById("stars").style.display = v ? "" : "none",
	},
	sound: {
		options: [
			["Yes", true],
			["No", false],
		],
		selected: 0,
	},
	sensitivity: {
		options: [
			["Sluggish", .02],
			["1/20x", .05],
			["1/10x", .1],
			["1/5x", .2],
			["1/2x", .5],
		],
		selected: 1,
	},
	zoom: {
		options: [
			[".5x", .5],
			[".75x", .75],
			["1x", 1],
			["1.25x", 1.25],
			["1.5x", 1.5],
			["1.75x", 1.75],
			["2x", 2],
		],
		selected: 2,
		onchange: v => document.body.style.setProperty("--tscale", v),
	},
	clamp: {
		options: [
			["Never", -1],
			["After 5 seconds", 5e3],
			["After a second", 1e3],
			["Instantly", 50],
		],
		selected: 0,
	},
	save: {
		options: [
			["Yes", true],
			["No", false],
		],
		selected: 0,
	},
};
/** @param {Setting} name */
function getSettingName(name) {
	return settings[name].options[settings[name].selected][0];
}
/** @param {Setting} name */
function getSettingValue(name) {
	return settings[name].options[settings[name].selected][1];
}
/** @param {Setting} name */
function cycleSetting(name) {
	++settings[name].selected;
	settings[name].selected %= settings[name].options.length;
	saveSettings();
	if (settings[name].onchange) return settings[name].onchange(getSettingValue(name));
}
let savedTimeout = -1;
function saveSettings() {
	if (!getSettingValue("save")) return;
	document.getElementById("settings-saved").style.opacity = 1;
	clearTimeout(savedTimeout);
	savedTimeout = setTimeout(() => document.getElementById("settings-saved").style.opacity = 0, 2000);
	localStorage.setItem("settings", JSON.stringify(Object.fromEntries(Object.entries(settings).map(([k, v]) => [k, v.selected]))));
}

addEventListener("DOMContentLoaded", () => {
	Object.entries(JSON.parse(localStorage.getItem("settings") || "{}")).forEach(([k, v]) => {
		settings[k].selected = v;
		if (settings[k].onchange) settings[k].onchange(getSettingValue(k));
	});
	for (const x of document.getElementsByClassName("float")) {
		if (x.classList.contains("card")) x.addEventListener("click", () => moved || focusCard(x));
		x.style.setProperty("--rx", x.getAttribute("rx") + "deg");
		x.style.setProperty("--ry", x.getAttribute("ry") + "deg");
	}
	for (const x of document.querySelectorAll(".setting button[name]")) {
		x.textContent = getSettingName(x.name);
		x.addEventListener("click", () => {
			cycleSetting(x.name);
			x.textContent = getSettingName(x.name);
		});
	}
	document.getElementById("stars").innerHTML = Array(200).fill(0).map(() => `<span style="${
		["x1", "y1", "z1", "x2", "y2", "z2"].map(x => `--${x}:${Math.random() * 5e3 - 2500}px`).join(";")
	};--time:${Math.random() * 30 + 10}s;--delay:-${Math.random() * 20}s"></span>`).join("");
});

addEventListener("mousedown", () => void(mousedown = true, moved = false));
addEventListener("dragstart", () => void(mousedown = false));
addEventListener("mouseup", () => void(mousedown = false));
addEventListener("mousemove", ev => {
	if (!mousedown) return;
	moved = true;
	rx -= ev.movementX * getSettingValue("sensitivity");
	ry += ev.movementY * getSettingValue("sensitivity");
	updateR();
});
addEventListener("touchstart", ev => {
	for (let i of ev.changedTouches) {
		touches[i.identifier] = [i.clientX, i.clientY];
	}
});
addEventListener("touchmove", ev => {
	for (let i of ev.changedTouches) {
		rx -= (i.clientX - touches[i.identifier][0]) * getSettingValue("sensitivity") / ev.changedTouches.length;
		ry += (i.clientY - touches[i.identifier][1]) * getSettingValue("sensitivity") / ev.changedTouches.length;
		touches[i.identifier] = [i.clientX, i.clientY];
	}
	updateR();
});
addEventListener("keydown", ev => {
	keys.add(ev.code);
	if (ev.code === "Enter") {
		ev.preventDefault();
		focusCard(nearestCard());
	}
});
addEventListener("keyup", ev => keys.delete(ev.code));

function focusCard(e) {
	if (!(e instanceof HTMLElement)) return;
	rx = -parseFloat(e.getAttribute("rx"));
	ry = -parseFloat(e.getAttribute("ry"));
	updateR(true);
}
function wrapDist(x) {
	x = (x % 360 + 360) % 360;
	return Math.min(x, 360 - x);
}
function distanceToCard(elm) {
	if (!(elm instanceof Element)) return Infinity;
	return wrapDist(parseFloat(elm.getAttribute("rx")) + rx) ** 2 + wrapDist(parseFloat(elm.getAttribute("ry")) + ry) ** 2;
}
function nearestCard() {
	let e = null;
	for (const x of document.getElementsByClassName("card")) {
		if (distanceToCard(x) < distanceToCard(e)) e = x;
	}
	return e;
}
let clampTimeout = -1;
function updateR(smooth = false) {
	if (ry < -45) ry = -45;
	if (ry > 45) ry = 45;
	if (smooth) document.body.classList.add("smoothrot");
	else document.body.classList.remove("smoothrot");
	document.body.style.setProperty("--vrx", rx + "deg");
	document.body.style.setProperty("--vry", ry + "deg");
	const e = nearestCard();
	document.querySelector(".card.nearest")?.classList.remove("nearest");
	if (e) e.classList.add("nearest");
	clearTimeout(clampTimeout);
	if (0 < getSettingValue("clamp")) clampTimeout = setTimeout(() => focusCard(nearestCard()), getSettingValue("clamp"));
}
function frame() {
	requestAnimationFrame(frame);
	let change = false;
	if (keys.has("ArrowUp")) ++ry, change = true;
	if (keys.has("ArrowLeft")) --rx, change = true;
	if (keys.has("ArrowDown")) --ry, change = true;
	if (keys.has("ArrowRight")) ++rx, change = true;
	if (keys.has("KeyW")) ++ry, change = true;
	if (keys.has("KeyA")) --rx, change = true;
	if (keys.has("KeyS")) --ry, change = true;
	if (keys.has("KeyD")) ++rx, change = true;
	if (change) updateR();
}
frame();