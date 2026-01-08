import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import UserNav from '../components/UserNav';

const AdminLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Admin 侧边栏 */}
      <aside className="w-52 bg-slate-900 text-white flex-shrink-0">
        <div className="p-6 text-xl font-bold border-b border-slate-800">
          GlobalFair Admin
        </div>
        <nav className="mt-6">
          <Link to="/admin/exhibitions" className="block px-6 py-3 hover:bg-slate-800">展会管理</Link>
          <Link to="/admin/organizers" className="block px-6 py-3 hover:bg-slate-800">主办方管理</Link>
          <Link to="/admin/exhibitors" className="block px-6 py-3 hover:bg-slate-800">展商管理</Link>
          <Link to="/admin/pavilions" className="block px-6 py-3 hover:bg-slate-800">展馆管理</Link>
          <Link to="/admin/industris" className="block px-6 py-3 hover:bg-slate-800">行业分类管理</Link>
        </nav>
      </aside>

      {/* Admin 内容区 */}
      <main className="flex-1 overflow-x-hidden flex flex-col">
        <header className="bg-white shadow-sm p-4 flex justify-between items-center px-8">
            <div className="text-gray-400 text-sm">控制台 / 当前页面</div>
            {/* 替换原有的文本，直接使用通用的 UserNav */}
            <UserNav />
        </header>

        <section className="flex-1 p-8 overflow-y-auto">
            <Outlet />
        </section>
      </main>
    </div>
  );
};

export default AdminLayout;