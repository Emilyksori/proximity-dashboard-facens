const connectionDot = document.getElementById('connectionDot');
const mapMount = document.getElementById('mapMount');
const freeSpotsValue = document.getElementById('freeSpotsValue');
const occupiedSpotsValue = document.getElementById('occupiedSpotsValue');

let mapRoot = null;
let latestPayload = null;

function setConnectionState(state) {
  connectionDot.classList.remove('is-connected', 'is-disconnected');

  if (state) {
    connectionDot.classList.add(state);
  }
}

async function loadMap() {
  const response = await fetch('/img/parking-photo-map.svg');
  const svgMarkup = await response.text();

  mapMount.innerHTML = svgMarkup;
  mapRoot = mapMount.querySelector('svg');

  if (!mapRoot) {
    throw new Error('SVG map could not be loaded.');
  }

  mapRoot.classList.add('parking-map');

  if (latestPayload) {
    renderPayload(latestPayload);
  }
}

function applySpotState(index, occupied) {
  if (!mapRoot) {
    return;
  }

  const statusLight = mapRoot.getElementById(`spot-${index}-status`);

  if (statusLight) {
    statusLight.setAttribute('fill', occupied ? '#22c55e' : '#ef4444');
    statusLight.style.filter = occupied
      ? 'drop-shadow(0 0 22px rgba(34, 197, 94, 0.78))'
      : 'drop-shadow(0 0 22px rgba(239, 68, 68, 0.78))';
  }
}

function renderPayload(payload) {
  latestPayload = payload;

  freeSpotsValue.textContent = String(payload?.freeSpots ?? 0);
  occupiedSpotsValue.textContent = String(payload?.occupiedSpots ?? 0);

  if (!mapRoot || !payload?.spots) {
    return;
  }

  for (const spot of payload.spots) {
    applySpotState(spot.index, Boolean(spot.occupied));
  }
}

const socketProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
const socket = new WebSocket(`${socketProtocol}://${window.location.host}`);

setConnectionState(null);

socket.addEventListener('open', () => {
  setConnectionState('is-connected');
});

socket.addEventListener('message', (event) => {
  try {
    const payload = JSON.parse(event.data);
    renderPayload(payload);
  } catch (error) {
    console.error('Invalid WebSocket payload:', error);
  }
});

socket.addEventListener('close', () => {
  setConnectionState('is-disconnected');
});

socket.addEventListener('error', () => {
  setConnectionState('is-disconnected');
});

loadMap().catch((error) => {
  console.error(error);
  setConnectionState('is-disconnected');
});
