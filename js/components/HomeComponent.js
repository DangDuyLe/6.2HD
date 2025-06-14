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
            <section class="hero-section">
                <div class="container">
                    <div class="row justify-content-center">
                        <div class="col-lg-8 text-center">
                            <h1 class="display-4 fw-bold mb-4">Discover Amazing Food</h1>
                            <p class="lead mb-4">Find the best restaurants and dishes in your area</p>
                            
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
                </div>
            </section>
        </div>
    `
};