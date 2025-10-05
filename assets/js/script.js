/* ================================
   PaytonHealth - Central JavaScript
   ================================ */

document.addEventListener('DOMContentLoaded', function () {

    // ===== HEADER SCROLL BEHAVIOR =====
    const header = document.querySelector('.main-header');

    if (header) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // ===== INTERSECTION OBSERVER FOR ANIMATIONS =====
    const animationObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;

                // Counter animation
                if (target.matches('.counter')) {
                    const targetNum = +target.dataset.target;
                    let current = 0;
                    const increment = targetNum / 100 > 1 ? Math.ceil(targetNum / 100) : 1;

                    const updateCounter = () => {
                        current += increment;
                        if (current < targetNum) {
                            target.innerText = Math.ceil(current);
                            requestAnimationFrame(updateCounter);
                        } else {
                            target.innerText = targetNum;
                        }
                    };
                    updateCounter();
                    animationObserver.unobserve(target);
                }

                // General scroll animation
                if (target.matches('.scroll-animate')) {
                    target.classList.add('is-visible');
                    animationObserver.unobserve(target);
                }

                // Timeline animation
                if (target.matches('.timeline-zigzag')) {
                    target.classList.add('is-drawing');
                    animationObserver.unobserve(target);
                }
            }
        });
    }, { threshold: 0.2 });

    // Observe all counter elements
    document.querySelectorAll('.counter').forEach(counter => {
        animationObserver.observe(counter);
    });

    // Observe all scroll-animate elements
    document.querySelectorAll('.scroll-animate').forEach(el => {
        animationObserver.observe(el);
    });

    // Observe timeline
    const timeline = document.querySelector('.timeline-zigzag');
    if (timeline) {
        animationObserver.observe(timeline);
    }

    // ===== AUTO-POPUP MODAL (Index page only) =====
    const consultationModal = document.getElementById('consultationModal');

    if (consultationModal && document.body.contains(document.querySelector('.hero-section'))) {
        const modal = new bootstrap.Modal(consultationModal);
        const popupShown = sessionStorage.getItem('popupShown');

        if (!popupShown) {
            setTimeout(() => {
                if (document.visibilityState === 'visible') {
                    modal.show();
                    sessionStorage.setItem('popupShown', 'true');
                }
            }, 10000); // 10-second delay
        }
    }

    // ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');

            // Only handle actual anchor links, not # or data-bs-toggle elements
            if (href !== '#' && !this.hasAttribute('data-bs-toggle')) {
                e.preventDefault();
                const target = document.querySelector(href);

                if (target) {
                    const headerOffset = 100;
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // ===== FORM VALIDATION =====
    const forms = document.querySelectorAll('form');

    forms.forEach(form => {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            // Basic validation
            const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
            let isValid = true;

            inputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    input.classList.add('is-invalid');
                } else {
                    input.classList.remove('is-invalid');
                }
            });

            if (isValid) {
                // Show success message (you can customize this)
                alert('Thank you for your submission! We will get back to you soon.');
                form.reset();

                // Close modal if form is inside one
                const modal = form.closest('.modal');
                if (modal) {
                    const modalInstance = bootstrap.Modal.getInstance(modal);
                    if (modalInstance) {
                        modalInstance.hide();
                    }
                }
            } else {
                alert('Please fill in all required fields.');
            }
        });
    });

    // ===== LAZY LOADING IMAGES =====
    const images = document.querySelectorAll('img[loading="lazy"]');

    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    observer.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }

    // ===== ACCORDION ACCESSIBILITY =====
    const accordions = document.querySelectorAll('.accordion-button');

    accordions.forEach(accordion => {
        accordion.addEventListener('click', function () {
            // Update aria-expanded attribute
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !isExpanded);
        });
    });

    // ===== TABLE SEARCH FUNCTIONALITY (for careers page) =====
    const searchInput = document.querySelector('input[type="search"]');

    if (searchInput && searchInput.closest('.container')?.querySelector('table')) {
        const table = searchInput.closest('.container').querySelector('table tbody');

        searchInput.addEventListener('input', function () {
            const searchTerm = this.value.toLowerCase();
            const rows = table.querySelectorAll('tr');

            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                if (text.includes(searchTerm)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }

    // ===== STICKY ELEMENTS ON SCROLL =====
    const stickyElements = document.querySelectorAll('[data-sticky]');

    stickyElements.forEach(element => {
        const originalPosition = element.offsetTop;

        window.addEventListener('scroll', () => {
            if (window.pageYOffset > originalPosition) {
                element.classList.add('is-sticky');
            } else {
                element.classList.remove('is-sticky');
            }
        });
    });

    // ===== INITIALIZE TOOLTIPS (if Bootstrap tooltips are used) =====
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // ===== INITIALIZE POPOVERS (if Bootstrap popovers are used) =====
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });

    // ===== BACK TO TOP BUTTON =====
    const backToTop = document.createElement('button');
    backToTop.innerHTML = '<span class="material-symbols-outlined">arrow_upward</span>';
    backToTop.className = 'btn btn-primary rounded-circle position-fixed bottom-0 end-0 m-4';
    backToTop.style.cssText = 'width: 50px; height: 50px; opacity: 0; visibility: hidden; transition: all 0.3s ease; z-index: 1000;';
    backToTop.setAttribute('aria-label', 'Back to top');
    document.body.appendChild(backToTop);

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTop.style.opacity = '1';
            backToTop.style.visibility = 'visible';
        } else {
            backToTop.style.opacity = '0';
            backToTop.style.visibility = 'hidden';
        }
    });

    backToTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // ===== PRELOADER (optional - uncomment if needed) =====
    /*
    const preloader = document.getElementById('preloader');
    if (preloader) {
        window.addEventListener('load', () => {
            preloader.style.opacity = '0';
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 300);
        });
    }
    */

    // ===== PERFORMANCE OPTIMIZATION =====
    // Debounce scroll events for better performance
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            // Any additional scroll-based logic here
        }, 50);
    }, { passive: true });

    // ===== CONSOLE MESSAGE =====
    console.log('%c💊 PaytonHealth Website', 'color: #1193d4; font-size: 20px; font-weight: bold;');
    console.log('%cWebsite loaded successfully!', 'color: #10b981; font-size: 14px;');
});