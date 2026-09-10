/**
 * Hoàng Thế Long Website - Supabase REST API Data Abstraction Layer
 * Đã kết nối với Database Supabase thực tế.
 */

const SUPABASE_CONFIG = {
    url: 'https://gvigrkrlymrllfatuinw.supabase.co',
    anonKey: 'sb_publishable_VY5--I1yacEERQKzaMALeg_mNuo31Cq',
    get headers() {
        const token = localStorage.getItem('htl_access_token');
        return {
            'apikey': this.anonKey,
            'Authorization': `Bearer ${this.anonKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        };
    }
};

class HTLDatabaseManager {
    constructor() {
        console.log('✅ HTL Database Initialized (Supabase Connected)');
    }

    
    // --- AUTHENTICATION ---
    
    loginWithGoogle() {
        const redirectUrl = encodeURIComponent(window.location.origin + window.location.pathname);
        window.location.href = "https://gvigrkrlymrllfatuinw.supabase.co/auth/v1/authorize?provider=google&redirect_to=" + redirectUrl;
    }

    checkOAuthCallback() {
        const hash = window.location.hash;
        if (hash && hash.includes('access_token=')) {
            const params = new URLSearchParams(hash.substring(1));
            const accessToken = params.get('access_token');
            if (accessToken) {
                localStorage.setItem('htl_access_token', accessToken);
                localStorage.setItem('htl_admin_email', 'Google_OAuth_User');
                window.location.hash = ''; // Xóa hash đi cho gọn
            }
        }
    }
async login(email, password) {
        try {
            const res = await fetch("https://gvigrkrlymrllfatuinw.supabase.co/auth/v1/token?grant_type=password", {
                method: 'POST',
                headers: { 'apikey': SUPABASE_CONFIG.anonKey, 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (data.access_token) {
                localStorage.setItem('htl_access_token', data.access_token); localStorage.setItem('htl_admin_email', email);
                return { success: true };
            }
            return { success: false, message: data.error_description || 'Sai thông tin đăng nhập' };
        } catch (e) {
            console.error('Lỗi đăng nhập:', e);
            return { success: false, message: 'Lỗi máy chủ' };
        }
    }

    logout() {
        localStorage.removeItem('htl_access_token'); localStorage.removeItem('htl_admin_email');
        window.location.reload();
    }

    isAuthenticated() {
        return !!localStorage.getItem('htl_access_token');
    }
// --- LEADS / CONTACTS ---
    async getContacts() {
        try {
            const res = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/contacts?select=*&order=created_at.desc`, { headers: SUPABASE_CONFIG.headers });
            if (!res.ok) throw new Error('Network response was not ok');
            return await res.json();
        } catch (e) {
            console.error('Lỗi lấy danh sách liên hệ:', e);
            return [];
        }
    }

    async saveContact(contactData) {
        const payload = {
            name: contactData.name || 'Khách hàng',
            email: contactData.email || '',
            subject: contactData.subject || 'Đăng ký tư vấn',
            message: contactData.message || '',
            status: 'new'
        };
        try {
            const res = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/contacts`, {
                method: 'POST',
                headers: SUPABASE_CONFIG.headers,
                body: JSON.stringify(payload)
            });
            return await res.json();
        } catch (e) {
            console.error('Lỗi lưu liên hệ:', e);
            return null;
        }
    }

    async updateContactStatus(id, status) {
        try {
            const res = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/contacts?id=eq.${id}`, {
                method: 'PATCH',
                headers: SUPABASE_CONFIG.headers,
                body: JSON.stringify({ status })
            });
            return await res.json();
        } catch (e) {
            console.error('Lỗi cập nhật trạng thái:', e);
            return null;
        }
    }

    async deleteContact(id) {
        try {
            await fetch(`${SUPABASE_CONFIG.url}/rest/v1/contacts?id=eq.${id}`, {
                method: 'DELETE',
                headers: SUPABASE_CONFIG.headers
            });
        } catch (e) {
            console.error('Lỗi xóa liên hệ:', e);
        }
    }

    // --- BLOGS ---
    async getBlogBySlug(slug) {
        try {
            const res = await fetch("https://gvigrkrlymrllfatuinw.supabase.co/rest/v1/blogs?slug=eq." + slug + "&select=*&limit=1", { headers: SUPABASE_CONFIG.headers });
            const data = await res.json();
            return data.length > 0 ? data[0] : null;
        } catch (e) { console.error('Lỗi lấy bài viết:', e); return null; }
    }

    async getBlogs() {
        try {
            const res = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/blogs?select=*&order=created_at.desc`, { headers: SUPABASE_CONFIG.headers });
            return await res.json();
        } catch (e) {
            console.error('Lỗi lấy bài viết:', e);
            return [];
        }
    }

    async saveBlog(blogData) {
        const slug = blogData.slug || this.slugify(blogData.title || 'bai-viet-moi');
        const payload = {
            title: blogData.title,
            slug: slug,
            category: blogData.category || 'AI & Marketing',
            excerpt: blogData.excerpt || (blogData.content ? blogData.content.replace(/<[^>]*>?/gm, '').substring(0, 120) + '...' : ''),
            content: blogData.content || '',
            image_url: blogData.image_url || 'https://images.unsplash.com/photo-1677442136019-21780efad99a',
            published_at: blogData.published_at || new Date().toISOString().split('T')[0],
            status: blogData.status || 'published',
            meta_title: blogData.meta_title || '',
            meta_description: blogData.meta_description || '',
            views: blogData.views || 1
        };

        try {
            const res = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/blogs`, {
                method: 'POST',
                headers: SUPABASE_CONFIG.headers,
                body: JSON.stringify(payload)
            });
            return await res.json();
        } catch (e) {
            console.error('Lỗi lưu bài viết:', e);
            return null;
        }
    }

    async deleteBlog(id) {
        try {
            await fetch(`${SUPABASE_CONFIG.url}/rest/v1/blogs?id=eq.${id}`, {
                method: 'DELETE',
                headers: SUPABASE_CONFIG.headers
            });
        } catch (e) {
            console.error('Lỗi xóa bài viết:', e);
        }
    }

    // --- PORTFOLIO PROJECTS ---
    async getProjects() {
        try {
            const res = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/projects?select=*&order=created_at.desc`, { headers: SUPABASE_CONFIG.headers });
            return await res.json();
        } catch (e) {
            console.error('Lỗi lấy dự án:', e);
            return [];
        }
    }

    async saveProject(projectData) {
        const payload = {
            title: projectData.title,
            category: projectData.category || 'website',
            category_name: projectData.category_name || 'Website',
            image_url: projectData.image_url || 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8',
            description: projectData.description || '',
            metric_value: projectData.metric_value || '+100%',
            metric_label: projectData.metric_label || 'Tăng trưởng',
            slug: projectData.slug || this.slugify(projectData.title || 'du-an-moi'),
            meta_title: projectData.meta_title || '',
            meta_description: projectData.meta_description || ''
        };

        try {
            const res = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/projects`, {
                method: 'POST',
                headers: SUPABASE_CONFIG.headers,
                body: JSON.stringify(payload)
            });
            return await res.json();
        } catch (e) {
            console.error('Lỗi lưu dự án:', e);
            return null;
        }
    }

    async deleteProject(id) {
        try {
            await fetch(`${SUPABASE_CONFIG.url}/rest/v1/projects?id=eq.${id}`, {
                method: 'DELETE',
                headers: SUPABASE_CONFIG.headers
            });
        } catch (e) {
            console.error('Lỗi xóa dự án:', e);
        }
    }

    
    // --- TEAM MEMBERS ---
    async getTeamMembers() {
        try {
            const res = await fetch("https://gvigrkrlymrllfatuinw.supabase.co/rest/v1/team_members?select=*&order=created_at.desc", { headers: this.headers });
            if(!res.ok) return [];
            return await res.json();
        } catch(e) { return []; }
    }

    // --- AUDIT LOGS ---
    async getAuditLogs() {
        try {
            const res = await fetch("https://gvigrkrlymrllfatuinw.supabase.co/rest/v1/audit_logs?select=*&order=created_at.desc&limit=50", { headers: this.headers });
            if(!res.ok) return [];
            return await res.json();
        } catch(e) { return []; }
    }

    async logAction(action, details) {
        try {
            // We assume email is stored in localStorage or decoded from JWT. For simplicity:
            const email = localStorage.getItem('htl_admin_email') || 'Admin';
            await fetch("https://gvigrkrlymrllfatuinw.supabase.co/rest/v1/audit_logs", {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify({ action, details, user_email: email })
            });
        } catch(e) {}
    }
// --- HELPER UTILS ---
    slugify(text) {
        return text.toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd').replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
    }

    async exportContactsCSV() {
        const contacts = await this.getContacts();
        if (!contacts || contacts.length === 0) {
            alert('Chưa có dữ liệu liên hệ để xuất file!');
            return;
        }

        let csvContent = "\uFEFFHọ và tên,Email,Chủ đề,Nội dung,Trạng thái,Thời gian\n";
        contacts.forEach(c => {
            const row = [
                `"${(c.name||'').replace(/"/g, '""')}"`,
                `"${(c.email||'').replace(/"/g, '""')}"`,
                `"${(c.subject||'').replace(/"/g, '""')}"`,
                `"${(c.message||'').replace(/"/g, '""')}"`,
                `"${c.status}"`,
                `"${c.created_at}"`
            ].join(",");
            csvContent += row + "\n";
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `danh_sach_leads_htl_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

window.HTLDatabase = new HTLDatabaseManager();








