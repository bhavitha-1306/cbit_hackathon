// Student Dashboard Script

// Show different sections
function showSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.remove('active');
    });

    // Remove active class from all menu items
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.classList.remove('active');
    });

    // Show selected section
    const selectedSection = document.getElementById(sectionName + '-section');
    if (selectedSection) {
        selectedSection.classList.add('active');
    }

    // Add active class to clicked menu item
    if (event && event.target) {
        event.target.classList.add('active');
    }
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        // Clear all session and local storage
        localStorage.removeItem('studentData');
        sessionStorage.clear();
        
        // Redirect to login page
        window.location.href = 'login.html';
    }
}

// Load student data on page load
document.addEventListener('DOMContentLoaded', function() {
    // Get student data from localStorage
    let studentData = JSON.parse(localStorage.getItem('studentData'));
    
    // If no data in localStorage, create default test data
    if (!studentData) {
        studentData = {
            name: 'Student User',
            roll: '2024001',
            email: 'student@college.edu'
        };
    }

    // Update student info in sidebar
    const studentNameEl = document.getElementById('studentName');
    const studentRollEl = document.getElementById('studentRoll');
    
    if (studentNameEl) {
        studentNameEl.textContent = studentData.name || 'Student';
    }
    if (studentRollEl) {
        studentRollEl.textContent = studentData.roll || 'Roll Number';
    }

    // Handle complaint form submission
    const complaintForm = document.getElementById('complaintForm');
    if (complaintForm) {
        complaintForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const complaintPurpose = document.getElementById('complaintPurpose').value;
            const complaintDesc = document.getElementById('complaintDesc').value;

            if (complaintPurpose && complaintDesc) {
                // Create request object and persist
                const request = {
                    id: generateRequestId(),
                    type: 'complaint',
                    purpose: complaintPurpose,
                    description: complaintDesc,
                    status: 'Pending',
                    reason: '',
                    date: new Date().toISOString()
                };
                saveRequest(request);

                // Reset form and show status page
                complaintForm.reset();
                showSection('status');
                renderRequests();
            } else {
                alert('Please fill in all required fields');
            }
        });
    }

    // Handle bonafide form submission
    const bonafideForm = document.getElementById('bonafideForm');
    if (bonafideForm) {
        bonafideForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const purpose = document.getElementById('bonafidePurpose').value;
            const desc = document.getElementById('bonafideDesc').value;

            if (purpose && desc) {
                const request = {
                    id: generateRequestId(),
                    type: 'bonafide',
                    purpose: purpose,
                    description: desc,
                    status: 'Pending',
                    reason: '',
                    date: new Date().toISOString()
                };
                saveRequest(request);
                bonafideForm.reset();
                showSection('status');
                renderRequests();
            } else {
                alert('Please fill in all required fields');
            }
        });
    }

    // Set home section as active by default
    const homeSection = document.getElementById('home-section');
    if (homeSection) {
        homeSection.classList.add('active');
    }
    // Render any existing requests
    renderRequests();
});

// Download receipt function
function downloadReceipt(receiptName) {
    alert('Downloading: ' + receiptName + '\n\nIn a real application, this would download the file.');
}

// Download document function (for approved requests)
function downloadDocument(requestId) {
    alert('Downloading document for ' + requestId + '\n\nIn a real application, this would download the approved document/certificate.');
}

// ======= Request persistence and rendering helpers =======
function generateRequestId() {
    return 'REQ' + new Date().getTime().toString().slice(-6);
}

function getRequests() {
    try {
        return JSON.parse(localStorage.getItem('studentRequests') || '[]');
    } catch (e) {
        return [];
    }
}

function saveRequest(req) {
    const arr = getRequests();
    arr.unshift(req); // newest first
    localStorage.setItem('studentRequests', JSON.stringify(arr));
}

function updateRequest(updated) {
    const arr = getRequests();
    const idx = arr.findIndex(r => r.id === updated.id);
    if (idx !== -1) {
        arr[idx] = updated;
        localStorage.setItem('studentRequests', JSON.stringify(arr));
    }
}

// Dev/test mode flag to show approve/reject controls
let devMode = false;

function toggleDevMode() {
    devMode = !devMode;
    const link = document.getElementById('devToggleLink');
    if (link) link.textContent = `Dev Controls: ${devMode ? 'On' : 'Off'}`;
    renderRequests();
}

function approveRequest(id) {
    const arr = getRequests();
    const req = arr.find(r => r.id === id);
    if (!req) return alert('Request not found');
    req.status = 'Approved';
    req.reason = '';
    updateRequest(req);
    renderRequests();
    alert('Request ' + id + ' marked Approved (dev).');
}

function rejectRequest(id) {
    const arr = getRequests();
    const req = arr.find(r => r.id === id);
    if (!req) return alert('Request not found');
    const reason = prompt('Enter rejection reason:', 'Missing documents');
    if (reason === null) return; // cancelled
    req.status = 'Rejected';
    req.reason = reason || '';
    updateRequest(req);
    renderRequests();
    alert('Request ' + id + ' marked Rejected.');
}

function renderRequests() {
    const container = document.getElementById('requestsList');
    if (!container) return;

    const requests = getRequests();
    if (!requests || requests.length === 0) {
        container.innerHTML = '<p>No requests yet. Submit a request to see status here.</p>';
        return;
    }

    const html = requests.map(r => {
        const dateText = new Date(r.date).toLocaleString();
        let badgeClass = 'pending';
        let badgeText = 'Pending';
        if (r.status && (r.status.toLowerCase() === 'approved' || r.status.toLowerCase() === 'resolved')) {
            badgeClass = 'resolved';
            badgeText = 'Approved';
        } else if (r.status && r.status.toLowerCase() === 'rejected') {
            badgeClass = 'rejected';
            badgeText = 'Rejected';
        }

        return `
            <div class="status-item" data-request-id="${r.id}">
                <div class="status-header">
                    <div class="status-info">
                        <h4>Request ID: ${r.id}</h4>
                        <p class="status-purpose">Purpose: ${formatPurpose(r.purpose)}</p>
                    </div>
                    <span class="status-badge ${badgeClass}">${badgeText}</span>
                </div>
                <div class="status-details">
                    <p><strong>Status:</strong> <span class="badge-text ${badgeClass}">${badgeText}</span></p>
                    ${r.reason ? `<p><strong>Reason:</strong> ${r.reason}</p>` : ''}
                    <p class="status-date">Submitted: ${dateText}</p>
                    ${badgeClass === 'resolved' ? `<button class="btn btn-small" onclick="downloadDocument('${r.id}')">Download Document</button>` : ''}
                    ${devMode ? `<div class="dev-actions" style="margin-top:.6rem"><button class="btn btn-small" onclick="approveRequest('${r.id}')">Approve</button> <button class="btn btn-small btn-danger" onclick="rejectRequest('${r.id}')">Reject</button></div>` : ''}
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = html;
}

function formatPurpose(p) {
    if (!p) return '';
    return p.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}
