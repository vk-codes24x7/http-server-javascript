const net = require("net");

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    const stringData = data.toString();
    const requestPath = stringData.split(" ")[1];
    console.log(requestPath);
    if (stringData.startsWith("GET /")) {
      const responseStatus = requestPath === "/" ? "200 OK" : "404 Not Found";
      console.log(responseStatus);
      socket.write(`HTTP/1.1 ${responseStatus}\r\n\r\n`);
    }
    socket.end();
  });
  socket.on("close", () => {
    socket.end();
    server.close();
  });
});

server.listen(4221, "localhost");
