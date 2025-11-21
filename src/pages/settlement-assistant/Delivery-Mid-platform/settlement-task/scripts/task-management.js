// 全局变量
let currentTaskId = null;
let tasks = [];

// 模拟当前用户
const currentUser = '张三';

// 模拟数据
const mockTasks = [
    {
        id: 1,
        name: "总部服务费、广告费结算",
        projects: [
            { name: "2025年嘉士伯3月到家活动", code: "SG-250173" }
        ],
        settlementOrder: "BS-25028418",
        progress: 60,
        status: "in_progress",
        currentProcess: {
            id: 1,
            name: "核销明细",
            type: "material",
            follower: "张三",
            cycle: "3天",
            viewable: true
        },
        processes: [
            {
                id: 1,
                name: "PO",
                follower: "张三",
                cycle: "3天"
            },
            {
                id: 1,
                name: "合同",
                follower: "张三",
                cycle: "3天"
            },
            {
                id: 1,
                name: "核销明细",
                follower: "张三",
                cycle: "3天"
            },
            {
                id: 1,
                name: "资源位截图",
                follower: "张三",
                cycle: "3天"
            },
            {
                id: 2,
                name: "总部Owen确认",
                follower: "李四",
                cycle: "2天"
            },
            {
                id: 3,
                name: "TM上传资料",
                follower: "王五",
                cycle: "5天"
            }
        ],
        createdAt: "2024-03-15T10:00:00",
        createdBy: "系统管理员",
        targetAmount: 500000,
        actualAmount: 450000
    },
    {
        id: 2,
        name: "湖南核销费结算",
        projects: [
            { name: "2025年嘉士伯3月到家活动", code: "SG-250173" }
        ],
        settlementOrder: "BS-25028418",
        progress: 100,
        status: "completed",
        currentProcess: {
            id: 3,
            name: "客户系统结算",
            type: "customer",
            follower: "王五",
            cycle: "5天",
            viewable: true
        },
        processes: [
            {
                id: 1,
                name: "资料准备",
                follower: "张三",
                cycle: "3天"
            },
            {
                id: 2,
                name: "结算确认",
                follower: "李四",
                cycle: "2天"
            },
            {
                id: 3,
                name: "客户系统结算",
                follower: "王五",
                cycle: "5天"
            }
        ],
        createdAt: "2024-03-10T14:30:00",
        createdBy: "系统管理员",
        targetAmount: 800000,
        actualAmount: 800000
    },
    {
        id: 3,
        name: "华中核销费结算",
        projects: [
            { name: "2025年嘉士伯3月到家活动", code: "SG-250173" }
        ],
        settlementOrder: "BS-25028418",
        progress: 100,
        status: "completed",
        currentProcess: {
            id: 3,
            name: "客户系统结算",
            type: "customer",
            follower: "王五",
            cycle: "5天",
            viewable: true
        },
        processes: [
            {
                id: 1,
                name: "资料准备",
                follower: "张三",
                cycle: "3天"
            },
            {
                id: 2,
                name: "结算确认",
                follower: "李四",
                cycle: "2天"
            },
            {
                id: 3,
                name: "客户系统结算",
                follower: "王五",
                cycle: "5天"
            }
        ],
        createdAt: "2024-03-10T14:30:00",
        createdBy: "系统管理员",
        targetAmount: 800000,
        actualAmount: 800000
    },
    {
        id: 4,
        name: "广东核销费结算",
        projects: [
            { name: "2025年嘉士伯3月到家活动", code: "SG-250173" }
        ],
        settlementOrder: "BS-25028418",
        progress: 30,
        status: "abandoned",
        currentProcess: {
            id: 1,
            name: "资料准备",
            type: "material",
            follower: "张三",
            cycle: "3天",
            viewable: true
        },
        processes: [
            {
                id: 1,
                name: "资料准备",
                follower: "张三",
                cycle: "3天"
            },
            {
                id: 2,
                name: "结算确认",
                follower: "李四",
                cycle: "2天"
            },
            {
                id: 3,
                name: "客户系统结算",
                follower: "王五",
                cycle: "5天"
            }
        ],
        createdAt: "2024-03-10T14:30:00",
        createdBy: "系统管理员",
        targetAmount: 800000,
        actualAmount: 0,
        abandonReason: "客户要求取消结算"
    },
    {
        id: 5,
        name: "华北核销费结算",
        projects: [
            { name: "2025年嘉士伯3月到家活动", code: "SG-250173" }
        ],
        settlementOrder: "BS-25028418",
        progress: 30,
        status: "overdue",
        currentProcess: {
            id: 1,
            name: "资料准备",
            type: "material",
            follower: "张三",
            cycle: "3天",
            viewable: true
        },
        processes: [
            {
                id: 1,
                name: "资料准备",
                follower: "张三",
                cycle: "3天"
            },
            {
                id: 2,
                name: "结算确认",
                follower: "李四",
                cycle: "2天"
            },
            {
                id: 3,
                name: "客户系统结算",
                follower: "王五",
                cycle: "5天"
            }
        ],
        createdAt: "2024-03-10T14:30:00",
        createdBy: "王五",
        targetAmount: 600000,
        actualAmount: 0
    }
];

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 获取URL参数
    const urlParams = new URLSearchParams(window.location.search);
    const settlementNo = urlParams.get('settlementNo');
    const mergeId = urlParams.get('mergeId');
    
    // 如果URL中包含结算单编号，则填充到搜索框
    if (settlementNo) {
        document.getElementById('settlementNoFilter').value = settlementNo;
        // 触发搜索
        filterTasks();
    }
    
    // 如果URL中包含合并结算单ID，则显示相关信息
    if (mergeId) {
        // 在页面标题下方显示来源信息
        const titleContainer = document.querySelector('.container .flex.justify-between.items-center.mb-8');
        const infoDiv = document.createElement('div');
        infoDiv.className = 'mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800';
        infoDiv.innerHTML = `<i class="fas fa-info-circle mr-2"></i>当前显示外部结算单 <strong>${mergeId}</strong> 的相关任务`;
        titleContainer.parentNode.insertBefore(infoDiv, titleContainer.nextSibling);
        
        // 根据mergeId筛选任务（这里可以根据实际业务逻辑调整）
        document.getElementById('settlementNoFilter').value = mergeId;
        filterTasks();
    }

    // 为搜索框添加输入事件监听
    document.getElementById('taskNameFilter').addEventListener('input', filterTasks);
    document.getElementById('settlementNoFilter').addEventListener('input', filterTasks);
    document.getElementById('relatedToMeFilter').addEventListener('change', filterTasks);

    // 加载任务列表
    loadTasks();

    // 绑定事件监听器
    document.getElementById('createProjectBtn')?.addEventListener('click', function() {
        window.location.href = '../settlement-template/template-list.html';
    });
});

