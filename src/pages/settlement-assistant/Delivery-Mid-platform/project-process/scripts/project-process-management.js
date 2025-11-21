// 项目流程管理主页面脚本

// 全局变量
let projects = [];
let filteredProjects = [];
let currentFilters = {
    search: '',
    status: '',
    client: ''
};

// 标准流程模板定义
const processTemplates = {
    'to-home': {
        name: '分到家流程',
        stages: [
            { name: '需求分析', description: '分析到家业务需求，确定功能范围' },
            { name: '方案设计', description: '设计到家业务解决方案和系统架构' },
            { name: '系统开发', description: '开发到家业务相关功能模块' },
            { name: '测试上线', description: '系统测试和生产环境部署' },
            { name: '运营支持', description: '提供运营支持和系统维护' }
        ]
    },
    'to-store': {
        name: '到店流程',
        stages: [
            { name: '商户调研', description: '调研商户需求和现状分析' },
            { name: '系统集成', description: '集成到店业务系统和第三方服务' },
            { name: '门店部署', description: '在目标门店部署系统和设备' },
            { name: '培训上线', description: '培训商户使用并正式上线' },
            { name: '维护优化', description: '系统维护和功能优化' }
        ]
    },
    'product-code': {
        name: '物码流程',
        stages: [
            { name: '产品分析', description: '分析产品特性和码体需求' },
            { name: '码体设计', description: '设计物码样式和功能规格' },
            { name: '生产对接', description: '对接生产系统和供应链' },
            { name: '质量检测', description: '物码质量检测和验证' },
            { name: '交付验收', description: '交付物码产品并完成验收' }
        ]
    }
};

// 模拟项目数据
const mockProjects = [
    {
        id: 'PRJ001',
        name: '达能到家业务平台',
        client: '达能',
        manager: '张三',
        status: 'active',
        currentStage: '系统开发',
        progress: 65,
        startDate: '2024-01-15',
        endDate: '2024-06-30',
        description: '为达能公司开发到家业务平台，提升用户购买体验',
        template: 'to-home',
        stages: [
            { name: '需求分析', status: 'completed', owner: '李四', progress: 100, deadline: '2024-02-15' },
            { name: '方案设计', status: 'completed', owner: '王五', progress: 100, deadline: '2024-03-15' },
            { name: '系统开发', status: 'active', owner: '赵六', progress: 65, deadline: '2024-05-15' },
            { name: '测试上线', status: 'pending', owner: '钱七', progress: 0, deadline: '2024-06-15' },
            { name: '运营支持', status: 'pending', owner: '孙八', progress: 0, deadline: '2024-06-30' }
        ]
    },
    {
        id: 'PRJ002',
        name: '笔巢门店管理系统',
        client: '笔巢',
        manager: '李四',
        status: 'active',
        currentStage: '门店部署',
        progress: 75,
        startDate: '2024-02-01',
        endDate: '2024-07-31',
        description: '为笔巢连锁门店部署智能管理系统',
        template: 'to-store',
        stages: [
            { name: '商户调研', status: 'completed', owner: '李四', progress: 100, deadline: '2024-02-28' },
            { name: '系统集成', status: 'completed', owner: '王五', progress: 100, deadline: '2024-04-15' },
            { name: '门店部署', status: 'active', owner: '赵六', progress: 75, deadline: '2024-06-30' },
            { name: '培训上线', status: 'pending', owner: '钱七', progress: 0, deadline: '2024-07-15' },
            { name: '维护优化', status: 'pending', owner: '孙八', progress: 0, deadline: '2024-07-31' }
        ]
    },
    {
        id: 'PRJ003',
        name: '嘉士伯产品溯源码',
        client: '嘉士伯',
        manager: '王五',
        status: 'completed',
        currentStage: '项目完成',
        progress: 100,
        startDate: '2023-09-01',
        endDate: '2024-01-31',
        description: '为嘉士伯产品设计和生产溯源二维码',
        template: 'product-code',
        stages: [
            { name: '产品分析', status: 'completed', owner: '王五', progress: 100, deadline: '2023-10-15' },
            { name: '码体设计', status: 'completed', owner: '赵六', progress: 100, deadline: '2023-11-15' },
            { name: '生产对接', status: 'completed', owner: '钱七', progress: 100, deadline: '2023-12-15' },
            { name: '质量检测', status: 'completed', owner: '孙八', progress: 100, deadline: '2024-01-15' },
            { name: '交付验收', status: 'completed', owner: '周九', progress: 100, deadline: '2024-01-31' }
        ]
    }
];

// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    loadProjects();
    bindEvents();
});

// 初始化页面
function initializePage() {
    // 设置当前日期为默认开始时间
    const today = new Date().toISOString().split('T')[0];
    const startDateInput = document.getElementById('startDate');
    if (startDateInput) {
        startDateInput.value = today;
    }
}

// 加载项目数据
function loadProjects() {
    // 模拟从服务器加载数据
    projects = [...mockProjects];
    filteredProjects = [...projects];
    
    updateStatistics();
    renderProjectTable();
}

// 更新统计信息
function updateStatistics() {
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const pendingProjects = projects.filter(p => p.status === 'pending').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const riskProjects = projects.filter(p => {
        const endDate = new Date(p.endDate);
        const today = new Date();
        const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
        return p.status === 'active' && daysLeft < 30;
    }).length;
    
    document.getElementById('totalProjects').textContent = totalProjects;
    document.getElementById('activeProjects').textContent = activeProjects;
    document.getElementById('pendingProjects').textContent = pendingProjects;
    document.getElementById('completedProjects').textContent = completedProjects;
    document.getElementById('riskProjects').textContent = riskProjects;
    document.getElementById('totalProjectsTitle').textContent = `(${totalProjects}个项目)`;
}

// 渲染项目表格
function renderProjectTable() {
    const tbody = document.getElementById('projectTableBody');
    const emptyState = document.getElementById('emptyState');
    
    if (filteredProjects.length === 0) {
        tbody.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }
    
    emptyState.classList.add('hidden');
    
    tbody.innerHTML = filteredProjects.map(project => {
        const statusClass = getStatusClass(project.status);
        const statusText = getStatusText(project.status);
        const progressColor = getProgressColor(project.progress);
        
        return `
            <tr class="hover:bg-gray-50 cursor-pointer" onclick="viewProjectDetail('${project.id}')">
                <td class="px-6 py-4">
                    <div>
                        <div class="text-sm font-medium text-gray-900">${project.name}</div>
                        <div class="text-sm text-gray-500">${project.id}</div>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <div class="flex items-center">
                        <i class="fas fa-building text-gray-400 mr-2"></i>
                        <span class="text-sm text-gray-900">${project.client}</span>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <div class="flex items-center">
                        <i class="fas fa-user text-gray-400 mr-2"></i>
                        <span class="text-sm text-gray-900">${project.manager}</span>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <span class="text-sm text-gray-900">${project.currentStage}</span>
                </td>
                <td class="px-6 py-4">
                    <div class="flex items-center">
                        <div class="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div class="${progressColor} h-2 rounded-full" style="width: ${project.progress}%"></div>
                        </div>
                        <span class="text-sm text-gray-600">${project.progress}%</span>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </td>
                <td class="px-6 py-4">
                    <div class="flex items-center space-x-2">
                        <button onclick="event.stopPropagation(); viewProjectDetail('${project.id}')" 
                                class="text-blue-600 hover:text-blue-800 text-sm" title="查看详情">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button onclick="event.stopPropagation(); editProject('${project.id}')" 
                                class="text-green-600 hover:text-green-800 text-sm" title="编辑">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="event.stopPropagation(); deleteProject('${project.id}')" 
                                class="text-red-600 hover:text-red-800 text-sm" title="删除">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// 获取状态样式类
function getStatusClass(status) {
    const statusClasses = {
        'pending': 'status-pending',
        'active': 'status-active',
        'completed': 'status-completed',
        'cancelled': 'status-cancelled',
        'paused': 'status-paused'
    };
    return statusClasses[status] || 'status-pending';
}

// 获取状态文本
function getStatusText(status) {
    const statusTexts = {
        'pending': '待启动',
        'active': '进行中',
        'completed': '已完成',
        'cancelled': '已取消',
        'paused': '已暂停'
    };
    return statusTexts[status] || '未知';
}

// 获取进度条颜色
function getProgressColor(progress) {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 20) return 'bg-yellow-500';
    return 'bg-red-500';
}

// 绑定事件
function bindEvents() {
    // 搜索功能
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            currentFilters.search = this.value;
            applyFilters();
        });
    }
    
    // 状态筛选
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', function() {
            currentFilters.status = this.value;
            applyFilters();
        });
    }
    
    // 客户筛选
    const clientFilter = document.getElementById('clientFilter');
    if (clientFilter) {
        clientFilter.addEventListener('change', function() {
            currentFilters.client = this.value;
            applyFilters();
        });
    }
    
    // 创建项目表单提交
    const createProjectForm = document.getElementById('createProjectForm');
    if (createProjectForm) {
        createProjectForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleCreateProject();
        });
    }
}

// 应用筛选条件
function applyFilters() {
    filteredProjects = projects.filter(project => {
        const matchesSearch = !currentFilters.search || 
            project.name.toLowerCase().includes(currentFilters.search.toLowerCase()) ||
            project.client.toLowerCase().includes(currentFilters.search.toLowerCase()) ||
            project.manager.toLowerCase().includes(currentFilters.search.toLowerCase());
            
        const matchesStatus = !currentFilters.status || project.status === currentFilters.status;
        const matchesClient = !currentFilters.client || project.client === currentFilters.client;
        
        return matchesSearch && matchesStatus && matchesClient;
    });
    
    renderProjectTable();
}

// 重置筛选条件
function resetFilters() {
    currentFilters = { search: '', status: '', client: '' };
    
    document.getElementById('searchInput').value = '';
    document.getElementById('statusFilter').value = '';
    document.getElementById('clientFilter').value = '';
    
    filteredProjects = [...projects];
    renderProjectTable();
}

// 刷新数据
function refreshData() {
    // 显示加载状态
    const refreshBtn = event.target.closest('button');
    const originalContent = refreshBtn.innerHTML;
    refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>刷新中...</span>';
    refreshBtn.disabled = true;
    
    // 模拟数据刷新
    setTimeout(() => {
        loadProjects();
        refreshBtn.innerHTML = originalContent;
        refreshBtn.disabled = false;
        
        // 显示成功提示
        showNotification('数据刷新成功', 'success');
    }, 1000);
}

// 显示创建项目模态框
function showCreateProjectModal() {
    const modal = document.getElementById('createProjectModal');
    modal.classList.remove('hidden');
    
    // 重置表单
    document.getElementById('createProjectForm').reset();
    
    // 设置默认开始时间
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('startDate').value = today;
}

// 隐藏创建项目模态框
function hideCreateProjectModal() {
    const modal = document.getElementById('createProjectModal');
    modal.classList.add('hidden');
}

// 处理创建项目
function handleCreateProject() {
    const formData = {
        name: document.getElementById('projectName').value,
        client: document.getElementById('projectClient').value,
        manager: document.getElementById('projectManager').value,
        startDate: document.getElementById('startDate').value,
        description: document.getElementById('projectDescription').value
    };
    
    // 验证表单数据
    if (!formData.name || !formData.client || !formData.manager || !formData.startDate) {
        showNotification('请填写所有必填字段', 'error');
        return;
    }
    
    // 创建新项目
    const newProject = {
        id: 'PRJ' + String(projects.length + 1).padStart(3, '0'),
        name: formData.name,
        client: formData.client,
        manager: formData.manager,
        status: 'pending',
        currentStage: '项目启动',
        progress: 0,
        startDate: formData.startDate,
        endDate: '', // 需要在后续步骤中设置
        description: formData.description,
        stages: []
    };
    
    // 添加到项目列表
    projects.unshift(newProject);
    filteredProjects = [...projects];
    
    // 更新界面
    updateStatistics();
    renderProjectTable();
    
    // 隐藏模态框
    hideCreateProjectModal();
    
    // 显示成功提示
    showNotification('项目创建成功', 'success');
    
    // 跳转到项目配置页面
    setTimeout(() => {
        window.location.href = `project-process-create.html?id=${newProject.id}`;
    }, 1000);
}

// 查看项目详情
function viewProjectDetail(projectId) {
    window.location.href = `project-process-detail.html?id=${projectId}`;
}

// 编辑项目
function editProject(projectId) {
    window.location.href = `project-process-create.html?id=${projectId}&mode=edit`;
}

// 删除项目
function deleteProject(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    if (confirm(`确定要删除项目"${project.name}"吗？此操作不可撤销。`)) {
        // 从项目列表中移除
        projects = projects.filter(p => p.id !== projectId);
        filteredProjects = filteredProjects.filter(p => p.id !== projectId);
        
        // 更新界面
        updateStatistics();
        renderProjectTable();
        
        // 显示成功提示
        showNotification('项目删除成功', 'success');
    }
}

// 显示流程模板模态框
function showProcessTemplateModal() {
    // 跳转到模板管理页面
    window.location.href = '../settlement-template/template-list.html';
}

// 显示通知
function showNotification(message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white transition-all duration-300 transform translate-x-full`;
    
    // 设置通知样式
    const typeClasses = {
        'success': 'bg-green-500',
        'error': 'bg-red-500',
        'warning': 'bg-yellow-500',
        'info': 'bg-blue-500'
    };
    notification.classList.add(typeClasses[type] || typeClasses.info);
    
    // 设置通知内容
    const icons = {
        'success': 'fas fa-check-circle',
        'error': 'fas fa-exclamation-circle',
        'warning': 'fas fa-exclamation-triangle',
        'info': 'fas fa-info-circle'
    };
    
    notification.innerHTML = `
        <div class="flex items-center">
            <i class="${icons[type] || icons.info} mr-2"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // 添加到页面
    document.body.appendChild(notification);
    
    // 显示动画
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // 自动隐藏
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

// 导出项目数据
function exportProjects() {
    const csvContent = generateCSV(filteredProjects);
    downloadCSV(csvContent, 'projects.csv');
}

// 生成CSV内容
function generateCSV(data) {
    const headers = ['项目编号', '项目名称', '客户', '项目经理', '状态', '当前阶段', '进度', '开始时间', '结束时间'];
    const rows = data.map(project => [
        project.id,
        project.name,
        project.client,
        project.manager,
        getStatusText(project.status),
        project.currentStage,
        project.progress + '%',
        project.startDate,
        project.endDate
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
}

// 下载CSV文件
function downloadCSV(content, filename) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// 键盘快捷键
document.addEventListener('keydown', function(e) {
    // Ctrl+N 新建项目
    if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        showCreateProjectModal();
    }
    
    // Escape 关闭模态框
    if (e.key === 'Escape') {
        const modals = document.querySelectorAll('.fixed.inset-0:not(.hidden)');
        modals.forEach(modal => {
            if (modal.id === 'createProjectModal') {
                hideCreateProjectModal();
            }
        });
    }
    
    // Ctrl+R 刷新数据
    if (e.ctrlKey && e.key === 'r') {
        e.preventDefault();
        refreshData();
    }
});

// 模态框点击外部关闭
document.addEventListener('click', function(e) {
    const createModal = document.getElementById('createProjectModal');
    if (e.target === createModal) {
        hideCreateProjectModal();
    }
});