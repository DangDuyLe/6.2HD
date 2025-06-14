import { ref, reactive, computed } from 'vue';
import { dataStore } from '../store/index.js';

export const MyBookingsComponent = {
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
