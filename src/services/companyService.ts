import api from './api';

export interface CompanyDetail {
  slug: string;
  organize_code?: string | null;
  company_name?: string | null;
  company_name_trans?: string | null;
  register_status?: string | null;
  country?: string | null;
  province?: string | null;
  city?: string | null;
  website?: string | null;
  introduction?: string | null;
  business_scope?: string | null;
}

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

export const getCompanyDetail = async (slug: string): Promise<CompanyDetail> => {
  try {
    const response = await api.get<CompanyDetail>(`/companies/${slug}`);
    return response.data;
  } catch (error: any) {
    console.error(`Failed to fetch company detail for slug ${slug}:`, error);
    throw new Error(error.response?.data?.detail || '无法获取企业详情数据');
  }
};
