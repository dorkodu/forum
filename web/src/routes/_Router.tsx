import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import App from "../App";
import RequireAuth from "../components/RequireAuth";

const Welcome = React.lazy(() => import("./Welcome"));
const Home = React.lazy(() => import("./Home"));
const Discussion = React.lazy(() => import("./Discussion"));
const DiscussionCreate = React.lazy(() => import("./DiscussionCreate"));
const Profile = React.lazy(() => import("./profile/Profile"));
const Follower = React.lazy(() => import("./profile/Follower"));
const Following = React.lazy(() => import("./profile/Following"));
const DorkoduID = React.lazy(() => import("./DorkoduID"));
const NotFound = React.lazy(() => import("./NotFound"));

function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          {/* Navigate to "/home" on path "/" */}
          <Route index element={<Navigate to="/home" />} />

          {/* Routes that don't require authentication */}
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/home" element={<Home />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/profile/:id/followers" element={<Follower />} />
          <Route path="/profile/:id/following" element={<Following />} />
          <Route path="/discussion/:id" element={<Discussion />} />
          <Route path="/create-discussion" element={<DiscussionCreate />} />
          <Route path="/dorkodu-id" element={<DorkoduID />} />

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
