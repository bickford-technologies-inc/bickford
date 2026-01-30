import React from "react";
import Link from "next/link";

interface NavItem {
  label: string;
  view: string;
  icon: string;
}
interface ModuleNavItem {
  label: string;
  id: string;
  icon: string;
}
interface SidebarProps {
  navItems: NavItem[];
  moduleNav: ModuleNavItem[];
  integrationNav: ModuleNavItem[];
  activeView: string;
  navigate: (view: string) => void;
  openModulePanel: (id: string) => void;
  navRefs: React.MutableRefObject<any[]>;
  moduleNavRefs: React.MutableRefObject<any[]>;
  integrationNavRefs: React.MutableRefObject<any[]>;
  handleSidebarKeyDown: (
    e: React.KeyboardEvent,
    idx: number,
    section: string,
  ) => void;
  showToast: (msg: string, type?: string) => void;
}

export function Sidebar({
  navItems,
  moduleNav,
  integrationNav,
  activeView,
  navigate,
  openModulePanel,
  navRefs,
  moduleNavRefs,
  integrationNavRefs,
  handleSidebarKeyDown,
  showToast,
}: SidebarProps) {
  return (
    <nav className="sidebar" aria-label="Main sidebar navigation">
      {navItems.map((item, i) => (
        <div
          key={item.label}
          className={`nav-item${activeView === item.view ? " active" : ""}`}
          onClick={() => navigate(item.view)}
          data-view={item.view}
          tabIndex={0}
          ref={(el) => {
            navRefs.current[i] = el;
          }}
          role="button"
          aria-current={activeView === item.view ? "page" : undefined}
          aria-label={item.label}
          onKeyDown={(e) => handleSidebarKeyDown(e, i, "nav")}
          style={{
            outline: activeView === item.view ? "2px solid #001F3F" : undefined,
          }}
        >
          {item.icon} {item.label}
        </div>
      ))}
      <div className="nav-section">
        <div className="nav-section-title">Modules</div>
        {moduleNav.map((item, i) => (
          <div
            key={item.id}
            className="nav-item"
            onClick={() => openModulePanel(item.id)}
            tabIndex={0}
            ref={(el) => {
              moduleNavRefs.current[i] = el;
            }}
            role="button"
            aria-label={item.label}
            onKeyDown={(e) => handleSidebarKeyDown(e, i, "module")}
          >
            {item.icon} {item.label}
          </div>
        ))}
      </div>
      <div className="nav-section">
        <div className="nav-section-title">Integrations</div>
        {integrationNav.map((item, i) => (
          <div
            key={item.id}
            className="nav-item"
            onClick={() => openModulePanel(item.id)}
            tabIndex={0}
            ref={(el) => {
              integrationNavRefs.current[i] = el;
            }}
            role="button"
            aria-label={item.label}
            onKeyDown={(e) => handleSidebarKeyDown(e, i, "integration")}
          >
            {item.icon} {item.label}
          </div>
        ))}
      </div>
      <div className="user-section">
        <div
          className="user-info"
          onClick={() => showToast("Profile settings coming soon!", "info")}
        >
          <div className="user-info-avatar">DB</div>
          <div>
            <div className="user-info-text">Derek Bickford</div>
            <div className="user-info-role">Administration</div>
          </div>
        </div>
      </div>
      <nav>
        <Link href="/verify">External Verifier</Link>
      </nav>
    </nav>
  );
}
