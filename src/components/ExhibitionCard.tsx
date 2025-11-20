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

            <TagGroup
              tags={data.industry_field}
            />

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

export default ExhibitionCard