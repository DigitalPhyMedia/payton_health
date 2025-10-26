/* ================================
   PaytonHealth - Central JavaScript
   ================================ */

document.addEventListener('DOMContentLoaded', function () {

    // ===== PRELOADER ANIMATION (Logo + First Load Only) =====
    const preloader = document.getElementById('preloader');
    const preloaderPercentage = document.querySelector('.preloader-percentage');
    
    // Check if user has already visited in this session
    if (!sessionStorage.getItem('preloaderShown')) {
        // First visit - show preloader
        if (preloader && preloaderPercentage) {
            let progress = 0;
            let interval;
            
            // Start counting immediately
            interval = setInterval(() => {
                if (progress < 90) {
                    progress += Math.random() * 10; // Fast increment up to 90%
                    preloaderPercentage.textContent = Math.floor(progress) + '%';
                }
            }, 50);
            
            // When page is fully loaded
            window.addEventListener('load', () => {
                clearInterval(interval);
                
                // Quickly finish to 100%
                const finishInterval = setInterval(() => {
                    progress += 5;
                    if (progress >= 100) {
                        progress = 100;
                        preloaderPercentage.textContent = '100%';
                        clearInterval(finishInterval);
                        
                        // Hide preloader immediately after reaching 100%
                        setTimeout(() => {
                            preloader.classList.add('preloader-hidden');
                            setTimeout(() => {
                                preloader.remove();
                                // Mark as shown in this session
                                sessionStorage.setItem('preloaderShown', 'true');
                            }, 500);
                        }, 200);
                    } else {
                        preloaderPercentage.textContent = Math.floor(progress) + '%';
                    }
                }, 30);
            });
        }
    } else {
        // Already visited in this session - skip preloader
        if (preloader) {
            preloader.remove();
        }
    }

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
        handleScroll(); // Initial check
    }

    // ===== INTERSECTION OBSERVER FOR ANIMATIONS =====
    const animationObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                // Counter Animation
                if (target.matches('.counter')) {
                    const targetNum = +target.dataset.target;
                    let current = 0;
                    const increment = Math.max(1, Math.ceil(targetNum / 100)); // Faster increment
                    const updateCounter = () => {
                        current += increment;
                        if (current < targetNum) {
                            target.innerText = current.toLocaleString();
                            requestAnimationFrame(updateCounter);
                        } else {
                            target.innerText = targetNum.toLocaleString(); // Ensure final number is exact
                        }
                    };
                    requestAnimationFrame(updateCounter); // Start animation
                    observer.unobserve(target); // Unobserve after animation starts
                }
                // Scroll Animation (Fade/Slide Up)
                if (target.matches('.scroll-animate')) {
                    target.classList.add('is-visible');
                    observer.unobserve(target);
                }
                // Timeline Animation
                if (target.matches('.timeline-zigzag')) {
                    target.classList.add('is-drawing');
                    observer.unobserve(target);
                }
            }
        });
    }, { threshold: 0.1 }); // Trigger animation when 10% visible

    // Observe relevant elements
    document.querySelectorAll('.counter, .scroll-animate, .timeline-zigzag').forEach(el => {
        animationObserver.observe(el);
    });

    // ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            // Ensure it's more than just "#" and the target exists
            if (href.length > 1 && document.querySelector(href)) {
                e.preventDefault();
                const target = document.querySelector(href);
                // Dynamically get header height if possible, fallback to 80
                const headerHeight = document.querySelector('.main-header')?.offsetHeight || 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });

                // Special handling for policy page scroll targets
                if (target.classList.contains('scroll-target')) {
                    // Optional: Add a brief highlight effect
                    target.style.transition = 'background-color 0.5s ease-in-out';
                    target.style.backgroundColor = 'rgba(17, 147, 212, 0.1)'; // Light blue highlight
                    setTimeout(() => {
                        target.style.backgroundColor = ''; // Remove highlight
                        target.style.transition = ''; // Clean up transition style
                    }, 1500); // Duration of highlight
                }
            }
        });
    });

    // ===== PHP EMAIL FORM SUBMISSION HANDLER (REMOVED - Now handled by validate.js) =====
    // The code that started with (function () { "use strict"; ... and handled fetch has been removed.

    // ===== CAREERS "APPLY NOW" MODAL LOGIC (Dropdown Population) =====
    const applyModal = document.getElementById('applyModal');
    if (applyModal) {
        // Selector for job titles
        const getAvailablePositions = () => [
            ...document.querySelectorAll('.job-list-item .job-info h4.h6')
        ].map(titleEl => titleEl.textContent.trim());

        // Event listener for when the modal is about to be shown
        applyModal.addEventListener('show.bs.modal', function (event) {
            const button = event.relatedTarget; // Button that triggered the modal
            const positionClicked = button ? button.getAttribute('data-position') : null; // Get position from button
            const positionSelect = applyModal.querySelector('#applyPositionSelect'); // The dropdown
            const form = applyModal.querySelector('form');

            // --- Resetting form state and feedback specific to validate.js structure ---
            form.classList.remove('was-validated'); // Reset Bootstrap validation
            const feedbackDivs = form.querySelectorAll('.loading, .error-message, .sent-message');
            feedbackDivs.forEach(div => div.classList.remove('d-block')); // Hide all feedback
            const errorMsgDiv = form.querySelector('.error-message');
            if (errorMsgDiv) errorMsgDiv.innerHTML = ''; // Clear previous error text
            // --- End Resetting ---


            if (positionSelect) {
                const availablePositions = getAvailablePositions(); // Get current job titles
                positionSelect.innerHTML = ''; // Clear old options

                // Add default placeholder
                const defaultOption = document.createElement('option');
                defaultOption.value = "";
                defaultOption.textContent = "Select Position";
                defaultOption.disabled = true;
                positionSelect.appendChild(defaultOption);

                // Add options for each available position
                availablePositions.forEach(pos => {
                    const option = document.createElement('option');
                    option.value = pos;
                    option.textContent = pos;
                    if (pos === positionClicked) { // Pre-select if triggered by specific button
                        option.selected = true;
                    }
                    positionSelect.appendChild(option);
                });

                // Select placeholder if no position was clicked or found
                if (!positionClicked || !availablePositions.includes(positionClicked)) {
                    defaultOption.selected = true;
                }
            }
        });

        // Event listener for when the modal is hidden
        applyModal.addEventListener('hidden.bs.modal', function () {
            const form = applyModal.querySelector('form');
            if (form) {
                form.reset(); // Clear form fields
                form.classList.remove('was-validated'); // Reset validation
                // Clear feedback messages using validate.js structure
                form.querySelectorAll('.loading, .error-message, .sent-message').forEach(el => el.classList.remove('d-block'));
                const errorDiv = form.querySelector('.error-message');
                if (errorDiv) errorDiv.innerHTML = '';
            }
        });
    }


    // ===== GENERIC ACCORDION TOGGLE LOGIC (For Careers & Download Forms) =====
    const genericAccordionItems = document.querySelectorAll('.job-accordion-item');
    if (genericAccordionItems.length > 0) {
        genericAccordionItems.forEach(item => {
            const header = item.querySelector('.job-accordion-header');
            const body = item.querySelector('.job-accordion-body');

            if (header && body && !item.classList.contains('disabled')) {
                // Initialize based on 'active' class
                if (item.classList.contains('active')) {
                    setTimeout(() => { // Delay needed for correct height calculation
                        if (item.classList.contains('active')) {
                            body.style.maxHeight = body.scrollHeight + "px";
                        }
                    }, 150);
                } else {
                    body.style.maxHeight = null;
                }

                // Add click listener to toggle
                header.addEventListener('click', function () {
                    item.classList.toggle('active');
                    // Set maxHeight based on current state (open or closed)
                    body.style.maxHeight = item.classList.contains('active') ? body.scrollHeight + "px" : null;
                });
            }
        });
    }


    // ===== DOWNLOAD FORMS PAGE - ACCORDION & PAGINATION =====
    const downloadFormsPage = document.querySelector('.page-download-forms');
    if (downloadFormsPage) {
        const itemsPerPage = 7; // Number of forms per page
        let formData = {}; // Object to hold parsed form data
        const accordionItems = downloadFormsPage.querySelectorAll('.job-accordion-item[data-category]');

        // --- 1. Load and Parse Form Data from JSON Script Tag ---
        const jsonDataScript = document.getElementById('forms-json-data');
        if (jsonDataScript) {
            try {
                const rawData = JSON.parse(jsonDataScript.textContent);
                // Initialize categories
                formData['Cashless Insurance Forms'] = [];
                formData['Cashless TPA Forms'] = [];
                formData['Reimbursement Insurance Forms'] = [];
                formData['Reimbursement TPA Forms'] = [];

                // Process raw data and categorize forms
                for (const path in rawData) {
                    const label = rawData[path];
                    const categoryPath = path.substring(0, path.indexOf('/'));
                    const fullPath = `assets/pdf/${path}`; // Construct the full download path

                    // Assign to correct category array
                    if (categoryPath === 'cashless_insurance_forms') {
                        formData['Cashless Insurance Forms'].push({ label: label, path: fullPath });
                    } else if (categoryPath === 'cashless_tpa_forms') {
                        formData['Cashless TPA Forms'].push({ label: label, path: fullPath });
                    } else if (categoryPath === 'reimbursement_insurance_forms') {
                        formData['Reimbursement Insurance Forms'].push({ label: label, path: fullPath });
                    } else if (categoryPath === 'reimbursement_tpa_forms') {
                        formData['Reimbursement TPA Forms'].push({ label: label, path: fullPath });
                    }
                }
            } catch (e) {
                console.error("Error parsing form data JSON:", e);
                // Display error message in all accordion sections
                accordionItems.forEach(item => {
                    const listContainer = item.querySelector('.form-list-container');
                    if (listContainer) listContainer.innerHTML = '<p class="text-danger small text-center">Error loading forms. Please try again later.</p>';
                });
            }
        } else {
            console.error("Form data script tag not found (#forms-json-data).");
            accordionItems.forEach(item => {
                const listContainer = item.querySelector('.form-list-container');
                if (listContainer) listContainer.innerHTML = '<p class="text-warning small text-center">Form data source missing.</p>';
            });
        }

        // --- 2. Function to Render Forms for a Specific Page ---
        const renderForms = (category, page = 1) => {
            const accordionItem = downloadFormsPage.querySelector(`.job-accordion-item[data-category="${category}"]`);
            if (!accordionItem) return;

            const listContainer = accordionItem.querySelector('.form-list-container');
            const forms = formData[category] || []; // Get forms for the category
            listContainer.innerHTML = ''; // Clear existing list
            const body = accordionItem.querySelector('.job-accordion-body'); // Accordion body for height adjustment

            if (forms.length === 0) {
                listContainer.innerHTML = '<p class="text-muted small text-center">No forms available in this category.</p>';
                // Adjust height if accordion is open
                if (accordionItem.classList.contains('active')) {
                    setTimeout(() => { if (accordionItem.classList.contains('active')) { body.style.maxHeight = body.scrollHeight + "px"; } }, 0);
                }
                return;
            }

            // Calculate forms to display for the current page
            const startIndex = (page - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const paginatedForms = forms.slice(startIndex, endIndex);

            // Create and append list items (using links now)
            paginatedForms.forEach(form => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'form-list-item';
                itemDiv.innerHTML = `
                    <a href="${form.path}" class="form-download-link" download>
                         <span class="material-symbols-outlined icon-size-20" aria-hidden="true">picture_as_pdf</span>
                         ${form.label}
                     </a>`;
                listContainer.appendChild(itemDiv);
            });

            // Re-adjust accordion height if it's open
            if (accordionItem.classList.contains('active')) {
                setTimeout(() => { if (accordionItem.classList.contains('active')) { body.style.maxHeight = body.scrollHeight + "px"; } }, 0);
            }
        };


        // --- 3. Function to Render Pagination Controls ---
        const renderPagination = (category, currentPage = 1) => {
            const accordionItem = downloadFormsPage.querySelector(`.job-accordion-item[data-category="${category}"]`);
            if (!accordionItem) return;

            const paginationContainer = accordionItem.querySelector('.pagination-container');
            const forms = formData[category] || [];
            const totalForms = forms.length;
            const totalPages = Math.ceil(totalForms / itemsPerPage); // Calculate total pages
            const body = accordionItem.querySelector('.job-accordion-body');
            paginationContainer.innerHTML = ''; // Clear old pagination

            // Don't render pagination if only one page or less
            if (totalPages <= 1) {
                if (accordionItem.classList.contains('active')) {
                    setTimeout(() => { if (accordionItem.classList.contains('active')) { body.style.maxHeight = body.scrollHeight + "px"; } }, 0);
                }
                return;
            }

            // Create pagination UL element
            const ul = document.createElement('ul');
            ul.className = 'pagination pagination-sm justify-content-center'; // Use Bootstrap classes

            // Previous Button
            const prevLi = document.createElement('li');
            prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
            prevLi.innerHTML = `<a class="page-link" href="#" data-page="${currentPage - 1}" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a>`;
            ul.appendChild(prevLi);

            // Page Number Buttons
            for (let i = 1; i <= totalPages; i++) {
                const pageLi = document.createElement('li');
                pageLi.className = `page-item ${i === currentPage ? 'active' : ''}`; // Highlight current page
                pageLi.innerHTML = `<a class="page-link" href="#" data-page="${i}">${i}</a>`;
                ul.appendChild(pageLi);
            }

            // Next Button
            const nextLi = document.createElement('li');
            nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
            nextLi.innerHTML = `<a class="page-link" href="#" data-page="${currentPage + 1}" aria-label="Next"><span aria-hidden="true">&raquo;</span></a>`;
            ul.appendChild(nextLi);

            paginationContainer.appendChild(ul); // Add pagination to the container

            // Add click listeners to pagination links
            paginationContainer.querySelectorAll('.page-link').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    // Ignore clicks on disabled buttons
                    if (e.currentTarget.closest('.page-item').classList.contains('disabled')) return;

                    const targetPage = parseInt(e.currentTarget.getAttribute('data-page')); // Get page number from data attribute
                    // Re-render forms and pagination for the new page
                    if (targetPage >= 1 && targetPage <= totalPages && targetPage !== currentPage) {
                        renderForms(category, targetPage);
                        renderPagination(category, targetPage);
                    }
                });
            });

            // Re-adjust accordion height after adding pagination
            if (accordionItem.classList.contains('active')) {
                setTimeout(() => { if (accordionItem.classList.contains('active')) { body.style.maxHeight = body.scrollHeight + "px"; } }, 0);
            }
        };

        // --- 4. Initialize Accordions: Load content on first open ---
        accordionItems.forEach(item => {
            const header = item.querySelector('.job-accordion-header');
            const category = item.getAttribute('data-category');
            let isInitialized = false; // Track if content has been loaded

            // If accordion starts open, load content immediately
            if (item.classList.contains('active')) {
                renderForms(category, 1);
                renderPagination(category, 1);
                isInitialized = true;
                // Height adjustment handled by generic accordion logic's initial check
            }

            // Add click listener to load content only when opened for the first time
            if (header) {
                header.addEventListener('click', () => {
                    // Check if accordion is now active (just opened) and hasn't been initialized yet
                    if (item.classList.contains('active') && !isInitialized) {
                        renderForms(category, 1);
                        renderPagination(category, 1);
                        isInitialized = true; // Mark as initialized
                    }
                    // Height adjustment is handled by the generic accordion toggle logic
                });
            }
        });

    } // End if (downloadFormsPage)


    // ===== BACK TO TOP BUTTON =====
    const backToTop = document.createElement('button');
    backToTop.innerHTML = '<span class="material-symbols-outlined">arrow_upward</span>';
    backToTop.className = 'btn btn-primary rounded-circle position-fixed bottom-0 end-0 m-3 m-lg-4 p-0 d-flex align-items-center justify-content-center back-to-top-btn';
    backToTop.setAttribute('aria-label', 'Back to top');
    document.body.appendChild(backToTop);

    // Show/hide button based on scroll position
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) { // Show after scrolling down 300px
            backToTop.style.opacity = '1';
            backToTop.style.visibility = 'visible';
        } else {
            backToTop.style.opacity = '0';
            backToTop.style.visibility = 'hidden';
        }
    }, { passive: true });

    // Scroll to top smoothly on click
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ===== WELCOME MODAL LOGIC (Broadcast Channel for single session display) =====
    const welcomeModalElement = document.getElementById('welcomeModal');
    const welcomeModalSessionKey = 'paytonHealthWelcomeModalShown_Session'; // sessionStorage key
    const welcomeChannelName = 'payton_welcome_modal_channel'; // Channel name
    let welcomeChannel = null;
    let modalShownInThisTab = false; // Flag for current tab

    // Function to display the modal and notify other tabs
    const showWelcomeModalAndNotify = () => {
        // Don't show if element missing, already shown in this tab, or flag set in sessionStorage
        if (!welcomeModalElement || modalShownInThisTab || sessionStorage.getItem(welcomeModalSessionKey)) {
            if (welcomeChannel) { try { welcomeChannel.close(); } catch (e) { } } // Close channel if not showing
            return;
        }

        try {
            const welcomeModal = new bootstrap.Modal(welcomeModalElement); // Create Bootstrap modal instance

            // Show the modal after a short delay
            setTimeout(() => {
                try {
                    welcomeModal.show();
                    modalShownInThisTab = true; // Mark shown for this tab
                    sessionStorage.setItem(welcomeModalSessionKey, 'true'); // Mark shown for the session

                    // Notify other open tabs via BroadcastChannel
                    if (welcomeChannel) {
                        welcomeChannel.postMessage('modal_shown');
                        // Close channel shortly after notifying
                        setTimeout(() => { try { welcomeChannel.close(); } catch (e) { } }, 100);
                    }
                } catch (e) {
                    console.error("Error showing welcome modal:", e);
                    sessionStorage.setItem(welcomeModalSessionKey, 'true'); // Set flag anyway to prevent loops
                    if (welcomeChannel) try { welcomeChannel.close(); } catch (e) { }
                }
            }, 1500); // 1.5 second delay

            // Ensure session flag is set if user interacts with modal buttons/links
            welcomeModalElement.querySelectorAll('.modal-footer button, .modal-body a.btn').forEach(button => {
                button.addEventListener('click', () => {
                    sessionStorage.setItem(welcomeModalSessionKey, 'true');
                    if (welcomeChannel) { try { welcomeChannel.close(); } catch (e) { } } // Close channel on interaction
                });
            });
        } catch (e) {
            console.error("Error creating Bootstrap modal instance for Welcome Modal:", e);
            sessionStorage.setItem(welcomeModalSessionKey, 'true'); // Prevent retry loops
            if (welcomeChannel) try { welcomeChannel.close(); } catch (e) { }
        }
    };

    // --- Main Logic to Trigger Welcome Modal ---
    if (welcomeModalElement && !sessionStorage.getItem(welcomeModalSessionKey)) {
        // Check if BroadcastChannel API is supported
        if ('BroadcastChannel' in window) {
            try {
                welcomeChannel = new BroadcastChannel(welcomeChannelName);

                // Listen for messages from other tabs
                const messageListener = (event) => {
                    if (event.data === 'modal_shown' && !modalShownInThisTab) {
                        // Another tab showed the modal, set session flag and close channel
                        sessionStorage.setItem(welcomeModalSessionKey, 'true');
                        if (welcomeChannel) {
                            try {
                                welcomeChannel.removeEventListener('message', messageListener);
                                welcomeChannel.close();
                            } catch (e) { }
                        }
                    }
                };
                welcomeChannel.addEventListener('message', messageListener);

                // Wait briefly; if no message received, this tab will show the modal
                setTimeout(() => {
                    if (!sessionStorage.getItem(welcomeModalSessionKey)) {
                        showWelcomeModalAndNotify(); // Show modal and notify others
                    } else {
                        // Flag was set (either by another tab or race condition), clean up
                        if (welcomeChannel) {
                            try {
                                welcomeChannel.removeEventListener('message', messageListener);
                                welcomeChannel.close();
                            } catch (e) { }
                        }
                    }
                }, 150); // Short delay to allow other tabs to potentially show first

            } catch (e) {
                console.error("Error using BroadcastChannel:", e);
                showWelcomeModalAndNotify(); // Fallback to showing without coordination
            }
        } else {
            console.warn("BroadcastChannel API not supported. Falling back to simple session storage.");
            // Fallback for browsers without BroadcastChannel
            if (!sessionStorage.getItem(welcomeModalSessionKey)) {
                showWelcomeModalAndNotify();
            }
        }
    }


    console.log('%c💊 PaytonHealth Website Initialized (Using validate.js)', 'color: #1193d4; font-size: 16px; font-weight: bold;');

}); // End DOMContentLoaded