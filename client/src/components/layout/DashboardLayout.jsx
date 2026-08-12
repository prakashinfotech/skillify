import { useSelector } from 'react-redux'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

const DashboardLayout = () => {
  const { sidebarCollapsed } = useSelector((s) => s.ui)
  return (
    <>
      <Navbar />
      <Sidebar />
      <div className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="container-fluid p-4">
          <Outlet />
        </div>
      </div>
    </>
  )
}
export default DashboardLayout
