import api from './api';
import { Organizer } from '../types';

export interface OrganizerPagination {
    total: number;
    page: number;
    limit: number;
    items: Organizer[];
}


export const getOrganizers = async (params: { page: number; limit: number; keyword?: string }) => {
    const res = await api.get<OrganizerPagination>('/organizers', { params });
    return res.data;
};

export const getOrganizerById = async (id: number) => {
    const res = await api.get<Organizer>(`/organizers/${id}`);
    return res.data;
};


// 创建主办方
export const createOrganizer = async (data: Partial<Organizer>) => {
    return api.post('/organizers', data);
};

// 更新主办方
export const updateOrganizer = async (id: number, data: Partial<Organizer>) => {
    return api.put(`/organizers/${id}`, data);
};

// 删除主办方
export const deleteOrganizer = async (id: number) => {
    return api.delete(`/organizers/${id}`);
};

// 合并主办方
export const mergeOrganizers = async (keep_id: number, duplicate_ids: number[]) => {
    return api.post('/organizers/merge', {
        keep_id,
        duplicate_ids_to_delete: duplicate_ids
    });
};