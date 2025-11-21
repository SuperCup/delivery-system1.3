// 示例任务数据
const sampleTasks = [
    {
        id: 1,
        name: '嘉士伯2023年Q4结算',
        customer: '嘉士伯',
        status: 'pending',
        createTime: '2023-12-01 10:00:00'
    },
    {
        id: 2,
        name: '达能2023年11月结算',
        customer: '达能',
        status: 'processing',
        createTime: '2023-11-15 14:30:00'
    },
    {
        id: 3,
        name: '伊利2023年Q3结算',
        customer: '伊利',
        status: 'completed',
        createTime: '2023-09-30 16:45:00'
    }
];

// 示例模板数据
const sampleTemplates = [
    {
        id: 1,
        name: '月度结算模板'
    },
    {
        id: 2,
        name: '季度结算模板'
    },
    {
        id: 3,
        name: '年度结算模板'
    }
];

// 加载任务列表
function loadTasks() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';

    sampleTasks.forEach(task => {
        const row = document.createElement('tr');
        row.className = 'task-item';
        
        // 状态标签样式
        let statusClass = '';
        let statusText = '';
        switch(task.status) {
            case 'pending':
                statusClass = 'status-badge status-pending';
                statusText = '待处理';
                break;
            case 'processing':
                statusClass = 'status-badge status-processing';
                statusText = '处理中';
                break;
            case 'completed':
                statusClass = 'status-badge status-completed';
                statusText = '已完成';
                break;
        }

        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">${task.name}</td>
            <td class="px-6 py-4 whitespace-nowrap">${task.customer}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="${statusClass}">${statusText}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">${task.createTime}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <button class="action-button text-[#005EFF] hover:text-blue-700 mr-2">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-button text-red-500 hover:text-red-700">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        taskList.appendChild(row);
    });
}

// 加载模板选项
function loadTemplateOptions() {
    const templateSelect = document.getElementById('taskTemplate');
    templateSelect.innerHTML = '<option value="">请选择模板</option>';
    
    sampleTemplates.forEach(template => {
        const option = document.createElement('option');
        option.value = template.id;
        option.textContent = template.name;
        templateSelect.appendChild(option);
    });
}

// 初始化创建任务模态框
function initCreateTaskModal() {
    const modal = document.getElementById('createTaskModal');
    const createTaskBtn = document.getElementById('createTaskBtn');
    const closeModalBtn = document.getElementById('closeCreateModal');
    const cancelCreateBtn = document.getElementById('cancelCreate');
    const selectTemplateBtn = document.getElementById('selectTemplateBtn');
    const createNewTemplateBtn = document.getElementById('createNewTemplateBtn');
    const createTaskForm = document.getElementById('createTaskForm');

    // 打开模态框
    createTaskBtn.addEventListener('click', () => {
        modal.style.display = 'block';
        createTaskForm.classList.add('hidden');
    });

    // 关闭模态框
    function closeModal() {
        modal.style.display = 'none';
        createTaskForm.classList.add('hidden');
        createTaskForm.reset();
    }

    closeModalBtn.addEventListener('click', closeModal);
    cancelCreateBtn.addEventListener('click', closeModal);

    // 点击模态框外部关闭
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    // 从模板选择
    selectTemplateBtn.addEventListener('click', () => {
        createTaskForm.classList.remove('hidden');
        loadTemplateOptions();
    });

    // 创建新模板
    createNewTemplateBtn.addEventListener('click', () => {
        window.location.href = 'template-list.html';
    });

    // 提交表单
    createTaskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const taskName = document.getElementById('taskName').value;
        const customer = document.getElementById('taskCustomer').value;
        const templateId = document.getElementById('taskTemplate').value;
        
        if (!taskName || !customer || !templateId) {
            alert('请填写完整信息');
            return;
        }

        // 这里添加创建任务的逻辑
        console.log('创建任务:', { taskName, customer, templateId });
        closeModal();
    });
}

// 初始化筛选功能
function initFilters() {
    const filters = document.querySelectorAll('.filter-section select');
    
    filters.forEach(filter => {
        filter.addEventListener('change', () => {
            // 这里添加筛选逻辑
            console.log('筛选条件变化:', filter.value);
        });
    });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    initCreateTaskModal();
    initFilters();
}); 