import type {
  DataSourcePlatform,
  DataType,
  DataCategory,
  DataRecord,
  ImportRecord,
  DownloadRecord,
  DataWarehouseBusinessType,
  DownloadCondition,
  CollectionPlatformConfig,
  CollectionTask,
  CollectionTaskStatus,
} from '../types/data-warehouse'

const mockMyClients = [
  { id: 'C-001', name: '达能' },
  { id: 'C-002', name: '伊利' },
  { id: 'C-004', name: '嘉士伯' },
  { id: 'C-006', name: '百威' },
]

// 通用下载条件
const condClient: DownloadCondition = {
  id: 'client',
  label: '客户',
  type: 'client',
  required: true,
}
const condDateRange: DownloadCondition = {
  id: 'dateRange',
  label: '日期范围',
  type: 'dateRange',
  required: true,
}
const condActivity: DownloadCondition = {
  id: 'activity',
  label: '活动',
  type: 'activity',
  required: false,
  options: [
    { label: '全部活动', value: '' },
    { label: '双11大促', value: 'act-001' },
    { label: '品牌日', value: 'act-002' },
    { label: '新品推广', value: 'act-003' },
    { label: '节日特惠', value: 'act-004' },
  ],
}
const condBillType: DownloadCondition = {
  id: 'billType',
  label: '账单类型',
  type: 'billType',
  required: true,
  options: [
    { label: '日账单', value: 'day' },
    { label: '月账单', value: 'month' },
  ],
}
const condPageModule: DownloadCondition = {
  id: 'pageModule',
  label: '目标页面与模块',
  type: 'pageModule',
  required: false,
  options: [
    { label: '全部', value: '' },
    { label: '首页-焦点图', value: 'home-banner' },
    { label: '首页-商品流', value: 'home-feed' },
    { label: '搜索-结果位', value: 'search-result' },
    { label: '商详-加购模块', value: 'detail-cart' },
    { label: '活动页-主会场', value: 'event-main' },
  ],
}
const condMerchant: DownloadCondition = {
  id: 'merchant',
  label: '商户',
  type: 'merchant',
  required: false,
  options: [
    { label: '全部商户', value: '' },
    { label: '华东区合作商户', value: 'm-east' },
    { label: '华南区合作商户', value: 'm-south' },
    { label: '华北区合作商户', value: 'm-north' },
  ],
}

