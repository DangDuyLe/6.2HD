// No imports needed for this component's script setup.
// Vue and VueRouter are available globally in the template.

export const NavigationComponent = {
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