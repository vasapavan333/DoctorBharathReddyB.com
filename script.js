/**
 * Dr. [Name] - Orthopedic Doctor Website
 * Main JavaScript File
 * Handles navigation, forms, animations, and interactivity
 */

(function () {
    'use strict';

    // ===== Mobile Navigation Toggle =====
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function () {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');

            // Close menu when clicking outside
            document.addEventListener('click', function closeMenu(e) {
                if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                    document.removeEventListener('click', closeMenu);
                }
            });
        });

        // Close menu when clicking on nav links
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function () {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    // ===== Navbar Scroll Effect =====
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', function () {
        const currentScroll = window.pageYOffset;

        if (navbar) {
            if (currentScroll > 100) {
                navbar.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.15)';
            } else {
                navbar.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
            }
        }

        lastScroll = currentScroll;
    });

    // ===== Smooth Scrolling for Anchor Links =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href.length > 1) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const offsetTop = target.offsetTop - 80;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // ===== Animated Counter for Statistics =====
    function animateCounter(element, target, duration = 2000) {
        let current = 0;
        const increment = target / (duration / 16);
        const timer = setInterval(function () {
            current += increment;
            if (current >= target) {
                element.textContent = Math.floor(target);
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current);
            }
        }, 16);
    }

    // Intersection Observer for counter animation
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px'
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statNumbers = entry.target.querySelectorAll('.stat-number[data-target]');
                statNumbers.forEach(stat => {
                    const target = parseInt(stat.getAttribute('data-target'));
                    if (target && stat.textContent === '0') {
                        animateCounter(stat, target);
                    }
                });
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all sections with statistics
    document.querySelectorAll('.experience-section, .testimonials-stats-section').forEach(section => {
        if (section.querySelector('.stat-number[data-target]')) {
            observer.observe(section);
        }
    });

    // ===== Appointment Form Handling =====
    // ===== Appointment Form Handling =====
    const appointmentForm = document.getElementById('appointmentForm');
    const formMessage = document.getElementById('formMessage');

    if (appointmentForm) {
        // Set minimum date to today
        const dateInput = document.getElementById('preferredDate');
        if (dateInput) {
            const today = new Date();
            const formattedDate = today.toISOString().split('T')[0];
            dateInput.setAttribute('min', formattedDate);
        }

        // Form submission handler
        appointmentForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Get form data using the 'name' attributes from your HTML
            const formData = new FormData(appointmentForm);
            const data = Object.fromEntries(formData);

            // Basic validation using the 'name' attributes from your HTML
            if (!data["Full Name"] || !data["Phone Number"] || !data["Preferred Date"] || !data["Preferred Time"] || !data["Reason for Visit"]) {
                showFormMessage('Please fill in all required fields.', 'error');
                return;
            }

            // Phone number validation
            const phonePattern = /^[0-9]{10}$/;
            const cleanPhone = data["Phone Number"].replace(/[^0-9]/g, '');
            if (!phonePattern.test(cleanPhone)) {
                showFormMessage('Please enter a valid 10-digit phone number.', 'error');
                return;
            }

            // Email validation (if provided)
            if (data["Email Address"] && !isValidEmail(data["Email Address"])) {
                showFormMessage('Please enter a valid email address.', 'error');
                return;
            }

            // Date validation
            const selectedDate = new Date(data["Preferred Date"]);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (selectedDate < today) {
                showFormMessage('Please select a future date for your appointment.', 'error');
                return;
            }

            showFormMessage('Submitting your appointment request...', 'success');

            // Set submission timestamp
            const submittedAt = new Date().toLocaleString();

            fetch("https://sheetdb.io/api/v1/4qjluvzagia7u", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    data: {
                        "Full Name": data["Full Name"],
                        "Phone Number": data["Phone Number"],
                        "Email Address": data["Email Address"] || "",
                        "Preferred Date": data["Preferred Date"],
                        "Preferred Time": data["Preferred Time"],
                        "Reason for Visit": data["Reason for Visit"],
                        "Additional Information": data["Additional Information"] || "",
                        "Submitted At": submittedAt
                    }
                })
            })
                .then(response => response.json())
                .then(result => {
                    showFormMessage(
                        "Thank you! Your appointment has been booked successfully. We will contact you soon.",
                        "success"
                    );
                    appointmentForm.reset();
                    formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                })
                .catch(error => {
                    console.error(error);
                    showFormMessage("Error submitting appointment. Please try again.", "error");
                });
        });
    }

    // Helper function to show form messages
    function showFormMessage(message, type) {
        if (formMessage) {
            formMessage.textContent = message;
            formMessage.className = 'form-message ' + type;
            formMessage.style.display = 'block';

            // Auto-hide after 10 seconds for success messages
            if (type === 'success') {
                setTimeout(function () {
                    formMessage.style.display = 'none';
                }, 10000);
            }
        }
    }

    // Email validation helper
    function isValidEmail(email) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(email);
    }

    // ===== FAQ Accordion Functionality =====
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (question) {
            question.addEventListener('click', function () {
                // Close other open items
                faqItems.forEach(otherItem => {
                    if (otherItem !== item && otherItem.classList.contains('active')) {
                        otherItem.classList.remove('active');
                    }
                });

                // Toggle current item
                item.classList.toggle('active');
            });
        }
    });

    // ===== Language Toggle (Telugu/English) =====
    const langToggle = document.getElementById('langToggle');
    let currentLang = 'en';

    if (langToggle) {
        langToggle.addEventListener('click', function () {
            currentLang = currentLang === 'en' ? 'te' : 'en';

            if (currentLang === 'te') {
                // Switch to Telugu (placeholder - implement actual translation)
                langToggle.innerHTML = '<i class="fas fa-language"></i> English';
                showLanguageMessage('Telugu language support coming soon! తెలుగు మద్దతు త్వరలో వస్తుంది!');
            } else {
                // Switch to English
                langToggle.innerHTML = '<i class="fas fa-language"></i> తెలుగు';
                showLanguageMessage('Switched to English');
            }
        });
    }

    function showLanguageMessage(message) {
        // Create or update language notification
        let notification = document.getElementById('langNotification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'langNotification';
            notification.style.cssText = `
                position: fixed;
                top: 100px;
                right: 20px;
                background: #2563eb;
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                z-index: 10000;
                animation: slideIn 0.3s ease;
            `;
            document.body.appendChild(notification);
        }

        notification.textContent = message;
        notification.style.display = 'block';

        // Auto-hide after 3 seconds
        setTimeout(function () {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(function () {
                notification.style.display = 'none';
            }, 300);
        }, 3000);
    }

    // Add CSS animations for notification
    if (!document.getElementById('langNotificationStyles')) {
        const style = document.createElement('style');
        style.id = 'langNotificationStyles';
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(400px);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // ===== Phone Number Formatting =====
    const phoneInputs = document.querySelectorAll('input[type="tel"]');

    phoneInputs.forEach(input => {
        input.addEventListener('input', function (e) {
            // Remove all non-numeric characters
            let value = e.target.value.replace(/\D/g, '');

            // Limit to 10 digits
            if (value.length > 10) {
                value = value.slice(0, 10);
            }

            e.target.value = value;
        });



        // Clear formatting on focus for easier editing
        input.addEventListener('focus', function (e) {
            let value = e.target.value.replace(/\D/g, '');
            e.target.value = value;
        });
    });

    // ===== Scroll to Top Button (if needed) =====
    // This can be added if you want a scroll-to-top button
    function createScrollToTopButton() {
        const button = document.createElement('button');
        button.innerHTML = '<i class="fas fa-arrow-up"></i>';
        button.className = 'scroll-to-top';
        button.style.cssText = `
            position: fixed;
            bottom: 100px;
            right: 30px;
            width: 50px;
            height: 50px;
            background: #2563eb;
            color: white;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            display: none;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            z-index: 998;
            transition: all 0.3s ease;
        `;

        button.addEventListener('click', function () {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        window.addEventListener('scroll', function () {
            if (window.pageYOffset > 300) {
                button.style.display = 'flex';
            } else {
                button.style.display = 'none';
            }
        });

        button.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
        });

        button.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
        });

        document.body.appendChild(button);
    }

    // Uncomment to enable scroll-to-top button
    // createScrollToTopButton();

    // ===== Lazy Loading for Images (if any are added) =====
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    imageObserver.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    // ===== Active Navigation Link Highlighting =====
    function setActiveNavLink() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('.nav-menu a');

        navLinks.forEach(link => {
            const linkPage = link.getAttribute('href');
            if (linkPage === currentPage || (currentPage === '' && linkPage === 'index.html')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // Set active link on page load
    setActiveNavLink();

    // ===== Form Input Enhancement =====
    // Add focus/blur effects to form inputs
    const formInputs = document.querySelectorAll('input, select, textarea');

    formInputs.forEach(input => {
        input.addEventListener('focus', function () {
            this.parentElement.classList.add('focused');
        });

        input.addEventListener('blur', function () {
            if (!this.value) {
                this.parentElement.classList.remove('focused');
            }
        });

        // Check if input has value on page load
        if (input.value) {
            input.parentElement.classList.add('focused');
        }
    });

    // ===== Console Welcome Message =====
    console.log('%c👨‍⚕️ Dr. [Name] - Orthopedic Doctor Website', 'color: #2563eb; font-size: 16px; font-weight: bold;');
    console.log('%cExpert Orthopedic Care for Bones, Joints & Mobility', 'color: #10b981; font-size: 12px;');
    console.log('Website Version: 1.0.0 | Built with care for patient health');

    // ===== Performance Monitoring (Optional) =====
    window.addEventListener('load', function () {
        if ('performance' in window) {
            const perfData = window.performance.timing;
            const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
            console.log(`Page loaded in ${Math.round(pageLoadTime / 1000)}s`);
        }
    });

})();