const platforms: DataSourcePlatform[] = [
  {
    id: 'alipay',
    name: '支付宝',
    businessType: '到店营销',
    acquisitionMethod: '平台爬取',
    updateFrequency: '每日',
    updateFrequencyDetail: '每日凌晨 2:00 自动爬取前一日数据并入库。',
    dataTypes: [
      {
        id: 'alipay-activity',
        platformId: 'alipay',
        name: '活动详情',
        description: '支付宝到店营销活动的基础信息与状态，包含活动名称、时间、预算、投放范围等。',
        fields: [
          { id: 'f1', name: '活动ID', description: '平台活动唯一标识' },
          { id: 'f2', name: '活动名称', description: '活动名称' },
          { id: 'f3', name: '开始日期', description: '活动开始日期' },
          { id: 'f4', name: '结束日期', description: '活动结束日期' },
          { id: 'f5', name: '预算(元)', description: '活动预算金额' },
          { id: 'f6', name: '状态', description: '进行中/已结束/已暂停' },
        ],
        downloadConditions: [condClient, condDateRange, condActivity],
        recordCount: 2840,
        lastUpdatedAt: '2025-11-10 02:15',
      },
      {
        id: 'alipay-bill',
        platformId: 'alipay',
        name: '营销账单（日/月）',
        description: '按日或按月汇总的营销费用与核销明细，用于对账与成本分析。',
        fields: [
          { id: 'f1', name: '账单日期', description: '日账单为当日，月账单为月末' },
          { id: 'f2', name: '账单类型', description: '日/月' },
          { id: 'f3', name: '消耗金额(元)', description: '当日/月总消耗' },
          { id: 'f4', name: '核销金额(元)', description: '核销对应金额' },
          { id: 'f5', name: '订单笔数', description: '核销订单数' },
          { id: 'f6', name: 'ROI', description: '核销金额/消耗' },
        ],
        downloadConditions: [condClient, condDateRange, condBillType],
        recordCount: 15200,
        lastUpdatedAt: '2025-11-10 02:18',
      },
      {
        id: 'alipay-touch',
        platformId: 'alipay',
        name: '碰一碰账单',
        description: '支付宝碰一碰营销产生的交易与核销账单明细。',
        fields: [
          { id: 'f1', name: '日期', description: '交易日期' },
          { id: 'f2', name: '活动名称', description: '碰一碰活动名称' },
          { id: 'f3', name: '交易笔数', description: '当日交易笔数' },
          { id: 'f4', name: '交易金额(元)', description: '当日交易金额' },
          { id: 'f5', name: '核销率', description: '核销笔数/交易笔数' },
        ],
        downloadConditions: [condClient, condDateRange],
        recordCount: 6800,
        lastUpdatedAt: '2025-11-10 02:20',
      },
      {
        id: 'alipay-merchant',
        platformId: 'alipay',
        name: '商户清单',
        description: '已签约/已开通的支付宝到店合作商户列表，含商户名称、编码、区域、状态。',
        fields: [
          { id: 'f1', name: '商户ID', description: '平台商户编码' },
          { id: 'f2', name: '商户名称', description: '商户名称' },
          { id: 'f3', name: '区域', description: '所属区域' },
          { id: 'f4', name: '开通状态', description: '已开通/待开通/已关闭' },
          { id: 'f5', name: '签约日期', description: '合同签约日期' },
        ],
        downloadConditions: [condClient, condMerchant],
        recordCount: 3200,
        lastUpdatedAt: '2025-11-10 02:22',
      },
    ],
  },
  {
    id: 'wechat',
    name: '微信',
    businessType: '到店营销',
    acquisitionMethod: '平台开放接口',
    updateFrequency: '实时',
    updateFrequencyDetail: '通过微信开放接口实时拉取，数据延迟在分钟级。',
    dataTypes: [
      {
        id: 'wechat-activity',
        platformId: 'wechat',
        name: '活动详情',
        description: '微信到店营销活动配置与状态，含活动ID、名称、时间、预算、投放范围。',
        fields: [
          { id: 'f1', name: '活动ID', description: '微信侧活动唯一标识' },
          { id: 'f2', name: '活动名称', description: '活动名称' },
          { id: 'f3', name: '开始时间', description: '活动开始时间' },
          { id: 'f4', name: '结束时间', description: '活动结束时间' },
          { id: 'f5', name: '预算(元)', description: '活动预算' },
          { id: 'f6', name: '状态', description: '进行中/已结束' },
        ],
        downloadConditions: [condClient, condDateRange, condActivity],
        recordCount: 2100,
        lastUpdatedAt: '2025-11-10 10:30',
      },
      {
        id: 'wechat-bill',
        platformId: 'wechat',
        name: '营销账单',
        description: '微信到店营销消耗与核销汇总，支持按日查看与导出。',
        fields: [
          { id: 'f1', name: '日期', description: '统计日期' },
          { id: 'f2', name: '消耗(元)', description: '当日消耗' },
          { id: 'f3', name: '核销(元)', description: '当日核销金额' },
          { id: 'f4', name: '核销笔数', description: '核销订单数' },
          { id: 'f5', name: 'ROI', description: '核销/消耗' },
        ],
        downloadConditions: [condClient, condDateRange],
        recordCount: 9800,
        lastUpdatedAt: '2025-11-10 10:32',
      },
      {
        id: 'wechat-shop-activity',
        platformId: 'wechat',
        name: '微信小店活动详情',
        description: '微信小店渠道下的营销活动配置与状态。',
        fields: [
          { id: 'f1', name: '活动ID', description: '小店侧活动ID' },
          { id: 'f2', name: '活动名称', description: '活动名称' },
          { id: 'f3', name: '活动类型', description: '满减/折扣/秒杀等' },
          { id: 'f4', name: '开始/结束时间', description: '活动时间' },
          { id: 'f5', name: '状态', description: '进行中/已结束' },
        ],
        downloadConditions: [condClient, condDateRange, condActivity],
        recordCount: 1560,
        lastUpdatedAt: '2025-11-10 10:35',
      },
      {
        id: 'wechat-shop-bill',
        platformId: 'wechat',
        name: '微信小店账单',
        description: '微信小店营销消耗与核销账单。',
        fields: [
          { id: 'f1', name: '日期', description: '账单日期' },
          { id: 'f2', name: '消耗(元)', description: '消耗金额' },
          { id: 'f3', name: '核销(元)', description: '核销金额' },
          { id: 'f4', name: '订单数', description: '核销订单数' },
        ],
        downloadConditions: [condClient, condDateRange],
        recordCount: 7200,
        lastUpdatedAt: '2025-11-10 10:36',
      },
    ],
  },
  {
    id: 'wechat-shop',
    name: '微信小店',
    businessType: '到店营销',
    acquisitionMethod: '平台爬取',
    updateFrequency: '每日',
    updateFrequencyDetail: '每日凌晨 3:00 爬取微信小店前一日活动与账单数据。',
    dataTypes: [
      {
        id: 'wechat-shop-platform-activity',
        platformId: 'wechat-shop',
        name: '微信小店活动详情',
        description: '微信小店独立维度的活动配置与状态（与微信主站活动区分）。',
        fields: [
          { id: 'f1', name: '活动ID', description: '小店活动ID' },
          { id: 'f2', name: '活动名称', description: '活动名称' },
          { id: 'f3', name: '开始/结束日期', description: '活动周期' },
          { id: 'f4', name: '预算(元)', description: '预算' },
          { id: 'f5', name: '状态', description: '进行中/已结束' },
        ],
        downloadConditions: [condClient, condDateRange, condActivity],
        recordCount: 1200,
        lastUpdatedAt: '2025-11-10 03:10',
      },
      {
        id: 'wechat-shop-platform-bill',
        platformId: 'wechat-shop',
        name: '微信小店账单',
        description: '微信小店渠道的营销账单汇总。',
        fields: [
          { id: 'f1', name: '日期', description: '账单日期' },
          { id: 'f2', name: '消耗(元)', description: '消耗' },
          { id: 'f3', name: '核销(元)', description: '核销' },
          { id: 'f4', name: '订单数', description: '核销订单数' },
        ],
        downloadConditions: [condClient, condDateRange],
        recordCount: 5400,
        lastUpdatedAt: '2025-11-10 03:12',
      },
    ],
  },
  {
    id: 'douyin',
    name: '抖音来客',
    businessType: '到店营销',
    acquisitionMethod: '平台爬取',
    updateFrequency: '每日',
    updateFrequencyDetail: '每日凌晨 2:30 爬取抖音来客前一日活动与账单。',
    dataTypes: [
      {
        id: 'douyin-activity',
        platformId: 'douyin',
        name: '活动详情',
        description: '抖音来客到店营销活动信息与状态。',
        fields: [
          { id: 'f1', name: '活动ID', description: '抖音侧活动ID' },
          { id: 'f2', name: '活动名称', description: '活动名称' },
          { id: 'f3', name: '开始/结束时间', description: '活动时间' },
          { id: 'f4', name: '预算(元)', description: '预算' },
          { id: 'f5', name: '状态', description: '进行中/已结束' },
        ],
        downloadConditions: [condClient, condDateRange, condActivity],
        recordCount: 1890,
        lastUpdatedAt: '2025-11-10 02:35',
      },
      {
        id: 'douyin-bill',
        platformId: 'douyin',
        name: '活动账单',
        description: '抖音来客营销消耗与核销账单。',
        fields: [
          { id: 'f1', name: '日期', description: '账单日期' },
          { id: 'f2', name: '消耗(元)', description: '消耗金额' },
          { id: 'f3', name: '核销(元)', description: '核销金额' },
          { id: 'f4', name: '核销笔数', description: '订单数' },
          { id: 'f5', name: 'ROI', description: '核销/消耗' },
        ],
        downloadConditions: [condClient, condDateRange],
        recordCount: 8400,
        lastUpdatedAt: '2025-11-10 02:38',
      },
    ],
  },
  // 即时零售
  {
    id: 'meituan',
    name: '美团闪购',
    businessType: '即时零售',
    acquisitionMethod: '平台爬取',
    updateFrequency: '每日',
    updateFrequencyDetail: '每日凌晨 4:00 爬取前一日方案、账单及 RTB 人群数据。',
    dataTypes: [
      {
        id: 'meituan-plan',
        platformId: 'meituan',
        name: '平台方案',
        description: '美团闪购侧已配置的营销方案信息，含方案名称、类型、预算、生效周期。',
        fields: [
          { id: 'f1', name: '方案ID', description: '平台方案唯一标识' },
          { id: 'f2', name: '方案名称', description: '方案名称' },
          { id: 'f3', name: '方案类型', description: '满减/品类券/单品等' },
          { id: 'f4', name: '开始/结束日期', description: '生效周期' },
          { id: 'f5', name: '预算(元)', description: '方案预算' },
          { id: 'f6', name: '状态', description: '生效中/已结束' },
        ],
        downloadConditions: [condClient, condDateRange],
        recordCount: 3200,
        lastUpdatedAt: '2025-11-10 04:05',
      },
      {
        id: 'meituan-bill',
        platformId: 'meituan',
        name: '营销账单',
        description: '美团闪购营销消耗与核销汇总。',
        fields: [
          { id: 'f1', name: '日期', description: '账单日期' },
          { id: 'f2', name: '消耗(元)', description: '消耗' },
          { id: 'f3', name: '核销(元)', description: '核销' },
          { id: 'f4', name: '订单数', description: '核销订单数' },
          { id: 'f5', name: 'ROI', description: '核销/消耗' },
        ],
        downloadConditions: [condClient, condDateRange],
        recordCount: 11200,
        lastUpdatedAt: '2025-11-10 04:08',
      },
      {
        id: 'meituan-rtb',
        platformId: 'meituan',
        name: 'RTB人群（按平台目标页面与模块存储）',
        description: '按平台目标页面与模块维度存储的 RTB 人群包曝光、点击与转化数据。',
        fields: [
          { id: 'f1', name: '日期', description: '统计日期' },
          { id: 'f2', name: '目标页面', description: '如首页、搜索、商详' },
          { id: 'f3', name: '模块', description: '页面内模块位置' },
          { id: 'f4', name: '曝光量', description: '该位置曝光' },
          { id: 'f5', name: '点击量', description: '点击次数' },
          { id: 'f6', name: '转化数', description: '转化人数/订单数' },
        ],
        downloadConditions: [condClient, condDateRange, condPageModule],
        recordCount: 25600,
        lastUpdatedAt: '2025-11-10 04:12',
      },
    ],
  },
  {
    id: 'taobao',
    name: '淘宝闪购',
    businessType: '即时零售',
    acquisitionMethod: '平台爬取',
    updateFrequency: '每日',
    updateFrequencyDetail: '每日凌晨 4:30 爬取前一日方案、账单及 RTB 人群数据。',
    dataTypes: [
      {
        id: 'taobao-plan',
        platformId: 'taobao',
        name: '平台方案',
        description: '淘宝闪购侧已配置的营销方案信息。',
        fields: [
          { id: 'f1', name: '方案ID', description: '方案唯一标识' },
          { id: 'f2', name: '方案名称', description: '方案名称' },
          { id: 'f3', name: '方案类型', description: '满减/品类券等' },
          { id: 'f4', name: '开始/结束日期', description: '生效周期' },
          { id: 'f5', name: '预算(元)', description: '预算' },
          { id: 'f6', name: '状态', description: '生效中/已结束' },
        ],
        downloadConditions: [condClient, condDateRange],
        recordCount: 2800,
        lastUpdatedAt: '2025-11-10 04:35',
      },
      {
        id: 'taobao-bill',
        platformId: 'taobao',
        name: '营销账单',
        description: '淘宝闪购营销消耗与核销汇总。',
        fields: [
          { id: 'f1', name: '日期', description: '账单日期' },
          { id: 'f2', name: '消耗(元)', description: '消耗' },
          { id: 'f3', name: '核销(元)', description: '核销' },
          { id: 'f4', name: '订单数', description: '核销订单数' },
          { id: 'f5', name: 'ROI', description: '核销/消耗' },
        ],
        downloadConditions: [condClient, condDateRange],
        recordCount: 9800,
        lastUpdatedAt: '2025-11-10 04:38',
      },
      {
        id: 'taobao-rtb',
        platformId: 'taobao',
        name: 'RTB人群（按平台目标页面与模块存储）',
        description: '按目标页面与模块存储的 RTB 人群曝光、点击与转化。',
        fields: [
          { id: 'f1', name: '日期', description: '统计日期' },
          { id: 'f2', name: '目标页面', description: '页面' },
          { id: 'f3', name: '模块', description: '模块位置' },
          { id: 'f4', name: '曝光量', description: '曝光' },
          { id: 'f5', name: '点击量', description: '点击' },
          { id: 'f6', name: '转化数', description: '转化' },
        ],
        downloadConditions: [condClient, condDateRange, condPageModule],
        recordCount: 22100,
        lastUpdatedAt: '2025-11-10 04:42',
      },
    ],
  },
  {
    id: 'jd',
    name: '京东到家',
    businessType: '即时零售',
    acquisitionMethod: '平台爬取',
    updateFrequency: '每日',
    updateFrequencyDetail: '每日凌晨 4:00 爬取前一日方案、账单及 RTB 人群数据。',
    dataTypes: [
      {
        id: 'jd-plan',
        platformId: 'jd',
        name: '平台方案',
        description: '京东到家侧已配置的营销方案信息。',
        fields: [
          { id: 'f1', name: '方案ID', description: '方案唯一标识' },
          { id: 'f2', name: '方案名称', description: '方案名称' },
          { id: 'f3', name: '方案类型', description: '满减/品类券等' },
          { id: 'f4', name: '开始/结束日期', description: '生效周期' },
          { id: 'f5', name: '预算(元)', description: '预算' },
          { id: 'f6', name: '状态', description: '生效中/已结束' },
        ],
        downloadConditions: [condClient, condDateRange],
        recordCount: 2650,
        lastUpdatedAt: '2025-11-10 04:06',
      },
      {
        id: 'jd-bill',
        platformId: 'jd',
        name: '营销账单',
        description: '京东到家营销消耗与核销汇总。',
        fields: [
          { id: 'f1', name: '日期', description: '账单日期' },
          { id: 'f2', name: '消耗(元)', description: '消耗' },
          { id: 'f3', name: '核销(元)', description: '核销' },
          { id: 'f4', name: '订单数', description: '核销订单数' },
          { id: 'f5', name: 'ROI', description: '核销/消耗' },
        ],
        downloadConditions: [condClient, condDateRange],
        recordCount: 10500,
        lastUpdatedAt: '2025-11-10 04:10',
      },
      {
        id: 'jd-rtb',
        platformId: 'jd',
        name: 'RTB人群（按平台目标页面与模块存储）',
        description: '按目标页面与模块存储的 RTB 人群数据。',
        fields: [
          { id: 'f1', name: '日期', description: '统计日期' },
          { id: 'f2', name: '目标页面', description: '页面' },
          { id: 'f3', name: '模块', description: '模块' },
          { id: 'f4', name: '曝光量', description: '曝光' },
          { id: 'f5', name: '点击量', description: '点击' },
          { id: 'f6', name: '转化数', description: '转化' },
        ],
        downloadConditions: [condClient, condDateRange, condPageModule],
        recordCount: 19800,
        lastUpdatedAt: '2025-11-10 04:14',
      },
    ],
  },
  {
    id: 'duodian',
    name: '多点',
    businessType: '即时零售',
    acquisitionMethod: '平台爬取',
    updateFrequency: '每日',
    updateFrequencyDetail: '每日凌晨 4:00 爬取前一日方案、账单及 RTB 人群数据。',
    dataTypes: [
      {
        id: 'duodian-plan',
        platformId: 'duodian',
        name: '平台方案',
        description: '多点侧已配置的营销方案信息。',
        fields: [
          { id: 'f1', name: '方案ID', description: '方案唯一标识' },
          { id: 'f2', name: '方案名称', description: '方案名称' },
          { id: 'f3', name: '方案类型', description: '满减/品类券等' },
          { id: 'f4', name: '开始/结束日期', description: '生效周期' },
          { id: 'f5', name: '预算(元)', description: '预算' },
          { id: 'f6', name: '状态', description: '生效中/已结束' },
        ],
        downloadConditions: [condClient, condDateRange],
        recordCount: 1800,
        lastUpdatedAt: '2025-11-10 04:08',
      },
      {
        id: 'duodian-bill',
        platformId: 'duodian',
        name: '营销账单',
        description: '多点营销消耗与核销汇总。',
        fields: [
          { id: 'f1', name: '日期', description: '账单日期' },
          { id: 'f2', name: '消耗(元)', description: '消耗' },
          { id: 'f3', name: '核销(元)', description: '核销' },
          { id: 'f4', name: '订单数', description: '核销订单数' },
          { id: 'f5', name: 'ROI', description: '核销/消耗' },
        ],
        downloadConditions: [condClient, condDateRange],
        recordCount: 6200,
        lastUpdatedAt: '2025-11-10 04:12',
      },
      {
        id: 'duodian-rtb',
        platformId: 'duodian',
        name: 'RTB人群（按平台目标页面与模块存储）',
        description: '按目标页面与模块存储的 RTB 人群数据。',
        fields: [
          { id: 'f1', name: '日期', description: '统计日期' },
          { id: 'f2', name: '目标页面', description: '页面' },
          { id: 'f3', name: '模块', description: '模块' },
          { id: 'f4', name: '曝光量', description: '曝光' },
          { id: 'f5', name: '点击量', description: '点击' },
          { id: 'f6', name: '转化数', description: '转化' },
        ],
        downloadConditions: [condClient, condDateRange, condPageModule],
        recordCount: 14200,
        lastUpdatedAt: '2025-11-10 04:16',
      },
    ],
  },
  // 物码营销
  {
    id: 'internal',
    name: '内部活动平台',
    businessType: '物码营销',
    acquisitionMethod: '共享数仓',
    updateFrequency: '实时',
    updateFrequencyDetail: '与内部数仓实时同步，用户行为事件实时入库。',
    dataTypes: [
      {
        id: 'internal-behavior',
        platformId: 'internal',
        name: '用户行为数据',
        description: '物码活动产生的用户行为事件，含扫码、点击、参与任务、领奖等。',
        fields: [
          { id: 'f1', name: '时间', description: '行为发生时间' },
          { id: 'f2', name: '用户ID', description: '脱敏用户标识' },
          { id: 'f3', name: '活动ID', description: '活动标识' },
          { id: 'f4', name: '行为类型', description: '扫码/点击/参与/领奖' },
          { id: 'f5', name: '渠道', description: '触达渠道' },
          { id: 'f6', name: '设备类型', description: 'iOS/Android/H5' },
        ],
        downloadConditions: [condClient, condDateRange, condActivity],
        recordCount: 125000,
        lastUpdatedAt: '2025-11-10 10:45',
      },
    ],
  },
]

