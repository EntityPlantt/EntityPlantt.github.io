onload = async () => {
	const data = await fetch("https://entityplantt.github.io/host/data/json/corrupted_blox_versions.json")
		.then(arg => arg.json());
	console.log(data);
	document.getElementById("back").href = data.homepage;
	document.querySelectorAll("ul > li > ul > li").forEach(li => {
		try {
			li.setAttribute("onclick", `description(this, ${JSON.stringify(data[li.querySelector("a").getAttribute("version")][li.innerText])})`);
		}
		catch (_) {
			console.error(_);
		}
	});
	document.querySelectorAll("li > a").forEach(a => {
		a.href = `corrupted-blox-forge-1.17.1-v${a.innerText}.jar`;
		a.download = "";
	});
}
function description(parent, text) {
	var div = document.createElement("div");
	div.innerText = text;
	div.className = "description";
	div.setAttribute("tabindex", 0);
	div.setAttribute("onfocusout", "this.remove()");
	parent.appendChild(div);
	div.focus();
}