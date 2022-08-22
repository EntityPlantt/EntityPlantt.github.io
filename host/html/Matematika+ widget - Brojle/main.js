function countChar(str, char) {
	var cnt = 0;
	str.split("").forEach(c => {
		if (char == c) {
			cnt++;
		}
	});
	return cnt || 0;
}
var numberle, cells = new Array;
var pogaganje = "", enter = false;
function startGame(button) {
	const digitCount = parseInt(document.getElementById("digit-count").value);
	const digitRepeat = document.getElementById("digit-repeat").value == "repeat";
	numberle = digitCount + "dig&" + document.getElementById("digit-repeat").value;
	numberle = numbers[numberle][Math.floor((new Date().getTime() / 86400000) % numbers[numberle].length)].toString();
	button.parentElement.remove();
	Array.from(document.getElementsByClassName("guessing-table-row")).forEach(tr => {
		for (var i = 0; i < digitCount; i++) {
			tr.innerHTML += "<td class='guessing-table-cell'></td>";
		}
		cells.push(Array.from(tr.querySelectorAll(".guessing-table-cell")));
	});
	onkeyup = e => {
		if (isNaN(e.key)) {
			if (e.key == "Backspace") {
				pogaganje = pogaganje.substr(0, pogaganje.length - 1);
			}
			if (e.key == "Enter" && pogaganje[0] != "0" && pogaganje.length == digitCount && (digitRepeat || !hasCharacterRepeat(pogaganje))) {
				enter = true;
			}
			return;
		}
		pogaganje += parseInt(e.key);
	}
	var int = setInterval(() => {
		if (pogaganje.length > digitCount) {
			pogaganje = pogaganje.substr(0, 4);
		}
		for (var i = 0; i < digitCount; i++) {
			cells[0][i].innerText = pogaganje[i] ?? "";
		}
		if (enter) {
			const oku = onkeyup;
			onkeyup = null;
			enter = false;
			var rightDigits = 0;
			for (var i = 0; i < digitCount; i++) {
				if (pogaganje[i] == numberle[i]) {
					cells[0][i].classList.add("right");
					rightDigits++;
				}
				else if (numberle.includes(pogaganje[i])) {
					cells[0][i].classList.add("misplaced");
				}
				else {
					cells[0][i].classList.add("wrong");
				}
				cells[0][i].setAttribute("value", pogaganje[i]);
			}
			if (rightDigits == digitCount) {
				endWith("Победи!");
				clearInterval(int);
				return;
			}
			for (var j = 0; j < 10; j++) {
				for (var i = cells[0][0].parentElement.querySelectorAll(`[value='${j}'].misplaced`).length - 1; i >= 0; i--) {
					if (countChar(numberle, j.toString()) < cells[0][0].parentElement.querySelectorAll(`[value='${j}'].misplaced, [value='${j}'].right`).length) {
						cells[0][0].parentElement.querySelectorAll(`[value='${j}'].misplaced`)[i].classList.add("wrong");
						cells[0][0].parentElement.querySelectorAll(`[value='${j}'].misplaced`)[i].classList.remove("misplaced");
					}
				}
				/*
				if (!cells[0][0].parentElement.querySelectorAll(`.guessing-table-cell[value='${j}'].misplaced`).length) {
					continue;
				}
				var toLeave // = broj na takvi cifri vo BROJLE - broj na tocni
					= (numberle.match(new RegExp(i, "g")) || []).length
					- cells[0][0].parentElement.querySelectorAll(`.guessing-table-cell[value='${j}'].right`).length;
					var arr = Array.from(cells[0][0].parentElement.querySelectorAll(`.guessing-table-cell[value='${j}'].misplaced`));
				while (arr.length > Math.max(toLeave, 0)) {
					try {
						arr[arr.length - 1].classList.add("wrong");
						arr[arr.length - 1].classList.remove("misplaced");
						arr.pop();
					} catch (_) {console.warn(_)};
				}
				*/
			}
			cells.shift();
			pogaganje = "";
			if (!cells.length) {
				endWith("Изгуби!");
				clearInterval(int);
				return;
			}
			onkeyup = oku;
		}
	}, 42);
}
function endWith(text) {
	document.getElementById("endscreen-text").innerText = text;
	document.getElementById("endscreen").removeAttribute("style");
}
function showGameTutorial() {
	document.getElementById("game-tutorial").removeAttribute("style");
}
function hideGameTutorial() {
	document.getElementById("game-tutorial").style.display = "none";
}
function hasCharacterRepeat(str) {
	return new Set(str.split("")).size < str.length;
}
function fireKeyboardEvent(key) {
	window.onkeyup({key: key});
}