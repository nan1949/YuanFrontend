import React, {useMemo} from 'react';
import { Link } from 'react-router-dom';
import { ExhibitorData } from '../types'; 
import { card2ndTitleClasses, cardClasses, cardRowClasses, cardTitleClasses } from '../styles/tailwindStyles';
import TagGroup from './TagGroup';
import InfoItem from './InfoItem';
import InfoItemMultiValue from './InfoItemMultiValue';


const ExhibitorCard: React.FC<{ data: ExhibitorData }> = ({ data }) => {

    const locationString = [data.country, data.province, data.city].filter(Boolean).join(', ') || '—';
  
    const detailPath = `/exhibitors/${data.id}`;

    const uniqueTargetCountries = useMemo(() => {
        if (!data || !data.expo_info || data.expo_info.length === 0) {
            return [];
        }
        const allCountries = data.expo_info
            .map(expo => expo.country)
            .filter(country => country && country.trim().length > 0);

        const uniqueCountries = [...new Set(allCountries)];
        
        return uniqueCountries;
    }, [data.expo_info]); // 关键：依赖于 expo_info 数组的变化
  
  return (

    <div className={cardClasses}>
      
            <Link 
                to={detailPath} 
                className={cardTitleClasses}
                title={data.company_name}
            >
                {data.company_name}
            </Link>

            <div className={card2ndTitleClasses}>
                {data.exhibitor_name}
            </div>

            <TagGroup
                tags={data.category}
                limit={10}
            />

            <TagGroup
                tags={uniqueTargetCountries}
                limit={10}
            />

            <div className={cardRowClasses}>
                <InfoItem 
                    label='所在地'
                    value={locationString}
                />
                <InfoItem 
                    label='法定代表人'
                    value={data.legal_person}
                />
                <InfoItem 
                    label='注册资本'
                    value={data.registered_capital}
                />
                <InfoItem 
                    label='成立日期'
                    value={data.register_date}
                />
            </div>

            <div className={cardRowClasses}>
                <InfoItemMultiValue 
                    label='手机'
                    values={data.phone}
                />

                <InfoItemMultiValue 
                    label='邮箱'
                    values={data.email}
                />

                <InfoItemMultiValue 
                    label='官网'
                    values={data.website}
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

export default ExhibitorCard