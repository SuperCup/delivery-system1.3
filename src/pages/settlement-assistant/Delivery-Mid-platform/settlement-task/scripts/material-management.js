// 全局变量
let currentTab = 'customer';
let customerData = {
    contacts: [
        {
            id: 1,
            name: 'Owen',
            position: '总部结算经理',
            entity: '总部',
            email: 'owen@carlsberg.com',
            phone: '13812345678',
            wechat: 'owen888',
            responsibilities: ['结算确认'],
            updatedBy: '李四',
            updatedAt: '2024-03-20 10:30:00'
        },
        {
            id: 2,
            name: '李四',
            position: '结算专员',
            entity: '湖南大区',
            email: 'lisi@carlsberg.com',
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
            email: 'wangwu@carlsberg.com',
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
            email: 'zhaoliu@carlsberg.com',
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
            email: 'qianqi@carlsberg.com',
            phone: '13678901234',
            wechat: 'qianqi555',
            responsibilities: ['客户系统结算入口开通'],
            updatedBy: '王五',
            updatedAt: '2024-03-16 11:30:00'
        }
    ]
};

let materialTypes = ['PO', '合同', '账单', '流程文件', '其他'];
let materialData = [
    {
        id: 1,
        name: '嘉士伯2024年度框架合同',
        type: '合同',
        customer: '嘉士伯',
        project: 'CB2024001',
        description: '2024年度框架合作协议',
        fileName: '嘉士伯2024年度框架合同.pdf',
        fileSize: '2.5MB',
        uploadTime: '2024-03-20 14:30:00',
        uploadBy: '张三'
    },
    {
        id: 2,
        name: '春节营销活动结算单',
        type: '账单',
        customer: '嘉士伯',
        project: 'CB2024002',
        description: '2024年春节营销活动费用结算',
        fileName: '春节营销活动结算单.xlsx',
        fileSize: '1.8MB',
        uploadTime: '2024-03-19 16:45:00',
        uploadBy: '李四'
    },
    {
        id: 3,
        name: '结算流程操作指南',
        type: '流程文件',
        customer: '嘉士伯',
        project: '',
        description: '详细的结算流程操作说明',
        fileName: '结算流程操作指南.docx',
        fileSize: '856KB',
        uploadTime: '2024-03-18 10:20:00',
        uploadBy: '王五'
    }
];

let currentEditingCustomer = null;
let filteredMaterials = [...materialData];

// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
    initTabs();
    initCustomerManagement();
    initMaterialLibrary();
    renderCustomerList();
    renderMaterialList();
});

// 标签页切换
function switchTab(tab) {
    currentTab = tab;
    
    // 更新标签按钮状态
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 显示/隐藏内容
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });
    
    if (tab === 'customer') {
        document.getElementById('customerTab').classList.add('active');
        document.getElementById('customerContent').classList.remove('hidden');
    } else if (tab === 'material') {
        document.getElementById('materialTab').classList.add('active');
        document.getElementById('materialContent').classList.remove('hidden');
    }
}

function initTabs() {
    switchTab('customer');
}

// 客户管理初始化
function initCustomerManagement() {
    const addBtn = document.getElementById('addCustomerBtn');
    const modal = document.getElementById('customerModal');
    const closeBtn = document.getElementById('closeCustomerModal');
    const cancelBtn = document.getElementById('cancelCustomerBtn');
    const form = document.getElementById('customerForm');
    
    addBtn.addEventListener('click', () => {
        currentEditingCustomer = null;
        document.getElementById('customerModalTitle').textContent = '新增客户';
        form.reset();
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    });
    
    [closeBtn, cancelBtn].forEach(btn => {
        btn.addEventListener('click', () => {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        });
    });
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        saveCustomer();
    });
}

