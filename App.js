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
