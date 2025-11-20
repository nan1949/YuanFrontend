import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ExhibitionData, ExhibitorData } from '../types';
import { getExhibitionDetail } from '../services/exhibitionService';
import { getExhibitors } from '../services/exhibitorService';
import useTitle from '../hooks/useTitle';
import TabButton from '../components/TabButton';
import ExhibitorList from '../components/ExhibitorList';


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


const ExhibitionDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>(); 
    const [exhibition, setExhibition] = useState<ExhibitionData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [activeTab, setActiveTab] = useState<'items' | 'exhibitors'>('items');
    const [exhibitors, setExhibitors] = useState<ExhibitorData[]>([]);
    const [exhibitorLoading, setExhibitorLoading] = useState(false);


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

    useEffect(() => {
        if (activeTab === 'exhibitors' && exhibitors.length === 0 && id) {
            const fetchExhibitors = async () => {
                setExhibitorLoading(true);
                try {
                    const data = await getExhibitors();
                    setExhibitors(data.results);
                } catch (err) {
                    console.error("Failed to fetch exhibitors", err);
                    // You might want to set an exhibitor-specific error state here
                } finally {
                    setExhibitorLoading(false);
                }
            };
            fetchExhibitors();
        }
    }, [activeTab, id, exhibitors.length]);

    const handlePageChange = (newPage: number) => {
      
    }

    if (loading) return <div className="p-8 text-center text-lg">正在加载详情...</div>;
    if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
    if (!exhibition) return <div className="p-8 text-center">展会不存在或已被移除。</div>;

    const startDate = formatDate(exhibition.fair_start_date);
    const endDate = formatDate(exhibition.fair_end_date);
    const industryFields = Array.isArray(exhibition.industry_field) ? exhibition.industry_field : [];

    return (
        <div className="w-[1200px] mx-auto py-4">
            <h1 className="text-2xl font-medium text-gray-800 mb-2">{exhibition.fair_name_trans}</h1>
            <p className="text-xl text-gray-500 italic">{exhibition.fair_name}</p>

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
                        <p className="text-gray-500 leading-relaxed"></p>
                        )
                    )}

                    {activeTab === 'exhibitors' && (
                        <ExhibitorList loading={exhibitorLoading} data={exhibitors} 
                            totalCount={30}
                            currentPage={1}
                            pageSize={10}
                            onPageChange={handlePageChange}
                        />
                    )}
                </div>
            </div>
            
        </div>
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