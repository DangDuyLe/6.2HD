import { createRouter, createWebHashHistory } from 'vue-router';
// Import all your components
import { HomeComponent } from '../components/HomeComponent.js';
import { RestaurantsComponent } from '../components/RestaurantsComponent.js';
import { RestaurantDetailComponent } from '../components/RestaurantDetailComponent.js';
import { LoginComponent } from '../components/LoginComponent.js';
import { RegisterComponent } from '../components/RegisterComponent.js';
import { DashboardComponent } from '../components/DashboardComponent.js';
import { MyBookingsComponent } from '../components/MyBookingsComponent.js';

const routes = [
    { path: '/', component: HomeComponent },
    { path: '/restaurants', component: RestaurantsComponent },
    { path: '/restaurant/:id', component: RestaurantDetailComponent, props: true },
    { path: '/login', component: LoginComponent },
    { path: '/register', component: RegisterComponent },
    { path: '/dashboard', component: DashboardComponent },
    { path: '/my-bookings', component: MyBookingsComponent }
];

export const router = createRouter({
    history: createWebHashHistory(),
    routes,
    scrollBehavior(to, from, savedPosition) {
        return { top: 0, behavior: 'instant' };
    }
});

router.beforeEach((to, from, next) => {
    window.scrollTo(0, 0);
    to.meta.showNotification = router.app?.$root?.showNotification;
    next();
});