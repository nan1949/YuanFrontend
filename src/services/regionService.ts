import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getCountries = () => axios.get(`${API_BASE_URL}/regions/countries`).then(res => res.data);
export const getProvinces = (country: string) => axios.get(`${API_BASE_URL}/regions/provinces?country=${country}`).then(res => res.data);
export const getCities = (country: string, province: string) => axios.get(`${API_BASE_URL}/regions/cities?country=${country}&province=${province}`).then(res => res.data);