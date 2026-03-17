import React, { useState, useEffect, useCallback } from 'react';
import SearchResultCount from '../../components/SearchResultCount';
import CompanyCard from '../../components/client/CompanyCard';
import { ExhibitorData } from '../../types'; 
import { searchExhibitors } from '../../services/exhibitorService'; 
import SearchBox from '../../components/SearchBox';
import useTitle from '../../hooks/useTitle';
import Container from '../../components/Container';
import PaginationControls from '../../components/PaginationControls';


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
  
        const response = await searchExhibitors({
          search_name:searchTerm, 
          page: currentPage, 
          page_size: pageSize
        });
        setExhibitors(response.data);
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
  }, [searchTerm, currentPage, pageSize]);

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

  const totalPages = Math.ceil(totalCount / pageSize);

  const searchBox = (
    <div className="flex justify-center pt-8 pb-4">
        <SearchBox 
            onSearch={handleSearchTermChange} 
            className="max-w-lg w-full"
            placeholder="搜索展商..."
        />
    </div>
  );

  if (loading) {
    return (
      <Container>
        {searchBox}
        <div className="p-8 text-center text-lg text-blue-600 font-medium bg-white shadow-md rounded mt-4">正在加载展商数据...</div>
      </Container>
    );
  }

  // 3. 空数据/无结果状态
  if (!exhibitors || exhibitors.length === 0) {
    const message = totalCount === 0 
      ? "未找到任何展商信息。" 
      : "当前页没有数据，请尝试返回上一页。";
      
    return (
      <Container>
        {searchBox}
        <div className="p-8 text-center text-lg text-gray-500 font-medium bg-white shadow-md rounded mt-4">
          {message}
        </div>
      </Container>
    );
  }

  return (

      <Container>
          {searchBox}
          
          {/* 🚀 原 ExhibitorList 的内容结构 */}
          <div className="bg-white shadow-xl rounded overflow-hidden border border-gray-200">
            
            {/* 搜索结果总数 */}
            <div className='px-4 pt-4'>
              <SearchResultCount
                totalCount={totalCount}
                itemLabel='企业'
              />
            </div>
            
            
            {/* 展商卡片列表 */}
            <div className="px-4 divide-y divide-gray-200">
              {exhibitors.map((exhibitor) => (
                <CompanyCard key={exhibitor.id} data={exhibitor} />
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
            />}
          </div>
      </Container>    

  );
};

export default ExhibitorSearchPage;