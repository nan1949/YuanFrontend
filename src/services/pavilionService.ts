import api from './api';
import { Pavilion } from '../types';

// 定义场馆数据的类型，确保类型安全

export interface PavilionPaginationResponse {
    total: number;
    page: number;
    limit: number;
    items: Pavilion[];
}


export const getPavilions = async (
    params: { page: number; limit: number; keyword?: string }
) => {
    const res = await api.get<PavilionPaginationResponse>('/pavilions', { params });
    console.log(res.data)
    return res.data;
};

export const getPavilionById = async (id: number): Promise<Pavilion> => {
    const res = await api.get(`/pavilions/${id}`);
    return res.data;
};


export const createPavilion = async (data: Partial<Pavilion>) => {
    return api.post('/pavilions', data);
};

export const updatePavilion = async (id: number, data: Partial<Pavilion>) => {
    return api.put(`/pavilions/${id}`, data);
};

export const deletePavilion = async (id: number) => {
    return api.delete(`/pavilions/${id}`);
};

export const mergePavilions = async (keep_id: number, duplicate_ids_to_delete: number[]) => {
    return api.post('/pavilions/merge', { keep_id, duplicate_ids_to_delete });
};