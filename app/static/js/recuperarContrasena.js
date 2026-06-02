 // Variable para la redirección
         

        document.addEventListener('DOMContentLoaded', function() {
            const procesarBtn = document.getElementById('procesarBtn');
            const usuarioInput = document.getElementById('usuario'); 
            const emailError = document.getElementById('emailError'); 
            
            // El tipo siempre será '1' (Contraseña)
            const TIPO_RECUPERACION = '1';

            localStorage.removeItem('tipoUsuario');

            // Manejar el clic del botón
            procesarBtn.addEventListener('click', function() {
                const usuario = usuarioInput.value.trim();

                // Validar que no esté vacío
                if (!usuario) {
                    emailError.innerHTML = `<div class="error-text"><i class="fas fa-exclamation-circle"></i> Por favor ingresa tu correo electrónico</div>`;
                    return;
                }

                // Validar formato de email
                if (!isValidEmail(usuario)) {
                    emailError.innerHTML = `<div class="error-text"><i class="fas fa-exclamation-circle"></i> Por favor ingresa un correo electrónico válido</div>`;
                    return;
                }

                // Estilo de carga
                procesarBtn.innerHTML = '<i class="fas fa-spinner"></i> VALIDANDO...';
                procesarBtn.disabled = true;
                emailError.innerHTML = ''; 

                

                
                fetch('/crede/validar_usuario', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        usuario: usuario,
                        tipo: TIPO_RECUPERACION
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        localStorage.setItem('tipoUsuario', data.tipo);
                        window.location.href = URL_RECUPERAR;
                    } else {
                        emailError.innerHTML = `<div class="error-text"><i class="fas fa-exclamation-circle"></i> ${data.message}</div>`;
                        resetButton();
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    emailError.innerHTML = '<div class="error-text"><i class="fas fa-exclamation-circle"></i> Error de conexión</div>';
                    resetButton();
                });
                
            });

            // Función para validar email
            function isValidEmail(email) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return emailRegex.test(email);
            }

            // Función para resetear botón
            function resetButton() {
                procesarBtn.innerHTML = 'CONTINUAR';
                procesarBtn.disabled = false;
            }

            // Permitir enviar con Enter
            usuarioInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    procesarBtn.click();
                }
            });

            // Limpiar error al empezar a escribir
            usuarioInput.addEventListener('input', function() {
                emailError.innerHTML = '';
            });
        });