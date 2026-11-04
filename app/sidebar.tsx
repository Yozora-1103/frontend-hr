"use client";

import { useState, type AnchorHTMLAttributes } from "react";

type IconName = "home" | "bell" | "gift" | "users" | "history" | "chart" | "file" | "menu" | "logout" | "close";

function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, React.ReactNode> = {
    home: <><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M9 21V9h6v12M3 9h18" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
    gift: <><path d="M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 1 1 2.5-2.5C10 6 12 7 12 7ZM12 7h4.5A2.5 2.5 0 1 0 14 4.5C14 6 12 7 12 7Z" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    history: <><path d="M3 12a9 9 0 1 0 2.6-6.4L3 8M3 3v5h5M12 7v5l3 2" /></>,
    chart: <><path d="M3 3v18h18M8 16v-4M13 16V7M18 16v-7" /></>,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M12 18v-6M9 15h6" /></>,
    menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
    logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></>,
    close: <><path d="m18 6-12 12M6 6l12 12" /></>,
  };
  return <svg className="sidebar-icon" viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
}

interface NavItem {
  id: string;
  label: string;
  icon: IconName;
  badge?: number;
  href?: string;
}

interface SidebarProps {
  activeId: string;
  notificationCount: number;
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
  onNavigate: (label: string) => void;
}

export function Sidebar({
  activeId,
  notificationCount,
  collapsed,
  mobileOpen,
  onToggleCollapse,
  onCloseMobile,
  onNavigate,
}: SidebarProps) {
  const [active, setActive] = useState(activeId);
  const items: NavItem[] = [
    { id: "home", label: "หน้าแรก Home", icon: "home", href: "/home" },
    { id: "notifications", label: "แจ้งเตือน", icon: "bell", badge: notificationCount },
    { id: "benefits", label: "จัดการสวัสดิการ", icon: "gift", href: "/benefits" },
    { id: "employees", label: "จัดการพนักงานและสิทธิ์", icon: "users", href: "/employees" },
    { id: "reports", label: "รายงานและสถิติ", icon: "chart", href: "/reports" },
    { id: "logs", label: "ประวัติการแก้ไข Log", icon: "history" },
    { id: "requests", label: "ส่งคำขอสวัสดิการ", icon: "file" },
  ];

  function handleNavigate(item: NavItem) {
    setActive(item.id);
    onNavigate(item.label);
    onCloseMobile();
  }

  return (
    <>
      {mobileOpen ? <button className="sidebar-overlay" onClick={onCloseMobile} aria-label="ปิดเมนู" /> : null}
      <aside className={`sidebar${collapsed ? " is-collapsed" : ""}${mobileOpen ? " is-open" : ""}`} id="app-sidebar">
        <div className="sidebar-brand">
          <button
            type="button"
            onClick={onToggleCollapse}
            className="sidebar-toggle"
            aria-label={collapsed ? "ขยายเมนู" : "ย่อเมนู"}
            aria-expanded={!collapsed}
            aria-controls="app-sidebar"
          >
            <Icon name="menu" />
          </button>
          <div className="brand-copy">
            <strong>ระบบพนักงานและสวัสดิการ</strong>
            <span>HR</span>
          </div>
          <button type="button" onClick={onCloseMobile} className="sidebar-close" aria-label="ปิดเมนู">
            <Icon name="close" />
          </button>
        </div>

        <p className="sidebar-section-label">HR</p>
        <nav className="sidebar-nav" aria-label="เมนูหลัก">
          {items.map((item) => {
            const selected = active === item.id;
            const content = (
              <>
                <span className="sidebar-item-icon">
                  <Icon name={item.icon} />
                  {item.badge ? <span className="collapsed-badge" /> : null}
                </span>
                <span className="sidebar-item-label">{item.label}</span>
                {item.badge ? <span className="sidebar-badge">{item.badge}</span> : null}
              </>
            );
            const itemProps: AnchorHTMLAttributes<HTMLAnchorElement> = {
              className: `sidebar-item${selected ? " active" : ""}`,
              title: collapsed ? item.label : undefined,
              "aria-current": selected ? "page" : undefined,
              onClick: (event) => {
                if (!item.href) event.preventDefault();
                handleNavigate(item);
              },
            };
            return item.href ? (
              <a key={item.id} href={item.href} {...itemProps}>{content}</a>
            ) : (
              <a key={item.id} href="#" {...itemProps}>{content}</a>
            );
          })}
        </nav>

        <div className="sidebar-spacer" />
        <button type="button" className="sidebar-logout" onClick={() => onNavigate("ออกจากระบบ")} title={collapsed ? "ออกจากระบบ" : undefined}>
          <Icon name="logout" />
          <span className="sidebar-item-label">ออกจากระบบ</span>
        </button>
      </aside>
    </>
  );
}
