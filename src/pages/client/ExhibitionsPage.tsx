import React, { useState, useEffect, useCallback  } from 'react';
import SearchResultCount from '../../components/SearchResultCount';
import ExhibitionCard from '../../components/ExhibitionCard';
import PaginationControls from '../../components/PaginationControls';
import { ExhibitionData } from '../../types';
import { getExhibitions } from '../../services/exhibitionService';
import SearchBox from '../../components/SearchBox';
import useTitle from '../../hooks/useTitle';
import Container from '../../components/Container';

const INITIAL_PAGE_SIZE = 10; 

interface ExhibitionsPageProps {}

const ExhibitionsPage: React.FC<ExhibitionsPageProps> = () => {

  useTitle('国际展会搜索-展外展')

  const [searchTerm, setSearchTerm] = useState<string | undefined>(undefined);
  const [exhibitions, setExhibitions] = useState<ExhibitionData[] | null>(null);
  const [loading, setLoading] = useState(false);

  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(INITIAL_PAGE_SIZE); 


  useEffect(() => {
    const fetchExhibitions = async () => {
      setLoading(true);
      try {
        const response = await getExhibitions({
          search_name: searchTerm, 
          page: currentPage, 
          size: pageSize

        });

        setExhibitions(response.results);
        setTotalCount(response.total_count);
      } catch (e) {
         console.error("Fetch error:", e);
         setExhibitions(null);
         setTotalCount(0); // 出现错误时，总数清零
      } finally {
        setLoading(false);
      }
    };

    fetchExhibitions();
  }, [searchTerm, currentPage, pageSize]);

  const handleSearchTermChange = useCallback((newSearchTerm: string) => {
    setCurrentPage(1); 
    setSearchTerm(newSearchTerm);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
      setCurrentPage(newPage);
  }, []);

  const handlePageSizeChange = useCallback((newSize: number) => {
      setPageSize(newSize);
      setCurrentPage(1); // 切换每页条数后，页码重置为第一页
  }, []);

  const totalPages = Math.ceil(totalCount / pageSize);

  if (loading) {
    return (
      <Container>
        <div className="flex justify-center pt-8 pb-4">
            <SearchBox onSearch={handleSearchTermChange} className="max-w-lg w-full" placeholder='搜索展会...'/>
        </div>
        <div className="p-8 text-center bg-white shadow-md rounded mt-4">正在加载展会数据...</div>
      </Container>
    );
  }

  if (!exhibitions || exhibitions.length === 0) {
    const message = totalCount === 0 
      ? "未找到任何展会。" 
      : "当前页没有数据，请尝试返回上一页。";
      
    return (
      <Container>
        <div className="flex justify-center pt-8 pb-4">
            <SearchBox onSearch={handleSearchTermChange} className="max-w-lg w-full" placeholder='搜索展会...'/>
        </div>
        <div className="p-8 text-center bg-white shadow-md rounded mt-4">
          {message}
        </div>
      </Container>
    );
  }


  return (

      <Container>
          <div className="flex justify-center pt-8 pb-4">
              <SearchBox
                onSearch={handleSearchTermChange} 
                // 保持最大宽度 max-w-lg
                className="max-w-lg w-full" 
                placeholder='搜索展会...'
              />
          </div>
          <div className="bg-white shadow-xl rounded overflow-hidden border border-gray-200">
            
            {/* 搜索结果总数 */}
            <div className='px-4 pt-4'>
              <SearchResultCount 
                totalCount={totalCount}
                itemLabel='展会'
              />
            </div>
            

           {/* 展会卡片列表 */}
           <div className="px-4 divide-y divide-gray-200">
              
                {exhibitions.map((expo) => (
                  <ExhibitionCard key={expo.id} data={expo} />
                ))}
            </div>
            
            {/* 分页控制 */}
            {totalPages > 1 && <PaginationControls 
                totalCount={totalCount}
                currentPage={currentPage}
                pageSize={pageSize}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
            />
            }
          </div>
      </Container>
            
  );
};

export default ExhibitionsPage;