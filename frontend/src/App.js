import React, { useEffect, useState } from 'react';

function App() {
  const [data, setData] = useState('');

  useEffect(() => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}/users`)
      .then(res => res.json())
      .then(json => setData(JSON.stringify(json)))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h2>Frontend Connected to Backend + DB</h2>
      <pre>{data}</pre>
    </div>
  );
}

export default App;
