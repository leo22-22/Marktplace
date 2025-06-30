document.addEventListener('DOMContentLoaded', function() {
    // Funções auxiliares para selecionar elementos
    const select = (selector, parent = document) => parent.querySelector(selector);
    const selectAll = (selector, parent = document) => parent.querySelectorAll(selector);

    // 1. Smooth Scroll para links internos
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
                // Fecha o menu de navegação se estiver aberto (para responsividade)
                const navMenu = select('.nav-menu');
                if (navMenu && navMenu.classList.contains('active')) {
                    setTimeout(() => {
                        navMenu.classList.remove('active');
                        // Ajusta atributos ARIA para acessibilidade
                        const menuToggle = select('.menu-toggle');
                        if (menuToggle) {
                            menuToggle.setAttribute('aria-expanded', 'false');
                            navMenu.setAttribute('aria-hidden', 'true');
                            menuToggle.focus(); // Retorna o foco para o botão de toggle
                        }
                    }, 300); // Pequeno atraso para a animação do scroll
                }
            } else {
                console.warn(`Target element for smooth scroll not found: ${targetId}`);
            }
        });
    });

    // 2. Funcionalidade do Menu Hambúrguer (Header Responsivo)
    const menuToggle = select('.menu-toggle');
    const navMenu = select('.nav-menu');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function() {
            const isExpanded = navMenu.classList.toggle('active');
            this.setAttribute('aria-expanded', isExpanded); // Atualiza o atributo ARIA
            navMenu.setAttribute('aria-hidden', !isExpanded); // Atualiza o atributo ARIA
        });

        // Fecha o menu se clicar fora dele (para desktop e mobile)
        document.addEventListener('click', (e) => {
            // Verifica se o clique não foi no menu, nem no botão de toggle, e se o menu está aberto
            if (!navMenu.contains(e.target) && !menuToggle.contains(e.target) && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', false);
                navMenu.setAttribute('aria-hidden', true);
            }
        });
    }

    // 3. Tema Claro/Escuro (Light/Dark Mode)
    const themeToggleBtn = select('#theme-toggle');
    const body = document.body;

    if (themeToggleBtn) {
        const applyTheme = (theme) => {
            if (theme === 'dark') {
                body.classList.add('dark-mode'); // Consistente com o CSS fornecido
                themeToggleBtn.querySelector('i').classList.replace('fa-moon', 'fa-sun');
                localStorage.setItem('theme', 'dark');
            } else {
                body.classList.remove('dark-mode');
                themeToggleBtn.querySelector('i').classList.replace('fa-sun', 'fa-moon');
                localStorage.setItem('theme', 'light');
            }
        };

        // Carrega o tema salvo ou detecta a preferência do sistema
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme) {
            applyTheme(savedTheme);
        } else if (prefersDark) {
            applyTheme('dark');
        } else {
            applyTheme('light');
        }

        // Event listener para o botão de toggle
        themeToggleBtn.addEventListener('click', function() {
            if (body.classList.contains('dark-mode')) {
                applyTheme('light');
            } else {
                applyTheme('dark');
            }
        });
    }

    // 4. Carrossel de Imagens
    const carouselContainer = select('.carousel-container');
    if (carouselContainer) {
        const track = select('.carousel-track', carouselContainer);
        const items = selectAll('.carousel-item', track);
        const dotsContainer = document.createElement('div');
        dotsContainer.classList.add('carousel-dots');
        carouselContainer.appendChild(dotsContainer);

        let currentIndex = 0;
        let autoPlayInterval;
        const intervalTime = 6000; // Tempo em milissegundos para auto-play

        // Cria os indicadores (dots)
        items.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.classList.add('dot'); // Usando a classe 'dot' do seu CSS
            dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
            dot.dataset.index = index;
            dot.addEventListener('click', () => goToSlide(index));
            dotsContainer.appendChild(dot);
        });

        const dots = selectAll('.dot', dotsContainer); // Pega os dots recém-criados

        // Cria as setas de navegação
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

        // Função para ir para um slide específico
        function goToSlide(index) {
            if (index < 0) {
                index = items.length - 1;
            } else if (index >= items.length) {
                index = 0;
            }
            currentIndex = index;
            const offset = -currentIndex * 100;
            track.style.transform = `translateX(${offset}%)`;

            // Atualiza o estado dos dots
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === currentIndex);
                dot.setAttribute('aria-current', i === currentIndex ? 'true' : 'false');
            });
            resetAutoPlay(); // Reseta o auto-play a cada interação manual
        }

        // Funções para Auto-Play
        function startAutoPlay() {
            autoPlayInterval = setInterval(() => {
                goToSlide(currentIndex + 1);
            }, intervalTime);
        }

        function resetAutoPlay() {
            clearInterval(autoPlayInterval);
            startAutoPlay();
        }

        // Pause/Resume Auto-Play ao passar o mouse
        carouselContainer.addEventListener('mouseenter', () => clearInterval(autoPlayInterval));
        carouselContainer.addEventListener('mouseleave', () => startAutoPlay());

        // Suporte a gestos de toque (swipe)
        let touchStartX = 0;
        let touchEndX = 0;

        carouselContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        });

        carouselContainer.addEventListener('touchmove', (e) => {
            touchEndX = e.touches[0].clientX;
        });

        carouselContainer.addEventListener('touchend', () => {
            if (touchStartX - touchEndX > 50) { // Swipe para a esquerda
                goToSlide(currentIndex + 1);
            } else if (touchEndX - touchStartX > 50) { // Swipe para a direita
                goToSlide(currentIndex - 1);
            }
            // Reseta as coordenadas de toque
            touchStartX = 0;
            touchEndX = 0;
        });

        // Inicializa o carrossel
        goToSlide(0); // Garante que o primeiro slide esteja ativo no início
        startAutoPlay();
    }

    // 5. Filtro de Produtos e Busca
    const filterButtons = selectAll('.filter-btn');
    const productCards = selectAll('.product-card');
    const searchInput = select('.search-box input');

    if (filterButtons.length > 0 && productCards.length > 0) {
        const filterProducts = (category) => {
            productCards.forEach(card => {
                const cardCategory = card.dataset.category;
                const matchesCategory = (category === 'all' || cardCategory === category);

                if (matchesCategory) {
                    card.style.display = 'flex'; // Use 'flex' ou 'block' dependendo do seu layout
                    setTimeout(() => card.style.opacity = '1', 50); // Efeito de fade-in
                } else {
                    card.style.opacity = '0'; // Efeito de fade-out
                    setTimeout(() => card.style.display = 'none', 300);
                }
            });
        };

        // Event listeners para os botões de filtro
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Remove 'active' de todos os botões e adiciona ao clicado
                filterButtons.forEach(btn => {
                    btn.classList.remove('active');
                    btn.setAttribute('aria-pressed', 'false');
                });
                this.classList.add('active');
                this.setAttribute('aria-pressed', 'true');

                const category = this.dataset.category;
                filterProducts(category);

                // Limpa a busca ao filtrar
                if (searchInput) {
                    searchInput.value = '';
                    // Dispara um evento para re-executar a busca (se houver necessidade de resetar visualmente)
                    searchInput.dispatchEvent(new Event('keyup'));
                }
            });
        });

        // Ativa o filtro 'all' ou o primeiro botão por padrão
        const defaultFilterBtn = select('.filter-btn.active') || select('.filter-btn[data-category="all"]');
        if (defaultFilterBtn) {
            defaultFilterBtn.click();
        } else if (filterButtons.length > 0) {
            filterButtons[0].click(); // Ativa o primeiro botão se não houver 'all' ou 'active'
        }

        // Funcionalidade de busca
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
                    // Remove a classe 'active' dos botões de filtro quando a busca é usada
                    filterButtons.forEach(btn => {
                        btn.classList.remove('active');
                        btn.setAttribute('aria-pressed', 'false');
                    });
                }, 200); // Pequeno atraso para otimização da busca
            });
        }
    }

    // 6. Formulário de Newsletter
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
                submitBtn.disabled = true; // Desabilita o botão para evitar múltiplos cliques
                setTimeout(() => submitBtn.disabled = false, 2000); // Reabilita após 2 segundos
            }
        });
    }

    // 7. Acordeão de Perguntas Frequentes (FAQ)
    const faqAccordionHeaders = selectAll('.accordion-header');
    if (faqAccordionHeaders.length > 0) {
        faqAccordionHeaders.forEach(header => {
            // Inicializa todos os painéis como fechados
            const initialPanel = header.nextElementSibling;
            if (initialPanel) {
                header.setAttribute('aria-expanded', 'false');
                initialPanel.setAttribute('hidden', 'true');
                initialPanel.style.maxHeight = '0';
                initialPanel.style.paddingBottom = '0';
            }

            header.addEventListener('click', function() {
                const panel = this.nextElementSibling;
                const isExpanded = this.getAttribute('aria-expanded') === 'true';

                // Fecha outros acordeões abertos
                selectAll('.accordion-header').forEach(otherHeader => {
                    if (otherHeader !== this && otherHeader.getAttribute('aria-expanded') === 'true') {
                        otherHeader.setAttribute('aria-expanded', 'false');
                        const otherPanel = otherHeader.nextElementSibling;
                        if (otherPanel) {
                            otherPanel.setAttribute('hidden', 'true');
                            otherPanel.style.maxHeight = '0';
                            otherPanel.style.paddingBottom = '0';
                        }
                    }
                });

                // Abre ou fecha o acordeão clicado
                if (isExpanded) {
                    this.setAttribute('aria-expanded', 'false');
                    if (panel) {
                        panel.setAttribute('hidden', 'true');
                        panel.style.maxHeight = '0';
                        panel.style.paddingBottom = '0';
                    }
                } else {
                    this.setAttribute('aria-expanded', 'true');
                    if (panel) {
                        panel.removeAttribute('hidden');
                        panel.style.maxHeight = panel.scrollHeight + 'px'; // Ajusta a altura para a transição
                        panel.style.paddingBottom = '25px'; // Padding para o conteúdo
                    }
                }
            });
        });
    }

    // 8. Animações de Fade-in/Up (Intersection Observer)
    const animateElements = selectAll('.animate-fade-in-up');
    if (animateElements.length > 0) {
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target); // Para de observar depois de animar
                }
            });
        }, {
            threshold: 0.2, // Quando 20% do elemento estiver visível
            rootMargin: '0px 0px -50px 0px' // Começa a observar um pouco antes
        });
        animateElements.forEach(element => {
            observer.observe(element);
        });
    }

    // 9. Atualizar Ano no Rodapé
    const currentYearSpan = select('#current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // 10. Carrinho de Compras (Lógica Existente)
    const cartToggleBtn = document.getElementById('cart-toggle');
    const shoppingCart = document.getElementById('shopping-cart');
    const closeCartBtn = select('.close-cart-btn'); // Usando 'select'
    const cartItemsContainer = select('.cart-items'); // Usando 'select'
    const cartCountSpan = select('.cart-count'); // Usando 'select'
    const cartTotalSpan = select('.cart-total'); // Usando 'select'
    const checkoutBtn = select('.checkout-btn'); // Usando 'select'
    const addToCartButtons = selectAll('.add-to-cart-btn'); // Usando 'selectAll'

    let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];

    const saveCart = () => {
        localStorage.setItem('shoppingCart', JSON.stringify(cart));
    };

    const updateCartCount = () => {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountSpan.textContent = totalItems;
        // Opcional: Ocultar o contador se 0 itens
        cartCountSpan.style.display = totalItems > 0 ? 'flex' : 'none';
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
                let newQuantity = parseInt(event.target.value);

                // Garante que a quantidade não seja menor que 1
                if (newQuantity < 1) {
                    newQuantity = 1;
                    event.target.value = 1; // Reseta o valor no input
                }

                const itemIndex = cart.findIndex(item => item.id === productId);
                if (itemIndex > -1) {
                    cart[itemIndex].quantity = newQuantity;
                    // Se a quantidade se tornar 0 ou menos, remove o item
                    if (cart[itemIndex].quantity <= 0) {
                        cart.splice(itemIndex, 1);
                    }
                    saveCart();
                    updateCartCount();
                    renderCartItems(); // Re-renderiza o carrinho para refletir as mudanças
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

    if (cartToggleBtn && shoppingCart && closeCartBtn) {
        cartToggleBtn.addEventListener('click', () => {
            shoppingCart.classList.add('open');
            shoppingCart.removeAttribute('hidden'); // Certifica que está visível para leitores de tela
            renderCartItems();
        });

        closeCartBtn.addEventListener('click', () => {
            shoppingCart.classList.remove('open');
            shoppingCart.setAttribute('hidden', ''); // Esconde de leitores de tela quando fechado
        });

        // Fecha o carrinho se clicar fora dele ou do botão de toggle
        document.addEventListener('click', (event) => {
            if (shoppingCart.classList.contains('open') && !shoppingCart.contains(event.target) && !cartToggleBtn.contains(event.target)) {
                shoppingCart.classList.remove('open');
                shoppingCart.setAttribute('hidden', '');
            }
        });
    }


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

    // Inicializa o carrinho ao carregar a página
    updateCartCount();
    updateCartTotal(); // Adicionado para exibir o total inicial caso já haja itens no carrinho
});