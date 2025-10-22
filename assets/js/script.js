/* ================================
   PaytonHealth - Central JavaScript
   ================================ */

document.addEventListener('DOMContentLoaded', function () {

    // ===== EMAILJS INITIALIZATION =====
    // IMPORTANT: Replace "YOUR_PUBLIC_KEY" with your actual EmailJS Public Key.
    //            Find this in your EmailJS account under Account > API Keys.
    // Example: emailjs.init("user_xxxxxxxxxxxxxxxxxxx");
    // UNCOMMENT AND ADD YOUR KEY BELOW:
    // emailjs.init("YOUR_PUBLIC_KEY");


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
                // Dynamically get header height if possible, fallback to 120
                const headerHeight = document.querySelector('.main-header')?.offsetHeight || 120;
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

    // ===== ENHANCED FORM VALIDATION & SUBMISSION (EMAILJS INTEGRATION) =====
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function (e) {
            e.preventDefault(); // Prevent default submission first

            const submitButton = form.querySelector('button[type="submit"]');
            let feedbackDiv = form.querySelector('.form-feedback-message');

            // Ensure feedback div exists
            if (!feedbackDiv) {
                feedbackDiv = document.createElement('div');
                feedbackDiv.className = 'form-feedback-message small mt-3 text-center'; // Added text-center
                const parentContainer = submitButton.closest('.d-grid') || submitButton.parentNode;
                parentContainer.parentNode.insertBefore(feedbackDiv, parentContainer.nextSibling);
            }

            // Clear previous messages
            feedbackDiv.textContent = '';
            feedbackDiv.className = 'form-feedback-message small mt-3 text-center'; // Reset classes
            form.classList.remove('was-validated'); // Reset validation state initially

            // Perform Bootstrap validation
            if (form.checkValidity() === false) {
                e.stopPropagation(); // Stop further event propagation if invalid
                form.classList.add('was-validated'); // Show Bootstrap feedback
                feedbackDiv.textContent = 'Please fill out all required fields correctly.';
                feedbackDiv.className = 'form-feedback-message small mt-3 text-danger text-center';
                return; // Stop processing if form is invalid
            }

            // --- Form is valid, proceed with EmailJS ---
            // Check if EmailJS is initialized
            if (typeof emailjs === 'undefined' || typeof emailjs.init !== 'function') {
                console.error("EmailJS SDK not loaded or initialized. Make sure you have included the SDK and called emailjs.init('YOUR_PUBLIC_KEY');");
                feedbackDiv.textContent = 'Email service is not configured. Please contact support.';
                feedbackDiv.className = 'form-feedback-message small mt-3 text-warning text-center';
                if (submitButton) submitButton.disabled = false; // Re-enable button
                return;
            }

            let originalButtonText = '';
            if (submitButton) {
                submitButton.disabled = true;
                originalButtonText = submitButton.innerHTML;
                submitButton.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Sending...`;
            }

            // --- Send email using EmailJS ---
            // IMPORTANT: Replace "YOUR_SERVICE_ID" and the appropriate "YOUR_TEMPLATE_ID_..." below
            //            with your actual Service ID and Template IDs from EmailJS.
            const serviceID = "YOUR_SERVICE_ID"; // <<< REPLACE THIS

            // Determine Template ID based on form context
            let templateID = "YOUR_TEMPLATE_ID_GENERAL"; // <<< REPLACE Default/Contact Template ID
            const formParentModalId = form.closest('.modal')?.id;
            const formOnContactPage = form.closest('.page-contact') && !formParentModalId; // Check if it's the main contact form

            if (formParentModalId === 'applyModal') {
                templateID = "YOUR_TEMPLATE_ID_APPLICATION"; // <<< REPLACE Application Template ID
                // EmailJS handles file uploads automatically if the input name matches the attachment parameter in your template settings. Ensure your <input type="file"> has a 'name' attribute (e.g., name="resume").
            } else if (formParentModalId === 'consultationModal' || form.closest('.hero-form-bg')) {
                templateID = "YOUR_TEMPLATE_ID_LEAD"; // <<< REPLACE Lead/Consultation Template ID (if different from general)
            } else if (formOnContactPage) {
                // Keep default or set specific contact template ID if needed
                templateID = "YOUR_TEMPLATE_ID_CONTACT"; // <<< REPLACE Contact Page Template ID (if different from general)
            }

            // Check if placeholders are still present
            if (serviceID === "YOUR_SERVICE_ID" || templateID.startsWith("YOUR_TEMPLATE_ID")) {
                console.warn(`EmailJS Service ID or Template ID (${templateID}) not set in script.js. Please replace placeholders.`);
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.innerHTML = originalButtonText;
                }
                feedbackDiv.textContent = 'Email configuration missing. Please contact support.';
                feedbackDiv.className = 'form-feedback-message small mt-3 text-warning text-center';
                return; // Stop if not configured
            }

            // Send using the determined serviceID and templateID
            // EmailJS Browser SDK v3 uses sendForm() which takes the form element directly
            emailjs.sendForm(serviceID, templateID, form)
                .then(function (response) {
                    console.log('EmailJS SUCCESS!', response.status, response.text);
                    let successMessage = 'Thank you! Your message has been sent successfully.';
                    if (templateID === "YOUR_TEMPLATE_ID_APPLICATION") { // Check using the *actual* ID you set
                        successMessage = 'Thank you! Your application has been submitted successfully.';
                    }
                    feedbackDiv.textContent = successMessage;
                    feedbackDiv.className = 'form-feedback-message small mt-3 text-success text-center';
                    form.reset();
                    form.classList.remove('was-validated');

                    const modal = form.closest('.modal');
                    if (modal) {
                        try {
                            const modalInstance = bootstrap.Modal.getInstance(modal);
                            if (modalInstance) {
                                setTimeout(() => modalInstance.hide(), 2500);
                            }
                        } catch (e) {
                            console.error("Error getting modal instance:", e);
                        }
                    }

                }, function (error) {
                    console.error('EmailJS FAILED...', error);
                    let errorMessage = 'Oops! Something went wrong. Please try again later or contact support.';
                    if (templateID === "YOUR_TEMPLATE_ID_APPLICATION") { // Check using the *actual* ID you set
                        errorMessage = 'Oops! There was an error submitting your application. Please try again or contact us.';
                    }
                    feedbackDiv.textContent = errorMessage;
                    feedbackDiv.className = 'form-feedback-message small mt-3 text-danger text-center';
                }).finally(function () {
                    if (submitButton) {
                        submitButton.disabled = false;
                        submitButton.innerHTML = originalButtonText;
                    }
                    setTimeout(() => {
                        if (feedbackDiv.classList.contains('text-success')) {
                            feedbackDiv.textContent = '';
                            feedbackDiv.className = 'form-feedback-message small mt-3 text-center';
                        }
                    }, 8000);
                });
        });
    });

    // ===== CAREERS "APPLY NOW" MODAL LOGIC (Dropdown Population) =====
    const applyModal = document.getElementById('applyModal');
    if (applyModal) {
        const getAvailablePositions = () => [
            ...document.querySelectorAll('.job-accordion:not(.d-none) .job-accordion-item .job-title')
        ].map(titleEl => titleEl.textContent.trim());

        applyModal.addEventListener('show.bs.modal', function (event) {
            const button = event.relatedTarget;
            const positionClicked = button ? button.getAttribute('data-position') : null;
            const positionSelect = applyModal.querySelector('#applyPositionSelect');
            const form = applyModal.querySelector('form');
            form.classList.remove('was-validated');
            const feedback = form.querySelector('.form-feedback-message');
            if (feedback) feedback.textContent = '';


            if (positionSelect) {
                const availablePositions = getAvailablePositions();
                positionSelect.innerHTML = '';

                const defaultOption = document.createElement('option');
                defaultOption.value = "";
                defaultOption.textContent = "Select Position";
                defaultOption.disabled = true;
                positionSelect.appendChild(defaultOption);

                availablePositions.forEach(pos => {
                    const option = document.createElement('option');
                    option.value = pos;
                    option.textContent = pos;
                    if (pos === positionClicked) {
                        option.selected = true;
                    }
                    positionSelect.appendChild(option);
                });

                if (!positionClicked || !availablePositions.includes(positionClicked)) {
                    if (positionSelect.options.length > 0) {
                        defaultOption.selected = true;
                    }
                } else {
                    positionSelect.value = positionClicked;
                }
            }
        });

        applyModal.addEventListener('hidden.bs.modal', function () {
            const form = applyModal.querySelector('form');
            if (form) {
                form.reset();
                form.classList.remove('was-validated');
                const feedback = form.querySelector('.form-feedback-message');
                if (feedback) feedback.textContent = '';
            }
        });
    }

    // ===== CAREERS PAGE ACCORDION TOGGLE =====
    const jobItems = document.querySelectorAll('.job-accordion-item');
    if (jobItems.length > 0) {
        jobItems.forEach(item => {
            const header = item.querySelector('.job-accordion-header');
            const body = item.querySelector('.job-accordion-body');

            if (header && body && !item.classList.contains('disabled')) {
                header.addEventListener('click', function () {
                    const isActive = item.classList.contains('active');

                    jobItems.forEach(otherItem => {
                        if (otherItem !== item && !otherItem.classList.contains('disabled')) {
                            otherItem.classList.remove('active');
                            const otherBody = otherItem.querySelector('.job-accordion-body');
                            if (otherBody) otherBody.style.maxHeight = null;
                        }
                    });

                    item.classList.toggle('active');
                    body.style.maxHeight = item.classList.contains('active') ? body.scrollHeight + "px" : null;
                });
            }
        });
    }

    // ===== BACK TO TOP BUTTON =====
    const backToTop = document.createElement('button');
    backToTop.innerHTML = '<span class="material-symbols-outlined">arrow_upward</span>';
    backToTop.className = 'btn btn-primary rounded-circle position-fixed bottom-0 end-0 m-3 m-lg-4 p-0 d-flex align-items-center justify-content-center back-to-top-btn';
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

    // ===== WELCOME MODAL FOR BROWSER INSTANCE (Broadcast Channel) =====
    const welcomeModalElement = document.getElementById('welcomeModal');
    const welcomeModalSessionKey = 'paytonHealthWelcomeModalShown_Session'; // Key for sessionStorage
    const welcomeChannelName = 'payton_welcome_modal_channel';
    let welcomeChannel = null;
    let modalShownInThisTab = false; // Flag specific to the current tab

    // Function to show the modal and notify other tabs
    const showWelcomeModalAndNotify = () => {
        if (!welcomeModalElement || modalShownInThisTab || sessionStorage.getItem(welcomeModalSessionKey)) {
            if (welcomeChannel) {
                try { welcomeChannel.close(); } catch (e) { } // Close channel if modal shouldn't show
            }
            return; // Don't show if already shown in this tab/session or element missing
        }

        const welcomeModal = new bootstrap.Modal(welcomeModalElement);

        // Show the modal
        setTimeout(() => {
            try {
                welcomeModal.show();
                modalShownInThisTab = true; // Mark as shown in this specific tab instance
                sessionStorage.setItem(welcomeModalSessionKey, 'true'); // Mark session storage

                // Notify other tabs that the modal has been shown
                if (welcomeChannel) {
                    welcomeChannel.postMessage('modal_shown');
                    // console.log("Broadcast: modal_shown"); // For debugging
                    // Close the channel after broadcasting confirmation
                    setTimeout(() => { try { welcomeChannel.close(); } catch (e) { } }, 100);
                }
            } catch (e) {
                console.error("Error showing welcome modal:", e);
                sessionStorage.setItem(welcomeModalSessionKey, 'true'); // Set flag anyway to prevent loops
            }
        }, 1500); // Show delay

        // Add event listener to ensure flag is set if dismissed via button
        welcomeModalElement.querySelectorAll('.modal-footer button, .modal-body a.btn').forEach(button => {
            button.addEventListener('click', () => {
                sessionStorage.setItem(welcomeModalSessionKey, 'true'); // Re-ensure flag on close/action
                if (welcomeChannel) {
                    try { welcomeChannel.close(); } catch (e) { } // Close channel on interaction
                }
            });
        });
    };

    // --- Main Logic for Welcome Modal ---
    if (welcomeModalElement && !sessionStorage.getItem(welcomeModalSessionKey)) {
        // Check if BroadcastChannel is supported
        if ('BroadcastChannel' in window) {
            try {
                welcomeChannel = new BroadcastChannel(welcomeChannelName);
                // console.log("Channel created/joined"); // For debugging

                // Listener ref - needed to remove listener properly
                const messageListener = (event) => {
                    // console.log("Message received:", event.data); // For debugging
                    if (event.data === 'modal_shown' && !modalShownInThisTab) {
                        sessionStorage.setItem(welcomeModalSessionKey, 'true');
                        // console.log("Flag set by broadcast, closing channel"); // For debugging
                        if (welcomeChannel) {
                            try {
                                welcomeChannel.removeEventListener('message', messageListener); // Remove listener
                                welcomeChannel.close();
                            } catch (e) { }
                        }
                    }
                };

                welcomeChannel.addEventListener('message', messageListener);


                // console.log("Broadcasting: checking_modal"); // For debugging
                // Ask others (optional, relying on timeout and 'modal_shown' is often enough)
                // welcomeChannel.postMessage('checking_modal');

                // Set a short timeout. If no 'modal_shown' message is received, show the modal.
                setTimeout(() => {
                    if (!sessionStorage.getItem(welcomeModalSessionKey)) {
                        // console.log("Timeout: No message received, showing modal now."); // For debugging
                        showWelcomeModalAndNotify(); // This function will also close the channel
                    } else {
                        // console.log("Timeout: Flag was set during wait, closing channel."); // For debugging
                        if (welcomeChannel) {
                            try {
                                welcomeChannel.removeEventListener('message', messageListener); // Cleanup listener
                                welcomeChannel.close();
                            } catch (e) { }
                        }
                    }
                }, 150); // Wait 150ms

            } catch (e) {
                console.error("Error using BroadcastChannel:", e);
                // Fallback: Show modal, might appear in multiple tabs on initial load race condition
                showWelcomeModalAndNotify();
            }
        } else {
            console.warn("BroadcastChannel API not supported. Falling back to simple session storage.");
            // Fallback for older browsers: just use the session storage logic
            if (welcomeModalElement && !sessionStorage.getItem(welcomeModalSessionKey)) {
                const welcomeModal = new bootstrap.Modal(welcomeModalElement);
                setTimeout(() => {
                    try {
                        welcomeModal.show();
                        sessionStorage.setItem(welcomeModalSessionKey, 'true');
                    } catch (e) {
                        console.error("Error showing welcome modal (fallback):", e);
                        sessionStorage.setItem(welcomeModalSessionKey, 'true'); // Set flag anyway
                    }
                }, 1500);
                welcomeModalElement.querySelectorAll('.modal-footer button, .modal-body a.btn').forEach(button => {
                    button.addEventListener('click', () => {
                        sessionStorage.setItem(welcomeModalSessionKey, 'true');
                    });
                });
            }
        }
    }


    console.log('%c💊 PaytonHealth Website Initialized', 'color: #1193d4; font-size: 16px; font-weight: bold;');

}); // End DOMContentLoaded