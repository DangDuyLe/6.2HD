const { createApp, ref, reactive, computed, onMounted } = Vue;
const { createRouter, createWebHashHistory } = VueRouter;

// Persistent Data Storage Service
const dataStorageService = {
    // Keys for localStorage
    STORAGE_KEYS: {
        RESTAURANTS: 'foodiefind_restaurants',
        BOOKINGS: 'foodiefind_bookings',
        LIKED_ITEMS: 'foodiefind_liked_items',
        USERS: 'foodiefind_users'
    },

    // Save data to localStorage
    saveToStorage(key, data) {
        try {
            const serialized = JSON.stringify(data);
            localStorage.setItem(key, serialized);
            console.log(`✅ Saved ${key} to localStorage`);
        } catch (error) {
            console.error(`❌ Failed to save ${key} to localStorage:`, error);
        }
    },

    // Load data from localStorage
    loadFromStorage(key, defaultValue = null) {
        try {
            const stored = localStorage.getItem(key);
            if (stored) {
                const parsed = JSON.parse(stored);
                console.log(`✅ Loaded ${key} from localStorage`);
                return parsed;
            }
        } catch (error) {
            console.error(`❌ Failed to load ${key} from localStorage:`, error);
        }
        return defaultValue;
    },

    // Save all data stores
    saveAllData() {
        this.saveToStorage(this.STORAGE_KEYS.RESTAURANTS, dataStore.restaurants);
        this.saveToStorage(this.STORAGE_KEYS.BOOKINGS, dataStore.bookings);
        this.saveToStorage(this.STORAGE_KEYS.LIKED_ITEMS, Array.from(dataStore.likedItems));
        this.saveToStorage(this.STORAGE_KEYS.USERS, dataStore.users);
    },

    // Load all data stores
    loadAllData() {
        console.log('🔄 Loading persistent data from localStorage...');
        
        // Load restaurants with fallback to sample data
        const storedRestaurants = this.loadFromStorage(this.STORAGE_KEYS.RESTAURANTS);
        if (storedRestaurants && storedRestaurants.length > 0) {
            dataStore.restaurants = storedRestaurants;
        } else {
            console.log('📦 Using default restaurant data');
            // Will use sampleRestaurants as default
        }

        // Load bookings
        const storedBookings = this.loadFromStorage(this.STORAGE_KEYS.BOOKINGS, []);
        if (storedBookings.length > 0) {
            dataStore.bookings = storedBookings;
        }

        // Load liked items
        const storedLikedItems = this.loadFromStorage(this.STORAGE_KEYS.LIKED_ITEMS, []);
        dataStore.likedItems = new Set(storedLikedItems);

        // Load users
        const storedUsers = this.loadFromStorage(this.STORAGE_KEYS.USERS);
        if (storedUsers && storedUsers.length > 0) {
            dataStore.users = storedUsers;
        }

        console.log('✅ Persistent data loaded successfully');
    },

    // Initialize data storage watchers
    initializeWatchers() {
        // Auto-save when data changes
        const saveDebounced = this.debounce(() => {
            this.saveAllData();
        }, 1000); // Save after 1 second of no changes

        // Watch for changes in reactive data
        this.watchReactiveData(dataStore, saveDebounced);
    },

    // Debounce function to prevent excessive saves
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Watch reactive data for changes
    watchReactiveData(store, callback) {
        // Watch restaurants array
        const originalRestaurantsPush = store.restaurants.push;
        store.restaurants.push = function(...args) {
            const result = originalRestaurantsPush.apply(this, args);
            callback();
            return result;
        };

        // Watch bookings array
        const originalBookingsPush = store.bookings.push;
        store.bookings.push = function(...args) {
            const result = originalBookingsPush.apply(this, args);
            callback();
            return result;
        };

        // Set up periodic saves as backup
        setInterval(() => {
            this.saveAllData();
        }, 30000); // Save every 30 seconds as backup
    },

    // Clear all stored data (for testing/reset)
    clearAllData() {
        Object.values(this.STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        console.log('🗑️ All persistent data cleared');
    },

    // Export data for backup
    exportData() {
        const exportData = {
            restaurants: dataStore.restaurants,
            bookings: dataStore.bookings,
            likedItems: Array.from(dataStore.likedItems),
            users: dataStore.users,
            exportDate: new Date().toISOString()
        };
        return JSON.stringify(exportData, null, 2);
    },

    // Import data from backup
    importData(jsonString) {
        try {
            const importedData = JSON.parse(jsonString);
            
            if (importedData.restaurants) {
                dataStore.restaurants = importedData.restaurants;
            }
            if (importedData.bookings) {
                dataStore.bookings = importedData.bookings;
            }
            if (importedData.likedItems) {
                dataStore.likedItems = new Set(importedData.likedItems);
            }
            if (importedData.users) {
                dataStore.users = importedData.users;
            }
            
            this.saveAllData();
            console.log('✅ Data imported successfully');
            return true;
        } catch (error) {
            console.error('❌ Failed to import data:', error);
            return false;
        }
    }
};

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
        description: "Authentic Italian cuisine with fresh ingredients",
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
        description: "Traditional Chinese dishes with authentic flavors",
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
        description: "Fresh sushi and sashimi made by master chefs",
        menu: [
            { id: 7, name: "Salmon Sashimi", price: 24, category: "Sashimi", likes: 67, description: "Fresh Norwegian salmon" },
            { id: 8, name: "California Roll", price: 18, category: "Sushi", likes: 44, description: "Crab and avocado roll" },
            { id: 9, name: "Miso Soup", price: 6, category: "Soup", likes: 28, description: "Traditional soybean soup" }
        ]
    },
    {
        id: 4,
        name: "Le Petit Bistro",
        cuisine: "French",
        rating: 4.6,
        image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400",
        location: "French Quarter",
        priceRange: "$$$",
        description: "Elegant French cuisine in a cozy atmosphere",
        menu: [
            { id: 10, name: "Coq au Vin", price: 28, category: "Main", likes: 56, description: "Chicken braised in red wine" },
            { id: 11, name: "French Onion Soup", price: 12, category: "Soup", likes: 42, description: "Classic soup with gruyere cheese" },
            { id: 12, name: "Crème Brûlée", price: 14, category: "Dessert", likes: 48, description: "Vanilla custard with caramelized sugar" },
            { id: 13, name: "Escargot", price: 16, category: "Appetizer", likes: 31, description: "Snails in garlic butter" }
        ]
    },
    {
        id: 5,
        name: "Spice Garden",
        cuisine: "Indian",
        rating: 4.3,
        image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400",
        location: "Little India",
        priceRange: "$$",
        description: "Aromatic Indian spices and traditional recipes",
        menu: [
            { id: 14, name: "Butter Chicken", price: 19, category: "Main", likes: 73, description: "Creamy tomato curry with chicken" },
            { id: 15, name: "Biryani", price: 17, category: "Rice", likes: 58, description: "Fragrant basmati rice with spices" },
            { id: 16, name: "Samosa", price: 8, category: "Appetizer", likes: 41, description: "Crispy pastry with spiced filling" },
            { id: 17, name: "Naan Bread", price: 5, category: "Bread", likes: 35, description: "Fresh baked Indian flatbread" }
        ]
    },
    {
        id: 6,
        name: "El Mariachi",
        cuisine: "Mexican",
        rating: 4.4,
        image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400",
        location: "Mission District",
        priceRange: "$$",
        description: "Vibrant Mexican flavors and festive atmosphere",
        menu: [
            { id: 18, name: "Beef Tacos", price: 15, category: "Main", likes: 62, description: "Seasoned beef with fresh toppings" },
            { id: 19, name: "Guacamole", price: 9, category: "Appetizer", likes: 55, description: "Fresh avocado dip with chips" },
            { id: 20, name: "Quesadilla", price: 13, category: "Main", likes: 47, description: "Cheese-filled tortilla with chicken" },
            { id: 21, name: "Churros", price: 8, category: "Dessert", likes: 39, description: "Fried dough with cinnamon sugar" }
        ]
    },
    {
        id: 7,
        name: "Ocean's Bounty",
        cuisine: "Seafood",
        rating: 4.7,
        image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400",
        location: "Harbor District",
        priceRange: "$$$",
        description: "Fresh seafood caught daily from local waters",
        menu: [
            { id: 22, name: "Grilled Salmon", price: 26, category: "Main", likes: 71, description: "Atlantic salmon with herbs" },
            { id: 23, name: "Lobster Bisque", price: 18, category: "Soup", likes: 49, description: "Rich and creamy lobster soup" },
            { id: 24, name: "Fish & Chips", price: 22, category: "Main", likes: 53, description: "Beer-battered cod with fries" },
            { id: 25, name: "Shrimp Cocktail", price: 16, category: "Appetizer", likes: 36, description: "Chilled prawns with cocktail sauce" }
        ]
    },
    {
        id: 8,
        name: "Burger Haven",
        cuisine: "American",
        rating: 4.1,
        image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400",
        location: "City Center",
        priceRange: "$",
        description: "Juicy burgers and classic American comfort food",
        menu: [
            { id: 26, name: "Classic Cheeseburger", price: 14, category: "Burger", likes: 68, description: "Beef patty with cheese and fixings" },
            { id: 27, name: "BBQ Bacon Burger", price: 16, category: "Burger", likes: 54, description: "Smoky BBQ sauce with crispy bacon" },
            { id: 28, name: "Sweet Potato Fries", price: 7, category: "Side", likes: 42, description: "Crispy seasoned sweet potato fries" },
            { id: 29, name: "Milkshake", price: 6, category: "Beverage", likes: 38, description: "Thick vanilla milkshake" }
        ]
    },
    {
        id: 9,
        name: "Green Earth Café",
        cuisine: "Vegetarian",
        rating: 4.5,
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400",
        location: "University District",
        priceRange: "$$",
        description: "Plant-based cuisine with organic ingredients",
        menu: [
            { id: 30, name: "Quinoa Buddha Bowl", price: 16, category: "Main", likes: 59, description: "Quinoa with roasted vegetables" },
            { id: 31, name: "Avocado Toast", price: 12, category: "Breakfast", likes: 45, description: "Smashed avocado on sourdough" },
            { id: 32, name: "Green Smoothie", price: 8, category: "Beverage", likes: 34, description: "Spinach, mango, and banana blend" },
            { id: 33, name: "Vegan Chocolate Cake", price: 10, category: "Dessert", likes: 41, description: "Rich chocolate cake, dairy-free" }
        ]
    },
    {
        id: 10,
        name: "Seoul Kitchen",
        cuisine: "Korean",
        rating: 4.6,
        image: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=400",
        location: "Koreatown",
        priceRange: "$$",
        description: "Authentic Korean BBQ and traditional dishes",
        menu: [
            { id: 34, name: "Korean BBQ", price: 24, category: "Main", likes: 76, description: "Grilled marinated beef" },
            { id: 35, name: "Kimchi", price: 6, category: "Side", likes: 43, description: "Fermented spicy cabbage" },
            { id: 36, name: "Bibimbap", price: 18, category: "Main", likes: 61, description: "Mixed rice bowl with vegetables" },
            { id: 37, name: "Korean Fried Chicken", price: 20, category: "Main", likes: 57, description: "Crispy chicken with Korean glaze" }
        ]
    }
];

