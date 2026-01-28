import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface RegionOption {
    id: number;
    name_zh: string;
    name_en?: string;
    iso_code?: string; // 仅国家有
}

export const getCountries = (): Promise<RegionOption[]> => axios.get(`${API_BASE_URL}/regions/countries`).then(res => res.data);
export const getSubRegions = (parentId: number): Promise<RegionOption[]> => 
    axios.get(`${API_BASE_URL}/regions/sub-regions/${parentId}`).then(res => res.data);

export const getProvinces = (countryId: number) => getSubRegions(countryId);
export const getCities = (provinceId: number) => getSubRegions(provinceId);