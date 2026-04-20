import React, { useState, useEffect, useCallback } from 'react';
import SearchResultCount from '../../components/client/SearchResultCount';
import CompanyCard from '../../components/client/CompanyCard';
import { searchExhibitors } from '../../services/exhibitorService'; 
import { searchCompanies } from '../../services/companyService';
import SearchBox from '../../components/client/SearchBox';
import useTitle from '../../hooks/useTitle';
import Container from '../../components/client/Container';
import PaginationControls from '../../components/client/PaginationControls';


const INITIAL_PAGE_SIZE = 10; 

type SearchType = 'company' | 'exhibitor';


const ExhibitorSearchPage: React.FC = () => {

  useTitle('企业查询_参展记录搜索-展外展')

  const [searchType, setSearchType] = useState<SearchType>('company');
  const [searchTerm, setSearchTerm] = useState<string | undefined>(undefined);

  const [companyResults, setCompanyResults] = useState<any[] | null>(null);
  const [exhibitorResults, setExhibitorResults] = useState<any[] | null>(null);
  const [companyTotal, setCompanyTotal] = useState(0);
  const [exhibitorTotal, setExhibitorTotal] = useState(0);

  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(INITIAL_PAGE_SIZE); 


  useEffect(() => {
      const fetchCountsAndActiveData = async () => {
        setLoading(true);
        try {
          // 1. 定义两个并发请求
          const companyReq = searchCompanies({
            search_name: searchTerm,
            page: searchType === 'company' ? currentPage : 1,
            page_size: searchType === 'company' ? pageSize : 1 // 非激活标签只查1条拿total
          });

          const exhibitorReq = searchExhibitors({
            search_name: searchTerm,
            page: searchType === 'exhibitor' ? currentPage : 1,
            page_size: searchType === 'exhibitor' ? pageSize : 1
          });

          // 2. 并发执行
          const [companyRes, exhibitorRes] = await Promise.all([companyReq, exhibitorReq]);

          // 3. 更新总数 (始终更新)
          setCompanyTotal(companyRes.total);
          setExhibitorTotal(exhibitorRes.total_count);

          // 4. 更新当前展示的数据
          if (searchType === 'company') {
            setCompanyResults(companyRes.data);
            setExhibitorResults(null); // 清空另一侧，防止渲染混乱
          } else {
            setExhibitorResults(exhibitorRes.data);
            setCompanyResults(null);
          }
        } catch (e) {
          console.error("Search failed:", e);
        } finally {
          setLoading(false);
        }
    };

    fetchCountsAndActiveData();
  }, [searchTerm, currentPage, pageSize, searchType]);


  const currentResults = searchType === 'company' ? companyResults : exhibitorResults;
  const currentTotal = searchType === 'company' ? companyTotal : exhibitorTotal;
  const totalPages = Math.ceil(currentTotal / pageSize);

  const handleTypeChange = (type: SearchType) => {
    setSearchType(type);
    setCurrentPage(1); // 切换类型时重置页码
  };

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


  const searchSection = () => (
    <div className="pt-8 pb-4">
      <div className="flex justify-center mb-4">
            <SearchBox 
                onSearch={handleSearchTermChange} 
                className="max-w-lg w-full"
                placeholder={searchType === 'company' ? "输入公司名、曾用名、简介..." : "输入展商名、展会名..."}
            />
      </div>
      <div className="flex justify-center mb-4">
        <div className="inline-flex p-1 bg-gray-100 rounded-lg shadow-inner">
          <button
            onClick={() => handleTypeChange('company')}
            className={`flex items-center gap-2 px-6 py-2 text-sm font-medium rounded-md transition-all ${
              searchType === 'company' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'
            }`}
          >
            <span>找公司</span>
            <span className={`px-1.5 py-0.5 rounded-full text-xs ${
              searchType === 'company' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'
            }`}>
              {companyTotal}
            </span>
          </button>
          
          <button
            onClick={() => handleTypeChange('exhibitor')}
            className={`flex items-center gap-2 px-6 py-2 text-sm font-medium rounded-md transition-all ${
              searchType === 'exhibitor' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'
            }`}
          >
            <span>找展商 (参展记录)</span>
            <span className={`px-1.5 py-0.5 rounded-full text-xs ${
              searchType === 'exhibitor' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'
            }`}>
              {exhibitorTotal}
            </span>
          </button>
        </div>
      </div>
      
    </div>
  );

  
  return (

      <Container>
          {searchSection()}
          {loading ? (
            <div className="p-8 text-center text-blue-600 bg-white shadow-md rounded mt-4">正在努力加载中...</div>
          ) : (!currentResults || currentResults.length === 0) ? (
            <div className="p-8 text-center text-gray-500 bg-white shadow-md rounded mt-4">
              未找到相关{searchType === 'company' ? '公司' : '展商'}信息。
            </div>
          ) : (
            <div className="bg-white shadow-xl rounded overflow-hidden border border-gray-200">
              
              {/* 搜索结果总数 */}
              <div className='px-4 pt-4'>
                <SearchResultCount
                  totalCount={currentTotal}
                  itemLabel={searchType === 'company' ? '家企业' : '条参展记录'}
                />
              </div>
              
              <div className="px-4 divide-y divide-gray-200">
                {currentResults.map((item) => (
                  <CompanyCard key={item.id} data={item} />
                ))}
              </div>
              
              {totalPages > 1 && <PaginationControls
                  totalCount={currentTotal}
                  currentPage={currentPage}
                  pageSize={pageSize}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
              />}
            </div>
          )}
      </Container>    

    );
};

export default ExhibitorSearchPage;