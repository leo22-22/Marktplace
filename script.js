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
                const menuToggle = select('.menu-toggle'); // Pega o menuToggle aqui também
                if (navMenu && navMenu.classList.contains('active')) {
                    setTimeout(() => {
                        navMenu.classList.remove('active');
                        // Remove a classe 'active' do menuToggle também para mudar o ícone
                        if (menuToggle) {
                            menuToggle.classList.remove('active');
                            menuToggle.setAttribute('aria-expanded', 'false');
                            navMenu.setAttribute('aria-hidden', 'true');
                            // Troca o ícone de volta para barras
                            const icon = menuToggle.querySelector('i');
                            if (icon) {
                                icon.classList.replace('fa-chevron-down', 'fa-bars'); // Troca para a seta para baixo
                                icon.classList.replace('fa-times', 'fa-bars'); // Caso você use um X
                            }
                            menuToggle.focus(); // Retorna o foco para o botão de toggle
                        }
                    }, 300); // Pequeno atraso para a animação do scroll
                }
            } else {
                console.warn(`Target element for smooth scroll not found: ${targetId}`);
            }
        });
    });
    
    document.addEventListener('DOMContentLoaded', () => {
        const menuToggle = document.querySelector('.menu-toggle');
        const navMenu = document.querySelector('.nav-menu');
        const menuLinks = document.querySelectorAll('.nav-menu a'); 
        const barsIcon = menuToggle.querySelector('.fa-bars');
        const timesIcon = document.createElement('i');
        timesIcon.classList.add('fas', 'fa-times');
        timesIcon.setAttribute('aria-hidden', 'true');
        timesIcon.style.display = 'none'; 
        menuToggle.appendChild(timesIcon); 
    
        const toggleMenu = () => {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', !isExpanded);
            navMenu.classList.toggle('active');
    
            if (navMenu.classList.contains('active')) {
                barsIcon.style.display = 'none';
                timesIcon.style.display = 'block';
            } else {
                barsIcon.style.display = 'block';
                timesIcon.style.display = 'none';
            }
        };
    
        menuToggle.addEventListener('click', toggleMenu);
    
        menuLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (navMenu.classList.contains('active')) {
                    toggleMenu(); 
                }
            });
        });
    
        document.addEventListener('click', (event) => {
            if (navMenu.classList.contains('active') && !navMenu.contains(event.target) && !menuToggle.contains(event.target)) {
                toggleMenu(); 
            }
        });
    
        let isMobile = window.matchMedia('(max-width: 1000px)').matches;
    
        window.addEventListener('resize', () => {
            const newIsMobile = window.matchMedia('(max-width: 992px)').matches;
    
            if (isMobile && !newIsMobile && navMenu.classList.contains('active')) {
                toggleMenu();
            }
            isMobile = newIsMobile;
        });
    });


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
    // Renomeando para 'searchInputProductFilter' para evitar conflito com a busca principal do header
    const searchInputProductFilter = select('.search-box input'); 
    
    // Obtém o elemento do input de busca principal do header (adicionado na estrutura HTML anterior)
    const headerSearchInput = select('#search-input'); // Assumindo que o ID é 'search-input'
    const headerSearchButton = select('.search-icon'); // Assumindo a classe do botão de busca
    const searchFeedbackMessage = select('#search-feedback-message'); // Elemento para feedback da busca principal

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
                // Usando searchInputProductFilter para a busca na seção de produtos
                if (searchInputProductFilter) {
                    searchInputProductFilter.value = '';
                    searchInputProductFilter.dispatchEvent(new Event('keyup'));
                }
                // Limpa a busca principal do header também
                if (headerSearchInput) {
                    headerSearchInput.value = '';
                    // Opcional: esconder a mensagem de feedback se houver uma busca anterior
                    if (searchFeedbackMessage) {
                        searchFeedbackMessage.style.display = 'none';
                    }
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

        // Funcionalidade de busca para a seção de produtos (já existente)
        if (searchInputProductFilter) {
            let searchTimeout;
            searchInputProductFilter.addEventListener('keyup', function() {
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
                    // Opcional: esconder a mensagem de feedback se houver uma busca anterior e agora o filtro local está ativo
                    if (searchFeedbackMessage) {
                        searchFeedbackMessage.style.display = 'none';
                    }
                }, 200); // Pequeno atraso para otimização da busca
            });
        }
    }
    
    // =========================================================================
    // FUNÇÃO DE BUSCA DO HEADER (Principal) - Rola para o produto ou exibe mensagem
    // =========================================================================
    if (headerSearchInput && headerSearchButton) {
        // Função para realizar a busca e rolar ou exibir mensagem
        const performSearchAndScroll = () => {
            const searchTerm = headerSearchInput.value.toLowerCase().trim();

            // Limpa mensagens anteriores
            if (searchFeedbackMessage) {
                searchFeedbackMessage.style.display = 'none';
                searchFeedbackMessage.textContent = '';
            }

            if (searchTerm) {
                // Tenta encontrar um produto cujo nome ou descrição inclua o termo de busca
                const foundProductCard = Array.from(productCards).find(card => {
                    const productName = card.querySelector('h4')?.textContent.toLowerCase() || '';
                    const productDescription = card.querySelector('.description')?.textContent.toLowerCase() || '';
                    return productName.includes(searchTerm) || productDescription.includes(searchTerm);
                });

                if (foundProductCard) {
                    // Produto encontrado, rolar até ele
                    foundProductCard.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center' // Rola para o centro da tela
                    });

                    // Opcional: Destacar o produto por um breve momento
                    foundProductCard.classList.add('highlight-product');
                    setTimeout(() => {
                        foundProductCard.classList.remove('highlight-product');
                    }, 1500); // Remove o destaque após 1.5 segundos

                    // Você também pode desativar os filtros ao buscar, se desejar
                    filterButtons.forEach(btn => {
                        btn.classList.remove('active');
                        btn.setAttribute('aria-pressed', 'false');
                    });
                    
                    // Aplicar visibilidade para mostrar apenas o produto encontrado (se os outros estiverem escondidos por um filtro anterior)
                    productCards.forEach(card => {
                        if (card !== foundProductCard) {
                            card.style.opacity = '0';
                            setTimeout(() => card.style.display = 'none', 300);
                        } else {
                            card.style.display = 'flex'; // ou 'block' dependendo do seu CSS
                            setTimeout(() => card.style.opacity = '1', 50);
                        }
                    });

                } else {
                    // Produto não encontrado, exibe a mensagem
                    if (searchFeedbackMessage) {
                        searchFeedbackMessage.textContent = `O produto "${searchTerm}" não foi encontrado. Por favor, tente novamente.`;
                        searchFeedbackMessage.style.display = 'block';
                    } else {
                        alert(`O produto "${searchTerm}" não foi encontrado. Por favor, tente novamente.`);
                    }
                    
                    // Opcional: Se desejar, exiba todos os produtos novamente se a busca não encontrou nada
                    productCards.forEach(card => {
                        card.style.display = 'flex'; // ou 'block'
                        setTimeout(() => card.style.opacity = '1', 50);
                    });
                    // E reative o filtro "all" ou o primeiro filtro
                    const defaultFilterBtn = select('.filter-btn.active') || select('.filter-btn[data-category="all"]');
                    if (defaultFilterBtn) {
                        defaultFilterBtn.click();
                    } else if (filterButtons.length > 0) {
                        filterButtons[0].click();
                    }
                }
            } else {
                // Campo de busca vazio, opcionalmente mostre todos os produtos novamente
                productCards.forEach(card => {
                    card.style.display = 'flex'; // ou 'block'
                    setTimeout(() => card.style.opacity = '1', 50);
                });
                // E reative o filtro "all" ou o primeiro filtro
                const defaultFilterBtn = select('.filter-btn.active') || select('.filter-btn[data-category="all"]');
                if (defaultFilterBtn) {
                    defaultFilterBtn.click();
                } else if (filterButtons.length > 0) {
                    filterButtons[0].click();
                }

                if (searchFeedbackMessage) {
                    searchFeedbackMessage.textContent = 'Por favor, digite um nome de produto para pesquisar.';
                    searchFeedbackMessage.style.display = 'block';
                } else {
                    alert('Por favor, digite um nome de produto para pesquisar.');
                }
            }
            headerSearchInput.value = ''; // Limpa o input após a busca
        };

        // Event listener para Enter no campo de busca do header
        headerSearchInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                performSearchAndScroll();
            }
        });

        // Event listener para clique no botão de busca do header
        headerSearchButton.addEventListener('click', performSearchAndScroll);
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
            threshold: 0.2, 
            rootMargin: '0px 0px -50px 0px' 
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

    const cartToggleBtn = document.getElementById('cart-toggle');
    const shoppingCart = document.getElementById('shopping-cart');
    const closeCartBtn = select('.close-cart-btn');
    const cartItemsContainer = select('.cart-items');
    const cartCountSpan = select('.cart-count');
    const cartTotalSpan = select('.cart-total');
    const checkoutBtn = select('.checkout-btn');
    const addToCartButtons = selectAll('.add-to-cart-btn');

    let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];

    const saveCart = () => {
        localStorage.setItem('shoppingCart', JSON.stringify(cart));
    };

    const updateCartCount = () => {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountSpan.textContent = totalItems;
        cartCountSpan.style.display = totalItems > 0 ? 'flex' : 'none';
    };

    const updateCartTotal = () => {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotalSpan.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
        checkoutBtn.disabled = cart.length === 0;
    };

    const handleAddToCart = (productId, productName, productPrice, productImage) => {
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
        updateCartTotal();
        renderCartItems();

        if (typeof productModal !== 'undefined' && productModal && productModal.classList.contains('active')) {
            closeModal();
        }
    };

    const renderCartItems = () => {
        cartItemsContainer.innerHTML = ''; // Limpa o conteúdo atual do carrinho
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart-message">Seu carrinho está vazio.</p>';
            return;
        }
        cart.forEach(item => {
            const cartItemDiv = document.createElement('div');
            cartItemDiv.classList.add('cart-item');
            cartItemDiv.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <h5>${item.name}</h5>
                    <p class="cart-item-price">R$ ${item.price.toFixed(2).replace('.', ',')}</p>
                </div>
                <div class="cart-item-controls">
                    <button class="quantity-btn decrease-btn" data-product-id="${item.id}" aria-label="Diminuir quantidade de ${item.name}">-</button>
                    <input type="number" value="${item.quantity}" min="1" class="item-quantity-input" data-product-id="${item.id}" aria-label="Quantidade de ${item.name}">
                    <button class="quantity-btn increase-btn" data-product-id="${item.id}" aria-label="Aumentar quantidade de ${item.name}">+</button>
                    <button class="remove-item-btn" data-product-id="${item.id}" aria-label="Remover ${item.name} do carrinho">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            `;
            cartItemsContainer.appendChild(cartItemDiv);
        });
        updateCartTotal(); 
    };

    const setupCartItemDelegatedListeners = () => {
        cartItemsContainer.addEventListener('click', (event) => {
            const target = event.target;
            const productId = parseInt(target.dataset.productId); 

            if (target.classList.contains('decrease-btn')) {
                const itemIndex = cart.findIndex(item => item.id === productId);
                if (itemIndex > -1) {
                    if (cart[itemIndex].quantity > 1) {
                        cart[itemIndex].quantity--;
                    } else {
                        cart.splice(itemIndex, 1); 
                    }
                    saveCart();
                    updateCartCount();
                    renderCartItems(); // Re-renderiza para atualizar a UI
                }
            } else if (target.classList.contains('increase-btn')) {
                const itemIndex = cart.findIndex(item => item.id === productId);
                if (itemIndex > -1) {
                    cart[itemIndex].quantity++;
                    saveCart();
                    updateCartCount();
                    renderCartItems(); // Re-renderiza para atualizar a UI
                }
            } else if (target.closest('.remove-item-btn')) { // Usa .closest para pegar o botão mesmo se o ícone for clicado
                const button = target.closest('.remove-item-btn');
                const removeProductId = parseInt(button.dataset.productId);
                cart = cart.filter(item => item.id !== removeProductId); // Filtra o item a ser removido
                saveCart();
                updateCartCount();
                renderCartItems(); // Re-renderiza para atualizar a UI
            }
        });

        // Evento para o input de quantidade (alteração manual)
        cartItemsContainer.addEventListener('change', (event) => {
            const target = event.target;
            if (target.classList.contains('item-quantity-input')) {
                const productId = parseInt(target.dataset.productId);
                let newQuantity = parseInt(target.value);

                // Garante que a quantidade não seja menor que 1
                if (isNaN(newQuantity) || newQuantity < 1) {
                    newQuantity = 1;
                    target.value = 1; // Reseta o valor no input
                }

                const itemIndex = cart.findIndex(item => item.id === productId);
                if (itemIndex > -1) {
                    cart[itemIndex].quantity = newQuantity;
                    if (cart[itemIndex].quantity <= 0) {
                        cart.splice(itemIndex, 1);
                    }
                    saveCart();
                    updateCartCount();
                    renderCartItems(); // Re-renderiza para atualizar a UI
                }
            }
        });
    };

    // --- Lógica de Abertura/Fechamento do Carrinho ---
    if (cartToggleBtn && shoppingCart && closeCartBtn) {
        cartToggleBtn.addEventListener('click', () => {
            shoppingCart.classList.add('open');
            shoppingCart.removeAttribute('hidden');
            renderCartItems(); // Renderiza o carrinho sempre que ele é aberto
        });

        closeCartBtn.addEventListener('click', () => {
            shoppingCart.classList.remove('open');
            shoppingCart.setAttribute('hidden', '');
        });

        // Fecha o carrinho se clicar fora dele ou do botão de toggle
        document.addEventListener('click', (event) => {
            if (shoppingCart.classList.contains('open') && !shoppingCart.contains(event.target) && !cartToggleBtn.contains(event.target)) {
                shoppingCart.classList.remove('open');
                shoppingCart.setAttribute('hidden', '');
            }
        });
    }

    // --- Adicionar ao Carrinho a partir dos Cards de Produtos ---
    addToCartButtons.forEach(button => {
        button.addEventListener('click', () => {
            const productId = parseInt(button.dataset.productId);
            const productName = button.dataset.productName;
            const productPrice = parseFloat(button.dataset.price);
            const productImage = button.dataset.image;

            handleAddToCart(productId, productName, productPrice, productImage);
        });
    });

    // --- Inicialização do Carrinho ao Carregar a Página ---
    setupCartItemDelegatedListeners(); 
    updateCartCount();
    updateCartTotal();
    renderCartItems();
    
    // --- Checkout (Simulação) ---
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                alert('Seu carrinho está vazio. Adicione produtos antes de prosseguir para o checkout.');
            } else {
                alert('Checkout realizado com sucesso! Obrigado pela sua compra!');
                cart = []; 
                saveCart();
                updateCartCount();
                renderCartItems(); 
            }
        });
    }
});