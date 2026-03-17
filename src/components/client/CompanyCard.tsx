import React, {useMemo} from 'react';
import { Link } from 'react-router-dom';
import { ExhibitorData } from '../../types'; 
import { card2ndTitleClasses, cardClasses, cardRowClasses, cardTitleClasses } from '../../styles/tailwindStyles';
import TagGroup from '../TagGroup';

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


const CompanyCard: React.FC<{ data: ExhibitorData }> = ({ data }) => {

    const locationString = [data.country, data.province, data.city].filter(Boolean).join(', ') || '—';
  
    const detailPath = `/exhibitors/${data.id}`;

    const mainTitle = data.company_name || data.exhibitor_name || '未知企业';
    const showSubTitle = 
        data.company_name && 
        data.exhibitor_name && 
        data.company_name.trim() !== data.exhibitor_name.trim();

    const recentFairInfo = useMemo(() => {
        if (!data.fair_name) return null;
        // 格式化日期：只取 YYYY-MM-DD
        const datePart = data.fair_start_date ? data.fair_start_date.split('T')[0] : '';
        return `${datePart} ${data.fair_name}`;
    }, [data.fair_name, data.fair_start_date]);

    const uniqueTargetCountries = useMemo(() => {
        if (!data || !data.target_countries || data.target_countries.length === 0) {
            return [];
        }
        const uniqueCountries = [...new Set(data.target_countries)];
        
        return uniqueCountries;
    }, [data.target_countries]); // 关键：依赖于 expo_info 数组的变化
  
  return (

    <div className={cardClasses}>
      
            <Link 
                to={detailPath} 
                className={cardTitleClasses}
                title={mainTitle}
            >
                {mainTitle}
            </Link>

            {showSubTitle && (
                <div className={card2ndTitleClasses}>
                    {data.exhibitor_name}
                </div>
            )}

            <TagGroup
                tags={uniqueTargetCountries}
                limit={10}
            />

            {recentFairInfo && (
                <div className="mt-2 mb-1 flex items-center text-sm">
                    <span className="px-2 py-0.5 bg-orange-50 text-orange-600 rounded text-xs mr-2 font-medium border border-orange-100 shrink-0">
                        近期参展
                    </span>
                    <span className="text-gray-500 truncate italic">
                        {recentFairInfo}
                    </span>
                </div>
            )}

            <div className={cardRowClasses}>
                <InfoItem 
                    label='所在地'
                    value={locationString}
                />
            </div>

            <div className={cardRowClasses}>
          
                <InfoItem 
                    label='官网'
                    value={data.website}
                />
                
            </div>

            {data.intro && (
            <div className="flex text-gray-600 text-sm">
     
                <span className="text-gray-400 flex-shrink-0">介绍：</span>
                <span className="line-clamp-2 min-w-0">
                    {data.intro}
                </span>
            </div>
            )}
   
    </div>
  );
};

export default CompanyCard