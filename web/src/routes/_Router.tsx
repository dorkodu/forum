import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import App from "../App";
import RequireAuth from "../components/RequireAuth";

const Welcome = React.lazy(() => import("./Welcome"));
const NotFound = React.lazy(() => import("./NotFound"));

function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          {/* Navigate to "/dashboard" on path "/" */}
          <Route index element={<Navigate to="/dashboard" />} />

          {/* Routes that don't require authentication */}
          <Route path="/welcome" element={<Welcome />} />

          {/* Routes that require authentication */}
          <Route element={<RequireAuth />}>
          </Route>

          {/* Error routes & catch all */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default Router;
