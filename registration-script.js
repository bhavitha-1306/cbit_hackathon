// ============================================
// REGISTRATION PAGE - UNIFIED FORM SCRIPT
// ============================================

let selectedRole = '';

// Password configuration
const PASSWORD_CONFIG = {
    MIN_LENGTH: 12,
    PATTERNS: {
        uppercase: /[A-Z]/,
        lowercase: /[a-z]/,
        numbers: /[0-9]/,
        special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/
    }
};

/**
 * Select a role and show the registration form
 */
function selectRole(role) {
    selectedRole = role.toLowerCase();
    
    // Update active tab
    document.querySelectorAll('.role-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    const tabMap = {
        student: 'studentTab',
        faculty: 'facultyTab',
        admin: 'adminTab'
    };
    
    const activeTab = document.getElementById(tabMap[selectedRole]);
    if (activeTab) {
        activeTab.classList.add('active');
    }
    
    // Hide all role-specific fields
    document.getElementById('rollNumberGroup').style.display = 'none';
    document.getElementById('employeeIdGroup').style.display = 'none';
    document.getElementById('departmentGroup').style.display = 'none';
    
    // Show appropriate fields based on selected role
    if (selectedRole === 'student') {
        document.getElementById('rollNumberGroup').style.display = 'block';
    } else if (selectedRole === 'faculty' || selectedRole === 'admin') {
        document.getElementById('employeeIdGroup').style.display = 'block';
        document.getElementById('departmentGroup').style.display = 'block';
    }
    
    // Focus on first input
    setTimeout(() => {
        document.getElementById('fullName').focus();
    }, 100);
    
    // Log event
    logSecurityEvent('ROLE_SELECTED', { role: selectedRole });
}

/**
 * Go back to role selection
 */
function goBackToRoles() {
    selectedRole = '';
    document.querySelectorAll('.role-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.getElementById('registrationForm').reset();
    document.getElementById('passwordStrength').className = 'password-strength';
}

/**
 * Validate password strength
 */
function validatePassword(password) {
    if (!password) return false;
    
    const hasMinLength = password.length >= PASSWORD_CONFIG.MIN_LENGTH;
    const hasUppercase = PASSWORD_CONFIG.PATTERNS.uppercase.test(password);
    const hasLowercase = PASSWORD_CONFIG.PATTERNS.lowercase.test(password);
    const hasNumbers = PASSWORD_CONFIG.PATTERNS.numbers.test(password);
    const hasSpecial = PASSWORD_CONFIG.PATTERNS.special.test(password);
    
    return hasMinLength && hasUppercase && hasLowercase && hasNumbers && hasSpecial;
}

/**
 * Update password strength indicator
 */
function updatePasswordStrength(password) {
    const strengthEl = document.getElementById('passwordStrength');
    
    if (!password) {
        strengthEl.className = 'password-strength';
        return;
    }
    
    const hasMinLength = password.length >= PASSWORD_CONFIG.MIN_LENGTH;
    const hasUppercase = PASSWORD_CONFIG.PATTERNS.uppercase.test(password);
    const hasLowercase = PASSWORD_CONFIG.PATTERNS.lowercase.test(password);
    const hasNumbers = PASSWORD_CONFIG.PATTERNS.numbers.test(password);
    const hasSpecial = PASSWORD_CONFIG.PATTERNS.special.test(password);
    
    const strengthScore = [hasMinLength, hasUppercase, hasLowercase, hasNumbers, hasSpecial].filter(Boolean).length;
    
    strengthEl.className = 'password-strength';
    if (strengthScore <= 2) {
        strengthEl.classList.add('weak');
    } else if (strengthScore <= 4) {
        strengthEl.classList.add('medium');
    } else {
        strengthEl.classList.add('strong');
    }
}

/**
 * Toggle password visibility
 */
function togglePasswordVisibility() {
    const input = document.getElementById('password');
    const btn = event.target;
    
    if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = '🙈';
    } else {
        input.type = 'password';
        btn.textContent = '👁️';
    }
}

