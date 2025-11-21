// 客户信息管理JavaScript
let customers = [];
let currentCustomerId = null;

// 模拟客户数据
const mockCustomers = [
    {
        id: 1,
        name: '嘉士伯（中国）投资有限公司',
        type: 'direct',
        creditCode: '91110000633442357H',
        status: 'active',
        address: '北京市朝阳区建国门外大街甲6号中环世贸中心D座15层',
        contactName: '张经理',
        contactPosition: '市场总监',
        contactPhone: '13800138001',
        contactEmail: 'zhang.manager@carlsberg.com',
        projectCount: 15,
        lastCooperation: '2024-03-15',
        remark: '重要合作伙伴，主要负责华北区域业务',
        createdAt: '2023-01-15T10:00:00',
        updatedAt: '2024-03-15T14:30:00'
    },
    {
        id: 2,
        name: '上海广告传媒有限公司',
        type: 'agency',
        creditCode: '91310000MA1FL5E85X',
        status: 'active',
        address: '上海市黄浦区南京东路100号',
        contactName: '李总',
        contactPosition: '总经理',
        contactPhone: '13900139002',
        contactEmail: 'li.boss@adagency.com',
        projectCount: 8,
        lastCooperation: '2024-03-10',
        remark: '代理商，主要负责华东区域推广',
        createdAt: '2023-03-20T09:00:00',
        updatedAt: '2024-03-10T16:20:00'
    },
    {
        id: 3,
        name: '深圳电商平台科技有限公司',
        type: 'platform',
        creditCode: '91440300MA5EQXXX9Y',
        status: 'active',
        address: '深圳市南山区科技园南区',
        contactName: '王主管',
        contactPosition: '业务主管',
        contactPhone: '13700137003',
        contactEmail: 'wang.supervisor@platform.com',
        projectCount: 12,
        lastCooperation: '2024-03-12',
        remark: '电商平台合作伙伴',
        createdAt: '2023-06-10T11:00:00',
        updatedAt: '2024-03-12T10:15:00'
    },
    {
        id: 4,
        name: '广州营销策划有限公司',
        type: 'agency',
        creditCode: '91440101MA59LXXX7K',
        status: 'inactive',
        address: '广州市天河区珠江新城',
        contactName: '陈经理',
        contactPosition: '客户经理',
        contactPhone: '13600136004',
        contactEmail: 'chen.manager@marketing.com',
        projectCount: 3,
        lastCooperation: '2023-12-20',
        remark: '暂停合作，待重新评估',
        createdAt: '2023-08-15T14:00:00',
        updatedAt: '2023-12-20T17:30:00'
    },
    {
        id: 5,
        name: '成都新媒体传播有限公司',
        type: 'agency',
        creditCode: '91510100MA62XXXX8L',
        status: 'potential',
        address: '成都市锦江区春熙路',
        contactName: '刘总监',
        contactPosition: '业务总监',
        contactPhone: '13500135005',
        contactEmail: 'liu.director@newmedia.com',
        projectCount: 0,
        lastCooperation: null,
        remark: '潜在合作伙伴，正在洽谈中',
        createdAt: '2024-02-01T16:00:00',
        updatedAt: '2024-02-01T16:00:00'
    }
];

// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
    customers = [...mockCustomers];
    renderCustomerList(customers);
    
    // 绑定搜索事件
    document.getElementById('searchInput').addEventListener('input', debounce(searchCustomers, 300));
    document.getElementById('statusFilter').addEventListener('change', searchCustomers);
    document.getElementById('typeFilter').addEventListener('change', searchCustomers);
    
    // 绑定表单提交事件
    document.getElementById('customerForm').addEventListener('submit', handleFormSubmit);
});

// 渲染客户列表
function renderCustomerList(customersToRender) {
    const customerList = document.getElementById('customerList');
    
    if (customersToRender.length === 0) {
        customerList.innerHTML = `
            <tr>
                <td colspan="7" class="px-6 py-8 text-center text-gray-500">
                    <i class="fas fa-users text-4xl mb-2"></i>
                    <div>暂无客户数据</div>
                </td>
            </tr>
        `;
        return;
    }
    
    customerList.innerHTML = customersToRender.map(customer => `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4">
                <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                        <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <i class="fas fa-building text-blue-600"></i>
                        </div>
                    </div>
                    <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">${customer.name}</div>
                        <div class="text-sm text-gray-500">${customer.creditCode || '-'}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${customer.type === 'direct' ? 'bg-blue-100 text-blue-800' : 
                      customer.type === 'agency' ? 'bg-green-100 text-green-800' : 
                      'bg-purple-100 text-purple-800'}">
                    ${customer.type === 'direct' ? '直客' : 
                      customer.type === 'agency' ? '代理' : '平台'}
                </span>
            </td>
            <td class="px-6 py-4">
                <div class="text-sm text-gray-900">${customer.contactName}</div>
                <div class="text-sm text-gray-500">${customer.contactPosition || '-'}</div>
                <div class="text-sm text-gray-500">${customer.contactPhone}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${customer.status === 'active' ? 'bg-green-100 text-green-800' : 
                      customer.status === 'inactive' ? 'bg-red-100 text-red-800' : 
                      'bg-yellow-100 text-yellow-800'}">
                    ${customer.status === 'active' ? '合作中' : 
                      customer.status === 'inactive' ? '暂停合作' : '潜在客户'}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${customer.projectCount}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${customer.lastCooperation ? formatDate(customer.lastCooperation) : '-'}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button onclick="editCustomer(${customer.id})" class="text-blue-600 hover:text-blue-900 mr-3">
                    <i class="fas fa-edit"></i> 编辑
                </button>
                <button onclick="viewCustomer(${customer.id})" class="text-green-600 hover:text-green-900 mr-3">
                    <i class="fas fa-eye"></i> 查看
                </button>
                <button onclick="deleteCustomer(${customer.id})" class="text-red-600 hover:text-red-900">
                    <i class="fas fa-trash"></i> 删除
                </button>
            </td>
        </tr>
    `).join('');
}

