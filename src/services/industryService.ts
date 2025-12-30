// services/industryService.ts
import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getIndustryFields = () => 
    axios.get(`${API_BASE_URL}/industries/fields`).then(res => res.data);