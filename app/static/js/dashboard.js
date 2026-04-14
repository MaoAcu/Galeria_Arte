  // ===== CONFIGURACIÓN =====
        const URL_IMG_BASE = "/static/images/";
        const URL_IMG_DEFAULT = "https://via.placeholder.com/400x300?text=Sin+Imagen";

        // ===== DATOS DE EJEMPLO =====
        let colecciones = [
            { id: 1, nombre: 'Serie Guardiana', icono: 'fa-tree', slug: 'serie-guardiana' },
            { id: 2, nombre: 'Raíces', icono: 'fa-leaf', slug: 'raices' },
            { id: 3, nombre: 'Vuelos', icono: 'fa-feather', slug: 'vuelos' },
            { id: 4, nombre: 'Memorias', icono: 'fa-mountain', slug: 'memorias' }
        ];

        let esculturas = [
            {
                id: 1,
                titulo: 'Guardián del Silencio',
                artista: 'Daniel Guido',
                año: '2025',
                material: 'Madera de cedro',
                descripcion: 'Escultura tallada directamente en madera maciza que revela un búho resguardado en el interior del tronco que le dio origen.',
                imagen: 'hhttps://mapatico.com/gallery/escultura8.jpg',
                coleccion: 'serie-guardiana',
                destacada: 1,
                estado: 'active'
            },
            {
                id: 2,
                titulo: 'Fuerza Ancestral',
                artista: 'Daniel Guido',
                año: '2025',
                material: 'Madera de guanacaste',
                descripcion: 'Tallado expresivo que representa la cabeza de un bovino como símbolo de trabajo y resistencia.',
                imagen: 'https://mapatico.com/gallery/escultura9.jpg',
                coleccion: 'serie-guardiana',
                destacada: 0,
                estado: 'active'
            },
            {
                id: 3,
                titulo: 'Raíz de Identidad',
                artista: 'Daniel Guido',
                año: '2025',
                material: 'Madera de cenízaro',
                descripcion: 'Busto femenino cuya cabellera se transforma en raíces, representando la conexión con nuestras raíces culturales.',
                imagen: 'https://mapatico.com/gallery/escultura10.jpg',
                coleccion: 'raices',
                destacada: 1,
                estado: 'active'
            },
            {
                id: 4,
                titulo: 'Vuelo Interior',
                artista: 'Daniel Guido',
                año: '2024',
                material: 'Madera de ron ron',
                descripcion: 'Interpretación abstracta del movimiento y la libertad. Las formas curvas sugieren alas desplegándose.',
                imagen: 'https://mapatico.com/gallery/escultura11.jpg',
                coleccion: 'vuelos',
                destacada: 0,
                estado: 'active'
            },
            {
                id: 5,
                titulo: 'Danza de la Tierra',
                artista: 'Daniel Guido',
                año: '2024',
                material: 'Madera de laurel',
                descripcion: 'Obra que surge de un tronco caído naturalmente, preservando las marcas del tiempo.',
                imagen: 'https://mapatico.com/gallery/escultura12.jpg',
                coleccion: 'memorias',
                destacada: 0,
                estado: 'inactive'
            }
        ];

        let currentSection = 'colecciones';
        let editingItem = null;
        let editingColeccion = null;
        let deleteCallback = null;
        let selectedImageFile = null;

        // ===== FUNCIONES DE LOADER =====
        function showLoader() {
            document.getElementById('loader').classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }

        function hideLoader() {
            document.getElementById('loader').classList.add('hidden');
            document.body.style.overflow = '';
        }

        // ===== FUNCIONES DE MODALES =====
        function showInfoModal(title, message, icon = 'check-circle') {
            document.getElementById('infoModalIcon').innerHTML = `<i class="fas fa-${icon}"></i>`;
            document.getElementById('infoModalTitle').textContent = title;
            document.getElementById('infoModalMessage').textContent = message;
            document.getElementById('infoModal').classList.add('active');
        }

        function closeInfoModal() {
            document.getElementById('infoModal').classList.remove('active');
        }

        function showDeleteModal(title, message, callback) {
            document.getElementById('deleteModalTitle').textContent = title;
            document.getElementById('deleteModalMessage').textContent = message;
            deleteCallback = callback;
            
            const confirmBtn = document.getElementById('confirmDeleteBtn');
            const newBtn = confirmBtn.cloneNode(true);
            confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);
            newBtn.addEventListener('click', function() {
                if (deleteCallback) {
                    deleteCallback();
                    closeDeleteModal();
                }
            });
            
            document.getElementById('deleteModal').classList.add('active');
        }

        function closeDeleteModal() {
            document.getElementById('deleteModal').classList.remove('active');
            deleteCallback = null;
        }

        // ===== FUNCIONES DE COLECCIONES =====
        function renderColecciones() {
            const grid = document.getElementById('coleccionesGrid');
            const lista = document.getElementById('coleccionesList');
            
            grid.innerHTML = colecciones.map(col => {
                const obrasEnColeccion = esculturas.filter(e => e.coleccion === col.slug).length;
                return `
                    <div class="categoria-card">
                        <div class="categoria-icon">
                            <i class="fas ${col.icono}"></i>
                        </div>
                        <div class="categoria-info">
                            <h4>${col.nombre}</h4>
                            <p>${obrasEnColeccion} ${obrasEnColeccion === 1 ? 'obra' : 'obras'}</p>
                        </div>
                        <div class="categoria-actions">
                            <button class="btn-edit" onclick="openColeccionModal(${col.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-delete" onclick="confirmDeleteColeccion(${col.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `;
            }).join('');

            lista.innerHTML = colecciones.map(col => `
                <li data-section="${col.slug}">
                    <i class="fas ${col.icono}"></i>
                    <span>${col.nombre}</span>
                </li>
            `).join('') + `
                <li class="sidebar-divider" style="height: 1px; background: linear-gradient(90deg, transparent, var(--color-secondary), transparent); margin: 15px 20px; pointer-events: none;"></li>
                <div class="sidebar-section-title">ADMINISTRACIÓN</div>
                <li id="menuColecciones" data-section="colecciones">
                    <i class="fas fa-layer-group"></i>
                    <span>Gestionar Colecciones</span>
                </li>
                <li data-section="config">
                    <i class="fas fa-cog"></i>
                    <span>Configuración</span>
                </li>
            `;

            asignarEventosSidebar();
        }

        function asignarEventosSidebar() {
            document.querySelectorAll('#coleccionesList li').forEach(item => {
                item.addEventListener('click', (e) => {
                    const section = e.currentTarget.dataset.section;
                    switchSection(section);
                    if (window.innerWidth <= 768) toggleSidebar(false);
                });
            });

            const menuColecciones = document.getElementById('menuColecciones');
            if (menuColecciones) {
                menuColecciones.addEventListener('click', () => {
                    switchSection('colecciones');
                    if (window.innerWidth <= 768) toggleSidebar(false);
                });
            }

            const configItem = document.querySelector('[data-section="config"]');
            if (configItem) {
                configItem.addEventListener('click', () => {
                    switchSection('config');
                    if (window.innerWidth <= 768) toggleSidebar(false);
                });
            }
        }

        function openColeccionModal(id = null) {
            editingColeccion = id ? colecciones.find(c => c.id === id) : null;
            document.getElementById('coleccionModalTitle').textContent = editingColeccion ? 'Editar Colección' : 'Nueva Colección';
            document.getElementById('coleccionId').value = editingColeccion?.id || '';
            document.getElementById('coleccionNombre').value = editingColeccion?.nombre || '';
            document.getElementById('coleccionIcono').value = editingColeccion?.icono || 'fa-tree';
            document.getElementById('coleccionModal').classList.add('active');
        }

        function closeColeccionModal() {
            document.getElementById('coleccionModal').classList.remove('active');
            editingColeccion = null;
        }

        function saveColeccion(e) {
            e.preventDefault();
            const id = document.getElementById('coleccionId').value;
            const nombre = document.getElementById('coleccionNombre').value;
            const icono = document.getElementById('coleccionIcono').value;
            const slug = nombre.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

            if (id) {
                const index = colecciones.findIndex(c => c.id === parseInt(id));
                colecciones[index] = { ...colecciones[index], nombre, icono, slug };
                showInfoModal('Éxito', 'Colección actualizada correctamente');
            } else {
                const newId = Math.max(...colecciones.map(c => c.id), 0) + 1;
                colecciones.push({ id: newId, nombre, icono, slug });
                showInfoModal('Éxito', 'Colección creada correctamente');
            }

            closeColeccionModal();
            renderColecciones();
            if (currentSection === 'colecciones') {
                document.getElementById('coleccionesSection').style.display = 'block';
            }
        }

        function confirmDeleteColeccion(id) {
            const coleccion = colecciones.find(c => c.id === id);
            const obrasEnColeccion = esculturas.filter(e => e.coleccion === coleccion.slug);
            
            if (obrasEnColeccion.length > 0) {
                showInfoModal('No se puede eliminar', 'Esta colección tiene obras asociadas. Mueve las obras a otra colección primero.', 'exclamation-triangle');
                return;
            }

            showDeleteModal(
                '¿Eliminar colección?',
                `¿Estás seguro de eliminar la colección "${coleccion.nombre}"?`,
                () => {
                    colecciones = colecciones.filter(c => c.id !== id);
                    renderColecciones();
                    showInfoModal('Éxito', 'Colección eliminada correctamente');
                    if (currentSection === coleccion.slug) {
                        switchSection('colecciones');
                    }
                }
            );
        }

        // ===== FUNCIONES DE ESCULTURAS =====
        function renderEsculturas(coleccionSlug) {
            const container = document.getElementById('esculturasSection');
            const obras = esculturas.filter(e => e.coleccion === coleccionSlug);
            const coleccion = colecciones.find(c => c.slug === coleccionSlug);
            
            container.innerHTML = `
                <div class="content-section" style="display: block;">
                    <div class="section-header">
                        <h2><i class="fas ${coleccion?.icono || 'fa-sculpture'}"></i> ${coleccion?.nombre || coleccionSlug}</h2>
                        <button class="btn-add-item" onclick="openItemModal(null, '${coleccionSlug}')">
                            <i class="fas fa-plus"></i> Agregar Obra
                        </button>
                    </div>
                    <div class="items-grid">
                        ${obras.map(obra => createSculptureCard(obra)).join('')}
                        ${obras.length === 0 ? '<p style="text-align: center; padding: 60px; grid-column: 1/-1; color: var(--color-gray); background: var(--color-white); border-radius: var(--border-radius);">No hay obras en esta colección. ¡Comienza a crear!</p>' : ''}
                    </div>
                </div>
            `;
        }

        function createSculptureCard(obra) {
            const destacadoBadge = obra.destacada == 1 ? 
                '<span class="destacado-badge"><i class="fas fa-star"></i> Destacada</span>' : '';
            
            return `
                <div class="sculpture-card">
                    <div class="sculpture-image">
                        <img src="${obra.imagen}" alt="${obra.titulo}" onerror="this.src='${URL_IMG_DEFAULT}'">
                        ${destacadoBadge}
                    </div>
                    <div class="sculpture-info">
                        <div class="sculpture-header">
                            <h3 class="sculpture-name">${obra.titulo}</h3>
                            <span class="sculpture-year">${obra.año}</span>
                        </div>
                        <p class="sculpture-artist">${obra.artista}</p>
                        <p class="sculpture-description">${obra.descripcion}</p>
                        <div class="sculpture-meta">
                            <span class="meta-tag">${obra.material}</span>
                            <span class="status-badge ${obra.estado}" style="background: ${obra.estado === 'active' ? 'rgba(34,197,94,0.1)' : 'rgba(205,92,92,0.1)'}; color: ${obra.estado === 'active' ? '#16a34a' : '#b91c1c'};">
                                <i class="fas fa-${obra.estado === 'active' ? 'eye' : 'archive'}"></i>
                                ${obra.estado === 'active' ? 'En exhibición' : 'En bodega'}
                            </span>
                        </div>
                        <div class="sculpture-actions">
                            <button class="btn-edit" onclick="openItemModal(${obra.id})">
                                <i class="fas fa-edit"></i> Editar
                            </button>
                            <button class="btn-delete" onclick="confirmDeleteItem(${obra.id})">
                                <i class="fas fa-trash"></i> Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }

        function actualizarEstrellaSimple(valor) {
            const estrella = document.getElementById('estrellaSimple');
            if (!estrella) return;
            
            const icon = estrella.querySelector('i');
            const text = document.getElementById('destacadoText');
            const input = document.getElementById('sculptureDestacada');
            
            if (!icon || !text || !input) return;
            
            input.value = valor;
            
            if (valor == 1) {
                estrella.classList.add('activado');
                icon.className = 'fas fa-star';
                text.textContent = 'Obra destacada ⭐';
            } else {
                estrella.classList.remove('activado');
                icon.className = 'far fa-star';
                text.textContent = 'No destacada';
            }
        }

        function resetImageUpload() {
            const fileInput = document.getElementById('sculptureImageFile');
            if (fileInput) fileInput.value = '';
            
            const preview = document.querySelector('#imagePreview img');
            if (preview) {
                preview.src = '';
                preview.style.display = 'none';
            }
            
            const fileName = document.getElementById('imageFileName');
            if (fileName) fileName.textContent = '';
            
            selectedImageFile = null;
        }

        function handleImageSelect(event) {
            const file = event.target.files[0];
            if (!file) return;
            
            const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                showInfoModal('Error', 'Formato no válido. Use JPG, PNG o WEBP', 'exclamation-triangle');
                return;
            }
            
            document.getElementById('imageFileName').textContent = `📁 ${file.name}`;
            
            const reader = new FileReader();
            reader.onload = function(e) {
                const preview = document.querySelector('#imagePreview img');
                preview.src = e.target.result;
                preview.style.display = 'block';
            };
            reader.readAsDataURL(file);
            
            selectedImageFile = file;
        }

        function openItemModal(id = null, coleccionDefault = null) {
            editingItem = id ? esculturas.find(e => e.id === id) : null;
            
            document.getElementById('modalTitle').textContent = editingItem ? 'Editar Obra' : 'Nueva Obra';
            document.getElementById('sculptureId').value = editingItem?.id || '';
            document.getElementById('sculptureTitle').value = editingItem?.titulo || '';
            document.getElementById('sculptureYear').value = editingItem?.año || '';
            document.getElementById('sculptureMaterial').value = editingItem?.material || '';
            document.getElementById('sculptureDescription').value = editingItem?.descripcion || '';
            
            // Llenar select de colecciones
            const coleccionSelect = document.getElementById('coleccion');
            coleccionSelect.innerHTML = '<option value="">Seleccionar colección</option>' +
                colecciones.map(col => `<option value="${col.slug}">${col.nombre}</option>`).join('');
            coleccionSelect.value = editingItem?.coleccion || coleccionDefault || '';
            
            const estado = editingItem?.estado || 'active';
            document.getElementById('sculptureStatus').value = estado;
            document.querySelectorAll('.status-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.status === estado) btn.classList.add('active');
            });
            
            const destacada = editingItem?.destacada || 0;
            actualizarEstrellaSimple(destacada);
            
            resetImageUpload();
            
            if (editingItem?.imagen && editingItem.imagen !== URL_IMG_DEFAULT) {
                const preview = document.querySelector('#imagePreview img');
                if (preview) {
                    preview.src = editingItem.imagen;
                    preview.style.display = 'block';
                }
                const fileName = document.getElementById('imageFileName');
                if (fileName) fileName.textContent = `📁 ${editingItem.imagen.split('/').pop()}`;
            }
            
            document.getElementById('editModal').classList.add('active');
        }

        function closeItemModal() {
            document.getElementById('editModal').classList.remove('active');
            editingItem = null;
        }

        function saveItem(e) {
            e.preventDefault();
            
            const id = document.getElementById('sculptureId').value;
            const titulo = document.getElementById('sculptureTitle').value;
            const año = document.getElementById('sculptureYear').value;
            const material = document.getElementById('sculptureMaterial').value;
            const descripcion = document.getElementById('sculptureDescription').value;
            const coleccion = document.getElementById('coleccion').value;
            const estado = document.getElementById('sculptureStatus').value;
            const destacada = document.getElementById('sculptureDestacada').value;
            
            if (!titulo || !coleccion) {
                showInfoModal('Error', 'El título y la colección son obligatorios', 'exclamation-triangle');
                return;
            }
            
            // Simular guardado
            const obraData = {
                id: id ? parseInt(id) : Math.max(...esculturas.map(e => e.id), 0) + 1,
                titulo: titulo,
                artista: 'Daniel Guido',
                año: año || '2025',
                material: material || 'Madera',
                descripcion: descripcion || '',
                imagen: editingItem?.imagen || 'https://via.placeholder.com/400x300?text=Nueva+Obra',
                coleccion: coleccion,
                destacada: parseInt(destacada),
                estado: estado
            };

            if (id) {
                const index = esculturas.findIndex(e => e.id === parseInt(id));
                esculturas[index] = obraData;
                showInfoModal('Éxito', 'Obra actualizada correctamente');
            } else {
                esculturas.push(obraData);
                showInfoModal('Éxito', 'Obra creada correctamente');
            }

            closeItemModal();
            
            if (currentSection !== 'colecciones' && currentSection !== 'config') {
                renderEsculturas(currentSection);
            }
        }

        function confirmDeleteItem(id) {
            const obra = esculturas.find(e => e.id === id);
            showDeleteModal(
                '¿Eliminar obra?',
                `¿Estás seguro de eliminar "${obra.titulo}"?`,
                () => {
                    esculturas = esculturas.filter(e => e.id !== id);
                    showInfoModal('Éxito', 'Obra eliminada correctamente');
                    if (currentSection !== 'colecciones' && currentSection !== 'config') {
                        renderEsculturas(currentSection);
                    }
                }
            );
        }

        // ===== FUNCIONES DE NAVEGACIÓN =====
        function toggleSidebar(forceState) {
            const sidebar = document.querySelector('.sidebar');
            const overlay = document.querySelector('.sidebar-overlay');
            
            if (typeof forceState !== 'undefined') {
                window.isSidebarOpen = forceState;
            } else {
                window.isSidebarOpen = !window.isSidebarOpen;
            }
            
            if (window.isSidebarOpen) {
                sidebar.classList.add('active');
                overlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            } else {
                sidebar.classList.remove('active');
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        }

        function switchSection(section) {
            currentSection = section;
            
            document.querySelectorAll('.sidebar-nav li').forEach(li => {
                li.classList.remove('active');
            });
            
            if (section === 'colecciones') {
                document.getElementById('menuColecciones')?.classList.add('active');
            } else if (section === 'config') {
                document.querySelector('[data-section="config"]')?.classList.add('active');
            } else {
                document.querySelector(`[data-section="${section}"]`)?.classList.add('active');
            }

            const coleccion = colecciones.find(c => c.slug === section);
            document.getElementById('sectionTitle').textContent = coleccion ? coleccion.nombre : 
                section === 'colecciones' ? 'Gestionar Colecciones' : 
                section === 'config' ? 'Configuración del Artista' : '';

            document.getElementById('coleccionesSection').style.display = section === 'colecciones' ? 'block' : 'none';
            document.getElementById('configSection').style.display = section === 'config' ? 'block' : 'none';
            document.getElementById('esculturasSection').style.display = (section !== 'colecciones' && section !== 'config') ? 'block' : 'none';
            document.getElementById('fabColecciones').style.display = 
                (section !== 'colecciones' && section !== 'config') ? 'flex' : 'none';

            if (section !== 'colecciones' && section !== 'config') {
                renderEsculturas(section);
            }
        }

        function saveConfig() {
            showInfoModal('Configuración', 'Cambios guardados correctamente');
        }

        // ===== INICIALIZACIÓN =====
        document.addEventListener('DOMContentLoaded', () => {
            // Elementos del DOM
            const menuToggle = document.getElementById('menuToggle');
            const overlay = document.querySelector('.sidebar-overlay');
            const btnNuevaColeccion = document.getElementById('btnNuevaColeccionHeader');
            const coleccionForm = document.getElementById('coleccionForm');
            const sculptureForm = document.getElementById('sculptureForm');
            const saveConfigBtn = document.getElementById('saveConfigBtn');
            const logoutBtn = document.getElementById('logoutBtn');
            const fileInput = document.getElementById('sculptureImageFile');
            const estrellaBtn = document.getElementById('estrellaSimple');

            // Event listeners
            if (menuToggle) menuToggle.addEventListener('click', () => toggleSidebar());
            if (overlay) overlay.addEventListener('click', () => toggleSidebar(false));
            if (btnNuevaColeccion) btnNuevaColeccion.addEventListener('click', () => openColeccionModal());
            if (coleccionForm) coleccionForm.addEventListener('submit', saveColeccion);
            if (sculptureForm) sculptureForm.addEventListener('submit', saveItem);
            if (saveConfigBtn) saveConfigBtn.addEventListener('click', saveConfig);
            
            if (logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    showDeleteModal('Cerrar sesión', '¿Estás seguro de que deseas salir?', () => {
                        window.location.href = '/logout';
                    });
                });
            }

            if (fileInput) {
                fileInput.addEventListener('change', handleImageSelect);
            }

            if (estrellaBtn) {
                estrellaBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const destacadoInput = document.getElementById('sculptureDestacada');
                    const nuevoValor = destacadoInput.value == 1 ? 0 : 1;
                    actualizarEstrellaSimple(nuevoValor);
                });
            }

            // Status toggle
            document.querySelectorAll('.status-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const status = e.target.dataset.status;
                    document.querySelectorAll('.status-btn').forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                    document.getElementById('sculptureStatus').value = status;
                });
            });

            // Cerrar modales al hacer clic fuera
            window.addEventListener('click', (e) => {
                if (e.target.classList.contains('modal')) {
                    closeItemModal();
                    closeColeccionModal();
                }
            });

            // Simular carga inicial
            showLoader();
            setTimeout(() => {
                renderColecciones();
                switchSection('colecciones');
                hideLoader();
            }, 1000);
        });

        // Funciones globales
        window.openColeccionModal = openColeccionModal;
        window.closeColeccionModal = closeColeccionModal;
        window.openItemModal = openItemModal;
        window.closeItemModal = closeItemModal;
        window.closeDeleteModal = closeDeleteModal;
        window.closeInfoModal = closeInfoModal;
        window.confirmDeleteColeccion = confirmDeleteColeccion;
        window.confirmDeleteItem = confirmDeleteItem;
        window.switchSection = switchSection;