import React from 'react';
import { Link, Outlet } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* 侧边栏 */}
      <aside className="w-64 bg-slate-800 text-white p-6">
        <h2 className="text-2xl font-bold mb-8">管理后台</h2>
        <nav className="space-y-4">
          <Link to="/admin/exhibitions" className="block hover:text-blue-400">展会管理</Link>
          <Link to="/admin/organizers" className="block hover:text-blue-400">主办方管理</Link>
          <Link to="/admin/pavilions" className="block hover:text-blue-400">展馆管理</Link>
        </nav>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 p-8">
        <Outlet /> {/* 这里渲染具体的管理表格 */}
      </main>
    </div>
  );
};

export default AdminDashboard;