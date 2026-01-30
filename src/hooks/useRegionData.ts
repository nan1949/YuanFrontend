import { useState, useCallback } from 'react';
import * as regionService from '../services/regionService';
import { RegionOption } from '../services/regionService';

export const useRegionData = () => {
    const [countries, setCountries] = useState<RegionOption[]>([]);
    const [provinces, setProvinces] = useState<RegionOption[]>([]);
    const [cities, setCities] = useState<RegionOption[]>([]);

    // 加载国家列表
    const loadCountries = useCallback(async () => {
        try {
            const data = await regionService.getCountries();
            setCountries(data);
        } catch (e) {
            console.error("加载国家失败", e);
        }
    }, []);

    // 加载省份（根据国家ID）
    const loadProvinces = useCallback(async (countryId: number | null) => {
        if (!countryId) {
            setProvinces([]);
            setCities([]);
            return;
        }
        const data = await regionService.getSubRegions(countryId);
        setProvinces(data);
        setCities([]); // 切换国家时必须清空城市
    }, []);

    // 加载城市（根据省份ID）
    const loadCities = useCallback(async (provinceId: number | null) => {
        if (!provinceId) {
            setCities([]);
            return;
        }
        const data = await regionService.getSubRegions(provinceId);
        setCities(data);
    }, []);

    return {
        countries,
        provinces,
        cities,
        loadCountries,
        loadProvinces,
        loadCities,
        setProvinces, // 用于编辑回显时手动设置
        setCities     // 用于编辑回显时手动设置
    };
};