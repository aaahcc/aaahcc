document.addEventListener('DOMContentLoaded', () => {
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            window.scrollTo({
                top: targetSection.offsetTop - 80,
                behavior: 'smooth'
            });
        });
    });

    // Testimonial slider
    let currentSlide = 0;
    const testimonials = document.querySelectorAll('.testimonial-card');
    const totalSlides = testimonials.length;

    function showSlide(index) {
        testimonials.forEach((testimonial, i) => {
            testimonial.style.opacity = i === index ? '1' : '0';
            testimonial.style.transform = i === index ? 'translateX(0)' : 'translateX(100px)';
        });
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % totalSlides;
        showSlide(currentSlide);
    }

    // Initialize first slide
    showSlide(0);

    // Auto advance slides
    setInterval(nextSlide, 5000);

    // Form submission handling
    const appointmentForm = document.getElementById('appointment-form');
    if (appointmentForm) {
        appointmentForm.addEventListener('submit', handleAppointmentSubmit);
    }

    function handleAppointmentSubmit(event) {
        event.preventDefault();

        // Get form values
        const name = document.getElementById('name').value;
        const phone = document.getElementById('phone').value;
        const email = document.getElementById('email').value;
        const service = document.getElementById('service').value;
        const preferredLocation = document.getElementById('preferred-location').value;
        const alternateLocation = document.getElementById('alternate-location').value;
        const message = document.getElementById('message').value;

        // Create email body
        const emailBody = `
New Appointment Request

Patient Information:
Name: ${name}
Phone: ${phone}
Email: ${email}

Appointment Details:
Service: ${service}
Preferred Location: ${preferredLocation}
${alternateLocation ? `Alternative Location: ${alternateLocation}` : ''}

Additional Notes:
${message}`;

        // Create email link
        const emailLink = `mailto:linda@aaahcc.com?subject=New Appointment Request from ${name}&body=${encodeURIComponent(emailBody)}`;

        // Create SMS link
        const smsBody = `New appointment request from ${name} for ${service} at ${preferredLocation}. Contact: ${phone}`;
        const smsLink = `sms:+14084755978?body=${encodeURIComponent(smsBody)}`;

        // Open email client
        window.location.href = emailLink;

        // Open SMS client after a short delay
        setTimeout(() => {
            window.location.href = smsLink;
        }, 1500);

        // Show success message
        alert('Thank you! Your appointment request has been sent. We will contact you shortly.');
        
        // Reset form
        document.getElementById('appointment-form').reset();

        return false;
    }

    // Scroll animations for sections
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);

    // Observe all major sections
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.classList.add('fade-out');
        observer.observe(section);
    });

    // Add animation classes for features
    const features = document.querySelectorAll('.feature-card');
    features.forEach((feature, index) => {
        feature.style.animationDelay = `${index * 0.2}s`;
    });

    // Add hover effects for service cards
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });

    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            nav.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
});
