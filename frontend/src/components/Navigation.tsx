import { Link, useLocation } from 'react-router-dom';
import { Home, Plus } from 'lucide-react';

export default function Navigation() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex gap-8">
          <Link
            to="/"
            className={`py-4 px-2 font-medium border-b-2 transition-colors ${
              isActive('/') 
                ? 'border-primary-600 text-primary-600' 
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Dashboard
            </div>
          </Link>
          <Link
            to="/report"
            className={`py-4 px-2 font-medium border-b-2 transition-colors ${
              isActive('/report')
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Report Bug
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
}
