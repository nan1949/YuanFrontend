import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import Container from '../../components/client/Container';
import { Link } from 'react-router-dom'; 
import { ExhibitionData } from '../../types';
import ExhibitionFeaturedCard from '../../components/client/ExhibitionFeaturedCard';
import { getHomepageFeatureExhibitions } from '../../services/exhibitionService';
import { getRecentDynamics } from '../../services/exhibitorService';
import { RecentDynamic } from '../../services/exhibitorService';

const DISPLAY_COUNT = 6;


interface HomePageProps {}

const HomePage: React.FC<HomePageProps> = () => {

  const [exhibitions, setExhibitions] = useState<ExhibitionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dynamics, setDynamics] = useState<RecentDynamic[]>([]);
  const [dynLoading, setDynLoading] = useState(true);

  const fetchTopExhibitions = useCallback(async () => {
    setLoading(true);
    setError(null); // 重置错误状态
    try {
      const featuredItems = await getHomepageFeatureExhibitions(); 
      
      setExhibitions(
        featuredItems
          .map((item) => item.exhibition)
          .filter((exhibition): exhibition is ExhibitionData => Boolean(exhibition))
          .slice(0, DISPLAY_COUNT)
      );

    } catch (err) {
      console.error("加载展会数据失败:", err);
      setError('无法加载热门展会数据，请稍后重试。');
      setExhibitions([]);
    } finally {
      setLoading(false);
    }
  }, []); // 依赖项为空数组，只在组件挂载时执行一次


  const fetchRecentDynamics = useCallback(async () => {
    setDynLoading(true);
    const data = await getRecentDynamics(10); // 获取最近8条
    setDynamics(data);
    setDynLoading(false);
  }, []);

  useEffect(() => {
    fetchTopExhibitions();
    fetchRecentDynamics(); // 同时加载企业动态
  }, [fetchTopExhibitions]);

  const formatFullDate = (dateStr: string) => {
    if (!dateStr) return '待定';
    // 兼容 T 分隔的 ISO 格式，取第一部分
    return dateStr.split('T')[0];
  };


  return (
    
    <div className="flex flex-col">
        <Helmet>
            <title>展外展-找国际展会_找出海展商_找出海政策_出海企业查询系统</title>
        </Helmet>
        
        <div className="bg-slate-50 border-b border-gray-200 py-12">
            <Container>
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    
                    {/* 左侧文字引导 */}
                    <div className="lg:w-1/3 space-y-4">
                        <h1 className="text-4xl font-extrabold text-gray-900 leading-tight">
                            实时企业 <br/>
                            <span className="text-blue-600">参展动态</span>
                        </h1>
                        <p className="text-gray-500 text-lg">
                            连接全球贸易，实时掌握中国企业出海参展足迹。
                        </p>
                        <Link 
                            to="/companies/search" 
                            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        >
                            查看全部展商 →
                        </Link>
                    </div>

                    {/* 右侧动态列表 */}
                    <div className="lg:w-2/3 w-full">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 h-[420px] overflow-y-auto custom-scrollbar">
                            {dynLoading ? (
                            // 加载占位
                            <div className="space-y-4 p-4">
                                {[...Array(6)].map((_, i) => (
                                <div key={i} className="h-6 bg-gray-50 animate-pulse rounded"></div>
                                ))}
                            </div>
                            ) : (
                            <div className="divide-y divide-gray-50">
                                {dynamics.map((item, index) => (
                                <div 
                                    key={ index} 
                                    className="py-4 px-4 flex justify-between items-start hover:bg-gray-50 transition-colors group"
                                >
                                    <div className="flex items-start gap-3">
                                        {/* 1. 小圆点：随文字颜色加深，增加活力感 */}
                                        <span className="mt-2 w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0 group-hover:bg-blue-500 transition-colors" />
                                        <div className="text-gray-900 text-[13px] md:text-[14px] leading-relaxed font-normal">
                                            {item.event_title}
                                        </div>
                                    </div>

                                    {/* 右侧：处理后的完整日期 */}
                                    <div className="text-gray-500 text-[11px] md:text-[12px] whitespace-nowrap flex-shrink-0 font-mono ml-4 mt-0.5">
                                        {formatFullDate(item.date)}
                                    </div>
                                    
                                </div>
                                ))}
                            </div>
                            )}
                        </div>
                    </div>
                </div>
            </Container>
        </div>

        <Container className="py-12"> 
            <h2 className="text-2xl font-medium text-gray-800 mb-8 border-b pb-4">
                🔥 热门推荐：精选国际展会
            </h2>
            

              {loading && (
                  <div className="text-center py-10 text-xl text-blue-600">
                      数据加载中...
                  </div>
              )}
              
              {error && (
                  <div className="text-center py-10 text-xl text-red-600">
                      {error}
                  </div>
              )}
              
              {/* 只有加载完成且有数据时才显示网格 */}
              {!loading && exhibitions.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* 渲染请求到的展会卡片 */}
                      {exhibitions.map((exhibition) => (
                          <ExhibitionFeaturedCard key={exhibition.id} data={exhibition} />
                      ))}
                      
                  </div>
              )}
              
              {/* 加载完成但没有数据时显示 */}
              {!loading && !error && exhibitions.length === 0 && (
                  <p className="text-center py-10 text-gray-500">
                      暂无热门推荐展会数据。
                  </p>
              )}
    
        </Container>


        {/* ========================================= */}
        {/* 垂直第三部分：底部信息/次要工具 (保持不变) */}
        {/* ========================================= */}
        <div className="bg-white border-t border-gray-100">
            <Container className="py-10">
                <h2 className="text-2xl font-bold text-gray-700 mb-4">
                    为什么选择展外展？
                </h2>
                <p className="text-gray-500 max-w-3xl">
                    我们致力于连接全球贸易，提供一站式的国际展会、参展商名录和出海政策查询服务，助您高效拓展全球市场。
                </p>
            </Container>
        </div>

    </div>

  );
};

export default HomePage;
