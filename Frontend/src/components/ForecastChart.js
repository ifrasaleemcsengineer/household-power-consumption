import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const ForecastChart = ({ modelData, datasets }) => {
  const [selectedDataset, setSelectedDataset] = useState(Object.keys(datasets)[0]); 

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false, 
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: '#fff',
        titleColor: '#333',
        bodyColor: '#333',
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date',
          color: '#333',
          font: {
            size: 14,
            weight: 'bold',
          },
        },
        ticks: {
          maxTicksLimit: 10,
        },
        grid: {
          display: false,
        },
      },
      y: {
        title: {
          display: true,
          text: 'Power Consumption (kW)',
          color: '#333',
          font: {
            size: 14,
            weight: 'bold',
          },
        },
        grid: {
          color: '#f0f0f0',
        },
      },
    },
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg">
      <h3 className="text-xl font-semibold text-blue-600 mb-4">Forecast Analysis</h3>

      <div className="flex justify-center space-x-6 mb-6">
        {Object.keys(datasets).map((key) => (
          <label key={key} className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="dataset"
              value={key}
              checked={selectedDataset === key}
              onChange={() => setSelectedDataset(key)}
              className={`w-4 h-4 accent-${datasets[key].borderColor.replace('rgba(', '').split(',')[0]}-500`}
            />
            <span
              className="font-medium capitalize"
              style={{ color: datasets[key].borderColor }}
            >
              {datasets[key].label}
            </span>
          </label>
        ))}
      </div>

      <div style={{ height: '500px' }}>
        <Line
          data={{
            labels: modelData.labels,
            datasets: [
              {
                ...datasets[selectedDataset],
                tension: 0.4, 
                borderWidth: 2, 
                fill: false, 
                pointRadius: 0,
              },
            ],
          }}
          options={options}
        />
      </div>
    </div>
  );
};

export default ForecastChart;
