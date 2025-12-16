const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("App rodando via Jenkins + Kubernetes 🚀");
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor na porta ${PORT}`);
});