const iconByPlatform: Record<string, string> = {
  alipay: 'alipay',
  wechat: 'wechat',
  'wechat-shop': 'shop',
  douyin: 'douyin',
  meituan: 'meituan',
  taobao: 'taobao',
  jd: 'jd',
  duodian: 'store',
  internal: 'database',
}

function flattenCategories(): DataCategory[] {
  const list: DataCategory[] = []
  platforms.forEach((platform) => {
    platform.dataTypes.forEach((dt) => {
      list.push({
        id: dt.id,
        platformId: platform.id,
        platformName: platform.name,
        name: dt.name,
        description: dt.description,
        businessType: platform.businessType,
        acquisitionMethod: platform.acquisitionMethod,
        updateFrequency: platform.updateFrequency,
        updateFrequencyDetail: platform.updateFrequencyDetail,
        supportImport: false,
        icon: iconByPlatform[platform.id] ?? 'database',
        tags: [platform.name, dt.name],
        fields: dt.fields,
        downloadConditions: dt.downloadConditions,
        sampleClients: mockMyClients.map((c) => c.name),
        recordCount: dt.recordCount,
        lastUpdatedAt: dt.lastUpdatedAt,
      })
    })
  })
  return list
}

function findDataTypeById(dataTypeId: string): DataType | undefined {
  for (const platform of platforms) {
    const dt = platform.dataTypes.find((d) => d.id === dataTypeId)
    if (dt) return dt
  }
  return undefined
}

