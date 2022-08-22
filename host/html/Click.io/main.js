var clicks = 0;
const hues = [
	"#f00",
	"#f80",
	"#ff0",
	"#8f0",
	"#0f0",
	"#0f8",
	"#0ff",
	"#08f",
	"#00f",
	"#80f",
	"#f0f",
	"#f08"
];
function playSound(soundURL, volume) {
	var audio = new Audio(soundURL);
	volume = volume ?? 1;
	audio.volume = volume;
	audio.play();
	return audio;
}
window.onload = function() {
	var volume = window.localStorage.getItem("click-io-volume");
	if (volume == null) {
		window.localStorage.setItem("click-io-volume", 100);
	}
	else {
		document.getElementById("volume").setAttribute("value", volume);
	}
	document.getElementsByClassName("gui-desc")[0].innerHTML = "Highscore: " + (window.localStorage.getItem("click-io-pts") ?? 0);
}
function startGame(elm) {
	document.body.classList.add("DayCycle");
	var elm2 = elm.parentElement.cloneNode(true);
	elm2.classList.add("closed");
	elm2.querySelector(".gui-button").removeAttribute("onclick");
	elm.parentElement.remove();
	document.body.appendChild(elm2);
	setTimeout(function() {
		elm2.remove();
	}, 600);
	window.onclick = function(e) {
		if (["BODY", "DIV"].includes(document.elementFromPoint(e.clientX, e.clientY).nodeName)) {
			e = e || window.event;
			clicks++;
			document.getElementById("counter").innerText = clicks;
			var div = document.createElement("div");
			div.innerText = clicks;
			div.className = "dot";
			div.style.backgroundColor = hues[((clicks - 1) % hues.length)];
			div.style.left = `calc(${e.clientX}px - 5vw)`;
			div.style.top = `calc(${e.clientY}px - 5vw)`;
			playSound("asset0.mp3", parseInt(document.getElementById("volume").value) / 100);
			document.body.appendChild(div);
			var opac = 1, top = 0;
			var intr = setInterval(function() {
				top++;
				opac -= 0.1;
				div.style.top = `calc(${e.clientY}px + ${top}vh - 5vw)`;
				div.style.opacity = opac;
				if (opac <= 0) {
					div.remove();
					clearInterval(intr);
				}
			}, 42);
		}
	};
	playSound("asset1.mp3", 1);
	var timer = document.getElementById("timer"), seconds = 180;
	var intr = setInterval(function() {
		seconds--;
		if (seconds == 10) {
			timer.classList.toggle("timer-beep-danger");
		}
		if ((seconds % 60) < 10)
			timer.innerText = Math.floor(seconds / 60) + ":0" + (seconds % 60);
		else
			timer.innerText = Math.floor(seconds / 60) + ":" + (seconds % 60);
		if (seconds <= 0) {
			clearInterval(intr);
			stopGame();
		}
	}, 1000);
}
function stopGame() {
	window.onclick = null;
	document.body.appendChild(document.getElementById("endscreen").content.querySelector("div.gui").cloneNode(true));
	document.body.querySelector("div.gui-desc").innerText = `You got ${clicks} points`;
	if (parseInt(window.localStorage.getItem("click-io-pts")) < clicks) {
		window.localStorage.setItem("click-io-pts", clicks);
		document.body.querySelector("div.gui-desc").innerHTML += "<br>Your new highscore is " + window.localStorage.getItem("click-io-pts") + " points";
	}
	else if (window.localStorage.getItem("click-io-pts") == null) {
		window.localStorage.setItem("click-io-pts", clicks);
		document.body.querySelector("div.gui-desc").innerHTML += "<br>Your first score has been recorded, " + window.localStorage.getItem("click-io-pts") + " points";
	}
	else {
		document.body.querySelector("div.gui-desc").innerHTML += "<br>Your highscore is " + window.localStorage.getItem("click-io-pts") + " points";
	}
}