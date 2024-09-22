import React, { useEffect, useState } from 'react';

const App = () => {
  const [data, setData] = useState([]);
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetch(`${apiUrl}/data?limit=10&offset=0`)
      .then(response => response.json())
      .then(data => setData(data))
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  return (
    <div>
      <h1>Data from Backend</h1>
      <ul>
        {data.map(item => (
          <li key={item.eurf_id}>
            {item.area} - {item.sex} - {item.age}歳 - {item.value}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
