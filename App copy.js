<link
  rel="stylesheet"
  href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
/>



import React, { useState } from 'react';
import {
  Button,
  TextField,
  Table,
  TableHeader,
  TableHeaderCell, // ✅ Added this missing import
  TableRow,
  TableRowCell
} from 'nr1';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';


const thStyle = {
  textAlign: 'left',
  padding: '8px',
  borderBottom: '2px solid #ccc',
  backgroundColor: '#f0f0f0',
};

const tdStyle = {
  padding: '8px',
  borderBottom: '1px solid #eee',
};

const trEvenStyle = {
  backgroundColor: '#fafafa',
};

const trOddStyle = {
  backgroundColor: '#ffffff',
};


export default function App() {
  const [target, setTarget] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);

  async function runTraceroute() {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch('https://netviz.dantecortijo.com/mtr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'testkey'
        },
        body: JSON.stringify({ ip: target })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Unknown error');

      console.log("🚀 Traceroute results:", data); // ✅ Log raw response
      console.log("✅ hops valid array?", Array.isArray(data.hops), "length:", data.hops?.length);

      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Traceroute Visualizer</h1>
      <TextField
        label="Target IP or Hostname"
        value={target}
        onChange={(e) => setTarget(e.target.value)}
        placeholder="e.g. 1.1.1.1"
      />
      <br/>
      <br/>
      <Button
        onClick={runTraceroute}
        type={Button.TYPE.PRIMARY}
        loading={loading}
        disabled={!target}
      >
        Run Traceroute
      </Button>

      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {results && (
        <div style={{ marginTop: '1rem' }}>
          <h3>Traceroute to {results.target}</h3>
          <p><strong>Run ID:</strong> {results.runId}</p>
          <p><strong>Hop Count:</strong> {results.hops?.length || 0}</p> {/* ✅ Debug visible on UI */}

          <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse' }}>
            <thead>
                <tr>
                <th style={thStyle}>Hop</th>
                <th style={thStyle}>IP</th>
                <th style={thStyle}>ASN</th>
                <th style={thStyle}>Loss %</th>
                <th style={thStyle}>Avg</th>
                <th style={thStyle}>Best</th>
                <th style={thStyle}>Worst</th>
                <th style={thStyle}>City</th>
                <th style={thStyle}>Country</th>
                </tr>
            </thead>
            <tbody>
                {results.hops.map((item, index) => (
                <tr key={index} style={index % 2 === 0 ? trEvenStyle : trOddStyle}>
                    <td style={tdStyle}>{item.hop ?? '-'}</td>
                    <td style={tdStyle}>{item.ip ?? '-'}</td>
                    <td style={tdStyle}>{item.asn ?? '-'}</td>
                    <td style={tdStyle}>{item.lossPercent ?? '-'}%</td>
                    <td style={tdStyle}>{item.avg ?? '-'}</td>
                    <td style={tdStyle}>{item.best ?? '-'}</td>
                    <td style={tdStyle}>{item.worst ?? '-'}</td>
                    <td style={tdStyle}>{item.city ?? '-'}</td>
                    <td style={tdStyle}>{item.country ?? '-'}</td>
                </tr>
                ))}
            </tbody>
            </table>

            <div style={{ marginTop: '2rem' }}>
              <br/>
              <br/>
              
  <div style={{ marginTop: '2rem' }}>
  <h3>Hop Diagram</h3>
  <div style={{ display: 'flex', alignItems: 'center', overflowX: 'auto' }}>
    {results.hops.map((hop, index) => (
      <React.Fragment key={index}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minWidth: '120px',
          margin: '0 12px',
        }}>
          {/* Node Icon */}
          <div style={{
            backgroundColor: '#007aff',
            color: 'white',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontWeight: 'bold',
            fontSize: '16px',
            boxShadow: '0 0 4px rgba(0,0,0,0.2)',
          }}>
            {hop.hop}
          </div>

          {/* IP and metrics */}
          <div style={{
            marginTop: '8px',
            textAlign: 'center',
            fontSize: '12px',
            width: '100px',
            wordWrap: 'break-word'
          }}>
            <strong>{hop.ip}</strong><br />
            {hop.city && hop.country ? `${hop.city}, ${hop.country}` : ''}<br />
            <span style={{ color: '#666' }}>
              {hop.avg ?? '-'}ms avg<br />
              {hop.lossPercent ?? '-'}% loss
            </span>
          </div>
        </div>

        {/* Arrow connector */}
        {index < results.hops.length - 1 && (
          <svg width="40" height="20" style={{ flexShrink: 0 }}>
            <line
              x1="0" y1="10" x2="40" y2="10"
              stroke="#888" strokeWidth="2"
              markerEnd="url(#arrowhead)"
            />
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="10"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#888" />
              </marker>
            </defs>
          </svg>
        )}
      </React.Fragment>
    ))}
  </div>
</div>

{results && results.hops.some(h => h.lat && h.lon) && (
  <div style={{ marginTop: '2rem', height: '400px', width: '100%' }}>
    <h3>Traceroute Map</h3>
    <MapContainer
      center={[
        results.hops[0].lat,
        results.hops[0].lon
      ]}
      zoom={2}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {results.hops.filter(h => h.lat && h.lon).map((hop, idx) => (
        <Marker
          key={idx}
          position={[hop.lat, hop.lon]}
          icon={L.icon({
            iconUrl:
              'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
          })}
        >
          <Popup>
            <div>
              <strong>Hop {hop.hop}: {hop.ip}</strong><br />
              {hop.city}, {hop.country}<br />
              Avg: {hop.avg}ms<br />
              Loss: {hop.lossPercent}%
            </div>
          </Popup>
        </Marker>
      ))}

      <Polyline
        positions={results.hops.filter(h => h.lat && h.lon).map(h => [h.lat, h.lon])}
        color="blue"
      />
    </MapContainer>
  </div>
)}


</div>


        </div>
      )}
    </div>
  );
}