function findPlatformById(platformId: string): DataSourcePlatform | undefined {
  return platforms.find((p) => p.id === platformId)
}

function generateSampleRecords(
  dataTypeId: string,
  platformId: string,
  clientId: string,
  clientName: string,
  businessType: DataWarehouseBusinessType,
  count: number,
): DataRecord[] {
  const records: DataRecord[] = []
  const baseDate = new Date('2025-11-10')

  for (let i = 0; i < count; i++) {
    const date = new Date(baseDate)
    date.setDate(date.getDate() - Math.floor(i / 3))
    const dateStr = date.toISOString().slice(0, 10)
    const record: DataRecord = {
      id: `${dataTypeId}-${clientId}-${i}`,
      dataTypeId,
      platformId,
      clientId,
      clientName,
      businessType,
      period: dateStr,
    }

    if (dataTypeId.includes('activity') || dataTypeId.includes('plan')) {
      const startDate = dateStr
      const endDate = new Date(date.getTime() + 30 * 86400000).toISOString().slice(0, 10)
      record['活动ID'] = dataTypeId.includes('plan') ? `plan-${1000 + i}` : `act-${2000 + i}`
      record['活动名称'] = ['双11大促', '品牌日', '新品推广', '节日特惠'][i % 4]
      record['开始日期'] = startDate
      record['结束日期'] = endDate
      record['开始时间'] = startDate
      record['结束时间'] = endDate
      record['预算(元)'] = Math.floor(Math.random() * 500000) + 100000
      record['状态'] = i % 5 === 0 ? '已结束' : '进行中'
      if (dataTypeId.includes('plan')) {
        record['方案ID'] = record['活动ID']
        record['方案名称'] = record['活动名称']
        record['方案类型'] = ['满减', '品类券', '单品券'][i % 3]
        record['开始/结束日期'] = `${startDate} ~ ${endDate}`
      }
    } else if (dataTypeId.includes('bill') || dataTypeId.includes('touch')) {
      record['日期'] = dateStr
      record['账单日期'] = dateStr
      record['消耗(元)'] = Math.floor(Math.random() * 80000) + 10000
      record['核销(元)'] = Math.floor(Math.random() * 120000) + 20000
      record['订单数'] = Math.floor(Math.random() * 500) + 50
      record['核销笔数'] = record['订单数']
      record['ROI'] = `${(Math.random() * 1.5 + 0.8).toFixed(2)}`
      if (dataTypeId.includes('alipay-bill')) {
        record['账单类型'] = i % 2 === 0 ? '日' : '月'
        record['消耗金额(元)'] = record['消耗(元)']
        record['核销金额(元)'] = record['核销(元)']
        record['订单笔数'] = record['订单数']
      }
      if (dataTypeId.includes('touch')) {
        record['活动名称'] = ['碰一碰满减', '碰一碰红包'][i % 2]
        record['交易笔数'] = Math.floor(Math.random() * 300) + 30
        record['交易金额(元)'] = Math.floor(Math.random() * 50000) + 5000
        record['核销率'] = `${(Math.random() * 20 + 70).toFixed(1)}%`
      }
    } else if (dataTypeId.includes('merchant')) {
      record['商户ID'] = `M${1000 + i}`
      record['商户名称'] = [`华东旗舰店${i}`, `华南合作店${i}`, `华北直营店${i}`][i % 3]
      record['区域'] = ['华东', '华南', '华北'][i % 3]
      record['开通状态'] = i % 10 === 0 ? '待开通' : '已开通'
      record['签约日期'] = '2024-06-01'
    } else if (dataTypeId.includes('rtb')) {
      record['日期'] = dateStr
      record['目标页面'] = ['首页', '搜索', '商详', '活动页'][i % 4]
      record['模块'] = ['焦点图', '商品流', '结果位', '加购模块'][i % 4]
      record['曝光量'] = Math.floor(Math.random() * 100000) + 10000
      record['点击量'] = Math.floor(Math.random() * 8000) + 500
      record['转化数'] = Math.floor(Math.random() * 500) + 50
    } else if (dataTypeId.includes('behavior')) {
      record['时间'] = `${dateStr} ${String(10 + (i % 12)).padStart(2, '0')}:${String(i % 60).padStart(2, '0')}:00`
      record['用户ID'] = `u_${clientId}_${10000 + i}`
      record['活动ID'] = `act-${3000 + (i % 5)}`
      record['行为类型'] = ['扫码', '点击', '参与', '领奖'][i % 4]
      record['渠道'] = ['H5', '小程序', 'APP'][i % 3]
      record['设备类型'] = ['iOS', 'Android', 'H5'][i % 3]
    }

    records.push(record)
  }

  return records
}

