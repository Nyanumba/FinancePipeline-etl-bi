# ETL Pipeline + BI Dashboard

A production-grade ETL pipeline that extracts **forex rates**, **trade indicators**, and **population statistics** for African countries, transforms them with pandas, loads into PostgreSQL, and serves a live React BI dashboard.

![Stack](https://img.shields.io/badge/FastAPI-005571?style=flat&logo=fastapi)
![Stack](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Stack](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)
![Stack](https://img.shields.io/badge/APScheduler-hourly-brightgreen?style=flat)
![Stack](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)

---

## 📊 Data Sources

| Dataset | Source | Indicators |
|---|---|---|
| Forex rates | Open Exchange Rates API | KES, NGN, ZAR, ETB, GHS, TZS, UGX vs USD |
| Trade | World Bank API | Exports, Imports, Trade as % of GDP |
| Population | World Bank API | Total population 2000–2023 |

Countries covered: Kenya, Nigeria, South Africa, Ethiopia, Ghana, Tanzania, Uganda

---

## 🏗️ Architecture

```
Open Exchange Rates API ──┐
World Bank API (trade)  ──┼──► Extract → Transform (pandas) → Load (PostgreSQL)
World Bank API (pop)    ──┘              ↑
                                   APScheduler (hourly)
                                         │
                                    FastAPI REST API
                                         │
                                   React BI Dashboard
```

---

## 🚀 Running Locally

```bash
git clone https://github.com/Nyanumba/etl-pipeline-bi.git
cd etl-pipeline-bi
cp backend/.env.example backend/.env   # add your OPEN_EXCHANGE_APP_ID
docker-compose up --build
```

- Frontend → http://localhost:3000
- API → http://localhost:8000
- API Docs → http://localhost:8000/docs

**Trigger pipeline manually:**
```bash
curl -X POST http://localhost:8000/api/pipeline/run
```

> Note: If `OPEN_EXCHANGE_APP_ID` is not set, the pipeline uses realistic mock forex data so the dashboard still works without an API key.

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/pipeline/run` | Trigger pipeline manually |
| `GET` | `/api/pipeline/runs` | Pipeline run history + status |
| `GET` | `/api/pipeline/latest` | Latest run status |
| `GET` | `/api/forex` | Latest forex rates |
| `GET` | `/api/trade/{indicator_code}` | Trade data by indicator |
| `GET` | `/api/population` | Population data all countries |
| `GET` | `/api/dashboard/summary` | Dashboard summary stats |

---

## 🚢 Deploying to Render

1. Push to GitHub
2. Create PostgreSQL DB on Render → copy Internal URL
3. Deploy `backend/` as Web Service:
   - Build: `pip install -r requirements.txt`
   - Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Env vars: `DATABASE_URL`, `OPEN_EXCHANGE_APP_ID`
4. Deploy `frontend/` as Static Site:
   - Build: `npm install && npm run build`
   - Publish: `build`
   - Env var: `REACT_APP_API_URL=<backend-url>`

---

## 📁 Project Structure

```
etl-pipeline-bi/
├── backend/
│   ├── main.py               # FastAPI app + APScheduler setup
│   ├── pipeline/
│   │   ├── extract.py        # API fetchers
│   │   ├── transform.py      # pandas cleaning + validation
│   │   ├── load.py           # SQLAlchemy upserts
│   │   └── runner.py         # Orchestrator + run logging
│   ├── models.py             # DB models incl. pipeline_runs log
│   ├── database.py
│   ├── schemas.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── api/client.js
│   │   └── components/
│   │       ├── ForexChart.jsx
│   │       ├── TradeChart.jsx
│   │       ├── PopulationChart.jsx
│   │       └── PipelineStatus.jsx
│   └── package.json
├── docker-compose.yml
└── README.md
```

---

## 📄 License

MIT