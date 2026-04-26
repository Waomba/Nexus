import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import ErrorBoundary from './components/common/ErrorBoundary'
import Login            from './pages/Login/Login'
import AdminLogin       from './pages/AdminLogin/AdminLogin'
import Feed             from './pages/Feed/Feed'
import Profile          from './pages/Profile/Profile'
import Messages         from './pages/Messages/Messages'
import Explore          from './pages/Explore/Explore'
import Videos           from './pages/Videos/Videos'
import Tasks            from './pages/Tasks/Tasks'
import Notifications    from './pages/Notifications/Notifications'
import Settings         from './pages/Settings/Settings'
import ParentalControls from './pages/Parental/ParentalControls'
import SearchPage       from './pages/Search/SearchPage'
import Leaderboard      from './pages/Leaderboard/Leaderboard'
import Bookmarks        from './pages/Bookmarks/Bookmarks'
import Events           from './pages/Events/Events'
import Groups           from './pages/Groups/Groups'
import Friends          from './pages/Friends/Friends'
import SavedMessages    from './pages/SavedMessages/SavedMessages'
import Hashtags         from './pages/Hashtags/Hashtags'
import KidsFeed         from './pages/Kids/KidsFeed'
import AdminDashboard   from './pages/Admin/AdminDashboard'
import AdminUsers       from './pages/Admin/AdminUsers'
import AdminReports     from './pages/Admin/AdminReports'
import AdminModeration  from './pages/Admin/AdminModeration'
import AdminAnalytics   from './pages/Admin/AdminAnalytics'
import AdminLogs        from './pages/Admin/AdminLogs'
import Layout           from './components/Layout/Layout'
import AdminLayout      from './components/Layout/AdminLayout'

function Spinner() {
  return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh'}}><div className="spinner"/></div>
}
function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Spinner/>
  return user ? children : <Navigate to="/login" replace/>
}
function AdminRoute({ children }) {
  const { user, isAdmin, loading } = useAuth()
  if (loading) return <Spinner/>
  if (!user) return <Navigate to="/admin/login" replace/>
  if (!isAdmin) return <Navigate to="/" replace/>
  return children
}

export default function App() {
  const { isKids } = useAuth()
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/login"       element={<Login/>}/>
        <Route path="/admin/login" element={<AdminLogin/>}/>
        <Route path="/admin" element={<AdminRoute><AdminLayout/></AdminRoute>}>
          <Route index             element={<AdminDashboard/>}/>
          <Route path="users"      element={<AdminUsers/>}/>
          <Route path="reports"    element={<AdminReports/>}/>
          <Route path="moderation" element={<AdminModeration/>}/>
          <Route path="analytics"  element={<AdminAnalytics/>}/>
          <Route path="logs"       element={<AdminLogs/>}/>
        </Route>
        <Route path="/" element={<PrivateRoute><Layout/></PrivateRoute>}>
          <Route index              element={isKids ? <KidsFeed/> : <Feed/>}/>
          <Route path="explore"     element={<Explore/>}/>
          <Route path="search"      element={<SearchPage/>}/>
          <Route path="messages"    element={isKids ? <Navigate to="/" replace/> : <Messages/>}/>
          <Route path="videos"      element={<Videos/>}/>
          <Route path="tasks"       element={isKids ? <Navigate to="/" replace/> : <Tasks/>}/>
          <Route path="events"      element={<Events/>}/>
          <Route path="groups"      element={<Groups/>}/>
          <Route path="friends"     element={<Friends/>}/>
          <Route path="saved"       element={<SavedMessages/>}/>
          <Route path="hashtags"    element={<Hashtags/>}/>
          <Route path="bookmarks"   element={<Bookmarks/>}/>
          <Route path="notifications" element={<Notifications/>}/>
          <Route path="profile/:id" element={<Profile/>}/>
          <Route path="settings"    element={<Settings/>}/>
          <Route path="parental"    element={isKids ? <Navigate to="/" replace/> : <ParentalControls/>}/>
          <Route path="leaderboard" element={<Leaderboard/>}/>
        </Route>
        <Route path="*" element={<Navigate to="/" replace/>}/>
      </Routes>
    </ErrorBoundary>
  )
}
