// Updated form handlers to redirect to thank you page

// Declare variables before using them
let webinarForm = document.getElementById('webinarForm');
let contactForm = document.getElementById('contactForm');
let validateForm = function(form) {
    // Simple form validation logic
    const requiredFields = form.querySelectorAll('[required]');
    for (let field of requiredFields) {
        if (!field.value) {
            alert(`${field.name} is required`);
            return false;
        }
    }
    return true;
};

let createModal = function(title, content) {
    const modal = document.createElement('div');
    modal.classList.add('modal');
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>${title}</h2>
            ${content}
        </div>
    `;
    return modal;
};

// Webinar Form Handler (Updated)
if (webinarForm) {
    webinarForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const formData = new FormData(this);
        const data = Object.fromEntries(formData);

        // Validate required fields
        if (validateForm(this)) {
            // Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Enrolling...';
            submitBtn.classList.add('loading');
            
            // Simulate API call
            setTimeout(() => {
                // Redirect to thank you page with parameters
                const params = new URLSearchParams({
                    type: 'webinar',
                    email: data.email,
                    name: data.name
                });
                window.location.href = `thank-you.html?${params.toString()}`;
            }, 2000);
        }
    });
}

// Contact Form Handler (Updated)
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const formData = new FormData(this);
        const data = Object.fromEntries(formData);

        // Validate required fields
        if (validateForm(this)) {
            // Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.classList.add('loading');
            
            // Simulate API call
            setTimeout(() => {
                // Redirect to thank you page with parameters
                const params = new URLSearchParams({
                    type: 'contact',
                    email: data.email,
                    name: data.name
                });
                window.location.href = `thank-you.html?${params.toString()}`;
            }, 2000);
        }
    });
}

// Update product page form handlers
function showTrialModal(planName = '', price = '') {
    const modal = createModal('Start Your Free Trial', `
        <form id="trialForm">
            <div class="form-group">
                <label for="trialName">Full Name</label>
                <input type="text" id="trialName" name="name" required>
            </div>
            <div class="form-group">
                <label for="trialEmail">Email Address</label>
                <input type="email" id="trialEmail" name="email" required>
            </div>
            <div class="form-group">
                <label for="trialOrganization">Organization</label>
                <input type="text" id="trialOrganization" name="organization" required>
            </div>
            <div class="form-group">
                <label for="trialPlan">Selected Plan</label>
                <select id="trialPlan" name="plan" required>
                    <option value="">Choose a plan</option>
                    <option value="academic" ${planName.toLowerCase() === 'academic' ? 'selected' : ''}>Academic</option>
                    <option value="professional" ${planName.toLowerCase() === 'professional' ? 'selected' : ''}>Professional</option>
                    <option value="enterprise" ${planName.toLowerCase() === 'enterprise' ? 'selected' : ''}>Enterprise</option>
                </select>
            </div>
            <div class="form-group">
                <label for="trialUseCase">Primary Use Case</label>
                <select id="trialUseCase" name="useCase" required>
                    <option value="">Select use case</option>
                    <option value="drug-discovery">Drug Discovery</option>
                    <option value="academic-research">Academic Research</option>
                    <option value="protein-analysis">Protein Analysis</option>
                    <option value="molecular-dynamics">Molecular Dynamics</option>
                </select>
            </div>
            <button type="submit" class="btn btn-primary btn-full">Start Free Trial</button>
        </form>
    `);
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('active'), 10);
    
    // Handle form submission with redirect
    const form = modal.querySelector('#trialForm');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const data = Object.fromEntries(formData);
        
        // Show loading state
        const submitBtn = this.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Starting Trial...';
        submitBtn.disabled = true;
        
        // Simulate API call then redirect
        setTimeout(() => {
            const params = new URLSearchParams({
                type: 'trial',
                email: data.email,
                name: data.name,
                plan: data.plan
            });
            window.location.href = `thank-you.html?${params.toString()}`;
        }, 2000);
    });
}

function showDemoModal() {
    const modal = createModal('Schedule a Demo', `
        <form id="demoForm">
            <div class="form-group">
                <label for="demoName">Full Name</label>
                <input type="text" id="demoName" name="name" required>
            </div>
            <div class="form-group">
                <label for="demoEmail">Email Address</label>
                <input type="email" id="demoEmail" name="email" required>
            </div>
            <div class="form-group">
                <label for="demoCompany">Company/Organization</label>
                <input type="text" id="demoCompany" name="company" required>
            </div>
            <div class="form-group">
                <label for="demoProduct">Product Interest</label>
                <select id="demoProduct" name="product" required>
                    <option value="">Select product</option>
                    <option value="quickbind">QuickBind AI</option>
                    <option value="molecuflex">MolecuFlex AI</option>
                    <option value="both">Both Products</option>
                </select>
            </div>
            <div class="form-group">
                <label for="demoTime">Preferred Time</label>
                <select id="demoTime" name="time" required>
                    <option value="">Select time preference</option>
                    <option value="morning">Morning (9 AM - 12 PM EST)</option>
                    <option value="afternoon">Afternoon (1 PM - 5 PM EST)</option>
                    <option value="flexible">Flexible</option>
                </select>
            </div>
            <button type="submit" class="btn btn-primary btn-full">Schedule Demo</button>
        </form>
    `);
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('active'), 10);
    
    // Handle form submission with redirect
    const form = modal.querySelector('#demoForm');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const data = Object.fromEntries(formData);
        
        const submitBtn = this.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Scheduling...';
        submitBtn.disabled = true;
        
        setTimeout(() => {
            const params = new URLSearchParams({
                type: 'demo',
                email: data.email,
                name: data.name,
                product: data.product
            });
            window.location.href = `thank-you.html?${params.toString()}`;
        }, 2000);
    });
}