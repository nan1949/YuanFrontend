import axios from 'axios';

// 从环境变量中获取 API 基础 URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 定义场馆数据的类型，确保类型安全
export interface Pavilion {
  id: number;
  pavilion_name: string;
  pavilion_name_trans: string | null;
  intro: string | null;
  website: string | null;
  address: string | null;
  space: number | null;
}


export const getPavilions = async (): Promise<Pavilion[]> => {
  if (!API_BASE_URL) {
    console.error("API_BASE_URL is not defined in the environment.");
    throw new Error('API 地址未配置。');
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/pavilions?skip=0&limit=5`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch pavilions:", error);
    throw new Error('无法获取场馆数据。');
  }
};