// 加载任务列表
async function loadTasks() {
    try {
        // 使用模拟数据
        tasks = mockTasks;
        renderTaskList(tasks);
        renderStats(tasks);
    } catch (error) {
        console.error('加载任务列表失败:', error);
        showError('加载任务列表失败，请稍后重试');
    }
}

// 渲染统计卡片
function renderStats(tasks) {
    let inProgress = 0, completed = 0, overdue = 0, abandoned = 0;
    const now = new Date();
    tasks.forEach(task => {
        if (task.status === 'in_progress') {
            // 超期判断：创建时间超过一个月
            const created = new Date(task.createdAt);
            const diffMonth = (now - created) / (1000 * 60 * 60 * 24 * 30);
            if (diffMonth > 1) overdue++;
            else inProgress++;
        } else if (task.status === 'completed') completed++;
        else if (task.status === 'abandoned') abandoned++;
    });
    document.getElementById('stat-in-progress').textContent = inProgress;
    document.getElementById('stat-completed').textContent = completed;
    document.getElementById('stat-overdue').textContent = overdue;
    document.getElementById('stat-abandoned').textContent = abandoned;
}

// 渲染任务列表
function renderTaskList(tasksToRender) {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = tasksToRender.map(task => `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                ${task.name}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
                <a href="javascript:void(0)" onclick="viewProjectDetail('${task.projects?.[0]?.code || ''}')" class="text-blue-600 hover:text-blue-800 hover:underline">
                    ${task.projects?.[0]?.name || '-'}
                </a>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
                <a href="javascript:void(0)" onclick="viewSettlementDetail('${task.settlementOrder || ''}')" class="text-blue-600 hover:text-blue-800 hover:underline">
                    ${task.settlementOrder || '-'}
                </a>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${task.progress}%
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${task.status === 'completed' ? 'bg-green-100 text-green-800' : 
                      task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 
                      task.status === 'overdue' ? 'bg-red-100 text-red-800' : 
                      task.status === 'abandoned' ? 'bg-gray-100 text-gray-800' : 
                      'bg-gray-100 text-gray-800'}">
                    ${
                        task.status === 'completed' ? '已完成' :
                        task.status === 'in_progress' ? '进行中' :
                        task.status === 'overdue' ? '已超期' :
                        task.status === 'abandoned' ? '已放弃' :
                        '部分完成'
                    }
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
                <a href="javascript:void(0)" onclick="viewProcessDetail(${task.id})" class="text-blue-600 hover:text-blue-800 hover:underline">
                    ${task.currentProcess?.name || '-'}
                </a>
                ${task.currentProcess?.follower ? `
                    <span class="ml-2 inline-block bg-blue-50 border border-blue-200 text-blue-700 rounded px-2 py-0.5 text-xs">${task.currentProcess.follower}</span>
                ` : ''}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${formatAmount(task.targetAmount)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${formatAmount(task.actualAmount)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${formatDate(task.createdAt)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium sticky right-0 bg-white z-10">
                <button onclick="viewTaskDetail(${task.id})" class="text-blue-600 hover:text-blue-900 mr-3">
                    <i class="fas fa-info-circle"></i> 详情
                </button>
                ${task.status === 'in_progress' ? `
                    <button onclick="checkIn(${task.id})" class="text-green-600 hover:text-green-900 mr-3">
                        <i class="fas fa-check-circle"></i> 打卡
                    </button>
                    <button onclick="abandonTask(${task.id})" class="text-red-600 hover:text-red-900">
                        <i class="fas fa-times-circle"></i> 放弃
                    </button>
                ` : ''}
                ${task.status === 'overdue' ? `
                    <button onclick="applyExtension(${task.id})" class="text-yellow-600 hover:text-yellow-900 mr-3">
                        <i class="fas fa-clock"></i> 申请延期
                    </button>
                ` : ''}
                ${task.status === 'abandoned' ? `
                    <button onclick="viewAbandonReason(${task.id})" class="text-gray-600 hover:text-gray-900">
                        <i class="fas fa-info-circle"></i> 查看放弃理由
                    </button>
                ` : ''}

            </td>
        </tr>
    `).join('');
}

