#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const express = require('express');
const WebSocket = require('ws');

const args = process.argv.slice(2);
if (args.length < 2) {
    console.error('Uso: node server.js <cert_file> <key_file>');
    process.exit(1);
}

const certFile = args[0];
const keyFile = args[1];
const PORT = 9009;

if (!fs.existsSync(certFile) || !fs.existsSync(keyFile)) {
    console.error('Error: Los archivos de certificado no existen');
    process.exit(1);
}

const options = {
    cert: fs.readFileSync(certFile),
    key: fs.readFileSync(keyFile)
};

const app = express();

app.use(express.static(__dirname));

// Serve manifest.json with correct MIME type
app.get('/manifest.json', (req, res) => {
    res.type('application/manifest+json').sendFile(__dirname + '/manifest.json');
});

// Serve service worker with correct MIME type
app.get('/sw.js', (req, res) => {
    res.type('application/javascript').sendFile(__dirname + '/sw.js');
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

const server = https.createServer(options, app);
const wss = new WebSocket.Server({ server });

let lastPingTime = null;
let powerStatus = false;
let statusInterval = null;

function updateStatus() {
    const now = Date.now();
    const oneMinute = 60 * 1000;
    
    if (lastPingTime === null || (now - lastPingTime) > oneMinute) {
        powerStatus = false;
    } else {
        powerStatus = true;
    }
    
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ status: powerStatus ? 'ON' : 'OFF' }));
        }
    });
}

function checkStatus() {
    const now = Date.now();
    const oneMinute = 60 * 1000;
    
    if (lastPingTime === null || (now - lastPingTime) > oneMinute) {
        console.log(`[${new Date().toISOString()}] SIN CORRIENTE - Último ping: ${lastPingTime ? new Date(lastPingTime).toISOString() : 'Nunca'}`);
    } else {
        console.log(`[${new Date().toISOString()}] CORRIENTE OK - Último ping: ${new Date(lastPingTime).toISOString()}`);
    }
    updateStatus();
}

wss.on('connection', (ws, req) => {
    console.log(`Cliente conectado desde: ${req.url}`);
    
    if (req.url === '/ping') {
        lastPingTime = Date.now();
        console.log(`[${new Date().toISOString()}] Ping recibido del cliente`);
        ws.send('pong');
        setTimeout(() => ws.close(), 100);
    } else {
        console.log('Cliente web conectado');
        ws.send(JSON.stringify({ status: powerStatus ? 'ON' : 'OFF' }));
        
        ws.on('close', () => {
            console.log('Cliente web desconectado');
        });
    }
});

console.log(`Servidor iniciado en puerto ${PORT}`);
console.log(`Esperando pings del cliente...`);

statusInterval = setInterval(checkStatus, 5000);

server.listen(PORT, () => {
    console.log(`Servidor HTTPS escuchando en https://localhost:${PORT}`);
    console.log(`Estado inicial: SIN CORRIENTE`);
});