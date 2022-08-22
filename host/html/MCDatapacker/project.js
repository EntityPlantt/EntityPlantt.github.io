var projects, project, projId, optionFunctions = [
	() => {
		var newName = prompt("Change name", project.name);
		if (!newName) return;
		project.name = newName;
	},
	() => {
		var newDesc = prompt("Change description", project.description);
		if (!newDesc) return;
		project.description = newDesc;
	},
	() => {
		var newVersion = prompt("Change version (1-9)", project.version);
		if (!newVersion || isNaN(newVersion) || !parseInt(newVersion) || parseInt(newVersion) > 9)
			return;
		project.version = parseInt(newVersion);
	},
	() => {
		var zip = new JSZip();
		zip.file("pack.mcmeta", JSON.stringify({
			pack: {
				pack_format: project.version,
				description: project.description
			}
		}, null, "\t"));
		project.elements.forEach(elm => {
			Generators[elm.type].save(zip.folder("data").folder(project.namespace || "minecraft"), elm);
		});
		zip.generateAsync({type: "blob"})
			.then(zip => {
				saveAs(zip, project.name + ".zip");
			});
		return true;
	},
	() => {
		document.getElementById("credits").style.display = "block";
		return true;
	},
	() => {
		var newNamespace = prompt("Change namespace", project.namespace);
		if (newNamespace) {
			if (/^([a-z_])([a-z_0-9]*)$/.test(newNamespace))
				project.namespace = newNamespace;
			else
				alert("Namespace not valid");
		}
	}
];
function updateProjects() {
	projects[projId] = project;
	localStorage.setItem("mcdatapacker-projects", JSON.stringify(projects));
}
onload = () => {
	projects = JSON.parse(localStorage.getItem("mcdatapacker-projects"));
	projId = parseInt(document.URL.substr(document.URL.indexOf("?") + 1));
	project = projects[projId];
	if (!project.elements) {
		project.elements = new Array;
		updateProjects();
	}
	else {
		project.elements.forEach(addElement);
	}
	if (!project.version) {
		project.version = 1;
		updateProjects();
	}
}
function addElement(elm) {
	document.querySelector("#contents > tbody > tr:last-child").innerHTML += `
		<td
			class="element"
			oncontextmenu="deleteElement(${document.getElementsByClassName("element").length})"
			onclick="openElement(${document.getElementsByClassName("element").length})"
		>
			<img src="images/${elm.type}.png">
			<span class="name">${elm.name}</span>
		</td>
	`;
}
function addElementPrompt() {
	document.getElementById("add-element-prompt").style.display = "block";
	document.getElementById("add-element").style.display = "none";
}
function closeElementPrompt() {
	document.getElementById("add-element").style.display = "block";
	document.getElementById("add-element-prompt").style.display = "none";
}
function openElement(id) {
	location.replace(`element.html?${projId}&${id}`);
}
function createElementFromPrompt() {
	var o = {
		name: document.getElementById("add-element-name").value,
		type: document.getElementById("add-element-type").value
	};
	if (/^([a-z_])(([a-z0-9_]|\/[a-z0-9_])*)$/.test(o.name)) {
		Generators[o.type].new(o);
		project.elements.push(o);
		updateProjects();
		closeElementPrompt();
		location.replace(`element.html?${projId}&${project.elements.length - 1}`);
	}
	else {
		alert(`Error\nElement name "${o.name}" is not valid\nPlease change it and try again`);
	}
}
function deleteElement(id) {
	event.preventDefault();
	if (confirm(`You are going to delete the element "${project.elements[id].name}".`)) {
		project.elements.splice(id, 1);
		updateProjects();
		location.reload(true);
	}
}
function executeOption(id) {
	if (optionFunctions[parseInt(id)]()) {
		document.querySelector("#options option:first-child").setAttribute("selected", "");
		document.querySelector("#options option:first-child").removeAttribute("selected");
		return;
	}
	updateProjects();
	location.reload(true);
}