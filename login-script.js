// ============================================
// LOGIN PAGE - SCRIPT
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.getElementById('togglePassword');

    // Real-time validation
    emailInput.addEventListener('blur', () => validateEmail(emailInput.value));
    passwordInput.addEventListener('blur', () => validatePassword(passwordInput.value));

    // Toggle password visibility
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const type = passwordInput.type === 'password' ? 'text' : 'password';
            passwordInput.type = type;
            togglePasswordBtn.textContent = type === 'password' ? '👁️' : '👁️‍🗨️';
        });
    }

    // Form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validate fields
        const emailValid = validateEmail(emailInput.value);
        const passwordValid = validatePassword(passwordInput.value);

        if (!emailValid || !passwordValid) {
            showAlert('alertMessage', 'Please fix the errors below', 'error');
            return;
        }

        // Submit login
        await submitLogin(emailInput.value, passwordInput.value);
    });

    // Log page visit
    logSecurityEvent('LOGIN_PAGE_VISITED', {
        timestamp: new Date().toISOString()
    });
});

// ============================================
// VALIDATION
// ============================================

function validateEmail(value) {
    const errorElement = document.getElementById('emailError');
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || /^[A-Z0-9]{8,}$/.test(value);

    if (!isValid && value.trim()) {
        errorElement.textContent = 'Enter a valid email or roll number';
    } else {
        errorElement.textContent = '';
    }

    return isValid || value.trim() === '';
}

function validatePassword(value) {
    const errorElement = document.getElementById('passwordError');
    const isValid = value.length >= 3;

    if (!isValid && value.trim()) {
        errorElement.textContent = 'Password is required';
    } else {
        errorElement.textContent = '';
    }

    return isValid || value.trim() === '';
}

// ============================================
// LOGIN SUBMISSION
// ============================================

async function submitLogin(email, password) {
    const loginBtn = document.getElementById('loginBtn');
    const btnText = loginBtn.querySelector('.btn-text');
    const loader = loginBtn.querySelector('.btn-loader');

    try {
        loginBtn.disabled = true;
        btnText.style.display = 'none';
        loader.style.display = 'inline';

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Mock authentication - check against registered users
        const users = JSON.parse(localStorage.getItem('registered_users') || '[]');
        const user = users.find(u => u.email === email);

        if (user && user.password === password) {
            // Login successful
            logSecurityEvent('LOGIN_SUCCESS', {
                email: email,
                role: user.role,
                timestamp: new Date().toISOString()
            });

            showAlert('alertMessage', '✅ Login successful! Redirecting...', 'success');

            // Store session and student data
            sessionStorage.setItem('user_authenticated', 'true');
            sessionStorage.setItem('user_email', email);
            sessionStorage.setItem('user_role', user.role);
            sessionStorage.setItem('login_time', new Date().toISOString());
            
            // Store student data in localStorage for dashboard
            const studentData = {
                name: user.name || 'Student',
                roll: user.roll || 'N/A',
                email: email,
                role: user.role
            };
            localStorage.setItem('studentData', JSON.stringify(studentData));

            // Redirect to student dashboard
            setTimeout(() => {
                window.location.href = 'student-dashboard.html';
            }, 1500);
        } else {
            // Login failed
            logSecurityEvent('LOGIN_FAILED', {
                email: email,
                timestamp: new Date().toISOString(),
                reason: 'Invalid credentials'
            });

            showAlert('alertMessage', '❌ Invalid email or password', 'error');
        }
    } catch (error) {
        showAlert('alertMessage', '❌ Error during login: ' + error.message, 'error');
        console.error('Login error:', error);
    } finally {
        loginBtn.disabled = false;
        btnText.style.display = 'inline';
        loader.style.display = 'none';
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
// SECURITY LOGGING
// ============================================

function logSecurityEvent(eventType, details = {}) {
    const logEntry = {
        timestamp: new Date().toISOString(),
        eventType: eventType,
        details: details,
        page: 'login',
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

// ============================================
// PRE-FILL EMAIL FROM REGISTRATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    const email = params.get('email');

    if (email) {
        document.getElementById('email').value = decodeURIComponent(email);
        document.getElementById('password').focus();
    }

    console.info('🔐 Login Page Loaded');
    console.info('✓ Security Logging Active');
    console.info('✓ Form Validation Ready');
});
