import React, { useState } from 'react';
import {
  Button,
  TextField,
  Select,
  SelectItem
} from 'nr1';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Simple table styles
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
  const [schedule, setSchedule] = useState('none'); // schedule state
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
        body: JSON.stringify({ ip: target, schedule }) // use target -> ip
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Unknown error');

      console.log('🚀 Traceroute results:', data);
      console.log(
        '✅ hops valid array?',
        Array.isArray(data.hops),
        'length:',
        data.hops?.length
      );

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

      <br />

      {/* Schedule selector */}
      <Select
        label="Schedule"
        value={schedule}
        // event param is unused, so we ignore it to avoid greyed-out var
        onChange={(_, value) => setSchedule(value)}
        style={{ maxWidth: '240px' }}
      >
        <SelectItem value="none">On-demand only</SelectItem>
        <SelectItem value="1m">Every 1 minute</SelectItem>
        <SelectItem value="15m">Every 15 minutes</SelectItem>
        <SelectItem value="30m">Every 30 minutes</SelectItem>
        <SelectItem value="1h">Every 1 hour</SelectItem>
        <SelectItem value="6h">Every 6 hours</SelectItem>
        <SelectItem value="12h">Every 12 hours</SelectItem>
        <SelectItem value="24h">Every 24 hours</SelectItem>
      </Select>

      <br />

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
          {results.runId && (
            <p>
              <strong>Run ID:</strong> {results.runId}
            </p>
          )}
          <p>
            <strong>Hop Count:</strong> {results.hops?.length || 0}
          </p>

          {/* Hop table */}
          <table
            style={{
              width: '100%',
              marginTop: '1rem',
              borderCollapse: 'collapse'
            }}
          >
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
                <tr
                  key={index}
                  style={index % 2 === 0 ? trEvenStyle : trOddStyle}
                >
                  <td style={tdStyle}>{item.hop ?? '-'}</td>
                  <td style={tdStyle}>{item.ip ?? '-'}</td>
                  <td style={tdStyle}>{item.asn ?? '-'}</td>
                  <td style={tdStyle}>
                    {item.lossPercent ?? '-'}
                    %
                  </td>
                  <td style={tdStyle}>{item.avg ?? '-'}</td>
                  <td style={tdStyle}>{item.best ?? '-'}</td>
                  <td style={tdStyle}>{item.worst ?? '-'}</td>
                  <td style={tdStyle}>{item.city ?? '-'}</td>
                  <td style={tdStyle}>{item.country ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Hop diagram */}
          <div style={{ marginTop: '2rem' }}>
            <h3>Hop Diagram</h3>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                overflowX: 'auto'
              }}
            >
              {results.hops.map((hop, index) => (
                <React.Fragment key={index}>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      minWidth: '120px',
                      margin: '0 12px'
                    }}
                  >
                    {/* Node Icon */}
                    <div
                      style={{
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
                        boxShadow: '0 0 4px rgba(0,0,0,0.2)'
                      }}
                    >
                      {hop.hop}
                    </div>

                    {/* IP and metrics */}
                    <div
                      style={{
                        marginTop: '8px',
                        textAlign: 'center',
                        fontSize: '12px',
                        width: '100px',
                        wordWrap: 'break-word'
                      }}
                    >
                      <strong>{hop.ip}</strong>
                      <br />
                      {hop.city && hop.country
                        ? `${hop.city}, ${hop.country}`
                        : ''}
                      <br />
                      <span style={{ color: '#666' }}>
                        {hop.avg ?? '-'}ms avg
                        <br />
                        {hop.lossPercent ?? '-'}% loss
                      </span>
                    </div>
                  </div>

                  {/* Arrow connector */}
                  {index < results.hops.length - 1 && (
                    <svg
                      width="40"
                      height="20"
                      style={{ flexShrink: 0 }}
                    >
                      <defs>
                        <marker
                          id="arrowhead"
                          markerWidth="10"
                          markerHeight="7"
                          refX="10"
                          refY="3.5"
                          orient="auto"
                        >
                          <polygon
                            points="0 0, 10 3.5, 0 7"
                            fill="#888"
                          />
                        </marker>
                      </defs>
                      <line
                        x1="0"
                        y1="10"
                        x2="40"
                        y2="10"
                        stroke="#888"
                        strokeWidth="2"
                        markerEnd="url(#arrowhead)"
                      />
                    </svg>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Leaflet map */}
          {results.hops.some((h) => h.lat && h.lon) && (
            <div
              style={{
                marginTop: '2rem',
                height: '400px',
                width: '100%'
              }}
            >
              <h3>Traceroute Map</h3>
              <MapContainer
                center={[
                  results.hops[0].lat || 20,
                  results.hops[0].lon || 0
                ]}
                zoom={2}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                {results.hops
                  .filter((h) => h.lat && h.lon)
                  .map((hop, idx) => (
                    <Marker
                      key={idx}
                      position={[hop.lat, hop.lon]}
                      icon={L.icon({
                        iconUrl:
                          'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                        iconSize: [25, 41],
                        iconAnchor: [12, 41]
                      })}
                    >
                      <Popup>
                        <div>
                          <strong>
                            Hop {hop.hop}: {hop.ip}
                          </strong>
                          <br />
                          {hop.city}, {hop.country}
                          <br />
                          Avg: {hop.avg}ms
                          <br />
                          Loss: {hop.lossPercent}%
                        </div>
                      </Popup>
                    </Marker>
                  ))}

                <Polyline
                  positions={results.hops
                    .filter((h) => h.lat && h.lon)
                    .map((h) => [h.lat, h.lon])}
                  color="blue"
                />
              </MapContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
