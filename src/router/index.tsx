import { Route, Routes, Navigate } from 'react-router-dom'
import HomePage from '../pages/home/home-page'
import ClientsPage from '../pages/clients/clients-page'
import MagiCorePage from '../pages/magi-core/magi-core-page'
import KnowledgeBasePage from '../pages/knowledge-base/knowledge-base-page'
import DataWarehousePage from '../pages/data-warehouse/data-warehouse-page'
import ToolsMarketPage from '../pages/tools-market/tools-market-page'
import PermissionCenterPage from '../pages/permission-center/permission-center-page'
import ClientModuleLayout from '../layouts/client-module-layout'
import ClientDetailPage from '../pages/clients/client-detail-page'
import ActivityManagementPage from '../pages/activity-management/activity-management-page'
import ActivityCreateEditPage from '../pages/activity-management/activity-create-edit-page'
import DataSourceManagementPage from '../pages/activity-management/data-source-management-page'
import ClientDataDeliveryPage from '../pages/clients/client-module/data-delivery/client-data-delivery-page'
import ClientFileDeliveryPage from '../pages/clients/client-module/file-delivery/client-file-delivery-page'
import ClientDataAssetsPage from '../pages/clients/client-module/data-assets/client-data-assets-page'
import ClientSettlementAssistantPage from '../pages/clients/client-module/settlement-assistant/client-settlement-assistant-page'
import ClientSettingsPage from '../pages/clients/client-module/settings/client-settings-page'

export const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/home" replace />} />
    <Route path="/home" element={<HomePage />} />
    
    {/* 客户列表 */}
    <Route path="/clients" element={<ClientsPage />} />
    
    {/* 客户模块（带左侧菜单） */}
    <Route path="/clients/:clientId" element={<ClientModuleLayout />}>
      <Route index element={<Navigate to="overview" replace />} />
      <Route path="overview" element={<ClientDetailPage />} />
      <Route path="activities" element={<ActivityManagementPage />} />
      <Route path="data-delivery" element={<ClientDataDeliveryPage />} />
      <Route path="file-delivery" element={<ClientFileDeliveryPage />} />
      <Route path="data-assets" element={<ClientDataAssetsPage />} />
      <Route path="settlement-assistant" element={<ClientSettlementAssistantPage />} />
      <Route path="settings" element={<ClientSettingsPage />} />
    </Route>
    
    {/* 活动管理相关页面 */}
    <Route path="/activity-management" element={<ActivityManagementPage />} />
    <Route path="/activity-management/create" element={<ActivityCreateEditPage />} />
    <Route path="/activity-management/edit/:id" element={<ActivityCreateEditPage />} />
    <Route path="/activity-management/data-sources" element={<DataSourceManagementPage />} />
    
    <Route path="/magi-core" element={<MagiCorePage />} />
    <Route path="/knowledge-base" element={<KnowledgeBasePage />} />
    <Route path="/data-warehouse" element={<DataWarehousePage />} />
    <Route path="/tools-market" element={<ToolsMarketPage />} />
    <Route path="/permission-center" element={<PermissionCenterPage />} />
    <Route path="*" element={<Navigate to="/home" replace />} />
  </Routes>
)

export default AppRoutes