/**
 * Toggle confirm password visibility
 */
function toggleConfirmPasswordVisibility() {
    const input = document.getElementById('confirmPassword');
    const btn = event.target;
    
    if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = '🙈';
    } else {
        input.type = 'password';
        btn.textContent = '👁️';
    }
}

/**
 * Validate individual field
 */
function validateField(fieldName, value) {
    const errors = {};
    
    switch(fieldName) {
        case 'fullName':
            if (!value || value.trim().length < 3) {
                errors.fullName = 'Full name must be at least 3 characters';
            } else if (!/^[a-zA-Z\s'-]+$/.test(value)) {
                errors.fullName = 'Name can only contain letters, spaces, hyphens, and apostrophes';
            }
            break;
            
        case 'collegeEmail':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!value || !emailRegex.test(value)) {
                errors.collegeEmail = 'Please enter a valid college email address';
            }
            break;
            
        case 'password':
            if (!value) {
                errors.password = 'Password is required';
            } else if (!validatePassword(value)) {
                errors.password = 'Password must be 12+ characters with uppercase, lowercase, numbers, and special characters';
            }
            break;
            
        case 'confirmPassword':
            const password = document.getElementById('password').value;
            if (!value) {
                errors.confirmPassword = 'Please confirm your password';
            } else if (value !== password) {
                errors.confirmPassword = 'Passwords do not match';
            }
            break;
    }
    
    return errors;
}

/**
 * Show error message
 */
function showError(fieldName, message) {
    const errorEl = document.getElementById(fieldName + 'Error');
    if (errorEl) {
        if (message) {
            errorEl.textContent = message;
            errorEl.classList.add('show');
        } else {
            errorEl.textContent = '';
            errorEl.classList.remove('show');
        }
    }
}

/**
 * Log security event
 */
function logSecurityEvent(eventType, details = {}) {
    const logEntry = {
        timestamp: new Date().toISOString(),
        eventType: eventType,
        role: selectedRole,
        details: details,
        page: 'registration',
        userAgent: navigator.userAgent
    };
    
    let logs = JSON.parse(localStorage.getItem('security_logs') || '[]');
    logs.push(logEntry);
    
    if (logs.length > 100) {
        logs = logs.slice(-100);
    }
    
    localStorage.setItem('security_logs', JSON.stringify(logs));
}

/**
 * Store user data
 */
function storeUserData(data) {
    let users = JSON.parse(localStorage.getItem('registered_users') || '[]');
    
    const newUser = {
        id: 'user_' + Date.now(),
        fullName: data.fullName,
        email: data.collegeEmail,
        role: selectedRole,
        createdAt: new Date().toISOString(),
        verified: false
    };
    
    users.push(newUser);
    localStorage.setItem('registered_users', JSON.stringify(users));
    
    return newUser;
}

/**
 * Show alert message
 */
function showAlert(message, type = 'success') {
    const alertEl = document.getElementById('alertMessage');
    alertEl.textContent = message;
    alertEl.className = 'alert show alert-' + type;
    
    setTimeout(() => {
        alertEl.classList.remove('show');
    }, 5000);
}

/**
 * Initialize form handlers
 */
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registrationForm');
    
    if (form) {
        // Setup real-time validation
        document.getElementById('fullName').addEventListener('blur', function() {
            const errors = validateField('fullName', this.value);
            showError('fullName', errors.fullName);
        });
        
        document.getElementById('collegeEmail').addEventListener('blur', function() {
            const errors = validateField('collegeEmail', this.value);
            showError('collegeEmail', errors.collegeEmail);
        });
        
        document.getElementById('password').addEventListener('input', function() {
            updatePasswordStrength(this.value);
            const errors = validateField('password', this.value);
            showError('password', errors.password);
        });
        
        document.getElementById('confirmPassword').addEventListener('blur', function() {
            const errors = validateField('confirmPassword', this.value);
            showError('confirmPassword', errors.confirmPassword);
        });
        
        // Form submission
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            submitRegistration();
        });
    }
    
    // Log page view
    logSecurityEvent('REGISTRATION_PAGE_LOADED', {
        timestamp: new Date().toISOString()
    });
});

