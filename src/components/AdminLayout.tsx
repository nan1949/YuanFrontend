import React from 'react';
import { Link, Outlet } from 'react-router-dom';

const AdminLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Admin 侧边栏 */}
      <aside className="w-64 bg-slate-900 text-white flex-shrink-0">
        <div className="p-6 text-xl font-bold border-b border-slate-800">
          GlobalFair Admin
        </div>
        <nav className="mt-6">
          <Link to="/admin/exhibitions" className="block px-6 py-3 hover:bg-slate-800">展会管理</Link>
          <Link to="/admin/organizers" className="block px-6 py-3 hover:bg-slate-800">主办方管理</Link>
          <Link to="/admin/pavilions" className="block px-6 py-3 hover:bg-slate-800">展馆管理</Link>
          <div className="border-t border-slate-800 mt-4 pt-4">
            <Link to="/" className="block px-6 py-3 text-slate-400 hover:text-white">← 返回前台</Link>
          </div>
        </nav>
      </aside>

      {/* Admin 内容区 */}
      <main className="flex-1 overflow-x-hidden">
        <header className="bg-white shadow-sm p-4 flex justify-end">
            <span className="text-sm text-gray-500">管理员已登录</span>
        </header>
        <div className="p-8">
          <Outlet /> {/* 子路由内容（如 AdminExhibitions）将渲染在这里 */}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;