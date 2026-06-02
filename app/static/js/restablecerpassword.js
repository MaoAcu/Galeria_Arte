     (function() {
            // Variables globales de requisitos
            let passwordRequirements = {
                length: false,
                uppercase: false,
                lowercase: false,
                number: false,
                special: false
            };

            const newPasswordInput = document.getElementById('newPassword');
            const confirmPasswordInput = document.getElementById('confirmPassword');
            const resetBtn = document.getElementById('resetBtn');
            const strengthIndicator = document.getElementById('passwordStrength');
            const strengthBar = document.getElementById('passwordStrengthBar');
            const strengthText = document.getElementById('strengthText');
            const passwordError = document.getElementById('passwordError');
            const passwordSuccess = document.getElementById('passwordSuccess');
            const confirmError = document.getElementById('confirmError');
            const confirmSuccess = document.getElementById('confirmSuccess');

            // Elementos de requisitos
            const reqLength = document.getElementById('req-length').querySelector('.requirement-icon');
            const reqUppercase = document.getElementById('req-uppercase').querySelector('.requirement-icon');
            const reqLowercase = document.getElementById('req-lowercase').querySelector('.requirement-icon');
            const reqNumber = document.getElementById('req-number').querySelector('.requirement-icon');
            const reqSpecial = document.getElementById('req-special').querySelector('.requirement-icon');

            // Referencias a iconos
            const reqIcons = {
                length: reqLength,
                uppercase: reqUppercase,
                lowercase: reqLowercase,
                number: reqNumber,
                special: reqSpecial
            };

            // ----- VALIDACIÓN DE CONTRASEÑA -----
            function validatePassword(password) {
                const requirements = {
                    length: password.length >= 8,
                    uppercase: /[A-Z]/.test(password),
                    lowercase: /[a-z]/.test(password),
                    number: /\d/.test(password),
                    special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
                };

                passwordRequirements = requirements;

                // Actualizar indicadores visuales
                Object.keys(requirements).forEach(req => {
                    const icon = reqIcons[req];
                    if (requirements[req]) {
                        icon.classList.remove('requirement-pending');
                        icon.classList.add('requirement-met');
                        icon.textContent = '✓';
                    } else {
                        icon.classList.remove('requirement-met');
                        icon.classList.add('requirement-pending');
                        icon.textContent = '✗';
                    }
                });

                const allMet = Object.values(requirements).every(req => req);

                if (password.length === 0) {
                    newPasswordInput.classList.remove('error', 'success');
                    passwordError.style.display = 'none';
                    passwordSuccess.style.display = 'none';
                } else if (allMet) {
                    newPasswordInput.classList.add('success');
                    newPasswordInput.classList.remove('error');
                    passwordSuccess.querySelector('span').textContent = 'Contraseña segura';
                    passwordSuccess.style.display = 'flex';
                    passwordError.style.display = 'none';
                } else {
                    newPasswordInput.classList.add('error');
                    newPasswordInput.classList.remove('success');
                    passwordError.querySelector('span').textContent = 'La contraseña no cumple todos los requisitos';
                    passwordError.style.display = 'flex';
                    passwordSuccess.style.display = 'none';
                }

                return allMet;
            }

            // ----- ACTUALIZAR FORTALEZA -----
            function updatePasswordStrength(password) {
                if (!password) {
                    strengthIndicator.style.display = 'none';
                    strengthText.textContent = '';
                    return;
                }

                strengthIndicator.style.display = 'block';

                const metRequirements = Object.values(passwordRequirements).filter(req => req).length;
                const percentage = (metRequirements / 5) * 100;

                strengthBar.style.width = percentage + '%';
                strengthBar.className = 'password-strength-bar';

                if (metRequirements <= 2) {
                    strengthBar.classList.add('strength-weak');
                    strengthText.textContent = 'Débil';
                    strengthText.style.color = 'var(--strength-weak)';
                } else if (metRequirements <= 3) {
                    strengthBar.classList.add('strength-medium');
                    strengthText.textContent = 'Media';
                    strengthText.style.color = 'var(--strength-medium)';
                } else {
                    strengthBar.classList.add('strength-strong');
                    strengthText.textContent = 'Fuerte';
                    strengthText.style.color = 'var(--strength-strong)';
                }
            }

            // ----- VALIDAR CONFIRMACIÓN -----
            function validateConfirmPassword(confirmPassword) {
                const newPassword = newPasswordInput.value;

                if (!confirmPassword) {
                    confirmPasswordInput.classList.remove('error', 'success');
                    confirmError.style.display = 'none';
                    confirmSuccess.style.display = 'none';
                    return false;
                }

                if (confirmPassword !== newPassword) {
                    confirmPasswordInput.classList.add('error');
                    confirmPasswordInput.classList.remove('success');
                    confirmError.querySelector('span').textContent = 'Las contraseñas no coinciden';
                    confirmError.style.display = 'flex';
                    confirmSuccess.style.display = 'none';
                    return false;
                }

                confirmPasswordInput.classList.add('success');
                confirmPasswordInput.classList.remove('error');
                confirmSuccess.querySelector('span').textContent = 'Las contraseñas coinciden';
                confirmSuccess.style.display = 'flex';
                confirmError.style.display = 'none';
                return true;
            }

            // ----- VERIFICAR FORMULARIO HABILITADO -----
            function checkFormValidity() {
                const newPassword = newPasswordInput.value;
                const confirmPassword = confirmPasswordInput.value;

                const passwordValid = Object.values(passwordRequirements).every(req => req);
                const confirmValid = (newPassword === confirmPassword && confirmPassword.length > 0);

                resetBtn.disabled = !(passwordValid && confirmValid);
            }

            // ----- EVENT LISTENERS -----
            newPasswordInput.addEventListener('input', function() {
                validatePassword(this.value);
                updatePasswordStrength(this.value);
                checkFormValidity();
                if (confirmPasswordInput.value.length) validateConfirmPassword(confirmPasswordInput.value);
            });

            confirmPasswordInput.addEventListener('input', function() {
                validateConfirmPassword(this.value);
                checkFormValidity();
            });

            // ----- TOGGLE PASSWORD -----
            function togglePasswordVisibility(inputId, iconElement) {
                const input = document.getElementById(inputId);
                const isPassword = input.type === 'password';
                input.type = isPassword ? 'text' : 'password';
                iconElement.classList.toggle('fa-eye');
                iconElement.classList.toggle('fa-eye-slash');
            }

            document.getElementById('toggleNewPassword').addEventListener('click', function(e) {
                togglePasswordVisibility('newPassword', e.currentTarget);
            });

            document.getElementById('toggleConfirmPassword').addEventListener('click', function(e) {
                togglePasswordVisibility('confirmPassword', e.currentTarget);
            });

            // ----- MODAL FUNCTIONS -----
            const modal = document.getElementById('successModal');
            const modalClose = document.getElementById('modalClose');

            function showModal(title, message, type = 'success', redirectUrl = null) {
                const modalTitle = modal.querySelector('h2');
                const modalMsg = modal.querySelector('p');
                const modalIcon = modal.querySelector('.modal-icon i');
                
                if (modalTitle) modalTitle.textContent = title;
                if (modalMsg) modalMsg.textContent = message;
                if (modalIcon) {
                    modalIcon.className = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
                }
                
                modal.style.display = 'flex';

                if (redirectUrl) {
                    setTimeout(() => {
                        modal.style.display = 'none';
                        window.location.href = redirectUrl;
                    }, 2800);
                }
            }

            modalClose.addEventListener('click', function() {
                modal.style.display = 'none';
            });
            
            window.addEventListener('click', (e) => {
                if (e.target === modal) modal.style.display = 'none';
            });

            // ----- ENVÍO DEL FORMULARIO -----
            document.getElementById('resetForm').addEventListener('submit', function(e) {
                e.preventDefault();

                const newPassword = document.getElementById('newPassword').value;

                 
                setTimeout(() => {
                      
                     
                    fetch('/crede/update_password', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ new_password: newPassword })
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            showModal('¡Contraseña actualizada!', 'Tu contraseña se cambió correctamente. Serás redirigido al login.', 'success', '/login');
                        } else {
                            showModal('¡Algo salió mal!', data.message || 'Error', 'error');
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        showModal('Error', 'No se pudo conectar al servidor.', 'error');
                    });
                     
                }, 800);
            });

            // Inicializar estado
            validatePassword('');
            checkFormValidity();
        })();