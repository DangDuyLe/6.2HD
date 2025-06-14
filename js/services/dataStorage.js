import { dataStore } from '../store/index.js';

export const dataStorageService = {
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