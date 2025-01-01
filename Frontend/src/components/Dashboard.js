import React, { useState, useEffect } from 'react';
import LineChart from './LineChart';
import SeasonalDecompositionChart from './SeasonalDecompositionChart';
import DataInfo from './Metrics';
import ForecastChart from './ForecastChart';

const Dashboard = () => {
  const [dataLimit, setDataLimit] = useState(5);
  const [showChart, setShowChart] = useState('line');
  const [model, setModel] = useState('arima');
  const [arimaData, setArimaData] = useState(null);
  const [sarimaData, setSarimaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tableData, setTableData] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);

  useEffect(() => {
    const fetchForecastData = async () => {
      try {
        const arimaResponse = await fetch('http://127.0.0.1:8000/arima-forecast');
        const sarimaResponse = await fetch('http://127.0.0.1:8000/sarima-forecast');

        if (!arimaResponse.ok || !sarimaResponse.ok) {
          throw new Error('Failed to fetch forecast data');
        }

        const arimaData = await arimaResponse.json();
        const sarimaData = await sarimaResponse.json();

        setArimaData(arimaData);
        setSarimaData(sarimaData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching forecast data:', error);
        setLoading(false);
      }
    };

    fetchForecastData();
  }, []);

  useEffect(() => {
    const fetchTableData = async () => {
      setTableLoading(true);
      try {
        const response = await fetch(`http://127.0.0.1:8000/fetch-dataset?row_limit=${dataLimit}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch table data. Status: ${response.status}`);
        }

        const result = await response.json();
        setTableData(result.preview_data);
      } catch (error) {
        console.error('Error fetching table data:', error);
      } finally {
        setTableLoading(false);
      }
    };

    fetchTableData();
  }, [dataLimit]);


  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <p className="text-lg font-semibold text-blue-600">Loading forecast data...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <DataInfo />
      <h2 className="text-2xl font-semibold text-blue-600 mb-6 mt-9">Power Consumption Data</h2>

      <div className="flex items-center space-x-4 mb-6">
        <label htmlFor="data-limit" className="text-lg">Select Number of Rows:</label>
        <select
          id="data-limit"
          value={dataLimit}
          onChange={(e) => setDataLimit(Number(e.target.value))}
          className="px-4 py-2 border rounded-md"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={15}>15</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
          <option value={200}>200</option>

        </select>
      </div>

      <div
        className="overflow-x-auto bg-white rounded-lg shadow-md mb-8"
        style={{ maxHeight: '400px', overflowY: 'auto' }}
      >
        <table className="min-w-full border-collapse">
          <thead className="bg-blue-600 text-white">
            <tr>
              {[
                "Date",
                "Time",
                "Global Active Power (kW)",
                "Global Reactive Power (kW)",
                "Voltage (V)",
                "Global Intensity",
                "Sub Metering 1",
                "Sub Metering 2",
                "Sub Metering 3",
              ].map((header) => (
                <th
                  key={header}
                  className="border px-4 py-2"
                  style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                    background: '#2563eb',
                  }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, index) => (
              <tr key={index} className="hover:bg-gray-100">
                <td className="border px-4 py-2">{row.Date}</td>
                <td className="border px-4 py-2">{row.Time}</td>
                <td className="border px-4 py-2">{row.Global_active_power}</td>
                <td className="border px-4 py-2">{row.Global_reactive_power}</td>
                <td className="border px-4 py-2">{row.Voltage}</td>
                <td className="border px-4 py-2">{row.Global_intensity}</td>
                <td className="border px-4 py-2">{row.Sub_metering_1}</td>
                <td className="border px-4 py-2">{row.Sub_metering_2}</td>
                <td className="border px-4 py-2">{row.Sub_metering_3}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-blue-600 mb-6 mt-9">Select Chart Type</h2>

        <div className="flex space-x-4 mb-6">

          <button
            onClick={() => setShowChart('line')}
            className={`px-4 py-2 ${showChart === 'line' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-blue-600'} rounded-md`}
          >
            Line Chart
          </button>
          <button
            onClick={() => setShowChart('seasonal')}
            className={`px-4 py-2 ${showChart === 'seasonal' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-blue-600'} rounded-md`}
          >
            Seasonal Decomposition Chart
          </button>
        </div>
        <div style={{ width: '', height: '1000px' }}>
          {showChart === 'line' ? <LineChart /> : <SeasonalDecompositionChart />}
        </div>
      </div>


      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-blue-600 mb-6 mt-9">Select Forecasting Model</h2>

        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setModel('arima')}
            className={`px-4 py-2 ${model === 'arima' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-blue-600'} rounded-md`}
          >
            ARIMA Forecast
          </button>
          <button
            onClick={() => setModel('sarima')}
            className={`px-4 py-2 ${model === 'sarima' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-blue-600'} rounded-md`}
          >
            SARIMA Forecast
          </button>
        </div>

        <div style={{ width: '', height: '600px' }}>
          {model === 'arima' && arimaData && (
            <ForecastChart
              modelData={{
                labels: arimaData.train?.x.concat(arimaData.test?.x, arimaData.forecast?.x) || [],
              }}
              datasets={{
                train: arimaData.train
                  ? {
                    label: 'Train Data',
                    data: arimaData.train.y || [],
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    color: 'teal',
                  }
                  : null,
                test: arimaData.test
                  ? {
                    label: 'Test Data',
                    data: arimaData.test.y || [],
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    color: 'blue',
                  }
                  : null,
                forecast: arimaData.forecast
                  ? {
                    label: 'Forecast Data',
                    data: arimaData.forecast.y || [],
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    color: 'red',
                  }
                  : null,
              }}
            />
          )}
          {model === 'sarima' && sarimaData && (
            <ForecastChart
              modelData={{
                labels: sarimaData.historical?.x.concat(sarimaData.forecast?.x) || [],
              }}
              datasets={{
                historical: sarimaData.historical
                  ? {
                    label: 'Historical Data',
                    data: sarimaData.historical.y || [],
                    borderColor: 'rgba(153, 102, 255, 1)',
                    backgroundColor: 'rgba(153, 102, 255, 0.2)',
                    color: 'purple',
                  }
                  : null,
                forecast: sarimaData.forecast
                  ? {
                    label: 'Forecast Data',
                    data: sarimaData.forecast.y || [],
                    borderColor: 'rgba(255, 159, 64, 1)',
                    backgroundColor: 'rgba(255, 159, 64, 0.2)',
                    color: 'orange',
                  }
                  : null,
              }}
            />
          )}
          {!arimaData && !sarimaData && (
            <p className="text-red-600 text-center">No data available for the selected model.</p>
          )}
        </div>
      </div>


    </div>
  );
};

export default Dashboard;
