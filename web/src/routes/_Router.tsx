import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import App from "../App";
import RequireAuth from "../components/RequireAuth";

const Home = React.lazy(() => import("./Home"));
const Profile = React.lazy(() => import("./profile/Profile"));
const Follower = React.lazy(() => import("./profile/Follower"));
const Following = React.lazy(() => import("./profile/Following"));
const Discussion = React.lazy(() => import("./Discussion"));
const DiscussionEditor = React.lazy(() => import("./DiscussionEditor"));
const Search = React.lazy(() => import("./Search"));
const Menu = React.lazy(() => import("./Menu"));
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
          <Route path="/home" element={<Home />} />
          <Route path="/profile/:username" element={<Profile />} />
          <Route path="/profile/:username/followers" element={<Follower />} />
          <Route path="/profile/:username/following" element={<Following />} />
          <Route path="/discussion/:id" element={<Discussion />} />
          <Route path="/discussion-editor" element={<DiscussionEditor />} />
          <Route path="/discussion-editor/:id" element={<DiscussionEditor />} />
          <Route path="/search" element={<Search />} />
          <Route path="/menu" element={<Menu />} />
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
