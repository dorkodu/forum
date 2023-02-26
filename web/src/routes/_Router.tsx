import React from "react";
import { createBrowserRouter, createRoutesFromElements, Navigate, Route } from "react-router-dom";
import App from "../App";
import { useWait } from "../components/hooks";
import RequireAuth from "../components/RequireAuth";

const Home = React.lazy(useWait(() => import("./Home")));
const Profile = React.lazy(useWait(() => import("./profile/Profile")));
const Follower = React.lazy(useWait(() => import("./profile/Follower")));
const Following = React.lazy(useWait(() => import("./profile/Following")));
const Discussion = React.lazy(useWait(() => import("./Discussion")));
const DiscussionEditor = React.lazy(useWait(() => import("./DiscussionEditor")));
const Search = React.lazy(useWait(() => import("./Search")));
const Notifications = React.lazy(useWait(() => import("./Notifications")));
const Menu = React.lazy(useWait(() => import("./Menu")));
const DorkoduID = React.lazy(useWait(() => import("./DorkoduID")));
const NotFound = React.lazy(useWait(() => import("./NotFound")));

export const router = createBrowserRouter(
  createRoutesFromElements(
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
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/menu" element={<Menu />} />
      <Route path="/dorkodu-id" element={<DorkoduID />} />

      {/* Routes that require authentication */}
      <Route element={<RequireAuth />}>
      </Route>

      {/* Error routes & catch all */}
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" />} />
    </Route>
  )
)
