# ESP32 Proximity Monitor

Initial Node.js structure for monitoring a proximity sensor connected to an ESP32 over a serial port and streaming the sensor state to a browser in real time.

## Dependencies

Install dependencies before running the server:

```bash
npm install
```

## Serial port configuration

The app reads the serial port from `process.env.SERIAL_PORT`.

Baud rate:

- `115200`

## Running on Windows

### Command Prompt

```bat
set SERIAL_PORT=COM7
npm install
npm start
```

