import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/', label: 'Overview', icon: '◆', end: true },
  { to: '/captains', label: 'Captains', icon: '☰' },
  { to: '/live-map', label: 'Live map', icon: '◎' },
  { to: '/rides', label: 'Rides', icon: '▤' },
  { to: '/riders', label: 'Riders', icon: '◍' },
  { to: '/coupons', label: 'Coupons', icon: '◈' },
  { to: '/billing', label: 'Billing', icon: '▥' },
];

const PAGE_TITLES = {
  '/': 'Overview',
  '/captains': 'Captain approvals',
  '/live-map': 'Live fleet map',
  '/rides': 'Ride logs',
  '/riders': 'Riders',
  '/coupons': 'Coupons',
  '/billing': 'Commission & billing',
};

function titleForPath(pathname) {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  const base = '/' + pathname.split('/')[1];
  return PAGE_TITLES[base] || 'Dispatch';
}

export default function Layout() {
  const { admin, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">🛵</div>
          <div>
            <div className="brand-name">Dispatch</div>
            <div className="brand-sub">Fleet control</div>
          </div>
        </div>

        <nav className="nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          Signed in as<br />
          <strong style={{ color: '#e8e6de' }}>{admin?.username}</strong>
          <br />
          <button className="logout-btn" onClick={logout}>Log out</button>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <h1>{titleForPath(location.pathname)}</h1>
          <div className="topbar-meta">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </header>
        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
