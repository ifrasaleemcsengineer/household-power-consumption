import React, { useState, useEffect } from 'react';

const Metrics = ({ metrics }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
    {metrics ? (
      Object.entries(metrics).map(([key, value]) => (
        <div
          key={key}
          className="bg-white p-6 rounded-lg shadow-md text-center border"
        >
          <h2 className="text-lg font-semibold capitalize">
            {key.replace(/([A-Z])/g, ' $1')}
          </h2>
          <p className="text-3xl font-bold text-blue-600">{typeof value === 'number' ? value.toFixed(2) : value}</p>
        </div>
      ))
    ) : (
      <div className="bg-white p-6 rounded-lg shadow-md text-center border">
        <p className="text-lg font-semibold">Loading...</p>
      </div>
    )}
  </div>
);

const DataInfo = () => {
  const [dataInfo, setDataInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch data from the API
    const fetchData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/data-info');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        setDataInfo(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg shadow-md">
        <p className="text-lg font-semibold text-blue-600">Loading data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-lg shadow-md">
        <p className="text-lg font-semibold text-red-600">Error: {error}</p>
      </div>
    );
  }

  const { description, info } = dataInfo || {};

  // Extract total columns from the "info" string
  const totalColumnsMatch = info.match(/total (\d+) columns/);
  const totalColumns = totalColumnsMatch ? parseInt(totalColumnsMatch[1], 10) : 0;

  const metrics = {
    "Total Entries": description?.Date?.count || 0,
    "Total Columns": totalColumns,
    "Rows With Missing Data": description?.Date?.count - description?.Sub_metering_3?.count || 0,
    "Max Value of Sub_metering_3": description?.Sub_metering_3?.max || 0,
    "Mean Value of Sub_metering_3": description?.Sub_metering_3?.mean || 0,
  };

  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-blue-600 mb-6">Data Information</h2>

      <div className="bg-white p-4 rounded-lg shadow-md mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Column Descriptions</h3>
        <Metrics metrics={metrics} />
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Column Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {description &&
            Object.keys(description).map((column) => {
              const stats = description[column];
              return (
                <div key={column} className="p-6 bg-gray-50 rounded-lg shadow-sm border">
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">{column}</h4>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>Count:</strong> {stats.count}</p>
                    <p className="text-sm text-gray-600"><strong>Mean:</strong> {isNaN(stats.mean) ? stats.mean : stats.mean.toFixed(2)}</p>
                    <p className="text-sm text-gray-600"><strong>Min:</strong> {isNaN(stats.min) ? stats.min : stats.min.toFixed(2)}</p>
                    <p className="text-sm text-gray-600"><strong>25%:</strong> {isNaN(stats["25%"]) ? stats["25%"] : stats["25%"].toFixed(2)}</p>
                    <p className="text-sm text-gray-600"><strong>50%:</strong> {isNaN(stats["50%"]) ? stats["50%"] : stats["50%"].toFixed(2)}</p>
                    <p className="text-sm text-gray-600"><strong>75%:</strong> {isNaN(stats["75%"]) ? stats["75%"] : stats["75%"].toFixed(2)}</p>
                    <p className="text-sm text-gray-600"><strong>Max:</strong> {isNaN(stats.max) ? stats.max : stats.max.toFixed(2)}</p>
                    <p className="text-sm text-gray-600"><strong>Std:</strong> {isNaN(stats.std) ? stats.std : stats.std.toFixed(2)}</p>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default DataInfo;
