import React, { useEffect, useState, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import './App.css';

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);

const App = () => {
  const [ageDistributionByYear, setAgeDistributionByYear] = useState([]);
  const apiUrl = import.meta.env.VITE_API_URL;
  const chartRefs = useRef([]);

  useEffect(() => {
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

  // 年ごとの増加/減少率を計算
  const calculateGrowthRates = (data) => {
    const growthRates = {};
    const years = Object.keys(data).sort();
    for (let i = 1; i < years.length; i++) {
      const previousYear = years[i - 1];
      const currentYear = years[i];
      growthRates[currentYear] = data[currentYear].map((item, index) => {
        const previousCount = data[previousYear][index].count;
        const currentCount = item.count;
        const growthRate = (currentCount - previousCount) / previousCount;
        return { ...item, growthRate };
      });
    }
    return growthRates;
  };

  const growthRates = calculateGrowthRates(groupedData);

  // 平均増加/減少率を計算
  const calculateAverageGrowthRates = (growthRates) => {
    const averageGrowthRates = {};
    const years = Object.keys(growthRates);
    years.forEach(year => {
      growthRates[year].forEach((item, index) => {
        if (!averageGrowthRates[item.age_group]) {
          averageGrowthRates[item.age_group] = [];
        }
        averageGrowthRates[item.age_group].push(item.growthRate);
      });
    });
    for (const ageGroup in averageGrowthRates) {
      const rates = averageGrowthRates[ageGroup];
      averageGrowthRates[ageGroup] = rates.reduce((acc, rate) => acc + rate, 0) / rates.length;
    }
    return averageGrowthRates;
  };

  const averageGrowthRates = calculateAverageGrowthRates(growthRates);

  // 未来の人口を予測
  const predictFuturePopulation = (data, averageGrowthRates, yearsToPredict) => {
    const futureData = [];
    const lastYear = Math.max(...Object.keys(data).map(year => parseInt(year)).filter(year => !isNaN(year)));
    console.log('Last Year:', lastYear);
    for (let i = 1; i <= yearsToPredict; i++) {
      const futureYear = lastYear + i;
      
      // データの存在確認
      if (!data[lastYear]) {
        console.error(`Data for year ${lastYear} is undefined`);
        continue; // データが存在しない場合は次のループに進む
      }

      const futureYearData = data[lastYear].map(item => {
        const growthRate = averageGrowthRates[item.age_group];
        
        // 平均増加率の存在確認
        if (growthRate === undefined) {
          console.error(`Growth rate for age group ${item.age_group} is undefined`);
          return { ...item, year: futureYear, count: item.count }; // 増加率がない場合はそのままの値を使用
        }
        
        return {
          ...item,
          year: futureYear,
          count: item.count * (1 + growthRate)
        };
      });

      futureData.push(...futureYearData);
    }
    return futureData;
  };

  const futureData = predictFuturePopulation(groupedData, averageGrowthRates, 1);

  return (
    <div>
      {Object.keys(groupedData).map((year, index) => {
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
            <Line
              ref={(el) => (chartRefs.current[index] = el)}
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

      <h2>未来の人口構成予測</h2>
      <div style={{ width: '600px', height: '400px' }}>
        <Line
          ref={(el) => (chartRefs.current[Object.keys(groupedData).length] = el)}
          data={{
            labels: futureData.map(item => `${item.age_group}歳`),
            datasets: [
              {
                label: '人数',
                data: futureData.map(item => item.count),
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1,
              },
            ],
          }}
          options={{
            responsive: true,
            plugins: {
              legend: { position: 'top' },
              title: { display: true, text: '未来の年齢分布' },
            },
          }}
        />
      </div>
    </div>
  );
};

export default App;
