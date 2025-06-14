import { createApp, ref, onMounted } from 'vue';

// Import services, store, router, and directives
import { dataStorageService } from './services/dataStorage.js';
import { router } from './router/index.js';
import { focusDirective } from './directives/focus.js';

// Import all components
import { NavigationComponent } from './components/NavigationComponent.js';
import { FooterComponent } from './components/FooterComponent.js';
import { NotificationComponent } from './components/NotificationComponent.js';

// Main Vue app
const app = createApp({
    setup() {
        const isAuthenticated = ref(false);
        const currentUser = ref(null);
        const notifications = ref([]);

        onMounted(() => {
            console.log('🚀 FoodieFind app initializing...');
            dataStorageService.loadAllData();
            dataStorageService.initializeWatchers();
            
            const stored = localStorage.getItem('foodiefind_user');
            if (stored) {
                currentUser.value = JSON.parse(stored);
                isAuthenticated.value = true;
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
            notifications.value.push({ id, ...notification });
            setTimeout(() => removeNotification(id), 5000);
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
                a.click();
                URL.revokeObjectURL(url);
                showNotification({ type: 'success', title: 'Data Exported', message: 'Your data has been exported successfully!' });
            },
            clearData() {
                if (confirm('Are you sure you want to clear all saved data?')) {
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

// Register global components and directives
app.component('navigation-component', NavigationComponent);
app.component('footer-component', FooterComponent);
app.component('notification-component', NotificationComponent);
app.directive('focus', focusDirective);

// Use router and mount app
app.use(router);
app.mount('#app');