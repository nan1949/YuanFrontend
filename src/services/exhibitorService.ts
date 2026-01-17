import api from './api';
import { ExhibitorData } from '../types'; // 假设导入展商数据类型


export interface ExhibitorSearchParams {
  fair_id?: number;
  search_name?: string;
  country?: string;
  fair_date?: string; // YYYY-MM-DD
  page?: number;
  page_size?: number;
}

export interface UnifiedExhibitorResponse {
  total_count: number;
  total_pages: number;
  current_page: number;
  data: ExhibitorData[];
  available_countries: string[];
  available_dates: string[];
}


export const searchExhibitors = async (
  params: ExhibitorSearchParams
): Promise<UnifiedExhibitorResponse> => {
  const {
    fair_id,
    search_name,
    country,
    fair_date,
    page = 1,
    page_size = 10
  } = params;

  // 1. 构建符合后端 Pydantic 模型 ExhibitorSearchRequest 的请求体
  const requestBody: Record<string, any> = {
    page,
    page_size,
  };

  if (fair_id) requestBody.fair_id = fair_id;
  if (search_name?.trim()) requestBody.search_name = search_name.trim();
  if (country) requestBody.country = country;
  if (fair_date) requestBody.fair_date = fair_date;
  console.log(requestBody)

  try {
    // 2. 使用 api 实例发送 POST 请求
    // 路径改为你后端定义的统一接口
    const response = await api.post<UnifiedExhibitorResponse>('/exhibitors/search', requestBody);
    
    return response.data;

  } catch (error: any) {
    // 3. 错误处理
    // 404 处理逻辑：如果是页码超出范围，返回空结构
    if (error.response?.status === 404) {
      return {
        total_count: 0,
        total_pages: 0,
        current_page: page,
        data: [],
        available_countries: [],
        available_dates: [],
      };
    }

    console.error("Exhibitor Search Failed:", error);
    throw new Error(error.response?.data?.detail || '无法获取展商数据');
  }
};


export const uploadExhibitorsExcel = async (fairId: number, file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fair_id', fairId.toString());

    const response = await api.post('/exhibitors/upload-excel', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const uploadExhibitorsTxt = async (fairId: number, file: File) => {
    const formData = new FormData();
    formData.append('fair_id', fairId.toString());
    formData.append('file', file);
    
    const response = await api.post('/exhibitors/upload-txt', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};