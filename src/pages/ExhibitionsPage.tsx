import React, { useState, useEffect, useCallback  } from 'react';
import ExhibitionList from '../components/ExhibitionList';
import { ExhibitionData } from '../types';
import { getExhibitions } from '../services/exhibitionService';
import SearchBox from '../components/SearchBox';
import useTitle from '../hooks/useTitle';

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
        const response = await getExhibitions(searchTerm, currentPage, pageSize);

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


  return (

        <div className="p-4 w-[1200px] mx-auto">
            <SearchBox
              onSearch={handleSearchTermChange} 
              className="max-w-lg mb-4"
              placeholder='搜索展会...'
            />
            <ExhibitionList 
              data={exhibitions} 
              loading={loading} 
              totalCount={totalCount}
              currentPage={currentPage}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
        </div>
        
 
   
  );
};

export default ExhibitionsPage;