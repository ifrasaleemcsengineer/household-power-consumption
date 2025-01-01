import React, { useState, useEffect } from 'react';
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const SeasonalDecompositionChart = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDataset, setSelectedDataset] = useState('trend'); 

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/seasonal-decomposition');
        if (!response.ok) {
          throw new Error('Failed to fetch chart data');
        }
        const data = await response.json();
        const formattedData = {
          labels: data.x,
          datasets: {
            trend: {
              label: 'Trend',
              data: data.trend,
              borderColor: 'rgba(255, 99, 132, 1)', // Red
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              tension: 0.4,
              borderWidth: 2,
              pointRadius: 0,
            },
            seasonal: {
              label: 'Seasonal',
              data: data.seasonal,
              borderColor: 'rgba(54, 162, 235, 1)', // Blue
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              tension: 0.4,
              borderWidth: 2,
              pointRadius: 0,
            },
            residual: {
              label: 'Residual',
              data: data.residual,
              borderColor: 'rgba(34, 139, 34, 1)', // Green
              backgroundColor: 'rgba(34, 139, 34, 0.2)',
              tension: 0.4,
              borderWidth: 2,
              pointRadius: 0,
            },
          },
        };
        setChartData(formattedData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching chart data:', error);
        setLoading(false);
      }
    };

    fetchChartData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 bg-white shadow-lg rounded-lg">
        <p className="text-lg font-semibold text-blue-600">Loading chart data...</p>
      </div>
    );
  }

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
          text: 'Value',
          color: '#333',
          font: {
            size: 14,
            weight: 'bold',
          },
        },
        beginAtZero: true,
        grid: {
          color: '#f0f0f0',
        },
      },
    },
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg">
      <h3 className="text-xl font-semibold text-blue-600 mb-4">Seasonal Decomposition Analysis</h3>

      <div className="flex justify-center space-x-6 mb-6">
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            name="dataset"
            value="trend"
            checked={selectedDataset === 'trend'}
            onChange={() => setSelectedDataset('trend')}
            className="accent-red-500 w-4 h-4"
          />
          <span className="text-red-500 font-medium">Trend</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            name="dataset"
            value="seasonal"
            checked={selectedDataset === 'seasonal'}
            onChange={() => setSelectedDataset('seasonal')}
            className="accent-blue-500 w-4 h-4"
          />
          <span className="text-blue-500 font-medium">Seasonal</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            name="dataset"
            value="residual"
            checked={selectedDataset === 'residual'}
            onChange={() => setSelectedDataset('residual')}
            className="accent-green-700 w-4 h-4"
          />
          <span className="text-green-700 font-medium">Residual</span>
        </label>
      </div>

      <Line
        data={{
          labels: chartData.labels,
          datasets: [chartData.datasets[selectedDataset]],
        }}
        options={options}
      />
    </div>
  );
};

export default SeasonalDecompositionChart;
