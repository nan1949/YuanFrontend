import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ExhibitionData } from '../../types';
import { getExhibitionDetail } from '../../services/exhibitionService';
import useTitle from '../../hooks/useTitle';
import TabButton from '../../components/client/TabButton';
import Container from '../../components/client/Container';
import { useAuth } from '../../contexts/AuthContext';


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

// 辅助组件：详情项
const DetailItem: React.FC<{ 
    label: string, 
    value?: string | React.ReactNode, // Changed from JSX.Element
    children?: React.ReactNode // Changed from JSX.Element
}> = ({ label, value, children }) => (
    <div className="mb-3">
        <span className="text-sm text-gray-400 shrink-0">{label}：</span>
        <span className="text-sm">{children || value}</span>
    </div>
);

const ExhibitionDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>(); 
    const { user } = useAuth();
    const [exhibition, setExhibition] = useState<ExhibitionData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [activeTab, setActiveTab] = useState<'items' | 'exhibitors'>('items');

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

    if (loading) return <div className="p-12 text-center text-lg text-gray-400">正在加载详情...</div>;
    if (error) return <div className="p-12 text-center text-red-600">{error}</div>;
    if (!exhibition) return <div className="p-12 text-center">展会不存在或已被移除。</div>;

    const startDate = formatDate(exhibition.fair_start_date);
    const endDate = formatDate(exhibition.fair_end_date);
    const industryFields = Array.isArray(exhibition.industry_field) ? exhibition.industry_field : [];

    const isValidMember = user?.is_valid_member;

    return (
        <Container>
            <div className="flex items-start pt-8 mb-6 px-1">
                {exhibition.logo_url && (
                    <img
                        src={exhibition.logo_url}
                        alt="Logo"
                        className="w-20 h-20 object-contain mr-5 border border-gray-100 rounded-xl p-2 bg-white shadow-sm"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                )}
                <div className="pt-1">
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">{exhibition.fair_name_trans}</h1>
                    <p className="text-lg text-gray-400 italic font-light">{exhibition.fair_name}</p>
                </div>
            </div>
            
            {industryFields.length > 0 && (
                <div className="mb-6 px-1">
                    <div className="flex flex-wrap gap-2">
                        {industryFields.map((tag) => (
                            <span key={tag} className="px-3 py-1 text-xs font-medium bg-blue-50 text-blue-600 rounded-full border border-blue-100">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            )}
             
            <div className="p-3 mt-3 bg-blue-50">
            
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-4 mb-6">
                    <div>
                        <DetailItem label="展出日期" value={`${startDate} 至 ${endDate}`} />
                        <DetailItem label="举办周期" value={exhibition.period || '—'} />
                    </div>
                    
                    <div>
                        <DetailItem label="举办地点" value={
                            [exhibition.country, exhibition.province, exhibition.city]
                                .filter(Boolean)
                                .join(', ') || '—'
                        } />
                        <div className="flex items-center">
                            <span className="text-sm text-gray-400 shrink-0">官方网站：</span>
                            <span className="text-sm">
                                {isValidMember ? (
                                    exhibition.website ? (
                                        <a 
                                            href={exhibition.website.startsWith('http') ? exhibition.website : `https://${exhibition.website}`} 
                                            target="_blank" 
                                            rel="noreferrer" 
                                            className="text-blue-600 hover:text-blue-800 hover:underline break-all font-medium"
                                        >
                                            {exhibition.website}
                                        </a>
                                    ) : '—'
                                ) : (
                                    <div className="relative inline-block cursor-pointer group">
                                        <span className="text-blue-200 blur-[3px] select-none tracking-wider">
                                            {exhibition.website || "www.exhibition-site.com"}
                                        </span>
                                        <span className="absolute left-0 -top-9 hidden group-hover:block bg-gray-800 text-white text-[11px] px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl z-10 font-medium">
                                            🔒 仅限会员查看
                                        </span>
                                    </div>
                                )}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="pt-5 border-t border-slate-200/60">
                    <div className="flex">
                        <span className="text-sm text-gray-400 shrink-0">展会简介：</span>
                        <div className="flex-grow">
                            <p 
                                className="text-gray-600 text-sm leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: formattedIntro || '暂无简介' }}
                            />
                        </div>
                    </div>
                </div>
           
            </div>
        
            <div className="mt-4 px-1">
                <div className="flex space-x-8 border-b border-gray-100 mb-6">
                    <TabButton
                        label="展品范围"
                        isActive={activeTab === 'items'}
                        onClick={() => setActiveTab('items')}
                    />
                </div>

                <div className="pb-20">
                    {activeTab === 'items' && (
                        formattedItems ? (
                            <div 
                                className="text-gray-700 text-[15px] leading-loose whitespace-pre-wrap bg-white p-2"
                                dangerouslySetInnerHTML={{ __html: formattedItems }}
                            />
                        ) : (
                            <p className="text-gray-400 italic text-sm text-center py-10">暂无详细展品范围信息。</p>
                        )
                    )}
                </div>
            </div>
            
        </Container>
    );
};


export default ExhibitionDetailPage;