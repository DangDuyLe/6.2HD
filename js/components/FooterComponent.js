// No imports needed for this component.

export const FooterComponent = {
    template: `
        <footer class="py-5 mt-auto">
            <div class="container">
                <div class="row">
                    <!-- Brand Section -->
                    <div class="col-lg-4 col-md-6 mb-4">
                        <div class="footer-brand">
                            <h4 class="text-primary fw-bold mb-3">
                                <i class="fas fa-utensils me-2"></i>FoodieFind
                            </h4>
                            <p class="text-white-50 mb-4">
                                Discover amazing restaurants and culinary experiences in your area. 
                                Your gateway to the best dining adventures.
                            </p>
                            <div class="social-links">
                                <a href="#" class="btn btn-outline-primary btn-sm me-2 mb-2">
                                    <i class="fab fa-facebook-f"></i>
                                </a>
                                <a href="#" class="btn btn-outline-primary btn-sm me-2 mb-2">
                                    <i class="fab fa-twitter"></i>
                                </a>
                                <a href="#" class="btn btn-outline-primary btn-sm me-2 mb-2">
                                    <i class="fab fa-instagram"></i>
                                </a>
                                <a href="#" class="btn btn-outline-primary btn-sm me-2 mb-2">
                                    <i class="fab fa-linkedin-in"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Quick Links -->
                    <div class="col-lg-2 col-md-6 mb-4">
                        <h6 class="text-primary fw-bold mb-3">Quick Links</h6>
                        <ul class="list-unstyled">
                            <li class="mb-2">
                                <router-link to="/" class="text-white-50 text-decoration-none footer-link">
                                    <i class="fas fa-home me-2"></i>Home
                                </router-link>
                            </li>
                            <li class="mb-2">
                                <router-link to="/restaurants" class="text-white-50 text-decoration-none footer-link">
                                    <i class="fas fa-utensils me-2"></i>Restaurants
                                </router-link>
                            </li>
                            <li class="mb-2">
                                <a href="#features" class="text-white-50 text-decoration-none footer-link">
                                    <i class="fas fa-star me-2"></i>Features
                                </a>
                            </li>
                            <li class="mb-2">
                                <a href="#about" class="text-white-50 text-decoration-none footer-link">
                                    <i class="fas fa-info-circle me-2"></i>About Us
                                </a>
                            </li>
                        </ul>
                    </div>
                    
                    <!-- Support -->
                    <div class="col-lg-3 col-md-6 mb-4">
                        <h6 class="text-primary fw-bold mb-3">Support</h6>
                        <ul class="list-unstyled">
                            <li class="mb-2">
                                <a href="#" class="text-white-50 text-decoration-none footer-link">
                                    <i class="fas fa-question-circle me-2"></i>Help Center
                                </a>
                            </li>
                            <li class="mb-2">
                                <a href="#" class="text-white-50 text-decoration-none footer-link">
                                    <i class="fas fa-envelope me-2"></i>Contact Us
                                </a>
                            </li>
                            <li class="mb-2">
                                <a href="#" class="text-white-50 text-decoration-none footer-link">
                                    <i class="fas fa-shield-alt me-2"></i>Privacy Policy
                                </a>
                            </li>
                            <li class="mb-2">
                                <a href="#" class="text-white-50 text-decoration-none footer-link">
                                    <i class="fas fa-file-contract me-2"></i>Terms of Service
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
                
                <!-- Bottom Section -->
                <hr class="my-4" style="border-color: rgba(255,255,255,0.1);">
                <div class="row align-items-center">
                    <div class="col-md-6">
                        <small class="text-white-50">
                            &copy; 2024 FoodieFind. All rights reserved. Built with ❤️ for food lovers.
                        </small>
                    </div>
                    <div class="col-md-6 text-md-end">
                        <small class="text-white-50">
                            <i class="fas fa-code me-1"></i>
                            Powered by Vue.js & Modern Web Technologies
                        </small>
                    </div>
                </div>
            </div>
        </footer>
    `
};