const path = require('path');
const http = require('http');
const express = require('express');
const { WebSocketServer, WebSocket } = require('ws');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

const SERVER_PORT = 3000;
const BAUD_RATE = 115200;
const SERIAL_PORT =
  process.env.SERIAL_PORT || (process.platform === 'win32' ? 'COM7' : '/dev/ttyUSB0');
const TOTAL_SPOTS = 6;

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.static(path.join(__dirname, 'src/public')));
app.use('/img', express.static(path.join(__dirname, 'src/img')));

let latestSensorState = createInitialPayload('WAITING_FOR_DATA');

function createInitialPayload(raw) {
  return {
    detected: false,
    raw,
    timestamp: new Date().toISOString(),
    started: false,
    totalSpots: TOTAL_SPOTS,
    freeSpots: TOTAL_SPOTS,
    occupiedSpots: 0,
    spots: Array.from({ length: TOTAL_SPOTS }, (_, index) => ({
      index: index + 1,
      occupied: false,
      label: 'Unknown',
    })),
  };
}

function createPayloadFromSnapshot(snapshot, raw) {
  const occupiedSpots = snapshot.spots.filter((spot) => spot.occupied).length;
  const freeSpots = snapshot.spots.length - occupiedSpots;

  return {
    detected: occupiedSpots > 0,
    raw,
    timestamp: new Date().toISOString(),
    started: snapshot.started,
    totalSpots: snapshot.spots.length,
    freeSpots,
    occupiedSpots,
    spots: snapshot.spots.map((spot) => ({
      index: spot.index,
      occupied: spot.occupied,
      label: spot.occupied ? 'Occupied' : 'Free',
    })),
  };
}

function broadcast(payload) {
  const serialized = JSON.stringify(payload);

  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(serialized);
    }
  }
}

function createSnapshot() {
  return {
    started: false,
    rawLines: [],
    spots: Array.from({ length: TOTAL_SPOTS }, (_, index) => ({
      index: index + 1,
      occupied: false,
    })),
  };
}

function parseLine(line, snapshot) {
  const raw = String(line).trim();

  if (!raw) {
    return null;
  }

  if (raw === 'Sistema de estacionamento iniciado!') {
    snapshot.started = true;
    return createPayloadFromSnapshot(snapshot, raw);
  }

  if (raw === '====== STATUS DAS VAGAS ======') {
    snapshot.rawLines = [raw];
    return null;
  }

  snapshot.rawLines.push(raw);

  const spotMatch = raw.match(/^Vaga\s+(\d+):\s+(Ocupada|Livre)$/i);

  if (spotMatch) {
    const index = Number(spotMatch[1]) - 1;
    const status = spotMatch[2].toLowerCase();

    if (index >= 0 && index < snapshot.spots.length) {
      snapshot.spots[index].occupied = status === 'ocupada';
      return createPayloadFromSnapshot(snapshot, raw);
    }
  }

  if (raw === '==============================') {
    const payload = createPayloadFromSnapshot(snapshot, 'STATUS_CYCLE_COMPLETE');
    snapshot.rawLines = [];
    return payload;
  }

  return null;
}

function setupSerialConnection() {
  const snapshot = createSnapshot();
  const serialPort = new SerialPort({
    path: SERIAL_PORT,
    baudRate: BAUD_RATE,
    autoOpen: false,
  });

  const parser = serialPort.pipe(new ReadlineParser({ delimiter: '\n' }));

  serialPort.on('open', () => {
    console.log(`Serial connection opened on ${SERIAL_PORT} at ${BAUD_RATE} baud.`);
  });

  serialPort.on('error', (error) => {
    console.error(`Serial port error (${SERIAL_PORT}):`, error.message);
  });

  parser.on('data', (line) => {
    const payload = parseLine(line, snapshot);

    if (!payload) {
      return;
    }

    latestSensorState = payload;
    console.log('Sensor update:', payload);
    broadcast(payload);
  });

  serialPort.open((error) => {
    if (error) {
      console.error(`Unable to open serial port ${SERIAL_PORT}:`, error.message);
    }
  });
}

wss.on('connection', (socket) => {
  socket.send(JSON.stringify(latestSensorState));
});

server.listen(SERVER_PORT, () => {
  console.log(`Server running at http://localhost:${SERVER_PORT}`);
  console.log(`Configured serial port: ${SERIAL_PORT}`);
  console.log(`Configured baud rate: ${BAUD_RATE}`);
  setupSerialConnection();
});