// Custom directive for auto-focus
const focusDirective = {
    mounted(el) {
        el.focus();
    }
};

// Enhanced data store with loading states and persistence
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
    ],
    isLoading: false,
    apiData: {
        quotes: [],
        weather: null
    },
    
    // Persistence methods
    saveBooking(booking) {
        this.bookings.push(booking);
        dataStorageService.saveToStorage(dataStorageService.STORAGE_KEYS.BOOKINGS, this.bookings);
        console.log('💾 Booking saved to localStorage');
    },
    
    updateBooking(bookingId, updates) {
        const index = this.bookings.findIndex(b => b.id === bookingId);
        if (index !== -1) {
            Object.assign(this.bookings[index], updates);
            dataStorageService.saveToStorage(dataStorageService.STORAGE_KEYS.BOOKINGS, this.bookings);
            console.log('💾 Booking updated in localStorage');
        }
    },
    
    deleteBooking(bookingId) {
        const index = this.bookings.findIndex(b => b.id === bookingId);
        if (index !== -1) {
            this.bookings.splice(index, 1);
            dataStorageService.saveToStorage(dataStorageService.STORAGE_KEYS.BOOKINGS, this.bookings);
            console.log('💾 Booking deleted from localStorage');
        }
    },
    
    saveLikedItem(itemId) {
        this.likedItems.add(itemId);
        dataStorageService.saveToStorage(dataStorageService.STORAGE_KEYS.LIKED_ITEMS, Array.from(this.likedItems));
        console.log('💾 Liked items saved to localStorage');
    },
    
    removeLikedItem(itemId) {
        this.likedItems.delete(itemId);
        dataStorageService.saveToStorage(dataStorageService.STORAGE_KEYS.LIKED_ITEMS, Array.from(this.likedItems));
        console.log('💾 Liked items updated in localStorage');
    },
    
    updateRestaurant(restaurantId, updates) {
        const index = this.restaurants.findIndex(r => r.id === restaurantId);
        if (index !== -1) {
            Object.assign(this.restaurants[index], updates);
            dataStorageService.saveToStorage(dataStorageService.STORAGE_KEYS.RESTAURANTS, this.restaurants);
            console.log('💾 Restaurant updated in localStorage');
        }
    },
    
    addMenuItem(restaurantId, menuItem) {
        const restaurant = this.restaurants.find(r => r.id === restaurantId);
        if (restaurant) {
            restaurant.menu.push(menuItem);
            dataStorageService.saveToStorage(dataStorageService.STORAGE_KEYS.RESTAURANTS, this.restaurants);
            console.log('💾 Menu item added and saved to localStorage');
        }
    },
    
    updateMenuItem(restaurantId, menuItemId, updates) {
        const restaurant = this.restaurants.find(r => r.id === restaurantId);
        if (restaurant) {
            const menuIndex = restaurant.menu.findIndex(m => m.id === menuItemId);
            if (menuIndex !== -1) {
                Object.assign(restaurant.menu[menuIndex], updates);
                dataStorageService.saveToStorage(dataStorageService.STORAGE_KEYS.RESTAURANTS, this.restaurants);
                console.log('💾 Menu item updated in localStorage');
            }
        }
    },
    
    deleteMenuItem(restaurantId, menuItemId) {
        const restaurant = this.restaurants.find(r => r.id === restaurantId);
        if (restaurant) {
            const menuIndex = restaurant.menu.findIndex(m => m.id === menuItemId);
            if (menuIndex !== -1) {
                restaurant.menu.splice(menuIndex, 1);
                dataStorageService.saveToStorage(dataStorageService.STORAGE_KEYS.RESTAURANTS, this.restaurants);
                console.log('💾 Menu item deleted from localStorage');
            }
        }
    }
});

