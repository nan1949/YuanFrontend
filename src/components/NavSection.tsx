import { Link } from 'react-router-dom'; // 假设使用 React Router

const NavSection = () => (
  <nav className="bg-gray-800 text-white p-4">
    <div className="w-[1200px] mx-auto flex items-center space-x-8">
      
      {/* 1. Logo 区域 */}
      <Link to="/" className="shrink-0">
          <span className="cursor-pointer">
            <span className="text-xl font-bold text-blue-400">我的Logo</span>
          </span>
      </Link>
      
      {/* 2. 导航项 */}
      <div className="flex items-center space-x-6">
          <Link 
              to="/" 
              className="text-white font-medium hover:text-blue-300 transition duration-150"
          >
              全球展会
          </Link>
          
          {/* 可以在这里添加其他导航项 */}
      </div>

    </div>
  </nav>
);

export default NavSection;