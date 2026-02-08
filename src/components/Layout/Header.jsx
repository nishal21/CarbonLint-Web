import { NavLink } from 'react-router-dom';
import { Leaf, LayoutDashboard, FileText, History, GitCompare, Settings, Lightbulb, GitBranch } from 'lucide-react';

export default function Header() {
    const navItems = [
        { to: '/', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/history', label: 'History', icon: History },
        { to: '/compare', label: 'Compare', icon: GitCompare },
        { to: '/suggestions', label: 'Suggestions', icon: Lightbulb },
        { to: '/cicd', label: 'CI/CD', icon: GitBranch },
        { to: '/settings', label: 'Settings', icon: Settings },
    ];

    return (
        <header className="header">
            <div className="header-logo">
                <div className="logo-icon">
                    <Leaf size={24} />
                </div>
                <span className="logo-text">CarbonLint</span>
            </div>
            <nav className="header-nav">
                {navItems.map(({ to, label, icon: Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                        <Icon size={16} style={{ flexShrink: 0 }} />
                        <span>{label}</span>
                    </NavLink>
                ))}
            </nav>
        </header>
    );
}
