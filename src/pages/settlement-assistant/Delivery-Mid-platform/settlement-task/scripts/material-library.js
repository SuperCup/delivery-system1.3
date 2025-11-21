// 结算资料库JavaScript
let materials = [];
let selectedFiles = [];

// 模拟资料数据
const mockMaterials = [
    {
        id: 1,
        name: '嘉士伯2024年度框架合同',
        type: 'contract',
        customer: '嘉士伯（中国）投资有限公司',
        projectCode: 'CB2024001',
        description: '嘉士伯中国2024年度数字营销服务框架合同',
        fileName: '嘉士伯2024年度框架合同.pdf',
        fileSize: 2048576, // 2MB
        uploadTime: '2024-01-15T10:30:00',
        uploader: '张经理',
        downloadCount: 15,
        tags: ['框架合同', '年度合同', '数字营销']
    },
    {
        id: 2,
        name: '春节营销活动报价单',
        type: 'quotation',
        customer: '嘉士伯（中国）投资有限公司',
        projectCode: 'CB2024002',
        description: '2024年春节营销活动整体报价方案',
        fileName: '春节营销活动报价单_v2.xlsx',
        fileSize: 1536000, // 1.5MB
        uploadTime: '2024-02-01T14:20:00',
        uploader: '李总监',
        downloadCount: 8,
        tags: ['春节活动', '报价单', '营销方案']
    },
    {
        id: 3,
        name: '报价确认邮件截图',
        type: 'quotation_confirm',
        customer: '嘉士伯（中国）投资有限公司',
        projectCode: 'CB2024002',
        description: '客户确认春节营销活动报价的邮件截图',
        fileName: '报价确认邮件_20240205.png',
        fileSize: 512000, // 500KB
        uploadTime: '2024-02-05T16:45:00',
        uploader: '王助理',
        downloadCount: 3,
        tags: ['报价确认', '邮件截图', '客户确认']
    },
    {
        id: 4,
        name: '2月份广告投放账单明细',
        type: 'bill_detail',
        customer: '嘉士伯（中国）投资有限公司',
        projectCode: 'CB2024002',
        description: '2024年2月份各平台广告投放费用明细表',
        fileName: '2月份广告投放账单明细.xlsx',
        fileSize: 2560000, // 2.5MB
        uploadTime: '2024-03-01T09:15:00',
        uploader: '陈会计',
        downloadCount: 12,
        tags: ['账单明细', '广告投放', '费用统计']
    },
    {
        id: 5,
        name: '微信朋友圈广告投放截图',
        type: 'ad_proof',
        customer: '嘉士伯（中国）投资有限公司',
        projectCode: 'CB2024002',
        description: '春节期间微信朋友圈广告投放效果截图合集',
        fileName: '微信朋友圈广告截图合集.zip',
        fileSize: 15728640, // 15MB
        uploadTime: '2024-02-20T11:30:00',
        uploader: '刘运营',
        downloadCount: 6,
        tags: ['广告截图', '微信朋友圈', '投放凭证']
    },
    {
        id: 6,
        name: '春节营销活动复盘报告',
        type: 'review_report',
        customer: '嘉士伯（中国）投资有限公司',
        projectCode: 'CB2024002',
        description: '2024年春节营销活动效果分析与复盘总结',
        fileName: '春节营销活动复盘报告_final.pptx',
        fileSize: 8388608, // 8MB
        uploadTime: '2024-03-10T15:20:00',
        uploader: '张经理',
        downloadCount: 20,
        tags: ['复盘报告', '效果分析', '营销总结']
    },
    {
        id: 7,
        name: '品牌授权书',
        type: 'other',
        customer: '嘉士伯（中国）投资有限公司',
        projectCode: 'CB2024001',
        description: '嘉士伯品牌在中国区域的授权使用文件',
        fileName: '嘉士伯品牌授权书_2024.pdf',
        fileSize: 1024000, // 1MB
        uploadTime: '2024-01-20T13:45:00',
        uploader: '法务部',
        downloadCount: 5,
        tags: ['品牌授权', '法务文件', '授权书']
    },
    {
        id: 8,
        name: '上海地区推广合作协议',
        type: 'contract',
        customer: '上海广告传媒有限公司',
        projectCode: 'SH2024001',
        description: '与上海广告传媒的区域推广合作协议',
        fileName: '上海地区推广合作协议.pdf',
        fileSize: 1792000, // 1.75MB
        uploadTime: '2024-02-15T10:00:00',
        uploader: '区域经理',
        downloadCount: 7,
        tags: ['合作协议', '区域推广', '上海']
    }
];

// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
    materials = [...mockMaterials];
    renderMaterialList(materials);
    
    // 绑定搜索和筛选事件
    document.getElementById('searchInput').addEventListener('input', debounce(searchMaterials, 300));
    document.getElementById('typeFilter').addEventListener('change', searchMaterials);
    document.getElementById('customerFilter').addEventListener('change', searchMaterials);
    document.getElementById('timeFilter').addEventListener('change', searchMaterials);
    
    // 绑定文件上传事件
    setupFileUpload();
    
    // 绑定表单提交事件
    document.getElementById('uploadForm').addEventListener('submit', handleUploadSubmit);
});

// 渲染资料列表
function renderMaterialList(materialsToRender) {
    const materialList = document.getElementById('materialList');
    
    if (materialsToRender.length === 0) {
        materialList.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                    <i class="fas fa-folder-open text-4xl mb-2"></i>
                    <div>暂无资料数据</div>
                </td>
            </tr>
        `;
        return;
    }
    
    materialList.innerHTML = materialsToRender.map(material => `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4">
                <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                        <div class="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <i class="${getFileIcon(material.fileName)} text-blue-600"></i>
                        </div>
                    </div>
                    <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">${material.name}</div>
                        <div class="text-sm text-gray-500">${material.fileName}</div>
                        ${material.description ? `<div class="text-xs text-gray-400 mt-1">${material.description}</div>` : ''}
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeColor(material.type)}">
                    ${getTypeText(material.type)}
                </span>
            </td>
            <td class="px-6 py-4">
                <div class="text-sm text-gray-900">${material.customer}</div>
                ${material.projectCode ? `<div class="text-sm text-gray-500">${material.projectCode}</div>` : ''}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${formatFileSize(material.fileSize)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${formatDate(material.uploadTime)}</div>
                <div class="text-sm text-gray-500">by ${material.uploader}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button onclick="downloadMaterial(${material.id})" class="text-blue-600 hover:text-blue-900 mr-3">
                    <i class="fas fa-download"></i> 下载
                </button>
                <button onclick="viewMaterial(${material.id})" class="text-green-600 hover:text-green-900 mr-3">
                    <i class="fas fa-eye"></i> 预览
                </button>
                <button onclick="deleteMaterial(${material.id})" class="text-red-600 hover:text-red-900">
                    <i class="fas fa-trash"></i> 删除
                </button>
            </td>
        </tr>
    `).join('');
}

// 搜索和筛选资料
function searchMaterials() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const typeFilter = document.getElementById('typeFilter').value;
    const customerFilter = document.getElementById('customerFilter').value;
    const timeFilter = document.getElementById('timeFilter').value;
    
    let filteredMaterials = materials.filter(material => {
        const matchesSearch = !searchTerm || 
            material.name.toLowerCase().includes(searchTerm) ||
            material.fileName.toLowerCase().includes(searchTerm) ||
            (material.description && material.description.toLowerCase().includes(searchTerm)) ||
            (material.tags && material.tags.some(tag => tag.toLowerCase().includes(searchTerm)));
        
        const matchesType = !typeFilter || material.type === typeFilter;
        const matchesCustomer = !customerFilter || material.customer === customerFilter;
        const matchesTime = !timeFilter || checkTimeFilter(material.uploadTime, timeFilter);
        
        return matchesSearch && matchesType && matchesCustomer && matchesTime;
    });
    
    renderMaterialList(filteredMaterials);
}

// 检查时间筛选
function checkTimeFilter(uploadTime, filter) {
    const now = new Date();
    const uploadDate = new Date(uploadTime);
    
    switch (filter) {
        case 'today':
            return uploadDate.toDateString() === now.toDateString();
        case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return uploadDate >= weekAgo;
        case 'month':
            return uploadDate.getMonth() === now.getMonth() && uploadDate.getFullYear() === now.getFullYear();
        case 'quarter':
            const currentQuarter = Math.floor(now.getMonth() / 3);
            const uploadQuarter = Math.floor(uploadDate.getMonth() / 3);
            return uploadQuarter === currentQuarter && uploadDate.getFullYear() === now.getFullYear();
        default:
            return true;
    }
}

// 显示上传模态框
function showUploadModal() {
    document.getElementById('uploadForm').reset();
    selectedFiles = [];
    updateFileList();
    document.getElementById('uploadModal').classList.remove('hidden');
}

// 关闭上传模态框
function closeUploadModal() {
    document.getElementById('uploadModal').classList.add('hidden');
    selectedFiles = [];
}

// 设置文件上传
function setupFileUpload() {
    const fileInput = document.getElementById('fileInput');
    const fileUploadArea = document.getElementById('fileUploadArea');
    
    // 文件选择事件
    fileInput.addEventListener('change', function(e) {
        handleFileSelect(e.target.files);
    });
    
    // 拖拽上传
    fileUploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        fileUploadArea.classList.add('dragover');
    });
    
    fileUploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        fileUploadArea.classList.remove('dragover');
    });
    
    fileUploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        fileUploadArea.classList.remove('dragover');
        handleFileSelect(e.dataTransfer.files);
    });
}

// 处理文件选择
function handleFileSelect(files) {
    for (let file of files) {
        if (file.size > 50 * 1024 * 1024) { // 50MB限制
            showError(`文件 ${file.name} 超过50MB大小限制`);
            continue;
        }
        
        if (!selectedFiles.find(f => f.name === file.name && f.size === file.size)) {
            selectedFiles.push(file);
        }
    }
    updateFileList();
}

// 更新文件列表显示
function updateFileList() {
    const fileList = document.getElementById('fileList');
    
    if (selectedFiles.length === 0) {
        fileList.innerHTML = '';
        return;
    }
    
    fileList.innerHTML = selectedFiles.map((file, index) => `
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div class="flex items-center">
                <i class="${getFileIcon(file.name)} text-blue-600 mr-3"></i>
                <div>
                    <div class="text-sm font-medium text-gray-900">${file.name}</div>
                    <div class="text-xs text-gray-500">${formatFileSize(file.size)}</div>
                </div>
            </div>
            <button type="button" onclick="removeFile(${index})" class="text-red-600 hover:text-red-800">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
}

// 移除文件
function removeFile(index) {
    selectedFiles.splice(index, 1);
    updateFileList();
}

// 处理上传表单提交
function handleUploadSubmit(event) {
    event.preventDefault();
    
    if (selectedFiles.length === 0) {
        showError('请选择要上传的文件');
        return;
    }
    
    const formData = {
        name: document.getElementById('materialName').value,
        type: document.getElementById('materialType').value,
        customer: document.getElementById('materialCustomer').value,
        projectCode: document.getElementById('projectCode').value,
        description: document.getElementById('materialDescription').value
    };
    
    // 模拟上传每个文件
    selectedFiles.forEach((file, index) => {
        const newMaterial = {
            id: Math.max(...materials.map(m => m.id)) + index + 1,
            name: formData.name + (selectedFiles.length > 1 ? ` (${index + 1})` : ''),
            type: formData.type,
            customer: formData.customer,
            projectCode: formData.projectCode,
            description: formData.description,
            fileName: file.name,
            fileSize: file.size,
            uploadTime: new Date().toISOString(),
            uploader: '当前用户',
            downloadCount: 0,
            tags: []
        };
        
        materials.unshift(newMaterial); // 添加到列表开头
    });
    
    renderMaterialList(materials);
    closeUploadModal();
    showSuccess(`成功上传 ${selectedFiles.length} 个文件`);
}

// 下载资料
function downloadMaterial(materialId) {
    const material = materials.find(m => m.id === materialId);
    if (!material) return;
    
    // 模拟下载
    showSuccess(`开始下载：${material.fileName}`);
    
    // 更新下载次数
    material.downloadCount++;
    renderMaterialList(materials);
}

// 预览资料
function viewMaterial(materialId) {
    const material = materials.find(m => m.id === materialId);
    if (!material) return;
    
    // 模拟预览
    alert(`预览资料：\n名称：${material.name}\n文件：${material.fileName}\n描述：${material.description || '无'}`);
}

// 删除资料
function deleteMaterial(materialId) {
    const material = materials.find(m => m.id === materialId);
    if (!material) return;
    
    if (confirm(`确定要删除资料"${material.name}"吗？此操作不可恢复。`)) {
        materials = materials.filter(m => m.id !== materialId);
        renderMaterialList(materials);
        showSuccess('资料删除成功');
    }
}

// 刷新资料列表
function refreshMaterials() {
    // 模拟从服务器重新加载数据
    materials = [...mockMaterials];
    renderMaterialList(materials);
    showSuccess('资料列表已刷新');
}

// 工具函数
function getFileIcon(fileName) {
    const ext = fileName.split('.').pop().toLowerCase();
    const iconMap = {
        'pdf': 'fas fa-file-pdf',
        'doc': 'fas fa-file-word',
        'docx': 'fas fa-file-word',
        'xls': 'fas fa-file-excel',
        'xlsx': 'fas fa-file-excel',
        'ppt': 'fas fa-file-powerpoint',
        'pptx': 'fas fa-file-powerpoint',
        'jpg': 'fas fa-file-image',
        'jpeg': 'fas fa-file-image',
        'png': 'fas fa-file-image',
        'gif': 'fas fa-file-image',
        'zip': 'fas fa-file-archive',
        'rar': 'fas fa-file-archive',
        '7z': 'fas fa-file-archive'
    };
    return iconMap[ext] || 'fas fa-file';
}

function getTypeColor(type) {
    const colorMap = {
        'contract': 'bg-blue-100 text-blue-800',
        'quotation': 'bg-green-100 text-green-800',
        'quotation_confirm': 'bg-yellow-100 text-yellow-800',
        'bill_detail': 'bg-purple-100 text-purple-800',
        'ad_proof': 'bg-pink-100 text-pink-800',
        'review_report': 'bg-indigo-100 text-indigo-800',
        'other': 'bg-gray-100 text-gray-800'
    };
    return colorMap[type] || 'bg-gray-100 text-gray-800';
}

function getTypeText(type) {
    const typeMap = {
        'contract': '合同/PO',
        'quotation': '报价单',
        'quotation_confirm': '报价确认凭证',
        'bill_detail': '账单明细',
        'ad_proof': '广告投放凭证',
        'review_report': '复盘报告',
        'other': '其他资料'
    };
    return typeMap[type] || type;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN') + ' ' + date.toLocaleTimeString('zh-CN', {hour: '2-digit', minute: '2-digit'});
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
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    toast.innerHTML = `<i class="fas fa-check-circle mr-2"></i>${message}`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        document.body.removeChild(toast);
    }, 3000);
}

function showError(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    toast.innerHTML = `<i class="fas fa-exclamation-circle mr-2"></i>${message}`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        document.body.removeChild(toast);
    }, 3000);
}