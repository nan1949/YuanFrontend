import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import UserNav from '../components/UserNav';
import { 
  AppstoreOutlined, 
  GlobalOutlined, 
  UsergroupAddOutlined, 
  BankOutlined, 
  ClusterOutlined 
} from '@ant-design/icons'; // 引入图标增强视觉


const AdminLayout: React.FC = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/admin/exhibitions', name: '展会管理', icon: <AppstoreOutlined /> },
    { path: '/admin/organizers', name: '主办方管理', icon: <GlobalOutlined /> },
    { path: '/admin/exhibitors', name: '展商管理', icon: <UsergroupAddOutlined /> },
    { path: '/admin/pavilions', name: '展馆管理', icon: <BankOutlined /> },
    { path: '/admin/industris', name: '行业分类', icon: <ClusterOutlined /> },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Admin 侧边栏 */}
      <aside className="w-56 bg-slate-900 text-white flex-shrink-0 shadow-xl">
        <div className="p-6 text-xl font-bold border-b border-slate-800 flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-sm">G</div>
          GlobalFair Admin
        </div>

        <nav className="mt-4 px-3">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path}
                to={item.path} 
                className={`
                  flex items-center gap-3 px-4 py-3 my-1 rounded-lg transition-all duration-200
                  ${isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50 translate-x-1' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}
                `}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Admin 内容区 */}
      <main className="flex-1 overflow-x-hidden flex flex-col">
        {/* 顶部 Header - 移除了“当前页面”文字 */}
        <header className="bg-white shadow-sm h-16 flex justify-end items-center px-8 border-b border-gray-200">
            <UserNav />
        </header>

        {/* 内容展示区 */}
        <section className="flex-1 p-8 overflow-y-auto bg-[#f8fafc]">
            <Outlet />
        </section>
      </main>
    </div>
  );
};

export default AdminLayout;