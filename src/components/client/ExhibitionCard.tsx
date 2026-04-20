import React from 'react';
import { Link } from 'react-router-dom'; 
import { ExhibitionData } from '../../types';
import { card2ndTitleClasses, cardClasses, cardRowClasses, cardTitleClasses } from '../../styles/tailwindStyles';
import TagGroup from './TagGroup';
import { useAuth } from '../../contexts/AuthContext';


const formatDate = (dateString: string | null): string => {
  if (!dateString) return '待定';
  return dateString.split('T')[0];
};

interface InfoItemProps {
  label: string;
  value: string;
}

const InfoItem: React.FC<InfoItemProps> = ({ label, value }) => {

  const placeholder = '—'; 
  const displayValue = value ? value : placeholder;
  const titleText = value ? value : 'N/A';

  return (
    <div className="flex items-center">

      <span className="text-gray-400 flex-shrink-0">
        {label}：
      </span>

      <span 
        className="text-gray-600 truncate" 
        title={titleText}
      >
        {displayValue}
      </span>
    </div>
  );
};


const ExhibitionCard: React.FC<{ data: ExhibitionData }> = ({ data }) => {
    const { user } = useAuth();
    const startDate = formatDate(data.fair_start_date);
    const endDate = formatDate(data.fair_end_date);

    const locationString = [data.country, data.province, data.city]
                          .filter(Boolean)
                          .join(', ')

    const isValidMember = user?.is_valid_member;

  return (
   <div className={cardClasses}>
      <div className="flex items-start"> 
        {data.logo_url ? (
          <img 
            src={data.logo_url} 
            alt={`${data.fair_name} Logo`} 
            className="w-20 h-20 object-contain mr-4 rounded flex-shrink-0" 
          />
        ) : (
           <div className="w-20 h-20 mr-4 flex items-center justify-center bg-gray-200 text-gray-500 rounded text-base font-semibold flex-shrink-0">
              LOGO
           </div>
        )}

        <div className="flex flex-col flex-grow min-w-0 space-y-3">
            
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
                <div className="flex items-center">
                    <span className="text-gray-400 flex-shrink-0">官网：</span>
                    { !isValidMember ? (
                        // 2. 已登录但非有效会员：显示模糊效果并提示升级
                        <div className="relative cursor-pointer group">
                            <span className="text-blue-300 blur-[4px] select-none text-sm">
                                https://www.exhibition-website.com
                            </span>
                            <span className="absolute left-0 -top-7 hidden group-hover:block bg-white text-gray-800 text-[11px] px-2 py-1 rounded border border-gray-200 whitespace-nowrap shadow-md z-10 font-medium">
                                仅限会员查看
                            </span>
                        </div>
                    ) : data.website ? (
                        <a 
                            href={data.website.startsWith('http') ? data.website : `https://${data.website}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline truncate max-w-[500px]"
                        >
                            {data.website}
                        </a>
                    ) : (
                        <span className="text-gray-600 truncate">暂无</span>
                    )}
                </div>
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