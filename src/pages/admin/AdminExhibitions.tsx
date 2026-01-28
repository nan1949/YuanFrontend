import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, message, Space, Popconfirm, Card
} from 'antd';
import dayjs from 'dayjs';
import { 
    getExhibitions, 
    deleteExhibition, 
    getSearchHistory, 
    saveSearchHistory,
    getEventFormats,
    getFrequencyTypes
} from '../../services/exhibitionService';
import ExhibitionHeader from '../../sections/admin/ExhibitionHeader';
import ExhibitionEditModal from '../../components/admin/ExhibitionEditModal';
import ExhibitionMergeModal from '../../components/admin/ExhibitionMergeModal';
import ExhibitionSeriesModal from '../../components/admin/ExhibitionSeriesModal';
import { ExhibitionData, EventFormat, FrequencyType } from '../../types';
import * as regionService from '../../services/regionService';
import * as industryService from '../../services/industryService';


const AdminExhibitions: React.FC = () => {

    const [data, setData] = useState<ExhibitionData[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const [history, setHistory] = useState<string[]>([]);
    const [eventFormats, setEventFormats] = useState<EventFormat[]>([]);
    const [frequencyTypes, setFrequencyTypes] = useState<FrequencyType[]>([]);

    const [filters, setFilters] = useState({
        search_name: '',
        organizer_id: undefined as number | undefined,
        date_status: undefined as string | undefined
    });
    
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

    // 编辑相关的状态
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingFair, setEditingFair] = useState<ExhibitionData | null>(null);

    const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);

    const [countries, setCountries] = useState<regionService.RegionOption[]>([]);
    const [provinces, setProvinces] = useState<regionService.RegionOption[]>([]);
    const [cities, setCities] = useState<regionService.RegionOption[]>([]);

    const [allIndustryFields, setAllIndustryFields] = useState<string[]>([]);

    const [isSeriesModalOpen, setIsSeriesModalOpen] = useState(false);

    const [sortConfig, setSortConfig] = useState<{
        columnKey: 'country' | 'fair_start_date' | null,
        order: 'asc' | 'desc' | null
    }>({ columnKey: null, order: null });

    const navigate = useNavigate();


    // 1. 获取数据 (调用之前的 /exhibitions 接口)
    const fetchData = async (
        currentFilters = filters, 
        page = pagination.current,
        currentSort = sortConfig // 新增
    ) => {
        setLoading(true);
        try {
            const res = await getExhibitions({
                page: page,
                size: pagination.pageSize,
                search_name: currentFilters.search_name,
                organizer_id: currentFilters.organizer_id,
                date_status: currentFilters.date_status as any,
                // --- 传递排序到后端 ---
                sort_by: currentSort.columnKey,
                sort_order: currentSort.order
            });
            setData(res.results);
            setTotal(res.total_count);
        } catch (error) {
            message.error('数据加载失败');
        } finally {
            setLoading(false);
        }
    };

    const loadInitialData = async () => {
        try {
            // 原有的获取国家、行业等逻辑...
            const countriesData = await regionService.getCountries();
            setCountries(countriesData);

            const [formats, freqs] = await Promise.all([
                getEventFormats(),
                getFrequencyTypes() // 🚀 获取举办周期
            ]);
            setEventFormats(formats);
            setFrequencyTypes(freqs);

            industryService.getIndustryFields().then(setAllIndustryFields);

        } catch (error) {
            console.error("加载初始化数据失败:", error);
        }
    };

    useEffect(() => {
        loadInitialData();
        loadHistory();
    }, []);

    useEffect(() => {
        fetchData(filters, pagination.current, sortConfig);
    }, [pagination.current, sortConfig]); // 增加 sortConfig 依赖

    const loadHistory = async () => {
        try {
            const data = await getSearchHistory();
            setHistory(data);
        } catch (e) { console.error("加载历史失败", e); }
    };

    const handleSearch = async (newFilters: { search_name?: string; organizer_id?: number; date_status?: string }) => {
        const mergedFilters = { ...filters, ...newFilters };
        setFilters(mergedFilters);
        setPagination(prev => ({ ...prev, current: 1 })); // 重置页码
        fetchData(mergedFilters, 1);
        // 执行搜索业务逻辑...
        
        if (newFilters.search_name?.trim()) {
            await saveSearchHistory(newFilters.search_name);
            loadHistory();
        }
    };

    // 处理国家切换
    const handleCountryChange = async (countryId: number) => {
        setProvinces([]); // 清空旧数据
        setCities([]);
        if (countryId) {
            const data = await regionService.getSubRegions(countryId);
            setProvinces(data);
        }
    };

    // 处理省份切换
    const handleProvinceChange = async (provinceId: number) => {
        setCities([]);
        if (provinceId) {
            const data = await regionService.getSubRegions(provinceId);
            setCities(data);
        }
    };

    
    const handleEdit = async (record: ExhibitionData) => {
        setEditingFair(record);
        if (record.country_id) {
            const p = await regionService.getSubRegions(record.country_id);
            setProvinces(p);
            if (record.province_id) {
                const c = await regionService.getSubRegions(record.province_id);
                setCities(c);
            }
        }
        setIsEditModalOpen(true);
    };

    const showCreateModal = () => {
        setEditingFair(null); // 清空当前编辑对象，表示新增
        setIsEditModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        try {
        await deleteExhibition(id);
        message.success('删除成功');
        
        // 🚀 核心修复：删除成功后清空选中项状态
        setSelectedIds([]); 
        
        fetchData(filters, pagination.current);
    } catch (error) {
        message.error('删除失败');
    }
    };

    const handleMergeButtonClick = () => {
        if (selectedIds.length < 2) {
            return message.warning('请至少选择两条数据进行合并');
        }
        setIsMergeModalOpen(true);
    };

    const handleOpenSeriesModal = () => {
        if (selectedIds.length === 0) {
            return message.warning('请先选择要归类的展会');
        }

        setIsSeriesModalOpen(true);
    };

    // 处理分页、排序变化
    const handleTableChange = (paginationInfo: any, filters: any, sorter: any) => {
        // 更新分页状态
        setPagination(prev => ({ ...prev, current: paginationInfo.current }));

        // 处理排序逻辑
        if (sorter.field && sorter.order) {
            setSortConfig({
                columnKey: sorter.field,
                order: sorter.order === 'ascend' ? 'asc' : 'desc'
            });
        } else {
            // 如果取消排序
            setSortConfig({ columnKey: null, order: null });
        }
    };

    const columns = [
        { title: 'ID', dataIndex: 'id', width: 70 },
        { 
            title: '展会名称', 
            dataIndex: 'fair_name',
            render: (text: string, record: ExhibitionData) => (
                <div>
                    <div className="font-medium">{text}</div>
                    <div className="text-gray-400 text-xs">{record.fair_name_trans}</div>
                </div>
            )
        },
        { 
            title: '国家', 
            dataIndex: 'country', 
            width: 120,
            sorter: true, // 开启排序 UI
            render: (text: string, record: any) => (
                <Space>
                    {record.iso_code && (
                        <span className={`fi fi-${record.iso_code.toLowerCase()}`} />
                    )}
                    {text}
                </Space>
            )
        },
        { 
            title: '官网', 
            dataIndex: 'website', 
            ellipsis: true,
            render: (text: string) => text ? <a href={text} target="_blank" rel="noreferrer" className="text-blue-500">{text}</a> : '-' 
        },
        { 
            title: '开展时间', 
            dataIndex: 'fair_start_date', 
            width: 110,
            sorter: true, // 开启排序 UI
            render: (text: string) => text ? dayjs(text).format('YYYY-MM-DD') : '-'
        },
        { 
            title: '最新展商', 
            dataIndex: 'exhibitor_edition', 
            width: 110,
            render: (text: string) => text ? dayjs(text).format('YYYY-MM-DD') : '-'
        },
        { 
            title: '人数', 
            dataIndex: 'exhibitor_count', 
            width: 80,
            render: (val: number) => <span className="text-blue-600 font-bold">{val || 0}</span>
        },
        {
            title: '操作',
            key: 'action',
            fixed: 'right' as const,
            width: 180,
            render: (_: any, record: ExhibitionData) => (
                <Space>
                    <Button 
                        type="link" 
                        size="small" 
                        onClick={() => navigate(`/admin/exhibitions/${record.id}`)}
                    >
                        查看详情
                    </Button>
                    <Button type="link" size="small" onClick={() => handleEdit(record)}>编辑</Button>
                    <Popconfirm title="确定删除吗?" onConfirm={() => handleDelete(record.id)}>
                        <Button type="link" size="small" danger>删除</Button>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return  (
        <div className="p-4">
            <Card bordered={false} className="shadow-sm">
                <ExhibitionHeader
                    searchText={filters.search_name}
                    setSearchText={(val) => setFilters(f => ({ ...f, search_name: val }))}
                    onSearch={handleSearch}
                    history={history}
                    selectedCount={selectedIds.length}
                    onAdd={showCreateModal}
                    onMerge={handleMergeButtonClick}
                    onSeries={handleOpenSeriesModal}
                />
        
                <Table 
                    loading={loading}
                    rowSelection={{ 
                        onChange: (keys) => setSelectedIds(keys as number[]) 
                    }}
                    dataSource={data} 
                    columns={columns} 
                    rowKey="id" 
                    scroll={{ x: 1200 }}
                    onChange={handleTableChange}
                    pagination={{
                        total: total,
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        onChange: (page) => setPagination({ ...pagination, current: page }),
                        showSizeChanger: false,
                        showTotal: (total) => `共 ${total} 条记录`
                    }}
                />

                <ExhibitionMergeModal 
                    open={isMergeModalOpen}
                    selectedExhibitions={data.filter(f => selectedIds.includes(f.id))}
                    onCancel={() => setIsMergeModalOpen(false)}
                    onSuccess={() => {
                        setIsMergeModalOpen(false);
                        setSelectedIds([]);
                        fetchData();
                    }}
                />

                {/* 编辑弹窗 */}
                <ExhibitionEditModal 
                    open={isEditModalOpen}
                    editingFair={editingFair}
                    onCancel={() => setIsEditModalOpen(false)}
                    onSuccess={() => {
                        setIsEditModalOpen(false); // 1. 关闭 Modal
                        fetchData(filters, pagination.current); // 2. 刷新列表数据
                    }}
                    countries={countries}
                    provinces={provinces}
                    cities={cities}
                    industries={allIndustryFields}
                    eventFormats={eventFormats} // 传递数据源
                    frequencyTypes={frequencyTypes} // 🚀 传下去
                    onCountryChange={handleCountryChange}
                    onProvinceChange={handleProvinceChange}
                />

                <ExhibitionSeriesModal 
                    open={isSeriesModalOpen}
                    selectedIds={selectedIds}
                    selectedExhibitions={data.filter(f => selectedIds.includes(f.id))}
                    onCancel={() => setIsSeriesModalOpen(false)}
                    onSuccess={() => {
                        setIsSeriesModalOpen(false);
                        setSelectedIds([]);
                        fetchData();
                    }}
                />
            </Card>
        </div>
    );
};

export default AdminExhibitions;