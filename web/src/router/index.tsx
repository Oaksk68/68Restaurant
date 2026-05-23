import { createBrowserRouter, Navigate } from 'react-router-dom'

// Layouts
import StaffLayout from '../components/layouts/StaffLayout'
import CustomerLayout from '../components/layouts/CustomerLayout'

// Customer pages
import MenuPage from '../features/customer/pages/MenuPage'
import OrderStatusPage from '../features/customer/pages/OrderStatusPage'

// Staff pages
import LoginPage from '../features/staff/pages/LoginPage'
import OrderBoardPage from '../features/staff/pages/OrderBoardPage'
import TableGridPage from '../features/staff/pages/TableGridPage'
import TableDetailPage from '../features/staff/pages/TableDetailPage'
import BillingPage from '../features/staff/pages/BillingPage'
import PaymentPage from '../features/staff/pages/PaymentPage'

// Owner pages
import MenuManagementPage from '../features/owner/pages/MenuManagementPage'
import ReportsPage from '../features/owner/pages/ReportsPage'
import SettingsPage from '../features/owner/pages/SettingsPage'
import StaffManagementPage from '../features/owner/pages/StaffManagementPage'
import QRCodesPage from '../features/owner/pages/QRCodesPage'

import ProtectedRoute from '../components/ProtectedRoute'

export const router = createBrowserRouter([
  // Customer routes (no auth)
  {
    element: <CustomerLayout />,
    children: [
      { path: '/table/:tableId', element: <MenuPage /> },
      { path: '/table/:tableId/status/:orderId', element: <OrderStatusPage /> },
    ],
  },
  // Login
  { path: '/staff/login', element: <LoginPage /> },
  // Staff routes
  {
    element: <ProtectedRoute allowedRoles={['owner', 'waiter', 'chef']} />,
    children: [
      {
        element: <StaffLayout />,
        children: [
          { path: '/staff', element: <Navigate to="/staff/orders" replace /> },
          { path: '/staff/orders', element: <OrderBoardPage /> },
          // Waiter + Owner only
          {
            element: <ProtectedRoute allowedRoles={['owner', 'waiter']} />,
            children: [
              { path: '/staff/tables', element: <TableGridPage /> },
              { path: '/staff/tables/:tableId', element: <TableDetailPage /> },
              { path: '/staff/tables/:tableId/billing', element: <BillingPage /> },
              { path: '/staff/tables/:tableId/payment', element: <PaymentPage /> },
            ],
          },
          // Owner only
          {
            element: <ProtectedRoute allowedRoles={['owner']} />,
            children: [
              { path: '/staff/menu', element: <MenuManagementPage /> },
              { path: '/staff/reports', element: <ReportsPage /> },
              { path: '/staff/settings', element: <SettingsPage /> },
              { path: '/staff/staff', element: <StaffManagementPage /> },
              { path: '/staff/qrcodes', element: <QRCodesPage /> },
            ],
          },
        ],
      },
    ],
  },
  // Fallback
  { path: '/', element: <Navigate to="/staff/login" replace /> },
  { path: '*', element: <Navigate to="/staff/login" replace /> },
])
