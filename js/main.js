const { createApp, ref, reactive, computed, onMounted } = Vue;
const { createRouter, createWebHashHistory } = VueRouter;

// Sample data - in real app this would come from backend/API
const sampleRestaurants = [
    {
        id: 1,
        name: "Bella Italia",
        cuisine: "Italian",
        rating: 4.5,
        image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400",
        location: "Downtown",
        priceRange: "$$",
        description: "Authentic Italian cuisine",
        menu: [
            { id: 1, name: "Margherita Pizza", price: 18, category: "Pizza", likes: 45, description: "Classic tomato and mozzarella" },
            { id: 2, name: "Pasta Carbonara", price: 22, category: "Pasta", likes: 38, description: "Creamy bacon pasta" },
            { id: 3, name: "Tiramisu", price: 12, category: "Dessert", likes: 29, description: "Traditional Italian dessert" }
        ]
    },
    {
        id: 2,
        name: "Dragon Palace",
        cuisine: "Chinese",
        rating: 4.2,
        image: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=400",
        location: "Chinatown",
        priceRange: "$",
        description: "Traditional Chinese dishes",
        menu: [
            { id: 4, name: "Sweet and Sour Pork", price: 16, category: "Main", likes: 52, description: "Tender pork in sweet sauce" },
            { id: 5, name: "Fried Rice", price: 14, category: "Rice", likes: 41, description: "Wok-fried with vegetables" },
            { id: 6, name: "Spring Rolls", price: 8, category: "Appetizer", likes: 33, description: "Crispy vegetable rolls" }
        ]
    },
    {
        id: 3,
        name: "Sakura Sushi",
        cuisine: "Japanese",
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400",
        location: "Business District",
        priceRange: "$$$",
        description: "Fresh sushi and sashimi",
        menu: [
            { id: 7, name: "Salmon Sashimi", price: 24, category: "Sashimi", likes: 67, description: "Fresh Norwegian salmon" },
            { id: 8, name: "California Roll", price: 18, category: "Sushi", likes: 44, description: "Crab and avocado roll" },
            { id: 9, name: "Miso Soup", price: 6, category: "Soup", likes: 28, description: "Traditional soybean soup" }
        ]
    }
];

// Custom directive for auto-focus
const focusDirective = {
    mounted(el) {
        el.focus();
    }
};

// Enhanced data store with bookings
const dataStore = reactive({
    restaurants: [...sampleRestaurants],
    users: [
        { id: 1, username: "admin", password: "admin123", role: "admin", email: "admin@foodiefind.com" },
        { id: 2, username: "owner1", password: "pass123", role: "owner", email: "owner@bella.com", restaurantId: 1 },
        { id: 3, username: "john", password: "pass123", role: "customer", email: "john@email.com" }
    ],
    likedItems: new Set(),
    bookings: [
        {
            id: 1,
            userId: 3,
            restaurantId: 1,
            date: "2024-01-15",
            time: "19:00",
            guests: 4,
            name: "John Doe",
            phone: "(555) 999-8888",
            email: "john@email.com",
            specialRequests: "Window table preferred",
            status: "confirmed",
            createdAt: new Date().toISOString()
        }
    ]
});

// Navigation Component
const NavigationComponent = {
    props: ['isAuthenticated', 'currentUser'],
    emits: ['logout'],
    template: `
        <nav class="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
            <div class="container-fluid">
                <router-link to="/" class="navbar-brand">
                    <i class="fas fa-utensils me-2"></i>FoodieFind
                </router-link>
                
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span class="navbar-toggler-icon"></span>
                </button>
                
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav me-auto">
                        <li class="nav-item">
                            <router-link to="/" class="nav-link">Home</router-link>
                        </li>
                        <li class="nav-item">
                            <router-link to="/restaurants" class="nav-link">Restaurants</router-link>
                        </li>
                        <li v-if="isAuthenticated" class="nav-item">
                            <router-link to="/my-bookings" class="nav-link">
                                <i class="fas fa-calendar-check me-1"></i>My Bookings
                            </router-link>
                        </li>
                    </ul>
                    
                    <ul class="navbar-nav">
                        <li v-if="!isAuthenticated" class="nav-item">
                            <router-link to="/login" class="nav-link">Login</router-link>
                        </li>
                        <li v-if="!isAuthenticated" class="nav-item">
                            <router-link to="/register" class="nav-link">Register</router-link>
                        </li>
                        <li v-if="isAuthenticated" class="nav-item dropdown">
                            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                                Welcome, {{ currentUser.username }}
                            </a>
                            <ul class="dropdown-menu">
                                <li>
                                    <router-link to="/my-bookings" class="dropdown-item">
                                        <i class="fas fa-calendar-check me-2"></i>My Bookings
                                    </router-link>
                                </li>
                                <li v-if="currentUser.role === 'owner' || currentUser.role === 'admin'">
                                    <router-link to="/dashboard" class="dropdown-item">Dashboard</router-link>
                                </li>
                                <li><hr class="dropdown-divider"></li>
                                <li><a class="dropdown-item" href="#" @click="$emit('logout')">Logout</a></li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    `
};

// Home Component
const HomeComponent = {
    setup() {
        const searchQuery = ref('');
        const featuredRestaurants = computed(() => 
            dataStore.restaurants.slice(0, 3)
        );

        const handleSearch = () => {
            if (searchQuery.value.trim()) {
                window.location.hash = `/restaurants?search=${encodeURIComponent(searchQuery.value)}`;
            }
        };

        return {
            searchQuery,
            featuredRestaurants,
            handleSearch
        };
    },
    template: `
        <div>
            <section class="hero-section">
                <div class="container">
                    <div class="row justify-content-center">
                        <div class="col-lg-8 text-center">
                            <h1 class="display-4 fw-bold mb-4">Discover Amazing Food</h1>
                            <p class="lead mb-4">Find the best restaurants and dishes in your area</p>
                            
                            <div class="row justify-content-center">
                                <div class="col-md-6">
                                    <div class="input-group input-group-lg">
                                        <input 
                                            type="text" 
                                            class="form-control" 
                                            placeholder="Search restaurants or dishes..."
                                            v-model="searchQuery"
                                            @keyup.enter="handleSearch"
                                            v-focus>
                                        <button class="btn btn-light" @click="handleSearch">
                                            <i class="fas fa-search"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section class="py-5">
                <div class="container">
                    <h2 class="text-center mb-5 text-white fw-bold">Featured Restaurants</h2>
                    <div class="row">
                        <div v-for="restaurant in featuredRestaurants" :key="restaurant.id" class="col-lg-4 col-md-6 mb-4">
                            <div class="card restaurant-card h-100">
                                <img :src="restaurant.image" class="card-img-top" :alt="restaurant.name" style="height: 200px; object-fit: cover;">
                                <div class="card-body">
                                    <h5 class="card-title text-white fw-bold">{{ restaurant.name }}</h5>
                                    <p class="card-text text-white-50">{{ restaurant.description }}</p>
                                    <div class="d-flex justify-content-between align-items-center">
                                        <span class="rating-stars">
                                            <i v-for="n in 5" :key="n" 
                                               :class="n <= restaurant.rating ? 'fas fa-star' : 'far fa-star'"></i>
                                            <span class="text-white ms-2">{{ restaurant.rating }}</span>
                                        </span>
                                        <span class="badge bg-secondary">{{ restaurant.cuisine }}</span>
                                    </div>
                                </div>
                                <div class="card-footer">
                                    <router-link :to="'/restaurant/' + restaurant.id" class="btn btn-primary w-100">
                                        View Menu
                                    </router-link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    `
};

