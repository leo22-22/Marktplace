document.addEventListener('DOMContentLoaded', function() {
    // --- Smooth Scrolling for Navigation ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
            // Close mobile menu after clicking a link
            const navMenu = document.querySelector('.nav-menu');
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
            }
        });
    });

    // --- Mobile Menu Toggle ---
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');

    menuToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
    });

    // --- Dark Mode Toggle ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const body = document.body;

    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
        themeToggleBtn.querySelector('i').classList.replace('fa-moon', 'fa-sun');
    } else {
        themeToggleBtn.querySelector('i').classList.replace('fa-sun', 'fa-moon');
    }

    themeToggleBtn.addEventListener('click', function() {
        body.classList.toggle('dark-mode');
        if (body.classList.contains('dark-mode')) {
            localStorage.setItem('theme', 'dark');
            this.querySelector('i').classList.replace('fa-moon', 'fa-sun');
        } else {
            localStorage.setItem('theme', 'light');
            this.querySelector('i').classList.replace('fa-sun', 'fa-moon');
        }
    });

    // --- Carousel Functionality ---
    const track = document.querySelector('.carousel-track');
    const items = document.querySelectorAll('.carousel-item');
    const dotsContainer = document.querySelector('.carousel-dots');
    let currentIndex = 0;
    let autoPlayInterval;
    const intervalTime = 5000; // 5 seconds

    // Create dots dynamically
    items.forEach((_, index) => {
        const dot = document.createElement('a');
        dot.classList.add('dot');
        dot.dataset.index = index; // Store index for easy access
        dot.addEventListener('click', (e) => {
            e.preventDefault();
            goToSlide(index);
        });
        dotsContainer.appendChild(dot);
    });

    const dots = document.querySelectorAll('.dot');

    function goToSlide(index) {
        if (index < 0) {
            index = items.length - 1;
        } else if (index >= items.length) {
            index = 0;
        }

        currentIndex = index;
        const offset = -currentIndex * 100;
        track.style.transform = `translateX(${offset}%)`;

        // Update active dot
        dots.forEach((dot, i) => {
            if (i === currentIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });

        resetAutoPlay();
    }

    function startAutoPlay() {
        autoPlayInterval = setInterval(() => {
            goToSlide(currentIndex + 1);
        }, intervalTime);
    }

    function resetAutoPlay() {
        clearInterval(autoPlayInterval);
        startAutoPlay();
    }

    // Pause autoplay on carousel hover
    const carouselContainer = document.querySelector('.carousel-container');
    carouselContainer.addEventListener('mouseenter', () => clearInterval(autoPlayInterval));
    carouselContainer.addEventListener('mouseleave', () => startAutoPlay());

    // Initialize carousel
    goToSlide(0);
    startAutoPlay();


    // --- Product Filtering ---
    const filterButtons = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card');

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');

            const category = this.dataset.category;

            productCards.forEach(card => {
                const cardCategory = card.dataset.category;
                if (category === 'all' || cardCategory === category) {
                    card.style.display = 'flex'; // Show card
                    // Optional: Add a fade-in animation for filtered cards
                    // card.style.opacity = '0';
                    // setTimeout(() => card.style.opacity = '1', 50);
                } else {
                    card.style.display = 'none'; // Hide card
                }
            });
        });
    });

    // --- Newsletter Signup Form (Basic Example) ---
    const newsletterForm = document.querySelector('.newsletter-signup form');
    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Prevent default form submission
        const emailInput = this.querySelector('input[type="email"]');
        const email = emailInput.value;

        if (email && email.includes('@') && email.includes('.')) {
            alert(`Obrigado por assinar, ${email}! Você receberá nossas melhores ofertas em breve.`);
            emailInput.value = ''; // Clear input
        } else {
            alert('Por favor, digite um e-mail válido.');
        }
    });

    // --- Search Functionality (Basic Live Filtering) ---
    const searchInput = document.querySelector('.search-box input');
    searchInput.addEventListener('keyup', function() {
        const searchTerm = this.value.toLowerCase();

        productCards.forEach(card => {
            const productName = card.querySelector('h4').textContent.toLowerCase();
            const productDescription = card.querySelector('.description').textContent.toLowerCase();

            if (productName.includes(searchTerm) || productDescription.includes(searchTerm)) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });

        // Deactivate all filter buttons when searching
        filterButtons.forEach(btn => btn.classList.remove('active'));
    });
});