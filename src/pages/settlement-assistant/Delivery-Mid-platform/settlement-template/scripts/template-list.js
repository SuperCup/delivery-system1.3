// 环节管理相关代码
let currentProcessType = 'material';
let processData = {
    material: [],
    delivery: [],
    acceptance: [],
    customer: [],
    stamp: []
};

// 默认资料准备环节数据
const defaultMaterialProcesses = [
    {
        id: 'default_1',
        name: '销售合同收集',
        description: '收集并整理销售合同相关文件',
        materials: [
            { id: 1, name: '销售合同正本', required: true },
            { id: 2, name: '合同附件', required: true },
            { id: 3, name: '商务条款', required: true }
        ]
    },
    {
        id: 'default_2',
        name: '结算单据准备',
        description: '准备结算所需的各类单据',
        materials: [
            { id: 1, name: '结算确认单', required: true },
            { id: 2, name: '发票', required: true },
            { id: 3, name: '对账单', required: true }
        ]
    }
];

// 客户管理数据结构
const customerData = {
    contacts: [
        {
            id: 1,
            name: 'Owen',
            position: '总部结算经理',
            entity: '总部',
            email: 'zhangsan@example.com',
            phone: '13812345678',
            wechat: 'zhangsan888',
            responsibilities: ['结算确认'],
            updatedBy: '李四',
            updatedAt: '2024-03-20 10:30:00'
        },
        {
            id: 2,
            name: '李四',
            position: '结算专员',
            entity: '湖南大区',
            email: 'lisi@example.com',
            phone: '13987654321',
            wechat: 'lisi666',
            responsibilities: ['结算资料接收'],
            updatedBy: '王五',
            updatedAt: '2024-03-19 15:45:00'
        },
        {
            id: 3,
            name: '王五',
            position: '结算专员',
            entity: '广东大区',
            email: 'wangwu@example.com',
            phone: '13567891234',
            wechat: 'wangwu999',
            responsibilities: ['结算确认', '结算资料接收'],
            updatedBy: '张三',
            updatedAt: '2024-03-18 09:15:00'
        },
        {
            id: 4,
            name: '赵六',
            position: '财务经理',
            entity: '华中大区',
            email: 'zhaoliu@example.com',
            phone: '13789012345',
            wechat: 'zhaoliu777',
            responsibilities: ['预算确认', '结算确认'],
            updatedBy: '李四',
            updatedAt: '2024-03-17 14:20:00'
        },
        {
            id: 5,
            name: '钱七',
            position: '财务经理',
            entity: '西北大区',
            email: 'qianqi@example.com',
            phone: '13678901234',
            wechat: 'qianqi555',
            responsibilities: ['系统结算'],
            updatedBy: '王五',
            updatedAt: '2024-03-16 11:30:00'
        }
    ]
};

// 客户职责类型
const CUSTOMER_RESPONSIBILITIES = {
    BUDGET_CONFIRMATION: '预算确认',
    SETTLEMENT_CONFIRMATION: '结算确认',
    MATERIAL_RECEIPT: '结算资料接收',
    SYSTEM_ACCESS: '客户系统结算入口开通'
};

// 1. 流程管理样例数据（覆盖原有 sampleTemplates）
const sampleTemplates = [
  {
    id: 1,
    name: '服务费总部结算',
    processes: [
      { id: 1, name: 'PO', type: 'material' },
      { id: 2, name: '合同', type: 'material' },
      { id: 3, name: '核销明细', type: 'material' },
      { id: 4, name: '资源位截图', type: 'material' },
      { id: 5, name: '总部确认邮件', type: 'delivery' },
      { id: 6, name: 'TM上传资料', type: 'customer' }
    ]
  },
  {
    id: 2,
    name: '核销费区域结算',
    processes: [
      { id: 1, name: 'PO', type: 'material' },
      { id: 2, name: '合同', type: 'material' },
      { id: 3, name: '核销明细', type: 'material' },
      { id: 4, name: '资源位截图', type: 'material' },
      { id: 5, name: '总部确认邮件', type: 'delivery' },
      { id: 6, name: 'TM上传资料', type: 'customer' }
    ]
  },
  {
    id: 3,
    name: '湖南核销费结算',
    processes: [
      { id: 1, name: 'PO', type: 'material' },
      { id: 2, name: '合同', type: 'material' },
      { id: 3, name: '核销明细', type: 'material' },
      { id: 4, name: '资源位截图', type: 'material' },
      { id: 5, name: '总部确认邮件', type: 'delivery' },
      { id: 6, name: 'TM上传资料', type: 'customer' }
    ]
  },
  {
    id: 4,
    name: '华中核销费结算',
    processes: [
      { id: 1, name: 'PO', type: 'material' },
      { id: 2, name: '合同', type: 'material' },
      { id: 3, name: '核销明细', type: 'material' },
      { id: 4, name: '资源位截图', type: 'material' },
      { id: 5, name: '总部确认邮件', type: 'delivery' },
      { id: 6, name: 'TM上传资料', type: 'customer' }
    ]
  },
  {
    id: 5,
    name: 'RTB费用结算',
    processes: [
      { id: 1, name: 'PO', type: 'material' },
      { id: 2, name: '合同', type: 'material' },
      { id: 3, name: '核销明细', type: 'material' },
      { id: 4, name: '资源位截图', type: 'material' },
      { id: 5, name: '总部确认邮件', type: 'delivery' },
      { id: 6, name: 'TM上传资料', type: 'customer' }
    ]
  }
];

// 3. 环节管理类型只保留三种
const processTypes = [
  { type: 'material', name: '资料准备' },
  { type: 'delivery', name: '结算交付确认' },
  { type: 'acceptance', name: '结算验收确认' },
  { type: 'customer', name: '客户系统结算' }
];

// 4. 资料准备环节仅可选一份资料且从资料管理中选择
// 在资料准备环节表单渲染时，使用下拉选择 materialManagementData
// 伪代码：
// <select name="materialId"> ...materialManagementData.map(m => `<option value="${m.id}">${m.materialName}</option>`) ... </select>
// 并禁止添加多个资料项

// 5. 修复客户管理样例数据不显示
// 确保 customerData.contacts 渲染逻辑在页面加载时被调用
// 在页面初始化时调用 renderCustomerList(customerData.contacts)

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded'); // 调试日志
    // 初始化标签页切换
    initTabs();
    // 加载模板列表
    loadTemplates();
    // 初始化环节管理
    initProcessManagement();
    // 确保资料列表容器存在
    const materialList = document.getElementById('materialList');
    if (materialList) {
        console.log('Material list container found'); // 调试日志
    } else {
        console.error('Material list container not found'); // 调试日志
    }
});

// 初始化标签页切换
function initTabs() {
    console.log('Initializing tabs...');
    
    // 获取所有标签和内容
    const tabs = {
        templateArrayTab: 'templateArrayContent',
        materialTab: 'materialContent',
        processTab: 'processContent',
        customerTab: 'customerContent'
    };

    // 为每个标签添加点击事件
    Object.entries(tabs).forEach(([tabId, contentId]) => {
        const tab = document.getElementById(tabId);
        const content = document.getElementById(contentId);
        
        if (tab && content) {
            tab.addEventListener('click', () => {
                console.log(`Tab clicked: ${tabId}`);
                
                // 移除所有标签的 active 类
                document.querySelectorAll('.nav-card').forEach(card => {
                    card.classList.remove('active');
                });
                
                // 添加当前标签的 active 类
                tab.classList.add('active');
                
                // 隐藏所有内容
                Object.values(tabs).forEach(id => {
                    const element = document.getElementById(id);
                    if (element) {
                        element.classList.add('hidden');
                    }
                });
                
                // 显示选中的内容
                content.classList.remove('hidden');
                
                // 如果是资料管理标签，加载资料列表
                if (contentId === 'materialContent') {
                    console.log('Loading material list...');
                    loadMaterialList();
                }
            });
        }
    });

    // 默认选中流程管理
    const templateArrayTab = document.getElementById('templateArrayTab');
    if (templateArrayTab) {
        templateArrayTab.classList.add('active');
    }
}

