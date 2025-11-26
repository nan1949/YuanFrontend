import { Link } from 'react-router-dom'; 
import logo2 from '../assets/logo2.svg'
import UserNav from './UserNav';

const TEXT_COLOR_CLASS = "text-gray-700 font-normal hover:text-blue-600 transition duration-150";

const NavSection = () => (
  <nav className="bg-white border-b border-gray-200 p-2 sticky top-0 z-50 shadow-sm">
    <div className="container mx-auto flex items-center px-4 sm:px-6 lg:px-8">
      
        <Link to="/" className="shrink-0 flex items-center mr-10">
          <img 
              src={logo2} 
              alt="ExpoAgain Logo" 
              className="h-10 w-auto" 
          />
        </Link>
      
        <div className="flex items-center space-x-6">
          
          <Link to="/" className={TEXT_COLOR_CLASS}>首页</Link>
          
          <Link 
              to="/exhibitions" 
              className={TEXT_COLOR_CLASS}
          >
              国际展会
          </Link>

          <Link 
              to="/exhibitors" 
              className={TEXT_COLOR_CLASS}
          >
              参展企业
          </Link>
        </div>

        <div className="ml-auto">
            <UserNav /> 
        </div>

    </div>
  </nav>
);

export default NavSection;