import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import ClientAdministration from "./dashboard/clientAdministration/ClientAdministration";
import UserAdministration from "./dashboard/userAdministration/UserAdministration";
import Calculator from "./dashboard/calculator/Calculator";
import QuotationAdministration from "./dashboard/quotation/QuotationAdministration";
import ShippingTracker from "./dashboard/shipping/ShippingTracker";
import LedgerTracker from "./dashboard/ledger/LedgerTracker";
import SimpleChatBox from "./SimpleChatBox";
import AnalyticsDashboard from "./dashboard/AnalyticsDashboard";

const DynamicDashboard = () => {
  const userDetails = useSelector((state) => state.user.userDetails || {});
  const { dashboardTabs, user } = useSelector(
    (state) => state.user.userDetails || {}
  );
  const navigate = useNavigate();
  const location = useLocation();
  const [activeComponent, setActiveComponent] = useState(null);

  // Get the current page from URL or localStorage
  const getCurrentPage = useCallback(() => {
    const path = location.pathname;
    if (path === '/dashboard') return 'dashboard';
    if (path?.includes("/dashboard/calculator")) return "calculator";
    if (path?.includes("/dashboard/quotation")) return "quotation";
    if (path?.includes("/dashboard/client")) return "client";
    if (path?.includes("/dashboard/admin")) return "admin";
    if (path?.includes("/dashboard/agent")) return "agent";
    if (path?.includes("/dashboard/shipping")) return "shipping";
    if (path?.includes("/dashboard/ledger")) return "ledger";
    if (path?.includes("/dashboard/chat")) return "chat";

    // Fallback to localStorage
    const savedPage = localStorage.getItem("dashboard_current_page");
    return savedPage || null;
  }, [location.pathname]);

  // Set current page in localStorage
  const setCurrentPage = (page) => {
    localStorage.setItem("dashboard_current_page", page);
  };

  // Initialize active component based on URL or saved state
  useEffect(() => {
    const currentPage = getCurrentPage();
    if (currentPage) {
      setActiveComponent(currentPage);
      // Update URL if needed
      if (currentPage === "dashboard") {
        navigate(`/dashboard`, { replace: true });
      } else if (!location.pathname?.includes(`/dashboard/${currentPage}`)) {
        navigate(`/dashboard/${currentPage}`, { replace: true });
      }
    }
  }, [getCurrentPage, location.pathname, navigate]);

  const handleComponentChange = (component) => {
    setActiveComponent(component);
    setCurrentPage(component);
    if (component === "dashboard") {
      navigate(`/dashboard`, { replace: true });
    } else {
      navigate(`/dashboard/${component}`, { replace: true });
    }
  };

  const renderSidebarButtons = () => {
    const buttons = [];

    if (dashboardTabs?.includes("administration")) {
      buttons.push(
        <button
          key="admin"
          onClick={() => handleComponentChange("admin")}
          className={`px-4 py-3 mb-4 rounded-lg w-full text-left font-medium transition-all duration-200 ${
            activeComponent === "admin"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
          }`}
        >
          👥 {user} Administration
        </button>
      );
    }

    // Add Chat button
    buttons.push(
      <button
        key="chat"
        onClick={() => handleComponentChange("chat")}
        className={`px-4 py-3 mb-4 rounded-lg w-full text-left font-medium transition-all duration-200 ${
          activeComponent === "chat"
            ? "bg-blue-600 text-white shadow-md"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
        }`}
      >
        💬 Team Chat
      </button>
    );

    if (dashboardTabs?.includes("agent_administration")) {
      buttons.push(
        <button
          key="agent"
          onClick={() => handleComponentChange("agent")}
          className={`px-4 py-3 mb-4 rounded-lg w-full text-left font-medium transition-all duration-200 ${
            activeComponent === "agent"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
          }`}
        >
          🎯 {user} Administration
        </button>
      );
    }

    if (dashboardTabs?.includes("client_administration")) {
      buttons.push(
        <button
          key="client"
          onClick={() => handleComponentChange("client")}
          className={`px-4 py-3 mb-4 rounded-lg w-full text-left font-medium transition-all duration-200 ${
            activeComponent === "client"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
          }`}
        >
          👤 Client Administration
        </button>
      );
    }

    if (dashboardTabs?.includes("calculator")) {
      buttons.push(
        <button
          key="calculator"
          onClick={() => handleComponentChange("calculator")}
          className={`px-4 py-3 mb-4 rounded-lg w-full text-left font-medium transition-all duration-200 ${
            activeComponent === "calculator"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
          }`}
        >
          🧮 Calculator
        </button>
      );
    }

    if (dashboardTabs?.includes("analytics-dashboard")) {
      buttons.push(
        <button
          key="dashboard"
          onClick={() => handleComponentChange("dashboard")}
          className={`px-4 py-3 mb-4 rounded-lg w-full text-left font-medium transition-all duration-200 ${
            activeComponent === "dashboard"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
          }`}
        >
          📊 Analytics
        </button>
      );
    }

    buttons.push(
      <button
        key="quotation"
        onClick={() => handleComponentChange("quotation")}
        className={`px-4 py-3 mb-4 rounded-lg w-full text-left font-medium transition-all duration-200 ${
          activeComponent === "quotation"
            ? "bg-blue-600 text-white shadow-md"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
        }`}
      >
        📋 Quotation
      </button>
    );

    // Add Shipping button
    buttons.push(
      <button
        key="shipping"
        onClick={() => handleComponentChange("shipping")}
        className={`px-4 py-3 mb-4 rounded-lg w-full text-left font-medium transition-all duration-200 ${
          activeComponent === "shipping"
            ? "bg-blue-600 text-white shadow-md"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
        }`}
      >
        📦 Shipping Tracker
      </button>
    );

    // Add Ledger button
    buttons.push(
      <button
        key="ledger"
        onClick={() => handleComponentChange("ledger")}
        className={`px-4 py-3 mb-4 rounded-lg w-full text-left font-medium transition-all duration-200 ${
          activeComponent === "ledger"
            ? "bg-blue-600 text-white shadow-md"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
        }`}
      >
        💰 Ledger Tracker
      </button>
    );

    return buttons;
  };

  const renderActiveComponent = () => {
    switch (activeComponent) {
      case "chat":
        return (
          <SimpleChatBox
            currentUser={{
              id: userDetails.id || 1,
              username: userDetails.username || user || "user",
              name: userDetails.name || userDetails.username || user || "User",
              role: userDetails.role || "USER",
            }}
          />
        );
      case "dashboard":
        return <AnalyticsDashboard />;
      case "agent":
        return <UserAdministration />;
      case "admin":
        return <UserAdministration />;
      case "client":
        return <ClientAdministration />;
      case "calculator":
        return <Calculator />;
      case "quotation":
        return <QuotationAdministration />;
      case "shipping":
        return <ShippingTracker />;
      case "ledger":
        return <LedgerTracker />;
      default:
        return <AnalyticsDashboard />;
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex">
      <div className="w-72 bg-white text-gray-900 p-6 shadow-lg border-r border-gray-200">
        <div className="flex items-center gap-4 mb-8 pt-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Dashboard
            </h2>
          </div>
        </div>
        {renderSidebarButtons()}
      </div>

      <div className="flex-1 p-6 bg-gray-50 h-full overflow-hidden">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 h-full flex flex-col">
          {renderActiveComponent()}
        </div>
      </div>
    </div>
  );
};

export default DynamicDashboard;
