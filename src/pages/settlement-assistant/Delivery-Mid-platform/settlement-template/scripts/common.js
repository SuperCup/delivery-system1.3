// 菜单功能
function initMenu() {
    const currentPath = window.location.pathname;
    const menuLinks = document.querySelectorAll('.menu-link');
    
    menuLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });
}

// 客户筛选功能
function initCustomerFilter() {
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            const name = document.getElementById('searchName').value;
            const contact = document.getElementById('searchContact').value;
            const status = document.getElementById('customerStatus').value;
            
            // 这里添加搜索客户的逻辑
            console.log('搜索条件:', { name, contact, status });
            // 调用相应的加载函数
            if (typeof loadCustomers === 'function') {
                loadCustomers();
            }
        });
    }
}

// 模态框功能
function initModal(modalId, openBtnId, closeBtnId, cancelBtnId) {
    const modal = document.getElementById(modalId);
    const openBtn = document.getElementById(openBtnId);
    const closeBtn = document.getElementById(closeBtnId);
    const cancelBtn = document.getElementById(cancelBtnId);

    if (openBtn) {
        openBtn.addEventListener('click', () => {
            modal.style.display = 'block';
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    // 点击模态框外部关闭
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// 初始化所有功能
document.addEventListener('DOMContentLoaded', function() {
    initMenu();
    initCustomerFilter();
    
    // 初始化所有模态框
    initModal('createTemplateModal', 'createTemplateBtn', 'closeCreateModal', 'cancelCreate');
    initModal('documentModal', 'addDocumentBtn', 'closeModal', 'cancelBtn');
    initModal('processModal', 'addProcessBtn', 'closeModal', 'cancelBtn');
    initModal('customerModal', 'addCustomerBtn', 'closeModal', 'cancelBtn');
    initModal('createTaskModal', 'createTaskBtn', 'closeModal', 'cancelBtn');
    initModal('completeTaskModal', 'completeTaskBtn', 'closeCompleteModal', 'cancelComplete');
    initModal('deleteTaskModal', 'deleteTaskBtn', 'closeDeleteModal', 'cancelDelete');
}); 