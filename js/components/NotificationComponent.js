export const NotificationComponent = {
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