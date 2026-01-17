// services/crawlConfigService.ts
import api from './api';

export type CrawlContentType = 'list' | 'detail';

export interface CrawlConfigData {
    id: number;
    fair_id: number;
    content_type: CrawlContentType;
    start_url?: string;
    retrieve_method?: string;
    result_type?: string;
    headers?: string;
    params?: string;
    form_data?: string;
    pager_type?: string;
    page_variable?: string;
    page_start?: number;
    page_step?: number;
    total_page?: number;
    accept_cookie_js?: string;
    next_page_js?: string;
    load_more_js?: string;
    // XPath 字段
    xpath_objs?: string;
    xpath_sub_expo?: string;
    xpath_exhibitor_name?: string;
    xpath_company_name?: string;
    xpath_website?: string;
    xpath_detail_url?: string;
    xpath_detail_id?: string;
    xpath_category?: string;
    xpath_intro?: string;
    xpath_phone?: string;
    xpath_fax?: string;
    xpath_brands?: string;
    xpath_products?: string;
    xpath_show_objective?: string;
    xpath_email?: string;
    xpath_country?: string;
    xpath_city?: string;
    xpath_address?: string;
    xpath_zip?: string;
    fair_start_date: string;
    fair_end_date: string;
    xpath_logo_url?: string;
    xpath_banner_url?: string;
    xpath_hall?: string;
    xpath_booth_number?: string;
    source_url?: string;
}

export const getCrawlConfig = async (fairId: number, contentType: CrawlContentType): Promise<CrawlConfigData> => {
    const res = await api.get(`/crawl-configs/${fairId}?content_type=${contentType}`);
    return res.data;
};

export const createCrawlConfig = async (data: CrawlConfigData) => {
    const res = await api.post('/crawl-configs/', data);
    return res.data;
};

export const updateCrawlConfig = async (fairId: number, contentType: CrawlContentType, data: Partial<CrawlConfigData>) => {
    const res = await api.put(`/crawl-configs/${fairId}?content_type=${contentType}`, data);
    return res.data;
};