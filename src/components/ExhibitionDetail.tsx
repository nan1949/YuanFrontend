import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // 假设使用 React Router
import { ExhibitionData } from '../types';
import { getExhibitionDetail } from '../services/exhibitionService';

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

  const regex = /(?:^|\n)([^\n]{1,30})[：:](\s*)/g;
  
  const htmlText = cleanText.replace(regex, (match, p1, p2) => {
    return (match.startsWith('\n') ? '\n' : '') + `<strong>${p1}：</strong>${p2}`;
  });

  return htmlText;
};

const ExhibitionDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>(); 
    const [exhibition, setExhibition] = useState<ExhibitionData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
                // 确保 ID 是整数或字符串，取决于您的服务需要
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

    if (loading) return <div className="p-8 text-center text-lg">正在加载详情...</div>;
    if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
    if (!exhibition) return <div className="p-8 text-center">展会不存在或已被移除。</div>;

    const startDate = formatDate(exhibition.fair_start_date);
    const endDate = formatDate(exhibition.fair_end_date);
    const industryFields = Array.isArray(exhibition.industry_field) ? exhibition.industry_field : [];

    return (
        <div className="w-[1200px] mx-auto p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{exhibition.fair_name_trans}</h1>
            <p className="text-xl text-gray-500 italic mb-6">{exhibition.fair_name}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t pt-6">
                
                {/* 1. 基本信息 (占据第一列) */}
                <div className="md:col-span-1">
                    <h2 className="text-lg font-semibold mb-3 border-b pb-1">基本信息</h2>
                    <DetailItem label="日期" value={`${startDate} 至 ${endDate}`} />
                    <DetailItem label="周期" value={exhibition.period || '暂无'} />
                    <DetailItem label="地点" value={`${exhibition.city}, ${exhibition.country}`} />
                    <DetailItem label="展馆" value={exhibition.pavilion || '暂无'} />
                    <DetailItem label="主办方" value={exhibition.organizer_name || '暂无'} />
                    <DetailItem label="官网">
                        <a href={exhibition.website || '#'} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 break-all">
                            {exhibition.website || '暂无'}
                        </a>
                    </DetailItem>
                </div>

                {/* 2. 行业标签 (放在右侧，与基本信息并列) */}
                <div className="mt-6 pt-3 border-t">
                    <h2 className="text-lg font-semibold mb-3 border-b pb-1">行业标签</h2>
                    <div className="flex flex-wrap gap-2">
                        {industryFields.length > 0 ? (
                            industryFields.map((tag) => (
                                <span 
                                    key={tag} 
                                    className="px-3 py-1 text-sm font-medium bg-indigo-100 text-indigo-800 rounded-full shadow-sm"
                                >
                                    {tag}
                                </span>
                            ))
                        ) : (
                            <span className="text-gray-500">暂无行业标签</span>
                        )}
                    </div>
                </div>
            </div>

            {/* 3. 展会简介 (单独模块) */}
            <div className="mt-8 pt-6 border-t">
                <h2 className="text-lg font-semibold mb-3 border-b pb-1">展会简介</h2>
                <p className="text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: formattedIntro }}
                />
            </div>
            
            {/* 4. ⚠️ 新增：展品范围 (exhibition_items) */}
            <div className="mt-8 pt-6 border-t">
                <h2 className="text-lg font-semibold mb-3 border-b pb-1">展品范围</h2>
                {formattedItems ? (
                  <p 
                      className="text-gray-700 leading-relaxed whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ __html: formattedItems }}
                  />
                ) : (
                  <p className="text-gray-500 leading-relaxed">暂无展品范围信息。</p>
                )}
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
        <span className="font-medium text-gray-700 w-24 inline-block">{label}：</span>
        <span className="text-gray-900">{children || value}</span>
    </div>
);

export default ExhibitionDetail;