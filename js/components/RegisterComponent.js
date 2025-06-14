import { reactive, ref } from 'vue';
import { dataStore } from '../store/index.js';

export const RegisterComponent = {
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