const mockImportRecords: ImportRecord[] = []
const mockDownloadRecords: DownloadRecord[] = []

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ---- 采集任务管理 Mock Data ----

const commonCondBrand = { id: 'brand', label: '品牌', type: 'select' as const, required: true, options: [{ label: '达能', value: 'danone' }, { label: '伊利', value: 'yili' }, { label: '嘉士伯', value: 'carlsberg' }, { label: '百威', value: 'budweiser' }] }
const commonCondCategory = { id: 'category', label: '品类', type: 'select' as const, required: false, options: [{ label: '全部品类', value: '' }, { label: '乳制品', value: 'dairy' }, { label: '饮料', value: 'beverage' }, { label: '零食', value: 'snack' }, { label: '母婴', value: 'baby' }] }
const commonCondDate = { id: 'dateRange', label: '日期范围', type: 'dateRange' as const, required: true }
const commonCondBillType = { id: 'billType', label: '账单类型', type: 'select' as const, required: true, options: [{ label: '日账单', value: 'day' }, { label: '月账单', value: 'month' }] }
const commonCondPagePos = { id: 'pagePosition', label: '页面位置', type: 'select' as const, required: false, options: [{ label: '全部', value: '' }, { label: '首页-焦点图', value: 'home-banner' }, { label: '首页-商品流', value: 'home-feed' }, { label: '搜索-结果位', value: 'search-result' }, { label: '商详-加购模块', value: 'detail-cart' }, { label: '活动页-主会场', value: 'event-main' }] }
const commonCondActivityId = { id: 'activityId', label: '活动ID', type: 'text' as const, required: false }