function renderCustomerList() {
    const container = document.getElementById('customerList');
    
    if (customerData.contacts.length === 0) {
        container.innerHTML = `
            <div class="col-span-4 empty-placeholder">
                <div class="placeholder-icon">
                    <i class="fas fa-users"></i>
                </div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">暂无客户信息</h3>
                <p class="text-gray-500 mb-4">点击"新增客户"按钮添加第一个客户联系人</p>
                <button onclick="document.getElementById('addCustomerBtn').click()" 
                        class="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200">
                    <i class="fas fa-plus mr-2"></i>
                    新增客户
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = customerData.contacts.map(contact => `
        <div class="customer-card bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all duration-200">
            <div class="flex justify-between items-start mb-3">
                <div>
                    <h3 class="font-semibold text-gray-900 text-lg">${contact.name}</h3>
                    <p class="text-sm text-gray-600">${contact.position}</p>
                    ${contact.entity ? `<p class="text-xs text-gray-500 mt-1">${contact.entity}</p>` : ''}
                </div>
                <div class="flex space-x-1">
                    <button class="action-btn p-1.5 text-blue-600 hover:bg-blue-50 rounded" 
                            onclick="editCustomer(${contact.id})" title="编辑">
                        <i class="fas fa-edit text-sm"></i>
                    </button>
                    <button class="action-btn p-1.5 text-red-600 hover:bg-red-50 rounded" 
                            onclick="deleteCustomer(${contact.id})" title="删除">
                        <i class="fas fa-trash text-sm"></i>
                    </button>
                </div>
            </div>
            
            <div class="space-y-2 text-sm">
                <div class="flex items-center justify-between">
                    <span class="text-gray-500">邮箱:</span>
                    <div class="flex items-center space-x-2">
                        <span id="email-${contact.id}" class="text-gray-900">${maskEmail(contact.email)}</span>
                        <button class="reveal-btn text-xs text-blue-600 hover:text-blue-800" 
                                onclick="revealContact('email', ${contact.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </div>
                
                <div class="flex items-center justify-between">
                    <span class="text-gray-500">电话:</span>
                    <div class="flex items-center space-x-2">
                        <span id="phone-${contact.id}" class="text-gray-900">${maskPhone(contact.phone)}</span>
                        <button class="reveal-btn text-xs text-blue-600 hover:text-blue-800" 
                                onclick="revealContact('phone', ${contact.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </div>
                
                ${contact.wechat ? `
                    <div class="flex items-center justify-between">
                        <span class="text-gray-500">微信:</span>
                        <div class="flex items-center space-x-2">
                            <span id="wechat-${contact.id}" class="text-gray-900">${maskWechat(contact.wechat)}</span>
                            <button class="reveal-btn text-xs text-blue-600 hover:text-blue-800" 
                                    onclick="revealContact('wechat', ${contact.id})">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </div>
                ` : ''}
            </div>
            
            ${contact.responsibilities && contact.responsibilities.length > 0 ? `
                <div class="mt-3 pt-3 border-t border-gray-100">
                    <div class="text-xs text-gray-500 mb-2">对接职责:</div>
                    <div class="flex flex-wrap gap-1">
                        ${contact.responsibilities.map(resp => `
                            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getResponsibilityTagClass(resp)}">
                                ${resp}
                            </span>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            <div class="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                <div>更新人: ${contact.updatedBy}</div>
                <div>更新时间: ${formatDateTime(contact.updatedAt)}</div>
            </div>
        </div>
    `).join('');
}

// 职责标签样式
function getResponsibilityTagClass(responsibility) {
    const colorMap = {
        '预算确认': 'bg-blue-100 text-blue-800',
        '结算确认': 'bg-green-100 text-green-800',
        '结算资料接收': 'bg-yellow-100 text-yellow-800',
        '客户系统结算入口开通': 'bg-purple-100 text-purple-800'
    };
    return colorMap[responsibility] || 'bg-gray-100 text-gray-800';
}

// 联系方式遮蔽
function maskEmail(email) {
    const [local, domain] = email.split('@');
    return local.length > 2 ? local.substring(0, 2) + '***@' + domain : email;
}

function maskPhone(phone) {
    return phone.length > 7 ? phone.substring(0, 3) + '****' + phone.substring(7) : phone;
}

function maskWechat(wechat) {
    return wechat.length > 4 ? wechat.substring(0, 2) + '***' + wechat.substring(wechat.length - 2) : wechat;
}

// 显示完整联系方式
function revealContact(type, id) {
    const contact = customerData.contacts.find(c => c.id === id);
    if (!contact) return;
    
    const element = document.getElementById(`${type}-${id}`);
    if (!element) return;
    
    let fullValue = '';
    switch (type) {
        case 'email':
            fullValue = contact.email;
            break;
        case 'phone':
            fullValue = contact.phone;
            break;
        case 'wechat':
            fullValue = contact.wechat;
            break;
    }
    
    element.textContent = fullValue;
    element.classList.add('encrypted-text');
    
    // 3秒后重新遮蔽
    setTimeout(() => {
        switch (type) {
            case 'email':
                element.textContent = maskEmail(contact.email);
                break;
            case 'phone':
                element.textContent = maskPhone(contact.phone);
                break;
            case 'wechat':
                element.textContent = maskWechat(contact.wechat);
                break;
        }
        element.classList.remove('encrypted-text');
    }, 3000);
}

// 编辑客户
function editCustomer(id) {
    const customer = customerData.contacts.find(c => c.id === id);
    if (!customer) return;
    
    currentEditingCustomer = customer;
    document.getElementById('customerModalTitle').textContent = '编辑客户';
    
    // 填充表单
    document.getElementById('customerName').value = customer.name;
    document.getElementById('customerPosition').value = customer.position;
    document.getElementById('customerEntity').value = customer.entity || '';
    document.getElementById('customerEmail').value = customer.email;
    document.getElementById('customerPhone').value = customer.phone;
    document.getElementById('customerWechat').value = customer.wechat || '';
    
    // 设置职责复选框
    document.querySelectorAll('.responsibility-checkbox').forEach(checkbox => {
        checkbox.checked = customer.responsibilities.includes(checkbox.value);
    });
    
    document.getElementById('customerModal').classList.remove('hidden');
    document.getElementById('customerModal').classList.add('flex');
}

// 删除客户
function deleteCustomer(id) {
    if (confirm('确定要删除这个客户吗？')) {
        const index = customerData.contacts.findIndex(c => c.id === id);
        if (index > -1) {
            customerData.contacts.splice(index, 1);
            renderCustomerList();
            showMessage('客户删除成功', 'success');
        }
    }
}

// 保存客户
function saveCustomer() {
    const name = document.getElementById('customerName').value.trim();
    const position = document.getElementById('customerPosition').value.trim();
    const entity = document.getElementById('customerEntity').value.trim();
    const email = document.getElementById('customerEmail').value.trim();
    const phone = document.getElementById('customerPhone').value.trim();
    const wechat = document.getElementById('customerWechat').value.trim();
    
    if (!name || !position || !email || !phone) {
        showMessage('请填写必填字段', 'error');
        return;
    }
    
    // 获取选中的职责
    const responsibilities = Array.from(document.querySelectorAll('.responsibility-checkbox:checked'))
        .map(checkbox => checkbox.value);
    
    const customerInfo = {
        name,
        position,
        entity,
        email,
        phone,
        wechat,
        responsibilities,
        updatedBy: '当前用户',
        updatedAt: new Date().toLocaleString('zh-CN')
    };
    
    if (currentEditingCustomer) {
        // 编辑模式
        Object.assign(currentEditingCustomer, customerInfo);
        showMessage('客户信息更新成功', 'success');
    } else {
        // 新增模式
        customerInfo.id = Math.max(...customerData.contacts.map(c => c.id), 0) + 1;
        customerData.contacts.push(customerInfo);
        showMessage('客户添加成功', 'success');
    }
    
    renderCustomerList();
    document.getElementById('customerModal').classList.add('hidden');
    document.getElementById('customerModal').classList.remove('flex');
}

// 资料库管理初始化
function initMaterialLibrary() {
    initMaterialSearch();
    initMaterialModals();
    renderTypeList();
}

function initMaterialModals() {
    // 类型管理模态框
    const typeBtn = document.getElementById('typeManagementBtn');
    const typeModal = document.getElementById('typeManagementModal');
    const closeTypeBtn = document.getElementById('closeTypeModal');
    const addTypeBtn = document.getElementById('addTypeBtn');
    
    typeBtn.addEventListener('click', () => {
        typeModal.classList.remove('hidden');
        typeModal.classList.add('flex');
        renderTypeList();
    });
    
    closeTypeBtn.addEventListener('click', () => {
        typeModal.classList.add('hidden');
        typeModal.classList.remove('flex');
    });
    
    addTypeBtn.addEventListener('click', addType);
    
    // 上传资料模态框
    const uploadBtn = document.getElementById('uploadMaterialBtn');
    const uploadModal = document.getElementById('uploadModal');
    const closeUploadBtn = document.getElementById('closeUploadModal');
    const cancelUploadBtn = document.getElementById('cancelUploadBtn');
    const uploadForm = document.getElementById('uploadForm');
    const fileInput = document.getElementById('materialFile');
    const fileDropZone = document.getElementById('fileDropZone');
    
    uploadBtn.addEventListener('click', () => {
        uploadModal.classList.remove('hidden');
        uploadModal.classList.add('flex');
        updateTypeSelects();
    });
    
    [closeUploadBtn, cancelUploadBtn].forEach(btn => {
        btn.addEventListener('click', () => {
            uploadModal.classList.add('hidden');
            uploadModal.classList.remove('flex');
            uploadForm.reset();
        });
    });
    
    uploadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        uploadMaterial();
    });
    
    fileDropZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);
}

function renderMaterialList() {
    const container = document.getElementById('materialList');
    
    if (filteredMaterials.length === 0) {
        container.innerHTML = `
            <div class="empty-placeholder">
                <div class="placeholder-icon">
                    <i class="fas fa-folder-open"></i>
                </div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">暂无资料</h3>
                <p class="text-gray-500 mb-4">点击"上传资料"按钮添加第一个资料文件</p>
                <button onclick="document.getElementById('uploadMaterialBtn').click()" 
                        class="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors duration-200">
                    <i class="fas fa-upload mr-2"></i>
                    上传资料
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${filteredMaterials.map(material => `
                <div class="material-card bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all duration-200">
                    <div class="flex items-start justify-between mb-3">
                        <div class="flex items-center space-x-3">
                            <div class="file-icon ${getFileIconClass(material.fileName)}">
                                <i class="${getFileIcon(material.fileName)}"></i>
                            </div>
                            <div class="flex-1 min-w-0">
                                <h3 class="font-medium text-gray-900 truncate" title="${material.name}">${material.name}</h3>
                                <p class="text-sm text-gray-500 truncate" title="${material.fileName}">${material.fileName}</p>
                            </div>
                        </div>
                        <div class="flex space-x-1">
                            <button class="action-btn p-1.5 text-blue-600 hover:bg-blue-50 rounded" 
                                    onclick="previewMaterial(${material.id})" title="预览">
                                <i class="fas fa-eye text-sm"></i>
                            </button>
                            <button class="action-btn p-1.5 text-green-600 hover:bg-green-50 rounded" 
                                    onclick="downloadMaterial(${material.id})" title="下载">
                                <i class="fas fa-download text-sm"></i>
                            </button>
                            <button class="action-btn p-1.5 text-red-600 hover:bg-red-50 rounded" 
                                    onclick="deleteMaterial(${material.id})" title="删除">
                                <i class="fas fa-trash text-sm"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="space-y-2 text-sm">
                        <div class="flex items-center justify-between">
                            <span class="text-gray-500">类型:</span>
                            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(material.type)}">
                                ${material.type}
                            </span>
                        </div>
                        
                        ${material.customer ? `
                            <div class="flex items-center justify-between">
                                <span class="text-gray-500">客户:</span>
                                <span class="text-gray-900">${material.customer}</span>
                            </div>
                        ` : ''}
                        
                        ${material.project ? `
                            <div class="flex items-center justify-between">
                                <span class="text-gray-500">项目:</span>
                                <span class="text-gray-900">${material.project}</span>
                            </div>
                        ` : ''}
                        
                        <div class="flex items-center justify-between">
                            <span class="text-gray-500">大小:</span>
                            <span class="text-gray-900">${material.fileSize}</span>
                        </div>
                    </div>
                    
                    ${material.description ? `
                        <div class="mt-3 pt-3 border-t border-gray-100">
                            <p class="text-sm text-gray-600 line-clamp-2" title="${material.description}">${material.description}</p>
                        </div>
                    ` : ''}
                    
                    <div class="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                        <div>上传人: ${material.uploadBy}</div>
                        <div>上传时间: ${formatDateTime(material.uploadTime)}</div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// 文件图标和颜色
function getFileIcon(fileName) {
    const ext = fileName.split('.').pop().toLowerCase();
    switch (ext) {
        case 'pdf':
            return 'fas fa-file-pdf';
        case 'doc':
        case 'docx':
            return 'fas fa-file-word';
        case 'xls':
        case 'xlsx':
            return 'fas fa-file-excel';
        case 'ppt':
        case 'pptx':
            return 'fas fa-file-powerpoint';
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
            return 'fas fa-file-image';
        default:
            return 'fas fa-file';
    }
}

function getFileIconClass(fileName) {
    const ext = fileName.split('.').pop().toLowerCase();
    switch (ext) {
        case 'pdf':
            return 'bg-red-100 text-red-600';
        case 'doc':
        case 'docx':
            return 'bg-blue-100 text-blue-600';
        case 'xls':
        case 'xlsx':
            return 'bg-green-100 text-green-600';
        case 'ppt':
        case 'pptx':
            return 'bg-orange-100 text-orange-600';
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
            return 'bg-purple-100 text-purple-600';
        default:
            return 'bg-gray-100 text-gray-600';
    }
}

function getTypeColor(type) {
    switch (type) {
        case 'PO':
            return 'bg-blue-100 text-blue-800';
        case '合同':
            return 'bg-indigo-100 text-indigo-800';
        case '账单':
            return 'bg-green-100 text-green-800';
        case '流程文件':
            return 'bg-purple-100 text-purple-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

// 搜索和筛选
function initMaterialSearch() {
    const searchInput = document.getElementById('materialSearchInput');
    const typeFilter = document.getElementById('materialTypeFilter');
    const refreshBtn = document.getElementById('refreshMaterialBtn');
    
    searchInput.addEventListener('input', debounce(filterMaterials, 300));
    typeFilter.addEventListener('change', filterMaterials);
    refreshBtn.addEventListener('click', () => {
        searchInput.value = '';
        typeFilter.value = '';
        filterMaterials();
    });
}

function filterMaterials() {
    const searchTerm = document.getElementById('materialSearchInput').value.toLowerCase();
    const typeFilter = document.getElementById('materialTypeFilter').value;
    
    filteredMaterials = materialData.filter(material => {
        const matchesSearch = material.name.toLowerCase().includes(searchTerm) || 
                            material.fileName.toLowerCase().includes(searchTerm);
        const matchesType = !typeFilter || material.type === typeFilter;
        
        return matchesSearch && matchesType;
    });
    
    renderMaterialList();
}

// 资料操作
function previewMaterial(id) {
    const material = materialData.find(m => m.id === id);
    if (material) {
        showMessage(`正在预览：${material.name}`, 'info');
    }
}

function downloadMaterial(id) {
    const material = materialData.find(m => m.id === id);
    if (material) {
        showMessage(`正在下载：${material.name}`, 'info');
    }
}

function deleteMaterial(id) {
    if (confirm('确定要删除这个资料吗？')) {
        const index = materialData.findIndex(m => m.id === id);
        if (index > -1) {
            materialData.splice(index, 1);
            filterMaterials();
            showMessage('资料删除成功', 'success');
        }
    }
}

// 类型管理
function renderTypeList() {
    const container = document.getElementById('typeList');
    container.innerHTML = materialTypes.map(type => `
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span class="text-gray-900">${type}</span>
            ${!['PO', '合同', '账单'].includes(type) ? `
                <button class="text-red-600 hover:text-red-800 transition-colors duration-200" 
                        onclick="deleteType('${type}')">
                    <i class="fas fa-trash"></i>
                </button>
            ` : `
                <span class="text-xs text-gray-500 px-2 py-1 bg-gray-200 rounded">不可删除</span>
            `}
        </div>
    `).join('');
}

function addType() {
    const input = document.getElementById('newTypeName');
    const typeName = input.value.trim();
    
    if (!typeName) {
        showMessage('请输入类型名称', 'error');
        return;
    }
    
    if (materialTypes.includes(typeName)) {
        showMessage('类型已存在', 'error');
        return;
    }
    
    materialTypes.push(typeName);
    input.value = '';
    renderTypeList();
    updateTypeSelects();
    showMessage('类型添加成功', 'success');
}

function deleteType(typeName) {
    if (confirm(`确定要删除类型"${typeName}"吗？`)) {
        const index = materialTypes.indexOf(typeName);
        if (index > -1) {
            materialTypes.splice(index, 1);
            renderTypeList();
            updateTypeSelects();
            showMessage('类型删除成功', 'success');
        }
    }
}

function updateTypeSelects() {
    const selects = ['materialTypeFilter', 'materialType'];
    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (select) {
            const currentValue = select.value;
            const isFilter = selectId.includes('Filter');
            
            select.innerHTML = isFilter ? '<option value="">全部类型</option>' : '<option value="">请选择类型</option>';
            
            materialTypes.forEach(type => {
                const option = document.createElement('option');
                option.value = type;
                option.textContent = type;
                select.appendChild(option);
            });
            
            if (materialTypes.includes(currentValue)) {
                select.value = currentValue;
            }
        }
    });
}

// 文件上传
function handleFileSelect(event) {
    const files = Array.from(event.target.files);
    displaySelectedFiles(files);
}

function displaySelectedFiles(files) {
    const fileList = document.getElementById('fileList');
    if (files.length === 0) {
        fileList.classList.add('hidden');
        return;
    }
    
    fileList.classList.remove('hidden');
    fileList.innerHTML = `
        <div class="text-sm font-medium text-gray-700 mb-2">已选择文件:</div>
        <div class="space-y-2">
            ${files.map((file, index) => `
                <div class="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div class="flex items-center space-x-2">
                        <i class="${getFileIcon(file.name)} text-gray-600"></i>
                        <span class="text-sm text-gray-900">${file.name}</span>
                        <span class="text-xs text-gray-500">(${formatFileSize(file.size)})</span>
                    </div>
                    <button class="text-red-600 hover:text-red-800" onclick="removeFile(${index})">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `).join('')}
        </div>
    `;
}

function removeFile(index) {
    const fileInput = document.getElementById('materialFile');
    const dt = new DataTransfer();
    const files = Array.from(fileInput.files);
    
    files.forEach((file, i) => {
        if (i !== index) {
            dt.items.add(file);
        }
    });
    
    fileInput.files = dt.files;
    displaySelectedFiles(Array.from(dt.files));
}

function uploadMaterial() {
    const name = document.getElementById('materialName').value.trim();
    const type = document.getElementById('materialType').value;
    const customer = document.getElementById('materialCustomer').value;
    const project = document.getElementById('materialProject').value.trim();
    const description = document.getElementById('materialDescription').value.trim();
    const files = document.getElementById('materialFile').files;
    
    if (!name || !type || files.length === 0) {
        showMessage('请填写必填字段并选择文件', 'error');
        return;
    }
    
    // 模拟上传多个文件
    Array.from(files).forEach((file, index) => {
        const materialInfo = {
            id: Math.max(...materialData.map(m => m.id), 0) + index + 1,
            name: files.length > 1 ? `${name}_${index + 1}` : name,
            type,
            customer,
            project,
            description,
            fileName: file.name,
            fileSize: formatFileSize(file.size),
            uploadTime: new Date().toLocaleString('zh-CN'),
            uploadBy: '当前用户'
        };
        
        materialData.push(materialInfo);
    });
    
    filterMaterials();
    document.getElementById('uploadModal').classList.add('hidden');
    document.getElementById('uploadModal').classList.remove('flex');
    document.getElementById('uploadForm').reset();
    document.getElementById('fileList').classList.add('hidden');
    
    showMessage(`成功上传 ${files.length} 个文件`, 'success');
}

// 工具函数
function formatDateTime(dateTimeStr) {
    return new Date(dateTimeStr).toLocaleString('zh-CN');
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function showMessage(message, type = 'info') {
    // 创建消息元素
    const messageEl = document.createElement('div');
    messageEl.className = `fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300 transform translate-x-full`;
    
    // 根据类型设置样式
    switch (type) {
        case 'success':
            messageEl.className += ' bg-green-500 text-white';
            break;
        case 'error':
            messageEl.className += ' bg-red-500 text-white';
            break;
        case 'warning':
            messageEl.className += ' bg-yellow-500 text-white';
            break;
        default:
            messageEl.className += ' bg-blue-500 text-white';
    }
    
    messageEl.textContent = message;
    document.body.appendChild(messageEl);
    
    // 显示动画
    setTimeout(() => {
        messageEl.classList.remove('translate-x-full');
    }, 100);
    
    // 自动隐藏
    setTimeout(() => {
        messageEl.classList.add('translate-x-full');
        setTimeout(() => {
            document.body.removeChild(messageEl);
        }, 300);
    }, 3000);
}