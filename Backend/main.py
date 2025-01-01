import logging
from io import StringIO
from fastapi import FastAPI, HTTPException, Request, Query
from fastapi.middleware.cors import CORSMiddleware
from statsmodels.tsa.seasonal import seasonal_decompose
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tsa.statespace.sarimax import SARIMAX
import pandas as pd
import numpy as np
import uvicorn
import os

app = FastAPI()

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Request: {request.method} {request.url}")
    response = await call_next(request)
    logger.info(f"Response status: {response.status_code}")
    return response

DATA = None

def preprocess_dataset(raw_data):
    if 'Date' in raw_data.columns:
        raw_data['Date'] = pd.to_datetime(raw_data['Date'], format='%d/%m/%Y', errors='coerce')
    raw_data.dropna(subset=['Date'], inplace=True)
    raw_data.reset_index(drop=True, inplace=True)
    return raw_data

@app.get("/fetch-dataset")
def load_dataset(row_limit: int = Query(None, description="Number of rows to fetch for preview only")):
    global DATA
    try:
        # Path to your local CSV file
        file_path = "/home/ifrasaleem/Downloads/Project-3/GLP Project-3/electric_power_consumption.csv"
        
        if not os.path.exists(file_path):
            raise HTTPException(status_code=400, detail="File does not exist.")
        
        # Read the full dataset into memory
        if DATA is None:  # Load dataset only once
            logger.info("Loading the full dataset into memory.")
            DATA = preprocess_dataset(pd.read_csv(file_path))

        # Use row_limit only for preview purposes
        if row_limit:
            preview_data = DATA.head(row_limit).to_dict(orient='records')
        else:
            preview_data = DATA.head(5).to_dict(orient='records')  # Default to 5 rows for preview
        
        logger.info(f"Dataset loaded successfully. Rows fetched for preview: {len(preview_data)}")
        return {
            "message": "Dataset loaded successfully.",
            "rows_in_preview": len(preview_data),
            "rows_in_total": len(DATA),
            "preview_data": preview_data
        }
    except Exception as e:
        logger.error(f"Error loading dataset: {e}")
        raise HTTPException(status_code=500, detail="Failed to load dataset.")


@app.get("/data-info")
def data_info():
    if DATA is None:
        logger.error("Dataset is not loaded.")
        raise HTTPException(status_code=400, detail="Dataset is not loaded.")
    try:
        data_subset = DATA.head(20000)
        buffer = StringIO()
        data_subset.info(buf=buffer)
        info_str = buffer.getvalue()
        description = (
            data_subset.describe()
            .replace([np.inf, -np.inf], np.nan)
            .fillna(0)
            .to_dict()
        )
        return {"info": info_str, "description": description}
    except Exception as e:
        logger.error(f"Error fetching data info: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch data information.")

@app.get("/plot-energy")
def plot_energy():
    if DATA is None:
        logger.error("Dataset is not loaded.")
        raise HTTPException(status_code=400, detail="Dataset is not loaded.")
    try:
        daily_data = DATA.head(20000)
        daily_data['Date'] = pd.to_datetime(daily_data['Date'], errors='coerce')
        daily_data.set_index('Date', inplace=True)
        daily_data['Global_active_power'] = pd.to_numeric(daily_data['Global_active_power'], errors='coerce')
        daily_data.dropna(subset=['Global_active_power'], inplace=True)
        daily_resampled = daily_data.resample('D').sum()
        return {
            "x": daily_resampled.index.strftime('%Y-%m-%d').tolist(),
            "y": daily_resampled['Global_active_power'].tolist()
        }
    except Exception as e:
        logger.error(f"Error plotting energy data: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch energy data.")

@app.get("/seasonal-decomposition")
def seasonal_decomposition():
    if DATA is None:
        logger.error("Dataset is not loaded.")
        raise HTTPException(status_code=400, detail="Dataset is not loaded.")
    try:
        daily_data = preprocess_dataset(DATA.head(20000).copy())
        daily_data.set_index('Date', inplace=True)
        daily_data['Global_active_power'] = pd.to_numeric(daily_data['Global_active_power'], errors='coerce')
        daily_data.dropna(subset=['Global_active_power'], inplace=True)
        decomposition = seasonal_decompose(daily_data['Global_active_power'], model='additive', period=365)
        return {
            "x": daily_data.index.strftime('%Y-%m-%d').tolist(),
            "trend": decomposition.trend.fillna(0).tolist(),
            "seasonal": decomposition.seasonal.fillna(0).tolist(),
            "residual": decomposition.resid.fillna(0).tolist()
        }
    except Exception as e:
        logger.error(f"Error in seasonal decomposition: {e}")
        raise HTTPException(status_code=500, detail="Failed to perform seasonal decomposition.")

@app.get("/arima-forecast")
def arima_forecast():
    if DATA is None:
        logger.error("Dataset is not loaded.")
        raise HTTPException(status_code=400, detail="Dataset is not loaded.")
    try:
        daily_data = preprocess_dataset(DATA.head(20000).copy())
        daily_data.set_index('Date', inplace=True)
        daily_data['Global_active_power'] = pd.to_numeric(daily_data['Global_active_power'], errors='coerce')
        daily_data.dropna(subset=['Global_active_power'], inplace=True)
        train_size = int(len(daily_data) * 0.8)
        train, test = daily_data['Global_active_power'][:train_size], daily_data['Global_active_power'][train_size:]
        arima_model = ARIMA(train, order=(5, 1, 0)).fit()
        forecast = arima_model.forecast(steps=len(test))
        return {
            "train": {"x": train.index.strftime('%Y-%m-%d').tolist(), "y": train.tolist()},
            "test": {"x": test.index.strftime('%Y-%m-%d').tolist(), "y": test.tolist()},
            "forecast": {"x": test.index.strftime('%Y-%m-%d').tolist(), "y": forecast.tolist()}
        }
    except Exception as e:
        logger.error(f"Error in ARIMA forecasting: {e}")
        raise HTTPException(status_code=500, detail="Failed to perform ARIMA forecasting.")

@app.get("/sarima-forecast")
def sarima_forecast():
    if DATA is None:
        logger.error("Dataset is not loaded.")
        raise HTTPException(status_code=400, detail="Dataset is not loaded.")
    try:
        daily_data = preprocess_dataset(DATA.head(20000).copy())
        daily_data.set_index('Date', inplace=True)
        daily_data['Global_active_power'] = pd.to_numeric(daily_data['Global_active_power'], errors='coerce')
        daily_data.fillna(method='ffill', inplace=True)
        sarimax_model = SARIMAX(
            daily_data['Global_active_power'],
            order=(1, 1, 0),
            seasonal_order=(0, 1, 0, 12),
            enforce_stationarity=False,
            enforce_invertibility=False
        ).fit(disp=False)
        forecast_steps = 15
        forecast = sarimax_model.forecast(steps=forecast_steps)
        forecast_index = pd.date_range(start=daily_data.index[-1] + pd.Timedelta(days=1),
                                       periods=forecast_steps, freq='D')
        return {
            "historical": {
                "x": daily_data.index.strftime('%Y-%m-%d').tolist(),
                "y": daily_data['Global_active_power'].tolist()
            },
            "forecast": {
                "x": forecast_index.strftime('%Y-%m-%d').tolist(),
                "y": forecast.tolist()
            }
        }
    except Exception as e:
        logger.error(f"Error in SARIMA forecasting: {e}")
        raise HTTPException(status_code=500, detail="Failed to perform SARIMA forecasting.")