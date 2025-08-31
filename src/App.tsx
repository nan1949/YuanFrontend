import React from 'react';
import Header from './Header'; 
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import PendingReviews from './components/PendingReviews';
import HomePageSection from './components/HomePageSection';
import ExhibitionList from './components/ExhibitionList'; // 导入展会列表
import OrganizerList from './components/OrganizerList'; // 导入主办方列表
import './App.css';

function App() {
  return (
    // <div className="App">
    //   {/* 在这里使用你的 Header 组件 */}
    //   <Header />

    //   {/* 页面主体内容 */}
    //   <main id="main" className="pt-10">
    //     <HomePageSection />
    //     {/* 展会与主办方列表容器 */}
    //   <section className="flex justify-center mt-8">
    //     <div className="w-[1200px] flex">
    //       <ExhibitionList />
    //       <OrganizerList />
    //     </div>
    //   </section>
    //   </main>
    // </div>
       <Router>
            <nav>
                <Link to="/">首页</Link>
                <Link to="/pending-reviews">待审核列表</Link>
            </nav>
            <Routes>
                {/* <Route path="/" element={<Home />} /> */}
                <Route path="/pending-reviews" element={<PendingReviews />} />
            </Routes>
        </Router>
  );
}

export default App;