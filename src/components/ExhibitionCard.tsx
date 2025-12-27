import React from 'react';
import { Link } from 'react-router-dom'; 
import { ExhibitionData } from '../types';
import { card2ndTitleClasses, cardClasses, cardRowClasses, cardTitleClasses } from '../styles/tailwindStyles';
import TagGroup from './TagGroup';
import InfoItem from './InfoItem';

// 辅助函数：格式化日期
const formatDate = (dateString: string | null): string => {
  if (!dateString) return '待定';
  return dateString.split('T')[0];
};


const ExhibitionCard: React.FC<{ data: ExhibitionData }> = ({ data }) => {
  const startDate = formatDate(data.fair_start_date);
  const endDate = formatDate(data.fair_end_date);

  const locationString = [data.country, data.province, data.city]
                          .filter(Boolean)
                          .join(', ')

  return (
   <div className={cardClasses}>
      
      {/* 核心布局：Logo在左，内容在右，使用 flex */}
      <div className="flex items-start"> 
        
        {/* 左侧：Logo (独占 w-20 h-20 空间，并保持 flex-shrink-0 不被压缩) */}
        {data.logo_url ? (
          <img 
            src={data.logo_url} 
            alt={`${data.fair_name} Logo`} 
            className="w-20 h-20 object-contain mr-4 rounded flex-shrink-0" // 确保 Logo 不被压缩
          />
        ) : (
           <div className="w-20 h-20 mr-4 flex items-center justify-center bg-gray-200 text-gray-500 rounded text-base font-semibold flex-shrink-0">
              LOGO
           </div>
        )}

        {/* 右侧：所有内容（标题、标签、信息项、介绍）容器 */}
        <div className="flex flex-col flex-grow min-w-0 space-y-3">
            
            {/* 1. 标题区域 */}
            <Link 
                to={`/exhibitions/${data.id}`} 
                className={cardTitleClasses}
                title={data.fair_name_trans}
            >
                {data.fair_name_trans}
            </Link>

            <div className={card2ndTitleClasses}>
                {data.fair_name}
            </div>

            {/* 2. 标签区域 */}
            <TagGroup
              tags={data.industry_field}
            />

            {/* 3. 信息项区域 1 */}
            <div className={cardRowClasses}>
              
                <InfoItem 
                    label='日期'
                    value={`${startDate} — ${endDate}`}
                />
              
                <InfoItem 
                    label='地点'
                    value={locationString}
                />

                <InfoItem 
                    label='展馆'
                    value={data.pavilion}
                />
            </div>
          
            {/* 4. 信息项区域 2 */}
            <div className={cardRowClasses}>
                <InfoItem 
                    label='主办方'
                    value={data.organizer_name}
                />
                <InfoItem 
                    label='官网'
                    value={data.website}
                />
            </div>

            {/* 5. 介绍区域 */}
            {data.intro && (
                <div className="flex text-gray-600 text-sm">
                    <span className="text-gray-400 flex-shrink-0">介绍：</span>
                    <span className="line-clamp-2 min-w-0">
                        {data.intro}
                    </span>
                </div>
            )}
            
        </div>
      </div>
    </div>
  );
};

export default ExhibitionCard