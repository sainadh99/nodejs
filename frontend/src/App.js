import React, { useState, useEffect } from 'react';

function App() {
  const [data, setData] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [description, setDescription] = useState('');

  const backendBase = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
  const usersUrl = `${backendBase}/users`;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch(usersUrl);
      const users = await res.json();
      setData(users);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleAdd = async () => {
    const newUser = { name, email, role, company, description };
    try {
      const response = await fetch(usersUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        await fetchUsers();
        setName('');
        setEmail('');
        setRole('');
        setCompany('');
        setDescription('');
      } else {
        console.error('Failed to add user.');
      }
    } catch (err) {
      console.error('Error during POST:', err);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Add User + Experience</h2>
      <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input placeholder="Role" value={role} onChange={e => setRole(e.target.value)} />
      <input placeholder="Company" value={company} onChange={e => setCompany(e.target.value)} />
      <input placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
      <button onClick={handleAdd}>Add</button>

      <h2>User + Experience Table</h2>
      <table border="1" cellPadding="10" cellSpacing="0">
        <thead>
          <tr>
            <th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Company</th><th>Description</th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? data.map(row => (
            <tr key={row.id}>
              <td>{row.id}</td>
              <td>{row.name}</td>
              <td>{row.email}</td>
              <td>{row.role}</td>
              <td>{row.company}</td>
              <td>{row.description}</td>
            </tr>
          )) : (
            <tr><td colSpan="6" style={{ textAlign: 'center' }}>No data yet</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default App;

