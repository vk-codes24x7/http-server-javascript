const net = require("net");
const fs = require("fs");
const zlib = require("zlib");

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    const stringData = data.toString();
    const url = stringData.split(" ")[1];
    const method = stringData.split(" ")[0];
    const headers = stringData.split("\r\n");
    if (url === "/") {
      socket.write("HTTP/1.1 200 OK\r\n\r\n");
    } else if (url.startsWith("/files/") && method === "GET") {
      const directory = process.argv[3];
      const filename = url.split("/files/")[1];
      if (fs.existsSync(`${directory}/${filename}`)) {
        const contents = fs.readFileSync(`${directory}/${filename}`).toString();
        const res = `HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${contents.length}\r\n\r\n${contents}\r\n`;
        socket.write(res);
      } else {
        socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
      }
    } else if (url.startsWith("/files/") && method === "POST") {
      const directory = process.argv[3];
      const filename = url.split("/files/")[1];
      const url_path = `${directory}/${filename}`;
      const body = headers[headers.length - 1];
      fs.writeFileSync(url_path, body);
      const httpResponse = "HTTP/1.1 201 Created\r\n\r\n";
      socket.write(httpResponse);
    } else if (url.includes("/echo/")) {
      const contents = url.split("/echo/")[1];
      console.log(`contents - ${contents}`);
      const match = stringData.match(/Accept-Encoding:\s*(.*)/);
      const acceptEncoding = match ? match[1] : null;
      if (
        stringData.includes("Accept-Encoding:") &&
        acceptEncoding.includes("gzip")
      ) {
        console.log(`inside the if statement`);
        const bodyEncoded = zlib.gzipSync(contents);
        socket.write(
          `HTTP/1.1 200 OK\r\nContent-Encoding: gzip\r\nContent-Type: text/plain\r\nContent-Length: ${bodyEncoded.length}\r\n\r\n`
        );
        socket.write(bodyEncoded);
        socket.end();
      } else {
        socket.write(
          `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${contents.length}\r\n\r\n${contents}`
        );
      }
    } else if (url === "/user-agent") {
      const userAgent = headers[2].split("User-Agent: ")[1];
      socket.write(
        `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${userAgent.length}\r\n\r\n${userAgent}`
      );
    } else {
      socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
    }

    socket.end();
  });
  socket.on("close", () => {
    socket.end();
  });
});

server.listen(4221, "localhost");
