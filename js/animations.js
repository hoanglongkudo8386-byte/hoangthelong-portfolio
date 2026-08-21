document.addEventListener('DOMContentLoaded', () => {
    // 1 & 2. Scroll reveal animations
    const reveals = document.querySelectorAll('.reveal');
    
    const revealOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);
    
    reveals.forEach(reveal => {
        revealObserver.observe(reveal);
    });
    
    // 3. Stagger animation
    const grids = document.querySelectorAll('.services-grid, .portfolio-grid, .blog-grid');
    grids.forEach(grid => {
        const children = grid.children;
        Array.from(children).forEach((child, index) => {
            if (child.classList.contains('reveal')) {
                // Add 0.1s delay for each subsequent item
                child.style.transitionDelay = `${index * 0.1}s`;
            }
        });
    });
    
    // 4. Parallax effect (subtle)
    const heroSection = document.getElementById('hero');
    const decorativeElements = document.querySelectorAll('.hero-decoration, .decorative-shape');
    
    if (heroSection && decorativeElements.length > 0) {
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            
            // Only calculate parallax if hero is in view
            if (scrollY <= heroSection.offsetHeight) {
                window.requestAnimationFrame(() => {
                    decorativeElements.forEach((el, index) => {
                        // Different elements move at slightly different speeds based on index
                        const speed = 0.05 + (index * 0.02);
                        const yPos = scrollY * speed;
                        // Limit movement to max 30px
                        const boundedY = Math.min(yPos, 30);
                        
                        el.style.transform = `translateY(${boundedY}px)`;
                    });
                });
            }
        }, { passive: true });
    }
    
    // 5. Text typing effect
    const taglineElement = document.querySelector('.hero-tagline');
    if (taglineElement) {
        const text = taglineElement.textContent;
        taglineElement.textContent = '';
        taglineElement.style.visibility = 'visible';
        
        // Add a cursor element
        const cursor = document.createElement('span');
        cursor.textContent = '|';
        cursor.className = 'typing-cursor';
        cursor.style.animation = 'blink 1s infinite';
        
        let i = 0;
        
        setTimeout(() => {
            taglineElement.appendChild(cursor);
            
            const typeWriter = setInterval(() => {
                if (i < text.length) {
                    taglineElement.insertBefore(document.createTextNode(text.charAt(i)), cursor);
                    i++;
                } else {
                    clearInterval(typeWriter);
                }
            }, 100); // 100ms per character
        }, 500); // Start after 500ms delay
    }
});
