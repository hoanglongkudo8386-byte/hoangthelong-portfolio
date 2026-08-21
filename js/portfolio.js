document.addEventListener('DOMContentLoaded', () => {
    // 1. Filter functionality
    const filterBtns = document.querySelectorAll('.filter-btn');
    const portfolioCards = document.querySelectorAll('.portfolio-card');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active class on filter buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filterValue = btn.getAttribute('data-filter');
            
            portfolioCards.forEach(card => {
                const category = card.getAttribute('data-category');
                
                if (filterValue === 'all' || filterValue === category) {
                    card.classList.remove('hide');
                    card.style.display = 'block';
                    
                    // Allow display: block to apply before changing opacity for smooth animation
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }, 10);
                } else {
                    card.classList.add('hide');
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.8)';
                    
                    setTimeout(() => {
                        if (card.classList.contains('hide')) {
                            card.style.display = 'none';
                        }
                    }, 300); // 300ms transition duration
                }
            });
        });
    });

    // 2. Portfolio Modal data
    const projectsData = [
        {
            title: 'Trường Học 247 - Hệ Thống Quản Lý',
            category: 'Website / Web App',
            description: 'Nghiên cứu trải nghiệm người dùng (UX/UI) và phát triển giao diện hệ thống quản lý học viên, lớp học và đào tạo cho Trường Học 247 (truonghoc247.vn). Tối ưu quy trình quản trị trung tâm và theo dõi tiến độ học tập.',
            metrics: [
                { value: '100%', label: 'Tự động hóa báo cáo' },
                { value: '1,000+', label: 'Học viên vận hành' },
                { value: '98%', label: 'Đánh giá UX hài lòng' }
            ],
            image: "url('assets/images/truonghoc247.png') center/cover"
        },
        {
            title: 'VELA - Bộ Nhận Diện Thương Hiệu Nến Thơm',
            category: 'Branding & Strategy',
            description: 'Xây dựng chiến lược thương hiệu và bộ nhận diện hoàn chỉnh cho VELA (velanenthom.vn) — Nến thơm thiên nhiên phong cách Self-care & Slow Living. Phân tích PEST, thị trường, đối thủ và thiết kế bộ quy chuẩn chuẩn chỉnh (Cinzel & Montserrat, Earth Tone #A66A3A).',
            metrics: [
                { value: '100%', label: 'Brand Guidelines' },
                { value: 'PEST & 3C', label: 'Phân tích chuẩn học thuật' },
                { value: 'Earth Tone', label: 'Bảng màu ấm ấn tượng' }
            ],
            image: "url('assets/images/vela_branding.png') center/cover"
        },
        {
            title: 'Content Automation Bằng AI',
            category: 'Content / AI',
            description: 'Thiết lập luồng sản xuất content tự động đa nền tảng kết hợp ChatGPT & Midjourney. Giúp doanh nghiệp duy trì tần suất đăng bài 50+ bài/tháng mà vẫn đồng nhất chuẩn tone giọng thương hiệu.',
            metrics: [
                { value: 'x3', label: 'Tốc độ sản xuất' },
                { value: '50+', label: 'Bài viết/tháng' },
                { value: '0đ', label: 'Chi phí thuê ngoài' }
            ],
            image: "url('assets/images/ai_content_automation.png') center/cover"
        },
        {
            title: 'Chiến Dịch Facebook Ads Tối Ưu Data',
            category: 'Quảng cáo / Data',
            description: 'Triển khai quảng cáo Facebook ứng dụng A/B testing liên tục cho nội dung/hình ảnh và đối tượng Lookalike. Tối ưu chi phí trên mỗi lượt chuyển đổi (CPA) đáng kể.',
            metrics: [
                { value: '3.8x', label: 'ROAS trung bình' },
                { value: '-45%', label: 'Chi phí/Lead' },
                { value: '10K+', label: 'Lượt tiếp cận' }
            ],
            image: "url('assets/images/fb_ads_data.png') center/cover"
        },
        {
            title: 'Landing Page Chuyển Đổi Cao (CRO)',
            category: 'Website / CRO',
            description: 'Thiết kế landing page tốc độ cao, tối ưu chuẩn SEO và trải nghiệm Mobile-First. Tích hợp form thu thập lead thông minh và nút kêu gọi hành động (CTA) thu hút.',
            metrics: [
                { value: '15%', label: 'Conversion Rate' },
                { value: '0.8s', label: 'Thời gian tải' },
                { value: '95+', label: 'PageSpeed Score' }
            ],
            image: "url('assets/images/truonghoc247.png') center/cover"
        },
        {
            title: 'Chatbot AI & CSKH Tự Động 24/7',
            category: 'Automation / AI',
            description: 'Tích hợp nhân viên AI CSKH tự động tư vấn, giải đáp thắc mắc và phân loại lead 24/7 trên Fanpage & Website, tự động đẩy dữ liệu về hệ thống quản lý.',
            metrics: [
                { value: '24/7', label: 'Phản hồi tức thì' },
                { value: '100%', label: 'Lead lưu tự động' },
                { value: '-60%', label: 'Thời gian chờ' }
            ],
            image: "url('assets/images/ai_content_automation.png') center/cover"
        }
    ];

    const modal = document.getElementById('portfolioModal');
    const modalContent = document.querySelector('.modal-content');
    const modalCloseBtn = document.querySelector('.modal-close');
    const modalImg = document.querySelector('.modal-img');
    const modalTitle = document.querySelector('.modal-title');
    const modalDesc = document.querySelector('.modal-desc');
    const modalMetrics = document.querySelector('.modal-metrics');

    if (modal && portfolioCards.length > 0) {
        portfolioCards.forEach((card, index) => {
            // Assign index to card to map to data
            card.dataset.index = index;
            
            card.addEventListener('click', function() {
                const projectIndex = this.dataset.index;
                const project = projectsData[projectIndex];
                
                if (project) {
                    // Populate modal
                    if (modalTitle) modalTitle.textContent = project.title;
                    if (modalDesc) modalDesc.textContent = project.description;
                    
                    if (modalImg) {
                        modalImg.style.background = project.image || project.gradient;
                    }
                    
                    // Generate metrics dynamically
                    if (modalMetrics) {
                        modalMetrics.innerHTML = ''; // Clear existing
                        project.metrics.forEach(metric => {
                            const metricItem = document.createElement('div');
                            metricItem.className = 'metric-item';
                            
                            const metricValue = document.createElement('div');
                            metricValue.className = 'metric-value';
                            metricValue.textContent = metric.value;
                            
                            const metricLabel = document.createElement('div');
                            metricLabel.className = 'metric-label';
                            metricLabel.textContent = metric.label;
                            
                            metricItem.appendChild(metricValue);
                            metricItem.appendChild(metricLabel);
                            modalMetrics.appendChild(metricItem);
                        });
                    }
                    
                    // Show modal
                    modal.classList.add('active');
                    document.body.style.overflow = 'hidden'; // Prevent scrolling
                }
            });
        });
    }

    // 3. Close modal functionality
    const closeModal = () => {
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    };

    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeModal);
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
            closeModal();
        }
    });

    // 4. Testimonial Slider
    const track = document.querySelector('.testimonial-track');
    const slides = document.querySelectorAll('.testimonial-card');
    const dots = document.querySelectorAll('.slider-dot');
    
    if (track && slides.length > 0) {
        let currentIndex = 0;
        let slideInterval;
        const totalSlides = slides.length;
        
        const updateSlider = (index) => {
            track.style.transform = `translateX(-${index * 100}%)`;
            
            dots.forEach(dot => dot.classList.remove('active'));
            if (dots[index]) {
                dots[index].classList.add('active');
            }
        };
        
        const nextSlide = () => {
            currentIndex = (currentIndex + 1) % totalSlides;
            updateSlider(currentIndex);
        };
        
        const startSlider = () => {
            slideInterval = setInterval(nextSlide, 4000);
        };
        
        const stopSlider = () => {
            clearInterval(slideInterval);
        };
        
        // Init slider
        updateSlider(currentIndex);
        startSlider();
        
        // Dot clicks
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                currentIndex = index;
                updateSlider(currentIndex);
                stopSlider();
                startSlider();
            });
        });
        
        // Pause on hover
        const sliderContainer = document.querySelector('.testimonial-slider');
        if (sliderContainer) {
            sliderContainer.addEventListener('mouseenter', stopSlider);
            sliderContainer.addEventListener('mouseleave', startSlider);
        }
    }
});
