(() => {
    'use strict';

    // Respect user accessibility preferences and disable tilt on touch-only devices
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

    /**
     * 1. 3D Tilt & Dynamic Glare Engine
     */
    const initTiltEffect = () => {
        if (prefersReducedMotion || isTouchDevice) return;

        const tiltElements = document.querySelectorAll('.card, .lang, .skill-card');

        tiltElements.forEach((element) => {
            let rafId = null;
            let enterTimeout = null;

            // Differentiate intensity: larger cards tilt subtly, smaller badges tilt more
            const isLargeCard = element.classList.contains('card');
            const maxTilt = isLargeCard ? 8 : 14;
            const hoverScale = isLargeCard ? 1.02 : 1.06;

            // Inject a glare overlay layer if one doesn't exist
            let glare = element.querySelector('.tilt-glare');
            if (!glare) {
                glare = document.createElement('div');
                glare.className = 'tilt-glare';
                element.appendChild(glare);
            }

            element.addEventListener('mouseenter', () => {
                // Smoothly ease into the initial mouse position to prevent an abrupt jump
                element.style.transition = 'transform 0.18s cubic-bezier(0.25, 0.46, 0.45, 0.94), border-color 0.3s ease, box-shadow 0.3s ease';
                clearTimeout(enterTimeout);
                enterTimeout = setTimeout(() => {
                    element.style.transition = 'border-color 0.3s ease, box-shadow 0.3s ease';
                }, 180);
            });

            element.addEventListener('mousemove', (e) => {
                if (rafId) cancelAnimationFrame(rafId);

                rafId = requestAnimationFrame(() => {
                    const rect = element.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;

                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;

                    // Normalized values between -1 and 1
                    const normX = (x - centerX) / centerX;
                    const normY = (y - centerY) / centerY;

                    // Clamp rotation angles
                    const rotateX = Math.max(-maxTilt, Math.min(maxTilt, normY * -maxTilt));
                    const rotateY = Math.max(-maxTilt, Math.min(maxTilt, normX * maxTilt));

                    element.style.transform = `
                        perspective(1000px)
                        rotateX(${rotateX.toFixed(2)}deg)
                        rotateY(${rotateY.toFixed(2)}deg)
                        scale3d(${hoverScale}, ${hoverScale}, ${hoverScale})
                    `;

                    // Update glare position
                    const percentX = (x / rect.width) * 100;
                    const percentY = (y / rect.height) * 100;
                    glare.style.background = `radial-gradient(circle at ${percentX}% ${percentY}%, rgba(0, 229, 255, 0.22), transparent 65%)`;
                    glare.style.opacity = '1';
                });
            });

            element.addEventListener('mouseleave', () => {
                if (rafId) cancelAnimationFrame(rafId);
                clearTimeout(enterTimeout);

                // Smooth spring-like return to flat state
                element.style.transition = 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.3s ease, box-shadow 0.3s ease';
                element.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
                glare.style.opacity = '0';
            });
        });
    };

    /**
     * 2. Scroll Reveal Animations (Intersection Observer)
     */
    const initScrollReveal = () => {
        if (prefersReducedMotion) return;

        const revealTargets = document.querySelectorAll(
            '.card, .lang, .my-skill, .graph, .tech, .skill-card, .prolink, .mail'
        );

        revealTargets.forEach((el, index) => {
            el.classList.add('reveal-item');
            // Stagger skill cards and language badges automatically
            if (el.classList.contains('skill-card') || el.classList.contains('lang')) {
                el.style.transitionDelay = `${(index % 5) * 75}ms`;
            }
        });

        const observer = new IntersectionObserver(
            (entries, obs) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        obs.unobserve(entry.target); // Animate once
                    }
                });
            },
            { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
        );

        revealTargets.forEach((el) => observer.observe(el));
    };

    /**
     * 3. Active Navigation Link Spy
     */
    const initActiveNavSpy = () => {
        const sections = document.querySelectorAll('section[id], footer[id]');
        const navLinks = document.querySelectorAll('.liid');

        if (!sections.length || !navLinks.length) return;

        const navObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const activeId = `#${entry.target.getAttribute('id')}`;
                        navLinks.forEach((link) => {
                            link.classList.toggle('active-link', link.getAttribute('href') === activeId);
                        });
                    }
                });
            },
            { threshold: 0.4 }
        );

        sections.forEach((section) => navObserver.observe(section));
    };

    // Initialize all interactive modules once the DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
        initTiltEffect();
        initScrollReveal();
        initActiveNavSpy();
    });
})();