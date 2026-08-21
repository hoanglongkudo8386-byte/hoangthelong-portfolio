/**
 * Hoàng Thế Long Website - Supabase & Data Abstraction Layer
 * Hỗ trợ kết nối CSDL Supabase & Tự động sao lưu LocalStorage nếu chưa điền API Key.
 */

const SUPABASE_CONFIG = {
    // Nhập thông tin Supabase của bạn tại đây (nếu có):
    url: 'https://gvigrkrlymrllfatuinw.supabase.co', // Ví dụ: 'https://xyzcompany.supabase.co'
    anonKey: 'sb_publishable_VY5--I1yacEERQKzaMALeg_mNuo31Cq', // Key public anon từ Supabase Dashboard
    apiKey: 'HTL_SECRET_AI_KEY_2026' // Key xác thực riêng cho AI Engine
};

// Dữ liệu mẫu ban đầu (Seed Data)
const INITIAL_BLOGS = [
    {
        id: 'blog-1',
        title: '3 Công Thức Viết Content "Thôi Miên" Khách Hàng',
        slug: 'cong-thuc-viet-content',
        category: 'Content',
        excerpt: 'Đừng viết theo bản năng. Áp dụng ngay 3 công thức này (AIDA, PAS, BAB) để bài viết của bạn chạm đúng "chỗ ngứa"...',
        content: `<h3>1. Công Thức AIDA (Attention - Interest - Desire - Action)</h3><p>AIDA là công thức kinh điển trong Marketing giúp dẫn dắt tâm lý khách hàng qua 4 tầng cảm xúc từ chú ý đến hành động mua hàng.</p><h3>2. Công Thức PAS (Problem - Agitate - Solve)</h3><p>Đánh trúng nỗi đau (Problem), xoáy sâu vào hậu quả (Agitate) và đưa ra giải pháp hoàn hảo (Solve).</p>`,
        image_url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80',
        published_at: '2026-08-01',
        status: 'published',
        views: 342
    },
    {
        id: 'blog-2',
        title: '5 Mẹo Tối Ưu Facebook Ads Giảm 50% Chi Phí',
        slug: 'facebook-ads-tips',
        category: 'Facebook Ads',
        excerpt: 'Những chiến thuật đã được kiểm chứng giúp bạn chạy quảng cáo Facebook hiệu quả hơn...',
        content: `<p>Trong bối cảnh CPM tăng cao năm 2026, tối ưu hóa tệp đối tượng và ứng dụng AI targeting là chìa khóa để giảm CPA.</p>`,
        image_url: 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?auto=format&fit=crop&w=800&q=80',
        published_at: '2026-07-15',
        status: 'published',
        views: 520
    },
    {
        id: 'blog-3',
        title: 'AI Trong Marketing: Xu Hướng Không Thể Bỏ Qua 2026',
        slug: 'ai-marketing',
        category: 'AI',
        excerpt: 'Khám phá cách AI đang thay đổi ngành marketing và cách bạn có thể tận dụng...',
        content: `<p>Sử dụng AI Agent để tự động hóa quy trình sáng tạo content, chạy ads và phân tích dữ liệu khách hàng.</p>`,
        image_url: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80',
        published_at: '2026-07-01',
        status: 'published',
        views: 890
    }
];

const INITIAL_PROJECTS = [
    {
        id: 'proj-1',
        title: 'Trường Học 247 - Quản Lý Giáo Dục',
        category: 'website',
        category_name: 'Website',
        image_url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
        description: 'Xây dựng giao diện web quản lý trung tâm đào tạo chuẩn UX/UI và tích hợp tự động thu thập Lead.',
        metric_value: '+250%',
        metric_label: 'Tỷ lệ chuyển đổi Lead'
    },
    {
        id: 'proj-2',
        title: 'VELA - Nhận Diện Nến Thơm',
        category: 'branding',
        category_name: 'Branding',
        image_url: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=800&q=80',
        description: 'Bộ nhận diện thương hiệu cao cấp dành cho dòng sản phẩm nến thơm handmade.',
        metric_value: '100%',
        metric_label: 'Đồng bộ Brand Kit'
    },
    {
        id: 'proj-3',
        title: 'Content Automation Bằng AI',
        category: 'content',
        category_name: 'Content',
        image_url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80',
        description: 'Thiết lập quy trình sản xuất 30+ bài viết chất lượng cao mỗi tuần nhờ AI Prompt Engineering.',
        metric_value: '3x',
        metric_label: 'Tốc độ sản xuất'
    },
    {
        id: 'proj-4',
        title: 'Facebook Ads Tối Ưu Data',
        category: 'ads',
        category_name: 'Quảng cáo',
        image_url: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=800&q=80',
        description: 'Chiến dịch Facebook Ads sử dụng A/B testing liên tục giúp tối ưu chi phí thu nạp khách hàng.',
        metric_value: '-45%',
        metric_label: 'Chi phí CPA'
    }
];

class HTLDatabaseManager {
    constructor() {
        this.initStorage();
    }

