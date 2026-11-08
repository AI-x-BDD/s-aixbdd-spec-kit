import React, { useEffect, useState } from "react";
import { UI_TEXT } from "./text/zh-TW";

export type ViewName = "login" | "booking" | "my-reservations" | "admin";

export interface AuthenticatedUser {
  id: string;
  username: string;
  displayName: string;
  role: "member" | "admin";
}

export function App(): React.ReactElement {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    try {
      return window.localStorage.getItem("el-theme") === "dark" ? "dark" : "light";
    } catch {
      return "light";
    }
  });
  const [activeView, setActiveView] = useState<ViewName>("login");
  const [currentUser] = useState<AuthenticatedUser | null>(null);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    try {
      window.localStorage.setItem("el-theme", theme);
    } catch {
      // ignore storage errors
    }
  }, [theme]);

  const toggleTheme = (): void => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <div>
      <header className="site-header">
        <div className="inner">
          <button
            type="button"
            className="brand"
            onClick={() => setActiveView(currentUser ? "booking" : "login")}
          >
            <span className="brand-mark">EL</span>
            {UI_TEXT.brandTitle}
          </button>

          <nav className="site-nav" aria-label="主要導覽">
            <button
              type="button"
              className="nav-tab"
              aria-current={activeView === "login" ? "page" : undefined}
              onClick={() => setActiveView("login")}
            >
              {UI_TEXT.nav.login}
            </button>
            <button
              type="button"
              className="nav-tab"
              aria-current={activeView === "booking" ? "page" : undefined}
              onClick={() => setActiveView("booking")}
            >
              {UI_TEXT.nav.booking}
            </button>
            <button
              type="button"
              className="nav-tab"
              aria-current={activeView === "my-reservations" ? "page" : undefined}
              onClick={() => setActiveView("my-reservations")}
            >
              {UI_TEXT.nav.myReservations}
            </button>
            <button
              type="button"
              className="nav-tab"
              aria-current={activeView === "admin" ? "page" : undefined}
              onClick={() => setActiveView("admin")}
            >
              {UI_TEXT.nav.admin}
            </button>
          </nav>

          <div className="header-actions">
            <span className="user-pill" data-testid="header-user">
              {currentUser
                ? `${currentUser.displayName}（${UI_TEXT.roles[currentUser.role]}）`
                : UI_TEXT.roles.guest}
            </span>
            <button
              type="button"
              className="btn-theme"
              onClick={toggleTheme}
              aria-label="切換深淺色主題"
              data-testid="theme-toggle"
            >
              {theme === "dark" ? UI_TEXT.nav.lightMode : UI_TEXT.nav.darkMode}
            </button>
            {currentUser && (
              <button type="button" className="btn-logout" data-testid="logout-btn">
                {UI_TEXT.nav.logout}
              </button>
            )}
          </div>
        </div>
      </header>

      <main>
        <div className="card" style={{ padding: "24px" }}>
          <h1>{UI_TEXT.brandTitle}</h1>
          <p className="page-lead">目前視圖：{activeView}</p>
        </div>
      </main>
    </div>
  );
}
