import api from './api';

export interface CompanySearchParams {
  search_name?: string;
  country?: string;
  province?: string;
  page?: number;
  page_size?: number;
}

export interface CompanySearchResponse {
  total: number;
  data: any[]; // 建议后续定义具体的 CompanyData 类型
}

export const searchCompanies = async (
  params: CompanySearchParams
): Promise<CompanySearchResponse> => {
  const { search_name, country, province, page = 1, page_size = 10 } = params;

  const requestBody: Record<string, any> = {
    page,
    page_size,
  };

  if (search_name?.trim()) requestBody.search_name = search_name.trim();
  if (country) requestBody.country = country;
  if (province) requestBody.province = province;

  try {
    // 调用之前定义的 /companies/search 接口
    const response = await api.post<CompanySearchResponse>('/companies/search', requestBody);
    return response.data;
  } catch (error: any) {
    console.error("Company Search Failed:", error);
    throw new Error(error.response?.data?.detail || '无法获取公司数据');
  }
};