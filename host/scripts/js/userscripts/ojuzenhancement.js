// ==UserScript==
// @name         OJ.UZ enhancement
// @namespace    ojuzenhancement
// @version      v1
// @description  Enhances OJ.UZ
// @author       EntityPlantt
// @match        https://oj.uz/*
// @icon         http://oj.uz/favicon.ico
// @grant        none
// @run-at       document-start
// ==/UserScript==
addEventListener("DOMContentLoaded", () => {
	var style = document.createElement("style");
	style.innerHTML = `
	html, img, iframe, object { filter: invert(1) hue-rotate(180deg) }
	footer, body { background: #e9e9e9 }
	* {
	transition: none !important;
	-webkit-transition: none !important;
	-moz-transition: none !important;
	-o-transition: none !important;
	}
	.progressbar {
	background: #eee;
	box-shadow: none;
	height: 30px !important;
	}
	.progressbar .text {
	color: #333;
	top: -20px !important;
	}
	.progressbar > .bar {
	animation: progressbargradient 2s linear infinite;
	}
	@keyframes progressbargradient {
	from { background-position-x: 0% }
	to { background-position-x: 200% }
	}
	body::-webkit-scrollbar { width: 15px; height: 15px }
	body::-webkit-scrollbar-track { background: #222 }
	body::-webkit-scrollbar-thumb { background: #444; border-radius: 7.5px }
	`;
	document.querySelector("head").appendChild(style);
	document.querySelectorAll(".progressbar > .bar").forEach(elm => {
		var hue = parseFloat(elm.style.width.substring(0, elm.style.width.length - 1)) * 1.2;
		elm.style.background = `linear-gradient(90deg, hsl(${hue}, 57%, 53%), hsl(${hue}, 83%, 60%), hsl(${hue}, 57%, 53%))`;
		elm.style.backgroundSize = "200%";
	});
	if (document.getElementById("my-score")) {
		var score = document.getElementById("my-score").parentElement.nextElementSibling.querySelector("td").innerText.split(" / ").map(x => parseInt(x));
		document.querySelector("#my-score canvas").style.filter = `hue-rotate(-${(1 - score[0] / score[1]) * 90}deg)`;
		document.getElementById("my-score").parentElement.style.background = `hsl(${score[0] / score[1] * 90}, 57%, 95%)`;
	}
});