import React from 'react';

interface PaginationControlsProps {
  totalCount: number; // 总条数
  currentPage: number; // 当前页码
  pageSize: number; // 每页大小
  totalPages: number; // 总页数
  onPageChange: (newPage: number) => void; // 页码变更回调
  onPageSizeChange: (newSize: number) => void; // 每页条数变更回调
  pageSizeOptions?: number[]; // 可选的每页展示条数选项
}

// 默认的每页展示选项
const defaultPageSizeOptions = [10, 20, 50];

const PaginationControls: React.FC<PaginationControlsProps> = ({
  totalCount,
  currentPage,
  pageSize,
  totalPages,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = defaultPageSizeOptions,
}) => {
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;
  // 当总页数小于等于 1 时，不显示分页控件
  const showPagination = totalPages > 1;

  if (totalCount === 0) return null; // 如果总数为 0，不显示任何东西

  return (
    
      <div className="flex items-center space-x-6 p-4 bg-white border-t border-gray-200">
      
        {/* 仅在需要分页时显示每页条数选择 */}
        {showPagination && (
          <div className="flex items-center space-x-2 text-sm text-gray-700">
            <select
              id="pageSizeSelect"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="mt-1 px-2 py-1 border border-gray-300 rounded bg-white focus:ring-blue-500 focus:border-blue-500 transition duration-150"
            >
              {pageSizeOptions.map((size) => (
                <option key={`option-${size}`} value={size}>
                  {`${size} 条 / 每页`}
                </option>
              ))}
            </select>
            
          </div>
        )}

        {showPagination && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={isFirstPage}
              className={`px-3 py-1 text-sm font-normal rounded transition-colors ${
                isFirstPage 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              上一页
            </button>
            
            <span className="text-sm text-gray-700">
              第 <span >{currentPage}</span> / <span >{totalPages}</span> 页
            </span>
            
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={isLastPage || totalPages === 0}
              className={`px-3 py-1 text-sm font-normal rounded transition-colors ${
                isLastPage || totalPages === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              下一页
            </button>
          </div>
        )}
      </div>
  
  );
};

export default PaginationControls;