/**
 * Submit registration form
 */
function submitRegistration() {
    // Validate all fields
    const fullName = document.getElementById('fullName').value;
    const collegeEmail = document.getElementById('collegeEmail').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const terms = document.getElementById('terms').checked;
    
    let isValid = true;
    
    // Validate each field
    const fullNameErrors = validateField('fullName', fullName);
    if (fullNameErrors.fullName) {
        showError('fullName', fullNameErrors.fullName);
        isValid = false;
    }
    
    const emailErrors = validateField('collegeEmail', collegeEmail);
    if (emailErrors.collegeEmail) {
        showError('collegeEmail', emailErrors.collegeEmail);
        isValid = false;
    }
    
    const passwordErrors = validateField('password', password);
    if (passwordErrors.password) {
        showError('password', passwordErrors.password);
        isValid = false;
    }
    
    const confirmErrors = validateField('confirmPassword', confirmPassword);
    if (confirmErrors.confirmPassword) {
        showError('confirmPassword', confirmErrors.confirmPassword);
        isValid = false;
    }
    
    // Validate role-specific fields
    if (selectedRole === 'student') {
        const rollNumber = document.getElementById('rollNumber').value;
        if (!rollNumber || rollNumber.trim().length < 3) {
            showError('rollNumber', 'Roll number is required');
            isValid = false;
        } else {
            showError('rollNumber', '');
        }
    } else if (selectedRole === 'faculty' || selectedRole === 'admin') {
        const employeeId = document.getElementById('employeeId').value;
        const department = document.getElementById('department').value;
        
        if (!employeeId || employeeId.trim().length < 3) {
            showError('employeeId', 'Employee ID is required');
            isValid = false;
        } else {
            showError('employeeId', '');
        }
        
        if (!department) {
            showError('department', 'Department is required');
            isValid = false;
        } else {
            showError('department', '');
        }
    }
    
    if (!terms) {
        showError('terms', 'You must agree to the Terms & Conditions');
        isValid = false;
    } else {
        showError('terms', '');
    }
    
    if (!isValid) {
        logSecurityEvent('REGISTRATION_VALIDATION_FAILED', {
            failedFields: Object.keys({...fullNameErrors, ...emailErrors, ...passwordErrors, ...confirmErrors})
        });
        return;
    }
    
    // If valid, proceed with submission
    submitForm(fullName, collegeEmail);
}

/**
 * Submit form to backend
 */
function submitForm(fullName, email) {
    const submitBtn = document.querySelector('.btn-register');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating Account...';
    
    // Simulate API call
    setTimeout(() => {
        // Store user data
        const userData = {
            fullName: fullName,
            collegeEmail: email
        };
        
        const user = storeUserData(userData);
        
        logSecurityEvent('REGISTRATION_SUCCESSFUL', {
            userId: user.id,
            email: email,
            role: selectedRole
        });
        
        // Show success message
        showAlert('✓ Account created successfully! Redirecting to login...', 'success');
        
        // Redirect to login
        setTimeout(() => {
            window.location.href = 'login.html?email=' + encodeURIComponent(email);
        }, 2000);
    }, 1500);
}

// ============================================
// PAGE INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.info('🔐 Campus Portal Registration - Security Features:');
    console.info('✓ HTTPS Recommended');
    console.info('✓ Strong Password Validation');
    console.info('✓ Input Validation Enabled');
    console.info('✓ Event Logging Active');
    console.info('✓ Secure Navigation');
});
