import type { CustomReport, AvailableReportLink } from '../types/custom-report'
import type { ReportCard } from '../types/home'
import { HomeService } from './home-service'
import { ClientService } from './client-service'
import type { BusinessType } from '../types/client'

/**
 * 专属定制服务
 */
export const CustomReportService = {
  /**
   * 获取客户的专属报表列表
   */
  async getCustomReports(clientId: string, product?: BusinessType): Promise<CustomReport[]> {
    // 模拟数据，实际应该从API获取
    const mockData: CustomReport[] = [
      {
        id: 'custom-001',
        name: '康师傅到店营销数据看板',
        validity: '永久',
        description: '展示康师傅到店营销业务的各项数据指标，包括活动执行情况、用户参与度等',
        visibleContacts: ['contact-001', 'contact-002'],
        reportLinkId: 'report-001',
        reportLinkName: '牵牛花仓店数据分析',
        reportLinkUrl: 'https://quickbi.ismartgo.cn/token3rd/dashboard/view/pc.htm?pageId=2b2a4ccf-582e-4072-a98e-f6411df63f68',
        product: '到店营销',
        clientId: 'C-003',
        createdAt: '2025-11-10 10:00:00',
        createdBy: '黎燕苹',
      },
      {
        id: 'custom-002',
        name: '即时零售履约监控',
        validity: '2025-11-08 - 2026-11-08',
        description: '实时监控即时零售业务的履约情况，包括订单处理、配送时效等关键指标',
        visibleContacts: ['contact-003'],
        reportLinkId: 'report-005',
        reportLinkName: '即时零售履约健康度',
        reportLinkUrl: 'https://quickbi.ismartgo.cn/token3rd/dashboard/view/pc.htm?pageId=2b2a4ccf-582e-4072-a98e-f6411df63f68',
        product: '即时零售',
        clientId: 'C-003',
        createdAt: '2025-11-08 14:30:00',
        createdBy: '张敏',
      },
      {
        id: 'custom-003',
        name: '达能到店营销活动分析',
        validity: '永久',
        description: '全面分析达能到店营销活动的执行效果，包括参与人数、转化率、ROI等核心指标',
        visibleContacts: ['contact-004', 'contact-005'],
        reportLinkId: 'report-007',
        reportLinkName: '客户服务体验看板',
        reportLinkUrl: 'https://quickbi.ismartgo.cn/token3rd/dashboard/view/pc.htm?pageId=2b2a4ccf-582e-4072-a98e-f6411df63f68',
        product: '到店营销',
        clientId: 'C-001',
        createdAt: '2025-11-09 09:15:00',
        createdBy: '陈乐',
      },
      {
        id: 'custom-004',
        name: '伊利即时零售渠道分析',
        validity: '2025-11-01 - 2026-05-01',
        description: '分析伊利在即时零售渠道的销售表现，包括各平台订单量、客单价、复购率等数据',
        visibleContacts: ['contact-006', 'contact-007', 'contact-008'],
        reportLinkId: 'report-013',
        reportLinkName: '即时零售渠道转化分析',
        reportLinkUrl: 'https://quickbi.ismartgo.cn/token3rd/dashboard/view/pc.htm?pageId=2b2a4ccf-582e-4072-a98e-f6411df63f68',
        product: '即时零售',
        clientId: 'C-002',
        createdAt: '2025-11-07 11:20:00',
        createdBy: '陈乐',
      },
      {
        id: 'custom-005',
        name: '嘉士伯美团到店活动监控',
        validity: '永久',
        description: '监控嘉士伯在美团平台的到店营销活动执行情况，实时跟踪活动效果',
        visibleContacts: ['contact-009'],
        reportLinkId: 'report-011',
        reportLinkName: '美团到店活动分析',
        reportLinkUrl: 'https://quickbi.ismartgo.cn/token3rd/dashboard/view/pc.htm?pageId=2b2a4ccf-582e-4072-a98e-f6411df63f68',
        product: '到店营销',
        clientId: 'C-004',
        createdAt: '2025-11-06 15:45:00',
        createdBy: '张敏',
      },
      {
        id: 'custom-006',
        name: '统一天猫校园数据看板',
        validity: '永久',
        description: '展示统一品牌在天猫校园平台的营销数据，包括学生用户参与度、活动转化等',
        visibleContacts: ['contact-010', 'contact-011'],
        reportLinkId: 'report-012',
        reportLinkName: '天猫校园数据看板',
        reportLinkUrl: 'https://quickbi.ismartgo.cn/token3rd/dashboard/view/pc.htm?pageId=2b2a4ccf-582e-4072-a98e-f6411df63f68',
        product: '到店营销',
        clientId: 'C-005',
        createdAt: '2025-11-05 10:30:00',
        createdBy: '李博',
      },
      {
        id: 'custom-007',
        name: '百威即时零售履约监控',
        validity: '2025-10-15 - 2026-04-15',
        description: '监控百威即时零售业务的履约健康度，包括配送时效、订单完成率等关键指标',
        visibleContacts: ['contact-012'],
        reportLinkId: 'report-005',
        reportLinkName: '即时零售履约健康度',
        reportLinkUrl: 'https://quickbi.ismartgo.cn/token3rd/dashboard/view/pc.htm?pageId=2b2a4ccf-582e-4072-a98e-f6411df63f68',
        product: '即时零售',
        clientId: 'C-006',
        createdAt: '2025-11-04 16:20:00',
        createdBy: '张敏',
      },
      {
        id: 'custom-008',
        name: '雀巢物码营销拉新成效',
        validity: '永久',
        description: '追踪雀巢物码营销活动的拉新效果，包括扫码人数、新用户转化、复购情况等',
        visibleContacts: ['contact-013', 'contact-014'],
        reportLinkId: 'report-006',
        reportLinkName: '物码营销拉新成效',
        reportLinkUrl: 'https://quickbi.ismartgo.cn/token3rd/dashboard/view/pc.htm?pageId=2b2a4ccf-582e-4072-a98e-f6411df63f68',
        product: '物码营销',
        clientId: 'C-007',
        createdAt: '2025-11-03 13:10:00',
        createdBy: '李博',
      },
      {
        id: 'custom-009',
        name: '伊利微信支付账单分析',
        validity: '永久',
        description: '分析伊利在微信支付平台的交易数据，包括支付笔数、金额分布、用户画像等',
        visibleContacts: ['contact-006', 'contact-007'],
        reportLinkId: 'report-008',
        reportLinkName: '微信支付账单分析',
        reportLinkUrl: 'https://quickbi.ismartgo.cn/token3rd/dashboard/view/pc.htm?pageId=2b2a4ccf-582e-4072-a98e-f6411df63f68',
        product: '到店营销',
        clientId: 'C-002',
        createdAt: '2025-11-02 09:45:00',
        createdBy: '吴倩',
      },
      {
        id: 'custom-010',
        name: '康师傅美团仓店数据概览',
        validity: '永久',
        description: '展示康师傅在美团平台的仓店数据采集情况，包括门店覆盖、数据完整性等',
        visibleContacts: ['contact-001', 'contact-002', 'contact-015'],
        reportLinkId: 'report-002',
        reportLinkName: '美团仓店数据采集概览',
        reportLinkUrl: 'https://quickbi.ismartgo.cn/token3rd/dashboard/view/pc.htm?pageId=2b2a4ccf-582e-4072-a98e-f6411df63f68',
        product: '到店营销',
        clientId: 'C-003',
        createdAt: '2025-11-01 14:25:00',
        createdBy: '黎燕苹',
      },
      {
        id: 'custom-011',
        name: '达能即时零售渠道转化',
        validity: '2025-11-01 - 2026-10-31',
        description: '分析达能在即时零售渠道的转化效果，包括各平台转化率、用户留存等数据',
        visibleContacts: ['contact-004'],
        reportLinkId: 'report-013',
        reportLinkName: '即时零售渠道转化分析',
        reportLinkUrl: 'https://quickbi.ismartgo.cn/token3rd/dashboard/view/pc.htm?pageId=2b2a4ccf-582e-4072-a98e-f6411df63f68',
        product: '即时零售',
        clientId: 'C-001',
        createdAt: '2025-10-31 11:00:00',
        createdBy: '陈乐',
      },
      {
        id: 'custom-012',
        name: '统一到店营销执行周报',
        validity: '永久',
        description: '每周汇总统一到店营销活动的执行情况，包括活动数量、参与人数、效果评估等',
        visibleContacts: ['contact-010'],
        reportLinkId: 'report-004',
        reportLinkName: '到店营销执行周报',
        reportLinkUrl: 'https://quickbi.ismartgo.cn/token3rd/dashboard/view/pc.htm?pageId=2b2a4ccf-582e-4072-a98e-f6411df63f68',
        product: '到店营销',
        clientId: 'C-005',
        createdAt: '2025-10-30 15:30:00',
        createdBy: '郑文龙',
      },
      {
        id: 'custom-013',
        name: '百威到店营销活动分析',
        validity: '永久',
        description: '全面分析百威到店营销活动的执行效果和用户反馈，为后续活动优化提供数据支持',
        visibleContacts: ['contact-012', 'contact-016'],
        reportLinkId: 'report-004',
        reportLinkName: '到店营销执行周报',
        reportLinkUrl: 'https://quickbi.ismartgo.cn/token3rd/dashboard/view/pc.htm?pageId=2b2a4ccf-582e-4072-a98e-f6411df63f68',
        product: '到店营销',
        clientId: 'C-006',
        createdAt: '2025-10-29 10:15:00',
        createdBy: '郑文龙',
      },
      {
        id: 'custom-014',
        name: '伊利物码营销拉新看板',
        validity: '2025-10-20 - 2026-04-20',
        description: '追踪伊利物码营销活动的拉新成效，包括扫码转化、新用户激活、复购率等指标',
        visibleContacts: ['contact-006', 'contact-007', 'contact-008'],
        reportLinkId: 'report-006',
        reportLinkName: '物码营销拉新成效',
        reportLinkUrl: 'https://quickbi.ismartgo.cn/token3rd/dashboard/view/pc.htm?pageId=2b2a4ccf-582e-4072-a98e-f6411df63f68',
        product: '物码营销',
        clientId: 'C-002',
        createdAt: '2025-10-28 13:50:00',
        createdBy: '李博',
      },
      {
        id: 'custom-015',
        name: '康师傅美团城市热榜',
        validity: '永久',
        description: '展示康师傅在美团平台各城市的营销热榜数据，包括热门活动、参与度排名等',
        visibleContacts: ['contact-001', 'contact-002'],
        reportLinkId: 'report-003',
        reportLinkName: '美团城市热榜看板',
        reportLinkUrl: 'https://quickbi.ismartgo.cn/token3rd/dashboard/view/pc.htm?pageId=2b2a4ccf-582e-4072-a98e-f6411df63f68',
        product: '到店营销',
        clientId: 'C-003',
        createdAt: '2025-10-27 16:40:00',
        createdBy: '黎燕苹',
      },
      {
        id: 'custom-016',
        name: '嘉士伯即时零售履约监控',
        validity: '永久',
        description: '实时监控嘉士伯即时零售业务的履约情况，确保订单及时准确配送',
        visibleContacts: ['contact-009', 'contact-017'],
        reportLinkId: 'report-005',
        reportLinkName: '即时零售履约健康度',
        reportLinkUrl: 'https://quickbi.ismartgo.cn/token3rd/dashboard/view/pc.htm?pageId=2b2a4ccf-582e-4072-a98e-f6411df63f68',
        product: '即时零售',
        clientId: 'C-004',
        createdAt: '2025-10-26 09:20:00',
        createdBy: '张敏',
      },
    ]
    
    let filtered = mockData.filter((r) => r.clientId === clientId)
    if (product) {
      filtered = filtered.filter((r) => r.product === product)
    }
    return filtered
  },

  /**
   * 获取用户有权限的看板链接列表
   * 根据当前用户权限和客户、产品筛选
   */
  async getAvailableReportLinks(clientId: string, product: BusinessType): Promise<AvailableReportLink[]> {
    try {
      // 获取所有看板
      const reportsData = await HomeService.getHomeReports()
      
      // 模拟当前用户ID（实际应该从认证服务获取）
      const currentUserId = 'person-gao-yunfeng'
      
      // 获取客户名称
      let clientName = ''
      try {
        const clientDetail = await ClientService.getClientDetail(clientId)
        clientName = clientDetail.name
      } catch (error) {
        console.error('获取客户详情失败:', error)
        // 如果获取失败，尝试从客户列表获取
        const clients = await HomeService.getClientSummaries()
        const client = clients.find(c => c.id === clientId)
        if (client) {
          clientName = client.name
        }
      }
      
      // 过滤：用户有权限的看板，且客户和产品匹配
      const available = reportsData.reports.filter((report: ReportCard) => {
        // 检查权限：全公司可见或用户在有权限列表中
        const hasPermission = 
          report.visibleTo.includes('company-root') || 
          report.visibleTo.includes(currentUserId)
        
        if (!hasPermission) return false
        
        // 检查客户匹配
        const clientMatch = 
          report.clients === '全部适用' || 
          (Array.isArray(report.clients) && clientName && report.clients.includes(clientName))
        
        if (!clientMatch) return false
        
        // 检查产品匹配
        const productMatch = 
          report.product === '全部适用' || 
          report.product === product
        
        return productMatch
      })
      
      return available.map((report) => ({
        id: report.id,
        name: report.name,
        link: report.link,
        product: report.product,
        clients: report.clients,
      }))
    } catch (error) {
      console.error('获取可用看板链接失败:', error)
      return []
    }
  },

  /**
   * 创建专属报表
   */
  async createCustomReport(report: Omit<CustomReport, 'id' | 'createdAt' | 'createdBy'>): Promise<CustomReport> {
    // 模拟创建
    const newReport: CustomReport = {
      ...report,
      id: `custom-${Date.now()}`,
      createdAt: new Date().toLocaleString('zh-CN', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      }).replace(/\//g, '-'),
      createdBy: '当前用户',
    }
    return newReport
  },

  /**
   * 更新专属报表
   */
  async updateCustomReport(id: string, report: Partial<CustomReport>): Promise<CustomReport> {
    // 模拟更新
    const updated: CustomReport = {
      id,
      name: report.name || '',
      validity: report.validity || '',
      description: report.description || '',
      visibleContacts: report.visibleContacts || [],
      reportLinkId: report.reportLinkId || '',
      product: report.product || '到店营销',
      clientId: report.clientId || '',
      createdAt: report.createdAt || '',
      createdBy: report.createdBy || '',
      updatedAt: new Date().toLocaleString('zh-CN', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      }).replace(/\//g, '-'),
    }
    return updated
  },

  /**
   * 删除专属报表
   */
  async deleteCustomReport(id: string): Promise<void> {
    // 模拟删除
    console.log('删除专属报表:', id)
  },
}

