document.addEventListener('DOMContentLoaded', function() {
            // Elementos del DOM
            const codeForm = document.getElementById('codeForm');
            const otpInputs = document.querySelectorAll('.otp-input');
            const hiddenCodigo = document.getElementById('codigoCompleto');
            const codeError = document.getElementById('codeError');
            const submitBtn = document.getElementById('submitBtn');
            const resendBtn = document.getElementById('resendCode');
            
            // Modal elements
            const modal = document.getElementById('successModal');
            const modalClose = document.getElementById('modalClose');
            const modalTitle = document.getElementById('modalTitle');
            const modalMessage = document.getElementById('modalMessage');

            // --- FUNCIONES AUXILIARES ---
            function updateHiddenCode() {
                let code = '';
                otpInputs.forEach(input => { code += input.value; });
                hiddenCodigo.value = code;
            }

            function showError(msg) {
                const errorText = codeError.querySelector('.error-text');
                if (errorText) errorText.innerHTML = msg;
                codeError.style.display = 'flex';
                
                // Scroll suave al error
                codeError.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }

            function resetButton() {
                submitBtn.innerHTML = 'VERIFICAR CÓDIGO';
                submitBtn.disabled = false;
            }

            // Función para mostrar modal
            function mostrarExito(titulo, mensaje) {
                if(modal) {
                    modalTitle.innerText = titulo;
                    modalMessage.innerText = mensaje;
                    modal.style.display = 'flex';
                    
                    // Se cierra solo tras 3 segundos
                    setTimeout(() => { 
                        modal.style.display = 'none'; 
                    }, 3000);
                }
            }

            // Cerrar modal con X
            if (modalClose) {
                modalClose.addEventListener('click', function() {
                    modal.style.display = 'none';
                });
            }

            // Cerrar modal al hacer clic fuera
            window.addEventListener('click', (e) => {
                if (e.target === modal) modal.style.display = 'none';
            });

            // --- MANEJO DE INPUTS OTP ---
            if (otpInputs.length) otpInputs[0].focus();

            otpInputs.forEach((input, index) => {
                // Restringir a dígitos
                input.addEventListener('input', (e) => {
                    let value = e.target.value;
                    value = value.replace(/\D/g, '');
                    e.target.value = value;

                    if (value.length === 1) {
                        // Avanzar al siguiente si existe
                        if (index < otpInputs.length - 1) {
                            otpInputs[index + 1].focus();
                        } else {
                            otpInputs[index].blur();
                        }
                    }
                    // Actualizar campo oculto
                    updateHiddenCode();

                    // Ocultar error mientras escribe
                    if (codeError.style.display === 'flex') {
                        codeError.style.display = 'none';
                    }
                });

                // Tecla backspace
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Backspace') {
                        if (e.target.value === '' && index > 0) {
                            otpInputs[index - 1].focus();
                            otpInputs[index - 1].value = '';
                            updateHiddenCode();
                        } else {
                            setTimeout(updateHiddenCode, 10);
                        }
                    }
                });

                // Pegado de números
                input.addEventListener('paste', (e) => {
                    e.preventDefault();
                    const pasteData = (e.clipboardData || window.clipboardData).getData('text');
                    const digits = pasteData.replace(/\D/g, '').split('').slice(0, 6);
                    
                    digits.forEach((digit, i) => {
                        if (otpInputs[i]) {
                            otpInputs[i].value = digit;
                        }
                    });
                    if (digits.length < 6) {
                        otpInputs[digits.length].focus();
                    } else {
                        otpInputs[5].blur();
                    }
                    updateHiddenCode();
                });
            });

            // --- MANEJO DEL FORMULARIO ---
            codeForm.addEventListener('submit', function(e) {
                e.preventDefault();

                updateHiddenCode();
                const codigo = hiddenCodigo.value;

                if (codigo.length !== 6) {
                    showError("El código debe tener 6 dígitos");
                    return;
                }

                submitBtn.innerHTML = '⏳ VERIFICANDO...';
                submitBtn.disabled = true;
                codeError.style.display = 'none';

                // SIMULACIÓN - Reemplazar con tu fetch real
                setTimeout(() => {
                    // Simular éxito (código "123456" para prueba)
                    if (codigo === "123456") {
                        mostrarExito('¡Código correcto!', 'Redirigiendo para restablecer contraseña');
                        setTimeout(() => {
                            window.location.href = "/nueva-contrasena";
                        }, 1500);
                    } else {
                        showError("Código incorrecto. Intenta de nuevo");
                        resetButton();
                    }
                }, 1000);

                // --- TU CÓDIGO FETCH REAL (comentado para simulación) ---
                /*
                fetch('/crede/validate_code', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ codigo: codigo })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        window.location.href = data.redirect_url || "/nueva-contrasena";
                    } else {
                        showError(data.message || "Código incorrecto");
                        resetButton();
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    showError("Error de conexión con el servidor");
                    resetButton();
                });
                */
            });

            // --- REENVIAR CÓDIGO ---
            resendBtn.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Feedback visual
                const originalText = resendBtn.innerHTML;
                resendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
                resendBtn.classList.add('disabled');

                // SIMULACIÓN - Reemplazar con tu fetch real
                setTimeout(() => {
                    mostrarExito('¡Código reenviado!', 'Se ha enviado un nuevo código a tu correo');
                    
                    // Limpiar inputs
                    otpInputs.forEach(inp => inp.value = '');
                    otpInputs[0].focus();
                    updateHiddenCode();
                    
                    resendBtn.innerHTML = originalText;
                    resendBtn.classList.remove('disabled');
                }, 1500);

                // --- TU CÓDIGO FETCH REAL (comentado) ---
                /*
                fetch('/api/resend-recovery-code', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        mostrarExito('¡Enviado!', 'Se ha reenviado un nuevo código a tu correo');
                        otpInputs.forEach(inp => inp.value = '');
                        otpInputs[0].focus();
                        updateHiddenCode();
                    } else {
                        showError(data.message || "No se pudo reenviar el código");
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    showError("No se pudo reenviar el código");
                })
                .finally(() => {
                    resendBtn.innerHTML = originalText;
                    resendBtn.classList.remove('disabled');
                });
                */
            });

            // Inicializar campo oculto
            updateHiddenCode();
        });