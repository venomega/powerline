# Monitor de Corriente - Cliente-Servidor

## Descripción
Aplicación cliente-servidor para monitorear el estado de corriente mediante pings periódicos.

## Uso



### Servidor
```bash
node server.js server.crt server.key
```
- Escucha en el puerto 9009
- Requiere archivos de certificado SSL como argumentos
- Muestra página web en https://localhost:9009

### Cliente
```bash
node client.js
```
- Envía ping al servidor cada 30 segundos
- Se conecta a wss://localhost:9009/ping

## Funcionamiento
- **Estado ROJO**: Sin ping del cliente por más de 1 minuto o al iniciar
- **Estado VERDE**: Ping recibido en el último minuto
- La página web se actualiza en tiempo real via WebSocket