const instRetailPages = [
  {
    id: 'sand-table',
    name: '经营沙盘',
    modules: [
      { id: 'core-kpi', name: '核心指标', conditions: [commonCondBrand, commonCondCategory, commonCondDate] },
      { id: 'sales-trend', name: '销售走势', conditions: [commonCondBrand, commonCondCategory, commonCondDate] },
      { id: 'goods-rank', name: '商品排行', conditions: [commonCondBrand, commonCondCategory, commonCondDate] },
      { id: 'competitor', name: '竞品对比', conditions: [commonCondBrand, commonCondDate] },
    ],
  },
  {
    id: 'activity-mgmt',
    name: '活动管理',
    modules: [
      { id: 'activity-list', name: '活动列表', conditions: [commonCondBrand, commonCondDate] },
      { id: 'activity-detail', name: '活动明细', conditions: [commonCondActivityId, commonCondDate] },
    ],
  },
  {
    id: 'bill-center',
    name: '账单中心',
    modules: [
      { id: 'marketing-bill', name: '营销账单', conditions: [commonCondBillType, commonCondDate] },
    ],
  },
  {
    id: 'rtb-ads',
    name: 'RTB广告',
    modules: [
      { id: 'rtb-detail', name: '投放明细', conditions: [commonCondPagePos, commonCondDate] },
      { id: 'audience-pack', name: '人群包数据', conditions: [commonCondBrand] },
    ],
  },
]

const collectionPlatformConfigs: CollectionPlatformConfig[] = [
  { platformId: 'meituan', platformName: '美团闪购', pages: instRetailPages },
  { platformId: 'taobao-flash', platformName: '淘宝闪购', pages: instRetailPages },
  { platformId: 'jddj', platformName: '京东到家', pages: instRetailPages },
  { platformId: 'dmall', platformName: '多点', pages: instRetailPages },
  {
    platformId: 'alipay',
    platformName: '支付宝',
    pages: [
      {
        id: 'activity-center',
        name: '活动中心',
        modules: [
          { id: 'alipay-act-list', name: '活动列表', conditions: [commonCondBrand, commonCondDate] },
          { id: 'alipay-act-detail', name: '活动明细', conditions: [commonCondActivityId, commonCondDate] },
        ],
      },
      {
        id: 'bill-center',
        name: '账单中心',
        modules: [
          { id: 'alipay-bill', name: '营销账单', conditions: [commonCondBillType, commonCondDate] },
          { id: 'alipay-nfc-bill', name: '碰一碰账单', conditions: [commonCondDate] },
        ],
      },
      {
        id: 'merchant-mgmt',
        name: '商户管理',
        modules: [
          { id: 'merchant-list', name: '商户清单', conditions: [commonCondBrand] },
        ],
      },
    ],
  },
  {
    platformId: 'wechat-ministore',
    platformName: '微信小店',
    pages: [
      {
        id: 'activity-mgmt',
        name: '活动管理',
        modules: [
          { id: 'wx-act-list', name: '活动列表', conditions: [commonCondBrand, commonCondDate] },
          { id: 'wx-act-bill', name: '活动账单', conditions: [commonCondBillType, commonCondDate] },
        ],
      },
      {
        id: 'shop-bill',
        name: '小店账单',
        modules: [
          { id: 'wx-sales-bill', name: '销售账单', conditions: [commonCondDate] },
        ],
      },
    ],
  },
  {
    platformId: 'douyin',
    platformName: '抖音来客',
    pages: [
      {
        id: 'activity-mgmt',
        name: '活动管理',
        modules: [
          { id: 'dy-act-list', name: '活动列表', conditions: [commonCondBrand, commonCondDate] },
          { id: 'dy-act-bill', name: '活动账单', conditions: [commonCondDate] },
        ],
      },
    ],
  },
]

