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
import TracerouteMap from './components/TracerouteMap';


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
      <h1 style={{ textAlign: 'center'}}>Traceroute Visualizer</h1>
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


{results && <TracerouteMap hops={results.hops} />}


</div>


        </div>
      )}
    </div>
  );
}
