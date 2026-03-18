// ── EmailJS configuration ─────────────────────────────────────────────────────
// Setup steps:
//   1. Create a free account at https://www.emailjs.com
//   2. Add an email service: Email Services → Add New Service → Outlook
//      Use cetenis@cetenis.es as the SMTP account
//   3. Create a template (Email Templates → Create New Template) with this body:
//
//      Subject: [Cetenis Web] {{category}} inquiry from {{from_name}}
//
//      Category: {{category}}
//      Name:     {{from_name}}
//      Email:    {{from_email}}
//      Country:  {{country}}
//
//      {{message}}
//
//   4. Replace the three constants below with your real IDs:

const EMAILJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY';    // Account → API Keys
const EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID';    // Email Services → Service ID
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';   // Email Templates → Template ID

window.emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });

// ── Modal ─────────────────────────────────────────────────────────────────────
const modal     = document.getElementById('contactModal');
const closeBtn  = document.getElementById('modalClose');
const form      = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');

function openModal() {
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    modal.querySelector('input:not([type="hidden"])').focus();
}

function closeModal() {
    modal.setAttribute('aria-hidden', 'true');
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
}

closeBtn.addEventListener('click', closeModal);

modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
});

// ── Open triggers ─────────────────────────────────────────────────────────────
document.querySelectorAll('[data-open-contact]').forEach(el => {
    el.addEventListener('click', (e) => {
        e.preventDefault();
        openModal();
    });
});

// ── Tabs ──────────────────────────────────────────────────────────────────────
document.querySelectorAll('.modal-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.modal-tab').forEach(t => {
            t.classList.remove('active');
            t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        document.getElementById('cf-category').value = tab.dataset.tab;
    });
});

// ── Form submit ───────────────────────────────────────────────────────────────
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const label   = submitBtn.querySelector('.btn-label');
    const loading = submitBtn.querySelector('.btn-loading');
    label.hidden   = true;
    loading.hidden = false;
    submitBtn.disabled = true;

    const params = {
        category:   document.getElementById('cf-category').value,
        from_name:  document.getElementById('cf-name').value,
        from_email: document.getElementById('cf-email').value,
        country:    document.getElementById('cf-country').value,
        message:    document.getElementById('cf-message').value,
        to_email:   'cetenis@cetenis.es',
    };

    try {
        await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params);
        closeModal();
        resetForm();
        launchConfetti();
    } catch (err) {
        console.error('EmailJS error:', err);
        alert('There was a problem sending your message. Please try again or email us at cetenis@cetenis.es');
    } finally {
        label.hidden   = false;
        loading.hidden = true;
        submitBtn.disabled = false;
    }
});

function resetForm() {
    form.reset();
    document.getElementById('cf-category').value = 'Investor';
    document.querySelectorAll('.modal-tab').forEach((t, i) => {
        t.classList.toggle('active', i === 0);
        t.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    });
}

// ── Confetti ──────────────────────────────────────────────────────────────────
function launchConfetti() {
    const container = document.createElement('div');
    container.className = 'confetti-container';
    document.body.appendChild(container);

    const colors = ['#ffffff', '#d4d4d4', '#ffd700', '#93c5fd', '#fca5a5', '#86efac'];
    const count  = 110;

    for (let i = 0; i < count; i++) {
        const size   = 5 + Math.random() * 9;
        const color  = colors[Math.floor(Math.random() * colors.length)];
        const spin   = (Math.random() > 0.5 ? '' : '-') + (300 + Math.random() * 400) + 'deg';
        const dur    = 2.8 + Math.random() * 2.4;
        const delay  = Math.random() * 1.8;
        const left   = Math.random() * 100;
        const isRect = Math.random() > 0.38;

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width',  String(size));
        svg.setAttribute('height', String(size));
        svg.style.cssText = `
            position: absolute;
            left: ${left}%;
            top: -16px;
            --spin: ${spin};
            animation: confettiFall ${dur}s ${delay}s ease-in both;
        `;

        if (isRect) {
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('width',  String(size));
            rect.setAttribute('height', String(size * 0.45));
            rect.setAttribute('fill',   color);
            rect.setAttribute('rx',     '1');
            svg.appendChild(rect);
        } else {
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', String(size / 2));
            circle.setAttribute('cy', String(size / 2));
            circle.setAttribute('r',  String(size / 2));
            circle.setAttribute('fill', color);
            svg.appendChild(circle);
        }

        container.appendChild(svg);
    }

    setTimeout(() => container.remove(), 6500);
}

// ── Smooth scroll for anchor links ────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#' || this.hasAttribute('data-open-contact')) return;
        e.preventDefault();
        const target = document.querySelector(targetId);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

// ── Ensure video plays ────────────────────────────────────────────────────────
const video = document.querySelector('.video-bg');
if (video) video.play().catch(() => {});
