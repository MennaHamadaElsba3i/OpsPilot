import { createBrowserRouter, Navigate } from 'react-router-dom';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { OperationsListPage } from '@/features/operations/pages/OperationsListPage';
import { OperationDetailsPage } from '@/features/operations/pages/OperationDetailsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/operations" replace />,
      },
      {
        path: 'operations',
        element: <OperationsListPage />,
      },
      {
        path: 'operations/:id',
        element: <OperationDetailsPage />,
      },
      {
        path: '*',
        element: <Navigate to="/operations" replace />,
      },
    ],
  },
]);
