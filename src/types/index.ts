
export interface FilterState {
  exhibitionIds: string[]; // 选中的展会 ID 列表
  organizerId: string | null; // 选中的主办方 ID
  venueIds: string[]; // 选中的场馆 ID 列表
}

export interface EventFormat {
    zh: string;
    en: string;
}

export interface FrequencyType {
    zh: string;
    en: string;
}


export interface ExhibitionData {
  id: number;
  fair_name: string;
  fair_name_trans: string;
  fair_series_id: number;
  website: string;
  fair_start_date: string;
  fair_end_date: string;
  open_hour: string;
  intro: string;
  fair_label:string;
  event_format:string;
  industry_field: string[];
  exhibition_items: string;
  country: string;
  province: string; 
  city: string;
  pavilion_id: number;
  organizer_id: number;
  period:string;
  contact: string,
  phone: string,
  fax: string,
  email: string,
  logo_url?: string;
  banner_url?: string;

  // 新增字段
  exhibitor_edition?: string; // 最新展商日期/届份
  exhibitor_count?: number;   // 展商人数
}

export interface ExpoInfo {
  fair_start_date: string;
  fair_end_date: string;
  hall: string; 
  booth_number: string;
  country: string;
  province: string;
  city: string; 
}


export interface CompanyData {
  id: string;
  fair_id: number;
  exhibitor_name: string;
  uni_code: string;
  legal_person: string;
  register_date: string;
  registered_capital: string;
  company_name: string;
  website: string[];
  intro: string;
  country: string;
  province: string;
  city: string; 
  logo_url?: string;
  category: string[];
  products:string;
  email:string[];
  phone:string[];
  
  expo_info: ExpoInfo[]
}

export interface ExhibitorData {
    // 保持原有的核心字段
    id: number;
    fair_id: number | null;
    exhibitor_name: string | null;
    company_id: string | null;
    country: string | null;
    city: string | null;
    logo_url: string | null;
    intro: string | null;
    fair_start_date: string | null;
    fair_end_date: string | null;
    
    // 🚀 新增的字段，与后端接口保持一致
    company_name: string | null;
    website: string | null;
    phone: string | null;
    email: string | null;
    brands: string | null;
    products: string | null;
    booth_number: string | null;
}


export interface Pavilion {
  id: number;
  pavilion_name: string;
  pavilion_name_trans: string | null;
  intro: string | null;
  website: string | null;
  country: string;
  province: string; 
  city: string;
  address: string | null;
  space: number | null;
}

export interface IndustryCategory {
    id: number;
    name_zh: string;
    name_en: string;
    parent_id: number;
    level: number;
    sort_order: number;
    children?: IndustryCategory[];
    _isNew?: boolean; // 🚀 增加这一行，表示这是个可选的标识位
}

// 定义主办方数据的类型，确保类型安全
export interface Organizer {
  id: number;
  organizer_name: string;
  organizer_name_trans: string | null;
  website: string | null;
  organizer_type: string | null;
  country: string;
  province: string; 
  city: string;
  intro: string | null;
  logo_url: string | null;
}