// Enhanced API service with better debugging
const apiService = {
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
        }
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

    // Get deterministic food image for restaurants
    async fetchRandomFoodImage(seed) {
        try {
            const images = this.foodImageCollections.restaurants;
            const index = this.generateImageIndex(seed, images.length);
            return images[index];
        } catch (error) {
            console.warn('Failed to fetch restaurant image:', error);
            return this.foodImageCollections.restaurants[0]; // Default fallback
        }
    },

    // Get deterministic food image for menu items
    async fetchFoodImage(dishName, category) {
        try {
            const cleanCategory = category.toLowerCase();
            let images = this.foodImageCollections.menuItems[cleanCategory];
            
            // If no specific category, use main course images
            if (!images) {
                images = this.foodImageCollections.menuItems.main;
            }
            
            const index = this.generateImageIndex(dishName + category, images.length);
            return images[index];
        } catch (error) {
            console.warn('Failed to fetch food image:', error);
            return this.foodImageCollections.menuItems.main[0]; // Default fallback
        }
    },

    // Update restaurant images with food-themed images
    async updateRestaurantImages() {
        for (let i = 0; i < dataStore.restaurants.length; i++) {
            const restaurant = dataStore.restaurants[i];
            // Use restaurant name and cuisine for consistent selection
            const seed = `${restaurant.name}-${restaurant.cuisine}`;
            restaurant.image = await this.fetchRandomFoodImage(seed);
        }
        console.log('Restaurant images updated with curated food images');
    },

    // Update menu items with food images
    async updateMenuImages() {
        console.log('Updating menu item images...');
        for (let restaurant of dataStore.restaurants) {
            for (let menuItem of restaurant.menu) {
                // Always assign an image, even if one exists (to ensure food-related images)
                menuItem.image = await this.fetchFoodImage(menuItem.name, menuItem.category);
            }
        }
        console.log('Menu item images updated with curated food images');
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
        console.log('Loading all external data...');
        try {
            await Promise.all([
                this.updateRestaurantImages(),
                this.updateMenuImages(),
                this.enhanceRestaurantDescriptions(),
                this.fetchWeatherData()
            ]);
            console.log('✅ All external data loaded successfully');
        } catch (error) {
            console.error('❌ Error loading external data:', error);
        }
    }
};

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

