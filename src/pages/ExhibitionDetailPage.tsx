import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { ExhibitionData, ExhibitorData } from '../types';
import { getExhibitionDetail } from '../services/exhibitionService';
import SearchResultCount from '../components/SearchResultCount';
import PaginationControls from '../components/PaginationControls';
import useTitle from '../hooks/useTitle';
import TabButton from '../components/TabButton';
import Container from '../components/Container';
import { getExhibitorsByFair } from '../services/exhibitorService';
import ExhibitorRow from '../components/ExhibitorRow';


const formatDate = (dateString?: string | null): string => {
    if (!dateString) return '待定';
    return String(dateString).split('T')[0];
};

const convertMarkdownBoldToHtml = (text: string): string => {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  const htmlText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  return htmlText;
};

const formatItemsWithBoldHeaders = (text: string): string => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  let cleanText = text.replace(/\*\*(.*?)\*\*/g, '$1');

  const regex = /(?:^|\n)([^\n]{1,10})[：:](\s*)/g;
  
  const htmlText = cleanText.replace(regex, (match, p1, p2) => {
    return (match.startsWith('\n') ? '\n' : '') + `<strong>${p1}：</strong>${p2}`;
  });

  return htmlText;
};

const INITIAL_PAGE_SIZE = 10;


const ExhibitionDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>(); 
    const [exhibition, setExhibition] = useState<ExhibitionData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Tab 状态
    const [activeTab, setActiveTab] = useState<'items' | 'exhibitors'>('items');

    // 展商列表状态
    const [exhibitors, setExhibitors] = useState<ExhibitorData[]>([]);
    const [exhibitorLoading, setExhibitorLoading] = useState(false);
    const [exhibitorTotalCount, setExhibitorTotalCount] = useState(0);
    const [exhibitorCurrentPage, setExhibitorCurrentPage] = useState(1);
    const [exhibitorPageSize, setExhibitorPageSize] = useState(INITIAL_PAGE_SIZE);

    // 筛选状态 (与新的后端接口对应)
    const [selectedCountry, setSelectedCountry] = useState<string | undefined>(undefined);
    const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined); // YYYY-MM-DD 格式
    const [availableCountries, setAvailableCountries] = useState<string[]>([]);
    const [availableDates, setAvailableDates] = useState<string[]>([]); // 备选日期


    const pageTitle = exhibition ? `${exhibition.fair_name_trans}-展外展` : '加载中...';
    useTitle(pageTitle); 

    const formattedIntro = convertMarkdownBoldToHtml(exhibition?.intro || '');
    const formattedItems = formatItemsWithBoldHeaders(exhibition?.exhibition_items || '');

    useEffect(() => {
        if (!id) {
            setError("展会ID缺失。");
            setLoading(false);
            return;
        }

        const fetchDetail = async () => {
            setLoading(true);
            try {
                const data = await getExhibitionDetail(id); 
                setExhibition(data);
         
            } catch (err) {
                setError("无法加载展会详情。");
                setExhibition(null);
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [id]);

    // --- 展商数据获取 ---
    useEffect(() => {
        if (activeTab === 'exhibitors' && id && exhibition) {
            const fetchExhibitors = async () => {
                setExhibitorLoading(true);
                try {
                    const dateParam = selectedDate ? selectedDate : undefined;

                    const response = await getExhibitorsByFair({
                        fair_id: Number(id),
                        fair_date: dateParam, // 使用当前选中的日期
                        country: selectedCountry,
                        page: exhibitorCurrentPage,
                        page_size: exhibitorPageSize,
                    });
                    
                    setExhibitors(response.data);
                    setExhibitorTotalCount(response.total_count);

                    if (!selectedDate && response.available_dates && response.available_dates.length > 0) {
                        // 后端返回的 available_dates 列表的第一个元素即为默认筛选的日期
                        setSelectedDate(formatDate(response.available_dates[0]));
                    }
                    
                    // 首次加载或切换日期/国家时，更新备选列表
                    setAvailableCountries(response.available_countries || []);
                    setAvailableDates(response.available_dates?.map(d => formatDate(d)) || []);

                } catch (err) {
                    console.error("Failed to fetch exhibitors", err);
                    setExhibitors([]); // 清空列表
                    setExhibitorTotalCount(0);
                } finally {
                    setExhibitorLoading(false);
                }
            };
            fetchExhibitors();
        }
    }, [
        activeTab, 
        id, 
        exhibition, 
        selectedDate, 
        selectedCountry, 
        exhibitorCurrentPage, 
        exhibitorPageSize 
    ]);

    // --- 展商列表分页及筛选操作 ---

    const handlePageChange = useCallback((newPage: number) => {
      setExhibitorCurrentPage(newPage);
    }, []);

    const handlePageSizeChange = useCallback((newSize: number) => {
        setExhibitorPageSize(newSize);
        setExhibitorCurrentPage(1);
    }, []);

    const handleCountryChange = useCallback((newCountry?: string) => {
        setSelectedCountry(newCountry);
        setExhibitorCurrentPage(1);
    }, []);

    const handleDateChange = useCallback((newDate: string) => {
        setSelectedDate(newDate);
        setSelectedCountry(undefined); // 切换日期后，国家筛选重置
        setExhibitorCurrentPage(1);
    }, []);

    if (loading) return <div className="p-8 text-center text-lg">正在加载详情...</div>;
    if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
    if (!exhibition) return <div className="p-8 text-center">展会不存在或已被移除。</div>;

    const startDate = formatDate(exhibition.fair_start_date);
    const endDate = formatDate(exhibition.fair_end_date);
    const industryFields = Array.isArray(exhibition.industry_field) ? exhibition.industry_field : [];

    const exhibitorTotalPages = Math.ceil(exhibitorTotalCount / exhibitorPageSize);

    // 展商列表内容渲染
    const renderExhibitorList = () => {
        if (exhibitorLoading) {
            return <div className="p-8 text-center text-blue-600">正在加载参展商列表...</div>;
        }

        if (exhibitorTotalCount === 0) {
            return <div className="p-8 text-center text-gray-500">未找到符合当前筛选条件的参展商。</div>;
        }

        return (
            <div className="bg-white rounded-lg border border-gray-100 mt-4">
                
                <div className='px-4 pt-4'>
                    <SearchResultCount 
                        totalCount={exhibitorTotalCount}
                        itemLabel='参展商'
                    />
                </div>

                {/* 列表主体 */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {/* 保持与 ExhibitorRow 对应的表头 */}
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                                    展商名称 (公司名)
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                                    展位 / 产品 / 品牌
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                                    联系方式 / 官网
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                                    地点
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {exhibitors.map((exhibitor) => (
                                <ExhibitorRow key={exhibitor.id} data={exhibitor} />
                            ))}
                        </tbody>
                    </table>
                </div>
                
                {/* 分页控制 */}
                {exhibitorTotalPages > 1 && (
                    <PaginationControls 
                        totalCount={exhibitorTotalCount}
                        currentPage={exhibitorCurrentPage}
                        pageSize={exhibitorPageSize}
                        totalPages={exhibitorTotalPages}
                        onPageChange={handlePageChange}
                        onPageSizeChange={handlePageSizeChange}
                    />
                )}
            </div>
        );
    };

    return (
        <Container>
            {exhibition.banner_url && (
                <div className="mb-6 rounded-lg overflow-hidden shadow-md">
                    <img 
                        src={exhibition.banner_url} 
                        alt={`${exhibition.fair_name_trans} Banner`}
                        className="w-full object-cover max-h-64"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }} // 错误时隐藏图片
                    />
                </div>
            )}

            {/* 🚀 2. Logo 和 标题区域 */}
            <div className="flex items-center mb-2">
                {exhibition.logo_url && (
                    <img
                        src={exhibition.logo_url}
                        alt={`${exhibition.fair_name_trans} Logo`}
                        className="w-16 h-16 object-contain mr-4 border rounded-lg p-1"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                )}
                <div>
                    <h1 className="text-2xl font-medium text-gray-800">{exhibition.fair_name_trans}</h1>
                    <p className="text-xl text-gray-500 italic">{exhibition.fair_name}</p>
                </div>
            </div>
            
            {industryFields.length > 0 && (
                <div className="py-3">
                    <div className="flex flex-wrap gap-2">
                        {industryFields.map((tag) => (
                            <span 
                                key={tag} 
                                className="px-3 py-1 text-sm  bg-blue-100 text-blue-500 rounded shadow-sm"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            )}
             
            <div className="p-3 mt-3 bg-blue-50">
                
                {/* 1. 基本信息 (占据第一列) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3">
                    <div>
                        <DetailItem label="日期" value={`${startDate} 至 ${endDate}`} />
                        <DetailItem label="周期" value={exhibition.period || '—'} />
                        <DetailItem label="主办方" value={exhibition.organizer_name || '—'} />
                    </div>
                    
                    <div>
                        <DetailItem label="地点" value={
                            `${
                                [exhibition.country, exhibition.province, exhibition.city]
                                    .filter(Boolean)
                                    .join(', ') || '—'
                            }`
                        } />
                        <DetailItem label="展馆" value={exhibition.pavilion || '—'} />
                    
                        <DetailItem label="官网">
                            <a href={exhibition.website || '#'} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 break-all">
                                {exhibition.website || '—'}
                            </a>
                        </DetailItem>
                    </div>
                </div>

                <div className="flex items-baseline">
                    <span className="text-sm text-gray-500 shrink-0 mr-2 whitespace-nowrap">简介：</span>
                    
                    <div className="flex-grow">
                        <p 
                            className={`text-gray-600 text-sm leading-relaxed inline`}
                            dangerouslySetInnerHTML={{ __html: formattedIntro || '—' }}
                        />
                    </div>
                </div>
           
            </div>
        
            
            {/* 4. ⚠️ 新增：展品范围 (exhibition_items) */}
            <div className="mt-4 pt-6 border-t text-sm">

                <div className="flex space-x-6 border-b border-gray-200 mb-4">
                    <TabButton
                        label="展会情况"
                        isActive={activeTab === 'items'}
                        onClick={() => setActiveTab('items')}
                    />
                    <TabButton
                        label="展商信息"
                        isActive={activeTab === 'exhibitors'}
                        onClick={() => setActiveTab('exhibitors')}
                    />
                </div>

                <div className="text-sm">

                    {activeTab === 'items' && (formattedItems ? (
                        <p 
                            className="text-gray-700 leading-relaxed whitespace-pre-wrap"
                            dangerouslySetInnerHTML={{ __html: formattedItems }}
                        />
                        ) : (
                        <p className="text-gray-500 leading-relaxed">暂无详细展会情况或展品范围信息。</p>
                        )
                    )}

                    {/* 🚀 展商信息 (exhibitors) */}
                    {activeTab === 'exhibitors' && (
                        <div>
                            {/* 筛选区域 */}
                            <div className='flex flex-wrap items-center gap-4 mb-4 p-3 bg-gray-50 rounded'>
                                {/* 日期筛选 */}
                                {availableDates.length > 1 && (
                                    <div className="flex items-center">
                                        <label className="text-gray-600 text-sm mr-2">展会日期：</label>
                                        <select 
                                            // 🚀 使用 selectedDate || '' 确保在 undefined 状态下能正确显示
                                            value={selectedDate || availableDates[0] || ''} 
                                            onChange={(e) => handleDateChange(e.target.value)}
                                            className="border rounded p-1 text-sm bg-white"
                                        >
                                            {availableDates.map(d => (
                                                <option key={d} value={d}>{d}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                
                                {/* 国家筛选 */}
                                <div className="flex items-center">
                                    <label className="text-gray-600 text-sm mr-2">国家/地区：</label>
                                    <select
                                        value={selectedCountry || ''}
                                        onChange={(e) => handleCountryChange(e.target.value || undefined)}
                                        className="border rounded p-1 text-sm bg-white"
                                    >
                                        <option value="">全部国家/地区</option>
                                        {availableCountries.map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            
                            {renderExhibitorList()}
                        </div>
                    )}

                </div>
            </div>
            
        </Container>
    );
};

// 辅助组件：详情项
const DetailItem: React.FC<{ 
    label: string, 
    value?: string | React.ReactNode, // Changed from JSX.Element
    children?: React.ReactNode // Changed from JSX.Element
}> = ({ label, value, children }) => (
    <div className="mb-3">
        <span className="text-sm text-gray-500 shrink-0">{label}：</span>
        <span className="text-sm text-gray-600">{children || value}</span>
    </div>
);

export default ExhibitionDetailPage;