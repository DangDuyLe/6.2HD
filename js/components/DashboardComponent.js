import { ref, reactive, computed } from 'vue';
import { dataStore } from '../store/index.js';

export const DashboardComponent = {
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
