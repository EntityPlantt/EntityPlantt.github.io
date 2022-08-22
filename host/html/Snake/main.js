var size = 10;
function changeSize(size) {
	window.size = size;
	document.body.style = "--size: " + size;
	localStorage.setItem("entityplantt-snake-table-size", size);
	document.getElementById("table-size").setAttribute("value", size);
}
onload = () => {
	if (localStorage.getItem("entityplantt-snake-table-size")) {
		changeSize(parseInt(localStorage.getItem("entityplantt-snake-table-size")));
	}
	else {
		changeSize(10);
	}
}
function startGame() {
	document.getElementById("start").innerText = "Stop";
	document.getElementById("start").setAttribute("onclick", "stopGame()");
	document.getElementById("endgame").classList.remove("shown");
	window.direction = 2;
	window.tbl = document.getElementById("t");
	tbl.innerHTML = "";
	window.t = Array(size);
	window.grid = Array(size);
	for (var i = 0; i < size; i++) {
		var tr = document.createElement("tr");
		t[i] = Array(size);
		grid[i] = Array(size);
		for (var j = 0; j < size; j++) {
			t[i][j] = document.createElement("td");
			tr.append(t[i][j]);
			grid[i][j] = "";
		}
		tbl.append(tr);
	}
	grid[0][0] = "head";
	window.body = [[0, 0]];
	window.int = setInterval(tick, 350);
	window.addBody = 1;
	window.superMode = 0;
	window.prt1 = window.prt2 = null;
	window.portal = false;
	placeApple();
	onkeydown = event => {
		switch (event.key.toLowerCase()) {
			case "arrowup":
			case "w":
			direction = 1;
			break;
			case "arrowleft":
			case "a":
			direction = 0;
			break;
			case "arrowright":
			case "d":
			direction = 2;
			break;
			case "arrowdown":
			case "s":
			direction = 3;
			break;
		}
	}
}
function updateDisplay(clear = false) {
	for (var i = 0; i < size; i++) {
		for (var j = 0; j < size; j++) {
			t[i][j].className = (clear ? "" : grid[i][j]);
		}
	}
	document.getElementById("pts").innerText = body.length - 2;
}
function placeApple() {
	// Apple
	var x, y;
	function getCoords() {
		do {
			x = Math.floor(Math.random() * size);
			y = Math.floor(Math.random() * size);
		} while (grid[x][y].length);
	}
	getCoords();
	grid[x][y] = "apple";
	if (Math.random() < 0.5 && body.length > 7) {
		// Golden apple
		getCoords();
		grid[x][y] = "gappl";
	}
	if (Math.random() < 0.25 && body.length > 11) {
		// Void
		getCoords();
		grid[x][y] = "void";
	}
	if (!portal && Math.random() < 0.4 && body.length > 14) {
		// Portal
		getCoords();
		grid[x][y] = "portal";
		prt1 = {x, y};
		getCoords();
		grid[x][y] = "portal";
		prt2 = {x, y};
		portal = true;
	}
}
function tick() {
	if (addBody) {
		addBody--;
	}
	else {
		if (grid[body[0][0]][body[0][1]] == "snake") {
			grid[body[0][0]][body[0][1]] = "";
		}
		body.shift();
	}
	grid[body.at(-1)[0]][body.at(-1)[1]] = "snake";
	var placeNow;
	switch (direction) {
		case 0:
		placeNow = [body.at(-1)[0], body.at(-1)[1] - 1];
		break;
		case 1:
		placeNow = [body.at(-1)[0] - 1, body.at(-1)[1]];
		break;
		case 2:
		placeNow = [body.at(-1)[0], body.at(-1)[1] + 1];
		break;
		case 3:
		placeNow = [body.at(-1)[0] + 1, body.at(-1)[1]];
		break;
	}
	if (!superMode && body.length > 1 && placeNow[0] == body.at(-2)[0] && placeNow[1] == body.at(-2)[1]) {
		placeNow[0] = 2 * body.at(-1)[0] - body.at(-2)[0];
		placeNow[1] = 2 * body.at(-1)[1] - body.at(-2)[1];
	}
	var bad = false;
	for (var i = 0; i < body.length; i++) {
		if (body[i][0] == placeNow[0] && body[i][1] == placeNow[1]) {
			bad = true;
			break;
		}
	}
	if ((bad && !superMode) || placeNow[0] > size - 1 || placeNow[1] > size - 1 || placeNow[0] < 0 || placeNow[1] < 0 || grid[placeNow[0]][placeNow[1]] == "void") {
		stopGame();
	}
	else {
		if (grid[placeNow[0]][placeNow[1]] == "apple") {
			addBody++;
			placeApple();
		}
		if (grid[placeNow[0]][placeNow[1]] == "gappl") {
			superMode++;
			tbl.classList.add("gappl")
			setTimeout(() => {
				if (--superMode == 0) {
					tbl.classList.remove("gappl");
				}
			}, 5000);
		}
		if (portal && ((prt1.x == placeNow[0] && prt1.y == placeNow[1]) || (prt2.x == placeNow[0] && prt2.y == placeNow[1]))) {
			if (prt2.x == placeNow[0] && prt2.y == placeNow[1]) {
				placeNow = [prt1.x, prt1.y];
			}
			else {
				placeNow = [prt2.x, prt2.y];
			}
			grid[prt1.x][prt1.y] = grid[prt2.x][prt2.y] = "";
			portal = false;
		}
		grid[placeNow[0]][placeNow[1]] = "head";
		body.push([placeNow[0], placeNow[1]]);
	}
	updateDisplay();
}
function stopGame() {
	document.getElementById("start").innerText = "Start";
	document.getElementById("start").setAttribute("onclick", "startGame()");
	clearInterval(int);
	document.getElementById("endgame").classList.add("shown");
	document.getElementById("eg-pts").innerText = document.getElementById("pts").innerText = body.length - 1;
	tbl.classList.remove("gappl");
}
