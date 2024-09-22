import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const App = () => {
  const [data, setData] = useState([]);
  const [genderRatio, setGenderRatio] = useState({ male: 0, female: 0 });
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetch(`${apiUrl}/data?limit=100&offset=0`)
      .then(response => response.json())
      .then(data => {
        setData(data);
        const maleCount = data.filter(item => item.sex === '男').length;
        const femaleCount = data.filter(item => item.sex === '女').length;
        setGenderRatio({ male: maleCount, female: femaleCount });
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  const genderData = {
    labels: ['男', '女'],
    datasets: [
      {
        data: [genderRatio.male, genderRatio.female],
        backgroundColor: ['#36A2EB', '#FF6384'],
        hoverBackgroundColor: ['#36A2EB', '#FF6384'],
      },
    ],
  };

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

      <h1>Gender Ratio</h1>
      <Pie data={genderData} />
    </div>
  );
};

export default App;
