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
  
  // 确保 industry_field 是数组，并进行空值处理
  const industryFields = (data.industry_field || []).join(' / ');
  
  return (
    // 将整个卡片包装在 Link 中，实现点击整个卡片跳转
    <Link 
        to={`/exhibitions/${data.id}`} 
        className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition duration-300 flex flex-col justify-between transform hover:-translate-y-0.5"
    >
      <div className="flex flex-col">
        
        {/* 头部区域：Logo 和标题 */}
        <div className="flex items-start mb-4">
          
          {/* 左侧：Logo (w-20 h-20) */}
          {data.logo_url ? (
            <img 
              src={data.logo_url} 
              alt={`${data.fair_name} Logo`} 
              className="w-20 h-20 object-contain mr-4 rounded" 
            />
          ) : (
             <div className="w-20 h-20 mr-4 flex items-center justify-center bg-gray-200 text-gray-500 rounded text-base font-semibold">
                LOGO
             </div>
          )}

          {/* 右侧：标题 (双行展示) */}
          <div className="flex-grow min-w-0 pt-1">
            {/* 主标题：中文名 */}
            <h3 className="text-xl font-semibold text-gray-800 leading-snug truncate">
              {data.fair_name}
            </h3>
            {/* 副标题：英文名 */}
            <p className="text-sm text-gray-500 truncate mt-1" title={data.fair_name_trans}>
              {data.fair_name_trans}
            </p>
          </div>
        </div>
        
        {/* 关键信息展示区域 (移除分割线 1) */}
        <div className="mb-4 pt-2"> 
          
          {/* 时间 */}
          <p className="text-sm text-gray-700 mb-1 flex items-center">
            <span className="mr-2 text-blue-500">📅</span>
            {startDate} - {endDate}
          </p>
          
          {/* 地点 */}
          <p className="text-sm text-gray-700 mb-1 flex items-center">
            <span className="mr-2 text-blue-500">📍</span>
            {location}
          </p>
          
          {/* 行业 */}
          <p className="text-sm text-gray-700 truncate flex items-center"> 
            <span className="mr-2 text-blue-500">🏷️</span>
            {industryFields || '暂无行业信息'}
          </p>
        </div>

      </div>

      {/* 底部提示：整个卡片可点击 (移除分割线 2) */}
      <div className="text-right text-sm text-blue-600 mt-auto hover:text-blue-800 pt-2">
        查看详情 &rarr;
      </div>
    </Link>
  );
};

export default ExhibitionFeaturedCard;