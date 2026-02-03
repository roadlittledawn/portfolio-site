import { useContext } from 'react';
import { AuthContext } from './AuthProvider';

interface NavItem {
  href: string;
  label: string;
}

const navItems: NavItem[] = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/profile', label: 'Profile' },
  { href: '/admin/experiences', label: 'Experiences' },
  { href: '/admin/skills', label: 'Skills' },
  { href: '/admin/projects', label: 'Projects' },
  { href: '/admin/education', label: 'Education' },
  { href: '/admin/job-agent', label: 'Job Agent' },
];

export default function AdminNav() {
  const auth = useContext(AuthContext);
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

  const isActive = (href: string) => {
    if (href === '/admin') {
      return currentPath === '/admin' || currentPath === '/admin/';
    }
    return currentPath.startsWith(href);
  };

  if (!auth?.isAuthenticated) {
    return null;
  }

  return (
    <nav className="flex items-center gap-6">
      {navItems.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className={`text-sm font-medium transition-colors ${
            isActive(item.href)
              ? 'text-accent-blue'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          {item.label}
        </a>
      ))}

      <div className="flex items-center gap-4 ml-6 pl-6 border-l border-dark-border">
        <span className="text-sm text-text-secondary">
          {auth.user?.username}
        </span>
        <button
          onClick={() => auth.logout()}
          className="text-sm text-text-secondary hover:text-red-400 transition-colors"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
