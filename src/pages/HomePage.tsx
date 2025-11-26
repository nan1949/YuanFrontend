import React, { useState, useEffect, useCallback } from 'react';
import useTitle from '../hooks/useTitle';
import Container from '../components/Container';
import { Link } from 'react-router-dom'; 
import { ExhibitionData } from '../types';
import ExhibitionFeaturedCard from '../components/ExhibitionFeaturedCard';
import { getExhibitions } from '../services/exhibitionService';

const DISPLAY_COUNT = 6;


interface HomePageProps {}

const HomePage: React.FC<HomePageProps> = () => {

  useTitle('展外展-找国际展会_找出海展商_找出海政策_出海企业查询系统');

  const [exhibitions, setExhibitions] = useState<ExhibitionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTopExhibitions = useCallback(async () => {
    setLoading(true);
    setError(null); // 重置错误状态
    try {
      // 关键修改: 只请求第 1 页，大小为 DISPLAY_COUNT (3)
      const response = await getExhibitions(null, 1, DISPLAY_COUNT); 
      
      setExhibitions(response.results.slice(0, DISPLAY_COUNT)); // 确保最多只显示 3 条

    } catch (err) {
      console.error("加载展会数据失败:", err);
      setError('无法加载热门展会数据，请稍后重试。');
      setExhibitions([]);
    } finally {
      setLoading(false);
    }
  }, []); // 依赖项为空数组，只在组件挂载时执行一次

  useEffect(() => {
    fetchTopExhibitions();
  }, [fetchTopExhibitions]);


  return (
    
    <div className="flex flex-col">
        
        <section 
            // 使用 bg-gray-900 (深灰/接近黑) 代替背景图的深色蒙层
            className="relative bg-gradient-to-b from-blue-700 to-blue-500 flex justify-center items-center py-10 lg:py-16" 
        >
            <Container className="text-white relative z-10">
                <div className="flex flex-col items-center w-full text-center">
                    
                    {/* 左侧：核心介绍文字 */}
                    <div className="flex flex-col text-white px-2 items-center">
                        
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-medium leading-tight">
                            <div className="my-4 text-center">
                                展商名录 Exhibitor Catalogue
                            </div>
                        </h1>

                        <h2 className="font-light text-xl sm:text-2xl leading-relaxed opacity-90 mb-6 max-w-4xl">
                            展外展展馆数字参展商平台
                        </h2>
                        
                        {/* 核心价值点列表 */}
                        <div className="my-4 py-0 pl-6 border-l-4 border-blue-300 text-lg leading-relaxed max-w-xl text-left mx-auto">
                            <p className="my-2">查看参展商信息、产品与服务。</p>
                            <p className="my-2">查找现场位置、虚拟展位和商业机会。</p>
                            <p className="my-2">联系我们，充分利用平台资源。</p>
                        </div>
                        
                        {/* 示例CTA按钮 */}
                         <div className="mt-10">
                            <Link 
                                to="/exhibitors" 
                                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-lg text-blue-800 bg-white hover:bg-blue-50 transition duration-150"
                            >
                                立即搜索参展商
                            </Link>
                        </div>
                    </div>
                        
                </div>
            </Container>
        </section>

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