// Restaurant List Component
const RestaurantsComponent = {
    setup() {
        const searchQuery = ref('');
        const cuisineFilter = ref('');
        const priceFilter = ref('');
        const currentPage = ref(1);
        const itemsPerPage = 6;

        // Get search from URL params
        onMounted(() => {
            const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
            if (urlParams.get('search')) {
                searchQuery.value = urlParams.get('search');
            }
        });

        const filteredRestaurants = computed(() => {
            let filtered = dataStore.restaurants;

            if (searchQuery.value) {
                const query = searchQuery.value.toLowerCase();
                filtered = filtered.filter(restaurant => 
                    restaurant.name.toLowerCase().includes(query) ||
                    restaurant.cuisine.toLowerCase().includes(query) ||
                    restaurant.menu.some(item => item.name.toLowerCase().includes(query))
                );
            }

            if (cuisineFilter.value) {
                filtered = filtered.filter(restaurant => 
                    restaurant.cuisine === cuisineFilter.value
                );
            }

            if (priceFilter.value) {
                filtered = filtered.filter(restaurant => 
                    restaurant.priceRange === priceFilter.value
                );
            }

            return filtered;
        });

        const paginatedRestaurants = computed(() => {
            const start = (currentPage.value - 1) * itemsPerPage;
            const end = start + itemsPerPage;
            return filteredRestaurants.value.slice(start, end);
        });

        const totalPages = computed(() => 
            Math.ceil(filteredRestaurants.value.length / itemsPerPage)
        );

        const cuisines = computed(() => 
            [...new Set(dataStore.restaurants.map(r => r.cuisine))]
        );

        const priceRanges = ['$', '$$', '$$$'];

        const clearFilters = () => {
            searchQuery.value = '';
            cuisineFilter.value = '';
            priceFilter.value = '';
            currentPage.value = 1;
        };

        return {
            searchQuery,
            cuisineFilter,
            priceFilter,
            currentPage,
            paginatedRestaurants,
            totalPages,
            cuisines,
            priceRanges,
            clearFilters
        };
    },
    template: `
        <div class="py-4">
            <div class="container">
                <h1 class="mb-4 text-white fw-bold">
                    <i class="fas fa-store me-2 text-primary"></i>Restaurants
                </h1>
                
                <div class="search-filters">
                    <div class="row g-3">
                        <div class="col-md-4">
                            <label for="search" class="form-label">Search</label>
                            <input 
                                id="search"
                                type="text" 
                                class="form-control" 
                                placeholder="Restaurant name, cuisine, or dish..."
                                v-model="searchQuery">
                        </div>
                        <div class="col-md-3">
                            <label for="cuisine" class="form-label">Cuisine</label>
                            <select id="cuisine" class="form-select" v-model="cuisineFilter">
                                <option value="">All Cuisines</option>
                                <option v-for="cuisine in cuisines" :key="cuisine" :value="cuisine">
                                    {{ cuisine }}
                                </option>
                            </select>
                        </div>
                        <div class="col-md-3">
                            <label for="price" class="form-label">Price Range</label>
                            <select id="price" class="form-select" v-model="priceFilter">
                                <option value="">All Prices</option>
                                <option v-for="price in priceRanges" :key="price" :value="price">
                                    {{ price }}
                                </option>
                            </select>
                        </div>
                        <div class="col-md-2 d-flex align-items-end">
                            <button class="btn btn-outline-secondary w-100" @click="clearFilters">
                                Clear
                            </button>
                        </div>
                    </div>
                </div>

                <div v-if="paginatedRestaurants.length === 0" class="text-center py-5">
                    <h3 class="text-white">No restaurants found</h3>
                    <p class="text-white-50">Try adjusting your search criteria</p>
                </div>

                <div v-else class="row">
                    <div v-for="restaurant in paginatedRestaurants" :key="restaurant.id" class="col-lg-4 col-md-6 mb-4">
                        <div class="card restaurant-card h-100">
                            <img :src="restaurant.image" class="card-img-top" :alt="restaurant.name" style="height: 200px; object-fit: cover;">
                            <div class="card-body">
                                <h5 class="card-title text-white fw-bold">{{ restaurant.name }}</h5>
                                <p class="card-text text-white-50">{{ restaurant.description }}</p>
                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <span class="rating-stars">
                                        <i v-for="n in 5" :key="n" 
                                           :class="n <= restaurant.rating ? 'fas fa-star' : 'far fa-star'"></i>
                                        <span class="text-white ms-2">{{ restaurant.rating }}</span>
                                    </span>
                                    <span class="badge bg-secondary">{{ restaurant.cuisine }}</span>
                                </div>
                                <div class="d-flex justify-content-between align-items-center">
                                    <small class="text-white-50">{{ restaurant.location }}</small>
                                    <span class="fw-bold text-success">{{ restaurant.priceRange }}</span>
                                </div>
                            </div>
                            <div class="card-footer">
                                <router-link :to="'/restaurant/' + restaurant.id" class="btn btn-primary w-100">
                                    View Menu
                                </router-link>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Pagination -->
                <div v-if="totalPages > 1" class="pagination-wrapper">
                    <nav aria-label="Restaurant pagination">
                        <ul class="pagination">
                            <li class="page-item" :class="{ disabled: currentPage === 1 }">
                                <button class="page-link" @click="currentPage = Math.max(1, currentPage - 1)">
                                    Previous
                                </button>
                            </li>
                            <li v-for="page in totalPages" :key="page" 
                                class="page-item" 
                                :class="{ active: currentPage === page }">
                                <button class="page-link" @click="currentPage = page">
                                    {{ page }}
                                </button>
                            </li>
                            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                                <button class="page-link" @click="currentPage = Math.min(totalPages, currentPage + 1)">
                                    Next
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        </div>
    `
};

