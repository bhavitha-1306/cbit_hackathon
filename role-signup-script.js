// ============================================
// ROLE-BASED SIGNUP PAGES - SHARED SCRIPT
// ============================================

// Password validation configuration
const PASSWORD_CONFIG = {
    MIN_LENGTH: 12,
    PATTERNS: {
        uppercase: /[A-Z]/,
        lowercase: /[a-z]/,
        numbers: /[0-9]/,
        special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/
    }
};

// Initialize form on page load
document.addEventListener('DOMContentLoaded', function() {
    setupFormHandlers();
    setupPasswordToggle();
    setupPasswordStrengthChecker();
});

// ============================================
// FORM SETUP & HANDLERS
// ============================================

function setupFormHandlers() {
    // Detect which form exists on the page
    const studentForm = document.getElementById('studentForm');
    const facultyForm = document.getElementById('facultyForm');
    const adminForm = document.getElementById('adminForm');

    let form = studentForm || facultyForm || adminForm;

    if (form) {
        form.addEventListener('submit', handleFormSubmit);
        setupFieldValidation(form);
    }
}

function setupFieldValidation(form) {
    const fields = form.querySelectorAll('input, select');

    fields.forEach(field => {
        // Real-time validation on blur
        field.addEventListener('blur', () => validateField(field));

        // Real-time validation on change for selects
        if (field.tagName === 'SELECT') {
            field.addEventListener('change', () => validateField(field));
        }

        // Real-time validation for checkboxes
        if (field.type === 'checkbox') {
            field.addEventListener('change', () => validateField(field));
        }
    });
}

function validateField(field) {
    const errorElement = document.getElementById(field.name + 'Error');
    let isValid = true;
    let errorMsg = '';

    // Validation rules by field type and name
    if (field.type === 'email') {
        isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim());
        errorMsg = 'Please enter a valid email address';
    } else if (field.name === 'rollNumber') {
        isValid = /^[A-Z0-9]{8,}$/.test(field.value.trim());
        errorMsg = 'Roll number must be 8+ alphanumeric characters';
    } else if (field.name === 'employeeId') {
        isValid = /^[A-Z0-9]{4,}$/.test(field.value.trim());
        errorMsg = 'Employee ID must be 4+ alphanumeric characters';
    } else if (field.name === 'fullName') {
        isValid = /^[a-zA-Z\s']{3,100}$/.test(field.value.trim()) && field.value.trim().split(' ').length >= 2;
        errorMsg = 'Please enter a valid full name (first and last name)';
    } else if (field.name === 'phone') {
        isValid = /^[0-9]{10}$/.test(field.value.trim());
        errorMsg = 'Phone number must be 10 digits';
    } else if (field.name === 'password') {
        isValid = validatePassword(field.value);
        errorMsg = `Password must be at least ${PASSWORD_CONFIG.MIN_LENGTH} characters with uppercase, lowercase, numbers, and special characters`;
    } else if (field.name === 'confirmPassword') {
        const passwordField = document.getElementById('password') || document.getElementById('confirmPassword');
        isValid = field.value === passwordField.value && field.value.length > 0;
        errorMsg = 'Passwords do not match';
    } else if (field.type === 'checkbox' && (field.name === 'terms' || field.name === 'security')) {
        isValid = field.checked;
        errorMsg = 'This field is required';
    } else if (field.value === '') {
        if (field.hasAttribute('required')) {
            isValid = false;
            errorMsg = 'This field is required';
        }
    }

    // Update field styling and error display
    if (!isValid && field.hasAttribute('required')) {
        field.classList.add('error');
        if (errorElement) {
            errorElement.textContent = errorMsg;
        }
    } else {
        field.classList.remove('error');
        if (errorElement) {
            errorElement.textContent = '';
        }
    }

    return isValid;
}

