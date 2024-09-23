import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import './App.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const App = () => {
  const [data, setData] = useState([]);
  const [ageDistributionByYear, setAgeDistributionByYear] = useState([]);
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetch(`${apiUrl}/data?limit=10&offset=0`)
      .then(response => response.json())
      .then(data => setData(data))
      .catch(error => console.error('Error fetching data:', error));

    fetch(`${apiUrl}/age-distribution-by-year`)
      .then(response => response.json())
      .then(data => setAgeDistributionByYear(data))
      .catch(error => console.error('Error fetching age distribution by year:', error));
  }, []);

  // 年ごとの年齢分布データをグラフ用に変換
  const groupedData = ageDistributionByYear.reduce((acc, item) => {
    const year = item.year;
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(item);
    return acc;
  }, {});

  return (
    <div>
      <ul>
        {data.map(item => (
          <li key={item.eurf_id}>
            {item.area} - {item.sex} - {item.age}歳 - {item.value}
          </li>
        ))}
      </ul>
  
      {Object.keys(groupedData).map(year => {
        const ageData = {
          labels: groupedData[year].map(item => `${item.age_group}歳`),
          datasets: [
            {
              label: '人数',
              data: groupedData[year].map(item => item.count),
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
            },
          ],
        };
  
        return (
          <div key={year} style={{ width: '600px', height: '400px' }}>
            <Bar
              data={ageData}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'top' },
                  title: { display: true, text: `年齢分布 (${year})` },
                },
              }}
            />
          </div>
        );
      })}
    </div>
  );
  
};

export default App;
