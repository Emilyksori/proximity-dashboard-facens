# ESP32 Proximity Monitor

A local web dashboard for monitoring a proximity sensor connected to an ESP32 through a USB serial connection.

## Technologies
- Node.js
- Express
- Javascript
- HTML/CSS

## Requirements
Node.js installed
An ESP32 connected to the computer via USB
The ESP32 running code that sends serial messages at 115200 baud

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

```bat
set SERIAL_PORT=COM7
npm install
npm start
```

