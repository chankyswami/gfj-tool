// TitleManager.jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { pageTitleMap } from "../utils/pageTitles";

const TitleManager = () => {
  const location = useLocation();

  useEffect(() => {
    const currentPath = location.pathname;
    const defaultTitle = "My App"; // fallback title
    document.title = pageTitleMap[currentPath] || defaultTitle;
  }, [location]);

  return null; // no UI rendered
};

export default TitleManager;