// 搜索客户
function searchCustomers() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    const typeFilter = document.getElementById('typeFilter').value;
    
    let filteredCustomers = customers.filter(customer => {
        const matchesSearch = !searchTerm || 
            customer.name.toLowerCase().includes(searchTerm) ||
            customer.contactName.toLowerCase().includes(searchTerm) ||
            customer.contactPhone.includes(searchTerm) ||
            (customer.contactEmail && customer.contactEmail.toLowerCase().includes(searchTerm));
        
        const matchesStatus = !statusFilter || customer.status === statusFilter;
        const matchesType = !typeFilter || customer.type === typeFilter;
        
        return matchesSearch && matchesStatus && matchesType;
    });
    
    renderCustomerList(filteredCustomers);
}

// 显示新增客户模态框
function showCreateCustomerModal() {
    currentCustomerId = null;
    document.getElementById('modalTitle').textContent = '新增客户';
    document.getElementById('customerForm').reset();
    document.getElementById('customerStatus').value = 'active';
    document.getElementById('customerModal').classList.remove('hidden');
}

// 编辑客户
function editCustomer(customerId) {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;
    
    currentCustomerId = customerId;
    document.getElementById('modalTitle').textContent = '编辑客户';
    
    // 填充表单数据
    document.getElementById('customerName').value = customer.name;
    document.getElementById('customerType').value = customer.type;
    document.getElementById('creditCode').value = customer.creditCode || '';
    document.getElementById('customerStatus').value = customer.status;
    document.getElementById('customerAddress').value = customer.address || '';
    document.getElementById('contactName').value = customer.contactName;
    document.getElementById('contactPosition').value = customer.contactPosition || '';
    document.getElementById('contactPhone').value = customer.contactPhone;
    document.getElementById('contactEmail').value = customer.contactEmail || '';
    document.getElementById('customerRemark').value = customer.remark || '';
    
    document.getElementById('customerModal').classList.remove('hidden');
}

// 查看客户详情
function viewCustomer(customerId) {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;
    
    alert(`客户详情：\n客户名称：${customer.name}\n联系人：${customer.contactName}\n电话：${customer.contactPhone}\n状态：${getStatusText(customer.status)}`);
}

// 删除客户
function deleteCustomer(customerId) {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;
    
    if (confirm(`确定要删除客户"${customer.name}"吗？此操作不可恢复。`)) {
        customers = customers.filter(c => c.id !== customerId);
        renderCustomerList(customers);
        showSuccess('客户删除成功');
    }
}

// 关闭模态框
function closeCustomerModal() {
    document.getElementById('customerModal').classList.add('hidden');
    currentCustomerId = null;
}

// 处理表单提交
function handleFormSubmit(event) {
    event.preventDefault();
    
    const formData = {
        name: document.getElementById('customerName').value,
        type: document.getElementById('customerType').value,
        creditCode: document.getElementById('creditCode').value,
        status: document.getElementById('customerStatus').value,
        address: document.getElementById('customerAddress').value,
        contactName: document.getElementById('contactName').value,
        contactPosition: document.getElementById('contactPosition').value,
        contactPhone: document.getElementById('contactPhone').value,
        contactEmail: document.getElementById('contactEmail').value,
        remark: document.getElementById('customerRemark').value
    };
    
    if (currentCustomerId) {
        // 编辑客户
        const customerIndex = customers.findIndex(c => c.id === currentCustomerId);
        if (customerIndex !== -1) {
            customers[customerIndex] = {
                ...customers[customerIndex],
                ...formData,
                updatedAt: new Date().toISOString()
            };
            showSuccess('客户信息更新成功');
        }
    } else {
        // 新增客户
        const newCustomer = {
            id: Math.max(...customers.map(c => c.id)) + 1,
            ...formData,
            projectCount: 0,
            lastCooperation: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        customers.push(newCustomer);
        showSuccess('客户添加成功');
    }
    
    renderCustomerList(customers);
    closeCustomerModal();
}

// 刷新客户列表
function refreshCustomers() {
    // 模拟从服务器重新加载数据
    customers = [...mockCustomers];
    renderCustomerList(customers);
    showSuccess('客户列表已刷新');
}

// 工具函数
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN');
}

function getStatusText(status) {
    const statusMap = {
        'active': '合作中',
        'inactive': '暂停合作',
        'potential': '潜在客户'
    };
    return statusMap[status] || status;
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

function showSuccess(message) {
    // 简单的成功提示
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    toast.innerHTML = `<i class="fas fa-check-circle mr-2"></i>${message}`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        document.body.removeChild(toast);
    }, 3000);
}

function showError(message) {
    // 简单的错误提示
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    toast.innerHTML = `<i class="fas fa-exclamation-circle mr-2"></i>${message}`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        document.body.removeChild(toast);
    }, 3000);
}