import React from 'react';

interface PaginationControlsProps {
  totalCount: number; // 总条数
  currentPage: number; // 当前页码
  pageSize: number; // 每页大小
  totalPages: number; // 总页数
  baseUrl: string; // 分页基础路径
  searchQuery?: string; // 搜索关键词
  defaultPageSize?: number; // 默认每页大小
  pageSizeOptions?: number[]; // 可选的每页展示条数选项
}

// 默认的每页展示选项
const defaultPageSizeOptions = [10, 20, 50];
const MAX_VISIBLE_PAGE_BUTTONS = 5;

const PaginationControls: React.FC<PaginationControlsProps> = ({
  totalCount,
  currentPage,
  pageSize,
  totalPages,
  baseUrl,
  searchQuery = '',
  defaultPageSize = defaultPageSizeOptions[0],
  pageSizeOptions = defaultPageSizeOptions,
}) => {
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;
  // 当总页数小于等于 1 时，不显示分页控件
  const showPagination = totalPages > 1;
  const normalizedSearchQuery = searchQuery.trim();

  const buildHref = (nextPage: number, nextPageSize: number = pageSize) => {
    const params = new URLSearchParams();

    if (normalizedSearchQuery) {
      params.set('q', normalizedSearchQuery);
    }

    if (nextPage > 1) {
      params.set('page', String(nextPage));
    }

    if (nextPageSize !== defaultPageSize) {
      params.set('pageSize', String(nextPageSize));
    }

    const queryString = params.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  };

  const visiblePages = (() => {
    if (totalPages <= MAX_VISIBLE_PAGE_BUTTONS + 2) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const pages = new Set<number>([1, totalPages, currentPage]);

    for (let offset = 1; pages.size < MAX_VISIBLE_PAGE_BUTTONS; offset += 1) {
      const prevPage = currentPage - offset;
      const nextPage = currentPage + offset;

      if (prevPage > 1) {
        pages.add(prevPage);
      }

      if (pages.size >= MAX_VISIBLE_PAGE_BUTTONS) {
        break;
      }

      if (nextPage < totalPages) {
        pages.add(nextPage);
      }

      if (prevPage <= 1 && nextPage >= totalPages) {
        break;
      }
    }

    return Array.from(pages).sort((a, b) => a - b);
  })();

  if (totalCount === 0) return null; // 如果总数为 0，不显示任何东西

  return (
    
      <div className="flex items-center space-x-6 p-4 bg-white border-t border-gray-200">
      
        {/* 仅在需要分页时显示每页条数选择 */}
        {showPagination && (
          <div className="relative text-sm text-gray-700">
            <details className="group">
              <summary className="list-none cursor-pointer rounded border border-gray-300 bg-white px-3 py-1 text-sm transition-colors hover:border-blue-400 hover:text-blue-600">
                {`${pageSize} 条 / 每页`}
              </summary>

              <div className="absolute left-0 top-full z-10 mt-2 min-w-full overflow-hidden rounded border border-gray-200 bg-white shadow-lg">
                {pageSizeOptions.map((size) => {
                  const isActive = size === pageSize;

                  return (
                    <a
                      key={`option-${size}`}
                      href={buildHref(1, size)}
                      aria-current={isActive ? 'page' : undefined}
                      className={`block whitespace-nowrap px-3 py-2 transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                      }`}
                    >
                      {`${size} 条 / 每页`}
                    </a>
                  );
                })}
              </div>
            </details>
          </div>
        )}

        {showPagination && (
          <div className="flex items-center space-x-2">
            <a
              href={isFirstPage ? undefined : buildHref(currentPage - 1)}
              aria-disabled={isFirstPage}
              className={`px-3 py-1 text-sm font-normal rounded transition-colors ${
                isFirstPage 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              上一页
            </a>

            <div className="flex items-center space-x-2">
              {visiblePages.map((page, index) => {
                const previousPage = visiblePages[index - 1];
                const showEllipsis = previousPage && page - previousPage > 1;
                const isActive = page === currentPage;

                return (
                  <React.Fragment key={`page-fragment-${page}`}>
                    {showEllipsis && <span className="px-1 text-sm text-gray-400">...</span>}
                    <a
                      href={buildHref(page)}
                      aria-current={isActive ? 'page' : undefined}
                      className={`min-w-9 rounded px-3 py-1 text-center text-sm font-normal transition-colors ${
                        isActive
                          ? 'bg-blue-500 text-white'
                          : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                      }`}
                    >
                      {page}
                    </a>
                  </React.Fragment>
                );
              })}
            </div>

            <a
              href={isLastPage || totalPages === 0 ? undefined : buildHref(currentPage + 1)}
              aria-disabled={isLastPage || totalPages === 0}
              className={`px-3 py-1 text-sm font-normal rounded transition-colors ${
                isLastPage || totalPages === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              下一页
            </a>
          </div>
        )}
      </div>
  
  );
};

export default PaginationControls;
