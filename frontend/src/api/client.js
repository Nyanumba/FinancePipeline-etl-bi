import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "",
});

export const fetchSummary = () => api.get("/api/dashboard/summary").then(r => r.data);
export const fetchForex = () => api.get("/api/forex").then(r => r.data);
export const fetchTrade = (code) => api.get(`/api/trade/${code}`).then(r => r.data);
export const fetchPopulation = () => api.get("/api/population").then(r => r.data);
export const fetchPipelineRuns = () => api.get("/api/pipeline/runs").then(r => r.data);
export const triggerPipeline = () => api.post("/api/pipeline/run").then(r => r.data);