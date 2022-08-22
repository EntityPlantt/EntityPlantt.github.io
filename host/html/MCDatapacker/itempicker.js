var ItemPicker = {
	items: [],
	getItemById(id) {
		ItemPicker.checkForNotInitialized();
		for (var i = 0; i < ItemPicker.items.length; i++) {
			if (ItemPicker.items[i].id == id) {
				return ItemPicker.items[i];
			}
		}
		return null;
	},
	async setDomElementImage(domElement) {
		await ItemPicker.checkForNotInitialized();
		domElement.style.backgroundImage = `
			url("https://minecraftitemids.com/item/64/${
				domElement.getAttribute("value").replace(/^([a-z0-9_]+?):/, "") || "air"
			}.png")
		`;
	},
	async initItemInput(domElement) {
		await ItemPicker.checkForNotInitialized();
		domElement.classList.add("item-picker-item");
		if (domElement.getAttribute("value")) {
			ItemPicker.setDomElementImage(domElement);
			var result = ItemPicker.getItemById(domElement.getAttribute("value"));
			domElement.title = `${result.name} (${result.id})`;
		}
		domElement.onclick = async() => {
			var result = await ItemPicker.openItemPicker();
			domElement.setAttribute("value", result.id);
			domElement.title = `${result.name} (${result.id})`;
			ItemPicker.setDomElementImage(domElement);
		}
	},
	initAllInputs() {
		document.getElementsByClassName("item-picker-item").forEach(ItemPicker.initItemInput);
	},
	async openItemPicker() {
		await ItemPicker.checkForNotInitialized();
		var itemPicker = document.createElement("table");
		var blurrer = document.createElement("div");
		blurrer.className = "item-picker-blurrer";
		document.body.appendChild(blurrer);
		document.body.appendChild(itemPicker);
		itemPicker.innerHTML = "<tr></tr>";
		itemPicker.className = "item-picker";
		var resolveF;
		var promise = new Promise((resolve, reject) => {
			resolveF = resolve;
		});
		blurrer.onclick = () => {
			resolveF(ItemPicker.items[0]);
			itemPicker.remove();
			blurrer.remove();
		}
		for (var item of ItemPicker.items) {
			var elm = document.createElement("td");
			elm.className = "item-picker-item";
			elm.setAttribute("value", item.id);
			ItemPicker.setDomElementImage(elm);
			elm.title = `${item.name} (${item.id})`;
			elm.onclick = event => {
				resolveF(ItemPicker.getItemById(event.target.getAttribute("value")));
				itemPicker.remove();
				blurrer.remove();
			}
			itemPicker.querySelector("tbody > tr").appendChild(elm);
		}
		return promise;
	},
	initItemPickerStylesheet() {
		var stylesheet = document.createElement("link");
		stylesheet.rel = "stylesheet";
		stylesheet.href = "itempicker.css";
		stylesheet.id = "itempicker-stylesheet";
		stylesheet.type = "text/css";
		document.head.appendChild(stylesheet);
	},
	async checkForNotInitialized(what = ["items", "stylesheet"]) {
		var r = new Array;
		if (what.includes("stylesheet") && !document.getElementById("itempicker-stylesheet")) {
			ItemPicker.initItemPickerStylesheet();
			r.push("stylesheet");
		}
		if (what.includes("items") && !(ItemPicker.items.length)) {
			ItemPicker.items = await fetch("items.json").then(data => data.json());
			r.push("items");
		}
		if (r.length)
			console.warn("These items were not initialized\n", r);
		return r;
	}
}