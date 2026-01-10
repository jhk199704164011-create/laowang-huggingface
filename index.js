const os = require('os');
const http = require('http');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const net = require('net');
const { exec, execSync, spawn } = require('child_process');
const { WebSocket, createWebSocketStream } = require('ws');

const UUID = process.env.UUID || '390a4e2e-d37b-4f8d-aea2-39985595dfbd'; 
const DOMAIN = process.env.DOMAIN || 'aaa.sanguoyanyi1234.de5.net'; 
const SUB_PATH = process.env.SUB_PATH || 'sub';
const WSPATH = process.env.WSPATH || UUID.slice(0, 8); 
const PORT = process.env.PORT || 7860;

const httpServer = http.createServer((req, res) => {
  if (req.url === '/') {
    const htmlPath = path.join(__dirname, 'index.html');
    fs.readFile(htmlPath, 'utf8', (err, data) => {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      if (err) res.end('<h1>Green Network</h1><p>Service Active.</p>');
      else res.end(data);
    });
  } else if (req.url === `/${SUB_PATH}`) {
    const vless = `vless://${UUID}@${DOMAIN}:443?encryption=none&security=tls&sni=${DOMAIN}&fp=chrome&type=ws&host=${DOMAIN}&path=%2F${WSPATH}#HF-Node`;
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(Buffer.from(vless).toString('base64') + '\n');
  } else { res.writeHead(404); res.end(); }
});

const wss = new WebSocket.Server({ server: httpServer });
const uuidHex = UUID.replace(/-/g, "");
wss.on('connection', (ws) => {
  ws.on('error', () => {}); 
  ws.once('message', msg => {
    const [VERSION] = msg;
    const id = msg.slice(1, 17);
    if (!id.every((v, i) => v == parseInt(uuidHex.substr(i * 2, 2), 16))) return;
    let i = msg.slice(17, 18).readUInt8() + 19;
    const port = msg.slice(i, i += 2).readUInt16BE(0);
    const ATYP = msg.slice(i, i += 1).readUInt8();
    let host = ATYP == 1 ? msg.slice(i, i += 4).join('.') : (ATYP == 2 ? msg.slice(i + 1, i += 1 + msg[i]).toString() : '');
    if (ws.readyState === WebSocket.OPEN) ws.send(new Uint8Array([VERSION, 0]));
    const duplex = createWebSocketStream(ws);
    net.connect({ host, port }, function() {
      this.write(msg.slice(i));
      duplex.pipe(this).pipe(duplex);
    }).on('error', () => { ws.close(); });
  });
});
httpServer.listen(PORT, () => { console.log(`Server started on port ${PORT}`); });
