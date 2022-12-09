try {
	Polynomia.HTML = Object.create(null);
}
catch (_) {
	var script = document.createElement("script");
	script.src = "polynomia.js";
	console.error(`Please import Polynomia so Polynomia HTML can work.
This can be done by adding %c<script src="polynomia.js"></script>%c to the page.`,
"background:#121212;color:lightgray;padding:2px 5px", "");
	throw "error: see error above";
}
window.addEventListener("load", () => {
	var elm = document.createElement("style");
	elm.innerHTML = `/* Chrome, Safari, Edge, Opera */
.polynomia input::-webkit-outer-spin-button,
.polynomia input::-webkit-inner-spin-button {
	-webkit-appearance: none;
	margin: 0;
}
.polynomia input {
	font: inherit;
	margin: 0;
	padding: 0;
	color: inherit;
	border: none;
	background: #80808011;
}

/* Firefox */
.polynomia input[type=number] {
	-moz-appearance: textfield;
}`;
	document.head.appendChild(elm);
});
Polynomia.HTML.MonomialDisplay = class MonomialDisplay {
	constructor(m = null, inputEnabled = false, dom = null, size = 50, style = {}) {
		this.monomial = m ?? new Polynomia.Monomial;
		this.domElement = dom ?? document.createElement("div");
		this.inputEnabled = inputEnabled;
		this.size = size;
		Object.assign(this.style, style);
		this.style.fontSize = this.size + "px";
		this.render();
	}
	monomial; domElement; inputEnabled; style = {
		fontFamily: "serif",
		fontStyle: "italic",
		color: "black",
		padding: "10px 15px"
	}; size;
	render() {
		Object.assign(this.domElement.style, this.style);
		this.domElement.classList.add("polynomia");
		this.domElement.classList.add("polynomia-monomial");
		if (this.inputEnabled) {
			this.domElement.innerHTML = `
			<input value=${(this.monomial.coefficient == 1 && this.monomial.variablesToString()) ? null : this.monomial.coefficient} type=number style="
			width: ${this.size * (this.monomial.coefficient.toString().length) / 2}px"
			step=any>
			`;
			this.domElement.querySelector("input").onchange = event => {
				this.monomial.coefficient = parseFloat(event.target.value);
				this.render();
			}
			for (var i of Object.keys(this.monomial.variables)) {
				if (!this.monomial.variables[i]) {
					continue;
				}
				var elm = document.createElement("span");
				elm.innerText = i;
				elm.oncontextmenu = event => {
					event.preventDefault();
					delete this.monomial.variables[event.target.innerText];
					this.render();
				}
				this.domElement.appendChild(elm);
				elm = document.createElement("input");
				elm.type = "number";
				elm.min = 0;
				elm.value = (this.monomial.variables[i] == 1) ? null : this.monomial.variables[i];
				elm.style = `
				vertical-align: top; font-size: ${this.size / 2}px;
				width: ${this.size / 4 * (this.monomial.variables[i].toString().length)}px;
				`;
				elm.onchange = event => {
					this.monomial.variables[event.target.previousSibling.innerText] = parseInt(event.target.value);
					this.render();
				}
				this.domElement.appendChild(elm);
			}
			var elm = document.createElement("input");
			elm.style.width = this.size / 3 + "px";
			elm.onkeydown = event => {
				if (/^[a-zA-Z]$/.test(event.key)) {
					event.target.blur();
					this.monomial.variables[event.key] = 1;
					this.render();
				}
				event.preventDefault();
			}
			this.domElement.appendChild(elm);
		}
		else {
			this.domElement.innerText = this.monomial;
		}
	}
}