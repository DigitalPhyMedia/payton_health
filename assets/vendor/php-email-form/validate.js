(function () {
    "use strict";

    let forms = document.querySelectorAll('.php-email-form');

    forms.forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            event.stopPropagation();

            let thisForm = this;

            const errorMessageDiv = thisForm.querySelector('.error-message');
            if (errorMessageDiv) {
                errorMessageDiv.classList.remove('d-block');
                errorMessageDiv.innerHTML = '';
            }
            thisForm.classList.remove('was-validated');

            if (thisForm.checkValidity() === false) {
                thisForm.classList.add('was-validated');
                return;
            }

            let action = thisForm.getAttribute('action');
            let recaptcha = thisForm.getAttribute('data-recaptcha-site-key');

            if (!action) {
                displayError(thisForm, 'The form action property is not set!');
                return;
            }

            const sentMessage = thisForm.querySelector('.sent-message');
            if (sentMessage) sentMessage.classList.remove('d-block');

            let formData = new FormData(thisForm);

            const submitButton = thisForm.querySelector('button[type="submit"]');
            let originalButtonHTML = '';
            if (submitButton) {
                originalButtonHTML = submitButton.innerHTML;
                submitButton.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Sending...`;
                submitButton.disabled = true;
            }

            if (recaptcha) {
                if (typeof grecaptcha !== "undefined") {
                    grecaptcha.ready(function () {
                        try {
                            grecaptcha.execute(recaptcha, { action: 'php_email_form_submit' })
                                .then(token => {
                                    formData.set('recaptcha-response', token);
                                    php_email_form_submit(thisForm, action, formData, submitButton, originalButtonHTML);
                                })
                                .catch(error => {
                                    displayError(thisForm, 'reCAPTCHA execution failed: ' + error);
                                    restoreButton(submitButton, originalButtonHTML);
                                });
                        } catch (error) {
                            displayError(thisForm, error);
                            restoreButton(submitButton, originalButtonHTML);
                        }
                    });
                } else {
                    displayError(thisForm, 'The reCaptcha javascript API url is not loaded!');
                    restoreButton(submitButton, originalButtonHTML);
                }
            } else {
                php_email_form_submit(thisForm, action, formData, submitButton, originalButtonHTML);
            }
        });
    });

    function php_email_form_submit(thisForm, action, formData, submitButton, originalButtonHTML) {
        fetch(action, {
            method: 'POST',
            body: formData,
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        })
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => {
                        if (response.status === 405) {
                            throw new Error(`Error 405: Method Not Allowed. Check server configuration for ${action}.`);
                        }
                        throw new Error(`Server responded with ${response.status}: ${text || response.statusText}`);
                    });
                }
                return response.text();
            })
            .then(data => {
                if (data.trim().toUpperCase() == 'OK') {
                    thisForm.querySelector('.sent-message').classList.add('d-block');
                    thisForm.reset();
                    thisForm.classList.remove('was-validated');

                    const modal = thisForm.closest('.modal');
                    if (modal) {
                        try {
                            const modalInstance = bootstrap.Modal.getInstance(modal);
                            if (modalInstance) {
                                setTimeout(() => modalInstance.hide(), 2500);
                            }
                        } catch (e) { console.error("Error hiding modal:", e); }
                    }

                    setTimeout(() => {
                        const sentMessage = thisForm.querySelector('.sent-message');
                        if (sentMessage && sentMessage.classList.contains('d-block')) {
                            sentMessage.classList.remove('d-block');
                        }
                    }, 8000);

                } else {
                    throw new Error(data ? data : 'Form submission failed and no error message returned from: ' + action);
                }
            })
            .catch((error) => {
                displayError(thisForm, error);
            })
            .finally(() => {
                restoreButton(submitButton, originalButtonHTML);
            });
    }

    function displayError(thisForm, error) {
        const errorMessage = thisForm.querySelector('.error-message');
        if (errorMessage) {
            const errorText = (typeof error === 'object' && error.message) ? error.message : error;
            errorMessage.innerHTML = errorText;
            errorMessage.classList.add('d-block');
        } else {
            console.error("Error display element (.error-message) missing in form:", error);
            alert("An error occurred: " + ((typeof error === 'object' && error.message) ? error.message : error));
        }
    }

    function restoreButton(submitButton, originalHTML) {
        if (submitButton) {
            submitButton.innerHTML = originalHTML;
            submitButton.disabled = false;
        }
    }

})();
