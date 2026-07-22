let checkoutMap;
let checkoutMarker;
let geocodeDebounce;
let lastLocation = null;

const DEFAULT_CENTER = [47.3769, 8.5417]; // Zurich

function ensureMap() {
  if (checkoutMap) return checkoutMap;
  checkoutMap = L.map('address-map', { zoomControl: false }).setView(DEFAULT_CENTER, 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(checkoutMap);
  return checkoutMap;
}

async function geocodeAddress(address) {
  const statusEl = document.getElementById('address-map-status');

  if (!address || address.trim().length < 5) {
    lastLocation = null;
    if (statusEl) statusEl.textContent = '';
    return;
  }

  if (statusEl) statusEl.textContent = 'Locating address…';

  try {
    const res = await fetch(`/api/geocode?address=${encodeURIComponent(address)}`);
    if (!res.ok) throw new Error('not found');
    const data = await res.json();

    lastLocation = { lat: data.lat, lon: data.lon };
    const map = ensureMap();
    map.setView([data.lat, data.lon], 16);
    if (checkoutMarker) {
      checkoutMarker.setLatLng([data.lat, data.lon]);
    } else {
      checkoutMarker = L.marker([data.lat, data.lon]).addTo(map);
    }
    if (statusEl) statusEl.textContent = data.displayName;
  } catch (err) {
    lastLocation = null;
    if (statusEl) statusEl.textContent = "Couldn't find this address yet — keep typing or check the spelling.";
  }
}

function onAddressInput(event) {
  clearTimeout(geocodeDebounce);
  const value = event.target.value;
  geocodeDebounce = setTimeout(() => geocodeAddress(value), 700);
}

window.getCheckoutLocation = () => lastLocation;

window.resetCheckoutLocation = () => {
  lastLocation = null;
  const statusEl = document.getElementById('address-map-status');
  if (statusEl) statusEl.textContent = '';
  if (checkoutMarker && checkoutMap) {
    checkoutMap.removeLayer(checkoutMarker);
    checkoutMarker = null;
  }
  if (checkoutMap) checkoutMap.setView(DEFAULT_CENTER, 12);
};

document.addEventListener('DOMContentLoaded', () => {
  const addressInput = document.getElementById('delivery-address');
  if (addressInput) addressInput.addEventListener('input', onAddressInput);

  const cartButton = document.getElementById('cart-button');
  if (cartButton) {
    cartButton.addEventListener('click', () => {
      setTimeout(() => {
        ensureMap().invalidateSize();
      }, 50);
    });
  }
});