// 加载资料列表
function loadMaterialList() {
    console.log('Loading material list...');
    const materialList = document.getElementById('materialList');
    const searchInput = document.getElementById('materialSearch');
    
    if (!materialList) {
        console.error('Material list container not found');
        return;
    }

    // 清空列表
    materialList.innerHTML = '';

    // 创建资料列表数据
    const materials = [
        { 
            id: 1, 
            name: '广告费结算单-盖章扫描件', 
            acquisitionMethod: '业务人员提供', 
            example: 'ad_fee_settlement.pdf',
            updateTime: '2024-03-20 14:30',
            type: '通用'
        },
        { 
            id: 2, 
            name: '服务费结算单-盖章扫描件', 
            acquisitionMethod: '业务人员提供', 
            example: 'service_fee_settlement.pdf',
            updateTime: '2024-03-20 14:30',
            type: '通用'
        },
        { 
            id: 3, 
            name: '广告费结算单-excel', 
            acquisitionMethod: '业务人员提供', 
            example: 'ad_fee_settlement.xlsx',
            updateTime: '2024-03-20 14:30',
            type: '通用'
        },
        { 
            id: 4, 
            name: '服务费结算单-excel', 
            acquisitionMethod: '业务人员提供', 
            example: 'service_fee_settlement.xlsx',
            updateTime: '2024-03-20 14:30',
            type: '通用'
        },
        { 
            id: 5, 
            name: '季度PO-盖章扫描件', 
            acquisitionMethod: '业务人员提供', 
            example: 'quarterly_po.pdf',
            updateTime: '2024-03-20 14:30',
            type: 'BU'
        },
        { 
            id: 6, 
            name: '年度合同--盖章扫描件', 
            acquisitionMethod: '业务人员提供', 
            example: 'annual_contract.pdf',
            updateTime: '2024-03-20 14:30'
        },
        { 
            id: 7, 
            name: '促销充值凭证', 
            acquisitionMethod: '业务人员提供', 
            example: 'promotion_recharge.pdf',
            updateTime: '2024-03-20 14:30'
        },
        { 
            id: 8, 
            name: '广告充值凭证', 
            acquisitionMethod: '业务人员提供', 
            example: 'ad_recharge.pdf',
            updateTime: '2024-03-20 14:30'
        },
        { 
            id: 9, 
            name: '结案报告-ppt', 
            acquisitionMethod: '业务人员提供', 
            example: 'closing_report.pptx',
            updateTime: '2024-03-20 14:30'
        },
        { 
            id: 10, 
            name: '费用明细-excel', 
            acquisitionMethod: '业务人员提供', 
            example: 'expense_details.xlsx',
            updateTime: '2024-03-20 14:30'
        },
        { 
            id: 11, 
            name: '6个BU核销明细-excel', 
            acquisitionMethod: '业务人员提供', 
            example: 'bu_write_off.xlsx',
            updateTime: '2024-03-20 14:30'
        },
        { 
            id: 12, 
            name: '结算单（华中&湖南模版不一样）：盖公章扫描件', 
            acquisitionMethod: '业务人员提供', 
            example: 'settlement_form.pdf',
            updateTime: '2024-03-20 14:30'
        },
        { 
            id: 13, 
            name: 'BUPO-盖公章扫描件', 
            acquisitionMethod: '业务人员提供', 
            example: 'bu_po.pdf',
            updateTime: '2024-03-20 14:30'
        },
        { 
            id: 14, 
            name: '总部Owen结算确认邮件', 
            acquisitionMethod: '邮件确认', 
            example: 'owen_delivery.pdf',
            updateTime: '2024-03-20 14:30'
        },
        { 
            id: 15, 
            name: '资源位截图', 
            acquisitionMethod: '业务人员提供', 
            example: 'resource_screenshot.png',
            updateTime: '2024-03-20 14:30'
        },
        { 
            id: 16, 
            name: 'BU核销明细', 
            acquisitionMethod: '业务人员提供', 
            example: 'bu_write_off_details.xlsx',
            updateTime: '2024-03-20 14:30'
        }
    ];

    // 创建并添加资料卡片
    materials.forEach(material => {
        const card = document.createElement('div');
        card.className = 'material-card';
        card.innerHTML = `
            <div class="content">
                <div class="flex items-center">
                    <h4>${material.name || '未命名资料'}</h4>
                    <span class="material-type-tag ${material.type === '通用' ? 'type-common' : 
                     material.type === 'BU' ? 'type-bu' : 
                     'type-headquarters'}">${material.type || '通用'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">获取方式：</span>
                    <span class="info-value">${material.acquisitionMethod || '未指定'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">更新时间：</span>
                    <span class="info-value">${material.updateTime || '未更新'}</span>
                </div>
                ${material.example ? `
                    <div class="info-item">
                        <span class="info-label">样例：</span>
                        <a href="#" class="info-value example-link" onclick="previewMaterial('${material.example}')">
                            ${material.example}
                        </a>
                    </div>
                ` : ''}
            </div>
            <div class="actions">
                <button class="action-button edit-btn" onclick="editMaterial(${material.id})">
                    <i class="fas fa-edit"></i> 编辑
                </button>
                <button class="action-button delete-btn" onclick="deleteMaterial(${material.id})">
                    <i class="fas fa-trash"></i> 删除
                </button>
            </div>
        `;
        materialList.appendChild(card);
    });

    console.log('Material list loaded successfully');
}

function createMaterialCard(material) {
    if (!material) {
        console.error('Invalid material data');
        return '';
    }

    const typeClass = material.type === '通用' ? 'type-common' : 
                     material.type === 'BU' ? 'type-bu' : 
                     'type-headquarters';

    return `
        <div class="material-card">
            <div class="content">
                <div class="flex items-center">
                    <h4>${material.name || '未命名资料'}</h4>
                    <span class="material-type-tag ${typeClass}">${material.type || '通用'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">获取方式：</span>
                    <span class="info-value">${material.acquisitionMethod || '未指定'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">更新时间：</span>
                    <span class="info-value">${material.updateTime || '未更新'}</span>
                </div>
                ${material.example ? `
                    <div class="info-item">
                        <span class="info-label">样例：</span>
                        <a href="#" class="info-value example-link" onclick="previewMaterial('${material.example}')">
                            ${material.example}
                        </a>
                    </div>
                ` : ''}
            </div>
            <div class="actions">
                <button class="action-button edit-btn" onclick="editMaterial(${material.id})">
                    <i class="fas fa-edit"></i> 编辑
                </button>
                <button class="action-button delete-btn" onclick="deleteMaterial(${material.id})">
                    <i class="fas fa-trash"></i> 删除
                </button>
            </div>
        </div>
    `;
}

