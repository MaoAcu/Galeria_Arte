(function() {
            // ----- GESTIÓN DE INPUTS OTP -----
            const otpInputs = document.querySelectorAll('.otp-input');
            const hiddenCodigo = document.getElementById('codigo');
            const form = document.getElementById('otp-form');
            const submitBtn = document.getElementById('submitBtn');
            const flashContainer = document.getElementById('flash-container');

            // Función para mostrar mensajes flotantes
            function showFlash(message, category = 'success') {
                const flashDiv = document.createElement('div');
                flashDiv.className = `flash ${category}`;
                
                // Agregar icono según categoría
                const icon = document.createElement('i');
                icon.className = category === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-triangle';
                flashDiv.appendChild(icon);
                
                const textSpan = document.createElement('span');
                textSpan.textContent = message;
                flashDiv.appendChild(textSpan);
                
                flashContainer.appendChild(flashDiv);

                // Desaparece después de 4 segundos
                setTimeout(() => {
                    flashDiv.style.opacity = '0';
                    flashDiv.style.transition = 'opacity 0.5s';
                    setTimeout(() => flashDiv.remove(), 600);
                }, 3800);
            }

            // Enfocar primer input al cargar
            if (otpInputs.length) otpInputs[0].focus();

            // Manejo de entrada
            otpInputs.forEach((input, index) => {
                // Restringir a números
                input.addEventListener('input', (e) => {
                    let value = e.target.value;
                    value = value.replace(/\D/g, '');
                    e.target.value = value;

                    if (value.length === 1) {
                        if (index < otpInputs.length - 1) {
                            otpInputs[index + 1].focus();
                        } else {
                            otpInputs[index].blur();
                        }
                    }
                    updateHiddenCode();
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

            // Actualizar campo oculto
            function updateHiddenCode() {
                let code = '';
                otpInputs.forEach(input => { code += input.value; });
                hiddenCodigo.value = code;
            }

            // Envío del formulario
            form.addEventListener('submit', (e) => {
                updateHiddenCode();
                const fullCode = hiddenCodigo.value;

                if (fullCode.length !== 6 || !/^\d+$/.test(fullCode)) {
                    e.preventDefault();
                    showFlash('Ingresa los 6 dígitos del código', 'error');
                    return;
                }

                // Activar feedback visual
                submitBtn.classList.add('loading');
                submitBtn.disabled = true;
                
                // Mensaje de confirmación (opcional)
                showFlash('Verificando código...', 'success');
            });

            // Reenviar código
            const resendLink = document.getElementById('resendLink');
            resendLink.addEventListener('click', (e) => {
                e.preventDefault();
                showFlash('Se ha reenviado un nuevo código a tu dispositivo', 'success');
                
                // Limpiar inputs
                otpInputs.forEach(inp => inp.value = '');
                otpInputs[0].focus();
                updateHiddenCode();
            });

            // Inicializar campo oculto
            updateHiddenCode();

            // Mensaje de bienvenida
            window.addEventListener('load', () => {
                setTimeout(() => {
                    showFlash('Bienvenido, Daniel. Introduce tu código de acceso.', 'success');
                }, 300);
            });
        })();