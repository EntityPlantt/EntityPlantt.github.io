window.Polynomia = Object.create(null);
Polynomia.Monomial = class Monomial {
	coefficient = 1;
	variables = {};
	constructor(a, b = {}) {
		if (a instanceof Monomial) {
			this.coefficient = a.coefficient;
			this.variables = Object.assign({}, a.variables);
		}
		else {
			this.coefficient = a;
			this.variables = Object.assign({}, b);
		}
	}
	powerOf(v) {
		return this.variables[v] ?? 0;
	}
	multiply(m) {
		var vars = Object.assign({}, this.variables);
		for (var i of Object.keys(m.variables)) {
			if (!(i in vars)) {
				vars[i] = 0;
			}
			vars[i] += m.variables[i];
		}
		return new Polynomia.Monomial(this.coefficient * m.coefficient, vars);
	}
	add(m) {
		if (this.isSimilarTo(m)) {
			return new Polynomia.Monomial(this.coefficient + m.coefficient, this.variables);
		}
		return new Polynomia.Polynomial([this, m]);
	}
	isSimilarTo(m) {
		return this.variablesToString() == m.variablesToString();
	}
	copy() {
		return new Polynomia.Monomial(this.coefficient, this.variables);
	}
	variablesToString() {
		function superscript(str) {
			var from = "0123456789", to = "⁰¹²³⁴⁵⁶⁷⁸⁹";
			for (var i = 0; i < 10; i++) {
				str = str.replaceAll(from[i], to[i]);
			}
			return str;
		}
		var str = "";
		for (var i of Object.keys(this.variables)) {
			if (this.powerOf(i)) {
				str += i + ((this.powerOf(i) == 1) ? "" : superscript(this.powerOf(i).toString()));
			}
		}
		return str;
	}
	toString() {
		if (this.coefficient == 1) {
			if (this.variablesToString()) {
				return this.variablesToString();
			}
			return "1";
		}
		return this.coefficient.toString() + this.variablesToString();
	}
	solve(v) {
		var m = new Polynomia.Monomial(this.coefficient);
		for (var i of Object.keys(this.variables)) {
			if (v[i]) {
				m.coefficient *= v[i] ** this.variables[i];
			}
			else {
				m.variables[i] = this.variables[i];
			}
		}
		return m;
	}
}
Polynomia.Polynomial = class Polynomial extends Array {
	constructor(arr = []) {
		super();
		for (var i of arr) {
			this.push(i.copy());
		}
	}
	copy() {
		return new Polynomia.Polynomial(this);
	}
	solve(v) {
		var p = new Polynomia.Polynomial;
		for (var i of this) {
			p.push(i.solve(v));
		}
		return p.normalize();
	}
	normalize() {
		var g = {}, r = new Polynomia.Polynomial;
		this.forEach(m => {
			if (!(m.variablesToString() in g)) {
				g[m.variablesToString()] = new Polynomia.Polynomial;
			}
			g[m.variablesToString()].push(m);
		});
		for (var p of Object.values(g)) {
			var m = p[0].copy();
			for (var i = 1; i < p.length; i++) {
				m = m.add(p[i]);
			}
			r.push(m);
		}
		return r;
	}
	toString() {
		if (!this.length) {
			return "";
		}
		var str = this[0].toString();
		for (var i = 1; i < this.length; i++) {
			var m = this[i];
			if (m.coefficient < 0) {
				str += " - " + new Polynomia.Monomial(0 - m.coefficient, m.variables);
			}
			else {
				str += " + " + m;
			}
		}
		return str;
	}
}