const mockCollectionTasks: CollectionTask[] = [
  {
    id: 'CT-001',
    name: '达能美团闪购11月经营数据',
    platformId: 'meituan', platformName: '美团闪购',
    clientId: 'C-001', clientName: '达能',
    period: ['2025-11-01', '2025-11-30'],
    modules: [
      { pageId: 'sand-table', pageName: '经营沙盘', moduleId: 'core-kpi', moduleName: '核心指标', conditionGroups: [{ brand: 'danone', category: 'dairy', dateRange: '2025-11-01~2025-11-30' }, { brand: 'danone', category: 'beverage', dateRange: '2025-11-01~2025-11-30' }] },
      { pageId: 'sand-table', pageName: '经营沙盘', moduleId: 'sales-trend', moduleName: '销售走势', conditionGroups: [{ brand: 'danone', category: 'dairy', dateRange: '2025-11-01~2025-11-30' }, { brand: 'danone', category: 'beverage', dateRange: '2025-11-01~2025-11-30' }] },
      { pageId: 'bill-center', pageName: '账单中心', moduleId: 'marketing-bill', moduleName: '营销账单', conditionGroups: [{ billType: 'day', dateRange: '2025-11-01~2025-11-30' }] },
    ],
    status: '执行中', createdBy: '张三', createdAt: '2025-11-12 10:30', reviewedBy: '数据组-李四', reviewedAt: '2025-11-12 14:00',
  },
  {
    id: 'CT-002',
    name: '伊利京东到家Q4活动数据',
    platformId: 'jddj', platformName: '京东到家',
    clientId: 'C-002', clientName: '伊利',
    period: ['2025-10-01', '2025-12-31'],
    modules: [
      { pageId: 'activity-mgmt', pageName: '活动管理', moduleId: 'activity-list', moduleName: '活动列表', conditionGroups: [{ brand: 'yili', dateRange: '2025-10-01~2025-12-31' }] },
      { pageId: 'activity-mgmt', pageName: '活动管理', moduleId: 'activity-detail', moduleName: '活动明细', conditionGroups: [{ activityId: '', dateRange: '2025-10-01~2025-12-31' }] },
    ],
    status: '待复核', createdBy: '王五', createdAt: '2025-11-11 16:20',
  },
  {
    id: 'CT-003',
    name: '嘉士伯支付宝10月账单',
    platformId: 'alipay', platformName: '支付宝',
    clientId: 'C-004', clientName: '嘉士伯',
    period: ['2025-10-01', '2025-10-31'],
    modules: [
      { pageId: 'bill-center', pageName: '账单中心', moduleId: 'alipay-bill', moduleName: '营销账单', conditionGroups: [{ billType: 'month', dateRange: '2025-10-01~2025-10-31' }] },
    ],
    status: '已完成', createdBy: '张三', createdAt: '2025-11-01 09:00', reviewedBy: '数据组-李四', reviewedAt: '2025-11-01 10:30',
  },
  {
    id: 'CT-004',
    name: '百威多点RTB投放数据',
    platformId: 'dmall', platformName: '多点',
    clientId: 'C-006', clientName: '百威',
    period: ['2025-11-01', '2025-11-30'],
    modules: [
      { pageId: 'rtb-ads', pageName: 'RTB广告', moduleId: 'rtb-detail', moduleName: '投放明细', conditionGroups: [{ pagePosition: 'home-banner', dateRange: '2025-11-01~2025-11-30' }, { pagePosition: 'home-feed', dateRange: '2025-11-01~2025-11-30' }] },
      { pageId: 'rtb-ads', pageName: 'RTB广告', moduleId: 'audience-pack', moduleName: '人群包数据', conditionGroups: [{ brand: 'budweiser' }] },
    ],
    status: '草稿', createdBy: '王五', createdAt: '2025-11-13 14:00',
  },
  {
    id: 'CT-005',
    name: '达能淘宝闪购双11专项',
    platformId: 'taobao-flash', platformName: '淘宝闪购',
    clientId: 'C-001', clientName: '达能',
    period: ['2025-11-01', '2025-11-15'],
    modules: [
      { pageId: 'sand-table', pageName: '经营沙盘', moduleId: 'core-kpi', moduleName: '核心指标', conditionGroups: [{ brand: 'danone', category: '', dateRange: '2025-11-01~2025-11-15' }] },
      { pageId: 'sand-table', pageName: '经营沙盘', moduleId: 'competitor', moduleName: '竞品对比', conditionGroups: [{ brand: 'danone', dateRange: '2025-11-01~2025-11-15' }] },
    ],
    status: '已暂停', createdBy: '张三', createdAt: '2025-11-10 11:00', reviewedBy: '数据组-赵六', reviewedAt: '2025-11-10 15:00',
  },
]

export class DataWarehouseService {
  static async getPlatforms(): Promise<DataSourcePlatform[]> {
    await delay(200)
    return [...platforms]
  }

  static async getCategories(): Promise<DataCategory[]> {
    await delay(200)
    return flattenCategories()
  }

  static async getMyClients(): Promise<{ id: string; name: string }[]> {
    await delay(100)
    return [...mockMyClients]
  }

  static async getDataTypeById(id: string): Promise<DataType | undefined> {
    await delay(50)
    return findDataTypeById(id)
  }

