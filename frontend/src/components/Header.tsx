import { Link } from 'react-router-dom';
import { Bug } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Bug className="w-8 h-8 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">Bug Assistant</h1>
        </Link>
        <p className="text-sm text-gray-600">AI-Powered Bug Reproduction</p>
      </div>
    </header>
  );
}
