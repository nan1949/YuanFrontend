import axios from 'axios';

// 从环境变量中获取 API 基础 URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 定义主办方数据的类型，确保类型安全
export interface Organizer {
  organizer_name: string;
  organizer_name_trans: string | null;
  website: string | null;
  organizer_type: string | null;
  intro: string | null;
  logo_url: string | null;
  representative_exhibition?: string; // 示例中没有，这里添加以匹配表格
  id: number;
}

export const getOrganizers = async (): Promise<Organizer[]> => {
  if (!API_BASE_URL) {
    console.error("API_BASE_URL is not defined in the environment.");
    throw new Error('API 地址未配置。');
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/organizers?skip=0&limit=5`);
    // axios 自动解析 JSON 并返回类型化的数据
    return response.data;
  } catch (error) {
    console.error("Failed to fetch organizers:", error);
    // 捕获并抛出错误，以便组件可以处理
    throw new Error('无法获取主办方数据。');
  }
};
