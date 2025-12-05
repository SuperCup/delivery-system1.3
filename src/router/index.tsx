import { Route, Routes, Navigate } from 'react-router-dom'
import BasicLayout from '../layouts/basic-layout'
import ClientMainLayout from '../layouts/client-main-layout'
import ClientModuleLayout from '../layouts/client-module-layout'
import HomePage from '../pages/home/home-page'
import ClientsPage from '../pages/clients/clients-page'
import MagiCorePage from '../pages/magi-core/magi-core-page'
import KnowledgeBasePage from '../pages/knowledge-base/knowledge-base-page'
import DataWarehousePage from '../pages/data-warehouse/data-warehouse-page'
import ReportCenterPage from '../pages/report-center/report-center-page'
import ToolsMarketPage from '../pages/tools-market/tools-market-page'
import PermissionCenterPage from '../pages/permission-center/permission-center-page'
import ClientDetailPage from '../pages/clients/client-detail-page'
import DashboardPage from '../pages/clients/client-module/dashboard/dashboard-page'
import ActivityFormPage from '../pages/clients/client-module/dashboard/activity-form-page'
import DataSourcePage from '../pages/clients/client-module/dashboard/data-source-page'
import InstantRetailConfigPage from '../pages/clients/client-module/dashboard/instant-retail-config-page'
import ClientDataDeliveryPage from '../pages/clients/client-module/data-delivery/client-data-delivery-page'
import ClientFileDeliveryPage from '../pages/clients/client-module/file-delivery/client-file-delivery-page'
import ClientDataAssetsPage from '../pages/clients/client-module/data-assets/client-data-assets-page'
import ClientSettlementAssistantPage from '../pages/clients/client-module/settlement-assistant/client-settlement-assistant-page'
import ClientAccountPage from '../pages/clients/client-module/account-management/client-account-page'
import BusinessRegionPage from '../pages/clients/client-module/account-management/business-region-page'
import ServiceManagementPage from '../pages/clients/client-module/account-management/service-management-page'
import SubBrandPage from '../pages/clients/client-module/account-management/sub-brand-page'
import DaodianPage from '../pages/business-process/daodian-page'
import TasksPage from '../pages/business-process/tasks-page'

export const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/home" replace />} />
    
    {/* 主系统路由 - 使用 BasicLayout */}
    <Route element={<BasicLayout />}>
      <Route path="/home" element={<HomePage />} />
      <Route path="/magi-core" element={<MagiCorePage />} />
      <Route path="/knowledge-base" element={<KnowledgeBasePage />} />
      <Route path="/data-warehouse" element={<DataWarehousePage />} />
      <Route path="/report-center" element={<ReportCenterPage />} />
      <Route path="/tools-market" element={<ToolsMarketPage />} />
      <Route path="/permission-center" element={<PermissionCenterPage />} />
      
      {/* 客户列表页面也使用主系统布局 */}
      <Route path="/clients" element={<ClientsPage />} />
      
      {/* 业务流程管理 */}
      <Route path="/business-process/daodian" element={<DaodianPage />} />
      <Route path="/business-process/tasks" element={<TasksPage />} />
    </Route>
    
    {/* 客户管理模块 - 使用独立的 ClientMainLayout */}
    <Route path="/clients/:clientId" element={<ClientMainLayout />}>
      {/* 客户模块二级布局（侧边栏） */}
      <Route element={<ClientModuleLayout />}>
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<ClientDetailPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="dashboard/create" element={<ActivityFormPage />} />
        <Route path="dashboard/edit/:id" element={<ActivityFormPage />} />
        <Route path="dashboard/data-sources" element={<DataSourcePage />} />
        <Route path="dashboard/instant-retail-config" element={<InstantRetailConfigPage />} />
        <Route path="data-delivery" element={<ClientDataDeliveryPage />} />
        <Route path="file-delivery" element={<ClientFileDeliveryPage />} />
        <Route path="data-assets" element={<ClientDataAssetsPage />} />
        <Route path="settlement-assistant" element={<ClientSettlementAssistantPage />} />
        <Route path="account" element={<ClientAccountPage />} />
        <Route path="account/business-region" element={<BusinessRegionPage />} />
        <Route path="account/service-management" element={<ServiceManagementPage />} />
        <Route path="account/sub-brand" element={<SubBrandPage />} />
      </Route>
    </Route>
    
    <Route path="*" element={<Navigate to="/home" replace />} />
  </Routes>
)

export default AppRoutes