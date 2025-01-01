import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const LineChart = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/plot-energy');
        if (!response.ok) {
          throw new Error('Failed to fetch chart data');
        }
        const data = await response.json();
        const formattedData = {
          labels: data.x,
          datasets: [
            {
              label: 'Power Consumption (kWh)',
              data: data.y,
              borderColor: 'rgba(54, 162, 235, 1)',
              backgroundColor: 'rgba(54, 162, 235, 0.2)', 
              tension: 0.4, 
              pointBackgroundColor: 'rgba(75, 192, 192, 1)', 
              pointBorderColor: '#fff',
              pointHoverBackgroundColor: '#fff', 
              pointHoverBorderColor: 'rgba(75, 192, 192, 1)', 
            },
          ],
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
        display: true,
        position: 'top',
      },
      tooltip: {
        backgroundColor: '#ffffff',
        titleColor: '#333',
        bodyColor: '#333',
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        titleFont: { size: 14, weight: 'bold' },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date',
          color: '#333',
          font: { size: 14, weight: 'bold' },
        },
        grid: {
          display: false, 
        },
      },
      y: {
        title: {
          display: true,
          text: 'Power Consumption (kWh)',
          color: '#333',
          font: { size: 14, weight: 'bold' },
        },
        beginAtZero: true,
        grid: {
          borderColor: '#ddd',
          borderWidth: 1,
          color: '#f0f0f0',
        },
      },
    },
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg">
      <h3 className="text-xl font-semibold text-blue-600 mb-4">Power Consumption Trend (kWh)</h3>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default LineChart;
