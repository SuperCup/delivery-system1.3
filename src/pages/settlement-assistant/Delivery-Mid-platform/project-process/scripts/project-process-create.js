// 项目流程创建页面脚本

// 全局变量
let currentStep = 1;
let selectedTemplate = null;
let projectData = {
    basicInfo: {},
    template: null,
    stages: [],
    team: []
};

// 标准流程模板定义（与主页面保持一致）
const processTemplates = {
    'to-home': {
        name: '分到家流程',
        description: '适用于到家业务项目，包含需求分析、方案设计、系统开发、测试上线、运营支持等标准阶段',
        stages: [
            { name: '需求分析', description: '分析到家业务需求，确定功能范围', duration: 15, deliverables: ['需求文档', '功能清单'] },
            { name: '方案设计', description: '设计到家业务解决方案和系统架构', duration: 20, deliverables: ['技术方案', '系统架构图'] },
            { name: '系统开发', description: '开发到家业务相关功能模块', duration: 45, deliverables: ['系统代码', '开发文档'] },
            { name: '测试上线', description: '系统测试和生产环境部署', duration: 15, deliverables: ['测试报告', '部署文档'] },
            { name: '运营支持', description: '提供运营支持和系统维护', duration: 30, deliverables: ['运营手册', '维护计划'] }
        ]
    },
    'to-store': {
        name: '到店流程',
        description: '适用于到店业务项目，包含商户调研、系统集成、门店部署、培训上线、维护优化等标准阶段',
        stages: [
            { name: '商户调研', description: '调研商户需求和现状分析', duration: 10, deliverables: ['调研报告', '需求分析'] },
            { name: '系统集成', description: '集成到店业务系统和第三方服务', duration: 25, deliverables: ['集成方案', '接口文档'] },
            { name: '门店部署', description: '在目标门店部署系统和设备', duration: 20, deliverables: ['部署清单', '设备配置'] },
            { name: '培训上线', description: '培训商户使用并正式上线', duration: 10, deliverables: ['培训材料', '上线报告'] },
            { name: '维护优化', description: '系统维护和功能优化', duration: 15, deliverables: ['维护记录', '优化方案'] }
        ]
    },
    'product-code': {
        name: '物码流程',
        description: '适用于物码业务项目，包含产品分析、码体设计、生产对接、质量检测、交付验收等标准阶段',
        stages: [
            { name: '产品分析', description: '分析产品特性和码体需求', duration: 7, deliverables: ['产品分析报告', '码体需求'] },
            { name: '码体设计', description: '设计物码样式和功能规格', duration: 14, deliverables: ['设计稿', '规格文档'] },
            { name: '生产对接', description: '对接生产系统和供应链', duration: 21, deliverables: ['对接方案', '生产计划'] },
            { name: '质量检测', description: '物码质量检测和验证', duration: 10, deliverables: ['检测报告', '质量标准'] },
            { name: '交付验收', description: '交付物码产品并完成验收', duration: 8, deliverables: ['交付清单', '验收报告'] }
        ]
    }
};

// 团队角色定义
const teamRoles = {
    'project-manager': '项目经理',
    'tech-lead': '技术负责人',
    'developer': '开发工程师',
    'tester': '测试工程师',
    'designer': '设计师',
    'analyst': '业务分析师',
    'ops': '运维工程师'
};

// 可选择的团队成员
const availableMembers = [
    { id: 'zhang-san', name: '张三', role: 'project-manager', department: '项目管理部' },
    { id: 'li-si', name: '李四', role: 'tech-lead', department: '技术部' },
    { id: 'wang-wu', name: '王五', role: 'developer', department: '技术部' },
    { id: 'zhao-liu', name: '赵六', role: 'developer', department: '技术部' },
    { id: 'qian-qi', name: '钱七', role: 'tester', department: '测试部' },
    { id: 'sun-ba', name: '孙八', role: 'designer', department: '设计部' },
    { id: 'zhou-jiu', name: '周九', role: 'analyst', department: '业务部' },
    { id: 'wu-shi', name: '吴十', role: 'ops', department: '运维部' }
];

// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
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
    
    // 检查URL参数，如果是编辑模式则加载项目数据
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id');
    const mode = urlParams.get('mode');
    
    if (projectId && mode === 'edit') {
        loadProjectForEdit(projectId);
    }
    
    // 初始化模板选择事件
    initializeTemplateSelection();
}

