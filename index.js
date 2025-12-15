const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("App rodando via Jenkins + Kubernetes 🚀");
});

server.listen(3000, () => {
  console.log("Servidor na porta 3000");
});