// 过滤任务列表
function filterTasks() {
    const taskNameFilter = document.getElementById('taskNameFilter').value.toLowerCase();
    const settlementNoFilter = document.getElementById('settlementNoFilter').value.toLowerCase();
    const relatedToMe = document.getElementById('relatedToMeFilter').checked;
    
    const rows = document.querySelectorAll('#taskList tr');
    
    rows.forEach(row => {
        const taskName = row.querySelector('td:nth-child(1)')?.textContent.toLowerCase() || '';
        const settlementNo = row.querySelector('td:nth-child(3)')?.textContent.toLowerCase() || '';
        const isRelated = row.getAttribute('data-related') === 'true';
        
        const matchesTaskName = taskName.includes(taskNameFilter);
        const matchesSettlementNo = settlementNo.includes(settlementNoFilter);
        const matchesRelated = !relatedToMe || isRelated;
        
        row.style.display = matchesTaskName && matchesSettlementNo && matchesRelated ? '' : 'none';
    });
}

// 判断任务是否与当前用户相关
function isTaskRelatedToMe(task) {
    return task.processes.some(process => process.follower === currentUser);
}

// 右侧抽屉显示当前环节详情，以链式方式展示所有环节
function showProcessDrawer(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    let drawer = document.getElementById('processDrawer');
    let drawerContent = document.getElementById('processDrawerContent');
    if (!drawer) {
        drawer = document.createElement('div');
        drawer.id = 'processDrawer';
        drawer.className = 'fixed top-0 right-0 w-96 h-full bg-white shadow-lg z-50 hidden transition-all';
        drawer.innerHTML = `
            <div class="flex justify-between items-center p-4 border-b">
                <span class="font-bold">环节详情</span>
                <button onclick="closeProcessDrawer()" class="text-gray-500 hover:text-gray-700"><i class="fas fa-times"></i></button>
            </div>
            <div id="processDrawerContent" class="overflow-y-auto h-[calc(100%-48px)]"></div>
        `;
        document.body.appendChild(drawer);
        drawerContent = document.getElementById('processDrawerContent');
    }
    
    // 获取当前任务的所有环节
    const processes = [
        { id: 1, name: 'PO', type: 'material', follower: '张三', description: 'PO文档准备', cycle: '3天', status: 'completed' },
        { id: 2, name: '合同', type: 'material', follower: '李四', description: '合同文档准备', cycle: '5天', status: 'completed' },
        { id: 3, name: '核销明细', type: 'material', follower: '王五', description: '核销明细准备', cycle: '4天', status: 'in_progress' },
        { id: 4, name: '资源位截图', type: 'material', follower: '赵六', description: '资源位截图准备', cycle: '2天', status: 'pending' },
        { id: 5, name: '总部确认邮件', type: 'confirmation', follower: '钱七', description: '获取总部确认邮件', cycle: '7天', status: 'pending' },
        { id: 6, name: 'TM上传资料', type: 'customer', follower: '孙八', description: 'TM系统资料上传', cycle: '3天', status: 'pending' }
    ];
    
    // 当前环节为核销明细（第3个环节）
    const currentProcessIndex = 2; // 索引从0开始，所以第3个环节索引为2
    const currentProcess = processes[currentProcessIndex];
    
    // 构建环节导航
    let processNav = `
        <div class="p-4 border-b">
            <div class="flex justify-between items-center mb-2">
                <div class="text-sm text-gray-500">环节链</div>
                <div class="text-sm text-gray-500">${currentProcessIndex + 1}/${processes.length}</div>
            </div>
            <div class="flex items-center justify-between">
                <button 
                    onclick="navigateProcess(${taskId}, ${currentProcessIndex - 1})" 
                    class="px-3 py-1 text-sm rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 ${currentProcessIndex <= 0 ? 'opacity-50 cursor-not-allowed' : ''}"
                    ${currentProcessIndex <= 0 ? 'disabled' : ''}>
                    <i class="fas fa-chevron-left mr-1"></i>上一环节
                </button>
                <div class="text-sm font-medium">${currentProcess.name}</div>
                <button 
                    onclick="navigateProcess(${taskId}, ${currentProcessIndex + 1})" 
                    class="px-3 py-1 text-sm rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 ${currentProcessIndex >= processes.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}"
                    ${currentProcessIndex >= processes.length - 1 ? 'disabled' : ''}>
                    下一环节<i class="fas fa-chevron-right ml-1"></i>
                </button>
            </div>
        </div>
    `;
    
    // 环节格子导航
    let processBoxes = `
        <div class="px-4 pt-4 pb-2">
            <div class="flex justify-between">
                ${processes.map((p, idx) => `
                    <div class="relative">
                        ${idx === currentProcessIndex ? `
                            <div class="absolute -top-4 left-1/2 transform -translate-x-1/2 text-blue-600">
                                <i class="fas fa-caret-down"></i>
                            </div>
                        ` : ''}
                        <div class="w-12 h-12 ${p.status === 'completed' || idx === currentProcessIndex ? 'bg-blue-600' : 'bg-gray-200'} rounded flex items-center justify-center text-white">
                            ${idx + 1}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    // 环节详情内容
    let processContent = `
        <div class="p-4">
            <div class="mb-4">
                <div class="text-lg font-bold">${currentProcess.name}</div>
                <div class="text-sm text-gray-600 mt-1">环节 ${currentProcessIndex + 1}/${processes.length}</div>
            </div>
            
            <div class="mb-4">
                <div class="flex items-center mb-2">
                    <span class="font-medium mr-2">跟进人：</span>
                    <span class="inline-block bg-blue-50 border border-blue-200 text-blue-700 rounded px-2 py-0.5 text-xs">${currentProcess.follower || '未指定'}</span>
                </div>
                <div class="mb-2">
                    <span class="font-medium">环节说明：</span>
                    <span class="text-gray-700">${currentProcess.description || '暂无说明'}</span>
                </div>
                <div class="mb-2">
                    <span class="font-medium">处理周期：</span>
                    <span class="text-gray-700">${currentProcess.cycle || '未设定'}</span>
                </div>
            </div>
    `;
    
    // 当前环节为核销明细，属于资料准备类环节
    processContent += `
        <div class="mb-4">
            <div class="font-medium mb-2">必要资料：</div>
            <div class="space-y-3">
                <div class="p-3 bg-gray-50 rounded-lg">
                    <div class="flex justify-between items-center mb-2">
                        <span class="font-medium">3月美团核销明细</span>
                        <span class="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                            已上传
                        </span>
                    </div>
                    <div class="flex items-center justify-between text-sm">
                        <div class="flex items-center">
                            <i class="far fa-file-excel text-green-500 mr-1"></i>
                            <span class="text-blue-600 hover:underline cursor-pointer" onclick="previewFile('3月美团核销明细.xlsx')">3月美团核销明细.xlsx</span>
                        </div>
                        <div class="flex items-center">
                            <button class="text-red-600 hover:text-red-800" onclick="deleteFile(3)">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </div>
                    <div class="text-xs text-gray-500 mt-1">更新时间：2024-04-10 15:30</div>
                    <button class="w-full mt-2 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm flex items-center justify-center" onclick="uploadFile(3, '费用明细')">
                        <i class="fas fa-upload mr-1"></i> 继续上传
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // 关闭环节内容
    processContent += `</div>`;
    
    // 添加滑动提示
    let swipeHint = `
        <div class="p-4 border-t text-center text-sm text-gray-500">
            <i class="fas fa-arrows-alt-h mr-1"></i> 左右滑动切换环节
        </div>
    `;
    
    // 组合最终内容
    drawerContent.innerHTML = processNav + processBoxes + processContent + swipeHint;
    drawer.classList.remove('hidden');
    
    // 添加滑动事件
    let startX, endX;
    drawerContent.addEventListener('touchstart', function(e) {
        startX = e.touches[0].clientX;
    });
    
    drawerContent.addEventListener('touchend', function(e) {
        endX = e.changedTouches[0].clientX;
        if (startX - endX > 50 && currentProcessIndex < processes.length - 1) {
            // 向左滑动，下一环节
            navigateProcess(taskId, currentProcessIndex + 1);
        } else if (endX - startX > 50 && currentProcessIndex > 0) {
            // 向右滑动，上一环节
            navigateProcess(taskId, currentProcessIndex - 1);
        }
    });
    
    // 存储当前任务和环节信息到全局变量，用于环节导航
    window.currentTaskData = {
        taskId: taskId,
        processes: processes,
        currentIndex: currentProcessIndex
    };
}

function closeProcessDrawer() {
    const drawer = document.getElementById('processDrawer');
    if (drawer) drawer.classList.add('hidden');
}

function showMaterialDetail(name) {
    alert('资料详情弹窗：' + name);
}
function uploadMaterial(name) {
    alert('上传资料功能：' + name);
}

// 查看任务详情
function viewTaskDetail(taskId) {
    window.location.href = `task-detail.html?id=${taskId}`;
}

// 打卡
function checkIn(taskId) {
    currentTaskId = taskId;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const modal = document.getElementById('checkInModal');
    const form = document.getElementById('checkInForm');
    form.innerHTML = '';

    // 根据当前环节类型生成不同的表单
    switch (task.currentProcess.type) {
        case 'material':
            form.innerHTML = `
                <div class="mb-4">
                    <div class="text-lg font-bold mb-2">${task.currentProcess.name}</div>
                    <div class="text-sm text-gray-600 mb-4">环节 ${task.processes.findIndex(p => p.id === task.currentProcess.id) + 1}/${task.processes.length}</div>
                    
                    <div class="mb-4">
                        <div class="flex items-center mb-2">
                            <span class="font-medium mr-2">跟进人：</span>
                            <span class="inline-block bg-blue-50 border border-blue-200 text-blue-700 rounded px-2 py-0.5 text-xs">${task.currentProcess.follower || '未指定'}</span>
                        </div>
                        <div class="mb-2">
                            <span class="font-medium">环节说明：</span>
                            <span class="text-gray-700">${task.currentProcess.description || '暂无说明'}</span>
                        </div>
                        <div class="mb-2">
                            <span class="font-medium">处理周期：</span>
                            <span class="text-gray-700">${task.currentProcess.cycle || '未设定'}</span>
                        </div>
                    </div>

                    <div class="mb-4">
                        <div class="font-medium mb-2">必要资料：</div>
            <div class="space-y-3">
                <div class="p-3 bg-gray-50 rounded-lg">
                    <div class="flex justify-between items-center mb-2">
                        <span class="font-medium">3月美团核销明细</span>
                        <span class="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                            已上传
                        </span>
                    </div>
                    <div class="flex items-center justify-between text-sm">
                        <div class="flex items-center">
                            <i class="far fa-file-excel text-green-500 mr-1"></i>
                            <span class="text-blue-600 hover:underline cursor-pointer" onclick="previewFile('3月美团核销明细.xlsx')">3月美团核销明细.xlsx</span>
                        </div>
                        <div class="flex items-center">
                            <button class="text-red-600 hover:text-red-800" onclick="deleteFile(3)">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </div>
                    <div class="text-xs text-gray-500 mt-1">更新时间：2024-04-10 15:30</div>
                    <button class="w-full mt-2 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm flex items-center justify-center" onclick="uploadFile(3, '费用明细')">
                        <i class="fas fa-upload mr-1"></i> 继续上传
                    </button>
                </div>
            </div>
                    </div>
                </div>
            `;
            break;
        case 'confirmation':
            form.innerHTML = `
                <div class="mb-4">
                    <div class="text-lg font-bold mb-2">${task.currentProcess.name}</div>
                    <div class="text-sm text-gray-600 mb-4">环节 ${task.processes.findIndex(p => p.id === task.currentProcess.id) + 1}/${task.processes.length}</div>
                    
                    <div class="mb-4">
                        <div class="flex items-center mb-2">
                            <span class="font-medium mr-2">跟进人：</span>
                            <span class="inline-block bg-blue-50 border border-blue-200 text-blue-700 rounded px-2 py-0.5 text-xs">${task.currentProcess.follower || '未指定'}</span>
                        </div>
                        <div class="mb-2">
                            <span class="font-medium">环节说明：</span>
                            <span class="text-gray-700">${task.currentProcess.description || '暂无说明'}</span>
                        </div>
                        <div class="mb-2">
                            <span class="font-medium">处理周期：</span>
                            <span class="text-gray-700">${task.currentProcess.cycle || '未设定'}</span>
                        </div>
                    </div>

                    <div class="mb-4">
                        <div class="font-medium mb-2">确认信息：</div>
                        <div class="space-y-3">
                            <div class="p-3 bg-gray-50 rounded-lg">
                                <div class="mb-2">
                                    <label class="block text-gray-700 text-sm font-bold mb-2">确认方</label>
                                    <select class="w-full px-3 py-2 border rounded-md">
                                        <option>总部</option>
                                        <option>湖南大区</option>
                                        <option>广东大区</option>
                                    </select>
                                </div>
                                <div class="mb-2">
                                    <label class="block text-gray-700 text-sm font-bold mb-2">确认方式</label>
                                    <select class="w-full px-3 py-2 border rounded-md">
                                        <option>邮件确认</option>
                                        <option>系统确认</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            break;
        case 'customer':
            form.innerHTML = `
                <div class="mb-4">
                    <div class="text-lg font-bold mb-2">${task.currentProcess.name}</div>
                    <div class="text-sm text-gray-600 mb-4">环节 ${task.processes.findIndex(p => p.id === task.currentProcess.id) + 1}/${task.processes.length}</div>
                    
                    <div class="mb-4">
                        <div class="flex items-center mb-2">
                            <span class="font-medium mr-2">跟进人：</span>
                            <span class="inline-block bg-blue-50 border border-blue-200 text-blue-700 rounded px-2 py-0.5 text-xs">${task.currentProcess.follower || '未指定'}</span>
                        </div>
                        <div class="mb-2">
                            <span class="font-medium">环节说明：</span>
                            <span class="text-gray-700">${task.currentProcess.description || '暂无说明'}</span>
                        </div>
                        <div class="mb-2">
                            <span class="font-medium">处理周期：</span>
                            <span class="text-gray-700">${task.currentProcess.cycle || '未设定'}</span>
                        </div>
                    </div>

                    <div class="mb-4">
                        <div class="font-medium mb-2">操作说明：</div>
                        <div class="space-y-3">
                            <div class="p-3 bg-gray-50 rounded-lg">
                                <div class="mb-2">
                                    <label class="block text-gray-700 text-sm font-bold mb-2">系统截图</label>
                                    <input type="file" class="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm flex items-center justify-center" accept=".jpg,.png">
                                </div>
                                <div class="mb-2">
                                    <label class="block text-gray-700 text-sm font-bold mb-2">操作说明</label>
                                    <textarea class="w-full px-3 py-2 border rounded-md" rows="3" placeholder="请描述系统操作步骤"></textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            break;
    }

    modal.classList.remove('hidden');
}

// 关闭打卡模态框
function closeCheckInModal() {
    document.getElementById('checkInModal').classList.add('hidden');
    currentTaskId = null;
}

// 提交打卡
async function submitCheckIn() {
    if (!currentTaskId) return;

    try {
        // TODO: 替换为实际的API调用
        const formData = new FormData(document.getElementById('checkInForm'));
        await fetch(`/api/tasks/${currentTaskId}/check-in`, {
            method: 'POST',
            body: formData
        });

        showSuccess('打卡成功');
        closeCheckInModal();
        loadTasks();
    } catch (error) {
        console.error('打卡失败:', error);
        showError('打卡失败，请稍后重试');
    }
}

// 放弃任务
function abandonTask(taskId) {
    currentTaskId = taskId;
    document.getElementById('abandonModal').classList.remove('hidden');
}

// 关闭放弃任务模态框
function closeAbandonModal() {
    document.getElementById('abandonModal').classList.add('hidden');
    document.getElementById('abandonReason').value = '';
    currentTaskId = null;
}

// 确认放弃任务
async function confirmAbandon() {
    if (!currentTaskId) return;

    const reason = document.getElementById('abandonReason').value;
    if (!reason) {
        showError('请输入放弃原因');
        return;
    }

    try {
        // TODO: 替换为实际的API调用
        await fetch(`/api/tasks/${currentTaskId}/abandon`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reason })
        });

        showSuccess('任务已放弃');
        closeAbandonModal();
        loadTasks();
    } catch (error) {
        console.error('放弃任务失败:', error);
        showError('放弃任务失败，请稍后重试');
    }
}

// 新建任务跳转到template-list
function createTask() {
    window.location.href = 'template-list.html';
}

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// 格式化金额显示
function formatAmount(amount) {
    return amount ? `¥${amount.toLocaleString()}` : '-';
}

// 显示错误消息
function showError(message) {
    // TODO: 实现错误消息显示
    alert(message);
}

// 显示成功消息
function showSuccess(message) {
    // TODO: 实现成功消息显示
    alert(message);
}

// 查看项目详情
function viewProjectDetail(projectCode) {
    if (!projectCode) return;
    // TODO: 实现项目详情查看逻辑
    console.log('查看项目详情:', projectCode);
}

// 查看结算单详情
function viewSettlementDetail(settlementCode) {
    if (!settlementCode) return;
    // TODO: 实现结算单详情查看逻辑
    console.log('查看结算单详情:', settlementCode);
}

// 查看环节详情
function viewProcessDetail(taskId) {
    if (!taskId) return;
    // TODO: 实现环节详情查看逻辑
    console.log('查看环节详情:', taskId);
    showProcessDrawer(taskId);
}

// 申请延期
function applyExtension(taskId) {
    currentTaskId = taskId;
    const modal = document.getElementById('extensionModal');
    if (!modal) {
        createExtensionModal();
    }
    modal.classList.remove('hidden');
}

// 创建申请延期模态框
function createExtensionModal() {
    const modal = document.createElement('div');
    modal.id = 'extensionModal';
    modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 hidden';
    modal.innerHTML = `
        <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold">申请延期</h3>
                <button onclick="closeExtensionModal()" class="text-gray-500 hover:text-gray-700">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="mb-4">
                <label class="block text-gray-700 text-sm font-bold mb-2">延期原因</label>
                <textarea id="extensionReason" class="w-full px-3 py-2 border rounded-md" rows="4" required></textarea>
            </div>
            <div class="mb-4">
                <label class="block text-gray-700 text-sm font-bold mb-2">延期天数</label>
                <input type="number" id="extensionDays" class="w-full px-3 py-2 border rounded-md" min="1" required>
            </div>
            <div class="flex justify-end">
                <button onclick="closeExtensionModal()" class="mr-2 px-4 py-2 text-gray-600 hover:text-gray-800">
                    取消
                </button>
                <button onclick="submitExtension()" class="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700">
                    提交申请
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// 关闭申请延期模态框
function closeExtensionModal() {
    const modal = document.getElementById('extensionModal');
    if (modal) {
        modal.classList.add('hidden');
        document.getElementById('extensionReason').value = '';
        document.getElementById('extensionDays').value = '';
    }
    currentTaskId = null;
}

// 提交延期申请
async function submitExtension() {
    if (!currentTaskId) return;

    const reason = document.getElementById('extensionReason').value;
    const days = document.getElementById('extensionDays').value;

    if (!reason || !days) {
        showError('请填写完整的延期信息');
        return;
    }

    try {
        // TODO: 替换为实际的API调用
        await fetch(`/api/tasks/${currentTaskId}/extension`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reason, days })
        });

        showSuccess('延期申请已提交');
        closeExtensionModal();
        loadTasks();
    } catch (error) {
        console.error('提交延期申请失败:', error);
        showError('提交延期申请失败，请稍后重试');
    }
}

