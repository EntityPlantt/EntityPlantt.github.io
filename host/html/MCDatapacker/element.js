var projects, projId, elmId, elm, editingPlace;
onload = () => {
	var checkItemPicker;
	projId = parseInt(document.URL.substr(document.URL.indexOf("?") + 1).split("&")[0]);
	elmId = parseInt(document.URL.substr(document.URL.indexOf("?") + 1).split("&")[1]);
	projects = JSON.parse(localStorage.getItem("mcdatapacker-projects"));
	elm = projects[projId].elements[elmId];
	document.getElementById("type").innerText = elm.type;
	document.getElementById("name").innerText = elm.name;
	editingPlace = document.getElementById("edit-" + elm.type);
	editingPlace.style.display = "block";
	Generators[elm.type].init(elm);
}
function updateProjects() {
	projects[projId].elements[elmId] = elm;
	localStorage.setItem("mcdatapacker-projects", JSON.stringify(projects));
}
function saveElement() {
	Generators[elm.type].compile(elm);
	updateProjects();
	document.getElementById("saved").style.display = "inline";
	setTimeout(() => document.getElementById("saved").removeAttribute("style"), 2000);
}
function renameElement(newNameElm) {
	if (/^([a-z_])(([a-z0-9_]|\/[a-z0-9_])*)$/.test(newNameElm.innerText)) {
		elm.name = newNameElm.innerText;
		updateProjects();
	}
	else {
		alert(`Name "${newNameElm.innerText}" not valid`);
		newNameElm.innerText = elm.name;
	}
}