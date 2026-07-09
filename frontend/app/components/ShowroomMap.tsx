'use client';

import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix the broken default marker icon paths under bundlers (Leaflet resolves
// these relative to the CSS by default, which next/webpack can't serve).
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Kępska 12, 46-020 Opole — hardcoded, not from Sanity.
const SHOWROOM_COORDS: [number, number] = [50.6751, 17.9213];
const SHOWROOM_NAME = 'CCOMPLEX ZADASZENIA I TARASY';
const SHOWROOM_ADDRESS = 'Kępska 12, 46-020 Opole';
const DIRECTIONS_URL =
  'https://www.google.com/maps/dir/?api=1&destination=K%C4%99pska+12%2C+46-020+Opole';

// Simple green filled circle marker styled with the brand accent.
const greenIcon = L.divIcon({
  className: '',
  html: '<span style="display:block;width:28px;height:28px;border-radius:9999px;background:#1fa637;border:3px solid #ffffff;box-shadow:0 0 0 5px rgba(31,166,55,0.45),0 2px 6px rgba(0,0,0,0.5);"></span>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -14],
});

export default function ShowroomMap() {
  return (
    <MapContainer
      center={SHOWROOM_COORDS}
      zoom={15}
      scrollWheelZoom={false}
      className="h-80 w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={SHOWROOM_COORDS} icon={greenIcon}>
        <Popup>
          <span className="block font-heading text-sm font-bold text-black">{SHOWROOM_NAME}</span>
          <span className="mt-1 block font-body text-sm text-black">{SHOWROOM_ADDRESS}</span>
          <a
            href={DIRECTIONS_URL}
            target="_blank"
            rel="noopener noreferrer"
            // Inline color overrides Leaflet's `.leaflet-container a` rule, which
            // otherwise beats Tailwind's `text-white` on specificity.
            style={{ color: '#ffffff' }}
            className="mt-2 block cursor-pointer rounded-md bg-accent px-4 py-2 text-center text-sm font-semibold"
          >
            Nawiguj
          </a>
        </Popup>
      </Marker>
    </MapContainer>
  );
}
