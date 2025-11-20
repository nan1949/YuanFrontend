import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import HomePage from './pages/HomePage';
import FooterSection from './components/FooterSection';
import NavSection from './components/NavSection';
import ExhibitionDetailPage from './pages/ExhibitionDetailPage';
import ExhibitionsPage from './pages/ExhibitionsPage';
import ExhibitorSearchPage from './pages/ExhibitorSearchPage';
import logoUrl from './assets/logo1.svg';

console.log("Logo URL:", logoUrl);

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <>
            <NavSection />
                <main className="flex-1 bg-gray-50 min-h-[calc(100vh-120px)]">
                    {children}
                </main>
            <FooterSection />
        </>
    );
};


const App: React.FC = () => {
    useEffect(() => {
        const link = document.createElement('link');
        
        link.rel = 'icon';
        link.type = 'image/svg+xml';
        link.href = logoUrl; // 变量 logoUrl 已经包含了 Data URI

        // 2. 移除所有旧的或默认的 favicon 链接
        const existingLinks = document.querySelectorAll('link[rel*="icon"]');
        existingLinks.forEach(oldLink => {
            document.head.removeChild(oldLink);
        });

        // 3. 将新的 SVG Favicon 链接添加到 head 中
        document.head.appendChild(link);
        
    }, []); // 仅在组件首次挂载时执行

  return (
    <>
        <Router>
            <Routes>
                <Route 
                    path="/" 
                    element={
                        <Layout>
                            <HomePage />
                        </Layout>
                    } 
                />
                <Route 
                    path="/exhibitions" 
                    element={
                        <Layout>
                            <ExhibitionsPage />
                        </Layout>
                    } 
                />
                <Route 
                    path="/exhibitions/:id" 
                    element={
                        <Layout>
                            <ExhibitionDetailPage />
                        </Layout>
                    } 
                />
                <Route 
                    path="/exhibitors" 
                    element={
                        <Layout>
                            <ExhibitorSearchPage />
                        </Layout>
                    } 
                />

                <Route path="*" element={
                    <Layout>
                        <div className="p-20 text-center text-xl">404 - 页面未找到</div>
                    </Layout>
                } />
                
            </Routes>
        </Router>
    </>

  );
};

export default App;