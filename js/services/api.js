import { dataStore } from '../store/index.js';
import { dataStorageService } from './dataStorage.js';

export const apiService = {
    // Curated food-specific image collections
    foodImageCollections: {
        restaurants: [
            "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop", // Restaurant interior
            "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop", // French restaurant
            "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=400&h=300&fit=crop", // Asian restaurant
            "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop", // Japanese restaurant
            "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&h=300&fit=crop", // Mexican restaurant
            "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop", // Indian restaurant
            "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop", // American restaurant
            "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop", // Vegetarian restaurant
            "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=400&h=300&fit=crop", // Korean restaurant
            "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop"  // Seafood restaurant
        ],
        menuItems: {
            pizza: [
                "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop",
                "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&h=200&fit=crop",
                "https://images.unsplash.com/photo-1571407982463-2e8be81a37b5?w=300&h=200&fit=crop"
            ],
            pasta: [
                "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=300&h=200&fit=crop",
                "https://images.unsplash.com/photo-1563379091339-03246963d29a?w=300&h=200&fit=crop",
                "https://images.unsplash.com/photo-1598866594230-a7c12756260f?w=300&h=200&fit=crop"
            ],
            dessert: [
                "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=300&h=200&fit=crop",
                "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&h=200&fit=crop",
                "https://images.unsplash.com/photo-1587668178277-295251f900ce?w=300&h=200&fit=crop"
            ],
            main: [
                "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=300&h=200&fit=crop",
                "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&h=200&fit=crop",
                "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=300&h=200&fit=crop"
            ],
            appetizer: [
                "https://images.unsplash.com/photo-1541014741259-de529411b96a?w=300&h=200&fit=crop",
                "https://images.unsplash.com/photo-1608039755401-742074f0548d?w=300&h=200&fit=crop",
                "https://images.unsplash.com/photo-1560717789-0ac7c58ac90a?w=300&h=200&fit=crop"
            ],
            soup: [
                "https://images.unsplash.com/photo-1547592180-85f173990554?w=300&h=200&fit=crop",
                "https://images.unsplash.com/photo-1588566565463-180a5b2090d3?w=300&h=200&fit=crop",
                "https://images.unsplash.com/photo-1604909052743-94e838986d24?w=300&h=200&fit=crop"
            ],
            sushi: [
                "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=300&h=200&fit=crop",
                "https://images.unsplash.com/photo-1563612648-6e5b0c532da0?w=300&h=200&fit=crop",
                "https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=300&h=200&fit=crop"
            ],
            sashimi: [
                "https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=300&h=200&fit=crop",
                "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=300&h=200&fit=crop",
                "https://images.unsplash.com/photo-1563612648-6e5b0c532da0?w=300&h=200&fit=crop"
            ],
            burger: [
                "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=300&h=200&fit=crop",
                "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=200&fit=crop",
                "https://images.unsplash.com/photo-1550547660-d9450f859349?w=300&h=200&fit=crop"
            ],
            rice: [
                "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=300&h=200&fit=crop",
                "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=300&h=200&fit=crop",
                "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&h=200&fit=crop"
            ],
            bread: [
                "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&h=200&fit=crop",
                "https://images.unsplash.com/photo-1556471013-f5133ce13fb3?w=300&h=200&fit=crop",
                "https://images.unsplash.com/photo-1587248062489-deb5ad3e1aa4?w=300&h=200&fit=crop"
            ],
            side: [
                "https://images.unsplash.com/photo-1518013431117-eb1465fa5752?w=300&h=200&fit=crop",
                "https://images.unsplash.com/photo-1623206937538-54b54b48bd8b?w=300&h=200&fit=crop",
                "https://images.unsplash.com/photo-1608890003011-aae80373fdac?w=300&h=200&fit=crop"
            ],
            beverage: [
                "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=300&h=200&fit=crop",
                "https://images.unsplash.com/photo-1571091655789-405eb7a3a3a8?w=300&h=200&fit=crop",
                "https://images.unsplash.com/photo-1570831739435-6601aa3fa584?w=300&h=200&fit=crop"
            ],
            breakfast: [
                "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=300&h=200&fit=crop",
                "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=300&h=200&fit=crop",
                "https://images.unsplash.com/photo-1526081347037-9ad53d2b43db?w=300&h=200&fit=crop"
            ]
        },
        // Fallback images for when specific categories aren't found
        fallbackImages: [
            "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=300&h=200&fit=crop",
            "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&h=200&fit=crop",
            "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=300&h=200&fit=crop",
            "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=300&h=200&fit=crop",
            "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop"
        ]
    },

    // Generate consistent index from string for deterministic selection
    generateImageIndex(str, arrayLength) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash) % arrayLength;
    },

    // Enhanced image validation function
    async validateImageUrl(url, timeout = 5000) {
        return new Promise((resolve) => {
            const img = new Image();
            const timer = setTimeout(() => {
                console.warn(`Image load timeout: ${url}`);
                resolve(false);
            }, timeout);
            
            img.onload = () => {
                clearTimeout(timer);
                resolve(true);
            };
            
            img.onerror = () => {
                clearTimeout(timer);
                console.warn(`Image load error: ${url}`);
                resolve(false);
            };
            
            img.src = url;
        });
    },

    // Get deterministic food image for restaurants
    async fetchRandomFoodImage(seed) {
        try {
            const images = this.foodImageCollections.restaurants;
            const index = this.generateImageIndex(seed, images.length);
            const selectedImage = images[index];
            
            // Validate the image loads
            const isValid = await this.validateImageUrl(selectedImage);
            if (isValid) {
                return selectedImage;
            } else {
                console.warn(`Restaurant image failed to load: ${selectedImage}, using fallback`);
                return this.foodImageCollections.fallbackImages[0];
            }
        } catch (error) {
            console.warn('Failed to fetch restaurant image:', error);
            return this.foodImageCollections.fallbackImages[0];
        }
    },

    // Enhanced food image fetching with multiple fallbacks
    async fetchFoodImage(dishName, category) {
        try {
            const cleanCategory = category.toLowerCase();
            let images = this.foodImageCollections.menuItems[cleanCategory];
            
            // If no specific category, try to map similar categories
            if (!images) {
                const categoryMappings = {
                    'entree': 'main',
                    'entrée': 'main',
                    'mains': 'main',
                    'starters': 'appetizer',
                    'app': 'appetizer',
                    'apps': 'appetizer',
                    'drinks': 'beverage',
                    'drink': 'beverage',
                    'beverages': 'beverage',
                    'sides': 'side',
                    'desserts': 'dessert',
                    'sweet': 'dessert',
                    'sweets': 'dessert'
                };
                
                const mappedCategory = categoryMappings[cleanCategory];
                if (mappedCategory) {
                    images = this.foodImageCollections.menuItems[mappedCategory];
                }
            }
            
            // Still no images? Use main course images
            if (!images) {
                images = this.foodImageCollections.menuItems.main;
            }
            
            const index = this.generateImageIndex(dishName + category, images.length);
            const selectedImage = images[index];
            
            // Validate the selected image
            const isValid = await this.validateImageUrl(selectedImage);
            if (isValid) {
                console.log(`✅ Image assigned for ${dishName}: ${selectedImage}`);
                return selectedImage;
            } else {
                // Try fallback images
                console.warn(`❌ Primary image failed for ${dishName}, trying fallback`);
                const fallbackIndex = this.generateImageIndex(dishName, this.foodImageCollections.fallbackImages.length);
                const fallbackImage = this.foodImageCollections.fallbackImages[fallbackIndex];
                
                const isFallbackValid = await this.validateImageUrl(fallbackImage);
                if (isFallbackValid) {
                    console.log(`✅ Fallback image assigned for ${dishName}: ${fallbackImage}`);
                    return fallbackImage;
                } else {
                    console.warn(`❌ Fallback also failed for ${dishName}, using default`);
                    return this.foodImageCollections.fallbackImages[0];
                }
            }
        } catch (error) {
            console.error(`Failed to fetch food image for ${dishName}:`, error);
            return this.foodImageCollections.fallbackImages[0];
        }
    },

    // Update restaurant images with food-themed images
    async updateRestaurantImages() {
        console.log('🖼️ Updating restaurant images...');
        const updatePromises = dataStore.restaurants.map(async (restaurant, index) => {
            try {
                // Use restaurant name and cuisine for consistent selection
                const seed = `${restaurant.name}-${restaurant.cuisine}`;
                restaurant.image = await this.fetchRandomFoodImage(seed);
                console.log(`✅ Restaurant image updated: ${restaurant.name}`);
            } catch (error) {
                console.error(`❌ Failed to update image for restaurant ${restaurant.name}:`, error);
                restaurant.image = this.foodImageCollections.restaurants[0];
            }
        });
        
        await Promise.all(updatePromises);
        console.log('✅ All restaurant images updated with curated food images');
    },

    // Enhanced menu image updating with better error handling
    async updateMenuImages() {
        console.log('🍽️ Updating menu item images...');
        
        const updatePromises = [];
        
        for (let restaurant of dataStore.restaurants) {
            for (let menuItem of restaurant.menu) {
                const promise = this.fetchFoodImage(menuItem.name, menuItem.category)
                    .then(imageUrl => {
                        menuItem.image = imageUrl;
                        console.log(`✅ Menu item image updated: ${menuItem.name} -> ${imageUrl}`);
                    })
                    .catch(error => {
                        console.error(`❌ Failed to update image for ${menuItem.name}:`, error);
                        menuItem.image = this.foodImageCollections.fallbackImages[0];
                    });
                
                updatePromises.push(promise);
            }
        }
        
        await Promise.all(updatePromises);
        console.log('✅ All menu item images updated with curated food images');
        
        // Force reactivity update
        dataStore.restaurants = [...dataStore.restaurants];
    },

    // Add method to fix missing images on demand
    async fixMissingMenuImages() {
        console.log('🔧 Checking and fixing missing menu images...');
        
        const fixPromises = [];
        
        for (let restaurant of dataStore.restaurants) {
            for (let menuItem of restaurant.menu) {
                // Check if image is missing or invalid
                if (!menuItem.image || menuItem.image === '') {
                    console.log(`🔍 Fixing missing image for: ${menuItem.name}`);
                    const promise = this.fetchFoodImage(menuItem.name, menuItem.category)
                        .then(imageUrl => {
                            menuItem.image = imageUrl;
                            console.log(`✅ Fixed image for ${menuItem.name}: ${imageUrl}`);
                        });
                    fixPromises.push(promise);
                } else {
                    // Validate existing image
                    const isValid = await this.validateImageUrl(menuItem.image);
                    if (!isValid) {
                        console.log(`🔍 Replacing invalid image for: ${menuItem.name}`);
                        const promise = this.fetchFoodImage(menuItem.name, menuItem.category)
                            .then(imageUrl => {
                                menuItem.image = imageUrl;
                                console.log(`✅ Replaced invalid image for ${menuItem.name}: ${imageUrl}`);
                            });
                        fixPromises.push(promise);
                    }
                }
            }
        }
        
        if (fixPromises.length > 0) {
            await Promise.all(fixPromises);
            console.log(`✅ Fixed ${fixPromises.length} menu item images`);
            
            // Save the fixes to localStorage
            dataStorageService.saveToStorage(dataStorageService.STORAGE_KEYS.RESTAURANTS, dataStore.restaurants);
            
            // Force reactivity update
            dataStore.restaurants = [...dataStore.restaurants];
        } else {
            console.log('✅ All menu images are valid');
        }
    },

    // Fetch inspirational quotes for restaurant descriptions
    async fetchRandomQuotes() {
        try {
            console.log('Starting to fetch quotes from API...');
            dataStore.isLoading = true;
            
            const response = await fetch('https://api.quotable.io/quotes?tags=food&limit=10');
            console.log('API Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('API Response data:', data);
            
            dataStore.apiData.quotes = data.results || [];
            console.log('Stored quotes:', dataStore.apiData.quotes.length);
            return data.results || [];
        } catch (error) {
            console.error('Failed to fetch quotes, using fallback data:', error);
            // Fallback quotes if API fails
            const fallbackQuotes = [
                { content: "Food is our common ground, a universal experience", author: "James Beard" },
                { content: "Good food is the foundation of genuine happiness", author: "Auguste Escoffier" },
                { content: "Life is too short for bad food", author: "Julia Child" },
                { content: "Food brings people together on many different levels", author: "Emeril Lagasse" },
                { content: "Cooking is love made visible", author: "Anonymous" },
                { content: "Food is symbolic of love when words are inadequate", author: "Alan D. Wolfelt" },
                { content: "The discovery of a new dish does more for human happiness than the discovery of a new star", author: "Jean Anthelme Brillat-Savarin" },
                { content: "Food is the thread that weaves our memories together", author: "Anonymous" },
                { content: "Great food is like music you can taste", author: "Anonymous" },
                { content: "A recipe has no soul. You must bring soul to the recipe", author: "Thomas Keller" }
            ];
            dataStore.apiData.quotes = fallbackQuotes;
            return fallbackQuotes;
        } finally {
            dataStore.isLoading = false;
        }
    },

    // Update restaurant descriptions with external quotes
    async enhanceRestaurantDescriptions() {
        console.log('Enhancing restaurant descriptions...');
        const quotes = await this.fetchRandomQuotes();
        console.log('Got quotes for enhancement:', quotes.length);
        
        if (quotes.length > 0) {
            dataStore.restaurants.forEach((restaurant, index) => {
                if (quotes[index]) {
                    restaurant.tagline = quotes[index].content;
                    restaurant.taglineAuthor = quotes[index].author;
                }
            });
            console.log('Enhanced restaurant descriptions with quotes');
            
            // Force reactivity update
            dataStore.restaurants = [...dataStore.restaurants];
        }
    },

    // Fetch weather data for restaurant recommendations
    async fetchWeatherData() {
        try {
            console.log('Starting to fetch weather data from API...');
            dataStore.isLoading = true;
            
            // Using OpenWeatherMap API with a demo location (Melbourne, Australia)
            // In a real app, you'd get user's location or let them select a city
            const response = await fetch('https://api.openweathermap.org/data/2.5/weather?q=Melbourne,AU&appid=demo&units=metric');
            
            if (!response.ok) {
                throw new Error(`Weather API error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Weather API Response data:', data);
            
            dataStore.apiData.weather = {
                temperature: data.main?.temp || 22,
                description: data.weather?.[0]?.description || 'partly cloudy',
                humidity: data.main?.humidity || 65,
                windSpeed: data.wind?.speed || 5.2,
                icon: data.weather?.[0]?.icon || '02d',
                cityName: data.name || 'Melbourne'
            };
            
            console.log('Weather data stored successfully');
            return dataStore.apiData.weather;
        } catch (error) {
            console.error('Failed to fetch weather data, using fallback:', error);
            // Fallback weather data if API fails
            const fallbackWeather = {
                temperature: 22,
                description: 'partly cloudy',
                humidity: 65,
                windSpeed: 5.2,
                icon: '02d',
                cityName: 'Melbourne',
                isDemo: true
            };
            dataStore.apiData.weather = fallbackWeather;
            return fallbackWeather;
        } finally {
            dataStore.isLoading = false;
        }
    },

    // Get weather-based dining recommendations
    getWeatherRecommendations(weather) {
        if (!weather) return [];
        
        const temp = weather.temperature;
        const description = weather.description.toLowerCase();
        
        let recommendations = [];
        
        if (temp > 25) {
            recommendations.push({
                type: 'hot',
                title: 'Perfect weather for outdoor dining!',
                suggestion: 'Consider restaurants with patios or rooftop seating',
                icon: 'fas fa-sun text-warning'
            });
        } else if (temp < 10) {
            recommendations.push({
                type: 'cold',
                title: 'Cozy indoor dining recommended',
                suggestion: 'Warm soups and hot beverages would be perfect',
                icon: 'fas fa-snowflake text-info'
            });
        } else {
            recommendations.push({
                type: 'mild',
                title: 'Great weather for any dining experience',
                suggestion: 'Both indoor and outdoor dining options available',
                icon: 'fas fa-cloud-sun text-primary'
            });
        }
        
        if (description.includes('rain') || description.includes('drizzle')) {
            recommendations.push({
                type: 'rain',
                title: 'Rainy day comfort food',
                suggestion: 'Perfect time for hearty meals and warm drinks',
                icon: 'fas fa-cloud-rain text-primary'
            });
        }
        
        return recommendations;
    },

    // Enhanced data loading method
    async loadAllExternalData() {
        console.log('🔄 Loading all external data...');
        try {
            await Promise.all([
                this.updateRestaurantImages(),
                this.updateMenuImages(),
                this.enhanceRestaurantDescriptions(),
                this.fetchWeatherData()
            ]);
            
            // After initial load, fix any missing images
            await this.fixMissingMenuImages();
            
            console.log('✅ All external data loaded successfully');
        } catch (error) {
            console.error('❌ Error loading external data:', error);
            // Even if some external data fails, try to fix missing images
            await this.fixMissingMenuImages();
        }
    }
};