// Restaurant Detail Component
const RestaurantDetailComponent = {
    props: ['id', 'isAuthenticated', 'currentUser'],
    setup(props) {
        const restaurant = computed(() => 
            dataStore.restaurants.find(r => r.id === parseInt(props.id))
        );

        const menuFilter = ref('');
        const sortBy = ref('name');
        const showBookingModal = ref(false);
        const bookingForm = reactive({
            date: '',
            time: '',
            guests: 2,
            name: '',
            phone: '',
            email: '',
            specialRequests: ''
        });
        const bookingErrors = reactive({});
        const isSubmittingBooking = ref(false);

        // Initialize form with user data if logged in
        onMounted(() => {
            if (props.isAuthenticated && props.currentUser) {
                bookingForm.name = props.currentUser.username;
                bookingForm.email = props.currentUser.email || '';
            }
            
            // Set minimum date to today
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            bookingForm.date = tomorrow.toISOString().split('T')[0];
        });

        const filteredMenu = computed(() => {
            if (!restaurant.value) return [];
            
            let filtered = restaurant.value.menu;
            
            if (menuFilter.value) {
                filtered = filtered.filter(item => 
                    item.category === menuFilter.value
                );
            }

            return filtered.sort((a, b) => {
                if (sortBy.value === 'price') return a.price - b.price;
                if (sortBy.value === 'likes') return b.likes - a.likes;
                return a.name.localeCompare(b.name);
            });
        });

        const categories = computed(() => {
            if (!restaurant.value) return [];
            return [...new Set(restaurant.value.menu.map(item => item.category))];
        });

        const toggleLike = (itemId) => {
            if (dataStore.likedItems.has(itemId)) {
                dataStore.likedItems.delete(itemId);
                // In real app, would decrease likes in backend
            } else {
                dataStore.likedItems.add(itemId);
                // In real app, would increase likes in backend
            }
        };

        const isLiked = (itemId) => dataStore.likedItems.has(itemId);

        const openBookingModal = () => {
            if (!props.isAuthenticated) {
                alert('Please login to make a reservation');
                return;
            }
            showBookingModal.value = true;
        };

        const closeBookingModal = () => {
            showBookingModal.value = false;
            Object.assign(bookingErrors, {});
        };

        const validateBookingForm = () => {
            const errors = {};
            
            if (!bookingForm.date) {
                errors.date = 'Date is required';
            } else {
                const selectedDate = new Date(bookingForm.date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (selectedDate < today) {
                    errors.date = 'Date cannot be in the past';
                }
            }
            
            if (!bookingForm.time) {
                errors.time = 'Time is required';
            }
            
            if (!bookingForm.name.trim()) {
                errors.name = 'Name is required';
            }
            
            if (!bookingForm.phone.trim()) {
                errors.phone = 'Phone is required';
            }
            
            if (!bookingForm.email.trim()) {
                errors.email = 'Email is required';
            } else if (!/\S+@\S+\.\S+/.test(bookingForm.email)) {
                errors.email = 'Email is invalid';
            }
            
            if (bookingForm.guests < 1 || bookingForm.guests > 20) {
                errors.guests = 'Number of guests must be between 1 and 20';
            }

            Object.assign(bookingErrors, errors);
            return Object.keys(errors).length === 0;
        };

        const submitBooking = () => {
            if (!validateBookingForm()) return;

            isSubmittingBooking.value = true;

            setTimeout(() => {
                const newBooking = {
                    id: dataStore.bookings.length + 1,
                    userId: props.currentUser.id,
                    restaurantId: restaurant.value.id,
                    date: bookingForm.date,
                    time: bookingForm.time,
                    guests: bookingForm.guests,
                    name: bookingForm.name,
                    phone: bookingForm.phone,
                    email: bookingForm.email,
                    specialRequests: bookingForm.specialRequests,
                    status: 'confirmed',
                    createdAt: new Date().toISOString()
                };

                dataStore.bookings.push(newBooking);
                
                isSubmittingBooking.value = false;
                closeBookingModal();
                
                // Reset form
                Object.assign(bookingForm, {
                    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                    time: '',
                    guests: 2,
                    name: props.currentUser.username,
                    phone: '',
                    email: props.currentUser.email || '',
                    specialRequests: ''
                });
                
                // Show success notification
                window.app.showNotification({
                    type: 'success',
                    title: 'Booking Confirmed!',
                    message: `Your reservation at ${restaurant.value.name} for ${new Date(newBooking.date).toLocaleDateString()} at ${newBooking.time} has been confirmed.`
                });
            }, 1500);
        };

        const timeSlots = [
            '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
            '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'
        ];

        return {
            restaurant,
            menuFilter,
            sortBy,
            filteredMenu,
            categories,
            toggleLike,
            isLiked,
            showBookingModal,
            bookingForm,
            bookingErrors,
            isSubmittingBooking,
            openBookingModal,
            closeBookingModal,
            submitBooking,
            timeSlots
        };
    },
    template: `
        <div v-if="!restaurant" class="container py-5">
            <div class="alert alert-danger">Restaurant not found</div>
        </div>
        
        <div v-else class="py-4">
            <div class="container">
                <!-- Restaurant Header -->
                <div class="row mb-5">
                    <div class="col-md-6">
                        <img :src="restaurant.image" :alt="restaurant.name" class="img-fluid rounded-3" style="width: 100%; height: 320px; object-fit: cover;">
                    </div>
                    <div class="col-md-6">
                        <h1 class="display-6 fw-bold mb-3">{{ restaurant.name }}</h1>
                        <p class="lead text-muted mb-4">{{ restaurant.description }}</p>
                        <div class="mb-4">
                            <span class="rating-stars me-4">
                                <i v-for="n in 5" :key="n" 
                                   :class="n <= restaurant.rating ? 'fas fa-star' : 'far fa-star'"></i>
                                <span class="ms-2 fw-semibold">{{ restaurant.rating }} rating</span>
                            </span>
                            <span class="badge bg-primary me-2">{{ restaurant.cuisine }}</span>
                            <span class="badge bg-success">{{ restaurant.priceRange }}</span>
                        </div>
                        <p class="mb-4">
                            <i class="fas fa-map-marker-alt text-primary me-2"></i>
                            <span class="fw-medium">{{ restaurant.location }}</span>
                        </p>
                        
                        <!-- Enhanced Booking Button -->
                        <div class="mt-4">
                            <button v-if="isAuthenticated" class="btn btn-warning btn-lg px-4 me-3" @click="openBookingModal">
                                <i class="fas fa-calendar-plus me-2"></i>Make Reservation
                            </button>
                            <router-link v-else to="/login" class="btn btn-outline-warning btn-lg px-4">
                                <i class="fas fa-sign-in-alt me-2"></i>Login to Book
                            </router-link>
                        </div>
                    </div>
                </div>

                <!-- Enhanced Menu Filters -->
                <div class="search-filters">
                    <div class="row">
                        <div class="col-md-6">
                            <label for="category-filter" class="form-label fw-semibold">
                                <i class="fas fa-filter me-2 text-primary"></i>Filter by Category
                            </label>
                            <select id="category-filter" class="form-select" v-model="menuFilter">
                                <option value="">All Categories</option>
                                <option v-for="category in categories" :key="category" :value="category">
                                    {{ category }}
                                </option>
                            </select>
                        </div>
                        <div class="col-md-6">
                            <label for="sort-by" class="form-label fw-semibold">
                                <i class="fas fa-sort me-2 text-primary"></i>Sort by
                            </label>
                            <select id="sort-by" class="form-select" v-model="sortBy">
                                <option value="name">Name</option>
                                <option value="price">Price</option>
                                <option value="likes">Popularity</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Enhanced Menu Items -->
                <h2 class="mb-4 fw-bold">
                    <i class="fas fa-utensils text-primary me-2"></i>Our Menu
                </h2>
                <div class="row">
                    <div v-for="item in filteredMenu" :key="item.id" class="col-lg-6 mb-4">
                        <div class="food-item h-100">
                            <div class="d-flex justify-content-between align-items-start">
                                <div class="flex-grow-1">
                                    <h5 class="fw-bold mb-2">{{ item.name }}</h5>
                                    <p class="text-muted mb-3">{{ item.description }}</p>
                                    <span class="badge bg-light text-dark border">{{ item.category }}</span>
                                </div>
                                <div class="text-end ms-3">
                                    <div class="h5 text-primary mb-3 fw-bold">\${{ item.price }}</div>
                                    <button 
                                        v-if="isAuthenticated"
                                        class="like-btn btn btn-sm"
                                        :class="{ 'text-danger': isLiked(item.id), 'text-muted': !isLiked(item.id) }"
                                        @click="toggleLike(item.id)"
                                        :aria-label="isLiked(item.id) ? 'Unlike this dish' : 'Like this dish'">
                                        <i :class="isLiked(item.id) ? 'fas fa-heart' : 'far fa-heart'"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="mt-3 pt-2 border-top">
                                <small class="text-muted">
                                    <i class="fas fa-heart text-danger me-1"></i>
                                    {{ item.likes + (isLiked(item.id) ? 1 : 0) }} likes
                                </small>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Booking Modal -->
                <div v-if="showBookingModal" class="modal d-block" style="background-color: rgba(0,0,0,0.5);">
                    <div class="modal-dialog modal-lg">
                        <div class="modal-content">
                            <div class="modal-header bg-warning">
                                <h5 class="modal-title fw-bold">
                                    <i class="fas fa-calendar-plus me-2"></i>Make a Reservation - {{ restaurant.name }}
                                </h5>
                                <button type="button" class="btn-close" @click="closeBookingModal"></button>
                            </div>
                            <div class="modal-body">
                                <form @submit.prevent="submitBooking">
                                    <div class="row g-3">
                                        <div class="col-md-6">
                                            <label for="booking-date" class="form-label fw-bold">Date</label>
                                            <input 
                                                type="date" 
                                                id="booking-date"
                                                class="form-control"
                                                :class="{ 'is-invalid': bookingErrors.date }"
                                                v-model="bookingForm.date"
                                                :min="new Date().toISOString().split('T')[0]"
                                                required>
                                            <div v-if="bookingErrors.date" class="invalid-feedback">
                                                {{ bookingErrors.date }}
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <label for="booking-time" class="form-label fw-bold">Time</label>
                                            <select 
                                                id="booking-time"
                                                class="form-select"
                                                :class="{ 'is-invalid': bookingErrors.time }"
                                                v-model="bookingForm.time"
                                                required>
                                                <option value="">Select time</option>
                                                <option v-for="time in timeSlots" :key="time" :value="time">
                                                    {{ time }}
                                                </option>
                                            </select>
                                            <div v-if="bookingErrors.time" class="invalid-feedback">
                                                {{ bookingErrors.time }}
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <label for="booking-guests" class="form-label fw-bold">Number of Guests</label>
                                            <input 
                                                type="number" 
                                                id="booking-guests"
                                                class="form-control"
                                                :class="{ 'is-invalid': bookingErrors.guests }"
                                                v-model="bookingForm.guests"
                                                min="1"
                                                max="20"
                                                required>
                                            <div v-if="bookingErrors.guests" class="invalid-feedback">
                                                {{ bookingErrors.guests }}
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <label for="booking-name" class="form-label fw-bold">Contact Name</label>
                                            <input 
                                                type="text" 
                                                id="booking-name"
                                                class="form-control"
                                                :class="{ 'is-invalid': bookingErrors.name }"
                                                v-model="bookingForm.name"
                                                required>
                                            <div v-if="bookingErrors.name" class="invalid-feedback">
                                                {{ bookingErrors.name }}
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <label for="booking-phone" class="form-label fw-bold">Phone</label>
                                            <input 
                                                type="tel" 
                                                id="booking-phone"
                                                class="form-control"
                                                :class="{ 'is-invalid': bookingErrors.phone }"
                                                v-model="bookingForm.phone"
                                                required>
                                            <div v-if="bookingErrors.phone" class="invalid-feedback">
                                                {{ bookingErrors.phone }}
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <label for="booking-email" class="form-label fw-bold">Email</label>
                                            <input 
                                                type="email" 
                                                id="booking-email"
                                                class="form-control"
                                                :class="{ 'is-invalid': bookingErrors.email }"
                                                v-model="bookingForm.email"
                                                required>
                                            <div v-if="bookingErrors.email" class="invalid-feedback">
                                                {{ bookingErrors.email }}
                                            </div>
                                        </div>
                                        <div class="col-12">
                                            <label for="booking-requests" class="form-label fw-bold">Special Requests (Optional)</label>
                                            <textarea 
                                                id="booking-requests"
                                                class="form-control"
                                                v-model="bookingForm.specialRequests"
                                                rows="3"
                                                placeholder="Any special requests or dietary requirements..."></textarea>
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-outline-secondary" @click="closeBookingModal">
                                    Cancel
                                </button>
                                <button 
                                    type="button" 
                                    class="btn btn-warning btn-lg px-4"
                                    @click="submitBooking"
                                    :disabled="isSubmittingBooking">
                                    <span v-if="isSubmittingBooking" class="spinner-border spinner-border-sm me-2"></span>
                                    <i v-else class="fas fa-check me-2"></i>
                                    {{ isSubmittingBooking ? 'Processing...' : 'Confirm Reservation' }}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
};

// Notification Component
const NotificationComponent = {
    props: ['notifications'],
    emits: ['remove'],
    template: `
        <div class="notification-container">
            <transition-group name="notification" tag="div">
                <div 
                    v-for="notification in notifications" 
                    :key="notification.id"
                    class="notification"
                    :class="'notification-' + notification.type">
                    <div class="notification-content">
                        <div class="notification-icon">
                            <i :class="getIcon(notification.type)"></i>
                        </div>
                        <div class="notification-text">
                            <h6 class="notification-title">{{ notification.title }}</h6>
                            <p class="notification-message">{{ notification.message }}</p>
                        </div>
                        <button class="notification-close" @click="$emit('remove', notification.id)">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            </transition-group>
        </div>
    `,
    methods: {
        getIcon(type) {
            const icons = {
                success: 'fas fa-check-circle',
                error: 'fas fa-exclamation-circle',
                warning: 'fas fa-exclamation-triangle',
                info: 'fas fa-info-circle'
            };
            return icons[type] || 'fas fa-info-circle';
        }
    }
};

// Enhanced Login Component template
const LoginComponent = {
    emits: ['login'],
    setup(props, { emit }) {
        const form = reactive({
            username: '',
            password: ''
        });
        const errors = reactive({});
        const isLoading = ref(false);

        const validateForm = () => {
            const newErrors = {};
            
            if (!form.username.trim()) {
                newErrors.username = 'Username is required';
            }
            
            if (!form.password) {
                newErrors.password = 'Password is required';
            }

            Object.assign(errors, newErrors);
            return Object.keys(newErrors).length === 0;
        };

        const handleSubmit = () => {
            if (!validateForm()) return;

            isLoading.value = true;
            
            // Simulate API call
            setTimeout(() => {
                const user = dataStore.users.find(u => 
                    u.username === form.username && u.password === form.password
                );

                if (user) {
                    emit('login', user);
                } else {
                    errors.general = 'Invalid username or password';
                }
                
                isLoading.value = false;
            }, 1000);
        };

        return {
            form,
            errors,
            isLoading,
            handleSubmit
        };
    },
    template: `
        <div class="container py-5">
            <div class="row justify-content-center">
                <div class="col-md-6 col-lg-4">
                    <div class="card border-0 shadow-lg">
                        <div class="card-body p-4">
                            <div class="text-center mb-4">
                                <i class="fas fa-user-circle fa-3x text-primary mb-3"></i>
                                <h2 class="fw-bold">Welcome Back</h2>
                                <p class="text-muted">Sign in to your account</p>
                            </div>
                            
                            <form @submit.prevent="handleSubmit">
                                <div v-if="errors.general" class="alert alert-danger border-0">
                                    <i class="fas fa-exclamation-triangle me-2"></i>
                                    {{ errors.general }}
                                </div>
                                
                                <div class="mb-3">
                                    <label for="username" class="form-label fw-semibold">
                                        <i class="fas fa-user me-2 text-primary"></i>Username
                                    </label>
                                    <input 
                                        type="text" 
                                        id="username"
                                        class="form-control"
                                        :class="{ 'is-invalid': errors.username }"
                                        v-model="form.username"
                                        v-focus
                                        required>
                                    <div v-if="errors.username" class="invalid-feedback">
                                        {{ errors.username }}
                                    </div>
                                </div>
                                
                                <div class="mb-4">
                                    <label for="password" class="form-label fw-semibold">
                                        <i class="fas fa-lock me-2 text-primary"></i>Password
                                    </label>
                                    <input 
                                        type="password" 
                                        id="password"
                                        class="form-control"
                                        :class="{ 'is-invalid': errors.password }"
                                        v-model="form.password"
                                        required>
                                    <div v-if="errors.password" class="invalid-feedback">
                                        {{ errors.password }}
                                    </div>
                                </div>
                                
                                <button 
                                    type="submit" 
                                    class="btn btn-primary w-100 py-2"
                                    :disabled="isLoading">
                                    <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                                    <i v-else class="fas fa-sign-in-alt me-2"></i>
                                    {{ isLoading ? 'Logging in...' : 'Sign In' }}
                                </button>
                            </form>
                            
                            <div class="text-center mt-4">
                                <p class="mb-2">Don't have an account? 
                                    <router-link to="/register" class="text-primary fw-semibold text-decoration-none">
                                        Register here
                                    </router-link>
                                </p>
                                <div class="bg-light rounded p-2">
                                    <small class="text-muted">
                                        <i class="fas fa-info-circle me-1"></i>
                                        Demo: admin/admin123 or owner1/pass123
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
};

// Enhanced Register Component template  
const RegisterComponent = {
    emits: ['login'],
    setup(props, { emit }) {
        const form = reactive({
            username: '',
            email: '',
            password: '',
            confirmPassword: ''
        });
        const errors = reactive({});
        const isLoading = ref(false);

        const validateForm = () => {
            const newErrors = {};
            
            if (!form.username.trim()) {
                newErrors.username = 'Username is required';
            } else if (form.username.length < 3) {
                newErrors.username = 'Username must be at least 3 characters';
            }
            
            if (!form.email.trim()) {
                newErrors.email = 'Email is required';
            } else if (!/\S+@\S+\.\S+/.test(form.email)) {
                newErrors.email = 'Email is invalid';
            }
            
            if (!form.password) {
                newErrors.password = 'Password is required';
            } else if (form.password.length < 6) {
                newErrors.password = 'Password must be at least 6 characters';
            }
            
            if (form.password !== form.confirmPassword) {
                newErrors.confirmPassword = 'Passwords do not match';
            }

            Object.assign(errors, newErrors);
            return Object.keys(newErrors).length === 0;
        };

        const handleSubmit = () => {
            if (!validateForm()) return;

            isLoading.value = true;
            
            // Simulate API call
            setTimeout(() => {
                // Check if username already exists
                if (dataStore.users.find(u => u.username === form.username)) {
                    errors.username = 'Username already exists';
                    isLoading.value = false;
                    return;
                }

                const newUser = {
                    id: dataStore.users.length + 1,
                    username: form.username,
                    email: form.email,
                    password: form.password,
                    role: 'customer'
                };

                dataStore.users.push(newUser);
                emit('login', newUser);
                isLoading.value = false;
            }, 1000);
        };

        return {
            form,
            errors,
            isLoading,
            handleSubmit
        };
    },
    template: `
        <div class="container py-5">
            <div class="row justify-content-center">
                <div class="col-md-6 col-lg-4">
                    <div class="card border-0 shadow-lg">
                        <div class="card-body p-4">
                            <div class="text-center mb-4">
                                <i class="fas fa-user-plus fa-3x text-primary mb-3"></i>
                                <h2 class="fw-bold">Join FoodieFind</h2>
                                <p class="text-muted">Create your account to start booking</p>
                            </div>
                            
                            <form @submit.prevent="handleSubmit">
                                <div class="mb-3">
                                    <label for="reg-username" class="form-label fw-semibold">
                                        <i class="fas fa-user me-2 text-primary"></i>Username
                                    </label>
                                    <input 
                                        type="text" 
                                        id="reg-username"
                                        class="form-control"
                                        :class="{ 'is-invalid': errors.username }"
                                        v-model="form.username"
                                        v-focus
                                        required>
                                    <div v-if="errors.username" class="invalid-feedback">
                                        {{ errors.username }}
                                    </div>
                                </div>
                                
                                <div class="mb-3">
                                    <label for="reg-email" class="form-label fw-semibold">
                                        <i class="fas fa-envelope me-2 text-primary"></i>Email
                                    </label>
                                    <input 
                                        type="email" 
                                        id="reg-email"
                                        class="form-control"
                                        :class="{ 'is-invalid': errors.email }"
                                        v-model="form.email"
                                        required>
                                    <div v-if="errors.email" class="invalid-feedback">
                                        {{ errors.email }}
                                    </div>
                                </div>
                                
                                <div class="mb-3">
                                    <label for="reg-password" class="form-label fw-semibold">
                                        <i class="fas fa-lock me-2 text-primary"></i>Password
                                    </label>
                                    <input 
                                        type="password" 
                                        id="reg-password"
                                        class="form-control"
                                        :class="{ 'is-invalid': errors.password }"
                                        v-model="form.password"
                                        required>
                                    <div v-if="errors.password" class="invalid-feedback">
                                        {{ errors.password }}
                                    </div>
                                </div>
                                
                                <div class="mb-4">
                                    <label for="confirm-password" class="form-label fw-semibold">
                                        <i class="fas fa-check-circle me-2 text-primary"></i>Confirm Password
                                    </label>
                                    <input 
                                        type="password" 
                                        id="confirm-password"
                                        class="form-control"
                                        :class="{ 'is-invalid': errors.confirmPassword }"
                                        v-model="form.confirmPassword"
                                        required>
                                    <div v-if="errors.confirmPassword" class="invalid-feedback">
                                        {{ errors.confirmPassword }}
                                    </div>
                                </div>
                                
                                <button 
                                    type="submit" 
                                    class="btn btn-primary w-100 py-2"
                                    :disabled="isLoading">
                                    <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                                    <i v-else class="fas fa-user-plus me-2"></i>
                                    {{ isLoading ? 'Creating Account...' : 'Create Account' }}
                                </button>
                            </form>
                            
                            <div class="text-center mt-4">
                                <p>Already have an account? 
                                    <router-link to="/login" class="text-primary fw-semibold text-decoration-none">
                                        Sign in here
                                    </router-link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
};

// Dashboard Component (for restaurant owners/admins)
const DashboardComponent = {
    props: ['currentUser'],
    setup(props) {
        const activeTab = ref('overview');
        const newDish = reactive({
            name: '',
            price: '',
            category: '',
            description: ''
        });
        const editingDish = ref(null);

        const userRestaurant = computed(() => {
            if (props.currentUser.role === 'admin') {
                return dataStore.restaurants[0]; // For demo, admin can edit first restaurant
            }
            return dataStore.restaurants.find(r => r.id === props.currentUser.restaurantId);
        });

        const addDish = () => {
            if (!userRestaurant.value) return;
            
            const dish = {
                id: Date.now(),
                name: newDish.name,
                price: parseFloat(newDish.price),
                category: newDish.category,
                description: newDish.description,
                likes: 0
            };

            userRestaurant.value.menu.push(dish);
            
            // Reset form
            Object.assign(newDish, {
                name: '',
                price: '',
                category: '',
                description: ''
            });
        };

        const editDish = (dish) => {
            editingDish.value = { ...dish };
        };

        const saveDish = () => {
            if (!editingDish.value || !userRestaurant.value) return;
            
            const index = userRestaurant.value.menu.findIndex(d => d.id === editingDish.value.id);
            if (index !== -1) {
                userRestaurant.value.menu[index] = { ...editingDish.value };
            }
            editingDish.value = null;
        };

        const deleteDish = (dishId) => {
            if (!userRestaurant.value || !confirm('Are you sure you want to delete this dish?')) return;
            
            const index = userRestaurant.value.menu.findIndex(d => d.id === dishId);
            if (index !== -1) {
                userRestaurant.value.menu.splice(index, 1);
            }
        };

        return {
            activeTab,
            newDish,
            editingDish,
            userRestaurant,
            addDish,
            editDish,
            saveDish,
            deleteDish
        };
    },
    template: `
        <div class="container py-4">
            <h1 class="text-white">Dashboard</h1>
            
            <div v-if="!userRestaurant" class="alert alert-warning">
                No restaurant associated with your account.
            </div>
            
            <div v-else>
                <h2 class="text-white">{{ userRestaurant.name }}</h2>
                
                <ul class="nav nav-tabs mb-4">
                    <li class="nav-item">
                        <button class="nav-link" :class="{ active: activeTab === 'overview' }" @click="activeTab = 'overview'">
                            Overview
                        </button>
                    </li>
                    <li class="nav-item">
                        <button class="nav-link" :class="{ active: activeTab === 'menu' }" @click="activeTab = 'menu'">
                            Manage Menu
                        </button>
                    </li>
                </ul>

                <!-- Overview Tab -->
                <div v-if="activeTab === 'overview'" class="tab-content">
                    <div class="row">
                        <div class="col-md-3">
                            <div class="card text-center">
                                <div class="card-body">
                                    <h3 class="text-white">{{ userRestaurant.menu.length }}</h3>
                                    <p class="text-white">Menu Items</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card text-center">
                                <div class="card-body">
                                    <h3 class="text-white">{{ userRestaurant.rating }}</h3>
                                    <p class="text-white">Average Rating</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card text-center">
                                <div class="card-body">
                                    <h3 class="text-white">{{ userRestaurant.menu.reduce((sum, item) => sum + item.likes, 0) }}</h3>
                                    <p class="text-white">Total Likes</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card text-center">
                                <div class="card-body">
                                    <h3 class="text-white">{{ userRestaurant.cuisine }}</h3>
                                    <p class="text-white">Cuisine Type</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Menu Management Tab -->
                <div v-if="activeTab === 'menu'" class="tab-content">
                    <!-- Add New Dish Form -->
                    <div class="card mb-4">
                        <div class="card-header">
                            <h4 class="text-white">Add New Dish</h4>
                        </div>
                        <div class="card-body">
                            <form @submit.prevent="addDish" class="row g-3">
                                <div class="col-md-6">
                                    <label for="dish-name" class="form-label text-white">Dish Name</label>
                                    <input type="text" id="dish-name" class="form-control" v-model="newDish.name" required>
                                </div>
                                <div class="col-md-3">
                                    <label for="dish-price" class="form-label text-white">Price ($)</label>
                                    <input type="number" id="dish-price" class="form-control" v-model="newDish.price" step="0.01" required>
                                </div>
                                <div class="col-md-3">
                                    <label for="dish-category" class="form-label text-white">Category</label>
                                    <input type="text" id="dish-category" class="form-control" v-model="newDish.category" required>
                                </div>
                                <div class="col-12">
                                    <label for="dish-description" class="form-label text-white">Description</label>
                                    <textarea id="dish-description" class="form-control" v-model="newDish.description" rows="2" required></textarea>
                                </div>
                                <div class="col-12">
                                    <button type="submit" class="btn btn-primary">Add Dish</button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <!-- Menu Items List -->
                    <div class="card">
                        <div class="card-header">
                            <h4 class="text-white">Current Menu Items</h4>
                        </div>
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table table-striped text-white">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Category</th>
                                            <th>Price</th>
                                            <th>Likes</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="dish in userRestaurant.menu" :key="dish.id">
                                            <td v-if="editingDish && editingDish.id === dish.id">
                                                <input type="text" class="form-control form-control-sm" v-model="editingDish.name">
                                            </td>
                                            <td v-else>{{ dish.name }}</td>
                                            
                                            <td v-if="editingDish && editingDish.id === dish.id">
                                                <input type="text" class="form-control form-control-sm" v-model="editingDish.category">
                                            </td>
                                            <td v-else>{{ dish.category }}</td>
                                            
                                            <td v-if="editingDish && editingDish.id === dish.id">
                                                <input type="number" class="form-control form-control-sm" v-model="editingDish.price" step="0.01">
                                            </td>
                                            <td v-else>\${{ dish.price }}</td>
                                            
                                            <td>{{ dish.likes }}</td>
                                            
                                            <td>
                                                <div v-if="editingDish && editingDish.id === dish.id" class="btn-group btn-group-sm">
                                                    <button class="btn btn-success" @click="saveDish">Save</button>
                                                    <button class="btn btn-secondary" @click="editingDish = null">Cancel</button>
                                                </div>
                                                <div v-else class="btn-group btn-group-sm">
                                                    <button class="btn btn-outline-primary" @click="editDish(dish)">Edit</button>
                                                    <button class="btn btn-outline-danger" @click="deleteDish(dish.id)">Delete</button>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
};

// Enhanced My Bookings Component
const MyBookingsComponent = {
    props: ['currentUser'],
    setup(props) {
        const showEditModal = ref(false);
        const showCancelModal = ref(false);
        const editingBooking = ref(null);
        const cancellingBooking = ref(null);
        const editForm = reactive({
            date: '',
            time: '',
            guests: 2,
            name: '',
            phone: '',
            email: '',
            specialRequests: ''
        });
        const editErrors = reactive({});

        const userBookings = computed(() => {
            if (!props.currentUser) return [];
            return dataStore.bookings
                .filter(booking => booking.userId === props.currentUser.id)
                .map(booking => ({
                    ...booking,
                    restaurant: dataStore.restaurants.find(r => r.id === booking.restaurantId)
                }))
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        });

        const upcomingBookings = computed(() => 
            userBookings.value.filter(booking => {
                const bookingDate = new Date(booking.date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return bookingDate >= today && booking.status === 'confirmed';
            })
        );

        const pastBookings = computed(() => 
            userBookings.value.filter(booking => {
                const bookingDate = new Date(booking.date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return bookingDate < today || booking.status === 'cancelled';
            })
        );

        const cancelBooking = (bookingId) => {
            const booking = dataStore.bookings.find(b => b.id === bookingId);
            if (!booking) return;

            if (confirm('Are you sure you want to cancel this reservation?')) {
                booking.status = 'cancelled';
                
                // Show cancel notification
                window.app.showNotification({
                    type: 'warning',
                    title: 'Booking Cancelled',
                    message: `Your reservation at ${booking.restaurant?.name || 'the restaurant'} has been cancelled successfully.`
                });
            }
        };

        const openEditModal = (booking) => {
            editingBooking.value = booking;
            Object.assign(editForm, {
                date: booking.date,
                time: booking.time,
                guests: booking.guests,
                name: booking.name,
                phone: booking.phone,
                email: booking.email,
                specialRequests: booking.specialRequests
            });
            showEditModal.value = true;
        };

        const closeEditModal = () => {
            showEditModal.value = false;
            editingBooking.value = null;
            Object.assign(editErrors, {});
        };

        const openCancelModal = (booking) => {
            cancellingBooking.value = booking;
            showCancelModal.value = true;
        };

        const closeCancelModal = () => {
            showCancelModal.value = false;
            cancellingBooking.value = null;
        };

        const confirmCancelBooking = () => {
            if (cancellingBooking.value) {
                const booking = dataStore.bookings.find(b => b.id === cancellingBooking.value.id);
                if (booking) {
                    booking.status = 'cancelled';
                    
                    // Show cancel notification
                    window.app.showNotification({
                        type: 'warning',
                        title: 'Booking Cancelled',
                        message: `Your reservation at ${booking.restaurant?.name || 'the restaurant'} has been cancelled successfully.`
                    });
                }
                closeCancelModal();
            }
        };

        const validateEditForm = () => {
            const errors = {};
            
            if (!editForm.date) {
                errors.date = 'Date is required';
            } else {
                const selectedDate = new Date(editForm.date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (selectedDate < today) {
                    errors.date = 'Date cannot be in the past';
                }
            }
            
            if (!editForm.time) {
                errors.time = 'Time is required';
            }
            
            if (!editForm.name.trim()) {
                errors.name = 'Name is required';
            }
            
            if (!editForm.phone.trim()) {
                errors.phone = 'Phone is required';
            }
            
            if (!editForm.email.trim()) {
                errors.email = 'Email is required';
            } else if (!/\S+@\S+\.\S+/.test(editForm.email)) {
                errors.email = 'Email is invalid';
            }
            
            if (editForm.guests < 1 || editForm.guests > 20) {
                errors.guests = 'Number of guests must be between 1 and 20';
            }

            Object.assign(editErrors, errors);
            return Object.keys(errors).length === 0;
        };

        const updateBooking = () => {
            if (!validateEditForm()) return;

            const booking = dataStore.bookings.find(b => b.id === editingBooking.value.id);
            if (booking) {
                Object.assign(booking, {
                    date: editForm.date,
                    time: editForm.time,
                    guests: editForm.guests,
                    name: editForm.name,
                    phone: editForm.phone,
                    email: editForm.email,
                    specialRequests: editForm.specialRequests
                });
                closeEditModal();
                
                // Show update notification
                window.app.showNotification({
                    type: 'success',
                    title: 'Booking Updated!',
                    message: 'Your reservation has been updated successfully.'
                });
            }
        };

        const getStatusBadge = (status) => {
            const badges = {
                confirmed: 'bg-success',
                pending: 'bg-warning',
                cancelled: 'bg-danger'
            };
            return badges[status] || 'bg-secondary';
        };

        const timeSlots = [
            '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
            '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'
        ];

        return {
            userBookings,
            upcomingBookings,
            pastBookings,
            showCancelModal,
            cancellingBooking,
            openCancelModal,
            closeCancelModal,
            confirmCancelBooking,
            getStatusBadge,
            showEditModal,
            editingBooking,
            editForm,
            editErrors,
            openEditModal,
            closeEditModal,
            updateBooking,
            timeSlots
        };
    },
    template: `
        <div class="container py-5">
            <h1 class="display-5 fw-bold mb-4 text-white">
                <i class="fas fa-calendar-check me-3"></i>My Reservations
            </h1>
            
            <div v-if="userBookings.length === 0" class="text-center py-5">
                <i class="fas fa-calendar-times fa-5x text-muted mb-4"></i>
                <h3 class="text-white">No reservations found</h3>
                <p class="text-white-50">You haven't made any reservations yet.</p>
                <router-link to="/restaurants" class="btn btn-primary">
                    <i class="fas fa-search me-2"></i>Find Restaurants
                </router-link>
            </div>

            <div v-else>
                <!-- Upcoming Bookings -->
                <div v-if="upcomingBookings.length > 0" class="mb-5">
                    <h3 class="mb-4 text-success fw-bold">
                        <i class="fas fa-calendar-day me-2"></i>Upcoming Reservations
                    </h3>
                    <div class="row">
                        <div v-for="booking in upcomingBookings" :key="booking.id" class="col-lg-6 mb-4">
                            <div class="card booking-card h-100 border-0 shadow-sm border-start border-success border-4">
                                <div class="card-header bg-light">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <h5 class="mb-0 fw-bold text-white">{{ booking.restaurant.name }}</h5>
                                        <span class="badge fs-6" :class="getStatusBadge(booking.status)">
                                            {{ booking.status.charAt(0).toUpperCase() + booking.status.slice(1) }}
                                        </span>
                                    </div>
                                </div>
                                <div class="card-body">
                                    <div class="row g-2 mb-3">
                                        <div class="col-6">
                                            <strong class="text-white"><i class="fas fa-calendar me-2 text-primary"></i>Date:</strong><br>
                                            <span class="text-white-50">{{ new Date(booking.date).toLocaleDateString() }}</span>
                                        </div>
                                        <div class="col-6">
                                            <strong class="text-white"><i class="fas fa-clock me-2 text-primary"></i>Time:</strong><br>
                                            <span class="text-white-50">{{ booking.time }}</span>
                                        </div>
                                        <div class="col-6">
                                            <strong class="text-white"><i class="fas fa-users me-2 text-primary"></i>Guests:</strong><br>
                                            <span class="text-white-50">{{ booking.guests }}</span>
                                        </div>
                                        <div class="col-6">
                                            <strong class="text-white"><i class="fas fa-phone me-2 text-primary"></i>Phone:</strong><br>
                                            <span class="text-white-50">{{ booking.phone }}</span>
                                        </div>
                                    </div>
                                    
                                    <div v-if="booking.specialRequests" class="mb-3">
                                        <strong class="text-white"><i class="fas fa-comment me-2 text-primary"></i>Special Requests:</strong><br>
                                        <small class="text-white-50">{{ booking.specialRequests }}</small>
                                    </div>
                                </div>
                                <div class="card-footer bg-transparent">
                                    <div class="d-flex gap-2">
                                        <button class="btn btn-outline-primary btn-sm" @click="openEditModal(booking)">
                                            <i class="fas fa-edit me-1"></i>Edit
                                        </button>
                                        <router-link :to="'/restaurant/' + booking.restaurantId" class="btn btn-outline-info btn-sm">
                                            <i class="fas fa-eye me-1"></i>View Restaurant
                                        </router-link>
                                        <button class="btn btn-outline-danger btn-sm" @click="openCancelModal(booking)">
                                            <i class="fas fa-times me-1"></i>Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Past Bookings -->
                <div v-if="pastBookings.length > 0">
                    <h3 class="mb-4 text-muted fw-bold">
                        <i class="fas fa-history me-2"></i>Past Reservations
                    </h3>
                    <div class="row">
                        <div v-for="booking in pastBookings" :key="booking.id" class="col-lg-6 mb-4">
                            <div class="card booking-card h-100 border-0 shadow-sm opacity-75">
                                <div class="card-header bg-light">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <h5 class="mb-0 fw-bold text-white">{{ booking.restaurant.name }}</h5>
                                        <span class="badge fs-6" :class="getStatusBadge(booking.status)">
                                            {{ booking.status.charAt(0).toUpperCase() + booking.status.slice(1) }}
                                        </span>
                                    </div>
                                </div>
                                <div class="card-body">
                                    <div class="row g-2 mb-3">
                                        <div class="col-6">
                                            <strong class="text-white"><i class="fas fa-calendar me-2 text-muted"></i>Date:</strong><br>
                                            <span class="text-white-50">{{ new Date(booking.date).toLocaleDateString() }}</span>
                                        </div>
                                        <div class="col-6">
                                            <strong class="text-white"><i class="fas fa-clock me-2 text-muted"></i>Time:</strong><br>
                                            <span class="text-white-50">{{ booking.time }}</span>
                                        </div>
                                        <div class="col-6">
                                            <strong class="text-white"><i class="fas fa-users me-2 text-muted"></i>Guests:</strong><br>
                                            <span class="text-white-50">{{ booking.guests }}</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="card-footer bg-transparent">
                                    <router-link :to="'/restaurant/' + booking.restaurantId" class="btn btn-outline-secondary btn-sm">
                                        <i class="fas fa-eye me-1"></i>View Restaurant
                                    </router-link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Cancel Booking Modal -->
            <div v-if="showCancelModal" class="modal d-block" style="background-color: rgba(0,0,0,0.7);">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header bg-danger text-white">
                            <h5 class="modal-title fw-bold text-white">
                                <i class="fas fa-exclamation-triangle me-2"></i>Cancel Reservation
                            </h5>
                            <button type="button" class="btn-close btn-close-white" @click="closeCancelModal"></button>
                        </div>
                        <div class="modal-body text-center py-4">
                            <div class="mb-4">
                                <i class="fas fa-calendar-times fa-4x text-danger mb-3"></i>
                                <h4 class="text-white mb-3">Are you sure?</h4>
                                <p class="text-white-50 mb-2">You are about to cancel your reservation at:</p>
                                <h5 class="text-primary mb-2">{{ cancellingBooking?.restaurant?.name }}</h5>
                                <p class="text-white-50">
                                    <i class="fas fa-calendar me-2"></i>{{ new Date(cancellingBooking?.date).toLocaleDateString() }}
                                    <i class="fas fa-clock me-2 ms-3"></i>{{ cancellingBooking?.time }}
                                    <i class="fas fa-users me-2 ms-3"></i>{{ cancellingBooking?.guests }} guests
                                </p>
                            </div>
                            <div class="alert alert-warning bg-transparent border-warning">
                                <i class="fas fa-info-circle me-2"></i>
                                <strong class="text-warning">Note:</strong> 
                                <span class="text-white-50">This action cannot be undone. You will need to make a new reservation if you change your mind.</span>
                            </div>
                        </div>
                        <div class="modal-footer justify-content-center">
                            <button type="button" class="btn btn-outline-secondary px-4" @click="closeCancelModal">
                                <i class="fas fa-arrow-left me-2"></i>Keep Reservation
                            </button>
                            <button type="button" class="btn btn-danger px-4" @click="confirmCancelBooking">
                                <i class="fas fa-trash me-2"></i>Yes, Cancel Reservation
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Edit Booking Modal -->
            <div v-if="showEditModal" class="modal d-block" style="background-color: rgba(0,0,0,0.5);">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title fw-bold text-white">
                                <i class="fas fa-edit me-2"></i>Edit Reservation
                            </h5>
                            <button type="button" class="btn-close btn-close-white" @click="closeEditModal"></button>
                        </div>
                        <div class="modal-body">
                            <form @submit.prevent="updateBooking">
                                <div class="row g-3">
                                    <div class="col-md-6">
                                        <label for="edit-date" class="form-label fw-bold text-white">Date</label>
                                        <input 
                                            type="date" 
                                            id="edit-date"
                                            class="form-control"
                                            :class="{ 'is-invalid': editErrors.date }"
                                            v-model="editForm.date"
                                            :min="new Date().toISOString().split('T')[0]"
                                            required>
                                        <div v-if="editErrors.date" class="invalid-feedback">
                                            {{ editErrors.date }}
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <label for="edit-time" class="form-label fw-bold text-white">Time</label>
                                        <select 
                                            id="edit-time"
                                            class="form-select"
                                            :class="{ 'is-invalid': editErrors.time }"
                                            v-model="editForm.time"
                                            required>
                                            <option value="">Select time</option>
                                            <option v-for="time in timeSlots" :key="time" :value="time">
                                                {{ time }}
                                            </option>
                                        </select>
                                        <div v-if="editErrors.time" class="invalid-feedback">
                                            {{ editErrors.time }}
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <label for="edit-guests" class="form-label fw-bold text-white">Number of Guests</label>
                                        <input 
                                            type="number" 
                                            id="edit-guests"
                                            class="form-control"
                                            :class="{ 'is-invalid': editErrors.guests }"
                                            v-model="editForm.guests"
                                            min="1"
                                            max="20"
                                            required>
                                        <div v-if="editErrors.guests" class="invalid-feedback">
                                            {{ editErrors.guests }}
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <label for="edit-name" class="form-label fw-bold text-white">Contact Name</label>
                                        <input 
                                            type="text" 
                                            id="edit-name"
                                            class="form-control"
                                            :class="{ 'is-invalid': editErrors.name }"
                                            v-model="editForm.name"
                                            required>
                                        <div v-if="editErrors.name" class="invalid-feedback">
                                            {{ editErrors.name }}
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <label for="edit-phone" class="form-label fw-bold text-white">Phone</label>
                                        <input 
                                            type="tel" 
                                            id="edit-phone"
                                            class="form-control"
                                            :class="{ 'is-invalid': editErrors.phone }"
                                            v-model="editForm.phone"
                                            required>
                                        <div v-if="editErrors.phone" class="invalid-feedback">
                                            {{ editErrors.phone }}
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <label for="edit-email" class="form-label fw-bold text-white">Email</label>
                                        <input 
                                            type="email" 
                                            id="edit-email"
                                            class="form-control"
                                            :class="{ 'is-invalid': editErrors.email }"
                                            v-model="editForm.email"
                                            required>
                                        <div v-if="editErrors.email" class="invalid-feedback">
                                            {{ editErrors.email }}
                                        </div>
                                    </div>
                                    <div class="col-12">
                                        <label for="edit-requests" class="form-label fw-bold text-white">Special Requests (Optional)</label>
                                        <textarea 
                                            id="edit-requests"
                                            class="form-control"
                                            v-model="editForm.specialRequests"
                                            rows="3"
                                            placeholder="Any special requests or dietary requirements..."></textarea>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-outline-secondary" @click="closeEditModal">
                                <i class="fas fa-times me-2"></i>Cancel
                            </button>
                            <button type="button" class="btn btn-primary px-4" @click="updateBooking">
                                <i class="fas fa-save me-2"></i>Update Reservation
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
};

// Footer Component
const FooterComponent = {
    template: `
        <footer class="bg-dark text-light py-4 mt-5">
            <div class="container">
                <div class="row">
                    <div class="col-md-6">
                        <h5>FoodieFind</h5>
                        <p>Discover amazing restaurants and dishes in your area.</p>
                    </div>
                    <div class="col-md-6 text-md-end">
                        <p>&copy; 2024 FoodieFind. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </footer>
    `
};

// Enhanced Router setup
const routes = [
    { path: '/', component: HomeComponent },
    { path: '/restaurants', component: RestaurantsComponent },
    { path: '/restaurant/:id', component: RestaurantDetailComponent, props: true },
    { path: '/login', component: LoginComponent },
    { path: '/register', component: RegisterComponent },
    { path: '/dashboard', component: DashboardComponent },
    { path: '/my-bookings', component: MyBookingsComponent }
];

const router = createRouter({
    history: createWebHashHistory(),
    routes
});

router.beforeEach((to, from, next) => {
    // Pass the show-notification function to all route components
    to.meta.showNotification = router.app?.$root?.showNotification;
    next();
});

// Main Vue app
const app = createApp({
    setup() {
        const isAuthenticated = ref(false);
        const currentUser = ref(null);
        const notifications = ref([]);

        // Check for stored authentication
        onMounted(() => {
            const stored = localStorage.getItem('foodiefind_user');
            if (stored) {
                currentUser.value = JSON.parse(stored);
                isAuthenticated.value = true;
            }
        });

        const handleLogin = (user) => {
            currentUser.value = user;
            isAuthenticated.value = true;
            localStorage.setItem('foodiefind_user', JSON.stringify(user));
            router.push('/');
        };

        const handleLogout = () => {
            currentUser.value = null;
            isAuthenticated.value = false;
            localStorage.removeItem('foodiefind_user');
            router.push('/');
        };

        const showNotification = (notification) => {
            const id = Date.now();
            notifications.value.push({
                id,
                ...notification
            });
            
            // Auto remove after 5 seconds
            setTimeout(() => {
                removeNotification(id);
            }, 5000);
        };

        const removeNotification = (id) => {
            const index = notifications.value.findIndex(n => n.id === id);
            if (index > -1) {
                notifications.value.splice(index, 1);
            }
        };

        // Make showNotification globally available
        window.app = { showNotification };

        return {
            isAuthenticated,
            currentUser,
            notifications,
            handleLogin,
            handleLogout,
            showNotification,
            removeNotification
        };
    }
});

// Register components
app.component('navigation-component', NavigationComponent);
app.component('footer-component', FooterComponent);
app.component('notification-component', NotificationComponent);

// Register directives
app.directive('focus', focusDirective);

// Use router
app.use(router);

// Mount app
app.mount('#app');
