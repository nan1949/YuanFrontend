import React, { useState, useEffect, useCallback } from 'react';
import ExhibitorList from '../components/ExhibitorList'; 
import { ExhibitorData } from '../types'; 
import { getExhibitors } from '../services/exhibitorService'; 
import SearchBox from '../components/SearchBox';
import useTitle from '../hooks/useTitle';
import Container from '../components/Container';

const INITIAL_PAGE_SIZE = 10; 

interface ExhibitorSearchPageProps {}

const ExhibitorSearchPage: React.FC<ExhibitorSearchPageProps> = () => {

  useTitle('参展企业_出海展商搜索-展外展')

  const [searchTerm, setSearchTerm] = useState<string | undefined>(undefined);

  const [exhibitors, setExhibitors] = useState<ExhibitorData[] | null>(null);

  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(INITIAL_PAGE_SIZE); 


  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);


  useEffect(() => {
    const fetchExhibitors = async () => {
      setLoading(true);
      try {
  
        const response = await getExhibitors(searchTerm, currentPage, pageSize);
        setExhibitors(response.results);
        setTotalCount(response.total_count);
      } catch (e) {
         console.error("Fetch exhibitor error:", e);
         setExhibitors(null);
         setTotalCount(0); 
      } finally {
        setLoading(false);
      }
    };

    fetchExhibitors();
  }, [searchTerm, currentPage]); // 依赖项：当搜索词或页码变化时重新获取数据

  // 处理搜索栏输入变化
  const handleSearchTermChange = (newSearchTerm: string) => {
    // 搜索时，重置回第一页
    setCurrentPage(1); 
    setSearchTerm(newSearchTerm);
  };

  // 处理分页按钮点击
  const handlePageChange = (newPage: number) => {
      setCurrentPage(newPage);
  }

    const handlePageSizeChange = useCallback((newSize: number) => {
        setPageSize(newSize);
        setCurrentPage(1); // 切换每页条数后，页码重置为第一页
    }, []);

  return (

      <Container>
          <SearchBox 
              onSearch={handleSearchTermChange} 
              className="max-w-lg mb-4"
              placeholder="搜索展商..." // 可以添加更明确的提示
          />
          
          {/* 展商列表组件，传入状态数据和回调函数 */}
          <ExhibitorList 
            data={exhibitors} 
            loading={loading} 
            totalCount={totalCount}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
      </Container>    

  );
};

export default ExhibitorSearchPage;