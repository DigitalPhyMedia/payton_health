/* ================================
   PaytonHealth - Central JavaScript
   ================================ */

document.addEventListener('DOMContentLoaded', function () {

    // ===== HEADER SCROLL BEHAVIOR =====
    const header = document.querySelector('.main-header');
    if (header) {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
    }

    // ===== INTERSECTION OBSERVER FOR ANIMATIONS =====
    const animationObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                if (target.matches('.counter')) {
                    const targetNum = +target.dataset.target;
                    let current = 0;
                    const increment = Math.max(1, Math.ceil(targetNum / 100));
                    const updateCounter = () => {
                        current += increment;
                        if (current < targetNum) {
                            target.innerText = current.toLocaleString();
                            requestAnimationFrame(updateCounter);
                        } else {
                            target.innerText = targetNum.toLocaleString();
                        }
                    };
                    updateCounter();
                    observer.unobserve(target);
                }
                if (target.matches('.scroll-animate')) {
                    target.classList.add('is-visible');
                    observer.unobserve(target);
                }
                if (target.matches('.timeline-zigzag')) {
                    target.classList.add('is-drawing');
                    observer.unobserve(target);
                }
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.counter, .scroll-animate, .timeline-zigzag').forEach(el => {
        animationObserver.observe(el);
    });

    // ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href.length > 1 && document.querySelector(href)) {
                e.preventDefault();
                const target = document.querySelector(href);
                const headerOffset = 120;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ===== ENHANCED FORM VALIDATION & SUBMISSION =====
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const submitButton = form.querySelector('button[type="submit"]');
            let feedbackDiv = form.querySelector('.form-feedback-message');
            if (!feedbackDiv) {
                feedbackDiv = document.createElement('div');
                feedbackDiv.className = 'form-feedback-message small mt-3';
                submitButton.parentNode.insertBefore(feedbackDiv, submitButton.nextSibling);
            }
            if (form.checkValidity() === false) {
                feedbackDiv.textContent = 'Please fill in all required fields.';
                feedbackDiv.className = 'form-feedback-message small mt-3 text-danger';
                form.classList.add('was-validated');
                return;
            }
            submitButton.disabled = true;
            const originalButtonText = submitButton.innerHTML;
            submitButton.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Sending...`;
            setTimeout(() => {
                feedbackDiv.textContent = 'Thank you! Your message has been sent.';
                feedbackDiv.className = 'form-feedback-message small mt-3 text-success';
                form.reset();
                form.classList.remove('was-validated');
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
                setTimeout(() => { feedbackDiv.textContent = ''; }, 5000);
                const modal = form.closest('.modal');
                if (modal) {
                    const modalInstance = bootstrap.Modal.getInstance(modal);
                    if (modalInstance) {
                        setTimeout(() => modalInstance.hide(), 1000);
                    }
                }
            }, 1500);
        });
    });

    // ===== TABLE SEARCH FUNCTIONALITY (for careers page) =====
    const searchInput = document.querySelector('input[type="search"]');
    if (searchInput && document.querySelector('table')) {
        const tableBody = document.querySelector('table tbody');
        if (tableBody) {
            const rows = tableBody.querySelectorAll('tr');
            searchInput.addEventListener('input', function () {
                const searchTerm = this.value.toLowerCase();
                rows.forEach(row => {
                    row.style.display = row.textContent.toLowerCase().includes(searchTerm) ? '' : 'none';
                });
            });
        }
    }

    // ===== CAREERS "APPLY NOW" MODAL LOGIC =====
    const applyModal = document.getElementById('applyModal');
    if (applyModal) {
        applyModal.addEventListener('show.bs.modal', function (event) {
            const button = event.relatedTarget; // Button that triggered the modal
            const position = button.getAttribute('data-position'); // Get position from data-* attribute
            const positionSelect = applyModal.querySelector('#applyPosition');
            positionSelect.value = position;
        });
    }

    // ===== LEGAL PAGE DYNAMIC SIDEBAR & TABS CONTROLLER =====
    const legalSidebar = document.getElementById('legal-sidebar');
    if (legalSidebar) {
        const legalContent = {
            privacy: {
                title: 'Privacy Policy',
                sections: [
                    { id: 'privacy-introduction', title: '1. Introduction' },
                    { id: 'privacy-information-collect', title: '2. Information We Collect' },
                    { id: 'privacy-how-we-use', title: '3. How We Use Information' },
                    { id: 'privacy-information-sharing', title: '4. Information Sharing' },
                    { id: 'privacy-data-security', title: '5. Data Security' },
                    { id: 'privacy-your-rights', title: '6. Your Privacy Rights' },
                    { id: 'privacy-cookies', title: '7. Cookies' },
                    { id: 'privacy-changes', title: '8. Policy Changes' },
                    { id: 'privacy-contact', title: '9. Contact Us' },
                ]
            },
            refund: {
                title: 'Refund Policy',
                sections: [
                    { id: 'refund-overview', title: '1. Overview' },
                    { id: 'refund-eligibility', title: '2. Eligibility' },
                    { id: 'refund-request', title: '3. How to Request' },
                    { id: 'refund-processing', title: '4. Processing' },
                ]
            },
            terms: {
                title: 'Terms of Service',
                sections: [
                    { id: 'terms-acceptance', title: '1. Acceptance of Terms' },
                    { id: 'terms-services', title: '2. Our Services' },
                    { id: 'terms-user-obligations', title: '3. User Obligations' },
                    { id: 'terms-fees', title: '4. Fees and Payment' },
                    { id: 'terms-intellectual-property', title: '5. Intellectual Property' },
                    { id: 'terms-disclaimers', title: '6. Disclaimers' },
                    { id: 'terms-limitation', title: '7. Limitation of Liability' },
                    { id: 'terms-termination', title: '8. Termination' },
                    { id: 'terms-governing-law', title: '9. Governing Law' },
                    { id: 'terms-contact', title: '10. Contact Information' },
                ]
            }
        };

        const updateSidebar = (policyKey) => {
            const policy = legalContent[policyKey];
            if (!policy) return;

            let sidebarHTML = `
                <h4 class="legal-sidebar-title">${policy.title}</h4>
                <nav id="legal-sidebar-nav" class="nav nav-pills flex-column mt-3">
            `;
            policy.sections.forEach(section => {
                sidebarHTML += `<a class="nav-link" href="#${section.id}">${section.title}</a>`;
            });
            sidebarHTML += '</nav>';
            legalSidebar.innerHTML = sidebarHTML;

            setTimeout(() => {
                const scrollSpy = bootstrap.ScrollSpy.getInstance(document.body);
                if (scrollSpy) {
                    scrollSpy.refresh();
                }
            }, 100);
        };

        const tabs = document.querySelectorAll('#legalTab .nav-link');
        tabs.forEach(tab => {
            tab.addEventListener('show.bs.tab', (event) => {
                const policyKey = event.target.id.replace('-tab', '');
                updateSidebar(policyKey);
                history.pushState(null, null, `#${policyKey}`);
            });
        });

        const initialHash = window.location.hash.substring(1) || 'privacy';
        const initialTabKey = ['privacy', 'refund', 'terms'].includes(initialHash) ? initialHash : 'privacy';
        const initialTab = document.getElementById(`${initialTabKey}-tab`);
        if (initialTab) {
            new bootstrap.Tab(initialTab).show();
        } else {
            new bootstrap.Tab(document.getElementById('privacy-tab')).show();
        }
    }

    // ===== BACK TO TOP BUTTON =====
    const backToTop = document.createElement('button');
    backToTop.innerHTML = '<span class="material-symbols-outlined">arrow_upward</span>';
    backToTop.className = 'btn btn-primary rounded-circle position-fixed bottom-0 end-0 m-3 m-lg-4 p-0 d-flex align-items-center justify-content-center';
    backToTop.style.cssText = 'width: 48px; height: 48px; opacity: 0; visibility: hidden; transition: all 0.3s ease; z-index: 1000;';
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
    }, { passive: true });
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ===== EMI CALCULATOR SCRIPT (No Cost EMI page) =====
    const costInput = document.getElementById('treatmentCost');
    const tenureSelect = document.getElementById('emiTenure');
    const emiOutput = document.getElementById('monthlyEmi');
    if (costInput && tenureSelect && emiOutput) {
        const calculateEmi = () => {
            const cost = parseFloat(costInput.value) || 0;
            const tenure = parseInt(tenureSelect.value, 10);
            if (cost > 0 && tenure > 0) {
                const monthlyEmi = cost / tenure;
                emiOutput.textContent = monthlyEmi.toLocaleString('en-IN', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                });
            } else {
                emiOutput.textContent = '0';
            }
        };
        costInput.addEventListener('input', calculateEmi);
        tenureSelect.addEventListener('change', calculateEmi);
        calculateEmi();
    }

    console.log('%c💊 PaytonHealth Website', 'color: #1193d4; font-size: 20px; font-weight: bold;');
    console.log('%cEnhancements complete and site loaded successfully!', 'color: #10b981; font-size: 14px;');
});