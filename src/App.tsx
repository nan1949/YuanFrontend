import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { Outlet } from 'react-router-dom';
import AdminExhibitions from './pages/admin/AdminExhibitions';
import AdminPavilions from './pages/admin/AdminPavilions';

import AdminLayout from './layouts/AdminLayout';
import MainLayout from './layouts/MainLayout';

import HomePage from './pages/client/HomePage';
import ExhibitionDetailPage from './pages/client/ExhibitionDetailPage';
import ExhibitionsPage from './pages/client/ExhibitionsPage';
import ExhibitorSearchPage from './pages/client/Companiespage';
import LoginPage from './pages/client/LoginPage';
import RegisterPage from './pages/client/RegisterPage';
import ProfilePage from './pages/client/ProfilePage';
import logoUrl from './assets/logo1.svg';
import { AuthProvider } from './contexts/AuthContext';
import AdminRoute from './components/admin/AdminRoute';
import AdminIndustries from './pages/admin/AdminIndustries';
import AdminOrganizers from './pages/admin/AdminOrganizers';
import AdminExhibitors from './pages/admin/AdminExhibitors';



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
                    <Route element={<MainLayout children={<Outlet />} />}>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/exhibitions" element={<ExhibitionsPage />} />
                        <Route path="/exhibitions/:id" element={<ExhibitionDetailPage />} />
                        <Route path="/exhibitors" element={<ExhibitorSearchPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                    </Route>

                    <Route element={<AdminRoute />}>
                        <Route path="/admin" element={<AdminLayout />}>
                            <Route index element={<div className="text-2xl">欢迎进入后台管理系统</div>} />
                            <Route path="exhibitions" element={<AdminExhibitions />} />
                            <Route path='pavilions' element={ <AdminPavilions /> } />
                            <Route path='industris' element={ <AdminIndustries /> } />
                            <Route path='organizers' element={ <AdminOrganizers /> } />
                            <Route path='exhibitors' element={ <AdminExhibitors /> } />
                            {/* 可以在这里继续添加 Pavilion 管理等 */}
                            <Route path="*" element={
                                <div className="p-10 text-center">
                                    <h2 className="text-2xl font-bold">404 - 后台页面不存在</h2>
                                    <p className="text-gray-500 mt-2">请检查侧边栏菜单或联系管理员。</p>
                                </div>
                            } />
                        </Route>
                    </Route>

                    <Route path="*" element={
                        <MainLayout>
                            <div className="p-20 text-center text-xl">404 - 页面未找到</div>
                        </MainLayout>
                    } />
                    
                </Routes>

        
            </AuthProvider>
        
        </Router>
    </>

  );
};

export default App;