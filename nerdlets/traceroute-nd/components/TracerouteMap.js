import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Inject Leaflet CSS manually for Nerdpack
if (typeof window !== 'undefined' && !document.getElementById('leaflet-css')) {
  const link = document.createElement('link');
  link.id = 'leaflet-css';
  link.rel = 'stylesheet';
  link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
  document.head.appendChild(link);
}

export default function TracerouteMap({ hops }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  // 🎯 Create numbered circle marker icons
  const markerIcon = (hopNum) =>
    L.divIcon({
      html: `<div style="
        background-color: #007bff;
        color: white;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        font-weight: bold;
      ">${hopNum}</div>`,
      className: '',
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

  useEffect(() => {
    if (!mapRef.current || !hops?.length) return;

    // 🔁 Reset map if already initialized
    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
    }

    const validHops = hops.filter(h => h.lat && h.lon);

    if (!validHops.length) return;

    const map = L.map(mapRef.current).setView([validHops[0].lat, validHops[0].lon], 3);
    mapInstance.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const coords = [];

    validHops.forEach((hop, index) => {
      const marker = L.marker(
        [hop.lat, hop.lon],
        { icon: markerIcon(hop.hop) } // 🧠 Numbered circle
      ).addTo(map);

      marker.bindPopup(`
        <strong>Hop ${hop.hop}</strong><br/>
        ${hop.ip || 'Unknown IP'}<br/>
        ${hop.city || 'Unknown City'}, ${hop.country || 'Unknown Country'}<br/>
        Avg: ${hop.avg ?? '-'}ms<br/>
        Loss: ${hop.lossPercent ?? '-'}%<br/>
        ASN: ${hop.asn || 'Unknown'}
      `);

      coords.push([hop.lat, hop.lon]);
    });

    if (coords.length > 1) {
      const polyline = L.polyline(coords, { color: 'blue' }).addTo(map);
      map.fitBounds(polyline.getBounds());
    }
  }, [hops]);

  return (
    <div style={{ height: '400px', width: '100%', marginTop: '2rem' }}>
      <h3>Traceroute Map</h3>
      <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
    </div>
  );
}