function validatePassword(password) {
    return password.length >= PASSWORD_CONFIG.MIN_LENGTH &&
           PASSWORD_CONFIG.PATTERNS.uppercase.test(password) &&
           PASSWORD_CONFIG.PATTERNS.lowercase.test(password) &&
           PASSWORD_CONFIG.PATTERNS.numbers.test(password) &&
           PASSWORD_CONFIG.PATTERNS.special.test(password);
}

// ============================================
// FORM SUBMISSION
// ============================================

async function handleFormSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const fields = form.querySelectorAll('input[required], select[required]');
    let allValid = true;

    // Validate all required fields
    fields.forEach(field => {
        if (!validateField(field)) {
            allValid = false;
        }
    });

    if (!allValid) {
        showAlert('alertMessage', 'Please fix the errors below', 'error');
        return;
    }

    // Validate checkboxes
    const termsCheckbox = form.querySelector('input[name="terms"]');
    const securityCheckbox = form.querySelector('input[name="security"]');

    if (termsCheckbox && !termsCheckbox.checked) {
        showAlert('alertMessage', 'You must agree to the Terms & Conditions', 'error');
        return;
    }

    if (securityCheckbox && !securityCheckbox.checked) {
        showAlert('alertMessage', 'You must acknowledge the security responsibilities', 'error');
        return;
    }

    // Submit form
    await submitForm(form);
}

async function submitForm(form) {
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const loader = submitBtn.querySelector('.btn-loader');

    try {
        // Disable button and show loader
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        loader.style.display = 'inline';

        // Collect form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        // Simulate API call (1-2 seconds)
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Log the submission
        logSecurityEvent('SIGNUP_FORM_SUBMITTED', {
            role: getRoleFromPagePath(),
            email: data.email,
            timestamp: new Date().toISOString()
        });

        // Show success message
        showAlert('alertMessage', '✅ Account created successfully! Redirecting to login...', 'success');

        // Store user data in localStorage (for demo purposes)
        storeUserData(data);

        // Redirect to login after 2 seconds
        setTimeout(() => {
            window.location.href = 'login.html?email=' + encodeURIComponent(data.email);
        }, 2000);

    } catch (error) {
        showAlert('alertMessage', '❌ Error creating account: ' + error.message, 'error');
        console.error('Form submission error:', error);
    } finally {
        // Re-enable button
        submitBtn.disabled = false;
        btnText.style.display = 'inline';
        loader.style.display = 'none';
    }
}

// ============================================
// PASSWORD VISIBILITY TOGGLE
// ============================================

function setupPasswordToggle() {
    const togglePassword = document.getElementById('togglePassword');
    const toggleConfirm = document.getElementById('toggleConfirm');

    if (togglePassword) {
        const passwordField = document.querySelector('input[name="password"]');
        togglePassword.addEventListener('click', (e) => {
            e.preventDefault();
            togglePasswordVisibility(passwordField, togglePassword);
        });
    }

    if (toggleConfirm) {
        const confirmField = document.querySelector('input[name="confirmPassword"]');
        toggleConfirm.addEventListener('click', (e) => {
            e.preventDefault();
            togglePasswordVisibility(confirmField, toggleConfirm);
        });
    }
}

function togglePasswordVisibility(field, button) {
    const type = field.type === 'password' ? 'text' : 'password';
    field.type = type;
    button.textContent = type === 'password' ? '👁️' : '👁️‍🗨️';
}

// ============================================
// PASSWORD STRENGTH CHECKER
// ============================================

function setupPasswordStrengthChecker() {
    const passwordField = document.querySelector('input[name="password"]');

    if (passwordField) {
        passwordField.addEventListener('input', () => {
            updatePasswordStrength(passwordField.value);
        });
    }
}

