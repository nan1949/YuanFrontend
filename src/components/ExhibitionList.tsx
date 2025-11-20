import React from 'react';
import { ExhibitionData } from '../types';
import ExhibitionCard from './ExhibitionCard';
import PaginationControls from './PaginationControls';
import SearchResultCount from './SearchResultCount'


interface ExhibitionListProps {
  data: ExhibitionData[] | null;
  loading: boolean;
  totalCount: number; // 总条数
  currentPage: number; // 当前页码
  pageSize: number; // 每页大小
  onPageChange: (newPage: number) => void; // 页码变更回调
  onPageSizeChange: (newSize: number) => void;
}


const ExhibitionList: React.FC<ExhibitionListProps> = ({ 
  data, 
  loading, 
  totalCount, 
  currentPage, 
  pageSize, 
  onPageChange,
  onPageSizeChange
}) => {
  const totalPages = Math.ceil(totalCount / pageSize);

  if (loading) return <div className="p-8 text-center">正在加载展会数据...</div>;

  if (!data || data.length === 0) {
    // 区分是无结果还是搜索到 0 条
    const message = totalCount === 0 
      ? "未找到任何展会。" 
      : "当前页没有数据，请尝试返回上一页。";
      
    return <div className="p-8 text-center">{message}</div>;
  }

  return (

      <div className="bg-white shadow-xl rounded overflow-hidden border border-gray-200">
        
        <div className='px-4'>
          <SearchResultCount 
            totalCount={totalCount}
            itemLabel='展会'
          />
        </div>
        

       <div className="px-4 divide-y divide-gray-200">
          
            {data.map((expo) => (
              <ExhibitionCard key={expo.id} data={expo} />
            ))}
        </div>
        
        {totalPages > 1 && <PaginationControls 
            totalCount={totalCount}
            currentPage={currentPage}
            pageSize={pageSize}
            totalPages={totalPages}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
        />
        }
        

      </div>

  );
};

export default ExhibitionList;