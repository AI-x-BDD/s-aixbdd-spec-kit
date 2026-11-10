import React, { useEffect, useState } from "react";
import { apiRequest, clearStoredToken, getStoredToken } from "./api/client";
import { UI_TEXT } from "./text/zh-TW";
import { AdminOverviewView } from "./views/AdminOverviewView";
import { EquipmentBookingView } from "./views/EquipmentBookingView";
import { LoginView } from "./views/LoginView";
import { MyReservationsView } from "./views/MyReservationsView";

export type ViewName = "login" | "booking" | "my-reservations" | "equipment-status" | "admin";

/** 未登入時開啟受保護頁面的提示（ui/plan.md §5 未登入存取受保護頁面）。 */
const LOGIN_REQUIRED_MESSAGE =
  "請先登入，才能查看設備預約、我的預約、設備狀態管理或審核與借用管理。";

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
  // 「查看受影響的預約」切到審核與借用管理時，全體預約篩選預設為「已取消」（FR-020）
  const [adminInitialStatusFilter, setAdminInitialStatusFilter] = useState<"cancelled" | null>(
    null,
  );
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
        setActiveView(user.role === "admin" ? "equipment-status" : "booking");
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
        text: LOGIN_REQUIRED_MESSAGE,
      });
      setActiveView("login");
      return;
    }
    // 從頁首導覽切換時，全體預約篩選回到「全部」
    setAdminInitialStatusFilter(null);
    setActiveView(target);
  };

  const handleLoginSuccess = (user: AuthenticatedUser): void => {
    setCurrentUser(user);
    setLoginBanner(null);
    setActiveView(user.role === "admin" ? "equipment-status" : "booking");
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
              aria-current={activeView === "equipment-status" ? "page" : undefined}
              onClick={() => handleNavigate("equipment-status")}
              data-testid="nav-equipment-status"
            >
              {UI_TEXT.nav.equipmentStatus}
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
        ) : activeView === "equipment-status" || activeView === "admin" ? (
          <AdminOverviewView
            key={activeView}
            currentUser={currentUser}
            section={activeView === "equipment-status" ? "equipment" : "review"}
            initialStatusFilter={activeView === "admin" ? adminInitialStatusFilter : null}
            onGoToBooking={() => setActiveView("booking")}
            onSwitchAccount={() => void handleLogout()}
            onGoToReview={() => {
              // 設備狀態管理的「查看受影響的預約」：切到審核與借用管理並篩選「已取消」（ui/plan.md §3.2）
              setAdminInitialStatusFilter("cancelled");
              setActiveView("admin");
            }}
            onGoToReturn={() => {
              // 確認視窗的「前往登記歸還」：切到審核與借用管理（FR-005）
              setAdminInitialStatusFilter(null);
              setActiveView("admin");
            }}
            onGoToEquipmentStatus={() => {
              // 登記歸還完成橫幅的「前往設備狀態管理」（ui/plan.md §3.2）
              setAdminInitialStatusFilter(null);
              setActiveView("equipment-status");
            }}
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