// 查看放弃理由
function viewAbandonReason(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.abandonReason) return;

    const modal = document.createElement('div');
    modal.id = 'abandonReasonModal';
    modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50';
    modal.innerHTML = `
        <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold">放弃理由</h3>
                <button onclick="closeAbandonReasonModal()" class="text-gray-500 hover:text-gray-700">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="mb-4">
                <p class="text-gray-700">${task.abandonReason}</p>
            </div>
            <div class="flex justify-end">
                <button onclick="closeAbandonReasonModal()" class="px-4 py-2 text-gray-600 hover:text-gray-800">
                    关闭
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// 关闭放弃理由模态框
function closeAbandonReasonModal() {
    const modal = document.getElementById('abandonReasonModal');
    if (modal) {
        modal.remove();
    }
}

// 环节导航
function navigateProcess(taskId, targetIndex) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // 获取当前任务的所有环节
    const processes = [
        { id: 1, name: 'PO', type: 'material', follower: '张三', description: 'PO文档准备', cycle: '3天', status: 'completed' },
        { id: 2, name: '合同', type: 'material', follower: '李四', description: '合同文档准备', cycle: '5天', status: 'completed' },
        { id: 3, name: '核销明细', type: 'material', follower: '王五', description: '核销明细准备', cycle: '4天', status: 'in_progress' },
        { id: 4, name: '资源位截图', type: 'material', follower: '赵六', description: '资源位截图准备', cycle: '2天', status: 'pending' },
        { id: 5, name: '总部确认邮件', type: 'confirmation', follower: '钱七', description: '获取总部确认邮件', cycle: '7天', status: 'pending' },
        { id: 6, name: 'TM上传资料', type: 'customer', follower: '孙八', description: 'TM系统资料上传', cycle: '3天', status: 'pending' }
    ];

    // 检查索引是否有效
    if (targetIndex < 0 || targetIndex >= processes.length) {
        console.warn('无效的环节索引');
        return;
    }

    // 更新全局变量中的当前环节索引
    if (window.currentTaskData) {
        window.currentTaskData.currentIndex = targetIndex;
    }

    // 重新显示环节详情
    showProcessDrawer(taskId);
}

// 生成外部结算单
// 生成外部结算单相关功能已移除