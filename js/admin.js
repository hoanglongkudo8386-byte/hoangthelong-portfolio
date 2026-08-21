/**
 * Hoàng Thế Long Admin Dashboard Controller Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. DANG NHAP BAO MAT
    const loginScreen = document.getElementById('loginScreen');
    const loginForm = document.getElementById('loginForm');
    const adminPasswordInput = document.getElementById('adminPassword');

    // Kiểm tra session đã đăng nhập chưa
    if (sessionStorage.getItem('htl_admin_logged') === 'true') {
        loginScreen.style.display = 'none';
        initDashboard();
    }

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const pass = adminPasswordInput.value.trim();
        if (pass === 'admin123' || pass === 'admin' || pass === '123456') {
            sessionStorage.setItem('htl_admin_logged', 'true');
            loginScreen.style.display = 'none';
            initDashboard();
        } else {
            alert('Mật khẩu quản trị không chính xác!');
        }
    });

    // 2. CHUYEN TAB SIDEBAR
    const menuItems = document.querySelectorAll('.menu-item');
    const tabContents = document.querySelectorAll('.tab-content');
    const pageTitle = document.getElementById('pageTitle');

    const tabTitles = {
        'dashboard': 'Tổng Quan Hệ Thống',
        'leads': 'Quản Lý Lead Khách Hàng',
        'blogs': 'Quản Lý Bài Viết Blog',
        'portfolio': 'Quản Lý Dự Án Portfolio',
        'ai-engine': 'AI Content Engine Playground'
    };

    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const tab = item.getAttribute('data-tab');
            if (!tab) return;

            menuItems.forEach(i => i.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            item.classList.add('active');
            const targetTab = document.getElementById(`tab-${tab}`);
            if (targetTab) targetTab.classList.add('active');

            if (pageTitle && tabTitles[tab]) {
                pageTitle.textContent = tabTitles[tab];
            }
        });
    });

    // 3. khoi tao va render du lieu
    function initDashboard() {
        renderStats();
        renderLeads();
        renderBlogs();
        renderProjects();
    }

    // RENDER THONG KE
    function renderStats() {
        const stats = window.HTLAIEngine ? window.HTLAIEngine.getDashboardStats() : { total_leads: 0, new_leads: 0, total_blogs: 0, total_projects: 0 };
        document.getElementById('statTotalLeads').textContent = stats.total_leads;
        document.getElementById('statNewLeads').textContent = stats.new_leads;
        document.getElementById('statTotalBlogs').textContent = stats.total_blogs;
        document.getElementById('statTotalProjects').textContent = stats.total_projects;
    }

    // RENDER LEADS
    function renderLeads() {
        const contacts = window.HTLDatabase.getContacts();
        const recentTable = document.getElementById('recentLeadsTable');
        const fullTable = document.getElementById('fullLeadsTable');

        if (recentTable) {
            recentTable.innerHTML = contacts.length === 0 ? 
                `<tr><td colspan="5" style="text-align:center; color: var(--text-secondary);">Chưa có liên hệ nào từ khách hàng</td></tr>` :
                contacts.slice(0, 5).map(c => `
                    <tr>
                        <td><strong>${escapeHtml(c.name)}</strong></td>
                        <td>${escapeHtml(c.email)}</td>
                        <td>${escapeHtml(c.subject)}</td>
                        <td><span class="status-badge badge-${c.status}">${formatStatus(c.status)}</span></td>
                        <td style="font-size: 0.8rem; color: var(--text-secondary);">${new Date(c.created_at).toLocaleDateString('vi-VN')}</td>
                    </tr>
                `).join('');
        }

        if (fullTable) {
            fullTable.innerHTML = contacts.length === 0 ? 
                `<tr><td colspan="6" style="text-align:center; color: var(--text-secondary);">Chưa có liên hệ nào từ khách hàng</td></tr>` :
                contacts.map(c => `
                    <tr>
                        <td><strong>${escapeHtml(c.name)}</strong></td>
                        <td>${escapeHtml(c.email)}</td>
                        <td>${escapeHtml(c.subject)}</td>
                        <td style="max-width: 250px;">${escapeHtml(c.message)}</td>
                        <td>
                            <select class="admin-select" style="padding: 0.2rem 0.5rem; font-size: 0.8rem;" onchange="updateLeadStatus('${c.id}', this.value)">
                                <option value="new" ${c.status === 'new' ? 'selected' : ''}>Mới</option>
                                <option value="processing" ${c.status === 'processing' ? 'selected' : ''}>Đang xử lý</option>
                                <option value="completed" ${c.status === 'completed' ? 'selected' : ''}>Đã chốt</option>
                            </select>
                        </td>
                        <td>
                            <button class="btn-admin btn-admin-danger" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;" onclick="deleteLead('${c.id}')">
                                <i class="fa-solid fa-trash"></i> Xóa
                            </button>
                        </td>
                    </tr>
                `).join('');
        }
    }

    // RENDER BLOGS
    function renderBlogs() {
        const blogs = window.HTLDatabase.getBlogs();
        const blogsTable = document.getElementById('blogsTable');
        if (!blogsTable) return;

        blogsTable.innerHTML = blogs.length === 0 ?
            `<tr><td colspan="5" style="text-align:center; color: var(--text-secondary);">Chưa có bài viết nào</td></tr>` :
            blogs.map(b => `
                <tr>
                    <td><strong>${escapeHtml(b.title)}</strong></td>
                    <td><span class="status-badge badge-new">${escapeHtml(b.category)}</span></td>
                    <td style="font-size: 0.85rem;">${b.published_at}</td>
                    <td><span class="status-badge badge-completed">${b.status === 'published' ? 'Đã đăng' : 'Bản nháp'}</span></td>
                    <td>
                        <button class="btn-admin btn-admin-danger" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;" onclick="deleteBlogArticle('${b.id}')">
                            <i class="fa-solid fa-trash"></i> Xóa
                        </button>
                    </td>
                </tr>
            `).join('');
    }

    // RENDER PROJECTS
    function renderProjects() {
        const projects = window.HTLDatabase.getProjects();
        const projectsTable = document.getElementById('projectsTable');
        if (!projectsTable) return;

        projectsTable.innerHTML = projects.length === 0 ?
            `<tr><td colspan="4" style="text-align:center; color: var(--text-secondary);">Chưa có dự án nào</td></tr>` :
            projects.map(p => `
                <tr>
                    <td><strong>${escapeHtml(p.title)}</strong></td>
                    <td><span class="status-badge badge-processing">${escapeHtml(p.category)}</span></td>
                    <td><strong style="color: var(--accent-green);">${escapeHtml(p.metric_value)}</strong> (${escapeHtml(p.metric_label)})</td>
                    <td>
                        <button class="btn-admin btn-admin-danger" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;" onclick="deleteProjectCard('${p.id}')">
                            <i class="fa-solid fa-trash"></i> Xóa
                        </button>
                    </td>
                </tr>
            `).join('');
    }

    // FORM THEM BLOG THU CONG
    const createBlogForm = document.getElementById('createBlogForm');
    if (createBlogForm) {
        createBlogForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = document.getElementById('blogTitle').value;
            const category = document.getElementById('blogCategory').value;
            const image_url = document.getElementById('blogImage').value;
            const content = document.getElementById('blogContent').value;

            window.HTLAIEngine.publishBlog({ title, category, cover_image: image_url, content });
            createBlogForm.reset();
            alert('Bài viết đã được xuất bản ĐĂNG NGAY thành công!');
            initDashboard();
        });
    }

    // FORM THEM PROJECT THU CONG
    const createProjectForm = document.getElementById('createProjectForm');
    if (createProjectForm) {
        createProjectForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = document.getElementById('projTitle').value;
            const category = document.getElementById('projCategory').value;
            const metric_value = document.getElementById('projMetricValue').value;
            const metric_label = document.getElementById('projMetricLabel').value;
            const image_url = document.getElementById('projImage').value;
            const description = document.getElementById('projDesc').value;

            window.HTLAIEngine.publishProject({ title, category, metric_value, metric_label, image_url, description });
            createProjectForm.reset();
            alert('Dự án Portfolio đã được đăng thành công!');
            initDashboard();
        });
    }

    // QUICK AI PUBLISH TEST
    const btnQuickAIPublish = document.getElementById('btnQuickAIPublish');
    if (btnQuickAIPublish) {
        btnQuickAIPublish.addEventListener('click', () => {
            btnQuickAIPublish.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> AI Đang Biên Tập & Đăng...';
            setTimeout(() => {
                const sampleTitles = [
                    "Xây Dựng Hệ Thống Lead Funnel Tự Động Với AI Agent 2026",
                    "Bí Quyết Ứng Dụng Midjourney Sáng Tạo Ấn Phẩm Marketing Độc Quyền",
                    "Cách Tối Ưu Chi Phí Quảng Cáo Facebook Bằng Phân Tích Data Dữ Liệu"
                ];
                const randomTitle = sampleTitles[Math.floor(Math.random() * sampleTitles.length)];

                window.HTLAIEngine.publishBlog({
                    title: randomTitle,
                    category: 'AI Automation',
                    content: `<p>Đây là bài viết được AI Agent sáng tạo và tự động ĐĂNG NGAY tức thì lên CSDL website mà không cần qua thao tác admin thủ công.</p><h3>Lợi ích cốt lõi</h3><p>- Tiết kiệm 95% thời gian đăng bài.<br>- Đồng bộ nội dung đa kênh tự động.</p>`,
                    cover_image: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80'
                });

                btnQuickAIPublish.innerHTML = '<i class="fa-solid fa-check"></i> Đã Đăng Thành Công 1 Bài Viết Mới!';
                initDashboard();

                setTimeout(() => {
                    btnQuickAIPublish.innerHTML = '<i class="fa-solid fa-robot"></i> Tạo & Đăng Bài SEO Ngay Bằng AI';
                }, 3000);
            }, 800);
        });
    }

    // AI API TEST FORM
    const aiApiTestForm = document.getElementById('aiApiTestForm');
    if (aiApiTestForm) {
        aiApiTestForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const prompt = document.getElementById('aiTestPrompt').value;
            window.HTLAIEngine.publishBlog({
                title: prompt,
                category: 'AI Generated',
                content: `<p>Nội dung tự động hóa dựa trên câu lệnh: <strong>${escapeHtml(prompt)}</strong>.</p>`
            });
            alert(`Đã đăng bài viết từ Prompt "${prompt}" thành công!`);
            initDashboard();
        });
    }

    // UTILITY FUNCTIONS
    window.updateLeadStatus = function(id, status) {
        window.HTLDatabase.updateContactStatus(id, status);
        initDashboard();
    };

    window.deleteLead = function(id) {
        if (confirm('Bạn có chắc muốn xóa lead này?')) {
            window.HTLDatabase.deleteContact(id);
            initDashboard();
        }
    };

    window.deleteBlogArticle = function(id) {
        if (confirm('Bạn có chắc muốn xóa bài viết này?')) {
            window.HTLDatabase.deleteBlog(id);
            initDashboard();
        }
    };

    window.deleteProjectCard = function(id) {
        if (confirm('Bạn có chắc muốn xóa dự án này?')) {
            window.HTLDatabase.deleteProject(id);
            initDashboard();
        }
    };

    function formatStatus(status) {
        if (status === 'new') return 'Mới';
        if (status === 'processing') return 'Đang xử lý';
        if (status === 'completed') return 'Đã chốt';
        return status;
    }

    function escapeHtml(text) {
        if (!text) return '';
        return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }
});
