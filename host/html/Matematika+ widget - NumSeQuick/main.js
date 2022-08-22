var clicks = 0, time = 0, gameInterval, infiniteMode = false, gameStart;
onload = () => {
	if (window.localStorage.getItem("plantt.numsequick.lastgame")) {
		var lastGame = JSON.parse(window.localStorage.getItem("plantt.numsequick.lastgame"));
		document.getElementById("lastgame").style.display = "block";
		if (window.localStorage.getItem("plantt.numsequick.en") == "true")
			document.getElementById("lastgame").innerHTML =
			`	Statistics from the last game:<br>
				Time: <b>${lastGame.time}</b><br>
				Win: <b>${lastGame.win ? "Yes" : "No"}</b><br>
				Points: <b>${lastGame.points}</b><br>
			`;
		else
			document.getElementById("lastgame").innerHTML =
			`	Статистики од последната игра:<br>
				Време: <b>${lastGame.time}</b><br>
				Победа: <b>${lastGame.win ? "Да" : "Не"}</b><br>
				Поени: <b>${lastGame.points}</b><br>
			`;
	}
	if (window.localStorage.getItem("plantt.numsequick.en") == "true") {
		document.getElementById("mode-desc-fixed").innerHTML = `
		<h1>Fixed</h1>
		<p>
			There is a fixed number of numbers which will be shown.
			<br>
			A win is when all the numbers are clicked correctly.
			<br>
			A lose is when one is misclicked.
		</p>
		Number of numbers:&nbsp;
		<input type="number" id="settings-number-of-numbers" size="1" value="3" min="1" max="10" step="1">
		`;
		document.getElementById("mode-desc-infinite").innerHTML = `
		<h1>Infinte</h1>
			<p>
				There are an infinite number of numbers that come from top.
				<br>
				A lose is when the numbers cover the whole place.
			</p>
			If one is misclicked:&nbsp;
			<select id="settings-if-wrong">
				<option value="0">The number goes from the beginning</option>
				<option value="1">It's a lose</option>
			</select>
		`;
		document.getElementById("main-screen-tabs").innerHTML = `
			<tbody>
				<tr>
					<td class="main-screen-tab" onclick="mainScreenChangeTo('fixed')">Fixed</td>
					<td class="main-screen-tab" onclick="mainScreenChangeTo('infinite')">Infinite</td>
				</tr>
			</tbody>
		`;
		document.getElementById("start").innerText = "Start";
		document.getElementById("lang").innerText = "МК";
	}
}
function startGame() {
	gameStart = new Date().getTime();
	document.getElementById("main-screen").style.display = "none";
	if (infiniteMode) {
		addNumber();
		gameInterval = setInterval(() => {
			time += 3;
			if (time / 1000 >= 0.5 + apply(5.5, n => n * 2/3, Math.floor(clicks / 10))) {
				time = 0;
				addNumber();
			}
		}, 1);
	}
	else {
		for (var i = 0; i < parseInt(document.getElementById("settings-number-of-numbers").value); i++) {
			addNumber();
		}
	}
}
function mainScreenChangeTo(tab) {
	Array.from(document.getElementsByClassName("mode-desc")).forEach(e => e.style.display = "none");
	document.getElementById("mode-desc-" + tab).style.display = "block";
	infiniteMode = tab == "infinite";
}
function addNumber() {
	var number = document.createElement("div");
	(() => {
		var arr = ["red", "yellow", "green", "blue"];
		if (Array.from(document.getElementsByClassName("number")).at(-1))
			arr.splice(arr.indexOf(Array.from(Array.from(document.getElementsByClassName("number")).at(-1).classList).at(-1)), 1);
		number.className = "number " + arr[Math.floor(Math.random() * arr.length)];
	})();
	number.innerText = Math.floor(Math.random() * 5) + 1;
	document.getElementById("numbers").appendChild(number);
	if (document.getElementsByClassName("number").length > 10) {
		endGame(true);
	}
}
function clickerClicked(color) {
	if (document.querySelector(".number").className.includes(color)) {
		if (document.querySelector(".progress:not(.red, .yellow, .green, .blue)")) {
			document.querySelector(".progress:not(.red, .yellow, .green, .blue)").classList.add(color);
			document.getElementById("fraction").innerText
			 = document.querySelectorAll(".progress." + color).length
			 + "/"
			 + document.querySelectorAll(".progress").length;
			clicks++;
			if (!document.querySelector(".progress:not(.red, .yellow, .green, .blue)")) {
				document.querySelector(".number").remove();
				if (!infiniteMode && !document.querySelector(".number")) {
					endGame();
				}
			}
		}
		else {
			clicks++;
			var html = `<td class="progress ${color}"></td>`;
			for (var i = 1; i < parseInt(document.querySelector(".number").innerText); i++) {
				html += "<td class='progress'></td>";
			}
			document.getElementById("progress-body").innerHTML = `<tr>${html}</tr>`;
			document.getElementById("fraction").innerText
			 = "1/"
			 + document.querySelectorAll(".progress").length;
			if (!document.querySelector(".progress:not(.red, .yellow, .green, .blue)")) {
				document.querySelector(".number").remove();
				if (!infiniteMode && !document.querySelector(".number")) {
					endGame();
				}
			}
		}
	}
	else {
		if ((infiniteMode && document.getElementById("settings-if-wrong").value == "1") || !infiniteMode) {
			endGame(true);
		}
		else {
			document.getElementById("progress-body").innerHTML = "";
		}
	}
	document.getElementById("counter").innerText = clicks;
}
function endGame(lose) {
	clearInterval(gameInterval);
	window.localStorage.setItem("plantt.numsequick.lastgame", JSON.stringify({
		time: new Date().toString(),
		win: !lose,
		points: clicks
	}));
	location.reload(true);
}
function apply(value, callback, times = 1) {
	while (times) {
		times--;
		value = callback(value);
	}
	return value;
}
function toggleLang() {
	if (window.localStorage.getItem("plantt.numsequick.en") == "true") {
		window.localStorage.removeItem("plantt.numsequick.en");
	}
	else {
		window.localStorage.setItem("plantt.numsequick.en", "true");
	}
	location.reload(true);
}