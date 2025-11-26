import React from 'react';
import { Link } from 'react-router-dom';
import { ExhibitionData } from '../types';


interface ExhibitionFeaturedCardProps {
  data: ExhibitionData;
}

const ExhibitionFeaturedCard: React.FC<ExhibitionFeaturedCardProps> = ({ data }) => {
  // 格式化日期，只取年月日
  const startDate = data.fair_start_date.split('T')[0];
  const endDate = data.fair_end_date.split('T')[0];
  
  // 拼接地点信息
  const location = `${data.city || data.province || ''}, ${data.country}`;

  const industryFields = (data.industry_field || []).join(' / ');

  const truncatedIntro = data.intro ? data.intro.substring(0, 100) + '...' : '暂无简介';

  return (
    <Link 
        to={`/exhibitions/${data.id}`} 
        className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition duration-300 flex flex-col justify-between transform hover:-translate-y-0.5"
    >
        <div className="flex flex-col">
            
            <div className="flex items-start mb-4" >
                {data.logo_url ? (
                    <img 
                    src={data.logo_url} 
                    alt={`${data.fair_name} Logo`} 
                    className="w-16 h-16 object-contain mr-4 rounded"
                    />
                ) : (
                    <div className="w-16 h-16 mr-4 flex items-center justify-center bg-gray-200 text-gray-500 rounded text-sm font-semibold">
                        LOGO
                    </div>
                )}

                {/* 右侧：名称 */}
                <div className="flex-grow min-w-0">
                    {/* 主标题：中文名 (更突出) */}
                    <h3 className="text-xl font-semibold text-gray-800 leading-snug truncate">
                    {data.fair_name}
                    </h3>
                    {/* 副标题：英文名 (较小，浅色) */}
                    <p className="text-sm text-gray-500 truncate mt-1" title={data.fair_name_trans}>
                    {data.fair_name_trans}
                    </p>
                </div>
            </div>
                
            <div className="mb-4">
            
            {/* 时间 */}
            <p className="text-sm text-gray-500 mb-1">
                <span className="font-medium text-gray-600">📆 时间：</span>
                {startDate} - {endDate}
            </p>
            
            {/* 地点 */}
            <p className="text-sm text-gray-500 mb-1">
                <span className="font-medium text-gray-600">📍 地点：</span>
                {location}
            </p>
            
            {/* 行业 */}
            <p className="text-sm text-gray-500 truncate"> 
                <span className="font-medium text-gray-600">🏷️ 行业：</span>
                {industryFields || '暂无信息'}
            </p>
            </div>

            {/* 展会简介 (截断显示) */}
            <p className="text-gray-600 line-clamp-2 text-sm flex-grow mb-4">
            {truncatedIntro} 
            </p>
      </div>

      {/* 底部提示：整个卡片可点击 */}
      <div className="text-right text-blue-600 font-medium mt-auto hover:text-blue-800">
        查看详情 &rarr;
      </div>
       
    </Link>
  );
};

export default ExhibitionFeaturedCard;