--
import React, { useEffect } from 'react';
import { Spinner } from 'nr1';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function TracerouteMap({ hops }) {
  useEffect(() => {
    if (!hops || hops.length === 0) return;

    const map = L.map('traceroute-map').setView([20, 0], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    const validHops = hops.filter(h => h.lat && h.lon);
    const coords = validHops.map(h => [h.lat, h.lon]);

    const firstHop = validHops[0];
    const lastHop = validHops[validHops.length - 1];

    const markerIcon = (hopNum, color) =>
      L.divIcon({
        html: `<div style="
          background-color: ${color};
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

    validHops.forEach((hop) => {
      let color = '#007bff'; // default blue
      if (hop === firstHop || hop === lastHop) color = '#ff5722'; // orange-red

      L.marker([hop.lat, hop.lon], {
        icon: markerIcon(hop.hop, color),
      })
        .addTo(map)
        .bindPopup(
          `<strong>Hop ${hop.hop}</strong><br/>` +
          `IP: ${hop.ip || '-'}<br/>` +
          `City: ${hop.city || '-'}, ${hop.country || '-'}<br/>` +
          `Avg: ${hop.avg ?? '-'} ms<br/>` +
          `Loss: ${hop.lossPercent ?? '-'}%`
        );
    });

    if (coords.length > 1) {
      L.polyline(coords, { color: 'blue', weight: 3 }).addTo(map);
      map.fitBounds(L.polyline(coords).getBounds());
    } else if (coords.length === 1) {
      map.setView(coords[0], 5);
    }

    return () => map.remove();
  }, [hops]);

  return (
    <div>
      <h4>Geolocation Map</h4>
      <div
        id="traceroute-map"
        style={{ height: '400px', width: '100%', border: '1px solid #ccc', borderRadius: '8px' }}
      />
      {!hops?.length && <Spinner />} {/* Spinner in case data takes a moment */}
    </div>
  );
}
