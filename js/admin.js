/**
 * Hoàng Thế Long Admin Dashboard Controller Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. DANG NHAP BAO MAT
    const loginScreen = document.getElementById('loginScreen');
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');
    // Xử lý callback từ Google OAuth
    if (window.HTLDatabase) window.HTLDatabase.checkOAuthCallback();

    const btnGoogleLogin = document.getElementById('btnGoogleLogin');
    if (btnGoogleLogin) {
        btnGoogleLogin.addEventListener('click', () => {
            window.HTLDatabase.loginWithGoogle();
        });
    }


    function showDashboard() {
        if (loginScreen) loginScreen.style.display = 'none';
        initDashboard();
    }

    // Nếu đã đăng nhập rồi thì vào thẳng Dashboard
    if (window.HTLDatabase && window.HTLDatabase.isAuthenticated()) {
        showDashboard();
    } else if (sessionStorage.getItem('htl_admin_local') === 'true') {
        showDashboard();
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {

            e.preventDefault();
            const email = document.getElementById('adminEmail') ? document.getElementById('adminEmail').value.trim() : '';
            const pwd = document.getElementById('adminPassword') ? document.getElementById('adminPassword').value : '';
            const btn = loginForm.querySelector('button[type="submit"]');
            const originalText = btn ? btn.innerHTML : '';
            if (btn) btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang xử lý...';
            if (loginError) loginError.style.display = 'none';

            // Thử đăng nhập Supabase trước
            let loggedIn = false;
            try {
                const res = await window.HTLDatabase.login(email, pwd);
                if (res.success) loggedIn = true;
            } catch(e) {}

            // Mật khẩu dự phòng cục bộ (nếu Supabase chưa cấu hình xong)
            const LOCAL_PASS = 'HoangLong@2026';
            if (!loggedIn && pwd === LOCAL_PASS) {
                sessionStorage.setItem('htl_admin_local', 'true');
                loggedIn = true;
            }

            if (loggedIn) {
                showDashboard();
            } else {
                if (loginError) { loginError.textContent = 'Sai email hoặc mật khẩu!'; loginError.style.display = 'block'; }
                if (btn) btn.innerHTML = originalText;
            }
        });
    }

    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => { window.HTLDatabase.logout(); });
    }
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
        renderProjects(); renderTeam(); renderAudit();
    }

    // RENDER THONG KE
    async function renderStats() {
        const stats = window.HTLAIEngine ? await window.HTLAIEngine.getDashboardStats() : { total_leads: 0, new_leads: 0, total_blogs: 0, total_projects: 0 };
        document.getElementById('statTotalLeads').textContent = stats.total_leads;
        document.getElementById('statNewLeads').textContent = stats.new_leads;
        document.getElementById('statTotalBlogs').textContent = stats.total_blogs;
        document.getElementById('statTotalProjects').textContent = stats.total_projects;
    }

    // RENDER LEADS
    async function renderLeads() {
        const contacts = await window.HTLDatabase.getContacts();
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
    async function renderBlogs() {
        const blogs = await window.HTLDatabase.getBlogs();
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

    
    async function renderTeam() {
        const team = await window.HTLDatabase.getTeamMembers();
        const table = document.getElementById('teamTable');
        if(!table) return;
        table.innerHTML = team.length === 0 ? '<tr><td colspan="5" style="text-align:center;">Chưa có nhân viên nào. Hãy thêm trong Supabase!</td></tr>' : team.map(u => `<tr><td><strong>${escapeHtml(u.name)}</strong></td><td>${escapeHtml(u.email)}</td><td><span class="status-badge badge-new">${escapeHtml(u.role)}</span></td><td><span class="status-badge badge-completed">${u.status}</span></td><td><button class="btn-admin btn-admin-danger" onclick="alert('Tính năng khóa đang phát triển')">Khóa</button></td></tr>`).join('');
    }

    async function renderAudit() {
        const logs = await window.HTLDatabase.getAuditLogs();
        const table = document.getElementById('auditTable');
        if(!table) return;
        table.innerHTML = logs.length === 0 ? '<tr><td colspan="4" style="text-align:center;">Chưa có hoạt động nào</td></tr>' : logs.map(l => `<tr><td>${new Date(l.created_at).toLocaleString('vi-VN')}</td><td><strong>${escapeHtml(l.user_email)}</strong></td><td><span class="status-badge badge-processing">${escapeHtml(l.action)}</span></td><td>${escapeHtml(l.details)}</td></tr>`).join('');
    }
// RENDER PROJECTS
    async function renderProjects() {
        const projects = await window.HTLDatabase.getProjects();
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

    
    // INITIALIZE QUILL EDITOR
    let quillBlog;
    if (document.getElementById('blogEditor')) {
        quillBlog = new Quill('#blogEditor', {
            theme: 'snow',
            modules: { toolbar: [ [{ header: [1,2,3,false] }], ['bold','italic','underline','strike'], ['blockquote','code-block'], [{list:'ordered'},{list:'bullet'}], [{align:[]}], ['link','image','video'], ['clean'] ] }
        });
    }

    
    // UTILS SLUG
    function generateSlug(text) { return text.toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd').replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, ''); }
    if (document.getElementById('blogTitle') && document.getElementById('blogSlug')) { document.getElementById('blogTitle').addEventListener('input', function(e) { document.getElementById('blogSlug').value = generateSlug(e.target.value); if (!document.getElementById('blogMetaTitle').value) { document.getElementById('blogMetaTitle').value = e.target.value; } }); }
    if (document.getElementById('projTitle') && document.getElementById('projSlug')) { document.getElementById('projTitle').addEventListener('input', function(e) { document.getElementById('projSlug').value = generateSlug(e.target.value); if (!document.getElementById('projMetaTitle').value) { document.getElementById('projMetaTitle').value = e.target.value; } }); }
// FORM THEM BLOG THU CONG
    const createBlogForm = document.getElementById('createBlogForm');
    if (createBlogForm) {
        createBlogForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = document.getElementById('blogTitle').value;
            const category = document.getElementById('blogCategory').value;
            const image_url = document.getElementById('blogImage').value;
            const content = quillBlog ? quillBlog.root.innerHTML : document.getElementById('blogContent').value;

            const slug = document.getElementById('blogSlug') ? document.getElementById('blogSlug').value : '';
            const meta_title = document.getElementById('blogMetaTitle') ? document.getElementById('blogMetaTitle').value : '';
            const meta_description = document.getElementById('blogMetaDesc') ? document.getElementById('blogMetaDesc').value : '';

            await window.HTLAIEngine.publishBlog({ title, category, cover_image: image_url, content, slug, meta_title, meta_description });
            createBlogForm.reset();
            if (quillBlog) quillBlog.setContents([]);
            alert('Bài viết đã được xuất bản thành công!'); window.HTLDatabase.logAction('Đăng Bài viết', 'Tiêu đề: ' + title);
            initDashboard();
        });
    }

    // FORM THEM PROJECT THU CONG
    const createProjectForm = document.getElementById('createProjectForm');
    if (createProjectForm) {
        createProjectForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = document.getElementById('projTitle').value;
            const category = document.getElementById('projCategory').value;
            const metric_value = document.getElementById('projMetricValue').value;
            const metric_label = document.getElementById('projMetricLabel').value;
            const image_url = document.getElementById('projImage').value;
            const description = document.getElementById('projDesc').value;

            const slug = document.getElementById('projSlug') ? document.getElementById('projSlug').value : '';
            const meta_title = document.getElementById('projMetaTitle') ? document.getElementById('projMetaTitle').value : '';
            const meta_description = document.getElementById('projMetaDesc') ? document.getElementById('projMetaDesc').value : '';

            await window.HTLAIEngine.publishProject({ title, category, metric_value, metric_label, image_url, description, slug, meta_title, meta_description });
            createProjectForm.reset();
            alert('Dự án Portfolio đã được đăng thành công!'); window.HTLDatabase.logAction('Đăng Dự án', 'Tiêu đề: ' + title);
            initDashboard();
        });
    }

    // QUICK AI PUBLISH TEST
    const btnQuickAIPublish = document.getElementById('btnQuickAIPublish');
    if (btnQuickAIPublish) {
        btnQuickAIPublish.addEventListener('click', async () => {
            btnQuickAIPublish.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> AI Đang Biên Tập & Đăng...';
            
            const sampleTitles = [
                "Xây Dựng Hệ Thống Lead Funnel Tự Động Với AI Agent 2026",
                "Bí Quyết Ứng Dụng Midjourney Sáng Tạo Ấn Phẩm Marketing Độc Quyền",
                "Cách Tối Ưu Chi Phí Quảng Cáo Facebook Bằng Phân Tích Data Dữ Liệu"
            ];
            const randomTitle = sampleTitles[Math.floor(Math.random() * sampleTitles.length)];

            await window.HTLAIEngine.publishBlog({
                title: randomTitle,
                category: 'AI Automation',
                content: `<p>Đây là bài viết được AI Agent sáng tạo và tự động ĐĂNG NGAY tức thì lên CSDL website mà không cần qua thao tác admin thủ công.</p><h3>Lợi ích cốt lõi</h3><p>- Tiết kiệm 95% thời gian đăng bài.<br>- Đồng bộ nội dung đa kênh tự động.</p>`,
                cover_image: 'https://images.unsplash.com/photo-1677442136019-21780efad99a'
            });

            btnQuickAIPublish.innerHTML = '<i class="fa-solid fa-check"></i> Đã Đăng Thành Công 1 Bài Viết Mới!';
            initDashboard();

            setTimeout(() => {
                btnQuickAIPublish.innerHTML = '<i class="fa-solid fa-robot"></i> Tạo & Đăng Bài SEO Ngay Bằng AI';
            }, 3000);
        });
    }

    // AI API TEST FORM
    const aiApiTestForm = document.getElementById('aiApiTestForm');
    if (aiApiTestForm) {
        aiApiTestForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const prompt = document.getElementById('aiTestPrompt').value;
            await window.HTLAIEngine.publishBlog({
                title: prompt,
                category: 'AI Generated',
                content: `<p>Nội dung tự động hóa dựa trên câu lệnh: <strong>${escapeHtml(prompt)}</strong>.</p>`
            });
            alert(`Đã đăng bài viết từ Prompt "${prompt}" thành công!`);
            initDashboard();
        });
    }

    // UTILITY FUNCTIONS
    window.updateLeadStatus = async function(id, status) {
        await window.HTLDatabase.updateContactStatus(id, status); window.HTLDatabase.logAction('Cập nhật Liên hệ', 'Chuyển trạng thái: ' + status);
        initDashboard();
    };

    window.deleteLead = async function(id) {
        if (confirm('Bạn có chắc muốn xóa lead này?')) {
            await window.HTLDatabase.deleteContact(id); window.HTLDatabase.logAction('Xóa Liên hệ', 'ID: ' + id);
            initDashboard();
        }
    };

    window.deleteBlogArticle = async function(id) {
        if (confirm('Bạn có chắc muốn xóa bài viết này?')) {
            await window.HTLDatabase.deleteBlog(id); window.HTLDatabase.logAction('Xóa Bài viết', 'ID: ' + id);
            initDashboard();
        }
    };

    window.deleteProjectCard = async function(id) {
        if (confirm('Bạn có chắc muốn xóa dự án này?')) {
            await window.HTLDatabase.deleteProject(id); window.HTLDatabase.logAction('Xóa Dự án', 'ID: ' + id);
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






