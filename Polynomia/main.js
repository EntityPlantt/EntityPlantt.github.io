onload = () => {
	var m = new Polynomia.HTML.MonomialDisplay(new Polynomia.Monomial(2, {x: 2}), true);
	document.body.appendChild(m.domElement);
}