/**
 * Hoàng Thế Long Website - AI Content Publisher Engine
 * SDK dành cho AI Agents (Antigravity, Claude, n8n, API Call) xuất bản bài viết và dự án ĐĂNG NGAY.
 */

class HTLAIEngine {
    constructor() {
        this.apiKey = 'HTL_SECRET_AI_KEY_2026';
    }

    /**
     * AI Agent Đăng bài blog trực tiếp lên website
     * @param {Object} blogPayload 
     * { title, category, excerpt, content, cover_image, author }
     */
    publishBlog(blogPayload) {
        if (!blogPayload || !blogPayload.title || !blogPayload.content) {
            console.error('[AI Engine Error]: Vui lòng cung cấp tiêu đề và nội dung bài viết.');
            return { success: false, message: 'Thiếu thông tin tiêu đề hoặc nội dung.' };
        }

        const newBlog = window.HTLDatabase.saveBlog({
            title: blogPayload.title,
            category: blogPayload.category || 'AI & Automation',
            excerpt: blogPayload.excerpt || (blogPayload.content.replace(/<[^>]*>?/gm, '').substring(0, 140) + '...'),
            content: blogPayload.content,
            image_url: blogPayload.cover_image || 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80',
            status: 'published', // Xuất bản ngay tức thì
            published_at: new Date().toISOString().split('T')[0],
            views: Math.floor(Math.random() * 50) + 10
        });

        console.log('[AI Engine Success]: Bài viết đã được đăng thành công!', newBlog);
        return {
            success: true,
            message: 'Đã xuất bản bài viết thành công!',
            data: newBlog
        };
    }

    /**
     * AI Agent Đăng dự án Portfolio mới lên website
     * @param {Object} projectPayload 
     * { title, category, description, image_url, metric_value, metric_label }
     */
    publishProject(projectPayload) {
        if (!projectPayload || !projectPayload.title) {
            return { success: false, message: 'Thiếu tên dự án.' };
        }

        const newProject = window.HTLDatabase.saveProject({
            title: projectPayload.title,
            category: projectPayload.category || 'website',
            category_name: projectPayload.category_name || 'Website',
            description: projectPayload.description || '',
            image_url: projectPayload.image_url || 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
            metric_value: projectPayload.metric_value || '+100%',
            metric_label: projectPayload.metric_label || 'Tăng trưởng'
        });

        console.log('[AI Engine Success]: Dự án đã được đăng thành công!', newProject);
        return {
            success: true,
            message: 'Đã xuất bản dự án thành công!',
            data: newProject
        };
    }

    /**
     * Lấy báo cáo thống kê nhanh cho AI Agent
     */
    getDashboardStats() {
        const contacts = window.HTLDatabase.getContacts();
        const blogs = window.HTLDatabase.getBlogs();
        const projects = window.HTLDatabase.getProjects();

        return {
            total_leads: contacts.length,
            new_leads: contacts.filter(c => c.status === 'new').length,
            total_blogs: blogs.length,
            total_projects: projects.length,
            latest_lead: contacts[0] || null
        };
    }
}

// Global instance cho AI Agent truy cập
window.HTLAIEngine = new HTLAIEngine();
