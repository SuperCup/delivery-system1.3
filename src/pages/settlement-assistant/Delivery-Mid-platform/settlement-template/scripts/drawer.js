// 抽屉容器
let drawerContainer = null;

// 初始化抽屉容器
function initDrawer() {
    if (!drawerContainer) {
        drawerContainer = document.createElement('div');
        drawerContainer.className = 'fixed inset-y-0 right-0 w-96 bg-white shadow-lg transform transition-transform duration-300 ease-in-out translate-x-full';
        drawerContainer.style.zIndex = '50';
        document.body.appendChild(drawerContainer);
    }
}

// 显示资料创建抽屉
function showDocumentCreateDrawer() {
    initDrawer();
    drawerContainer.innerHTML = `
        <iframe src="document-create.html" class="w-full h-full"></iframe>
    `;
    drawerContainer.classList.remove('translate-x-full');
}

// 显示客户创建抽屉
function showCustomerCreateDrawer() {
    initDrawer();
    drawerContainer.innerHTML = `
        <iframe src="customer-create.html" class="w-full h-full"></iframe>
    `;
    drawerContainer.classList.remove('translate-x-full');
}

// 显示流程创建抽屉
function showProcessCreateDrawer() {
    initDrawer();
    drawerContainer.innerHTML = `
        <iframe src="process-create.html" class="w-full h-full"></iframe>
    `;
    drawerContainer.classList.remove('translate-x-full');
}

// 添加遮罩层
function addOverlay() {
    let overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-black bg-opacity-50 z-40';
    overlay.id = 'drawer-overlay';
    overlay.onclick = closeDrawer;
    document.body.appendChild(overlay);
}

// 移除遮罩层
function removeOverlay() {
    const overlay = document.getElementById('drawer-overlay');
    if (overlay) {
        overlay.remove();
    }
}

// 修改显示函数,添加遮罩层
function showDrawer(content) {
    initDrawer();
    addOverlay();
    drawerContainer.innerHTML = content;
    drawerContainer.classList.remove('translate-x-full');
}

// 修改关闭函数,移除遮罩层
function closeDrawer() {
    if (drawerContainer) {
        drawerContainer.classList.add('translate-x-full');
        removeOverlay();
        // 等待动画结束后移除iframe
        setTimeout(() => {
            drawerContainer.innerHTML = '';
        }, 300);
    }
}

// 导出函数
window.showDocumentCreateDrawer = showDocumentCreateDrawer;
window.showCustomerCreateDrawer = showCustomerCreateDrawer;
window.showProcessCreateDrawer = showProcessCreateDrawer;
window.closeDrawer = closeDrawer; 