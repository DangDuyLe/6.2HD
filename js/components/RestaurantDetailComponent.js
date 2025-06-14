import { ref, reactive, computed, onMounted } from 'vue';
import { dataStore } from '../store/index.js';
import { apiService } from '../services/api.js';

export const RestaurantDetailComponent = {
    props: ['id', 'isAuthenticated', 'currentUser'],
    setup(props) {
        const restaurant = computed(() => 
            dataStore.restaurants.find(r => r.id === parseInt(props.id))
        );

        // Weather data
        const weatherData = computed(() => dataStore.apiData.weather);
        const weatherRecommendations = computed(() => 
            apiService.getWeatherRecommendations(weatherData.value)
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
            // Force immediate scroll to top without animation
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
            window.scrollTo(0, 0);
            
            if (props.isAuthenticated && props.currentUser) {
                bookingForm.name = props.currentUser.username;
                bookingForm.email = props.currentUser.email || '';
            }
            
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            bookingForm.date = tomorrow.toISOString().split('T')[0];

            // Load external data if not already loaded
            if (dataStore.apiData.quotes.length === 0) {
                console.log('Loading external data for restaurant detail page...');
                apiService.loadAllExternalData();
            }
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
                dataStore.removeLikedItem(itemId);
            } else {
                dataStore.saveLikedItem(itemId);
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

                // Use persistent method to save booking
                dataStore.saveBooking(newBooking);
                
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
                    message: `Your reservation at ${restaurant.value.name} for ${new Date(newBooking.date).toLocaleDateString()} at ${newBooking.time} has been confirmed and saved.`
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
            timeSlots,
            weatherData,
            weatherRecommendations
        };
    },
    template: `
        <div v-if="!restaurant" class="container py-5">
            <div class="alert alert-danger">Restaurant not found</div>
        </div>
        
        <div v-else class="py-4">
            <div class="container">
                <!-- Weather Banner for Restaurant -->
                <div v-if="weatherData" class="mb-4">
                    <div class="alert" style="background: linear-gradient(135deg, rgba(0,123,255,0.1), rgba(0,255,136,0.1)); border: 1px solid rgba(255,255,255,0.2);">
                        <div class="row align-items-center">
                            <div class="col-md-8">
                                <div class="d-flex align-items-center">
                                    <i :class="weatherRecommendations[0]?.icon || 'fas fa-sun'" class="fa-2x text-primary me-3"></i>
                                    <div>
                                        <h6 class="text-white mb-1">
                                            Perfect {{ weatherData.description }} day for dining!
                                        </h6>
                                        <small class="text-white-50">
                                            {{ Math.round(weatherData.temperature) }}°C in {{ weatherData.cityName }}
                                            <span v-if="weatherRecommendations.length > 0" class="ms-3">
                                                • {{ weatherRecommendations[0].suggestion }}
                                            </span>
                                        </small>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4 text-md-end">
                                <small class="text-success">
                                    <i class="fas fa-thermometer-half me-1"></i>
                                    {{ weatherData.humidity }}% humidity
                                </small>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Restaurant Header -->
                <div class="row mb-5">
                    <div class="col-md-6">
                        <img :src="restaurant.image" :alt="restaurant.name" class="img-fluid rounded-3" style="width: 100%; height: 320px; object-fit: cover;">
                    </div>
                    <div class="col-md-6">
                        <h1 class="display-6 fw-bold mb-3 text-white">{{ restaurant.name }}</h1>
                        <p class="lead text-white-50 mb-3">{{ restaurant.description }}</p>
                        
                        <!-- External API Quote -->
                        <div v-if="restaurant.tagline" class="mb-4 p-3 rounded border-start border-primary border-4" style="background: rgba(0,255,136,0.15);">
                            <div class="d-flex align-items-start">
                                <i class="fas fa-quote-left text-primary me-2 mt-1"></i>
                                <small class="text-success fst-italic lh-base">{{ restaurant.tagline }}</small>
                            </div>
                        </div>
                        
                        <div class="mb-4">
                            <span class="rating-stars me-4">
                                <i v-for="n in 5" :key="n" 
                                   :class="n <= restaurant.rating ? 'fas fa-star' : 'far fa-star'"></i>
                                <span class="ms-2 fw-semibold text-white">{{ restaurant.rating }} rating</span>
                            </span>
                            <span class="badge bg-primary me-2">{{ restaurant.cuisine }}</span>
                            <span class="badge bg-success">{{ restaurant.priceRange }}</span>
                        </div>
                        <p class="mb-4 text-white">
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

                <!-- Enhanced Menu Items with Images -->
                <h2 class="mb-4 fw-bold">
                    <i class="fas fa-utensils text-primary me-2"></i>Our Menu
                </h2>
                <div class="row">
                    <div v-for="item in filteredMenu" :key="item.id" class="col-lg-6 mb-4">
                        <div class="food-item h-100">
                            <div class="row g-3">
                                <div class="col-4">
                                    <img :src="item.image" :alt="item.name" 
                                         class="img-fluid rounded-3" 
                                         style="width: 100%; height: 120px; object-fit: cover;">
                                </div>
                                <div class="col-8">
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
                                            <select class="form-select" v-model="bookingForm.time" required>
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