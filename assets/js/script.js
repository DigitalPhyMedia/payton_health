document.addEventListener('DOMContentLoaded', function () {
    // Header scroll effect
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

    // Intersection Observer for animations
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

                // General scroll animation for sections
                if (target.matches('.scroll-animate')) {
                    target.classList.add('is-visible');
                    animationObserver.unobserve(target);
                }

                // Timeline drawing animation
                if (target.matches('.timeline-zigzag')) {
                    target.classList.add('is-drawing');
                    animationObserver.unobserve(target);
                }
            }
        });
    }, { threshold: 0.1 });

    // Observe all elements with animation classes
    document.querySelectorAll('.counter, .scroll-animate, .timeline-zigzag').forEach(el => {
        animationObserver.observe(el);
    });

    // Auto-popup modal logic for consultation
    const consultationModalEl = document.getElementById('consultationModal');
    if (consultationModalEl) {
        const consultationModal = new bootstrap.Modal(consultationModalEl);
        const popupShown = sessionStorage.getItem('popupShown');

        // Only show the popup on the homepage (or where the hero form exists)
        const isHomePage = document.querySelector('.hero-section-home');
        if (isHomePage && !popupShown) {
            setTimeout(() => {
                if (document.visibilityState === 'visible') {
                    consultationModal.show();
                    sessionStorage.setItem('popupShown', 'true');
                }
            }, 10000); // 10-second delay
        }
    }
});