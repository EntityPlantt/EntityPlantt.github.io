const http = require("http");
http.createServer((req, res) => {
	if (req.method == "GET") {
		res.writeHead(200, {"Content-Type": "text/html"});
		res.end("<h1>Hello world!</h1>\nPowered by Node");
	}
	else {
		res.writeHead(404, {"Content-Type": "text/json"});
		res.end('{"message":"404 HTTP Error"}');
	}
}).listen(80);