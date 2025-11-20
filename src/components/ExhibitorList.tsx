import React from 'react';

import { ExhibitorData } from '../types'; // 假设导入展商数据类型
import PaginationControls from './PaginationControls';
import ExhibitorCard from './ExhibitorCard';
import SearchResultCount from './SearchResultCount';

interface ExhibitorListProps {
  data: ExhibitorData[] | null;
  loading: boolean;
  totalCount: number; // 总条数
  currentPage: number; // 当前页码
  pageSize: number; // 每页大小
  onPageChange: (newPage: number) => void; // 页码变更回调
  onPageSizeChange: (newSize: number) => void;
}

const ExhibitorList: React.FC<ExhibitorListProps> = ({ 
  data, 
  loading, 
  totalCount, 
  currentPage, 
  pageSize, 
  onPageChange  ,
  onPageSizeChange
}) => {
  
  // 计算总页数
  const totalPages = Math.ceil(totalCount / pageSize);

  if (loading) return <div className="p-8 text-center text-lg text-blue-600 font-medium">正在加载展商数据...</div>;

  if (!data || data.length === 0) {
    const message = totalCount === 0 
      ? "未找到任何展商信息。" 
      : "当前页没有数据，请尝试返回上一页。";
      
    return <div className="p-8 text-center text-lg text-gray-500 font-medium">{message}</div>;
  }


  return (
    <div className="bg-white shadow-xl rounded overflow-hidden border border-gray-200">
        <div className='px-4'>
          <SearchResultCount
            totalCount={totalCount}
            itemLabel='企业'
          />
        </div>
        
        
        {/* 表体 */}
        <div className="px-4 divide-y divide-gray-200">
          {data.map((exhibitor) => (
            <ExhibitorCard key={exhibitor.id} data={exhibitor} />
          ))}
        </div>
  

      {totalPages > 1 && <PaginationControls
          totalCount={totalCount}
          currentPage={currentPage}
          pageSize={pageSize}
          totalPages={totalPages}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
      />}
    </div>
  );
};

export default ExhibitorList;

