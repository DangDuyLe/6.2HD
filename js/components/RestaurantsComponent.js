import { ref, computed, onMounted } from 'vue';
import { dataStore } from '../store/index.js';
import { apiService } from '../services/api.js';

export const RestaurantsComponent = {
    setup() {
        const searchQuery = ref('');
        const cuisineFilter = ref('');
        const priceFilter = ref('');
        const currentPage = ref(1);
        const itemsPerPage = 6;

        // Weather data
        const weatherData = computed(() => dataStore.apiData.weather);
        const weatherRecommendations = computed(() => 
            apiService.getWeatherRecommendations(weatherData.value)
        );

        // Get search from URL params
        onMounted(() => {
            const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
            if (urlParams.get('search')) {
                searchQuery.value = urlParams.get('search');
            }
            
            // Load external data if not already loaded
            if (dataStore.apiData.quotes.length === 0) {
                console.log('Loading external data for restaurants page...');
                apiService.loadAllExternalData();
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
            clearFilters,
            weatherData,
            weatherRecommendations
        };
    },
    template: `
        <div class="py-4">
            <div class="container">
                <h1 class="mb-4 text-white fw-bold">
                    <i class="fas fa-store me-2 text-primary"></i>Restaurants
                </h1>
                
                <!-- Weather Info for Restaurants -->
                <div v-if="weatherData" class="mb-4">
                    <div class="card" style="background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2);">
                        <div class="card-body">
                            <div class="row align-items-center">
                                <div class="col-md-6">
                                    <div class="d-flex align-items-center">
                                        <i :class="weatherRecommendations[0]?.icon || 'fas fa-sun'" class="fa-2x me-3"></i>
                                        <div>
                                            <h6 class="text-white mb-1">
                                                Current Weather in {{ weatherData.cityName }}
                                            </h6>
                                            <p class="text-white-50 mb-0">
                                                {{ Math.round(weatherData.temperature) }}°C • {{ weatherData.description }}
                                                <span class="ms-3" v-if="weatherRecommendations.length > 0">
                                                    <i class="fas fa-tint me-1"></i>{{ weatherData.humidity }}%
                                                    <i class="fas fa-wind me-1 ms-3"></i>{{ weatherData.windSpeed }} m/s
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6 text-md-end">
                                    <div v-if="weatherRecommendations.length > 0">
                                        <small class="text-warning">
                                            <i class="fas fa-lightbulb me-1"></i>
                                            <strong>Dining Tip:</strong> {{ weatherRecommendations[0].suggestion }}
                                        </small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
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
                                
                                <!-- External API Quote -->
                                <div v-if="restaurant.tagline" class="mb-3 p-2 rounded border-start border-primary border-3" style="background: rgba(0,255,136,0.1);">
                                    <small class="text-success fst-italic">
                                        <i class="fas fa-quote-left me-1"></i>
                                        {{ restaurant.tagline }}
                                    </small>
                                </div>
                                
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