function updatePasswordStrength(password) {
    const strengthIndicator = document.getElementById('passwordStrength');

    if (!strengthIndicator) return;

    if (password.length === 0) {
        strengthIndicator.classList.remove('visible');
        return;
    }

    let strength = 0;

    if (password.length >= PASSWORD_CONFIG.MIN_LENGTH) strength++;
    if (PASSWORD_CONFIG.PATTERNS.uppercase.test(password)) strength++;
    if (PASSWORD_CONFIG.PATTERNS.lowercase.test(password)) strength++;
    if (PASSWORD_CONFIG.PATTERNS.numbers.test(password)) strength++;
    if (PASSWORD_CONFIG.PATTERNS.special.test(password)) strength++;

    strengthIndicator.classList.add('visible');

    if (strength <= 2) {
        strengthIndicator.textContent = '❌ Weak - Add more variety';
        strengthIndicator.className = 'password-strength weak visible';
    } else if (strength <= 3) {
        strengthIndicator.textContent = '⚠️ Medium - Could be stronger';
        strengthIndicator.className = 'password-strength medium visible';
    } else {
        strengthIndicator.textContent = '✅ Strong - Good password!';
        strengthIndicator.className = 'password-strength strong visible';
    }
}

// ============================================
// ALERTS
// ============================================

function showAlert(elementId, message, type = 'info') {
    const alert = document.getElementById(elementId);

    if (!alert) return;

    alert.textContent = message;
    alert.className = `alert alert-${type}`;
    alert.classList.remove('alert-hidden');

    // Auto-hide after 5 seconds
    setTimeout(() => {
        alert.classList.add('alert-hidden');
    }, 5000);
}

// ============================================
// SECURITY & LOGGING
// ============================================

function logSecurityEvent(eventType, details = {}) {
    const logEntry = {
        timestamp: new Date().toISOString(),
        eventType: eventType,
        details: details,
        page: window.location.pathname,
        userAgent: navigator.userAgent
    };

    let logs = JSON.parse(localStorage.getItem('security_logs') || '[]');
    logs.push(logEntry);

    // Keep only last 100 logs
    if (logs.length > 100) {
        logs = logs.slice(-100);
    }

    localStorage.setItem('security_logs', JSON.stringify(logs));
    console.log('Security Event:', logEntry);
}

function storeUserData(data) {
    let users = JSON.parse(localStorage.getItem('registered_users') || '[]');

    // Create user object
    const newUser = {
        id: generateId(),
        ...data,
        role: getRoleFromPagePath(),
        createdAt: new Date().toISOString(),
        verified: false
    };

    users.push(newUser);
    localStorage.setItem('registered_users', JSON.stringify(users));

    logSecurityEvent('USER_REGISTERED', {
        email: data.email,
        role: newUser.role
    });
}

function getRoleFromPagePath() {
    const path = window.location.pathname;
    if (path.includes('student')) return 'student';
    if (path.includes('faculty')) return 'faculty';
    if (path.includes('admin')) return 'admin';
    return 'unknown';
}

function generateId() {
    return 'user_' + Math.random().toString(36).substr(2, 9);
}

// ============================================
// PAGE INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.info('🔐 Role-Based Signup Page Loaded');
    console.info('✓ Form Validation Active');
    console.info('✓ Password Strength Meter Ready');
    console.info('✓ Security Logging Enabled');

    // Log page visit
    logSecurityEvent('SIGNUP_PAGE_VISITED', {
        role: getRoleFromPagePath(),
        timestamp: new Date().toISOString()
    });
});

// ============================================
// KEYBOARD NAVIGATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');

    if (form) {
        form.addEventListener('keydown', (e) => {
            // Submit on Ctrl+Enter
            if (e.ctrlKey && e.key === 'Enter') {
                form.dispatchEvent(new Event('submit'));
            }
        });
    }
});

// ============================================
// PREVENT AUTOCOMPLETE ABUSE
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const passwordFields = document.querySelectorAll('input[type="password"]');

    passwordFields.forEach(field => {
        field.addEventListener('keydown', (e) => {
            // Allow standard keyboard shortcuts
            if (e.ctrlKey || e.metaKey) {
                return;
            }
        });
    });
});
