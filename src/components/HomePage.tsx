import React, { useState, useEffect } from 'react';
import ExhibitionList from './ExhibitionList';
import { ExhibitionData } from '../types';
import { getExhibitions } from '../services/exhibitionService';
import HeaderSearch from './HeaderSearch';

const PAGE_SIZE = 10; 

interface HomePageProps {}

const HomePage: React.FC<HomePageProps> = () => {
  const [searchTerm, setSearchTerm] = useState<string | undefined>(undefined);
  const [exhibitions, setExhibitions] = useState<ExhibitionData[] | null>(null);
  const [loading, setLoading] = useState(false);

  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchExhibitions = async () => {
      setLoading(true);
      try {
        const response = await getExhibitions(searchTerm, currentPage, PAGE_SIZE);

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
  }, [searchTerm, currentPage]);

  const handleSearchTermChange = (newSearchTerm: string) => {
    setCurrentPage(1); 
    setSearchTerm(newSearchTerm);
  };

  const handlePageChange = (newPage: number) => {
      setCurrentPage(newPage);
  }


  return (
    <div>
      
      <main >
        <div className="p-8 w-[1200px] mx-auto">
            <HeaderSearch onSearch={handleSearchTermChange} className="max-w-lg"/>
            <ExhibitionList 
              data={exhibitions} 
              loading={loading} 
              totalCount={totalCount}
              currentPage={currentPage}
              pageSize={PAGE_SIZE}
              onPageChange={handlePageChange}
            />
        </div>
        
      </main>
    </div>
   
  );
};

export default HomePage;