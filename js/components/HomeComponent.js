import { ref, computed, onMounted } from 'vue';
import { dataStore } from '../store/index.js';
import { apiService } from '../services/api.js';
import { dataStorageService } from '../services/dataStorage.js';

export const HomeComponent = {
    setup() {
        const searchQuery = ref('');
        const isDataLoaded = ref(false);
        
        const featuredRestaurants = computed(() => 
            dataStore.restaurants.slice(0, 3)
        );

        const weatherData = computed(() => dataStore.apiData.weather);
        const weatherRecommendations = computed(() => 
            apiService.getWeatherRecommendations(weatherData.value)
        );

        const handleSearch = () => {
            if (searchQuery.value.trim()) {
                window.location.hash = `/restaurants?search=${encodeURIComponent(searchQuery.value)}`;
            }
        };

        // Load external data and initialize persistence
        onMounted(async () => {
            console.log('🏠 Home component mounted, initializing data...');
            
            // Load persistent data first
            dataStorageService.loadAllData();
            
            dataStore.isLoading = true;
            
            try {
                await apiService.loadAllExternalData();
                isDataLoaded.value = true;
                console.log('✅ All external data loaded successfully');
                
                // Save updated data
                dataStorageService.saveAllData();
            } catch (error) {
                console.error('❌ Error loading external data:', error);
                isDataLoaded.value = true;
            } finally {
                dataStore.isLoading = false;
            }
        });

        return {
            searchQuery,
            featuredRestaurants,
            handleSearch,
            isLoading: computed(() => dataStore.isLoading),
            isDataLoaded,
            weatherData,
            weatherRecommendations
        };
    },
    template: `
        <div>
            <!-- Hero Section -->
            <section class="hero-section">
                <div class="container">
                    <div class="row justify-content-center">
                        <div class="col-lg-8 text-center">
                            <h1 class="display-4 fw-bold mb-4">Discover Amazing Food</h1>
                            <p class="lead mb-4">Find the best restaurants and dishes in your area with AI-powered recommendations</p>
                            
                            <!-- Weather Information -->
                            <div v-if="weatherData" class="mb-4 mx-auto" style="max-width: 600px;">
                                <div class="p-4 rounded text-center" style="background: rgba(255,255,255,0.1); backdrop-filter: blur(10px);">
                                    <div class="d-flex align-items-center justify-content-center mb-3">
                                        <i :class="weatherRecommendations[0]?.icon || 'fas fa-sun'" class="fa-2x me-3 text-primary"></i>
                                        <div>
                                            <h5 class="text-white mb-1 fw-bold">Great weather for any dining experience</h5>
                                            <p class="text-white-50 mb-0">
                                                Both indoor and outdoor dining options available
                                            </p>
                                        </div>
                                    </div>
                                    <div class="text-center">
                                        <p class="text-white mb-2">
                                            <strong>{{ weatherData.cityName }}</strong> • {{ Math.round(weatherData.temperature) }}°C • {{ weatherData.description }}
                                        </p>
                                        <div v-if="weatherRecommendations.length > 0" class="mt-2">
                                            <small class="text-warning fw-semibold">
                                                <i class="fas fa-lightbulb me-1"></i>
                                                {{ weatherRecommendations[0].suggestion }}
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
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

            <!-- Features Section -->
            <section id="features" class="py-5">
                <div class="container">
                    <div class="row text-center mb-5">
                        <div class="col-12">
                            <h2 class="text-white fw-bold mb-3">Why Choose FoodieFind?</h2>
                            <p class="text-white-50 lead">Discover the features that make your dining experience extraordinary</p>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-lg-4 col-md-6 mb-4">
                            <div class="text-center p-4 rounded" style="background: var(--glass-bg); backdrop-filter: blur(15px); border: 1px solid var(--glass-border);">
                                <div class="feature-icon mb-3">
                                    <i class="fas fa-search fa-3x text-primary"></i>
                                </div>
                                <h5 class="text-white fw-bold mb-3">Smart Search</h5>
                                <p class="text-white-50">Advanced AI-powered search to find exactly what you're craving, from cuisine types to specific dishes.</p>
                            </div>
                        </div>
                        <div class="col-lg-4 col-md-6 mb-4">
                            <div class="text-center p-4 rounded" style="background: var(--glass-bg); backdrop-filter: blur(15px); border: 1px solid var(--glass-border);">
                                <div class="feature-icon mb-3">
                                    <i class="fas fa-calendar-check fa-3x text-secondary"></i>
                                </div>
                                <h5 class="text-white fw-bold mb-3">Easy Reservations</h5>
                                <p class="text-white-50">Book tables instantly with our streamlined reservation system. No more waiting on hold!</p>
                            </div>
                        </div>
                        <div class="col-lg-4 col-md-6 mb-4">
                            <div class="text-center p-4 rounded" style="background: var(--glass-bg); backdrop-filter: blur(15px); border: 1px solid var(--glass-border);">
                                <div class="feature-icon mb-3">
                                    <i class="fas fa-cloud-sun fa-3x text-warning"></i>
                                </div>
                                <h5 class="text-white fw-bold mb-3">Weather Integration</h5>
                                <p class="text-white-50">Get personalized restaurant recommendations based on current weather conditions.</p>
                            </div>
                        </div>
                        <div class="col-lg-4 col-md-6 mb-4">
                            <div class="text-center p-4 rounded" style="background: var(--glass-bg); backdrop-filter: blur(15px); border: 1px solid var(--glass-border);">
                                <div class="feature-icon mb-3">
                                    <i class="fas fa-star fa-3x text-success"></i>
                                </div>
                                <h5 class="text-white fw-bold mb-3">Verified Reviews</h5>
                                <p class="text-white-50">Read authentic reviews from verified diners to make informed dining decisions.</p>
                            </div>
                        </div>
                        <div class="col-lg-4 col-md-6 mb-4">
                            <div class="text-center p-4 rounded" style="background: var(--glass-bg); backdrop-filter: blur(15px); border: 1px solid var(--glass-border);">
                                <div class="feature-icon mb-3">
                                    <i class="fas fa-mobile-alt fa-3x text-info"></i>
                                </div>
                                <h5 class="text-white fw-bold mb-3">Mobile Optimized</h5>
                                <p class="text-white-50">Fully responsive design that works perfectly on all devices, anywhere you go.</p>
                            </div>
                        </div>
                        <div class="col-lg-4 col-md-6 mb-4">
                            <div class="text-center p-4 rounded" style="background: var(--glass-bg); backdrop-filter: blur(15px); border: 1px solid var(--glass-border);">
                                <div class="feature-icon mb-3">
                                    <i class="fas fa-heart fa-3x text-danger"></i>
                                </div>
                                <h5 class="text-white fw-bold mb-3">Favorites & Wishlist</h5>
                                <p class="text-white-50">Save your favorite restaurants and create wishlists for future dining adventures.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Statistics Section -->
            <section class="py-5" style="background: var(--gradient-dark);">
                <div class="container">
                    <div class="row text-center">
                        <div class="col-12 mb-5">
                            <h2 class="text-white fw-bold mb-3">FoodieFind by the Numbers</h2>
                            <p class="text-white-50 lead">Join thousands of satisfied food lovers</p>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-lg-3 col-md-6 mb-4">
                            <div class="text-center">
                                <div class="stat-number text-primary fw-bold mb-2" style="font-size: 3rem;">50+</div>
                                <h6 class="text-white fw-semibold">Partner Restaurants</h6>
                                <p class="text-white-50 small">Curated dining experiences</p>
                            </div>
                        </div>
                        <div class="col-lg-3 col-md-6 mb-4">
                            <div class="text-center">
                                <div class="stat-number text-secondary fw-bold mb-2" style="font-size: 3rem;">1000+</div>
                                <h6 class="text-white fw-semibold">Happy Customers</h6>
                                <p class="text-white-50 small">Satisfied diners and growing</p>
                            </div>
                        </div>
                        <div class="col-lg-3 col-md-6 mb-4">
                            <div class="text-center">
                                <div class="stat-number text-warning fw-bold mb-2" style="font-size: 3rem;">5000+</div>
                                <h6 class="text-white fw-semibold">Reservations Made</h6>
                                <p class="text-white-50 small">Seamless booking experiences</p>
                            </div>
                        </div>
                        <div class="col-lg-3 col-md-6 mb-4">
                            <div class="text-center">
                                <div class="stat-number text-success fw-bold mb-2" style="font-size: 3rem;">4.8★</div>
                                <h6 class="text-white fw-semibold">Average Rating</h6>
                                <p class="text-white-50 small">Consistently excellent service</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Featured Restaurants Section -->
            <section class="py-5">
                <div class="container">
                    <h2 class="text-center mb-5 text-white fw-bold">Featured Restaurants</h2>
                    
                    <!-- Loading State -->
                    <div v-if="isLoading" class="text-center py-5">
                        <div class="spinner-border text-primary me-3" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                        <p class="text-white-50">Loading restaurant data from external sources...</p>
                    </div>
                    
                    <div v-else class="row">
                        <div v-for="restaurant in featuredRestaurants" :key="restaurant.id" class="col-lg-4 col-md-6 mb-4">
                            <div class="card restaurant-card h-100">
                                <img :src="restaurant.image" class="card-img-top" :alt="restaurant.name" style="height: 200px; object-fit: cover;">
                                <div class="card-body">
                                    <h5 class="card-title text-white fw-bold">{{ restaurant.name }}</h5>
                                    <p class="card-text text-white-50">{{ restaurant.description }}</p>
                                    
                                    <!-- External API Quote -->
                                    <div v-if="restaurant.tagline" class="mb-3 p-3 rounded border-start border-primary border-3" style="background: rgba(0,255,136,0.15);">
                                        <div class="d-flex align-items-start">
                                            <i class="fas fa-quote-left text-primary me-2 mt-1"></i>
                                            <small class="text-success fst-italic lh-base">
                                                {{ restaurant.tagline }}
                                            </small>
                                        </div>
                                    </div>
                                    
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
                    
                    <div class="text-center mt-4">
                        <router-link to="/restaurants" class="btn btn-outline-primary btn-lg">
                            <i class="fas fa-utensils me-2"></i>View All Restaurants
                        </router-link>
                    </div>
                </div>
            </section>

            <!-- Testimonials Section -->
            <section class="py-5" style="background: rgba(255,255,255,0.05); backdrop-filter: blur(10px);">
                <div class="container">
                    <div class="row text-center mb-5">
                        <div class="col-12">
                            <h2 class="text-white fw-bold mb-3">What Our Users Say</h2>
                            <p class="text-white-50 lead">Real feedback from real food lovers</p>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-lg-4 col-md-6 mb-4">
                            <div class="p-4 rounded h-100" style="background: var(--glass-bg); backdrop-filter: blur(15px); border: 1px solid var(--glass-border);">
                                <div class="text-center mb-3">
                                    <div class="rating-stars text-warning mb-2">
                                        <i class="fas fa-star"></i>
                                        <i class="fas fa-star"></i>
                                        <i class="fas fa-star"></i>
                                        <i class="fas fa-star"></i>
                                        <i class="fas fa-star"></i>
                                    </div>
                                </div>
                                <p class="text-white-50 fst-italic mb-3">
                                    "FoodieFind helped me discover amazing restaurants I never knew existed. The weather recommendations are genius!"
                                </p>
                                <div class="d-flex align-items-center">
                                    <div class="avatar bg-primary rounded-circle d-flex align-items-center justify-content-center me-3" style="width: 50px; height: 50px;">
                                        <i class="fas fa-user text-white"></i>
                                    </div>
                                    <div>
                                        <h6 class="text-white mb-0">Sarah Chen</h6>
                                        <small class="text-white-50">Food Blogger</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-lg-4 col-md-6 mb-4">
                            <div class="p-4 rounded h-100" style="background: var(--glass-bg); backdrop-filter: blur(15px); border: 1px solid var(--glass-border);">
                                <div class="text-center mb-3">
                                    <div class="rating-stars text-warning mb-2">
                                        <i class="fas fa-star"></i>
                                        <i class="fas fa-star"></i>
                                        <i class="fas fa-star"></i>
                                        <i class="fas fa-star"></i>
                                        <i class="fas fa-star"></i>
                                    </div>
                                </div>
                                <p class="text-white-50 fst-italic mb-3">
                                    "The reservation system is so smooth! No more calling multiple restaurants. Everything in one place."
                                </p>
                                <div class="d-flex align-items-center">
                                    <div class="avatar bg-secondary rounded-circle d-flex align-items-center justify-content-center me-3" style="width: 50px; height: 50px;">
                                        <i class="fas fa-user text-white"></i>
                                    </div>
                                    <div>
                                        <h6 class="text-white mb-0">Mike Rodriguez</h6>
                                        <small class="text-white-50">Business Professional</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-lg-4 col-md-6 mb-4">
                            <div class="p-4 rounded h-100" style="background: var(--glass-bg); backdrop-filter: blur(15px); border: 1px solid var(--glass-border);">
                                <div class="text-center mb-3">
                                    <div class="rating-stars text-warning mb-2">
                                        <i class="fas fa-star"></i>
                                        <i class="fas fa-star"></i>
                                        <i class="fas fa-star"></i>
                                        <i class="fas fa-star"></i>
                                        <i class="fas fa-star"></i>
                                    </div>
                                </div>
                                <p class="text-white-50 fst-italic mb-3">
                                    "Love the modern interface and how easy it is to find exactly what I'm looking for. Highly recommended!"
                                </p>
                                <div class="d-flex align-items-center">
                                    <div class="avatar bg-warning rounded-circle d-flex align-items-center justify-content-center me-3" style="width: 50px; height: 50px;">
                                        <i class="fas fa-user text-white"></i>
                                    </div>
                                    <div>
                                        <h6 class="text-white mb-0">Emily Johnson</h6>
                                        <small class="text-white-50">Food Enthusiast</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Call to Action Section -->
            <section id="about" class="py-5" style="background: linear-gradient(135deg, #00ff88 0%, #00d4ff 30%, #8b5cf6 70%, #6366f1 100%); position: relative; overflow: hidden;">
                <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(45deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 212, 255, 0.15) 50%, rgba(139, 92, 246, 0.1) 100%); z-index: 1;"></div>
                <div class="container" style="position: relative; z-index: 2;">
                    <div class="row text-center">
                        <div class="col-lg-8 mx-auto">
                            <h2 class="text-dark fw-bold mb-4" style="text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">Ready to Start Your Culinary Journey?</h2>
                            <p class="lead text-dark mb-4" style="text-shadow: 1px 1px 2px rgba(0,0,0,0.2);">
                                Join thousands of food lovers who trust FoodieFind to discover their next favorite meal. 
                                Sign up today and get personalized restaurant recommendations!
                            </p>
                            <div class="d-flex justify-content-center gap-3 flex-wrap">
                                <router-link to="/register" class="btn btn-dark btn-lg" style="background: rgba(0,0,0,0.8) !important; border: 2px solid rgba(0,0,0,0.9) !important; box-shadow: 0 8px 25px rgba(0,0,0,0.3);">
                                    <i class="fas fa-user-plus me-2"></i>Get Started Free
                                </router-link>
                                <router-link to="/restaurants" class="btn btn-outline-dark btn-lg" style="border: 2px solid rgba(0,0,0,0.7) !important; color: rgba(0,0,0,0.9) !important; background: rgba(255,255,255,0.2) !important; backdrop-filter: blur(10px); box-shadow: 0 8px 25px rgba(0,0,0,0.2);">
                                    <i class="fas fa-utensils me-2"></i>Browse Restaurants
                                </router-link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    `
};