import { reactive, ref } from 'vue';
import { dataStore } from '../store/index.js';

export const LoginComponent = {
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