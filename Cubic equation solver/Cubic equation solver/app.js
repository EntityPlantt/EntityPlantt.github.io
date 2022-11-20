(async () => {
    const readline = require("readline").createInterface(process.stdin);
    process.stdout.write("Cubic equation solver\nSolving ax^3 + bx^2 + cx + d = 0\na = ");
    var a = Number(await new Promise(ret => readline.once("line", ret)));
    process.stdout.write("b = ");
    var b = Number(await new Promise(ret => readline.once("line", ret)));
    process.stdout.write("c = ");
    var c = Number(await new Promise(ret => readline.once("line", ret)));
    process.stdout.write("d = ");
    var d = Number(await new Promise(ret => readline.once("line", ret)));
    process.stdout.write(`${a}x^3 + ${b}x^2 + ${c}x + ${d} = 0\n=> x = `);
    const r2 = Math.sqrt, r3 = Math.cbrt;
    process.stdout.write((
        r3(
            (-(b * b * b) / 27 / a / a / a + b * c / 6 / a / a - d / 2 / a)
            + r2(
                (-(b * b * b) / 27 / a / a / a + b * c / 6 / a / a - d / 2 / a) ** 2
                + (c / 3 / a - b * b / 9 / a / a) ** 3
            )
        ) +
        r3(
            (-(b * b * b) / 27 / a / a / a + b * c / 6 / a / a - d / 2 / a)
            - r2(
                (-(b * b * b) / 27 / a / a / a + b * c / 6 / a / a - d / 2 / a) ** 2
                + (c / 3 / a - b * b / 9 / a / a) ** 3
            )
        )
        - b / 3 / a
    ).toString() + "\n");
    readline.close();
    while (true);
})();