// Enhanced Restaurant List Component
const RestaurantsComponent = {
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

// Restaurant Detail Component
const RestaurantDetailComponent = {
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
                // In real app, would decrease likes in backend
            } else {
                dataStore.saveLikedItem(itemId);
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
        const newDish = reactive({ name: '', price: '', category: '', description: '' });
        const editingDish = ref(null);

        // For admin: allow selecting which restaurant to manage
        const restaurants = computed(() => dataStore.restaurants);
        const selectedRestaurantId = ref(
            props.currentUser.role === 'admin'
                ? (restaurants.value.length > 0 ? restaurants.value[0].id : null)
                : props.currentUser.restaurantId
        );
        
        const userRestaurant = computed(() => {
            return dataStore.restaurants.find(r => r.id === parseInt(selectedRestaurantId.value));
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
            dataStore.addMenuItem(userRestaurant.value.id, dish);
            Object.assign(newDish, { name: '', price: '', category: '', description: '' });
            console.log('🍽️ New dish added and saved to localStorage');
        };

        const editDish = (dish) => {
            editingDish.value = { ...dish };
        };

        const saveDish = () => {
            if (!editingDish.value || !userRestaurant.value) return;
            dataStore.updateMenuItem(userRestaurant.value.id, editingDish.value.id, editingDish.value);
            editingDish.value = null;
            console.log('🍽️ Dish updated and saved to localStorage');
        };

        const deleteDish = (dishId) => {
            if (!userRestaurant.value || !confirm('Are you sure you want to delete this dish?')) return;
            dataStore.deleteMenuItem(userRestaurant.value.id, dishId);
            console.log('🍽️ Dish deleted and removed from localStorage');
        };

        return {
            activeTab,
            newDish,
            editingDish,
            restaurants,
            selectedRestaurantId,
            userRestaurant,
            addDish,
            editDish,
            saveDish,
            deleteDish
        };
    },
    template: `
        <div class="container py-4">
            <div class="mb-4">
                <h1 class="display-5 fw-bold text-white mb-2">
                    <i class="fas fa-tachometer-alt me-3 text-primary"></i>Dashboard
                </h1>
                <div v-if="restaurants.length > 0" class="mb-3">
                    <label for="restaurant-select" class="form-label text-white fw-semibold me-2">Manage Restaurant:</label>
                    <select id="restaurant-select" v-model="selectedRestaurantId" class="form-select w-auto d-inline-block">
                        <option v-for="r in restaurants" :key="r.id" :value="r.id">
                            {{ r.name }}
                        </option>
                    </select>
                </div>
                <div v-if="!userRestaurant" class="alert alert-warning">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    <strong>No restaurant found to manage.</strong>
                </div>
            </div>

            <div v-if="userRestaurant">
                <!-- Enhanced Navigation Tabs -->
                <div class="search-filters mb-4">
                    <ul class="nav nav-pills nav-fill">
                        <li class="nav-item">
                            <button 
                                class="nav-link fw-bold px-4 py-3" 
                                :class="{ 'active bg-primary text-dark': activeTab === 'overview', 'text-white': activeTab !== 'overview' }" 
                                @click="activeTab = 'overview'">
                                <i class="fas fa-chart-line me-2"></i>Overview
                            </button>
                        </li>
                        <li class="nav-item">
                            <button 
                                class="nav-link fw-bold px-4 py-3" 
                                :class="{ 'active bg-primary text-dark': activeTab === 'menu', 'text-white': activeTab !== 'menu' }" 
                                @click="activeTab = 'menu'">
                                <i class="fas fa-utensils me-2"></i>Manage Menu
                            </button>
                        </li>
                    </ul>
                </div>

                <!-- Overview Tab -->
                <div v-if="activeTab === 'overview'" class="tab-content">
                    <div class="row g-4">
                        <div class="col-md-3">
                            <div class="card restaurant-card text-center h-100 border-0">
                                <div class="card-body">
                                    <i class="fas fa-utensils fa-2x text-primary mb-3"></i>
                                    <h3 class="text-white fw-bold display-6">{{ userRestaurant.menu.length }}</h3>
                                    <p class="text-white-50 mb-0 fw-semibold">Menu Items</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card restaurant-card text-center h-100 border-0">
                                <div class="card-body">
                                    <i class="fas fa-star fa-2x text-warning mb-3"></i>
                                    <h3 class="text-white fw-bold display-6">{{ userRestaurant.rating }}</h3>
                                    <p class="text-white-50 mb-0 fw-semibold">Average Rating</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card restaurant-card text-center h-100 border-0">
                                <div class="card-body">
                                    <i class="fas fa-heart fa-2x text-danger mb-3"></i>
                                    <h3 class="text-white fw-bold display-6">{{ userRestaurant.menu.reduce((sum, item) => sum + item.likes, 0) }}</h3>
                                    <p class="text-white-50 mb-0 fw-semibold">Total Likes</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card restaurant-card text-center h-100 border-0">
                                <div class="card-body">
                                    <i class="fas fa-map-marker-alt fa-2x text-success mb-3"></i>
                                    <h3 class="text-white fw-bold h4">{{ userRestaurant.cuisine }}</h3>
                                    <p class="text-white-50 mb-0 fw-semibold">Cuisine Type</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Menu Management Tab -->
                <div v-if="activeTab === 'menu'" class="tab-content">
                    <!-- Add New Dish Form -->
                    <div class="card restaurant-card mb-4 border-0">
                        <div class="card-header" style="background: var(--glass-bg); backdrop-filter: blur(var(--blur-amount)); border-bottom: 1px solid var(--glass-border);">
                            <h4 class="text-white fw-bold mb-0">
                                <i class="fas fa-plus-circle me-2 text-primary"></i>Add New Dish
                            </h4>
                        </div>
                        <div class="card-body">
                            <form @submit.prevent="addDish" class="row g-3">
                                <div class="col-md-6">
                                    <label for="dish-name" class="form-label text-white fw-bold">
                                        <i class="fas fa-utensils me-2 text-primary"></i>Dish Name
                                    </label>
                                    <input type="text" id="dish-name" class="form-control" v-model="newDish.name" placeholder="e.g., Margherita Pizza" required>
                                </div>
                                <div class="col-md-3">
                                    <label for="dish-price" class="form-label text-white fw-bold">
                                        <i class="fas fa-dollar-sign me-2 text-success"></i>Price ($)
                                    </label>
                                    <input type="number" id="dish-price" class="form-control" v-model="newDish.price" step="0.01" placeholder="0.00" required>
                                </div>
                                <div class="col-md-3">
                                    <label for="dish-category" class="form-label text-white fw-bold">
                                        <i class="fas fa-tags me-2 text-warning"></i>Category
                                    </label>
                                    <input type="text" id="dish-category" class="form-control" v-model="newDish.category" placeholder="e.g., Pizza" required>
                                </div>
                                <div class="col-12">
                                    <label for="dish-description" class="form-label text-white fw-bold">
                                        <i class="fas fa-comment me-2 text-info"></i>Description
                                    </label>
                                    <textarea id="dish-description" class="form-control" v-model="newDish.description" rows="2" placeholder="Describe your dish..." required></textarea>
                                </div>
                                <div class="col-12">
                                    <button type="submit" class="btn btn-primary btn-lg px-4">
                                        <i class="fas fa-plus me-2"></i>Add Dish
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <!-- Menu Items List -->
                    <div class="card restaurant-card border-0">
                        <div class="card-header" style="background: var(--glass-bg); backdrop-filter: blur(var(--blur-amount)); border-bottom: 1px solid var(--glass-border);">
                            <h4 class="text-white fw-bold mb-0">
                                <i class="fas fa-list me-2 text-primary"></i>Current Menu Items
                            </h4>
                        </div>
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table table-dark table-striped table-hover">
                                    <thead class="table-primary">
                                        <tr>
                                            <th class="text-dark fw-bold">
                                                <i class="fas fa-utensils me-2"></i>Name
                                            </th>
                                            <th class="text-dark fw-bold">
                                                <i class="fas fa-tags me-2"></i>Category
                                            </th>
                                            <th class="text-dark fw-bold">
                                                <i class="fas fa-dollar-sign me-2"></i>Price
                                            </th>
                                            <th class="text-dark fw-bold">
                                                <i class="fas fa-heart me-2"></i>Likes
                                            </th>
                                            <th class="text-dark fw-bold">
                                                <i class="fas fa-cogs me-2"></i>Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="dish in userRestaurant.menu" :key="dish.id">
                                            <td v-if="editingDish && editingDish.id === dish.id">
                                                <input type="text" class="form-control form-control-sm" v-model="editingDish.name">
                                            </td>
                                            <td v-else class="text-white fw-semibold">{{ dish.name }}</td>
                                            
                                            <td v-if="editingDish && editingDish.id === dish.id">
                                                <input type="text" class="form-control form-control-sm" v-model="editingDish.category">
                                            </td>
                                            <td v-else>
                                                <span class="badge bg-secondary">{{ dish.category }}</span>
                                            </td>
                                            
                                            <td v-if="editingDish && editingDish.id === dish.id">
                                                <input type="number" class="form-control form-control-sm" v-model="editingDish.price" step="0.01">
                                            </td>
                                            <td v-else class="text-success fw-bold">\${{ dish.price }}</td>
                                            
                                            <td class="text-danger fw-bold">
                                                <i class="fas fa-heart me-1"></i>{{ dish.likes }}
                                            </td>
                                            
                                            <td>
                                                <div v-if="editingDish && editingDish.id === dish.id" class="btn-group btn-group-sm">
                                                    <button class="btn btn-success" @click="saveDish">
                                                        <i class="fas fa-save me-1"></i>Save
                                                    </button>
                                                    <button class="btn btn-secondary" @click="editingDish = null">
                                                        <i class="fas fa-times me-1"></i>Cancel
                                                    </button>
                                                </div>
                                                <div v-else class="btn-group btn-group-sm">
                                                    <button class="btn btn-outline-info" @click="editDish(dish)">
                                                        <i class="fas fa-edit me-1"></i>Edit
                                                    </button>
                                                    <button class="btn btn-outline-danger" @click="deleteDish(dish.id)">
                                                        <i class="fas fa-trash me-1"></i>Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr v-if="userRestaurant.menu.length === 0">
                                            <td colspan="5" class="text-center text-white-50 py-4">
                                                <i class="fas fa-utensils fa-2x mb-2 d-block"></i>
                                                No menu items yet. Add your first dish above!
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
                // Use persistent method to update booking
                dataStore.updateBooking(cancellingBooking.value.id, { status: 'cancelled' });
                
                // Show cancel notification
                window.app.showNotification({
                    type: 'warning',
                    title: 'Booking Cancelled',
                    message: `Your reservation has been cancelled and saved.`
                });
                
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

            // Use persistent method to update booking
            dataStore.updateBooking(editingBooking.value.id, {
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
                message: 'Your reservation has been updated and saved successfully.'
            });
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
                        <small class="text-muted">
                            <i class="fas fa-database me-1"></i>
                            Data automatically saved to your browser
                        </small>
                    </div>
                    <div class="col-md-6 text-md-end">
                        <p>&copy; 2024 FoodieFind. All rights reserved.</p>
                        <button class="btn btn-outline-light btn-sm me-2" onclick="window.app.exportData()">
                            <i class="fas fa-download me-1"></i>Export Data
                        </button>
                        <button class="btn btn-outline-light btn-sm" onclick="window.app.clearData()">
                            <i class="fas fa-trash me-1"></i>Clear Data
                        </button>
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
    routes,
    scrollBehavior(to, from, savedPosition) {
        // Always scroll to top immediately when navigating to any route
        return { top: 0, behavior: 'instant' };
    }
});

router.beforeEach((to, from, next) => {
    // Immediately scroll to top before route change
    window.scrollTo(0, 0);
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

        // Check for stored authentication and initialize data persistence
        onMounted(() => {
            console.log('🚀 FoodieFind app initializing...');
            
            // Initialize data persistence system
            dataStorageService.loadAllData();
            dataStorageService.initializeWatchers();
            
            // Check for stored authentication
            const stored = localStorage.getItem('foodiefind_user');
            if (stored) {
                currentUser.value = JSON.parse(stored);
                isAuthenticated.value = true;
                console.log('👤 User authentication restored from localStorage');
            }
            
            console.log('✅ App initialization complete');
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

        // Make functions globally available for footer buttons
        window.app = { 
            showNotification,
            exportData() {
                const data = dataStorageService.exportData();
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `foodiefind-backup-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                showNotification({
                    type: 'success',
                    title: 'Data Exported',
                    message: 'Your data has been exported successfully!'
                });
            },
            clearData() {
                if (confirm('Are you sure you want to clear all saved data? This action cannot be undone.')) {
                    dataStorageService.clearAllData();
                    location.reload();
                }
            }
        };

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
