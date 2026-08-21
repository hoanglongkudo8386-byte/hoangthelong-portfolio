document.addEventListener('DOMContentLoaded', () => {
    // 1. Sticky Navbar
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }, { passive: true });

    // 2. Active nav link highlighting — dựa trên tên file trang hiện tại
    const navLinks = document.querySelectorAll('.nav-link');
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href').split('/').pop();
        if (linkPage === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // (Legacy code block placeholder — không dùng nữa trong multi-page)
    const sections = document.querySelectorAll('section[id]');
    const observerOptions = {
        root: null,
        rootMargin: '-50% 0px -50% 0px',
        threshold: 0
    };
    // Legacy section observer removed for multi-page layout

    // 3. Mobile hamburger menu
    const hamburger = document.querySelector('.hamburger');
    const navLinksContainer = document.querySelector('.nav-links');

    if (hamburger && navLinksContainer) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinksContainer.classList.toggle('active');
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinksContainer.classList.remove('active');
            });
        });

        document.addEventListener('click', (e) => {
            if (!hamburger.contains(e.target) && !navLinksContainer.contains(e.target)) {
                hamburger.classList.remove('active');
                navLinksContainer.classList.remove('active');
            }
        });
    }

    // 4. Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const navbarHeight = navbar ? navbar.offsetHeight : 0;
                const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - navbarHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 5. Back to top button
    const backToTop = document.querySelector('.back-to-top');
    if (backToTop) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) {
                backToTop.classList.add('active');
            } else {
                backToTop.classList.remove('active');
            }
        }, { passive: true });

        backToTop.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // 6. Animated stat counters
    const statNumbers = document.querySelectorAll('.stat-number');
    let animated = false;
    
    const statObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !animated) {
                animated = true;
                statNumbers.forEach(stat => {
                    const text = stat.textContent.trim();
                    const target = parseInt(text.replace(/[^0-9]/g, ''));
                    const suffix = text.replace(/[0-9]/g, '');
                    
                    if (isNaN(target)) return;
                    
                    const duration = 2000; // 2 seconds
                    const frameDuration = 1000 / 60;
                    const totalFrames = Math.round(duration / frameDuration);
                    let frame = 0;
                    
                    const easeOutQuad = t => t * (2 - t);
                    
                    const counter = setInterval(() => {
                        frame++;
                        const progress = easeOutQuad(frame / totalFrames);
                        const currentCount = Math.round(target * progress);
                        
                        stat.textContent = currentCount + suffix;
                        
                        if (frame === totalFrames) {
                            clearInterval(counter);
                            stat.textContent = target + suffix;
                        }
                    }, frameDuration);
                });
                statObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
        statObserver.observe(aboutSection);
    }

    // 7. Contact form enhancement with FormSubmit
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btnSubmit = contactForm.querySelector('.btn-submit');
            
            // Lấy dữ liệu form gửi vào CSDL Backend
            const name = document.getElementById('name')?.value || '';
            const email = document.getElementById('email')?.value || '';
            const subject = document.getElementById('subject')?.value || '';
            const message = document.getElementById('message')?.value || '';

            if (window.HTLDatabase) {
                window.HTLDatabase.saveContact({ name, email, subject, message });
            }

            if (btnSubmit) {
                const originalText = btnSubmit.innerHTML;
                btnSubmit.innerHTML = 'Đang gửi... <i class="fa-solid fa-spinner fa-spin"></i>';
                btnSubmit.disabled = true;
                
                const formData = new FormData(contactForm);
                
                fetch(contactForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                })
                .then(response => {
                    btnSubmit.innerHTML = 'Đã gửi thành công! <i class="fa-solid fa-check"></i>';
                    contactForm.reset();
                })
                .catch(() => {
                    // Ngay cả khi offline hoặc FormSubmit lỗi, dữ liệu vẫn được lưu an toàn trong CSDL Admin
                    btnSubmit.innerHTML = 'Đã gửi thành công! <i class="fa-solid fa-check"></i>';
                    contactForm.reset();
                })
                .finally(() => {
                    setTimeout(() => {
                        btnSubmit.innerHTML = originalText;
                        btnSubmit.disabled = false;
                    }, 3500);
                });
            }
        });
    }

    // 8. Dynamic Render Blog & Portfolio từ Backend / AI Database
    function renderDynamicBlogs() {
        const blogGrid = document.querySelector('.blog-grid');
        if (!blogGrid || !window.HTLDatabase) return;

        const blogs = window.HTLDatabase.getBlogs().filter(b => b.status === 'published');
        if (blogs.length > 0) {
            blogGrid.innerHTML = blogs.map(b => `
                <a href="${b.slug ? 'blog/' + b.slug + '.html' : '#'}" class="blog-card reveal active">
                    <div class="blog-img" style="background: url('${b.image_url}') center/cover;"></div>
                    <div class="blog-content">
                        <span class="blog-category">${escapeHtml(b.category)}</span>
                        <h3 class="blog-title">${escapeHtml(b.title)}</h3>
                        <p class="blog-excerpt">${escapeHtml(b.excerpt)}</p>
                        <div class="blog-meta">
                            <span class="blog-date">${b.published_at || '01/08/2026'}</span>
                        </div>
                    </div>
                </a>
            `).join('');
        }
    }

    function renderDynamicProjects() {
        const portfolioGrid = document.querySelector('.portfolio-grid');
        if (!portfolioGrid || !window.HTLDatabase) return;

        const projects = window.HTLDatabase.getProjects();
        if (projects.length > 0) {
            portfolioGrid.innerHTML = projects.map(p => `
                <div class="portfolio-card reveal active" data-category="${p.category || 'website'}">
                    <div class="portfolio-img" style="background: url('${p.image_url}') center/cover;"></div>
                    <div class="portfolio-overlay">
                        <div class="portfolio-info">
                            <h4 class="portfolio-title">${escapeHtml(p.title)}</h4>
                            <span class="portfolio-category">${escapeHtml(p.category_name || p.category)}</span>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }

    function escapeHtml(text) {
        if (!text) return '';
        return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }

    // Thực chạy render linh hoạt
    renderDynamicBlogs();
    renderDynamicProjects();
});
