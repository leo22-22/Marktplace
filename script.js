document.addEventListener('DOMContentLoaded', function() {
    const select = (selector, parent = document) => parent.querySelector(selector);
    const selectAll = (selector, parent = document) => parent.querySelectorAll(selector);

    selectAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = select(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                const navMenu = select('.nav-menu');
                if (navMenu && navMenu.classList.contains('active')) {
                    setTimeout(() => {
                        navMenu.classList.remove('active');
                        if (select('.menu-toggle')) select('.menu-toggle').focus();
                    }, 300);
                }
            } else {
                console.warn(`Target element for smooth scroll not found: ${targetId}`);
            }
        });
    });

    const menuToggle = select('.menu-toggle');
    const navMenu = select('.nav-menu');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function() {
            const isExpanded = navMenu.classList.toggle('active');
            this.setAttribute('aria-expanded', isExpanded);
            navMenu.setAttribute('aria-hidden', !isExpanded);
        });
        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !menuToggle.contains(e.target) && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', false);
                navMenu.setAttribute('aria-hidden', true);
            }
        });
    }

    const themeToggleBtn = select('#theme-toggle');
    const body = document.body;

    if (themeToggleBtn) {
        const applyTheme = (theme) => {
            if (theme === 'dark') {
                body.classList.add('dark-mode');
                themeToggleBtn.querySelector('i').classList.replace('fa-moon', 'fa-sun');
                localStorage.setItem('theme', 'dark');
            } else {
                body.classList.remove('dark-mode');
                themeToggleBtn.querySelector('i').classList.replace('fa-sun', 'fa-moon');
                localStorage.setItem('theme', 'light');
            }
        };
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (savedTheme) {
            applyTheme(savedTheme);
        } else if (prefersDark) {
            applyTheme('dark');
        } else {
            applyTheme('light');
        }
        themeToggleBtn.addEventListener('click', function() {
            if (body.classList.contains('dark-mode')) {
                applyTheme('light');
            } else {
                applyTheme('dark');
            }
        });
    }

    const carouselContainer = select('.carousel-container');
    if (carouselContainer) {
        const track = select('.carousel-track', carouselContainer);
        const items = selectAll('.carousel-item', track);
        const dotsContainer = document.createElement('div');
        dotsContainer.classList.add('carousel-dots');
        carouselContainer.appendChild(dotsContainer);

        let currentIndex = 0;
        let autoPlayInterval;
        const intervalTime = 6000;

        items.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.classList.add('dot');
            dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
            dot.dataset.index = index;
            dot.addEventListener('click', () => goToSlide(index));
            dotsContainer.appendChild(dot);
        });

        const dots = selectAll('.dot', dotsContainer);

        const prevArrow = document.createElement('button');
        prevArrow.classList.add('carousel-prev');
        prevArrow.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevArrow.setAttribute('aria-label', 'Previous slide');
        prevArrow.addEventListener('click', () => goToSlide(currentIndex - 1));
        carouselContainer.appendChild(prevArrow);

        const nextArrow = document.createElement('button');
        nextArrow.classList.add('carousel-next');
        nextArrow.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextArrow.setAttribute('aria-label', 'Next slide');
        nextArrow.addEventListener('click', () => goToSlide(currentIndex + 1));
        carouselContainer.appendChild(nextArrow);

        function goToSlide(index) {
            if (index < 0) {
                index = items.length - 1;
            } else if (index >= items.length) {
                index = 0;
            }
            currentIndex = index;
            const offset = -currentIndex * 100;
            track.style.transform = `translateX(${offset}%)`;
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === currentIndex);
                dot.setAttribute('aria-current', i === currentIndex ? 'true' : 'false');
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

        carouselContainer.addEventListener('mouseenter', () => clearInterval(autoPlayInterval));
        carouselContainer.addEventListener('mouseleave', () => startAutoPlay());

        let touchStartX = 0;
        let touchEndX = 0;

        carouselContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        });

        carouselContainer.addEventListener('touchmove', (e) => {
            touchEndX = e.touches[0].clientX;
        });

        carouselContainer.addEventListener('touchend', () => {
            if (touchStartX - touchEndX > 50) {
                goToSlide(currentIndex + 1);
            } else if (touchEndX - touchStartX > 50) {
                goToSlide(currentIndex - 1);
            }
            touchStartX = 0;
            touchEndX = 0;
        });

        goToSlide(0);
        startAutoPlay();
    }

    const filterButtons = selectAll('.filter-btn');
    const productCards = selectAll('.product-card');
    const searchInput = select('.search-box input');

    if (filterButtons.length > 0 && productCards.length > 0) {
        const filterProducts = (category) => {
            productCards.forEach(card => {
                const cardCategory = card.dataset.category;
                const matchesCategory = (category === 'all' || cardCategory === category);
                if (matchesCategory) {
                    card.style.display = 'flex';
                    setTimeout(() => card.style.opacity = '1', 50);
                } else {
                    card.style.opacity = '0';
                    setTimeout(() => card.style.display = 'none', 300);
                }
            });
        };

        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                const category = this.dataset.category;
                filterProducts(category);
                if (searchInput) {
                    searchInput.value = '';
                    searchInput.dispatchEvent(new Event('keyup'));
                }
            });
        });

        const defaultFilterBtn = select('.filter-btn.active') || select('.filter-btn[data-category="all"]');
        if (defaultFilterBtn) {
            defaultFilterBtn.click();
        } else if (filterButtons.length > 0) {
            filterButtons[0].click();
        }

        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('keyup', function() {
                clearTimeout(searchTimeout);
                const searchTerm = this.value.toLowerCase().trim();
                searchTimeout = setTimeout(() => {
                    productCards.forEach(card => {
                        const productName = card.querySelector('h4')?.textContent.toLowerCase() || '';
                        const productDescription = card.querySelector('.description')?.textContent.toLowerCase() || '';
                        const matchesSearch = productName.includes(searchTerm) || productDescription.includes(searchTerm);
                        if (matchesSearch) {
                            card.style.display = 'flex';
                            setTimeout(() => card.style.opacity = '1', 50);
                        } else {
                            card.style.opacity = '0';
                            setTimeout(() => card.style.display = 'none', 300);
                        }
                    });
                    filterButtons.forEach(btn => btn.classList.remove('active'));
                }, 200);
            });
        }
    }

    const newsletterForm = select('.newsletter-signup form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = select('input[type="email"]', this);
            const email = emailInput.value.trim();
            if (!email) {
                alert('Por favor, digite seu endereço de e-mail.');
                emailInput.focus();
                return;
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Por favor, digite um endereço de e-mail válido (ex: seu.email@exemplo.com).');
                emailInput.focus();
                return;
            }
            console.log(`Submitting email: ${email}`);
            alert(`🎉 Obrigado por se inscrever, ${email}! Você receberá nossas melhores ofertas e atualizações em breve.`);
            emailInput.value = '';
            const submitBtn = select('.btn-subscribe', this);
            if (submitBtn) {
                submitBtn.disabled = true;
                setTimeout(() => submitBtn.disabled = false, 2000);
            }
        });
    }

    const faqAccordionHeaders = selectAll('.accordion-header');
    if (faqAccordionHeaders.length > 0) {
        faqAccordionHeaders.forEach(header => {
            header.addEventListener('click', function() {
                const panel = this.nextElementSibling;
                const isExpanded = this.getAttribute('aria-expanded') === 'true';
                selectAll('.accordion-header').forEach(otherHeader => {
                    if (otherHeader !== this && otherHeader.getAttribute('aria-expanded') === 'true') {
                        otherHeader.setAttribute('aria-expanded', 'false');
                        otherHeader.nextElementSibling.setAttribute('hidden', 'true');
                        otherHeader.nextElementSibling.style.maxHeight = '0';
                        otherHeader.nextElementSibling.style.paddingBottom = '0';
                    }
                });
                if (isExpanded) {
                    this.setAttribute('aria-expanded', 'false');
                    panel.setAttribute('hidden', 'true');
                    panel.style.maxHeight = '0';
                    panel.style.paddingBottom = '0';
                } else {
                    this.setAttribute('aria-expanded', 'true');
                    panel.removeAttribute('hidden');
                    panel.style.maxHeight = panel.scrollHeight + 'px';
                    panel.style.paddingBottom = '25px';
                }
            });
            const panel = header.nextElementSibling;
            if (panel) {
                header.setAttribute('aria-expanded', 'false');
                panel.setAttribute('hidden', 'true');
                panel.style.maxHeight = '0';
                panel.style.paddingBottom = '0';
            }
        });
    }

    const animateElements = selectAll('.animate-fade-in-up');
    if (animateElements.length > 0) {
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.2,
            rootMargin: '0px 0px -50px 0px'
        });
        animateElements.forEach(element => {
            observer.observe(element);
        });
    }

    const currentYearSpan = select('#current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            const isDark = document.body.classList.contains('dark-theme');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            themeToggleBtn.querySelector('i').classList.toggle('fa-moon', !isDark);
            themeToggleBtn.querySelector('i').classList.toggle('fa-sun', isDark);
        });
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
            themeToggleBtn.querySelector('i').classList.add('fa-sun');
            themeToggleBtn.querySelector('i').classList.remove('fa-moon');
        } else {
            themeToggleBtn.querySelector('i').classList.add('fa-moon');
            themeToggleBtn.querySelector('i').classList.remove('fa-sun');
        }
    }

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', !isExpanded);
            navMenu.classList.toggle('active');
        });
    }

    const accordionHeaders = document.querySelectorAll('.accordion-header');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const panel = header.nextElementSibling;
            const isExpanded = header.getAttribute('aria-expanded') === 'true';
            header.setAttribute('aria-expanded', !isExpanded);
            if (isExpanded) {
                panel.setAttribute('hidden', '');
            } else {
                panel.removeAttribute('hidden');
            }
        });
    });

    const filterButtons2 = document.querySelectorAll('.filter-btn');
    const productGrid = document.querySelector('.product-grid');
    const productCards2 = document.querySelectorAll('.product-card');

    filterButtons2.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons2.forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-pressed', 'false');
            });
            button.classList.add('active');
            button.setAttribute('aria-pressed', 'true');
            const category = button.dataset.category;
            productCards2.forEach(card => {
                if (category === 'all' || card.dataset.category === category) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    const carouselTrack = document.querySelector('.carousel-track');
    const carouselItems = document.querySelectorAll('.carousel-item');
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    const carouselDotsContainer = document.querySelector('.carousel-dots');
    let currentIndex = 0;
    const itemsPerPage = 1;

    if (carouselTrack && carouselItems.length > 0) {
        carouselItems.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.classList.add('carousel-dot');
            dot.setAttribute('role', 'tab');
            dot.setAttribute('aria-selected', index === 0);
            dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
            dot.dataset.index = index;
            carouselDotsContainer.appendChild(dot);
        });

        const carouselDots = document.querySelectorAll('.carousel-dot');

        const updateCarousel = () => {
            const offset = -currentIndex * 100;
            carouselTrack.style.transform = `translateX(${offset}%)`;
            carouselDots.forEach((dot, index) => {
                if (index === currentIndex) {
                    dot.classList.add('active');
                    dot.setAttribute('aria-selected', 'true');
                } else {
                    dot.classList.remove('active');
                    dot.setAttribute('aria-selected', 'false');
                }
            });
        };

        prevBtn.addEventListener('click', () => {
            currentIndex = (currentIndex > 0) ? currentIndex - 1 : carouselItems.length - itemsPerPage;
            updateCarousel();
        });

        nextBtn.addEventListener('click', () => {
            currentIndex = (currentIndex < carouselItems.length - itemsPerPage) ? currentIndex + 1 : 0;
            updateCarousel();
        });

        carouselDots.forEach(dot => {
            dot.addEventListener('click', () => {
                currentIndex = parseInt(dot.dataset.index);
                updateCarousel();
            });
        });

        updateCarousel();
    }

    const cartToggleBtn = document.getElementById('cart-toggle');
    const shoppingCart = document.getElementById('shopping-cart');
    const closeCartBtn = document.querySelector('.close-cart-btn');
    const cartItemsContainer = document.querySelector('.cart-items');
    const cartCountSpan = document.querySelector('.cart-count');
    const cartTotalSpan = document.querySelector('.cart-total');
    const checkoutBtn = document.querySelector('.checkout-btn');
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');

    let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];

    const saveCart = () => {
        localStorage.setItem('shoppingCart', JSON.stringify(cart));
    };

    const updateCartCount = () => {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountSpan.textContent = totalItems;
    };

    const updateCartTotal = () => {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotalSpan.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
        checkoutBtn.disabled = cart.length === 0;
    };

    const renderCartItems = () => {
        cartItemsContainer.innerHTML = '';
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart-message">Seu carrinho está vazio.</p>';
            return;
        }
        cart.forEach(item => {
            const cartItemDiv = document.createElement('div');
            cartItemDiv.classList.add('cart-item');
            cartItemDiv.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-details">
                    <h5>${item.name}</h5>
                    <p>R$ ${item.price.toFixed(2).replace('.', ',')}</p>
                </div>
                <div class="cart-item-controls">
                    <input type="number" value="${item.quantity}" min="1" data-product-id="${item.id}">
                    <button class="remove-item-btn" data-product-id="${item.id}" aria-label="Remover ${item.name} do carrinho">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            `;
            cartItemsContainer.appendChild(cartItemDiv);
        });
        addCartItemEventListeners();
        updateCartTotal();
    };

    const addCartItemEventListeners = () => {
        cartItemsContainer.querySelectorAll('input[type="number"]').forEach(input => {
            input.addEventListener('change', (event) => {
                const productId = parseInt(event.target.dataset.productId);
                const newQuantity = parseInt(event.target.value);
                const itemIndex = cart.findIndex(item => item.id === productId);
                if (itemIndex > -1) {
                    cart[itemIndex].quantity = newQuantity;
                    if (cart[itemIndex].quantity <= 0) {
                        cart.splice(itemIndex, 1);
                    }
                    saveCart();
                    updateCartCount();
                    renderCartItems();
                }
            });
        });
        cartItemsContainer.querySelectorAll('.remove-item-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const productId = parseInt(event.currentTarget.dataset.productId);
                cart = cart.filter(item => item.id !== productId);
                saveCart();
                updateCartCount();
                renderCartItems();
            });
        });
    };

    cartToggleBtn.addEventListener('click', () => {
        shoppingCart.classList.add('open');
        shoppingCart.removeAttribute('hidden');
        renderCartItems();
    });

    closeCartBtn.addEventListener('click', () => {
        shoppingCart.classList.remove('open');
        shoppingCart.setAttribute('hidden', '');
    });

    document.addEventListener('click', (event) => {
        if (shoppingCart.classList.contains('open') && !shoppingCart.contains(event.target) && !cartToggleBtn.contains(event.target)) {
            shoppingCart.classList.remove('open');
            shoppingCart.setAttribute('hidden', '');
        }
    });

    addToCartButtons.forEach(button => {
        button.addEventListener('click', () => {
            const productId = parseInt(button.dataset.productId);
            const productName = button.dataset.productName;
            const productPrice = parseFloat(button.dataset.price);
            const productImage = button.dataset.image;
            const existingItem = cart.find(item => item.id === productId);
            if (existingItem) {
                existingItem.quantity++;
            } else {
                cart.push({
                    id: productId,
                    name: productName,
                    price: productPrice,
                    image: productImage,
                    quantity: 1
                });
            }
            saveCart();
            updateCartCount();
            alert(`${productName} adicionado ao carrinho!`);
        });
    });

    updateCartCount();
    updateCartTotal();
});
