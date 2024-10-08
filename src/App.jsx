import React, { useEffect, useState, useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import Select from 'react-select';
import './App.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const App = () => {
  const [ageDistributionByYear, setAgeDistributionByYear] = useState([]);
  const [ageDistributionByYear2, setAgeDistributionByYear2] = useState([]);
  const [selectedGender, setSelectedGender] = useState('男'); 
  const [selectedRegion, setSelectedRegion] = useState('東灘区'); 
  const [selectedYear, setSelectedYear] = useState('2013'); 
  const [selectedYear2, setSelectedYear2] = useState('2013'); 
  const apiUrl = 'http://localhost:3001';;
  const chartRefs = useRef([]);

  const genderOptions = [
    { value: '男', label: '男' },
    { value: '女', label: '女' },
    { value: '', label: '計' },
  ];
  const RegionOptions = [
    { value: '東灘区', label: '東灘区' },
    { value: '灘区', label: '灘区' },
    { value: '中央区', label: '中央区' },
    { value: '兵庫区', label: '兵庫区' },
    { value: '北区', label: '北区' },
    { value: '長田区', label: '長田区' },
    { value: '須磨区', label: '須磨区' },
    { value: '垂水区', label: '垂水区' },
    { value: '西区', label: '西区' },
    { value: '', label: '計' },
  ];

  const YearOptions = [
    { value: '2013', label: '2013' },
    { value: '2014', label: '2014' },
    { value: '2015', label: '2015' },
    { value: '2016', label: '2016' },
    { value: '2017', label: '2017' },
    { value: '2018', label: '2018' },
    { value: '2019', label: '2019' },
    { value: '2020', label: '2020' },
    { value: '2021', label: '2021' },
    { value: '2022', label: '2022' },
    { value: '2023', label: '2023' },
    { value: '2024', label: '2024' },
    { value: '2030', label: '2030' },
  ];

  const fetchData = async (query, gender, region) => {
    try {
      const response = await fetch(`${apiUrl}/age-distribution-by-year?query=${query}&gender=${gender}&region=${region}`);
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setAgeDistributionByYear(data);
      } else {
        console.error('Data is not an array:', data);
      }
    } catch (error) {
      console.error('Error fetching age distribution by year:', error);
    }
  };

  const fetchData2 = async (query, gender, region) => {
    try {
      const response2 = await fetch(`${apiUrl}/age-distribution-by-year?query=${query}&gender=${gender}&region=${region}`);
      const data2 = await response2.json();
      if (Array.isArray(data2)) {
        setAgeDistributionByYear2(data2);
      } else {
        console.error('Data is not an array:', data2);
      }
    } catch (error) {
      console.error('Error fetching age distribution by year:', error);
    }
  };

  useEffect(() => {
    fetchData(selectedYear, selectedGender, selectedRegion);
    fetchData2(selectedYear2, selectedGender, selectedRegion);
  }, [selectedGender, selectedRegion, selectedYear, selectedYear2]);

  const handleButtonClick = () => {
    fetchData(selectedYear, selectedGender,selectedRegion);
    fetchData2(selectedYear2, selectedGender,selectedRegion);
  };

  const handleGenderChange = (selectedOption) => {
    setSelectedGender(selectedOption.value);
  };

  const handleRegionChange = (selectedOption) => {
    setSelectedRegion(selectedOption.value);
  };

  const handleYearChange = (selectedOption) => {
    setSelectedYear(selectedOption.value);
  };

  const handleYearChange2 = (selectedOption) => {
    setSelectedYear2(selectedOption.value);
  };

  
  const groupedData = ageDistributionByYear.reduce((acc, item) => {
    const year = item.year;
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(item);
    return acc;
  }, {});

  const groupedData2 = ageDistributionByYear2.reduce((acc, item) => {
    const year = item.year;
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(item);
    return acc;
  }, {});

  const combinedData = (groupedData, groupedData2) => {
    const combineData = {};
    let year1 = Object.keys(groupedData)[0]; 
    let year2 = Object.keys(groupedData2)[0]; 
    if (groupedData[year1] && groupedData2[year2]) {
      combineData[year1] = [];
      for (let i = 0; i < groupedData[year1].length; i++) {
        combineData[year1].push({ ...groupedData[year1][i] });
      }
      combineData[year2] = [];
      for (let i = 0; i < groupedData2[year2].length; i++) {
        combineData[year2].push({ ...groupedData2[year2][i] });
      }
    }
    console.log(combineData);
    return combineData;    
  };


  const diff = (groupedData, groupedData2) => {
    const year1 = Object.keys(groupedData)[0]; 
    const year2 = Object.keys(groupedData2)[0]; 
    const diffData = {};
    const range = `${year1} vs ${year2}`;

    if (!diffData[range]) {
      diffData[range] = [];
    }


    try {
      if (!groupedData[year1]) {
        throw new Error(`Data for year ${year1} is missing in groupedData.`);
      }
      if (!groupedData2[year2]) {
        throw new Error(`Data for year ${year2} is missing in groupedData2.`);
      }
      for (let i = 0; i < groupedData[year1].length; i++) {
        let diffCount = parseInt(groupedData2[year2][i].count) - parseInt(groupedData[year1][i].count);
        diffData[range].push({
            age_group: groupedData[year1][i].age_group,
            count: diffCount,
            year: year2
        });
    }
    
     } 
     catch (error) {
        console.error('Error calculating difference by year:', error);
    }
    return diffData;
  };
 
  // 年数間のdiffを取る
  const diffData = diff(groupedData, groupedData2);
  // データの結合
  const combined = combinedData(groupedData, groupedData2);
  
  const ageGroups = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  
  const ageData = {
    labels: ageGroups.map(age => `${age}代`),
    datasets: Object.keys(combined).map((year, index) => ({
    label: `年齢分布 (${year})`,
    data: ageGroups.map(ageGroup => {
      const item = combined[year].find(item => item.age_group === ageGroup);
      return item ? parseInt(item.count) : 0;
    }),
    backgroundColor : index === 0 ? `rgba(0, 0, 255, 1)` : `rgba(0, 255, 0, 1)`,
    borderColor: `rgba(0, 0, 0, 1)`,
    borderWidth: 1,
    })),
  };

  return (
    <div>
      <Select
        options={genderOptions}
        defaultValue={genderOptions[0]}
        onChange={handleGenderChange}
      />
      <Select
        options={RegionOptions}
        defaultValue={RegionOptions[0]}
        onChange={handleRegionChange}
      />
      <Select
        options={YearOptions}
        defaultValue={YearOptions[0]}
        onChange={handleYearChange}
      />
      <Select
        options={YearOptions}
        defaultValue={YearOptions[0]}
        onChange={handleYearChange2}
      />
      <button onClick={handleButtonClick}>結果表示</button>
    
      <div style={{ width: '600px', height: '400px' }}>
        <Bar
          ref={(el) => (chartRefs.current[0] = el)}
          data={ageData}
          options={{
            responsive: true,
            plugins: {
              legend: { position: 'top' },
              title: { display: true, text: '年齢分布' },
            },
          }}
        />
      </div>
    
      {Object.keys(diffData).map((year, index) => {
        console.log('test ', year);
        const ageData3 = {
          labels: diffData[year].map(item => `${item.age_group}代`),
          datasets: [
            {
              label: '人数',
              data: diffData[year].map(item => item.count),
              backgroundColor : `rgba(255, 0, 0, 1)`,
              borderColor: 'rgba(0, 0, 0, 1)',
              borderWidth: 1,
            },
          ],
        };

        return (
          <div key={year} style={{ width: '600px', height: '400px' }}>
            <Bar
              ref={(el) => (chartRefs.current[index] = el)}
              data={ageData3}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'top' },
                  title: { display: true, text: `年齢別人口変化分布 (${year})` },
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
