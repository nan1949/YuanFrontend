import React from 'react';
import useTitle from '../hooks/useTitle';


interface HomePageProps {}

const HomePage: React.FC<HomePageProps> = () => {

  useTitle('展外展-找国际展会_找出海展商_找出海政策_出海企业查询系统');

  return (
    
    <main className="flex-1 py-10 bg-gray-50 min-h-[calc(100vh-120px)]"> 

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 w-[1200px]">
        
        <h1 className="text-3xl font-bold text-gray-900 mb-8 border-b pb-4">
          首页 (推荐展会或概览)
        </h1>
        
        <div className="p-10 text-center text-lg text-gray-500 bg-white rounded-lg shadow-md">
          欢迎来到首页！请通过导航栏查看“全球展会”或“全球展商”信息。
        </div>

      </div>
    </main>
  );
};

export default HomePage;