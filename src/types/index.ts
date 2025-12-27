
export interface FilterState {
  exhibitionIds: string[]; // 选中的展会 ID 列表
  organizerId: string | null; // 选中的主办方 ID
  venueIds: string[]; // 选中的场馆 ID 列表
}


export interface ExhibitionData {
  id: string;
  fair_name: string;
  fair_name_trans: string;
  website: string;
  fair_start_date: string;
  fair_end_date: string;
  intro: string;
  industry_field: string[];
  exhibition_items: string;
  country: string;
  province: string; 
  city: string; 
  pavilion: string; 
  organizer_name: string;
  period:string;
  logo_url?: string;
  banner_url?: string;
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
  fair_id: string;
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