// 加载模板列表
function loadTemplates() {
    const templateList = document.getElementById('templateList');
    
    // 模拟数据
    const templates = [
        {
            id: 1,
            name: '湖南大区结算流程',
            status: 'active',
            description: '湖南大区广告费、服务费结算流程',
            settlementEntity: '湖南大区',
            settlementSubjects: ['广告费', '服务费'],
            processes: [
                { type: 'material', name: '资料准备' },
                { type: 'delivery', name: '结算交付确认' },
                { type: 'acceptance', name: '结算验收确认' },
                { type: 'customer', name: '客户系统结算' }
            ],
            updateTime: '2024-03-20 14:30:00'
        },
        {
            id: 2,
            name: '华中大区结算流程',
            status: 'inactive',
            description: '华中大区广告费、服务费结算流程',
            settlementEntity: '华中大区',
            settlementSubjects: ['广告费', '服务费'],
            processes: [
                { type: 'material', name: '资料准备' },
                { type: 'delivery', name: '结算交付确认' },
                { type: 'acceptance', name: '结算验收确认' }
            ],
            updateTime: '2024-03-19 10:15:00'
        },
        {
            id: 3,
            name: '服务费总部结算',
            status: 'active',
            description: '总部服务费结算流程',
            settlementEntity: '总部',
            settlementSubjects: ['服务费'],
            processes: [
                { type: 'material', name: 'PO' },
                { type: 'material', name: '合同' },
                { type: 'material', name: '核销明细' },
                { type: 'material', name: '资源位截图' },
                { type: 'delivery', name: '总部确认邮件' },
                { type: 'customer', name: 'TM上传资料' }
            ],
            updateTime: '2024-03-21 09:00:00'
        },
        {
            id: 4,
            name: '核销费区域结算',
            status: 'active',
            description: '区域核销费结算流程',
            settlementEntity: '区域',
            settlementSubjects: ['核销费'],
            processes: [
                { type: 'material', name: 'PO' },
                { type: 'material', name: '合同' },
                { type: 'material', name: '核销明细' },
                { type: 'material', name: '资源位截图' },
                { type: 'delivery', name: '总部确认邮件' },
                { type: 'customer', name: 'TM上传资料' }
            ],
            updateTime: '2024-03-21 10:00:00'
        },
        {
            id: 5,
            name: '湖南核销费结算',
            status: 'active',
            description: '湖南核销费结算流程',
            settlementEntity: '湖南大区',
            settlementSubjects: ['核销费'],
            processes: [
                { type: 'material', name: 'PO' },
                { type: 'material', name: '合同' },
                { type: 'material', name: '核销明细' },
                { type: 'material', name: '资源位截图' },
                { type: 'delivery', name: '总部确认邮件' },
                { type: 'customer', name: 'TM上传资料' }
            ],
            updateTime: '2024-03-21 11:00:00'
        }
    ];

    // 渲染模板列表
    templateList.innerHTML = templates.map(template => `
        <div class="template-card bg-white rounded-lg shadow-sm p-4 mb-4">
            <!-- 流程名称和状态 -->
            <div class="flex justify-between items-center mb-4">
                <div class="flex items-center">
                    <h4 class="text-lg font-medium text-gray-900">${template.name}</h4>
                    <span class="ml-2 px-2 py-1 text-xs rounded-full ${template.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                        ${template.status === 'active' ? '已启用' : '已停用'}
                    </span>
                </div>
            </div>

            <!-- 流程说明 -->
            <div class="mb-4">
                <p class="text-sm text-gray-500">${template.description}</p>
            </div>

            <!-- 结算主体 -->
            <div class="mb-4">
                <p class="text-sm text-gray-500">结算主体</p>
                <p class="text-sm font-medium mt-1">${template.settlementEntity}</p>
            </div>

            <!-- 结算科目 -->
            <div class="mb-4">
                <p class="text-sm text-gray-500">结算科目</p>
                <div class="flex flex-wrap gap-1 mt-1">
                    ${template.settlementSubjects.map(subject => `
                        <span class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                            ${subject}
                        </span>
                    `).join('')}
                </div>
            </div>

            <!-- 流程环节 -->
            <div class="mb-4">
                <p class="text-sm text-gray-500">流程环节</p>
                <div class="space-y-3 mt-2">
                    ${template.processes.map(process => `
                        <div class="flex items-center p-2 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors duration-200">
                            <span class="text-base font-medium text-gray-900 mr-2">${process.name}</span>
                            <span class="px-2 py-1 text-xs rounded-full ${getProcessTypeClass(process.type)}">
                                ${getProcessTypeName(process.type)}
                            </span>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- 更新时间 -->
            <div class="mb-4">
                <p class="text-sm text-gray-500">更新时间：${template.updateTime}</p>
            </div>

            <!-- 操作栏 -->
            <div class="flex justify-end space-x-2 border-t pt-4 mt-auto">
                <button class="px-2 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors duration-200 whitespace-nowrap" onclick="editTemplate(${template.id})">
                    编辑
                </button>
                <button class="px-2 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded hover:bg-red-100 transition-colors duration-200 whitespace-nowrap" onclick="deleteTemplate(${template.id})">
                    删除
                </button>
                <button class="px-2 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors duration-200 whitespace-nowrap" onclick="copyTemplate(${template.id})">
                    复制
                </button>
                <button class="px-2 py-1.5 text-xs font-medium ${template.status === 'active' ? 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100' : 'text-green-600 bg-green-50 hover:bg-green-100'} rounded transition-colors duration-200 whitespace-nowrap" onclick="toggleTemplateStatus(${template.id})">
                    ${template.status === 'active' ? '停用' : '启用'}
                </button>
            </div>
        </div>
    `).join('');
}

// 获取环节类型对应的样式类
function getProcessTypeClass(type) {
    const classes = {
        material: 'bg-blue-100 text-blue-800 border border-blue-200',
        delivery: 'bg-green-100 text-green-800 border border-green-200',
        acceptance: 'bg-purple-100 text-purple-800 border border-purple-200',
        customer: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
        stamp: 'bg-red-100 text-red-800 border border-red-200'
    };
    return classes[type] || 'bg-gray-100 text-gray-800 border border-gray-200';
}

// 获取环节类型的中文名称
function getProcessTypeName(type) {
    const names = {
        material: '资料准备',
        delivery: '结算交付确认',
        acceptance: '结算验收确认',
        customer: '客户系统结算',
        stamp: '扫描件盖章'
    };
    return names[type] || '未知类型';
}

// 切换模板状态
function toggleTemplateStatus(id) {
    // TODO: 实现模板状态切换逻辑
    console.log('切换模板状态:', id);
}

// 复制模板
function copyTemplate(id) {
    // TODO: 实现模板复制逻辑
    console.log('复制模板:', id);
}

// 显示环节预览
function showProcessPreview(process) {
    const modal = document.getElementById('processPreviewModal');
    const content = document.getElementById('processPreviewContent');
    const closeBtn = document.getElementById('closePreviewModal');

    let previewContent = '';
    
    // 根据环节类型显示不同的详情内容
    switch (process.type) {
        case 'material':
            previewContent = `
                <div class="mb-4">
                    <h4 class="font-bold text-gray-900">${process.name}</h4>
                    <div class="mt-4 space-y-3">
                        <div class="flex">
                            <span class="w-24 text-gray-600">跟进人：</span>
                            <span class="text-gray-900">${process.follower}</span>
                        </div>
                        <div class="flex">
                            <span class="w-24 text-gray-600">获取阶段：</span>
                            <span class="text-gray-900">${process.stage}</span>
                        </div>
                        <div class="flex">
                            <span class="w-24 text-gray-600">获取途径：</span>
                            <span class="text-gray-900">${process.method}</span>
                        </div>
                        <div class="flex">
                            <span class="w-24 text-gray-600">提供对象：</span>
                            <span class="text-gray-900">${process.provider}</span>
                        </div>
                        <div class="flex">
                            <span class="w-24 text-gray-600">接收对象：</span>
                            <span class="text-gray-900">${process.receiver}</span>
                        </div>
                        <div class="flex">
                            <span class="w-24 text-gray-600">资料样例：</span>
                            <span class="text-gray-900">
                                <a href="#" class="text-blue-600 hover:underline">${process.example}</a>
                            </span>
                        </div>
                        <div class="flex">
                            <span class="w-24 text-gray-600">资料模板：</span>
                            <span class="text-gray-900">
                                <a href="#" class="text-blue-600 hover:underline">${process.template}</a>
                            </span>
                        </div>
                    </div>
                </div>
            `;
            break;
        case 'delivery':
            previewContent = `
                <div class="mb-4">
                    <h4 class="font-bold text-gray-900">${process.name}</h4>
                    <div class="mt-4 space-y-3">
                        <div class="flex">
                            <span class="w-24 text-gray-600">确认方式：</span>
                            <span class="text-gray-900">${process.method}</span>
                        </div>
                        <div class="flex">
                            <span class="w-24 text-gray-600">确认对象：</span>
                            <span class="text-gray-900">${process.target}</span>
                        </div>
                        <div class="flex">
                            <span class="w-24 text-gray-600">未确认处理：</span>
                            <span class="text-gray-900">${process.unconfirmedAction}</span>
                        </div>
                        <div class="flex">
                            <span class="w-24 text-gray-600">所需资料：</span>
                            <span class="text-gray-900">${process.requiredMaterials}</span>
                        </div>
                        <div class="flex">
                            <span class="w-24 text-gray-600">确认反馈：</span>
                            <span class="text-gray-900">${process.feedback}</span>
                        </div>
                    </div>
                </div>
            `;
            break;
        case 'pms':
            previewContent = `
                <div class="mb-4">
                    <h4 class="font-bold text-gray-900">精明购内容不结算流程</h4>
                    <div class="mt-4">
                        <div class="bg-gray-50 p-4 rounded-md">
                            <pre class="whitespace-pre-wrap text-gray-700">${process.instructions}</pre>
                        </div>
                    </div>
                </div>
            `;
            break;
        case 'customer':
            previewContent = `
                <div class="mb-4">
                    <h4 class="font-bold text-gray-900">客户系统结算流程</h4>
                    <div class="mt-4">
                        <div class="bg-gray-50 p-4 rounded-md">
                            <pre class="whitespace-pre-wrap text-gray-700">${process.instructions}</pre>
                        </div>
                    </div>
                </div>
            `;
            break;
        case 'stamp':
            previewContent = `
                <div class="mb-4">
                    <h4 class="font-bold text-gray-900">扫描件盖章</h4>
                    <div class="mt-4">
                        <div class="bg-gray-50 p-4 rounded-md">
                            <pre class="whitespace-pre-wrap text-gray-700">${process.instructions}</pre>
                        </div>
                    </div>
                </div>
            `;
            break;
        default:
            previewContent = `
                <div class="mb-4">
                    <h4 class="font-bold text-gray-900">${process.name}</h4>
                    <p class="text-gray-600 mt-2">${process.description}</p>
                </div>
            `;
    }

    content.innerHTML = previewContent;
    modal.style.display = 'block';

    // 关闭模态框
    closeBtn.onclick = () => {
        modal.style.display = 'none';
    };

    // 点击模态框外部关闭
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
}


// 初始化环节管理
function initProcessManagement() {
    console.log('Initializing process management'); // 调试日志
    
    // 绑定环节类型切换事件
    document.querySelectorAll('.process-type-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.type;
            console.log('Switching to process type:', type); // 调试日志
            switchProcessType(type);
        });
    });

    // 默认加载资料准备环节列表
    loadProcessList('material');
}

// 切换环节类型
function switchProcessType(type) {
    console.log('Switching process type to:', type); // 调试日志
    
    // 更新按钮状态
    document.querySelectorAll('.process-type-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.type === type) {
            btn.classList.add('active');
        }
    });

    // 加载对应类型的环节列表
    loadProcessList(type);
}

// 加载环节列表
function loadProcessList(type) {
    console.log('Loading process list for type:', type); // 调试日志
    
    // 直接调用renderProcessList函数来渲染环节列表
    renderProcessList(type);
}

// 创建环节卡片
function createProcessCard(process) {
    if (!process) {
        console.error('Invalid process data');
        return '';
    }

    const typeClass = process.type === 'material' ? 'process-type-material' : 
                     process.type === 'delivery' ? 'process-type-delivery' : 
                     process.type === 'acceptance' ? 'process-type-acceptance' :
                     'process-type-customer';

    return `
        <div class="process-card">
            <div class="content">
                <div class="flex items-center">
                    <h4>${process.name || '未命名环节'}</h4>
                </div>
                <div class="info-item">
                    <span class="info-label">环节说明：</span>
                    <span class="info-value">${process.description || '无说明'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">跟进人：</span>
                    <span class="info-value">${process.follower || '未指定'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">处理周期：</span>
                    <span class="info-value">${process.cycle || '未指定'}</span>
                </div>
                ${process.type === 'material' ? `
                    <div class="materials-list">
                        <div class="info-label">必要资料：</div>
                        <div class="material-item">
                            <span class="material-name">${process.material ? process.material.name : '无'}</span>
                            <button class="action-button preview-btn" onclick="previewMaterialDetail(${JSON.stringify(process.material)}, 'material')">预览</button>
                        </div>
                    </div>
                ` : ''}
                ${process.type === 'delivery' ? `
                    <div class="info-item">
                        <span class="info-label">确认方：</span>
                        <span class="info-value">${process.confirmer || '未指定'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">确认方式：</span>
                        <span class="info-value">${process.deliveryMethod || '未指定'}</span>
                    </div>
                    ${process.deliveryTemplate ? `
                        <div class="materials-list">
                            <span class="info-label">确认模板：</span>
                            <div class="material-item">
                                <span class="material-name">${process.deliveryTemplate.name}</span>
                                <button class="action-button preview-btn" onclick="previewMaterialDetail(${JSON.stringify(process.deliveryTemplate)}, 'template')">预览</button>
                            </div>
                        </div>
                    ` : ''}
                ` : ''}
                ${process.type === 'acceptance' ? `
                    <div class="info-item">
                        <span class="info-label">验收方：</span>
                        <span class="info-value">${process.acceptor || '未指定'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">验收方式：</span>
                        <span class="info-value">${process.acceptanceMethod || '未指定'}</span>
                    </div>
                    ${process.acceptanceTemplate ? `
                        <div class="materials-list">
                            <span class="info-label">验收模板：</span>
                            <div class="material-item">
                                <span class="material-name">${process.acceptanceTemplate.name}</span>
                                <button class="action-button preview-btn" onclick="previewMaterialDetail(${JSON.stringify(process.acceptanceTemplate)}, 'template')">预览</button>
                            </div>
                        </div>
                    ` : ''}
                ` : ''}
                ${process.type === 'customer' ? `
                    <div class="info-item">
                        <span class="info-label">操作说明：</span>
                        <span class="info-value">${process.instruction || '无说明'}</span>
                    </div>
                    ${process.instructionFile ? `
                        <div class="materials-list">
                            <span class="info-label">操作文档：</span>
                            <div class="material-item">
                                <span class="material-name">${process.instructionFile.name}</span>
                                <button class="action-button preview-btn" onclick="previewMaterialDetail(${JSON.stringify(process.instructionFile)}, 'instruction')">预览</button>
                            </div>
                        </div>
                    ` : ''}
                ` : ''}
            </div>
            <div class="actions">
                <button class="action-button edit-btn" onclick="editProcess('${process.type}', ${process.id})">
                    <i class="fas fa-edit"></i> 编辑
                </button>
                <button class="action-button delete-btn" onclick="deleteProcess('${process.type}', ${process.id})">
                    <i class="fas fa-trash"></i> 删除
                </button>
            </div>
        </div>
    `;
}

// 修改渲染环节列表函数
function renderProcessList(type) {
    const container = document.getElementById('processList');
    if (!container) return;
    // 假设 processData[type] 是数组
    if (!processData[type] || processData[type].length === 0) {
        // 显示占位图
        let placeholderContent = '';
        switch (type) {
            case 'material':
                placeholderContent = `
                    <div class="empty-placeholder">
                        <div class="placeholder-icon">
                            <i class="fas fa-file-alt"></i>
                        </div>
                        <div class="placeholder-text">
                            <p>暂无资料准备环节</p>
                            <p class="text-gray-500">点击\"添加环节\"按钮创建新的资料准备环节</p>
                        </div>
                    </div>
                `;
                break;
            case 'delivery':
                placeholderContent = `
                    <div class="empty-placeholder">
                        <div class="placeholder-icon">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <div class="placeholder-text">
                            <p>暂无结算交付确认环节</p>
                            <p class="text-gray-500">点击\"添加环节\"按钮创建新的结算交付确认环节</p>
                        </div>
                    </div>
                `;
                break;
            case 'customer':
                placeholderContent = `
                    <div class="empty-placeholder">
                        <div class="placeholder-icon">
                            <i class="fas fa-user-tie"></i>
                        </div>
                        <div class="placeholder-text">
                            <p>暂无客户系统结算环节</p>
                            <p class="text-gray-500">点击\"添加环节\"按钮创建新的客户系统结算环节</p>
                        </div>
                    </div>
                `;
                break;
            case 'stamp':
                placeholderContent = `
                    <div class="empty-placeholder">
                        <div class="placeholder-icon">
                            <i class="fas fa-stamp"></i>
                        </div>
                        <div class="placeholder-text">
                            <p>暂无扫描件盖章环节</p>
                            <p class="text-gray-500">点击\"添加环节\"按钮创建新的扫描件盖章环节</p>
                        </div>
                    </div>
                `;
                break;
        }
        container.innerHTML = placeholderContent;
    } else {
        // 渲染环节列表（字符串拼接）
        let html = '';
        processData[type].forEach(process => {
            html += createProcessCard(process);
        });
        container.innerHTML = html;
    }
}

// 修改编辑功能
function editProcess(type, id) {
    const process = processData[type].find(p => p.id === id);
    if (!process) return;

    showAddProcessModal(type);
    
    // 填充表单数据
    const form = document.getElementById('addProcessForm');
    
    // 填充基本信息
    const nameInput = form.querySelector('[name="processName"], [name="deliveryName"], [name="pmsTitle"], [name="customerTitle"], [name="stampTitle"]');
    const descInput = form.querySelector('[name="processDescription"], [name="deliveryDescription"]');
    
    if (nameInput) nameInput.value = process.name;
    if (descInput) descInput.value = process.description || '';

    // 根据类型填充特定数据
    switch (type) {
        case 'material':
            // 清空现有资料项
            document.getElementById('requiredMaterialsList').innerHTML = '';
            // 添加资料项
            process.materials.forEach(material => {
                addMaterialItem();
                const lastItem = document.querySelector('.material-item:last-child');
                lastItem.querySelector('input[type="text"]').value = material.name;
                lastItem.querySelector('input[type="checkbox"]').checked = material.required;
                if (material.templateFile) {
                    lastItem.querySelector('input[type="file"]').value = material.templateFile;
                }
            });
            break;
        case 'delivery':
            // 设置触发类型
            form.querySelector(`input[name="triggerType"][value="${process.triggerType}"]`).checked = true;
            // 设置确认方式
            process.deliveryTypes.forEach(method => {
                form.querySelector(`input[name="deliveryType"][value="${method}"]`).checked = true;
            });
            // 设置依赖项
            process.dependencies.forEach(depId => {
                form.querySelector(`input[name="material_dependency"][value="${depId}"]`).checked = true;
            });
            // 显示/隐藏依赖项选择
            const materialDependencies = document.getElementById('materialDependencies');
            materialDependencies.classList.toggle('hidden', process.triggerType === 'manual');
            break;
        case 'pms':
        case 'customer':
        case 'stamp':
            // 设置操作指引文件
            const guideInput = form.querySelector(`input[name="${type}_guide"]`);
            if (guideInput && process.guideFile) {
                guideInput.value = process.guideFile;
            }
            break;
    }
}

// 删除环节
function deleteProcess(type, id) {
    if (confirm('确定要删除这个环节吗？此操作不可恢复。')) {
        // 检查是否有其他环节依赖此环节
        if (type === 'material') {
            const dependentProcesses = processData.delivery.filter(p => 
                p.dependencies && p.dependencies.includes(id)
            );
            
            if (dependentProcesses.length > 0) {
                const processNames = dependentProcesses.map(p => p.name).join('、');
                if (!confirm(`以下结算确认环节依赖此资料准备环节：${processNames}\n确定要继续删除吗？`)) {
                    return;
                }
            }
        }
        
        processData[type] = processData[type].filter(p => p.id !== id);
        renderProcessList(type);
        showSuccessMessage('环节删除成功');
    }
}

// 加载环节数据
function loadProcessData() {
    // 这里可以添加从服务器加载数据的逻辑
    // 目前使用默认数据
    
    // 资料准备环节数据
    processData.material = [
        {
            id: 'material_1',
            name: '销售合同收集',
            type: 'material',
            description: '收集并整理销售合同相关文件',
            follower: '张三',
            cycle: '2-3个工作日',
            material: { name: '销售合同正本、合同附件、商务条款' }
        },
        {
            id: 'material_2',
            name: '结算单据准备',
            type: 'material',
            description: '准备结算所需的各类单据',
            follower: '李四',
            cycle: '1-2个工作日',
            material: { name: '结算确认单、发票、对账单' }
        }
    ];
    
    // 结算交付确认环节数据
    processData.delivery = [
        {
            id: 'delivery_1',
            name: '总部结算确认',
            type: 'delivery',
            description: '总部财务部门确认结算单据的准确性和完整性',
            follower: '王五',
            cycle: '3-5个工作日',
            confirmer: '总部财务部',
            deliveryMethod: '邮件确认',
            deliveryTemplate: { name: '结算确认模板' }
        },
        {
            id: 'delivery_2',
            name: 'BU结算确认',
            type: 'delivery',
            description: 'BU负责人确认结算金额和结算条件',
            follower: '赵六',
            cycle: '2-3个工作日',
            confirmer: 'BU负责人',
            deliveryMethod: '系统确认',
            deliveryTemplate: { name: 'BU确认模板' }
        }
    ];
    
    // 结算验收确认环节数据
    processData.acceptance = [
        {
            id: 'acceptance_1',
            name: '客户验收确认',
            type: 'acceptance',
            description: '客户方确认服务交付质量和结算金额',
            follower: '钱七',
            cycle: '5-7个工作日',
            acceptor: '客户方',
            acceptanceMethod: '现场验收',
            acceptanceTemplate: { name: '客户验收模板' }
        },
        {
            id: 'acceptance_2',
            name: '项目验收确认',
            type: 'acceptance',
            description: '项目组确认项目完成情况和交付成果',
            follower: '孙八',
            cycle: '3-4个工作日',
            acceptor: '项目组',
            acceptanceMethod: '文档验收',
            acceptanceTemplate: { name: '项目验收模板' }
        }
    ];
    
    // 客户系统结算环节数据
    processData.customer = [
        {
            id: 'customer_1',
            name: '客户系统录入',
            type: 'customer',
            description: '在客户结算系统中录入结算信息',
            follower: '周九',
            cycle: '1-2个工作日',
            instruction: '登录客户系统，按照流程录入结算信息',
            instructionFile: { name: '系统操作指南' }
        },
        {
            id: 'customer_2',
            name: '客户系统审批',
            type: 'customer',
            description: '客户系统内部审批流程确认',
            follower: '吴十',
            cycle: '3-5个工作日',
            instruction: '跟进客户系统内部审批进度，确保及时通过',
            instructionFile: { name: '审批流程说明' }
        }
    ];
    
    renderProcessList(currentProcessType);
}

// 生成随机的资料接收对象组合
function getRandomReceivers() {
    const receivers = ['BU', '总部'];
    const count = Math.floor(Math.random() * 2) + 1; // 随机生成1-2个接收对象
    if (count === 1) {
        return [receivers[Math.floor(Math.random() * receivers.length)]];
    }
    return receivers;
}

// 格式化时间
function formatDateTime(date) {
    const pad = (num) => String(num).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

// 编辑资料
function editMaterial(id) {
    const material = materialManagementData.find(m => m.id === id);
    if (!material) return;

    showAddMaterialModal();
    
    // 填充表单数据
    const form = document.getElementById('addProcessForm');
    
    // 处理普通输入字段
    ['materialName', 'follower', 'stage', 'method', 'provider', 'example', 'updateInfo'].forEach(key => {
        const input = form.querySelector(`[name="${key}"]`);
        if (input && material[key]) {
            input.value = material[key];
        }
    });

    // 处理复选框
    if (material.receiver_types) {
        const checkboxes = form.querySelectorAll('input[name="receiver_type"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = material.receiver_types.includes(checkbox.value);
        });
    }
}

// 删除资料
function deleteMaterial(id) {
    if (confirm('确定要删除这个资料吗？')) {
        const index = materialManagementData.findIndex(m => m.id === id);
        if (index !== -1) {
            materialManagementData.splice(index, 1);
            loadMaterialList();
        }
    }
}

// 预览资料样例
function previewMaterial(filename) {
    const modal = document.getElementById('materialPreviewModal');
    const previewFrame = document.getElementById('previewFrame');
    const previewImage = document.getElementById('previewImage');
    const loadingElement = document.querySelector('.preview-loading');
    const errorElement = document.querySelector('.preview-error');

    // 显示模态框和加载状态
    modal.style.display = 'block';
    loadingElement.classList.remove('hidden');
    previewFrame.classList.add('hidden');
    previewImage.classList.add('hidden');
    errorElement.classList.add('hidden');

    // 获取文件扩展名
    const extension = filename.split('.').pop().toLowerCase();

    // 模拟加载过程
    setTimeout(() => {
        loadingElement.classList.add('hidden');

        // 根据文件类型显示不同的预览
        if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
            // 图片预览
            previewImage.src = `examples/${filename}`; // 这里使用示例路径
            previewImage.classList.remove('hidden');
            previewImage.onerror = () => showPreviewError();
        } else if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension)) {
            // 文档预览（这里使用 Google Docs Viewer 作为示例）
            previewFrame.src = `https://docs.google.com/viewer?embedded=true&url=${encodeURIComponent(window.location.origin + '/examples/' + filename)}`;
            previewFrame.classList.remove('hidden');
            previewFrame.onerror = () => showPreviewError();
        } else {
            // 不支持的文件类型
            showPreviewError();
        }
    }, 1000);

    // 关闭预览
    const closeBtn = document.getElementById('closeMaterialPreviewModal');
    closeBtn.onclick = () => {
        modal.style.display = 'none';
        previewFrame.src = '';
        previewImage.src = '';
    };

    // 点击模态框外部关闭
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
            previewFrame.src = '';
            previewImage.src = '';
        }
    };
}

