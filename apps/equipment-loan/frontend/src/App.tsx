import React, { useEffect, useState } from "react";
import { apiRequest, clearStoredToken, getStoredToken } from "./api/client";
import { ERROR_MESSAGES, UI_TEXT } from "./text/zh-TW";
import { AdminOverviewView } from "./views/AdminOverviewView";
import { EquipmentBookingView } from "./views/EquipmentBookingView";
import { LoginView } from "./views/LoginView";
import { MyReservationsView } from "./views/MyReservationsView";

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
  const [bookingTargetDate, setBookingTargetDate] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(null);
  const [restoringSession, setRestoringSession] = useState<boolean>(() =>
    Boolean(getStoredToken()),
  );
  const [loginBanner, setLoginBanner] = useState<{
    tone: "danger" | "info" | "success";
    text: string;
  } | null>(null);

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

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setRestoringSession(false);
      return;
    }

    apiRequest<AuthenticatedUser>("/auth/me")
      .then((user) => {
        setCurrentUser(user);
        setActiveView(user.role === "admin" ? "admin" : "booking");
      })
      .catch(() => {
        clearStoredToken();
        setCurrentUser(null);
        setActiveView("login");
      })
      .finally(() => {
        setRestoringSession(false);
      });
  }, []);

  const toggleTheme = (): void => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleNavigate = (target: ViewName): void => {
    if (target === "login") {
      setActiveView("login");
      return;
    }
    if (!currentUser) {
      setLoginBanner({
        tone: "danger",
        text: ERROR_MESSAGES.UNAUTHORIZED,
      });
      setActiveView("login");
      return;
    }
    setActiveView(target);
  };

  const handleLoginSuccess = (user: AuthenticatedUser): void => {
    setCurrentUser(user);
    setLoginBanner(null);
    setActiveView(user.role === "admin" ? "admin" : "booking");
  };

  const handleLogout = async (): Promise<void> => {
    try {
      await apiRequest<{ message: string }>("/auth/logout", {
        method: "POST",
      });
    } catch {
      // ignore logout error if token already expired
    }
    clearStoredToken();
    setCurrentUser(null);
    setLoginBanner({
      tone: "info",
      text: "您已安全登出工作階段，請重新輸入帳號、密碼與新的 7 位數驗證碼登入。",
    });
    setActiveView("login");
  };

  return (
    <div>
      <style>{`
        :root {
          --loan: #0284c7;
          --loan-soft: #e0f2fe;
          --returned: #0d9488;
          --returned-soft: #ccfbf1;
        }
        [data-theme="dark"] {
          --loan: #38bdf8;
          --loan-soft: #0c4a6e;
          --returned: #2dd4bf;
          --returned-soft: #134e4a;
        }
        .badge-pending { background: var(--pending-soft); color: var(--pending); }
        .badge-loan { background: var(--loan-soft); color: var(--loan); }
        .badge-returned { background: var(--returned-soft); color: var(--returned); }
        .btn-loan { background: var(--loan); border-color: var(--loan); color: #ffffff; }
        .btn-returned { background: var(--returned); border-color: var(--returned); color: #ffffff; }
        .btn-pending { background: var(--pending); border-color: var(--pending); color: #ffffff; }
      `}</style>
      <header className="site-header">
        <div className="inner">
          <button
            type="button"
            className="brand"
            onClick={() => handleNavigate(currentUser ? "booking" : "login")}
          >
            <span className="brand-mark">EL</span>
            {UI_TEXT.brandTitle}
          </button>

          <nav className="site-nav" aria-label="主要導覽">
            <button
              type="button"
              className="nav-tab"
              aria-current={activeView === "login" ? "page" : undefined}
              onClick={() => handleNavigate("login")}
              data-testid="nav-login"
            >
              {UI_TEXT.nav.login}
            </button>
            <button
              type="button"
              className="nav-tab"
              aria-current={activeView === "booking" ? "page" : undefined}
              onClick={() => handleNavigate("booking")}
              data-testid="nav-booking"
            >
              {UI_TEXT.nav.booking}
            </button>
            <button
              type="button"
              className="nav-tab"
              aria-current={activeView === "my-reservations" ? "page" : undefined}
              onClick={() => handleNavigate("my-reservations")}
              data-testid="nav-my-reservations"
            >
              {UI_TEXT.nav.myReservations}
            </button>
            <button
              type="button"
              className="nav-tab"
              aria-current={activeView === "admin" ? "page" : undefined}
              onClick={() => handleNavigate("admin")}
              data-testid="nav-admin"
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
              <button
                type="button"
                className="btn-logout"
                onClick={() => void handleLogout()}
                data-testid="logout-btn"
              >
                {UI_TEXT.nav.logout}
              </button>
            )}
          </div>
        </div>
      </header>

      <main>
        {restoringSession ? (
          <div className="card" style={{ padding: "24px", color: "var(--muted)" }}>
            正在驗證工作階段…
          </div>
        ) : activeView === "login" || !currentUser ? (
          <LoginView bannerMessage={loginBanner} onLoginSuccess={handleLoginSuccess} />
        ) : activeView === "my-reservations" ? (
          <MyReservationsView
            onGoToBooking={(targetDate) => {
              if (targetDate) {
                setBookingTargetDate(targetDate);
              }
              setActiveView("booking");
            }}
          />
        ) : activeView === "admin" ? (
          <AdminOverviewView
            currentUser={currentUser}
            onGoToBooking={() => setActiveView("booking")}
            onSwitchAccount={() => void handleLogout()}
          />
        ) : (
          <EquipmentBookingView
            currentUser={currentUser}
            initialDate={bookingTargetDate}
            onGoToMyReservations={() => setActiveView("my-reservations")}
          />
        )}
      </main>
    </div>
  );
}
