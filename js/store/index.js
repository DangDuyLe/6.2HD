import { reactive } from 'vue';
import { dataStorageService } from '../services/dataStorage.js';

// Sample data - in a real app this would come from a backend/API
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

// Enhanced data store
export const dataStore = reactive({
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
    },
    
    updateBooking(bookingId, updates) {
        const index = this.bookings.findIndex(b => b.id === bookingId);
        if (index !== -1) {
            Object.assign(this.bookings[index], updates);
            dataStorageService.saveToStorage(dataStorageService.STORAGE_KEYS.BOOKINGS, this.bookings);
        }
    },
    
    deleteBooking(bookingId) {
        const index = this.bookings.findIndex(b => b.id === bookingId);
        if (index !== -1) {
            this.bookings.splice(index, 1);
            dataStorageService.saveToStorage(dataStorageService.STORAGE_KEYS.BOOKINGS, this.bookings);
        }
    },
    
    saveLikedItem(itemId) {
        this.likedItems.add(itemId);
        dataStorageService.saveToStorage(dataStorageService.STORAGE_KEYS.LIKED_ITEMS, Array.from(this.likedItems));
    },
    
    removeLikedItem(itemId) {
        this.likedItems.delete(itemId);
        dataStorageService.saveToStorage(dataStorageService.STORAGE_KEYS.LIKED_ITEMS, Array.from(this.likedItems));
    },
    
    updateRestaurant(restaurantId, updates) {
        const index = this.restaurants.findIndex(r => r.id === restaurantId);
        if (index !== -1) {
            Object.assign(this.restaurants[index], updates);
            dataStorageService.saveToStorage(dataStorageService.STORAGE_KEYS.RESTAURANTS, this.restaurants);
        }
    },
    
    addMenuItem(restaurantId, menuItem) {
        const restaurant = this.restaurants.find(r => r.id === restaurantId);
        if (restaurant) {
            restaurant.menu.push(menuItem);
            dataStorageService.saveToStorage(dataStorageService.STORAGE_KEYS.RESTAURANTS, this.restaurants);
        }
    },
    
    updateMenuItem(restaurantId, menuItemId, updates) {
        const restaurant = this.restaurants.find(r => r.id === restaurantId);
        if (restaurant) {
            const menuIndex = restaurant.menu.findIndex(m => m.id === menuItemId);
            if (menuIndex !== -1) {
                Object.assign(restaurant.menu[menuIndex], updates);
                dataStorageService.saveToStorage(dataStorageService.STORAGE_KEYS.RESTAURANTS, this.restaurants);
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
            }
        }
    }
});