import React from 'react';
import { Link } from 'react-router-dom'; 
import { ExhibitionData } from '../types';

const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  return dateString.split('T')[0];
};

interface ExhibitionListProps {
  data: ExhibitionData[] | null;
  loading: boolean;
  totalCount: number; // 总条数
  currentPage: number; // 当前页码
  pageSize: number; // 每页大小
  onPageChange: (newPage: number) => void; // 页码变更回调
}


const ExhibitionList: React.FC<ExhibitionListProps> = ({ data, loading, totalCount, currentPage, pageSize, onPageChange  }) => {
  const totalPages = Math.ceil(totalCount / pageSize);

  if (loading) return <div className="p-8 text-center">正在加载展会数据...</div>;

  if (!data || data.length === 0) {
    // 区分是无结果还是搜索到 0 条
    const message = totalCount === 0 
      ? "未找到任何展会。" 
      : "当前页没有数据，请尝试返回上一页。";
      
    return <div className="p-8 text-center">{message}</div>;
  }

  // 分页控件
  const PaginationControls = () => {
    const isFirstPage = currentPage === 1;
    const isLastPage = currentPage === totalPages;

    return (
      <div className="flex justify-between items-center mt-4 p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
        <div className="text-sm text-gray-600">
          共找到 <span className="font-bold text-blue-600">{totalCount}</span> 条展会信息。
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={isFirstPage}
            className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
              isFirstPage 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            上一页
          </button>
          
          <span className="text-sm text-gray-700">
            第 <span className="font-bold">{currentPage}</span> / <span className="font-bold">{totalPages}</span> 页
          </span>
          
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={isLastPage || totalPages === 0}
            className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
              isLastPage || totalPages === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            下一页
          </button>
        </div>
      </div>
    );
  };

  return (

      <div className="bg-white shadow-xl rounded-lg overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          
          {/* 表头 */}
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-1/4">展会名称 / 行业标签</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-1/6">日期</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-1/6">地点 / 展馆</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-1/6">主办方</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-1/12">官网</th>
            </tr>
          </thead>
          
          {/* 表体 */}
          <tbody className="divide-y divide-gray-200">
            {data.map((expo) => (
              <ExhibitionRow key={expo.id} data={expo} />
            ))}
          </tbody>
        </table>

        {totalPages > 1 && <PaginationControls />}

      </div>

  );
};

const ExhibitionRow: React.FC<{ data: ExhibitionData }> = ({ data }) => {
  const startDate = formatDate(data.fair_start_date);
  const endDate = formatDate(data.fair_end_date);
  
  const industryFields = Array.isArray(data.industry_field) ? data.industry_field : [];

  return (
    <tr className="hover:bg-gray-50 transition-colors duration-150">
      
      {/* 展会名称 / 行业标签 */}
      <td className="p-4 align-top">
        <Link 
            to={`/exhibitions/${data.id}`} 
            className="font-bold text-blue-600 hover:text-blue-800 leading-tight transition-colors duration-150"
        >
          {data.fair_name_trans}
        </Link>
        <div className="text-xs text-gray-500 italic mb-2">
          {data.fair_name}
        </div>
        <div className="flex flex-wrap gap-1">
          {industryFields.slice(0, 3).map((tag) => (
            <span 
              key={tag} 
              className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-md"
              title={tag}
            >
              {tag}
            </span>
          ))}
          {/* 如果标签过多，只显示前三个，保持紧凑 */}
          {industryFields.length > 3 && (
              <span className="text-xs text-gray-500 py-0.5">+{industryFields.length - 3}</span>
          )}
        </div>
      </td>

      {/* 日期 */}
      <td className="p-4 text-sm text-gray-700 align-top">
        <div className="flex items-center">
          <span className="text-xs text-gray-500 w-8 inline-block mr-1">从:</span>
          <span className="font-medium text-gray-800">{startDate}</span>
        </div>
        
        {/* 2. 结束日期 */}
        <div className="flex items-center mt-1">
          <span className="text-xs text-gray-500 w-8 inline-block mr-1">到:</span>
          <span className="font-medium text-gray-800">{endDate}</span>
        </div>
      </td>
      
      {/* 地点 / 展馆 */}
      <td className="p-4 text-sm text-gray-700 align-top">
        <div className="font-medium  truncate">
          {
            [data.country, data.province, data.city]
              .filter(Boolean) // 过滤掉 null, undefined, 或空字符串
              .join(', ')     // 用逗号和空格连接剩下的元素
          }
        </div>
        <div className="text-xs text-gray-500 truncate" title={data.pavilion}>
          {data.pavilion}
        </div>
      </td>

      {/* 主办方 */}
      <td className="p-4 text-sm text-gray-700 align-top">
        <div className="" title={data.organizer_name}>
          {data.organizer_name}
        </div>
      </td>

      {/* 官网 */}
      <td className="p-4 text-sm text-center align-top max-w-[150px] sm:max-w-[200px]">
        {data.website ? (
          <a 
            href={data.website} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap overflow-hidden text-ellipsis block"
            title={data.website} // 悬停时显示完整链接
          >
            {/* 移除 http/https/www，使链接更简洁，例如: example.com/page */}
            {data.website.replace(/https?:\/\//, '')}
          </a>
        ) : (
          <span className="text-gray-400">—</span> // 处理链接为空的情况
        )}
      </td>
    </tr>
  );
};

export default ExhibitionList;