// 显示预览错误
function showPreviewError() {
    const previewFrame = document.getElementById('previewFrame');
    const previewImage = document.getElementById('previewImage');
    const errorElement = document.querySelector('.preview-error');
    
    previewFrame.classList.add('hidden');
    previewImage.classList.add('hidden');
    errorElement.classList.remove('hidden');
}

// 修改预览功能
function previewMaterialTemplate(filePath) {
    const modal = document.getElementById('materialPreviewModal');
    const previewFrame = document.getElementById('previewFrame');
    const previewImage = document.getElementById('previewImage');
    const loadingElement = document.querySelector('.preview-loading');
    const errorElement = document.querySelector('.preview-error');
    const closeBtn = document.getElementById('closeMaterialPreviewModal');

    // 显示模态框和加载状态
    modal.style.display = 'block';
    loadingElement.classList.remove('hidden');
    previewFrame.classList.add('hidden');
    previewImage.classList.add('hidden');
    errorElement.classList.add('hidden');

    // 获取文件扩展名
    const extension = filePath.split('.').pop().toLowerCase();

    // 模拟加载过程
    setTimeout(() => {
        loadingElement.classList.add('hidden');

        // 根据文件类型显示不同的预览
        if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
            // 图片预览
            previewImage.src = filePath;
            previewImage.classList.remove('hidden');
            previewImage.onerror = () => showPreviewError();
        } else if (extension === 'pdf') {
            // PDF预览
            previewFrame.src = `https://docs.google.com/viewer?embedded=true&url=${encodeURIComponent(window.location.origin + '/' + filePath)}`;
            previewFrame.classList.remove('hidden');
            previewFrame.onerror = () => showPreviewError();
        } else {
            // 不支持的文件类型
            showPreviewError();
        }
    }, 1000);

    // 关闭按钮点击事件
    closeBtn.onclick = () => {
        modal.style.display = 'none';
        previewFrame.src = '';
        previewImage.src = '';
    };

    // 点击模态框外部关闭
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
            previewFrame.src = '';
            previewImage.src = '';
        }
    };
}

