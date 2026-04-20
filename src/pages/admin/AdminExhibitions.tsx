import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, message, Space, Popconfirm, Card, Tag
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
import ExhibitionCrawlModal from '../../components/admin/ExhibitionCrawlModal';
import { ExhibitionData, EventFormat, FrequencyType } from '../../types';
import * as industryService from '../../services/industryService';
import { useRegionData } from '../../hooks/useRegionData';
import useTitle from '../../hooks/useTitle';


const statusMap: Record<string, { color: string, text: string }> = {
    active: { color: 'green', text: '正常' },
    draft: { color: 'default', text: '草稿' },
    postponed: { color: 'orange', text: '延期' },
    cancelled: { color: 'red', text: '取消' },
    ceased: { color: 'magenta', text: '停办' },
};

const fairStatusOptions = [
    { zh: '正常', en: 'Active', value: 'active' },
    { zh: '草稿', en: 'Draft', value: 'draft' },
    { zh: '延期', en: 'Postponed', value: 'postponed' },
    { zh: '取消', en: 'Cancelled', value: 'cancelled' },
    { zh: '停办', en: 'Ceased', value: 'ceased' },
];


const AdminExhibitions: React.FC = () => {
    useTitle('展会管理中心-管理后台');

    const [data, setData] = useState<ExhibitionData[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const [history, setHistory] = useState<string[]>([]);
    const [eventFormats, setEventFormats] = useState<EventFormat[]>([]);
    const [frequencyTypes, setFrequencyTypes] = useState<FrequencyType[]>([]);

    const [filters, setFilters] = useState({
        search_name: '',
        organizer_id: undefined as number | undefined,
        date_status: undefined as string | undefined,
        fair_status: undefined as string | undefined
    });
    
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

    // 编辑相关的状态
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingFair, setEditingFair] = useState<ExhibitionData | null>(null);

    const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
    const [isCrawlModalOpen, setIsCrawlModalOpen] = useState(false);

    const { countries, provinces, cities, loadCountries, loadProvinces, loadCities } = useRegionData();

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
                fair_status: currentFilters.fair_status as any,
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

    useEffect(() => {
        loadCountries();
    }, [loadCountries]);

    const loadInitialData = async () => {
        try {
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

    const loadHistory = async () => {
        try {
            const data = await getSearchHistory();
            setHistory(data);
        } catch (e) { console.error("加载历史失败", e); }
    };

    useEffect(() => {
        loadInitialData();
        loadHistory();
    }, []);

    useEffect(() => {
        fetchData(filters, pagination.current, sortConfig);
    }, [pagination.current, sortConfig]); // 增加 sortConfig 依赖

    
    const handleSearch = async (newFilters: { search_name?: string; organizer_id?: number; date_status?: string; fair_status?: string }) => {
        const mergedFilters = { ...filters, ...newFilters };
        setFilters(mergedFilters);
        setPagination(prev => ({ ...prev, current: 1 })); // 重置页码
        fetchData(mergedFilters, 1);
        // 执行搜索业务逻辑...
        const searchTerm = newFilters.search_name?.trim();
        if (searchTerm) {
            try {
                await saveSearchHistory(searchTerm);
                setHistory(prev => {
                    const filtered = prev.filter(item => item !== searchTerm);
                    return [searchTerm, ...filtered].slice(0, 10); // 保持最近10条
                });
            } catch (e) {
                console.error("保存搜索历史失败", e);
            }
        }
    };

    const handleEdit = async (record: ExhibitionData) => {
        setEditingFair(record);
        if (record.country_id) {
            loadProvinces(record.country_id);
            if (record.province_id) {
                loadCities(record.province_id);
            }
        }
        setIsEditModalOpen(true);
    };

    const showCreateModal = () => {
        setEditingFair(null); // 清空当前编辑对象，表示新增
        setIsEditModalOpen(true);
    };

    const handleDelete = async (id: string) => {
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
            title: '状态',
            dataIndex: 'fair_status',
            width: 100,
            render: (status: string) => {
                const config = statusMap[status] || { color: 'blue', text: status || '未知' };
                return <Tag color={config.color}>{config.text}</Tag>;
            }
        },
        { 
            title: '开展时间', 
            dataIndex: 'fair_start_date', 
            width: 120,
            sorter: true, // 开启排序 UI
            render: (text: string) => {
                if (!text) return '-';
                const date = dayjs(text);
                const isPast = date.isBefore(dayjs(), 'day');
                return (
                    <span style={{ 
                        whiteSpace: 'nowrap', 
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '13px',
                        // 过期用灰色背景，未过期用绿色字体
                        backgroundColor: isPast ? '#f5f5f5' : '#f6ffed',
                        color: isPast ? '#8c8c8c' : '#52c41a',
                        border: isPast ? '1px solid #d9d9d9' : '1px solid #b7eb8f'
                    }}>
                        {date.format('YYYY-MM-DD')}
                    </span>
                );
            }
        },
        { 
            title: '最新展商', 
            dataIndex: 'exhibitor_edition', 
            width: 120,
            render: (text: string) => {
                if (!text) return '-';
                const date = dayjs(text);
                const isOld = date.isBefore(dayjs().subtract(1, 'year')); // 假设一年前的数据算旧数据
                return (
                    <span style={{ 
                        whiteSpace: 'nowrap',
                        color: isOld ? '#ff4d4f' : '#1890ff', // 旧数据红色警告，新数据蓝色
                        fontWeight: isOld ? 'normal' : '500'
                    }}>
                        {date.format('YYYY-MM-DD')}
                        {isOld && <span style={{ fontSize: '10px', marginLeft: '4px' }}>(旧)</span>}
                    </span>
                );
            }
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
            width: 250,
            render: (_: any, record: ExhibitionData) => (
                <Space>
                    <Button 
                        type="link" 
                        size="small" 
                        onClick={() => handleEdit(record)}
                    >
                        编辑
                    </Button>
                    <Button 
                        type="link" 
                        size="small" 
                        onClick={() => {
                            setEditingFair(record);
                            setIsCrawlModalOpen(true);
                        }}
                    >
                        配置爬虫
                    </Button>
                    <Button 
                        type="link" 
                        size="small" 
                        className="text-green-600"
                        onClick={() => navigate(`/admin/exhibitions/${record.id}`)}
                    >
                        查看展商
                    </Button>
                    
                    <Popconfirm 
                        title="确定删除吗?" 
                        onConfirm={() => handleDelete(record.id)}
                        okText="确定"
                        cancelText="取消"
                    >
                        <Button type="link" size="small" danger>删除</Button>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return  (
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
                    onChange: (keys) => setSelectedIds(keys as string[]) 
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
                fairStatusOptions={fairStatusOptions}
                onCountryChange={loadProvinces}
                onProvinceChange={loadCities}
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

            <ExhibitionCrawlModal 
                open={isCrawlModalOpen}
                exhibition={editingFair}
                onCancel={() => setIsCrawlModalOpen(false)}
            />
        </Card>

    );
};

export default AdminExhibitions;