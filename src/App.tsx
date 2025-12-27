import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import HomePage from './pages/HomePage';
import FooterSection from './components/FooterSection';
import NavSection from './components/NavSection';
import ExhibitionDetailPage from './pages/ExhibitionDetailPage';
import ExhibitionsPage from './pages/ExhibitionsPage';
import ExhibitorSearchPage from './pages/Companiespage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import logoUrl from './assets/logo1.svg';
import { AuthProvider } from './contexts/AuthContext';


const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <>
            <NavSection />
            <main className="flex-1 pb-10 bg-gray-50 min-h-[calc(100vh-120px)]">
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
            <AuthProvider>
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

                    <Route 
                        path="/login" 
                        element={
                            <Layout>
                                <LoginPage />
                            </Layout>
                        } 
                    />

                    <Route 
                        path="/register" 
                        element={
                            <Layout>
                                <RegisterPage />
                            </Layout>
                        } 
                    />

                    <Route path="*" element={
                        <Layout>
                            <div className="p-20 text-center text-xl">404 - 页面未找到</div>
                        </Layout>
                    } />
                    
                </Routes>
            </AuthProvider>
        
        </Router>
    </>

  );
};

export default App;