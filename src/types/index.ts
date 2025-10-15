
export interface FilterState {
  exhibitionIds: string[]; // 选中的展会 ID 列表
  organizerId: string | null; // 选中的主办方 ID
  venueIds: string[]; // 选中的场馆 ID 列表
}


export interface ExhibitionData {
  id: string;
  fair_name: string;
  fair_name_trans: string;
  website?: string;
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
}