  static async getPlatformById(id: string): Promise<DataSourcePlatform | undefined> {
    await delay(50)
    return findPlatformById(id)
  }

  static async getCategoryById(id: string): Promise<DataCategory | undefined> {
    await delay(50)
    return flattenCategories().find((c) => c.id === id)
  }

  static async queryData(
    dataTypeId: string,
    clientId: string,
    _conditions?: Record<string, string>, // eslint-disable-line @typescript-eslint/no-unused-vars
  ): Promise<DataRecord[]> {
    await delay(400)
    const client = mockMyClients.find((c) => c.id === clientId)
    if (!client) return []
    const dt = findDataTypeById(dataTypeId)
    const platform = dt ? findPlatformById(dt.platformId) : undefined
    if (!dt || !platform) return []
    return generateSampleRecords(
      dataTypeId,
      platform.id,
      clientId,
      client.name,
      platform.businessType,
      18,
    )
  }

  static async downloadData(
    dataTypeId: string,
    clientId: string,
    period: string,
    conditions?: Record<string, string>,
  ): Promise<{ success: boolean; message: string }> {
    await delay(600)
    const dt = findDataTypeById(dataTypeId)
    const platform = dt ? findPlatformById(dt.platformId) : undefined
    const client = mockMyClients.find((c) => c.id === clientId)
    if (!dt || !platform || !client) return { success: false, message: '参数错误' }

    mockDownloadRecords.unshift({
      id: `dl-${Date.now()}`,
      categoryId: dataTypeId,
      categoryName: dt.name,
      platformName: platform.name,
      clientId,
      clientName: client.name,
      period,
      conditions,
      downloadedBy: '当前用户',
      downloadedAt: new Date().toLocaleString('zh-CN'),
      fileSize: `${(Math.random() * 4 + 0.5).toFixed(1)} MB`,
    })

    return { success: true, message: '数据已生成，开始下载' }
  }

  static async getDownloadRecords(): Promise<DownloadRecord[]> {
    await delay(200)
    return [...mockDownloadRecords]
  }

  static async getImportRecords(categoryId?: string): Promise<ImportRecord[]> {
    await delay(200)
    if (categoryId) {
      return mockImportRecords.filter((r) => r.categoryId === categoryId)
    }
    return [...mockImportRecords]
  }

  static async importData(
    categoryId: string,
    clientId: string,
    fileName: string,
  ): Promise<{ success: boolean; message: string; recordCount?: number }> {
    await delay(800)
    const cat = flattenCategories().find((c) => c.id === categoryId)
    const client = mockMyClients.find((c) => c.id === clientId)
    if (!client) return { success: false, message: '客户不存在' }
    const recordCount = Math.floor(Math.random() * 500) + 100
    mockImportRecords.unshift({
      id: `imp-${Date.now()}`,
      categoryId,
      categoryName: cat?.name ?? fileName,
      clientId,
      clientName: client.name,
      fileName,
      importedBy: '当前用户',
      importedAt: new Date().toLocaleString('zh-CN'),
      status: '成功',
      recordCount,
    })
    return { success: true, message: `成功导入 ${recordCount} 条记录`, recordCount }
  }

  static filterCategories(
    categories: DataCategory[],
    filters: {
      businessType?: DataWarehouseBusinessType | '全部'
      acquisitionMethod?: string
      keyword?: string
    },
  ): DataCategory[] {
    return categories.filter((cat) => {
      if (
        filters.businessType &&
        filters.businessType !== '全部' &&
        cat.businessType !== filters.businessType
      )
        return false
      if (
        filters.acquisitionMethod &&
        filters.acquisitionMethod !== '全部' &&
        cat.acquisitionMethod !== filters.acquisitionMethod
      )
        return false
      if (filters.keyword) {
        const kw = filters.keyword.toLowerCase()
        return (
          cat.name.toLowerCase().includes(kw) ||
          cat.platformName.toLowerCase().includes(kw) ||
          cat.description.toLowerCase().includes(kw) ||
          cat.tags.some((t) => t.toLowerCase().includes(kw))
        )
      }
      return true
    })
  }

  static filterPlatforms(
    platformList: DataSourcePlatform[],
    filters: {
      businessType?: DataWarehouseBusinessType | '全部'
      keyword?: string
    },
  ): DataSourcePlatform[] {
    return platformList.filter((platform) => {
      if (
        filters.businessType &&
        filters.businessType !== '全部' &&
        platform.businessType !== filters.businessType
      )
        return false
      if (filters.keyword) {
        const kw = filters.keyword.toLowerCase()
        return (
          platform.name.toLowerCase().includes(kw) ||
          platform.dataTypes.some(
            (dt) =>
              dt.name.toLowerCase().includes(kw) ||
              dt.description.toLowerCase().includes(kw),
          )
        )
      }
      return true
    })
  }

  // ---- 采集任务管理 ----
  static getCollectionPlatformConfigs(): CollectionPlatformConfig[] {
    return collectionPlatformConfigs
  }

  static async getCollectionTasks(): Promise<CollectionTask[]> {
    await delay(200)
    return [...mockCollectionTasks]
  }

  static async createCollectionTask(task: Omit<CollectionTask, 'id' | 'createdAt' | 'status'>): Promise<CollectionTask> {
    await delay(300)
    const newTask: CollectionTask = {
      ...task,
      id: `CT-${String(mockCollectionTasks.length + 1).padStart(3, '0')}`,
      status: '待复核',
      createdAt: new Date().toLocaleString('zh-CN'),
    }
    mockCollectionTasks.unshift(newTask)
    return newTask
  }

  static async updateCollectionTaskStatus(id: string, status: CollectionTaskStatus): Promise<void> {
    await delay(200)
    const task = mockCollectionTasks.find((t) => t.id === id)
    if (task) task.status = status
  }
}