    initStorage() {
        if (!localStorage.getItem('htl_contacts')) {
            localStorage.setItem('htl_contacts', JSON.stringify([]));
        }
        if (!localStorage.getItem('htl_blogs')) {
            localStorage.setItem('htl_blogs', JSON.stringify(INITIAL_BLOGS));
        }
        if (!localStorage.getItem('htl_projects')) {
            localStorage.setItem('htl_projects', JSON.stringify(INITIAL_PROJECTS));
        }
    }

    // --- LEADS / CONTACTS ---
    getContacts() {
        try {
            return JSON.parse(localStorage.getItem('htl_contacts')) || [];
        } catch (e) {
            return [];
        }
    }

    saveContact(contactData) {
        const contacts = this.getContacts();
        const newContact = {
            id: 'lead-' + Date.now(),
            name: contactData.name || 'Khách hàng',
            email: contactData.email || '',
            subject: contactData.subject || 'Đăng ký tư vấn',
            message: contactData.message || '',
            status: 'new', // new | processing | completed
            created_at: new Date().toISOString()
        };
        contacts.unshift(newContact);
        localStorage.setItem('htl_contacts', JSON.stringify(contacts));
        return newContact;
    }

    updateContactStatus(id, status) {
        const contacts = this.getContacts();
        const index = contacts.findIndex(c => c.id === id);
        if (index !== -1) {
            contacts[index].status = status;
            localStorage.setItem('htl_contacts', JSON.stringify(contacts));
            return contacts[index];
        }
        return null;
    }

    deleteContact(id) {
        let contacts = this.getContacts();
        contacts = contacts.filter(c => c.id !== id);
        localStorage.setItem('htl_contacts', JSON.stringify(contacts));
    }

    // --- BLOGS ---
    getBlogs() {
        try {
            return JSON.parse(localStorage.getItem('htl_blogs')) || [];
        } catch (e) {
            return INITIAL_BLOGS;
        }
    }

    saveBlog(blogData) {
        const blogs = this.getBlogs();
        const slug = blogData.slug || this.slugify(blogData.title || 'bai-viet-moi');
        
        const existingIndex = blogs.findIndex(b => b.id === blogData.id || b.slug === slug);
        const newBlog = {
            id: blogData.id || 'blog-' + Date.now(),
            title: blogData.title,
            slug: slug,
            category: blogData.category || 'AI & Marketing',
            excerpt: blogData.excerpt || (blogData.content ? blogData.content.replace(/<[^>]*>?/gm, '').substring(0, 120) + '...' : 'Bài viết mới...'),
            content: blogData.content || '',
            image_url: blogData.image_url || 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80',
            published_at: blogData.published_at || new Date().toISOString().split('T')[0],
            status: blogData.status || 'published', // Đăng ngay theo chế độ người dùng duyệt
            views: blogData.views || 1
        };

        if (existingIndex !== -1) {
            blogs[existingIndex] = { ...blogs[existingIndex], ...newBlog };
        } else {
            blogs.unshift(newBlog);
        }

        localStorage.setItem('htl_blogs', JSON.stringify(blogs));
        return newBlog;
    }

    deleteBlog(id) {
        let blogs = this.getBlogs();
        blogs = blogs.filter(b => b.id !== id);
        localStorage.setItem('htl_blogs', JSON.stringify(blogs));
    }

    // --- PORTFOLIO PROJECTS ---
    getProjects() {
        try {
            return JSON.parse(localStorage.getItem('htl_projects')) || [];
        } catch (e) {
            return INITIAL_PROJECTS;
        }
    }

    saveProject(projectData) {
        const projects = this.getProjects();
        const newProject = {
            id: projectData.id || 'proj-' + Date.now(),
            title: projectData.title,
            category: projectData.category || 'website',
            category_name: projectData.category_name || (projectData.category ? projectData.category.toUpperCase() : 'General'),
            image_url: projectData.image_url || 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
            description: projectData.description || '',
            metric_value: projectData.metric_value || '+100%',
            metric_label: projectData.metric_label || 'Hiệu quả đạt được',
            created_at: new Date().toISOString()
        };

        projects.unshift(newProject);
        localStorage.setItem('htl_projects', JSON.stringify(projects));
        return newProject;
    }

    deleteProject(id) {
        let projects = this.getProjects();
        projects = projects.filter(p => p.id !== id);
        localStorage.setItem('htl_projects', JSON.stringify(projects));
    }

    // --- HELPER UTILS ---
    slugify(text) {
        return text
            .toString()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[đĐ]/g, 'd')
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-')
            .replace(/^-+/, '')
            .replace(/-+$/, '');
    }

    exportContactsCSV() {
        const contacts = this.getContacts();
        if (contacts.length === 0) {
            alert('Chưa có dữ liệu liên hệ để xuất file!');
            return;
        }

        let csvContent = "\uFEFFHọ và tên,Email,Chủ đề,Nội dung,Trạng thái,Thời gian\n";
        contacts.forEach(c => {
            const row = [
                `"${c.name.replace(/"/g, '""')}"`,
                `"${c.email.replace(/"/g, '""')}"`,
                `"${c.subject.replace(/"/g, '""')}"`,
                `"${c.message.replace(/"/g, '""')}"`,
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

// Khởi tạo instance toàn cục
window.HTLDatabase = new HTLDatabaseManager();