// 绑定事件
function bindEvents() {
    // 模板选择单选框事件
    const templateOptions = document.querySelectorAll('input[name="templateOption"]');
    templateOptions.forEach(option => {
        option.addEventListener('change', function() {
            if (this.value === 'preset') {
                document.getElementById('presetTemplates').style.display = 'grid';
                document.getElementById('customProcess').style.display = 'none';
            } else {
                document.getElementById('presetTemplates').style.display = 'none';
                document.getElementById('customProcess').style.display = 'block';
            }
        });
    });
    
    // 基本信息表单验证
    const basicInfoForm = document.getElementById('basicInfoForm');
    if (basicInfoForm) {
        const inputs = basicInfoForm.querySelectorAll('input[required], select[required]');
        inputs.forEach(input => {
            input.addEventListener('blur', validateField);
        });
    }
}

// 初始化模板选择
function initializeTemplateSelection() {
    const templateCards = document.querySelectorAll('.template-card');
    templateCards.forEach(card => {
        card.addEventListener('click', function() {
            // 移除其他卡片的选中状态
            templateCards.forEach(c => c.classList.remove('border-blue-500', 'bg-blue-50'));
            
            // 添加当前卡片的选中状态
            this.classList.add('border-blue-500', 'bg-blue-50');
            
            // 记录选中的模板
            selectedTemplate = this.dataset.template;
            projectData.template = selectedTemplate;
            
            console.log('选中模板:', selectedTemplate);
        });
    });
}

// 下一步
function nextStep(step) {
    if (!validateCurrentStep()) {
        return;
    }
    
    // 隐藏当前步骤
    document.getElementById(`step${currentStep}`).classList.add('hidden');
    
    // 更新步骤状态
    updateStepStatus(currentStep, 'completed');
    
    // 显示下一步骤
    currentStep = step;
    document.getElementById(`step${currentStep}`).classList.remove('hidden');
    updateStepStatus(currentStep, 'active');
    
    // 根据步骤执行特定逻辑
    switch(step) {
        case 3:
            if (selectedTemplate) {
                generateProcessConfig();
            }
            break;
        case 4:
            generateTeamConfig();
            break;
        case 5:
            generateProjectSummary();
            break;
    }
    
    // 滚动到顶部
    window.scrollTo(0, 0);
}

// 上一步
function prevStep(step) {
    // 隐藏当前步骤
    document.getElementById(`step${currentStep}`).classList.add('hidden');
    
    // 更新步骤状态
    updateStepStatus(currentStep, 'pending');
    
    // 显示上一步骤
    currentStep = step;
    document.getElementById(`step${currentStep}`).classList.remove('hidden');
    updateStepStatus(currentStep, 'active');
    
    // 滚动到顶部
    window.scrollTo(0, 0);
}

// 更新步骤状态
function updateStepStatus(stepNumber, status) {
    const stepElement = document.querySelector(`[data-step="${stepNumber}"]`);
    if (!stepElement) return;
    
    // 移除所有状态类
    stepElement.classList.remove('step-active', 'step-completed', 'step-pending');
    
    // 添加新状态类
    stepElement.classList.add(`step-${status}`);
    
    // 更新图标
    const icon = stepElement.querySelector('i');
    if (status === 'completed') {
        icon.className = 'fas fa-check';
    } else if (status === 'active') {
        icon.className = 'fas fa-circle';
    } else {
        icon.className = 'fas fa-circle-o';
    }
}

// 验证当前步骤
function validateCurrentStep() {
    switch(currentStep) {
        case 1:
            return validateBasicInfo();
        case 2:
            return validateTemplateSelection();
        case 3:
            return validateProcessConfig();
        case 4:
            return validateTeamConfig();
        default:
            return true;
    }
}

// 验证基本信息
function validateBasicInfo() {
    const form = document.getElementById('basicInfoForm');
    const requiredFields = form.querySelectorAll('input[required], select[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            showFieldError(field, '此字段为必填项');
            isValid = false;
        } else {
            clearFieldError(field);
        }
    });
    
    // 验证日期逻辑
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
        showFieldError(document.getElementById('endDate'), '结束时间必须晚于开始时间');
        isValid = false;
    }
    
    if (isValid) {
        // 保存基本信息
        projectData.basicInfo = {
            name: document.getElementById('projectName').value,
            code: document.getElementById('projectCode').value,
            client: document.getElementById('clientSelect').value,
            type: document.getElementById('projectType').value,
            startDate: startDate,
            endDate: endDate,
            description: document.getElementById('projectDescription').value
        };
    }
    
    return isValid;
}

// 验证模板选择
function validateTemplateSelection() {
    const templateOption = document.querySelector('input[name="templateOption"]:checked').value;
    
    if (templateOption === 'preset' && !selectedTemplate) {
        showNotification('请选择一个流程模板', 'error');
        return false;
    }
    
    return true;
}

