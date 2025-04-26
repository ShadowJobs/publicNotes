import { LoaderFunction } from "react-router-dom";

export type LayoutLoaderData = {
  isSidebarCollapsed: boolean;
};

export const loader: LoaderFunction = () => {
  let isSidebarCollapsed = localStorage.getItem("sidebar/collapsed") === "true";
  if(window.innerWidth < 600) {
    isSidebarCollapsed = true;
  }

  return {
    isSidebarCollapsed
  };
};
