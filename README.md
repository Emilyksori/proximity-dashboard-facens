# ESP32 Parking Monitor

A local Node.js dashboard for monitoring the 6 parking spots reported by `parking-system-esp32.ino` through the ESP32 serial connection.

## What changed for your Arduino sketch

The Node.js server now matches the real serial output from the sketch:

- `Sistema de estacionamento iniciado!`
- `Vaga 1: Ocupada`
- `Vaga 2: Livre`
- `Vagas livres: 4`
- `Vagas ocupadas: 2`

Instead of expecting `DETECTED` and `CLEAR`, the app now parses the parking report and sends JSON to the browser with:

- overall detection state
- total, free, and occupied spot counts
- per-spot occupancy
- raw serial line
- timestamp

## Project files

- `server.js`: Express server, WebSocket server, serial parsing
- `public/index.html`: browser UI
- `public/app.js`: WebSocket client and screen updates
- `public/styles.css`: page styling
- `scripts/list-ports.js`: helper to list serial ports
- `parking-system-esp32.ino`: your ESP32 sketch

## Requirements

- Node.js installed on the Windows computer
- ESP32 connected by USB to that same Windows computer
- Arduino IDE already used to upload `parking-system-esp32.ino`

## Serial settings

- Default Windows port fallback: `COM7`
- Environment variable: `SERIAL_PORT`
- Baud rate: `115200`

If `SERIAL_PORT` is not set, the server will try `COM7` on Windows automatically.

## Install dependencies

Open a terminal in the project folder and run:

```bash
npm install
```

## Scripts

- `npm start`: starts the app on `http://localhost:3000`
- `npm run dev`: starts the app in watch mode
- `npm run ports`: lists available serial ports

## How your friend can test on Windows

### 1. Connect and upload the ESP32 sketch

- Connect the ESP32 by USB.
- Open `parking-system-esp32.ino` in the Arduino IDE.
- Confirm the board and port are correct.
- Upload the sketch.

### 2. Close Serial Monitor

This is important.

If Arduino Serial Monitor or Serial Plotter is open, Node.js usually cannot open `COM7` at the same time. Close both before starting `npm start`.

### 3. Open PowerShell in the project folder

Example:

```powershell
cd C:\path\to\proximity-dashboard-facens
```

### 4. Install dependencies

```powershell
npm install
```

### 5. Optional: confirm the ESP32 port

Since you already know it is `COM7`, this is optional, but useful if Windows changes it:

```powershell
npm run ports
```

If the ESP32 is listed on another port, use that one instead.

### 6. Start the server

Since the default fallback is already `COM7`, this usually works:

```powershell
npm start
```

If they want to force the port explicitly:

```powershell
$env:SERIAL_PORT="COM7"
npm start
```

### 7. Open the browser

Open:

```text
http://localhost:3000
```

### 8. Test the sensor

- Put an object in front of one IR sensor.
- The corresponding parking spot should change from `Free` to `Occupied`.
- The occupied/free totals should update.
- Removing the object should change the spot back to `Free`.

## What your friend should see in the terminal

On startup, the terminal should show lines similar to:

```text
Server running at http://localhost:3000
Configured serial port: COM7
Configured baud rate: 115200
Serial connection opened on COM7 at 115200 baud.
```

As the ESP32 sends updates, the server should log parsed payloads.

## If it does not work

### Browser opens but does not update

- Confirm the ESP32 is powered and connected.
- Confirm the Arduino sketch was uploaded successfully.
- Confirm the page was opened at `http://localhost:3000`.
- Refresh the page after starting the server.

### Error opening COM7

- Close Arduino Serial Monitor.
- Close any other serial terminal such as PuTTY, CoolTerm, or VS Code serial tools.
- Run `npm run ports` and confirm the device is still on `COM7`.
- If Windows moved it, start again with the correct port:

```powershell
$env:SERIAL_PORT="COM8"
npm start
```

### No serial device found

- Try another USB cable.
- Some USB cables provide power only and no data.
- Reconnect the ESP32 and run `npm run ports` again.

## Quick Windows test flow

```powershell
cd C:\path\to\proximity-dashboard-facens
npm install
$env:SERIAL_PORT="COM7"
npm start
```

Then open `http://localhost:3000`.
