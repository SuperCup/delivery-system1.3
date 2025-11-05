import { Route, Routes, Navigate } from 'react-router-dom'
import HomePage from '../pages/home/home-page'
import DataDeliveryPage from '../pages/data-delivery/data-delivery-page'
import FileDeliveryPage from '../pages/file-delivery/file-delivery-page'
import MagiCorePage from '../pages/magi-core/magi-core-page'
import AIKnowledgePage from '../pages/ai-knowledge/ai-knowledge-page'
import AccessControlPage from '../pages/access-control/access-control-page'
import AccountConfigPage from '../pages/account-config/account-config-page'
import ActivityManagementPage from '../pages/activity-management/activity-management-page'
import ActivityDetailPage from '../pages/activity-management/activity-detail-page'
import ActivityCreatePage from '../pages/activity-management/activity-create-page'
import DashboardPage from '../pages/dashboard/dashboard-page'
import ChannelsPage from '../pages/channels/channels-page'
import DeliveryPage from '../pages/delivery/delivery-page'
import LogsPage from '../pages/logs/logs-page'
import PackagesPage from '../pages/packages/packages-page'
import DataCenterPage from '../pages/data-center/data-center-page'
import ToolsMarketPage from '../pages/tools-market/tools-market-page'
import SettlementAssistantPage from '../pages/settlement-assistant/settlement-assistant-page'

export const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/home" replace />} />
    <Route path="/home" element={<HomePage />} />
    {/* 业务专区 */}
    <Route path="/activity-management" element={<ActivityManagementPage />} />
    <Route path="/activity-management/create" element={<ActivityCreatePage />} />
    <Route path="/activity-management/detail/:id" element={<ActivityDetailPage />} />
    <Route path="/dashboard" element={<DashboardPage />} />
    <Route path="/channels" element={<ChannelsPage />} />
    <Route path="/delivery" element={<DeliveryPage />} />
    <Route path="/logs" element={<LogsPage />} />
    <Route path="/packages" element={<PackagesPage />} />
    <Route path="/data-delivery" element={<DataDeliveryPage />} />
    <Route path="/file-delivery" element={<FileDeliveryPage />} />
    <Route path="/magi-core" element={<MagiCorePage />} />
    <Route path="/ai-knowledge" element={<AIKnowledgePage />} />
    {/* 基础服务 */}
    <Route path="/data-center" element={<DataCenterPage />} />
    <Route path="/tools-market" element={<ToolsMarketPage />} />
    {/* 项目支持 */}
    <Route path="/settlement-assistant" element={<SettlementAssistantPage />} />
    <Route path="/access-control" element={<AccessControlPage />} />
    <Route path="/account-config" element={<AccountConfigPage />} />
    <Route path="*" element={<Navigate to="/activity-management" replace />} />
  </Routes>
)

export default AppRoutes