var projects, selectedTab;
function updateProjects() {
	localStorage.setItem("mcdatapacker-projects", JSON.stringify(projects));
}
function selectTab(id) {
	while (document.querySelector(".tab.selected"))
		document.querySelector(".tab.selected").classList.remove("selected");
	selectedTab = id;
	document.getElementById("tab-" + selectedTab).classList.add("selected");
	document.getElementById("current-tab").src = "project.html?" + selectedTab;
}
onload = () => {
	projects = JSON.parse(localStorage.getItem("mcdatapacker-projects") || "[]");
	if (projects.length) {
		projects.forEach((proj, id) => {
			newTab(proj.name, id);
		});
	}
	else
		initProject({name: "Untitled"});
	selectTab(0);
}
function initProject(data) {
	projects.push(data);
	newTab(data.name, projects.length - 1);
	updateProjects();
}
function deleteProject(id) {
	if (!confirm(`The project "${projects[id].name}" will be deleted.`)) {
		return;
	}
	document.getElementById("tab-" + id).className = "tab closed";
	var tab = document.getElementById("tab-" + id);
	tab.removeAttribute("id");
	setTimeout(() => tab.remove(), 300);
	projects.splice(id, 1);
	var tabsAll = document.getElementsByClassName("tab");
	for (var i = id; i < projects.length; i++) {
		tabsAll[i].id = "tab-" + i;
	}
	if (!projects.length) {
		initProject({name: "Untitled"});
	}
	updateProjects();
	selectTab(0);
}
function newTab(name, id) {
	var td = document.createElement("td");
	td.innerText = name;
	td.className = "tab";
	var close_btn = document.createElement("span");
	close_btn.innerHTML = "&times;";
	close_btn.setAttribute("onclick", `deleteProject(${id})`);
	td.id = "tab-" + id;
	close_btn.className = "close-btn";
	td.appendChild(close_btn);
	document.getElementById("tabs-r").appendChild(td);
	td.setAttribute("onclick", "selectTab(parseInt(this.id.substr(4)))");
}