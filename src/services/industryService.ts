import api from "./api";
import { IndustryCategory } from "../types";

export const getIndustryFields = () => 
    api.get(`/industries/fields`).then(res => res.data);


// 获取全量行业树
export const getIndustryTree = async () => {
    const res = await api.get<IndustryCategory[]>('/industries/tree');
    return res.data;
};

// 新增行业分类
export const createIndustry = async (data: Partial<IndustryCategory>) => {
    return api.post('/industries', data);
};

// 更新行业分类
export const updateIndustry = async (id: number, data: Partial<IndustryCategory>) => {
    return api.put(`/industries/${id}`, data);
};

// 删除行业分类
export const deleteIndustry = async (id: number) => {
    return api.delete(`/industries/${id}`);
};