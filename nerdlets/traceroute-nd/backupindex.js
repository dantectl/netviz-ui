import React, { useState } from 'react';
import { BlockText, Button, TextField } from 'nr1';

export default function TracerouteNerdlet() {
  const [ip, setIp] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const runTraceroute = async () => {
    setError(null);
    try {
      const response = await fetch('https://netviz.dantecortijo.com:3001/mtr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'testkey',
        },
        body: JSON.stringify({ ip }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Unknown error');
        return;
      }

      setResults(data);
    } catch (err) {
      setError('Could not connect to the backend.');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <TextField label="Target IP or Hostname" onChange={(e) => setIp(e.target.value)} value={ip} />
      <Button onClick={runTraceroute} type={Button.TYPE.PRIMARY}>
        Run Traceroute
      </Button>

      {error && <BlockText type={BlockText.TYPE.CRITICAL}>{error}</BlockText>}

      {results && (
        <div style={{ marginTop: '2rem' }}>
          <h3>Traceroute Results for {results.target}</h3>
          <pre>{JSON.stringify(results.hops, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}