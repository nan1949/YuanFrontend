import React, {useMemo} from 'react';
import { Link } from 'react-router-dom';
import {  cardClasses, cardTitleClasses } from '../../styles/tailwindStyles';
import TagGroup from './TagGroup';
import { InfoCircleOutlined } from '@ant-design/icons'; 
import { Tooltip } from 'antd'; 


interface CompanyCardProps {
  data: {
    id: string;
    company_name: string;
    company_name_trans?: string;
    country?: string;
    province?: string;
    city?: string;
    website?: string;
    exhibitor_count?: number;
    exhibitor_countries?: string[]; // 已通过 ES Pipeline 拆分为数组
    introduction?: string;
  };
}


const CompanyCard: React.FC<CompanyCardProps> = ({ data }) => {

    const locationString = useMemo(() => {
        const parts = [data.country, data.province, data.city].filter(Boolean);
        return parts.length > 0 ? parts.join(' · ') : '—';
    }, [data.country, data.province, data.city]);
  
    const detailPath = `/companies/${data.id}`;
  
  return (
    <div className={`${cardClasses} hover:bg-gray-50 transition-colors py-4`}>
      <div className="flex flex-wrap items-start justify-between gap-x-4">
        <div className="flex-1 min-w-[300px]">
          {/* 企业名称 */}
          <Link 
            to={detailPath} 
            className={`${cardTitleClasses} block truncate hover:text-blue-600`}
            title={data.company_name}
          >
            {data.company_name || '未知企业'}
          </Link>

          {/* 企业英文名 */}
          {data.company_name_trans && (
            <div className="text-sm text-gray-400 mt-0.5 truncate italic">
              {data.company_name_trans}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 mt-1 sm:mt-0">
            {/* 足迹标签：紧跟在次数前面，节省纵向空间 */}
            {data.exhibitor_countries && data.exhibitor_countries.length > 0 && (
                <div className="flex items-center">
                <span className="text-[11px] text-gray-400 mr-2 shrink-0">足迹:</span>
                <TagGroup
                    tags={data.exhibitor_countries}
                    limit={3} // 列表页仅展示核心的前3个，避免撑开高度
                />
                </div>
            )}
            
            {/* 累计参展次数 */}
            <div className="flex items-center px-2 py-1 bg-blue-50 rounded border border-blue-100 shrink-0">
                <span className="text-blue-400 text-[11px] mr-1.5 font-medium">累计参展</span>
                <span className="text-blue-600 font-bold text-base leading-none mr-1">
                    {data.exhibitor_count || 0}
                </span>

                <Tooltip title="注：该数值仅基于本站收录的展会数据统计，可能与企业实际参展次数存在偏差。" placement="topRight"
                    color="white" // 设置气泡背景为白色
                    overlayInnerStyle={{ color: '#000', fontSize: '14px' }} // 强制内部文字为黑色
                >
                    <InfoCircleOutlined className="text-gray-400 text-sm hover:text-gray-600 transition-colors ml-1" />
                </Tooltip>
            </div>
           
        </div>
      </div>

      {/* 核心字段：所在地 & 官网 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 mt-4 mb-3">
        <div className="flex items-center text-sm">
          <span className="text-gray-400 flex-shrink-0">所在地：</span>
          <span className="text-gray-600 truncate">{locationString}</span>
        </div>
        <div className="flex items-center text-sm">
          <span className="text-gray-400 flex-shrink-0">官网：</span>
          {data.website ? (
            <a 
              href={data.website.startsWith('http') ? data.website : `http://${data.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline truncate"
            >
              {data.website.replace(/^https?:\/\//, '')}
            </a>
          ) : (
            <span className="text-gray-300">—</span>
          )}
        </div>
      </div>

      {/* 企业简介 */}
      {data.introduction && (
        <div className="mt-3 flex text-sm border-t border-gray-50 pt-2">
          <span className="text-gray-400 flex-shrink-0">简介：</span>
          <span className="text-gray-500 line-clamp-2 leading-relaxed">
            {data.introduction}
          </span>
        </div>
      )}
    </div>
    
  );
};

export default CompanyCard