// 验证流程配置
function validateProcessConfig() {
    // 检查是否所有阶段都配置了负责人
    const stageOwners = document.querySelectorAll('.stage-owner-select');
    let isValid = true;
    
    stageOwners.forEach(select => {
        if (!select.value) {
            select.classList.add('border-red-500');
            isValid = false;
        } else {
            select.classList.remove('border-red-500');
        }
    });
    
    if (!isValid) {
        showNotification('请为所有阶段分配负责人', 'error');
    }
    
    return isValid;
}

// 验证团队配置
function validateTeamConfig() {
    const selectedMembers = document.querySelectorAll('.team-member-card.selected');
    
    if (selectedMembers.length === 0) {
        showNotification('请至少选择一名团队成员', 'error');
        return false;
    }
    
    return true;
}

// 生成流程配置
function generateProcessConfig() {
    if (!selectedTemplate || !processTemplates[selectedTemplate]) {
        return;
    }
    
    const template = processTemplates[selectedTemplate];
    const container = document.getElementById('processStages');
    
    if (!container) {
        console.error('找不到流程配置容器');
        return;
    }
    
    container.innerHTML = template.stages.map((stage, index) => {
        return `
            <div class="bg-white border border-gray-200 rounded-lg p-4 mb-4">
                <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center">
                        <div class="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
                            ${index + 1}
                        </div>
                        <h4 class="font-semibold text-gray-800">${stage.name}</h4>
                    </div>
                    <span class="text-sm text-gray-500">${stage.duration}天</span>
                </div>
                <p class="text-sm text-gray-600 mb-3">${stage.description}</p>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">负责人 *</label>
                        <select class="stage-owner-select w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" data-stage="${index}">
                            <option value="">请选择负责人</option>
                            ${availableMembers.map(member => 
                                `<option value="${member.id}">${member.name} (${teamRoles[member.role]})</option>`
                            ).join('')}
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">预计工期</label>
                        <input type="number" value="${stage.duration}" min="1" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="天数">
                    </div>
                </div>
                <div class="mt-3">
                    <label class="block text-sm font-medium text-gray-700 mb-2">交付物</label>
                    <div class="flex flex-wrap gap-2">
                        ${stage.deliverables.map(deliverable => 
                            `<span class="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">${deliverable}</span>`
                        ).join('')}
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // 保存阶段配置
    projectData.stages = template.stages.map((stage, index) => ({
        ...stage,
        index: index,
        owner: null,
        duration: stage.duration
    }));
}

// 生成团队配置
function generateTeamConfig() {
    const container = document.getElementById('teamMembers');
    
    if (!container) {
        console.error('找不到团队配置容器');
        return;
    }
    
    container.innerHTML = availableMembers.map(member => {
        return `
            <div class="team-member-card border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-500 transition-colors" data-member="${member.id}">
                <div class="flex items-center">
                    <div class="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                        <i class="fas fa-user text-gray-600"></i>
                    </div>
                    <div class="flex-1">
                        <h4 class="font-medium text-gray-800">${member.name}</h4>
                        <p class="text-sm text-gray-600">${teamRoles[member.role]} · ${member.department}</p>
                    </div>
                    <div class="ml-3">
                        <i class="fas fa-check text-blue-500 hidden"></i>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // 绑定团队成员选择事件
    const memberCards = container.querySelectorAll('.team-member-card');
    memberCards.forEach(card => {
        card.addEventListener('click', function() {
            this.classList.toggle('selected');
            this.classList.toggle('border-blue-500');
            this.classList.toggle('bg-blue-50');
            
            const checkIcon = this.querySelector('.fa-check');
            checkIcon.classList.toggle('hidden');
        });
    });
}

// 生成项目摘要
function generateProjectSummary() {
    const container = document.getElementById('projectSummary');
    
    if (!container) {
        console.error('找不到项目摘要容器');
        return;
    }
    
    const template = processTemplates[selectedTemplate];
    const selectedMembers = document.querySelectorAll('.team-member-card.selected');
    
    container.innerHTML = `
        <div class="space-y-6">
            <!-- 基本信息摘要 -->
            <div class="bg-gray-50 rounded-lg p-4">
                <h4 class="font-semibold text-gray-800 mb-3">项目基本信息</h4>
                <div class="grid grid-cols-2 gap-4 text-sm">
                    <div><span class="text-gray-600">项目名称：</span>${projectData.basicInfo.name}</div>
                    <div><span class="text-gray-600">客户：</span>${projectData.basicInfo.client}</div>
                    <div><span class="text-gray-600">开始时间：</span>${projectData.basicInfo.startDate}</div>
                    <div><span class="text-gray-600">结束时间：</span>${projectData.basicInfo.endDate}</div>
                </div>
            </div>
            
            <!-- 流程模板摘要 -->
            <div class="bg-gray-50 rounded-lg p-4">
                <h4 class="font-semibold text-gray-800 mb-3">选择的流程模板</h4>
                <div class="flex items-center">
                    <i class="fas fa-${getTemplateIcon(selectedTemplate)} text-blue-500 mr-2"></i>
                    <span class="font-medium">${template.name}</span>
                </div>
                <p class="text-sm text-gray-600 mt-2">${template.description}</p>
            </div>
            
            <!-- 流程阶段摘要 -->
            <div class="bg-gray-50 rounded-lg p-4">
                <h4 class="font-semibold text-gray-800 mb-3">流程阶段 (${template.stages.length}个)</h4>
                <div class="space-y-2">
                    ${template.stages.map((stage, index) => {
                        const ownerSelect = document.querySelector(`[data-stage="${index}"]`);
                        const ownerName = ownerSelect ? availableMembers.find(m => m.id === ownerSelect.value)?.name || '未分配' : '未分配';
                        return `
                            <div class="flex items-center justify-between text-sm">
                                <span>${index + 1}. ${stage.name}</span>
                                <span class="text-gray-600">负责人: ${ownerName}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
            
            <!-- 团队成员摘要 -->
            <div class="bg-gray-50 rounded-lg p-4">
                <h4 class="font-semibold text-gray-800 mb-3">团队成员 (${selectedMembers.length}人)</h4>
                <div class="flex flex-wrap gap-2">
                    ${Array.from(selectedMembers).map(card => {
                        const memberId = card.dataset.member;
                        const member = availableMembers.find(m => m.id === memberId);
                        return `<span class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">${member.name}</span>`;
                    }).join('')}
                </div>
            </div>
        </div>
    `;
}

// 获取模板图标
function getTemplateIcon(template) {
    const icons = {
        'to-home': 'home',
        'to-store': 'store',
        'product-code': 'qrcode'
    };
    return icons[template] || 'project-diagram';
}

// 创建项目
function createProject() {
    // 收集所有数据
    const stageOwners = document.querySelectorAll('.stage-owner-select');
    const selectedMembers = document.querySelectorAll('.team-member-card.selected');
    
    // 更新阶段负责人
    stageOwners.forEach((select, index) => {
        if (projectData.stages[index]) {
            projectData.stages[index].owner = select.value;
        }
    });
    
    // 更新团队成员
    projectData.team = Array.from(selectedMembers).map(card => {
        const memberId = card.dataset.member;
        return availableMembers.find(m => m.id === memberId);
    });
    
    // 显示创建中状态
    const createBtn = document.querySelector('.btn-primary');
    const originalText = createBtn.innerHTML;
    createBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>创建中...';
    createBtn.disabled = true;
    
    // 模拟创建过程
    setTimeout(() => {
        // 生成项目ID
        const projectId = 'PRJ' + String(Date.now()).slice(-3);
        
        // 显示成功消息
        showNotification('项目创建成功！', 'success');
        
        // 跳转到项目详情页
        setTimeout(() => {
            window.location.href = `project-process-detail.html?id=${projectId}`;
        }, 1500);
    }, 2000);
}

// 字段验证
function validateField(event) {
    const field = event.target;
    
    if (field.hasAttribute('required') && !field.value.trim()) {
        showFieldError(field, '此字段为必填项');
    } else {
        clearFieldError(field);
    }
}

// 显示字段错误
function showFieldError(field, message) {
    field.classList.add('border-red-500');
    
    // 移除已存在的错误消息
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
    
    // 添加错误消息
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error text-red-500 text-sm mt-1';
    errorDiv.textContent = message;
    field.parentNode.appendChild(errorDiv);
}

// 清除字段错误
function clearFieldError(field) {
    field.classList.remove('border-red-500');
    
    const errorDiv = field.parentNode.querySelector('.field-error');
    if (errorDiv) {
        errorDiv.remove();
    }
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

// 加载项目进行编辑
function loadProjectForEdit(projectId) {
    // 这里应该从服务器加载项目数据
    // 暂时使用模拟数据
    console.log('加载项目进行编辑:', projectId);
    
    // 更新页面标题
    document.querySelector('h1').textContent = '编辑项目流程';
    document.querySelector('.btn-primary').textContent = '保存修改';
}

// 键盘快捷键
document.addEventListener('keydown', function(e) {
    // Escape 返回上一步
    if (e.key === 'Escape' && currentStep > 1) {
        prevStep(currentStep - 1);
    }
    
    // Enter 下一步（仅在表单元素外）
    if (e.key === 'Enter' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
        if (currentStep < 5) {
            nextStep(currentStep + 1);
        }
    }
});