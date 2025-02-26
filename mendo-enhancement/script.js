// ==UserScript==
// @name         MENDO.MK Enhancement
// @version      43
// @namespace    mendo-mk-enhancement
// @description  Adds dark mode, search in tasks and other stuff to MENDO.MK
// @author       EntityPlantt
// @match        *://mendo.mk/*
// @require      https://cdn.jsdelivr.net/npm/chart.js@4.4.8
// @noframes
// @icon         https://mendo.mk/img/favicon.ico
// @grant        none
// @license      CC-BY-ND
// @downloadURL https://update.greasyfork.org/scripts/450985/MENDOMK%20Enhancement.user.js
// @updateURL https://update.greasyfork.org/scripts/450985/MENDOMK%20Enhancement.meta.js
// ==/UserScript==

const VERSION = 43, AprilFools = new Date().getMonth() == 3 && new Date().getDate() < 3;
console.log("%cMENDO.MK Enhancement%c loaded", "color:magenta;text-decoration:underline", "");
var loadingSuccess = 0;
setTimeout(() => {
    if (loadingSuccess == 1) console.log("Loading %csuccessful", "color:#4f4");
    else if (loadingSuccess == 2) console.log("Loading %cwith errors", "color:#ff0");
    else console.log("Loading %cunsuccessful", "color:red");
}, 1000);
function localize(english, macedonian) {
    return document.cookie.includes("mkjudge_language=en") ? english : macedonian;
}
async function MendoMkEnhancement() {
    try {
        function logFinish(taskName) {
            console.log("%cFinished task:%c " + taskName, "color:#0f0", "");
        }
        var style = document.createElement("style");
        if (!(parseInt(localStorage.getItem("enhancement last version")) >= VERSION)) {
            Changelog();
            localStorage.setItem("enhancement last version", VERSION);
        }
        if (!localStorage.getItem("mendo-mk-enhancement-theme")) {
            localStorage.setItem("mendo-mk-enhancement-theme", window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
            logFinish("detect color scheme");
        }
        style.innerHTML = `
@import url("https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css");
${ // Dark mode
        localStorage.getItem("mendo-mk-enhancement-theme") == "dark" ? `
body>div.page-container, img, svg, #cboxWrapper, .copy-io-btn span {
filter: invert(1) hue-rotate(180deg);
}
body, img, svg {
background: black;
}
::-webkit-scrollbar {
width: initial;
}
::-webkit-scrollbar-track {
background: #eee;
}
body::-webkit-scrollbar-track {
background: #111;
}
::-webkit-scrollbar-thumb {
background: #ddd;
}
` : ""}
body::-webkit-scrollbar-thumb {
background: #222;
}
${AprilFools ? `
td.solved, td.wrong {
background: #bfb !important;
}
td.correct {
background: #fbb !important;
}` : `
td.solved, td.correct {
background: #bfb !important;
}
td.wrong {
background: #fbb !important;
}
`}
.copy-io-btn span:before {
content: "📃";
}
#search {
font-family: consolas;
}
#search, #search-submit {
border: solid 2px black;
transition: box-shadow .5s;
margin-bottom: 20px;
}
#search-submit:hover {
cursor: pointer;
}
#search:focus {
background: #eee;
}
#search-submit:hover, #search:hover {
background: #ddd;
}
.copy-io-btn {
float: right;
background: #ddd;
padding: 5px;
cursor: pointer;
border-radius: 5px;
user-select: none;
}
.copy-io-btn:hover {
background: #e8e8e8;
}
#search:active, #search:focus, #search-submit:active, #search-submit:focus {
box-shadow: 0 0 2.5px 2.5px black;
}
@keyframes gta-cinematic-image {
0%, 50% {filter: blur(500px); opacity: 0;}
10%, 40% {filter: blur(0px); opacity: 1;}
}
td.share-solved {
background: #ac0 !important;
}
.update-available {
animation: update-available .5s infinite linear;
}
@keyframes update-available {
from, to {color: red}
50% {color: white}
}
.ojtxt {
animation: ojtxt 3s 1 linear;
color: white;
display: block;
}
@keyframes ojtxt {
from {color: #4f4}
to {color: white}
}
.progbar {
background: #0004;
margin-top: .5em;
border-radius: 5px;
padding: 2.5px;
width: 100%;
}
.progbar > div {
background: #bfb;
border: solid 1px gray;
border-radius: 2.5px;
height: 100%;
position: relative;
padding: 5px;
box-sizing: border-box;
}
.hidden {
display: none;
}
.sorttask {
font: inherit;
background: transparent;
border: none;
display: inline-block;
float: right;
width: 1rem;
}
td.wrong.verdict-re {
background: #fda !important;
}
td.wrong.verdict-tle {
background: #bbf !important;
}
/* April Fools! */
html.mirrored {
transform: rotateY(1620deg) rotateX(-10deg);
}
html {
transition: transform 3s cubic-bezier(0.45, 0, 0.55, 1);
}
`;
        document.head.appendChild(style);
        logFinish("inject style sheet");
        if (document.querySelector(".sitename h1 a")) {
            document.querySelector(".sitename h1").innerHTML += " <a href='https://greasyfork.org/en/scripts/450985-mendo-mk-enhancement' id=enhancement-logo><em><b>Enhanced</b></em></a>";
        }
        logFinish("complete site logo");
        fetch("https://greasyfork.org/scripts/450985-mendo-mk-enhancement/code/MENDOMK%20Enhancement.meta.js").then(x => x.text()).then(cfUpdt => {
            let offv = parseInt(/@version *(\d+)/.exec(cfUpdt)[1]);
            if (offv > VERSION) {
                if (document.getElementById("enhancement-logo")) {
                    document.getElementById("enhancement-logo").classList.add("update-available");
                    document.querySelector("#enhancement-logo b").innerText = "Update";
                }
            }
            else if (offv < VERSION) {
                if (document.getElementById("enhancement-logo")) {
                    document.querySelector("#enhancement-logo b").innerText = "Development";
                }
            }
            logFinish("check for updates");
        });
        /* if (document.querySelector(".main-navigation > ul") && !document.URL.includes("Help.do")) {
			let elm = document.createElement("li");
			elm.innerHTML = `<a href="/simple_jsp/report_bug.jsp" class="cbrbm cboxElement">${true ? "Пријави Грешка" : "Report Bug"}</a>`;
			document.querySelector(".main-navigation > ul").appendChild(elm);
			logFinish("add report bug form");
		} */
        if (document.URL.includes("/Training.do") || document.URL.includes("/User_Competition.do")) {
            var search = document.createElement("form");
            search.className = "content-search";
            search.action = "#";
            search.innerHTML = `
        <input type=text id=search autocomplete=off>
        <input type=submit id=search-submit value=Search>
        `;
            search.onsubmit = e => {
                e.preventDefault();
                location.hash = "#" + escape(search.querySelector("#search").value);
                search.querySelector("#search").blur();
                hashChange();
            }
            function hashChange() {
                // if (document.activeElement == search.querySelector("#search")) {
                // 	return;
                // }
                let kw = unescape(location.hash.substr(1));
                search.querySelector("#search").value = kw;
                kw = kw.toLowerCase();
                if (kw.includes("mirror")) document.body.parentElement.classList.add("mirrored");
                else document.body.parentElement.classList.remove("mirrored");
                document.querySelectorAll("body > div.page-container > div.main > div.main-content > div > div > table > tbody > tr").forEach(elm => {
                    if (!elm.querySelector("td:nth-child(2) > a")) {
                        return;
                    }
                    if (elm.innerText.toLowerCase().includes(kw) || elm.querySelector("td:nth-child(2) > a").href.toLowerCase().includes(kw)) {
                        elm.style.display = "";
                    }
                    else {
                        elm.style.display = "none";
                    }
                });
                if (AprilFools) {
                    document.querySelectorAll("body > div.page-container > div.main > div.main-content > div > div > table > tbody").forEach(elm => {
                        let afa = Array.from(elm.querySelectorAll("tr")).slice(1);
                        function shuffle(array) {
                            let currentIndex = array.length;
                            while (currentIndex != 0) {
                                let randomIndex = Math.floor(Math.random() * currentIndex);
                                currentIndex--;
                                [array[currentIndex], array[randomIndex]] = [
                                    array[randomIndex], array[currentIndex]];
                            }
                        }
                        shuffle(afa);
                        afa.forEach(x => elm.appendChild(x));
                    });
                }
            }
            window.onhashchange = hashChange;
            hashChange();
            document.querySelector(".main-content").prepend(search);
            logFinish("add task search bar");
            document.querySelector("body > div.page-container > div.main > div.main-content > div:nth-child(3)").innerHTML += `<a href="./Training.do?cid=5">[ ${localize("Other tasks", "Други задачи")} ]</a>&nbsp;&nbsp;`;
            document.querySelector("body > div.page-container > div.main > div.main-content > div:last-child").innerHTML =
                document.querySelector("body > div.page-container > div.main > div.main-content > div:nth-child(3)").innerHTML;
            logFinish("add secret tasks");
            if (/(Статистика|Success rate)/.test(document.querySelector(".main-content > .column1-unit > .training-content table tr th:last-child").textContent)) {
                let elm = document.querySelector(".main-content > .column1-unit > .training-content table tr th:last-child");
                let select = document.createElement("select");
                select.innerHTML = [["normal", "indexmin"], ["latest", "indexmax"], ["min %", "percmin"], ["max %", "percmax"], ["least tried", "submin"],
                                    ["most tried", "submax"], ["least solved", "solvmin"], ["most solved", "solvmax"]].map(x => `<option value="${x[1]}">${x[0]}</option>`).join("");
                select.className = "sorttask";
                let sortcriteria = {
                    index: tr => parseInt(tr.querySelector("td").textContent),
                    perc: tr => parseInt(/\((\d+)%\)/.exec(tr.querySelector("td:last-child").textContent)[1]),
                    sub: tr => parseInt(/\/(\d+)\b/.exec(tr.querySelector("td:last-child").textContent)[1]),
                    solv: tr => parseInt(/^(\d+)\//.exec(tr.querySelector("td:last-child").textContent)[1])
                };
                select.oninput = event => {
                    let [, criteria, rev] = /^([a-z]+)(min|max)$/.exec(select.value);
                    rev = rev == "max" ? -1 : 1;
                    let f = sortcriteria[criteria];
                    let rows = Array.from(document.querySelectorAll(".main-content > .column1-unit > .training-content table tr")).slice(1).sort((a, b) => (f(a) - f(b)) * rev);
                    rows.forEach(x => document.querySelector(".main-content > .column1-unit > .training-content tbody").appendChild(x));
                };
                elm.appendChild(select);
                logFinish("add statistics sorting");
            }
        }
        if (document.querySelector("body > div.page-container > div.header > div.header-bottom > div")) {
            document.querySelector("body > div.page-container > div.header > div.header-bottom > div").innerHTML += `<ul><li><a style="
			background-image: url(./img/lightbulb.png);
			" href='/algoritmi'>${localize("II Algorithms", "ИИ Алгоритми")}</a></li></ul>`;
            logFinish("add ii algorithms button");
            document.querySelector("body > div.page-container > div.header > div.header-bottom > div > ul:nth-child(1) > li > a").href = "/";
            document.querySelector("body > div.page-container > div.header > div.header-bottom > div > ul:nth-child(2) > li > a").href = "/Training.do";
            document.querySelector("body > div.page-container > div.header > div.header-bottom > div > ul:nth-child(2) > li > a").className = "";
            document.querySelectorAll("div.main-content > div > div > table > tbody > tr > td:nth-child(2) > a").forEach(e => void(e.target = "_blank"));
            logFinish("make task links open in another window");
            if (document.URL.includes("/Training.do")) {
                var solved = 0, total = 0, progbar = document.createElement("div");
                document.querySelectorAll("body > div.page-container > div.main > div.main-content > div > div > table > tbody > tr").forEach(elm => {
                    if (elm.children.length < 2 || elm.children[0].nodeName.toUpperCase() == "TH") return;
                    if (elm.querySelector("td.solved")) solved++;
                    total++;
                });
                progbar.className = "progbar";
                progbar.innerHTML = `<div style="width:${solved / total * 100}%">${solved} / ${total} (${Math.floor(solved / total * 100)}%)</div>`;
                document.querySelector("body > div.page-container > div.main > div.main-content > div > div > table > caption").appendChild(progbar);
                logFinish("task solved percentage");
                var taskShare = document.createElement("div");
                taskShare.style.marginBottom = "10px";
                taskShare.innerHTML = `
<button id=solved-tasks-save>${localize("Share solved tasks", "Сподели решени задачи")}</button>
<button id=solved-tasks-load>${localize("Load shared solved tasks", "Лоадирај споделени решени задачи")}</button>
<button id=hide-solved-tasks>${localize("Hide/Show solved tasks", "Скриј/Откриј решени задачи")}</button>`;
                let taskshcode = "mendo-reseni-zadaci" + /^https?(.*)$/.exec(document.URL)[1];
                if (taskshcode.includes("#")) taskshcode = taskshcode.slice(0, taskshcode.indexOf("#"));
                taskShare.querySelector("#hide-solved-tasks").onclick = () => {
                    document.querySelectorAll("body > div.page-container > div.main > div.main-content > div:nth-child(5) > div > table > tbody > tr").forEach(td => {
                        if (td.childNodes[0].classList.contains("solved")) td.classList.toggle("hidden");
                    });
                };
                taskShare.querySelector("#solved-tasks-save").onclick = () => {
                    var array = [];
                    document.querySelectorAll("body > div.page-container > div.main > div.main-content > div:nth-child(5) > div > table > tbody > tr > td:first-child").forEach(td => {
                        if (td.classList.contains("solved")) array.push(td.innerText.substr(0, td.innerText.length - 1));
                    });
                    array.unshift(taskshcode);
                    navigator.clipboard.writeText(array.join(","));
                };
                taskShare.querySelector("#solved-tasks-load").onclick = async() => {
                    var array = prompt(localize("Enter code...", "Внеси код...")).split(",");
                    if (array[0] != taskshcode) {
                        alert(localize("Invalid task solve share schema! / Invalid site!", "Невалидна шема на споделени решени задачи! / Невалидна страна!"));
                        return;
                    }
                    array.shift();
                    document.querySelectorAll("body > div.page-container > div.main > div.main-content > div:nth-child(5) > div > table > tbody > tr > td:first-child").forEach(td => {
                        if (array.includes(td.innerText.substr(0, td.innerText.length - 1))) td.classList.add("share-solved");
                        else td.classList.remove("share-solved");
                    });
                };
                document.querySelector(".main-content").prepend(taskShare);
                logFinish("add task share");
            }
        }
        if (document.querySelector("body > div.page-container > div.header > div.header-breadcrumbs > ul > li:last-child > a")) {
            window.name = document.querySelector("body > div.page-container > div.header > div.header-breadcrumbs > ul > li:last-child > a").innerText;
        }
        else if (document.querySelector(".pagetitle")) {
            window.name = document.querySelector(".pagetitle").innerText;
        }
        document.title = (document.querySelector("body > div.page-container > div.header > div.header-breadcrumbs > ul > li:last-child > a")
                          ?? document.querySelector(".pagetitle")
                          ?? document.querySelector(".pagename")
                          ?? {innerText: document.URL.substr(document.URL.indexOf("/", 8) + 1)}
                         ).innerText + " – МЕНДО";
        logFinish("document title set");
        if (document.URL.includes("/Task.do")) {
            document.querySelectorAll("body > div.page-container > div.main > div.main-content > div.column1-unit.taskContentView > table pre").forEach(pre => {
                var text = pre.innerText.substr(pre.innerText.indexOf("\n") + 1);
                var copyIoBtn = document.createElement("span");
                copyIoBtn.innerHTML = "<span></span>";
                copyIoBtn.setAttribute("onclick", `navigator.clipboard.writeText(${JSON.stringify(text)})`);
                copyIoBtn.className = "copy-io-btn";
                pre.parentElement.appendChild(copyIoBtn);
            });
            logFinish("copy io buttons");
            var navArrows = document.createElement("div");
            navArrows.innerHTML = `
			<a href="${document.URL.substr(0, document.URL.lastIndexOf("=") + 1) + (parseInt(document.URL.substr(document.URL.lastIndexOf("=") + 1)) - 1)}">&lt;</a>
			<a href="${document.URL.substr(0, document.URL.lastIndexOf("=") + 1) + (parseInt(document.URL.substr(document.URL.lastIndexOf("=") + 1)) + 1)}" style="float:right">&gt;</a>
			`;
            navArrows.style.fontSize = "40px";
            navArrows.style.marginBottom = "20px";
            document.querySelector(".main-content").prepend(navArrows);
            logFinish("add nav buttons");
            document.querySelector(".pagetitle").style.textAlign = "center";
            logFinish("center title text");
            setInterval(() => {
                var scode = document.getElementById("solutionCode");
                if (!scode.value.includes("// online judge") && !scode.value.includes("#define ONLINE_JUDGE") && scode.value.length) {
                    scode.value = "#define ONLINE_JUDGE // online judge\n" + scode.value;
                    document.querySelector("label[for=solutionCode]").innerHTML += `<a href="https://greasyfork.org/en/scripts/450985-mendo-mk-enhancement" class=ojtxt>${localize("This macro was automatically added", "Ова макро беше автоматски додадено")}: <code>ONLINE_JUDGE</code></a>`;
                    setTimeout(() => document.querySelector(".ojtxt:last-child").remove(), 3000);
                }
            }, 500);
            logFinish("#define ONLINE_JUDGE");
        }
        (document.querySelector(".footer") ?? {}).innerHTML += `<p class="credits"><a href="https://greasyfork.org/en/scripts/450985-mendo-mk-enhancement">MENDO.MK Enhancement</a> <a href="javascript:toggleTheme()">🎨</a> <a href="javascript:Changelog()">Changelog</a></p>`;
        window.toggleTheme = () => {
            localStorage.setItem("mendo-mk-enhancement-theme", localStorage.getItem("mendo-mk-enhancement-theme") == "dark" ? "light" : "dark");
            location.reload();
        };
        let dmodebtn = document.createElement("div");
        dmodebtn.className = `bi bi-${localStorage.getItem("mendo-mk-enhancement-theme") == "dark" ? "moon" : "sun"}-fill`;
        document.body.appendChild(dmodebtn);
        dmodebtn.style = "width:30px;height:30px;font-size:30px;position:fixed;bottom:0;right:0;margin:10px;cursor:pointer;color:#89AAD6";
        dmodebtn.setAttribute("onclick", "toggleTheme()");
        logFinish("dark mode button");
        loadingSuccess = 1;
        if (/^https?:\/\/mendo\.mk\/.*?User_Submission.do\?/.test(document.URL)) {
            let ok = false;
            for (let elm of document.querySelectorAll("img")) {
                if (elm.src.includes("loadingAnimation")) {
                    ok = true;
                    break;
                }
            }
            function checkForCinematic() {
                let usubTBody = document.querySelector("div.main-content > div > div > table:nth-child(6) > tbody");
                if (!ok) {
                    taskSolveCinematic(0, true);
                    return;
                }
                if (!usubTBody) {
                    requestAnimationFrame(checkForCinematic);
                }
                else if (usubTBody.querySelectorAll("tr td.correct:first-child").length + 1 >= usubTBody.querySelectorAll("tr").length) taskSolveCinematic(1, true);
                else taskSolveCinematic(2, true);
            }
            checkForCinematic();
            logFinish("task solve cinematic setup");
        }
        if (!isNaN(parseInt(document.querySelector("#LoginForm>fieldset>p:last-child>a")?.innerText))) {
            let elm = document.createElement("p");
            let tasks = parseInt(document.querySelector("#LoginForm>fieldset>p:last-child>a").innerText);
            let ach = new Set((localStorage.getItem("achievements " + document.querySelector("#LoginForm>fieldset>p>a").innerText) || "").split("|"));
            ach.delete("");
            let allread = true, lecturepage = false;
            for (let e of document.querySelectorAll(".training-content td:last-child")) {
                if (e.innerText.includes(localize("lecture", "предавање"))) {
                    lecturepage = true;
                    if (!e.classList.contains("solved")) {
                        allread = false;
                        break;
                    }
                }
            }
            const achs = {
                task: [tasks >= 10, tasks >= 50, tasks >= 100, tasks >= 150, tasks >= 200, tasks >= 250, tasks >= 300, tasks >= 400],
                readlec: [allread && lecturepage && (document.URL.endsWith("/Training.do") || document.URL.endsWith("/Training.do?cid=0") || document.URL.endsWith("/Training.do?cid=4")),
                         allread && lecturepage && document.URL.endsWith("/Training.do?cid=6") && ach.has("readlec0")]
            };
            const achlink = {
                task: "/Training.do?cid=1",
                readlec: "/Training.do?cid=6"
            };
            const achname = {
                task7: localize("God (400 tasks)", "Господ (400 задачи)"),
                task6: localize("Tzar (300 tasks)", "Цар (300 задачи)"),
                task5: localize("King (250 tasks)", "Крал (250 задачи)"),
                task4: localize("Master (200 tasks)", "Мајстор (200 задачи)"),
                task3: localize("Expert (150 tasks)", "Експерта (150 задачи)"),
                task2: localize("Specialist (100 tasks)", "Специјалист (100 задачи)"),
                task1: localize("Determined (50 tasks)", "Детерминиран (50 задачи)"),
                task0: localize("Apprentice (10 tasks)", "Чирак (10 задачи)"),
                readlec0: localize("Student I (all Learn C++ tasks solved)", "Студент I (сите Научи C++ лекции прочитани)"),
                readlec1: localize("Student II (all Algorithms & Learn C++ tasks solved)", "Студент II (сите Алгоритми и Научи C++ лекции прочитани)")
            };
            for (let a in achs) {
                let level = achs[a].lastIndexOf(true);
                if (level < 0) continue;
                for (let i = level - 1; i >= 0; i--) ach.delete(a + i);
                ach.add(a + level);
            }
            console.log(ach);
            elm.innerHTML = `${localize("Achievements", "Постигнувања")}:<br>${[...ach].map(x => `&nbsp; &nbsp; <a title="${achname[x]}" href="${achlink[/[a-z]+/.exec(x)[0]]}">${/(.+) \(/i.exec(achname[x])[1]}</a>`).join("<br>") || localize("None", "Нема")}`;
            document.querySelector("#LoginForm>fieldset").appendChild(document.createElement("br"));
            document.querySelector("#LoginForm>fieldset").appendChild(elm);
            localStorage.setItem("achievements " + document.querySelector("#LoginForm>fieldset>p>a").innerText, [...ach].join("|"));
            logFinish("achievements");
        }
    }
    catch (_) {
        console.error(_);
        loadingSuccess = 2;
    }
}
function taskSolveCinematic(showType, reformatTcs = false) {
    if (AprilFools) {
        let congrattd = document.querySelector(".submission-content tr[align=right] td");
        if (congrattd && congrattd.innerText.includes("Congratulations!")) congrattd.innerHTML = "April Fools!";
        if (congrattd && congrattd.innerText.includes("Честитки!")) congrattd.innerHTML = "Априлилили!";
    }
    if (reformatTcs) {
        let tcs = document.querySelector("div.main-content > div > div > table:nth-child(6) > tbody");
        let tclist = Array.from(tcs.children);
        let tr, nAC = 0, nWA = 0, nTLE = 0, nRE = 0;
        for (let tc of tclist) {
            if (!tr || tr.children.length == 5) {
                tr = document.createElement("tr");
                tcs.appendChild(tr);
            }
            let td = tc.querySelector("td");
            if (td) {
                if (tc.innerText.includes("Runtime Error")) {
                    td.innerText += " RE";
                    td.classList.add("verdict-re");
                    nRE++;
                }
                if (tc.innerText.includes("Wrong") || tc.innerText.includes("Погрешен")) {
                    td.innerText += " WA";
                    td.classList.add("verdict-wa");
                    nWA++;
                }
                if (tc.innerText.includes("Time") || tc.innerText.includes("време")) {
                    td.innerText += " TLE";
                    td.classList.add("verdict-tle");
                    nTLE++;
                }
                if (tc.innerText.includes("Точен") || tc.innerText.includes("Correct")) {
                    td.innerText += " AC (" + /[\d.]+/.exec(tc.children[1].innerText)[0] + ")";
                    td.classList.add("verdict-ac");
                    nAC++;
                }
                tr.appendChild(td);
            }
            tc.remove();
        }
        let chartcontainer = document.createElement("div");
        let chart = document.createElement("canvas");
        chartcontainer.appendChild(chart);
        chartcontainer.style = "height:250px;display:flex;justify-content:center;align-items:center;";
        document.querySelector(".submission-content").insertBefore(chartcontainer, document.querySelectorAll(".submission-content table")[2]);
        new Chart(chart, {
            type: "pie",
            data: {
            labels: ["AC", "WA", "TLE", "RE"],
                datasets: [{
                label: "Results",
                    data: [nAC, nWA, nTLE, nRE],
                    backgroundColor: ["#bfb", "#fbb", "#bbf", "#fda"]
                }]
            }
        });
    }
    if (!showType) return;
    var preCinematicScreen = document.createElement("div");
    preCinematicScreen.style = `
	top: 0px; left: 0px; position: fixed; width: 100vw; height: 100vh;
	background: white; font-size: 20px; cursor: pointer; z-index: 99999;
	`;
    preCinematicScreen.innerHTML = `
	<div style="color: black; position: fixed; top: 50vh; left: 50vw; transform: translate(-50%, -50%);">[ ${localize("Reveal", "Откриј")} ]</div>
	<div style="color: black; position: fixed; top: 10px; right: 10px;" id=skip-cinematic>${localize("Skip", "Скокни")} &gt;&gt;</div>
	`;
    preCinematicScreen.onclick = () => {
        preCinematicScreen.remove();
        if (window.event.target.id == "skip-cinematic") return;
        const cinematics = [() => {
            let img = document.createElement("img");
            img.src = "https://i.ibb.co/b7WW8Q3/mission-passed.png";
            img.style = "animation: gta-cinematic-image 17s 1 linear; position: fixed; top: 0; left: 0; width: 100vw; background: transparent !important";
            let audio = document.createElement("audio");
            audio.oncanplay = () => audio.play();
            audio.crossorigin = "anonymous";
            audio.src = "https://www.myinstants.com/media/sounds/gta-san-andreas-mission-passed-sound_TpUVE5G.mp3";
            // audio.src = "https://dl.sndup.net/fmjm/mission%20passed%20audio.mp3";
            document.body.appendChild(img);
            setTimeout(() => img.remove(), 10000);
        }], failCinematics = [() => {
            let audio = document.createElement("audio");
            audio.oncanplay = () => audio.play();
            audio.crossorigin = "anonymous";
            audio.src = "https://www.myinstants.com/media/sounds/erro.mp3";
            let img = document.createElement("img");
            img.src = "https://i.kym-cdn.com/photos/images/original/000/918/810/a22.jpg";
            img.style = "position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) scale(.5); background: transparent !important; box-shadow: black 10px 10px 5px";
            document.body.appendChild(img);
            img.onclick = () => img.remove();
        }];
        if (showType == 1) cinematics[Math.floor(Math.random() * cinematics.length)]();
        else failCinematics[Math.floor(Math.random() * failCinematics.length)]();
    };
    document.body.appendChild(preCinematicScreen);
}
async function Changelog() {
    alert(await fetch("https://raw.githubusercontent.com/EntityPlantt/EntityPlantt.github.io/refs/heads/main/mendo-enhancement/changelog.txt").then(x => x.text()).catch(x => "Changelog not found"));
}
window.MendoMkEnhancement = MendoMkEnhancement;
window.taskSolveCinematic = taskSolveCinematic;
window.Changelog = Changelog;
MendoMkEnhancement();