function previewGuide(filePath) {
    const modal = document.getElementById('processPreviewModal');
    const previewFrame = document.getElementById('previewFrame');
    const loadingElement = document.querySelector('.preview-loading');
    const errorElement = document.querySelector('.preview-error');
    const closeBtn = document.getElementById('closeProcessPreviewModal');

    // 显示模态框和加载状态
    modal.style.display = 'block';
    loadingElement.classList.remove('hidden');
    previewFrame.classList.add('hidden');
    errorElement.classList.add('hidden');

    // 模拟加载过程
    setTimeout(() => {
        loadingElement.classList.add('hidden');

        // PDF预览
        previewFrame.src = `https://docs.google.com/viewer?embedded=true&url=${encodeURIComponent(window.location.origin + '/' + filePath)}`;
        previewFrame.classList.remove('hidden');
        previewFrame.onerror = () => showPreviewError();
    }, 1000);

    // 关闭按钮点击事件
    closeBtn.onclick = () => {
        modal.style.display = 'none';
        previewFrame.src = '';
    };

    // 点击模态框外部关闭
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
            previewFrame.src = '';
        }
    };
}

// 渲染客户列表
function renderCustomerList() {
    const container = document.getElementById('customerList');
    
    if (!customerData.contacts || customerData.contacts.length === 0) {
        // 显示空状态占位图
        container.innerHTML = `
            <div class="empty-placeholder col-span-4">
                <div class="placeholder-icon">
                    <i class="fas fa-users"></i>
                </div>
                <div class="placeholder-text">
                    <p>暂无客户联系人</p>
                    <p class="text-gray-500">点击"新增客户"按钮添加客户联系人</p>
                </div>
            </div>
        `;
        return;
    }

    // 修改为4列布局
    container.className = 'grid grid-cols-4 gap-4';
    container.innerHTML = customerData.contacts.map(contact => `
        <div class="customer-card bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6" data-customer-id="${contact.id}">
            <div class="flex flex-col h-full">
                <div class="flex-1">
                    <div class="flex justify-between items-start mb-4">
                        <div class="flex-1">
                            <div class="flex items-center gap-2 mb-1">
                                <h4 class="font-bold text-lg text-gray-900">${contact.name}</h4>
                                <span class="text-sm px-2 py-0.5 bg-blue-100 text-blue-800 rounded">${contact.position}</span>
                                <span class="text-xs px-2 py-0.5 bg-gray-100 text-gray-800 rounded ml-2">${contact.entity || ''}</span>
                            </div>
                        </div>
                    </div>
                    <div class="contact-info space-y-3 mb-4">
                        <div class="flex items-center text-gray-600">
                            <i class="fas fa-envelope w-5 text-gray-400"></i>
                            <span class="email-text encrypted-text ml-3 flex-1">${maskEmail(contact.email)}</span>
                            <button class="reveal-btn text-gray-400 hover:text-blue-600 transition-colors duration-200" 
                                    onclick="revealContact('email', ${contact.id})" title="显示">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                        <div class="flex items-center text-gray-600">
                            <i class="fas fa-phone w-5 text-gray-400"></i>
                            <span class="phone-text encrypted-text ml-3 flex-1">${maskPhone(contact.phone)}</span>
                            <button class="reveal-btn text-gray-400 hover:text-blue-600 transition-colors duration-200" 
                                    onclick="revealContact('phone', ${contact.id})" title="显示">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                        <div class="flex items-center text-gray-600">
                            <i class="fab fa-weixin w-5 text-gray-400"></i>
                            <span class="wechat-text encrypted-text ml-3 flex-1">${maskWechat(contact.wechat)}</span>
                            <button class="reveal-btn text-gray-400 hover:text-blue-600 transition-colors duration-200" 
                                    onclick="revealContact('wechat', ${contact.id})" title="显示">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </div>
                    <div class="responsibilities mb-4">
                        <h5 class="text-sm font-medium text-gray-700 mb-2">对接职责</h5>
                        <div class="flex flex-wrap gap-2">
                            ${contact.responsibilities.map(resp => `
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium
                                           ${getResponsibilityTagClass(resp)}">
                                    ${resp}
                                </span>
                            `).join('')}
                        </div>
                    </div>
                    <div class="meta-info flex justify-between items-center text-sm text-gray-500 pt-3 border-t border-gray-100">
                        <div class="flex items-center">
                            <i class="fas fa-user text-gray-400 mr-1"></i>
                            <span>${contact.updatedBy}</span>
                        </div>
                        <div class="flex items-center">
                            <i class="fas fa-clock text-gray-400 mr-1"></i>
                            <span>${contact.updatedAt}</span>
                        </div>
                    </div>
                </div>
                <div class="actions flex justify-end space-x-2 mt-4 pt-4 border-t border-gray-100">
                    <button class="action-btn flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors duration-200" 
                            onclick="editCustomer(${contact.id})">
                        <i class="fas fa-edit mr-1.5"></i>
                        编辑
                    </button>
                    <button class="action-btn flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors duration-200" 
                            onclick="deleteCustomer(${contact.id})">
                        <i class="fas fa-trash mr-1.5"></i>
                        删除
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// 获取职责标签的样式类
function getResponsibilityTagClass(responsibility) {
    switch (responsibility) {
        case '预算确认':
            return 'bg-green-100 text-green-800';
        case '结算确认':
            return 'bg-blue-100 text-blue-800';
        case '结算资料接收':
            return 'bg-purple-100 text-purple-800';
        case '客户系统结算入口开通':
            return 'bg-orange-100 text-orange-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

// 显示添加客户模态框
function showAddCustomerModal() {
    const modal = document.getElementById('addCustomerModal');
    const form = document.getElementById('addCustomerForm');
    form.reset();
    modal.style.display = 'block';
}

// 处理客户表单提交
function handleCustomerSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const customerData = {
        id: Date.now(),
        name: formData.get('customerName'),
        position: formData.get('position'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        wechat: formData.get('wechat'),
        responsibilities: Array.from(formData.getAll('responsibilities')),
        updatedBy: '当前用户', // 这里应该是从登录用户信息中获取
        updatedAt: new Date().toLocaleString()
    };

    // 数据验证
    const errors = validateCustomerData(customerData);
    if (errors.length > 0) {
        showErrorMessages(errors);
        return;
    }

    // 保存客户数据
    customerData.contacts.push(customerData);
    
    // 重新渲染列表
    renderCustomerList();
    
    // 隐藏模态框
    hideAddCustomerModal();
    
    // 显示成功提示
    showSuccessMessage('客户添加成功');
}

// 验证客户数据
function validateCustomerData(data) {
    const errors = [];
    
    if (!data.name) {
        errors.push('客户姓名不能为空');
    }
    if (!data.position) {
        errors.push('客户职位不能为空');
    }
    if (!data.email && !data.phone && !data.wechat) {
        errors.push('至少需要填写一种联系方式');
    }
    if (data.email && !isValidEmail(data.email)) {
        errors.push('邮箱格式不正确');
    }
    if (data.phone && !isValidPhone(data.phone)) {
        errors.push('手机号格式不正确');
    }
    if (data.responsibilities.length === 0) {
        errors.push('至少需要选择一个对接职责');
    }
    
    return errors;
}

// 编辑客户信息
function editCustomer(id) {
    const contact = customerData.contacts.find(c => c.id === id);
    if (!contact) return;

    showAddCustomerModal();
    
    // 填充表单数据
    const form = document.getElementById('addCustomerForm');
    form.querySelector('[name="customerName"]').value = contact.name;
    form.querySelector('[name="position"]').value = contact.position;
    form.querySelector('[name="email"]').value = contact.email;
    form.querySelector('[name="phone"]').value = contact.phone;
    form.querySelector('[name="wechat"]').value = contact.wechat;
    
    // 设置职责
    contact.responsibilities.forEach(resp => {
        form.querySelector(`input[name="responsibilities"][value="${resp}"]`).checked = true;
    });
}

// 删除客户
function deleteCustomer(id) {
    if (confirm('确定要删除这个客户联系人吗？')) {
        customerData.contacts = customerData.contacts.filter(c => c.id !== id);
        renderCustomerList();
        showSuccessMessage('客户删除成功');
    }
}

// 加密显示函数
function maskEmail(email) {
    if (!email) return '';
    const [name, domain] = email.split('@');
    return `${name.charAt(0)}****@${domain}`;
}

function maskPhone(phone) {
    if (!phone) return '';
    return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
}

function maskWechat(wechat) {
    if (!wechat) return '';
    return wechat.substring(0, 1) + '****' + wechat.substring(wechat.length - 1);
}

// 显示完整联系方式
function revealContact(type, id) {
    const contact = customerData.contacts.find(c => c.id === id);
    if (!contact) return;

    const value = contact[type];
    if (!value) return;

    // 这里可以添加权限检查逻辑
    const card = document.querySelector(`[data-customer-id="${id}"]`);
    const textElement = card.querySelector(`.${type}-text`);
    textElement.textContent = value;
}

// 验证工具函数
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
    return /^1[3-9]\d{9}$/.test(phone);
}

// 隐藏添加客户模态框
function hideAddCustomerModal() {
    const modal = document.getElementById('addCustomerModal');
    const form = document.getElementById('addCustomerForm');
    modal.style.display = 'none';
    form.reset();
}

// 初始化客户管理
function initCustomerManagement() {
    renderCustomerList();

    // 初始化新增客户按钮
    document.getElementById('addCustomerBtn').addEventListener('click', showAddCustomerModal);
    
    // 初始化关闭按钮
    document.getElementById('closeCustomerModal').addEventListener('click', hideAddCustomerModal);
    document.getElementById('cancelCustomer').addEventListener('click', hideAddCustomerModal);
    
    // 初始化表单提交
    document.getElementById('addCustomerForm').addEventListener('submit', handleCustomerSubmit);
    
    // 点击模态框外部关闭
    window.addEventListener('click', (event) => {
        const modal = document.getElementById('addCustomerModal');
        if (event.target === modal) {
            hideAddCustomerModal();
        }
    });
}

// 修改页面加载初始化函数
document.addEventListener('DOMContentLoaded', () => {
    // 初始化标签页切换
    initTabs();
    // 加载模板列表
    loadTemplates();
    //加载资料列表
    loadMaterialList();
    // 初始化环节管理
    initProcessManagement();
    // 初始化客户管理
    initCustomerManagement();
    
}); 

// 资料预览抽屉相关函数
function showMaterialDrawer(processId) {
    // 假设 processes 数据在 loadProcessList 作用域外可访问，否则需全局保存
    const allProcesses = [
        // 与 loadProcessList 里的样例数据保持同步
        {
            id: 1,
            type: 'material',
            name: '广告费结算单准备',
            description: '准备广告费结算单及相关资料',
            follower: '张三',
            cycle: '3个工作日',
            material: {
                name: '广告费结算单-盖章扫描件',
                acquisitionMethod: '业务人员提供',
                example: 'ad_fee_settlement.pdf',
                updateTime: '2024-03-20 14:30',
                type: '通用'
            }
        },
        // ... 其他样例 ...
    ];
    const process = allProcesses.find(p => p.id === processId);
    if (!process || !process.material) return;
    const m = process.material;
    const content = `
        <div class="mb-4">
            <div class="font-bold text-lg mb-2">${m.name}</div>
            <div class="mb-2"><span class="font-semibold">获取方式：</span>${m.acquisitionMethod || '未指定'}</div>
            <div class="mb-2"><span class="font-semibold">更新时间：</span>${m.updateTime || '未更新'}</div>
            <div class="mb-2"><span class="font-semibold">资料类型：</span>${m.type || '通用'}</div>
            <div class="mb-2"><span class="font-semibold">样例：</span>${m.example ? `<a href="#" onclick=\"previewMaterial('${m.example}')\" class='text-blue-600 underline'>${m.example}</a>` : '无'}</div>
        </div>
    `;
    document.getElementById('materialDrawerContent').innerHTML = content;
    document.getElementById('materialDrawer').classList.remove('translate-x-full');
}

function closeMaterialDrawer() {
    document.getElementById('materialDrawer').classList.add('translate-x-full');
}

// 附件预览抽屉函数
function showAttachmentDrawer(processId, type) {
    // 与 showMaterialDrawer 类似，查找对应 process
    const allProcesses = [
        {
            id: 3,
            type: 'delivery',
            name: '总部确认',
            description: '等待总部确认结算金额',
            follower: '王五',
            cycle: '5个工作日',
            confirmer: '总部财务部',
            deliveryMethod: '邮件确认',
            deliveryTemplate: {
                name: '总部确认模板.pdf',
                url: 'delivery_template.pdf',
                updateTime: '2024-03-20 15:00'
            }
        },
        {
            id: 5,
            type: 'customer',
            name: '客户系统结算',
            description: '在客户系统中完成结算操作',
            follower: '钱七',
            cycle: '5个工作日',
            instruction: '登录客户系统，上传结算单，等待审核',
            instructionFile: {
                name: '操作说明.pdf',
                url: 'instruction.pdf',
                updateTime: '2024-03-20 15:30'
            }
        },
        // ... 其他样例 ...
    ];
    const process = allProcesses.find(p => p.id === processId);
    let file = null;
    let title = '';
    if (type === 'delivery' && process && process.deliveryTemplate) {
        file = process.deliveryTemplate;
        title = '确认模板预览';
    } else if (type === 'customer' && process && process.instructionFile) {
        file = process.instructionFile;
        title = '操作说明预览';
    }
    if (!file) return;
    const content = `
        <div class="mb-4">
            <div class="font-bold text-lg mb-2">${file.name}</div>
            <div class="mb-2"><span class="font-semibold">更新时间：</span>${file.updateTime || '无'}</div>
            <div class="mb-2"><span class="font-semibold">附件：</span><a href="#" onclick=\"previewMaterial('${file.url}')\" class='text-blue-600 underline'>${file.name}</a></div>
        </div>
    `;
    document.getElementById('materialDrawerContent').innerHTML = content;
    document.querySelector('#materialDrawer h3').textContent = title;
    document.getElementById('materialDrawer').classList.remove('translate-x-full');
}

function previewMaterialDetail(obj, type) {
    const modal = document.getElementById('materialPreviewModal');
    const content = document.getElementById('materialPreviewContent');
    let html = '';
    if (type === 'material') {
        html = `
            <div class="mb-4">
                <div class="font-bold text-lg mb-2">${obj.name}</div>
                <div class="mb-2"><span class="font-semibold">获取方式：</span>${obj.acquisitionMethod || '未指定'}</div>
                <div class="mb-2"><span class="font-semibold">更新时间：</span>${obj.updateTime || '未更新'}</div>
                <div class="mb-2"><span class="font-semibold">资料类型：</span>${obj.type || '通用'}</div>
                <div class="mb-2"><span class="font-semibold">样例：</span>${obj.example ? `<a href="#" onclick=\"previewMaterial('${obj.example}')\" class='text-blue-600 underline'>${obj.example}</a>` : '无'}</div>
            </div>
        `;
    } else if (type === 'delivery' || type === 'customer') {
        html = `
            <div class="mb-4">
                <div class="font-bold text-lg mb-2">${obj.name}</div>
                <div class="mb-2"><span class="font-semibold">更新时间：</span>${obj.updateTime || '无'}</div>
                <div class="mb-2"><span class="font-semibold">附件：</span><a href="#" onclick=\"previewMaterial('${obj.url}')\" class='text-blue-600 underline'>${obj.name}</a></div>
            </div>
        `;
    }
    content.innerHTML = html;
    modal.style.display = 'block';
}

// 显示环节创建抽屉
function showProcessCreateDrawer() {
    const drawerHtml = `
        <div id="processCreateDrawer" class="drawer-overlay">
            <div class="drawer-content">
                <div class="drawer-header">
                    <h3>新增环节</h3>
                    <button onclick="closeProcessCreateDrawer()" class="close-btn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="drawer-body">
                    <form id="processCreateForm">
                        <div class="form-group">
                            <label for="processType">环节类型 <span class="required">*</span></label>
                            <select id="processType" name="processType" required>
                                <option value="">请选择环节类型</option>
                                <option value="material">资料准备</option>
                                <option value="delivery">结算交付确认</option>
                                <option value="acceptance">结算验收确认</option>
                                <option value="customer">客户系统结算</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="processName">环节名称 <span class="required">*</span></label>
                            <input type="text" id="processName" name="processName" placeholder="请输入环节名称" required>
                        </div>
                        <div class="form-group">
                            <label for="processDescription">环节说明</label>
                            <textarea id="processDescription" name="processDescription" placeholder="请输入环节说明" rows="3"></textarea>
                        </div>
                        <div class="form-group">
                            <label for="processFollower">跟进人 <span class="required">*</span></label>
                            <input type="text" id="processFollower" name="processFollower" placeholder="请输入跟进人" required>
                        </div>
                        <div class="form-group">
                            <label for="processCycle">处理周期</label>
                            <input type="text" id="processCycle" name="processCycle" placeholder="例如：3个工作日">
                        </div>
                        
                        <!-- 资料准备类型特有字段 -->
                        <div id="materialFields" class="type-specific-fields" style="display: none;">
                            <div class="form-group">
                                <label for="materialName">资料名称</label>
                                <input type="text" id="materialName" name="materialName" placeholder="请输入资料名称">
                            </div>
                            <div class="form-group">
                                <label for="acquisitionMethod">获取方式</label>
                                <input type="text" id="acquisitionMethod" name="acquisitionMethod" placeholder="例如：业务人员提供">
                            </div>
                            <div class="form-group">
                                <label for="materialType">资料类型</label>
                                <select id="materialType" name="materialType">
                                    <option value="通用">通用</option>
                                    <option value="BU">BU</option>
                                    <option value="总部">总部</option>
                                </select>
                            </div>
                        </div>
                        
                        <!-- 结算交付确认类型特有字段 -->
                        <div id="deliveryFields" class="type-specific-fields" style="display: none;">
                            <div class="form-group">
                                <label for="confirmer">确认方</label>
                                <input type="text" id="confirmer" name="confirmer" placeholder="请输入确认方">
                            </div>
                            <div class="form-group">
                                <label for="deliveryMethod">确认方式</label>
                                <input type="text" id="deliveryMethod" name="deliveryMethod" placeholder="例如：邮件确认">
                            </div>
                        </div>
                        
                        <!-- 结算验收确认类型特有字段 -->
                        <div id="acceptanceFields" class="type-specific-fields" style="display: none;">
                            <div class="form-group">
                                <label for="acceptor">验收方</label>
                                <input type="text" id="acceptor" name="acceptor" placeholder="请输入验收方">
                            </div>
                            <div class="form-group">
                                <label for="acceptanceMethod">验收方式</label>
                                <input type="text" id="acceptanceMethod" name="acceptanceMethod" placeholder="例如：验收报告">
                            </div>
                        </div>
                        
                        <!-- 客户系统结算类型特有字段 -->
                        <div id="customerFields" class="type-specific-fields" style="display: none;">
                            <div class="form-group">
                                <label for="instruction">操作说明</label>
                                <textarea id="instruction" name="instruction" placeholder="请输入操作说明" rows="3"></textarea>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="drawer-footer">
                    <button type="button" onclick="closeProcessCreateDrawer()" class="btn-secondary">取消</button>
                    <button type="button" onclick="submitProcessCreate()" class="btn-primary">保存</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', drawerHtml);
    
    // 绑定环节类型切换事件
    document.getElementById('processType').addEventListener('change', function() {
        const type = this.value;
        // 隐藏所有特定字段
        document.querySelectorAll('.type-specific-fields').forEach(field => {
            field.style.display = 'none';
        });
        
        // 显示对应类型的字段
        if (type === 'material') {
            document.getElementById('materialFields').style.display = 'block';
        } else if (type === 'delivery') {
            document.getElementById('deliveryFields').style.display = 'block';
        } else if (type === 'acceptance') {
            document.getElementById('acceptanceFields').style.display = 'block';
        } else if (type === 'customer') {
            document.getElementById('customerFields').style.display = 'block';
        }
    });
}

// 关闭环节创建抽屉
function closeProcessCreateDrawer() {
    const drawer = document.getElementById('processCreateDrawer');
    if (drawer) {
        drawer.remove();
    }
}

// 提交环节创建
function submitProcessCreate() {
    const form = document.getElementById('processCreateForm');
    const formData = new FormData(form);
    
    // 验证必填字段
    const processType = formData.get('processType');
    const processName = formData.get('processName');
    const processFollower = formData.get('processFollower');
    
    if (!processType || !processName || !processFollower) {
        alert('请填写所有必填字段');
        return;
    }
    
    // 构建环节数据
    const newProcess = {
        id: Date.now().toString(), // 使用时间戳作为临时ID
        type: processType,
        name: processName,
        description: formData.get('processDescription') || '',
        follower: processFollower,
        cycle: formData.get('processCycle') || ''
    };
    
    // 根据类型添加特定字段
    if (processType === 'material') {
        newProcess.material = {
            name: formData.get('materialName') || '',
            acquisitionMethod: formData.get('acquisitionMethod') || '',
            type: formData.get('materialType') || '通用',
            updateTime: new Date().toLocaleString('zh-CN')
        };
    } else if (processType === 'delivery') {
        newProcess.confirmer = formData.get('confirmer') || '';
        newProcess.deliveryMethod = formData.get('deliveryMethod') || '';
        newProcess.deliveryTemplate = { name: '待上传' };
    } else if (processType === 'acceptance') {
        newProcess.acceptor = formData.get('acceptor') || '';
        newProcess.acceptanceMethod = formData.get('acceptanceMethod') || '';
        newProcess.acceptanceTemplate = { name: '待上传' };
    } else if (processType === 'customer') {
        newProcess.instruction = formData.get('instruction') || '';
        newProcess.instructionFile = { name: '待上传' };
    }
    
    console.log('Creating process:', newProcess);
    
    // 将新环节添加到对应类型的数组中
    if (!processData[processType]) {
        processData[processType] = [];
    }
    processData[processType].push(newProcess);
    
    // 显示成功消息
    alert('环节创建成功！');
    
    // 关闭抽屉
    closeProcessCreateDrawer();
    
    // 刷新环节列表
    renderProcessList(processType);
    
    // 如果当前显示的类型与新创建的类型不同，切换到新创建的类型
    if (currentProcessType !== processType) {
        switchProcessType(processType);
    }
}