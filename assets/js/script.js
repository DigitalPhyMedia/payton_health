/* ================================
   PaytonHealth - Central JavaScript
   ================================ */

document.addEventListener('DOMContentLoaded', function () {

    // ===== EMAILJS INITIALIZATION =====
    // IMPORTANT: Replace "YOUR_PUBLIC_KEY" with your actual EmailJS Public Key
    // You can find this in your EmailJS account under Account > API Keys
    // Example: emailjs.init("user_xxxxxxxxxxxxxxxxxxx");
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
                    updateCounter();
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
                // Insert after the button's parent div if it's in a grid, otherwise directly after button
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
                // Add a general invalid message if needed
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


            let originalButtonText = ''; // Define outside the if block
            if (submitButton) {
                submitButton.disabled = true;
                originalButtonText = submitButton.innerHTML; // Store original HTML
                submitButton.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Sending...`;
            }


            // Prepare parameters for EmailJS (Dynamically get all form fields)
            const formData = new FormData(form);
            const templateParams = {};
            formData.forEach((value, key) => {
                // You might need to adjust keys based on your EmailJS template naming
                templateParams[key.replace(/-/g, '_')] = value; // Replace hyphens globally if needed
            });

            // Add position if it's the apply modal (example)
            if (form.closest('#applyModal')) {
                const select = form.querySelector('#applyPositionSelect');
                if (select) templateParams['apply_position'] = select.value; // Adjust key name as needed
            }


            // --- Send email using EmailJS ---
            // IMPORTANT: Replace "YOUR_SERVICE_ID" and "YOUR_TEMPLATE_ID" below
            //            with your actual Service ID and Template ID from EmailJS.
            //            Find these in your EmailJS account under Email Services and Email Templates.
            const serviceID = "YOUR_SERVICE_ID"; // <<< REPLACE THIS
            const templateID = "YOUR_TEMPLATE_ID"; // <<< REPLACE THIS

            if (serviceID === "YOUR_SERVICE_ID" || templateID === "YOUR_TEMPLATE_ID") {
                console.warn("EmailJS Service ID or Template ID not set in script.js. Please replace placeholders.");
                // Simulate failure locally if keys aren't set
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.innerHTML = originalButtonText;
                }
                feedbackDiv.textContent = 'Email configuration missing. Please contact support.';
                feedbackDiv.className = 'form-feedback-message small mt-3 text-warning text-center';
                return; // Stop if not configured
            }


            emailjs.send(serviceID, templateID, templateParams)
                .then(function (response) {
                    console.log('EmailJS SUCCESS!', response.status, response.text);
                    feedbackDiv.textContent = 'Thank you! Your message has been sent successfully.';
                    feedbackDiv.className = 'form-feedback-message small mt-3 text-success text-center'; // Added text-center
                    form.reset(); // Clear the form
                    form.classList.remove('was-validated'); // Remove validation classes

                    // Hide modal if the form is inside one after a delay
                    const modal = form.closest('.modal');
                    if (modal) {
                        try {
                            const modalInstance = bootstrap.Modal.getInstance(modal);
                            if (modalInstance) {
                                setTimeout(() => modalInstance.hide(), 2500); // Hide after 2.5 seconds
                            }
                        } catch (e) {
                            console.error("Error getting modal instance:", e);
                        }
                    }

                }, function (error) {
                    console.error('EmailJS FAILED...', error);
                    feedbackDiv.textContent = 'Oops! Something went wrong. Please try again later or contact support.';
                    feedbackDiv.className = 'form-feedback-message small mt-3 text-danger text-center'; // Added text-center
                }).finally(function () {
                    // Re-enable button and restore text regardless of success/failure
                    if (submitButton) {
                        submitButton.disabled = false;
                        submitButton.innerHTML = originalButtonText; // Use the stored original HTML
                    }
                    // Optionally clear feedback message after a longer delay
                    setTimeout(() => {
                        // Clear message only if it was success to avoid hiding error messages too quickly
                        if (feedbackDiv.classList.contains('text-success')) {
                            feedbackDiv.textContent = '';
                            feedbackDiv.className = 'form-feedback-message small mt-3 text-center'; // Reset classes
                        }
                    }, 8000); // Clear after 8 seconds
                });
        });
    });


    // ===== CAREERS "APPLY NOW" MODAL LOGIC (Dropdown Population) =====
    const applyModal = document.getElementById('applyModal');
    if (applyModal) {
        // Use querySelectorAll to find all job titles on the page when the modal might be shown
        const getAvailablePositions = () => [
            ...document.querySelectorAll('.job-accordion:not(.d-none) .job-accordion-item .job-title')
        ].map(titleEl => titleEl.textContent.trim());

        applyModal.addEventListener('show.bs.modal', function (event) {
            const button = event.relatedTarget;
            const positionClicked = button ? button.getAttribute('data-position') : null;
            const positionSelect = applyModal.querySelector('#applyPositionSelect');
            const form = applyModal.querySelector('form');
            form.classList.remove('was-validated'); // Reset validation on show
            const feedback = form.querySelector('.form-feedback-message');
            if (feedback) feedback.textContent = ''; // Clear feedback on show


            if (positionSelect) {
                const availablePositions = getAvailablePositions(); // Get current positions
                positionSelect.innerHTML = ''; // Clear previous options

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

                // Select default if clicked position isn't available or none was clicked
                if (!positionClicked || !availablePositions.includes(positionClicked)) {
                    if (positionSelect.options.length > 0) { // Ensure defaultOption exists before selecting
                        defaultOption.selected = true;
                    }
                } else {
                    // Ensure the 'required' validation works correctly if a valid option is pre-selected
                    positionSelect.value = positionClicked;
                }
            }
        });

        applyModal.addEventListener('hidden.bs.modal', function () {
            // Optional: Reset form completely when modal is hidden
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

                    // Close all other active items
                    jobItems.forEach(otherItem => {
                        if (otherItem !== item && !otherItem.classList.contains('disabled')) {
                            otherItem.classList.remove('active');
                            const otherBody = otherItem.querySelector('.job-accordion-body');
                            if (otherBody) otherBody.style.maxHeight = null;
                        }
                    });

                    // Toggle the current item
                    item.classList.toggle('active');
                    body.style.maxHeight = item.classList.contains('active') ? body.scrollHeight + "px" : null;
                });
            }
        });
    }

    // ===== BACK TO TOP BUTTON =====
    const backToTop = document.createElement('button');
    backToTop.innerHTML = '<span class="material-symbols-outlined">arrow_upward</span>';
    // Add multiple classes for styling via CSS
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


    console.log('%c💊 PaytonHealth Website Initialized', 'color: #1193d4; font-size: 16px; font-weight: bold;');

}); // End DOMContentLoaded