#!/usr/bin/env node

const WebSocket = require('ws');
const https = require('https');

const SERVER_URL = 'wss://localhost:9009/ping';

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

function sendPing() {
    const ws = new WebSocket(SERVER_URL, {
        rejectUnauthorized: false
    });
    
    ws.on('open', () => {
        console.log(`[${new Date().toISOString()}] Enviando ping al servidor...`);
        ws.send('ping');
    });
    
    ws.on('message', (data) => {
        console.log(`[${new Date().toISOString()}] Respuesta del servidor: ${data}`);
    });
    
    ws.on('error', (error) => {
        console.error(`[${new Date().toISOString()}] Error de conexión: ${error.message}`);
    });
    
    ws.on('close', () => {
        console.log(`[${new Date().toISOString()}] Conexión cerrada`);
    });
}

console.log(`Cliente iniciado - Enviando pings a ${SERVER_URL} cada 30 segundos`);
console.log('Presiona Ctrl+C para detener');

sendPing();

setInterval(sendPing, 30 * 1000);