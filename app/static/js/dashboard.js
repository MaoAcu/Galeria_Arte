// ===== CONFIGURACIÓN =====
const URL_IMG_BASE = "/static/gallery/";
const URL_IMG_DEFAULT = "https://via.placeholder.com/400x300?text=Sin+Imagen";
const API_BASE = "/escultura";

// ===== DATOS =====
let colecciones = [
    { id: 1, nombre: 'Serie Guardiana', icono: 'fa-tree', slug: 'serie-guardiana' },
    { id: 2, nombre: 'Raíces', icono: 'fa-leaf', slug: 'raices' },
    { id: 3, nombre: 'Vuelos', icono: 'fa-feather', slug: 'vuelos' },
    { id: 4, nombre: 'Memorias', icono: 'fa-mountain', slug: 'memorias' }
];

let esculturas = [];
let invitados = [];
let currentSection = 'colecciones';
let editingItem = null;
let editingColeccion = null;
let editingInvitado = null;
let deleteCallback = null;
let selectedImageFile = null;
let selectedInvImageFile = null;

// ===== API =====
async function apiGet(url) {
    const resp = await fetch(API_BASE + url, { headers: { 'Accept': 'application/json' } });
    return resp.json();
}

async function apiPost(url, formData) {
    const resp = await fetch(API_BASE + url, { method: 'POST', body: formData });
    return resp.json();
}

async function apiPatch(url, formData) {
    const resp = await fetch(API_BASE + url, { method: 'PATCH', body: formData });
    return resp.json();
}

async function apiDelete(url) {
    const resp = await fetch(API_BASE + url, { method: 'DELETE', headers: { 'Accept': 'application/json' } });
    return resp.json();
}

async function loadData() {
    showLoader();
    try {
        const [escData, invData] = await Promise.all([
            apiGet('/GetAllEsculturas'),
            apiGet('/GetInvitados')
        ]);
        esculturas = escData.map(e => ({
            id: e.id,
            titulo: e.title,
            artista: e.artist,
            año: e.year,
            material: e.material,
            descripcion: e.description,
            imagen: e.image ? (e.image.startsWith('http') ? e.image : URL_IMG_BASE + e.image) : URL_IMG_DEFAULT,
            coleccion: 'serie-guardiana',
            destacada: 0,
            estado: e.estado === 1 ? 'active' : 'inactive',
            orden: e.orden
        }));
        invitados = invData.map(a => ({
            id: a.id,
            titulo: a.title,
            artista: a.artist,
            artistaDescripcion: a.artist_description || '',
            artistaImagen: a.artist_image ? (a.artist_image.startsWith('http') ? a.artist_image : URL_IMG_BASE + a.artist_image) : null,
            año: a.year,
            material: a.material,
            descripcion: a.description,
            imagen: a.image ? (a.image.startsWith('http') ? a.image : URL_IMG_BASE + a.image) : null,
            estado: a.estado === 1 ? 'active' : 'inactive',
            orden: a.orden
        }));
    } catch (e) {
        console.error('[Dashboard] Error cargando datos:', e);
    }
    hideLoader();
}

// ===== LOADER =====
function showLoader() { const l = document.getElementById('loader'); if (l) l.style.display = 'flex'; }
function hideLoader() { const l = document.getElementById('loader'); if (l) l.style.display = 'none'; }

// ===== MODALES INFO / DELETE =====
function showInfoModal(title, message, icon) {
    document.getElementById('infoModalTitle').textContent = title;
    document.getElementById('infoModalMessage').textContent = message;
    const ic = document.getElementById('infoModalIcon');
    ic.innerHTML = icon === 'exclamation-triangle'
        ? '<i class="fas fa-exclamation-triangle" style="color:#f59e0b"></i>'
        : '<i class="fas fa-check-circle" style="color:#22c55e"></i>';
    document.getElementById('infoModal').classList.add('active');
}
function closeInfoModal() { document.getElementById('infoModal').classList.remove('active'); }

function showDeleteModal(title, message, callback) {
    document.getElementById('deleteModalTitle').textContent = title;
    document.getElementById('deleteModalMessage').textContent = message;
    deleteCallback = callback;
    document.getElementById('deleteModal').classList.add('active');
}
function closeDeleteModal() { document.getElementById('deleteModal').classList.remove('active'); deleteCallback = null; }

document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
    if (deleteCallback) deleteCallback();
    closeDeleteModal();
});

// ===== COLECCIONES =====
function renderColecciones() {
    const list = document.getElementById('coleccionesList');
    list.innerHTML = `
        <li id="menuColecciones" class="active" data-section="colecciones">
            <i class="fas fa-layer-group"></i> <span>Todas las Colecciones</span>
        </li>
        <li data-section="todas" style="margin-top:4px">
            <i class="fas fa-images"></i> <span>Todas las Obras</span>
        </li>
        ${colecciones.map(c => `
            <li data-section="${c.slug}">
                <i class="fas ${c.icono}"></i> <span>${c.nombre}</span>
            </li>
        `).join('')}
        <div class="sidebar-divider"></div>
        <li data-section="invitados" style="border-left: 2px solid #c9a96e; padding-left: 1rem;">
            <i class="fas fa-users"></i> <span>Artistas Invitados</span>
        </li>
        <div class="sidebar-divider"></div>
        <li data-section="config" style="margin-top: auto;">
            <i class="fas fa-cog"></i> <span>Configuración</span>
        </li>
    `;
    asignarEventosSidebar();

    const grid = document.getElementById('coleccionesGrid');
    grid.innerHTML = colecciones.map(c => `
        <div class="categoria-card" onclick="switchSection('${c.slug}')">
            <div class="categoria-icon"><i class="fas ${c.icono}"></i></div>
            <h3>${c.nombre}</h3>
            <p>${esculturas.filter(e => e.coleccion === c.slug).length} obras</p>
            <div class="categoria-actions" onclick="event.stopPropagation()">
                <button class="btn-icon" onclick="openColeccionModal('${c.id}')"><i class="fas fa-edit"></i></button>
                <button class="btn-icon" onclick="confirmDeleteColeccion(${c.id})"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

function asignarEventosSidebar() {
    document.querySelectorAll('.sidebar-nav li[data-section]').forEach(li => {
        li.addEventListener('click', () => switchSection(li.dataset.section));
    });
    document.getElementById('menuColecciones').addEventListener('click', () => switchSection('colecciones'));
}

function openColeccionModal(id = null) {
    editingColeccion = id ? colecciones.find(c => c.id === parseInt(id)) : null;
    document.getElementById('coleccionModalTitle').textContent = editingColeccion ? 'Editar Colección' : 'Nueva Colección';
    document.getElementById('coleccionId').value = editingColeccion?.id || '';
    document.getElementById('coleccionNombre').value = editingColeccion?.nombre || '';
    document.getElementById('coleccionIcono').value = editingColeccion?.icono || 'fa-tree';
    document.getElementById('coleccionModal').classList.add('active');
}
function closeColeccionModal() { document.getElementById('coleccionModal').classList.remove('active'); }

function saveColeccion(e) {
    e.preventDefault();
    const nombre = document.getElementById('coleccionNombre').value;
    const icono = document.getElementById('coleccionIcono').value;
    if (!nombre) { showInfoModal('Error', 'El nombre es obligatorio', 'exclamation-triangle'); return; }
    if (editingColeccion) {
        editingColeccion.nombre = nombre;
        editingColeccion.icono = icono;
    } else {
        const slug = nombre.toLowerCase().replace(/\s+/g, '-').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        colecciones.push({ id: colecciones.length + 1, nombre, icono, slug });
    }
    closeColeccionModal();
    renderColecciones();
}

function confirmDeleteColeccion(id) {
    const c = colecciones.find(c => c.id === id);
    if (!c) return;
    if (esculturas.filter(e => e.coleccion === c.slug).length > 0) {
        showInfoModal('Error', 'No se puede eliminar una colección con obras', 'exclamation-triangle');
        return;
    }
    showDeleteModal('¿Eliminar colección?', `Se eliminará "${c.nombre}"`, () => {
        colecciones = colecciones.filter(c => c.id !== id);
        renderColecciones();
        showInfoModal('Eliminado', 'Colección eliminada correctamente');
    });
}

// ===== ESCULTURAS =====
function renderEsculturas(coleccionSlug) {
    const container = document.getElementById('esculturasSection');
    const coleccion = colecciones.find(c => c.slug === coleccionSlug);
    let obras;
    if (coleccionSlug === 'invitados') {
        obras = invitados;
    } else if (coleccionSlug === 'todas') {
        obras = esculturas;
    } else {
        obras = esculturas.filter(e => e.coleccion === coleccionSlug);
    }

    container.innerHTML = `
        <div class="section-header">
            <h2><i class="fas ${coleccion?.icono || 'fa-images'}"></i> ${coleccion?.nombre || (coleccionSlug === 'todas' ? 'Todas las Obras' : 'Obras')}</h2>
            <div style="display:flex;gap:10px">
                <button class="btn-add-item" onclick="openItemModal(null, '${coleccionSlug === 'todas' ? '' : coleccionSlug}')">
                    <i class="fas fa-plus"></i> Nueva Obra
                </button>
            </div>
        </div>
        <div class="gallery-list">
            ${obras.length === 0 ? '<p style="color:#8b949e;text-align:center;padding:2rem">No hay obras en esta colección.</p>' : ''}
            ${obras.map(obra => createSculptureCard(obra)).join('')}
        </div>
    `;
}

function createSculptureCard(obra) {
    return `
        <div class="obra-card" style="background:rgba(18,24,36,0.8);border:1px solid rgba(71,85,105,0.3);border-radius:12px;overflow:hidden;display:flex;gap:16px;padding:16px;margin-bottom:12px">
            <div style="width:120px;height:90px;border-radius:8px;overflow:hidden;flex-shrink:0">
                <img src="${obra.imagen || URL_IMG_DEFAULT}" style="width:100%;height:100%;object-fit:cover" onerror="this.src='${URL_IMG_DEFAULT}'">
            </div>
            <div style="flex:1;min-width:0">
                <div style="display:flex;justify-content:space-between;align-items:start">
                    <h4 style="color:#c9a96e;font-size:1rem;margin:0 0 4px 0">${obra.titulo}</h4>
                    <span class="status-badge" style="background:${obra.estado === 'active' ? 'rgba(34,197,94,0.1)' : 'rgba(205,92,92,0.1)'};color:${obra.estado === 'active' ? '#16a34a' : '#b91c1c'};padding:2px 10px;border-radius:20px;font-size:0.7rem">
                        ${obra.estado === 'active' ? 'En exhibición' : 'En bodega'}
                    </span>
                </div>
                <p style="color:#8b949e;font-size:0.8rem;margin:0 0 4px 0">${obra.artista} · ${obra.año} · ${obra.material}</p>
                <p style="color:#6b7280;font-size:0.75rem;margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${obra.descripcion || ''}</p>
                <div style="display:flex;gap:8px;margin-top:8px">
                    <button class="btn-sm" style="background:rgba(201,169,110,0.15);color:#c9a96e;border:1px solid rgba(201,169,110,0.3);padding:4px 12px;border-radius:6px;cursor:pointer;font-size:0.75rem" onclick="openItemModal(${obra.id}, '${obra.coleccion}')"><i class="fas fa-edit"></i> Editar</button>
                    <button class="btn-sm" style="background:rgba(205,92,92,0.15);color:#ef4444;border:1px solid rgba(205,92,92,0.3);padding:4px 12px;border-radius:6px;cursor:pointer;font-size:0.75rem" onclick="confirmDeleteItem(${obra.id})"><i class="fas fa-trash"></i> Eliminar</button>
                </div>
            </div>
        </div>
    `;
}

function openItemModal(id = null, coleccionDefault = null) {
    editingItem = id ? esculturas.find(e => e.id === id) : null;
    document.getElementById('modalTitle').textContent = editingItem ? 'Editar Obra' : 'Nueva Obra';
    document.getElementById('sculptureId').value = editingItem?.id || '';
    document.getElementById('sculptureTitle').value = editingItem?.titulo || '';
    document.getElementById('sculptureYear').value = editingItem?.año || '';
    document.getElementById('sculptureMaterial').value = editingItem?.material || '';
    document.getElementById('sculptureDescription').value = editingItem?.descripcion || '';

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

    actualizarEstrellaSimple(editingItem?.destacada || 0);
    resetImageUpload();
    document.querySelector('label[for="sculptureImageFile"]').textContent = 'Imagen de la Obra';
    document.getElementById('artistImageUpload').style.display = 'none';
    if (editingItem?.imagen && editingItem.imagen !== URL_IMG_DEFAULT) {
        const preview = document.querySelector('#imagePreview img');
        if (preview) { preview.src = editingItem.imagen; preview.style.display = 'block'; }
    }
    document.getElementById('editModal').classList.add('active');
}

function closeItemModal() { document.getElementById('editModal').classList.remove('active'); editingItem = null; editingInvitado = null; selectedImageFile = null; }

function resetImageUpload() {
    selectedImageFile = null;
    document.getElementById('imageFileName').textContent = '';
    document.getElementById('sculptureImageFile').value = '';
    const preview = document.querySelector('#imagePreview img');
    if (preview) { preview.src = ''; preview.style.display = 'none'; }
}

function resetInvImageUpload() {
    selectedInvImageFile = null;
    const fn = document.getElementById('artistImageFileName');
    if (fn) fn.textContent = '';
    const af = document.getElementById('artistImageFile');
    if (af) af.value = '';
    const preview = document.querySelector('#artistImagePreview img');
    if (preview) { preview.src = ''; preview.style.display = 'none'; }
}

function handleInvImageSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    selectedInvImageFile = file;
    const fn = document.getElementById('artistImageFileName');
    if (fn) fn.textContent = file.name;
    const reader = new FileReader();
    reader.onload = (e) => {
        const preview = document.querySelector('#artistImagePreview img');
        if (preview) { preview.src = e.target.result; preview.style.display = 'block'; }
    };
    reader.readAsDataURL(file);
}

function handleImageSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    selectedImageFile = file;
    document.getElementById('imageFileName').textContent = file.name;
    const reader = new FileReader();
    reader.onload = (e) => {
        const preview = document.querySelector('#imagePreview img');
        if (preview) { preview.src = e.target.result; preview.style.display = 'block'; }
    };
    reader.readAsDataURL(file);
}

function actualizarEstrellaSimple(valor) {
    const btn = document.getElementById('estrellaSimple');
    const text = document.getElementById('destacadoText');
    document.getElementById('sculptureDestacada').value = valor;
    if (parseInt(valor) === 1) {
        btn.innerHTML = '<i class="fas fa-star" style="color:#c9a96e"></i>';
        text.textContent = 'Destacada';
    } else {
        btn.innerHTML = '<i class="far fa-star"></i>';
        text.textContent = 'No destacada';
    }
}

async function saveItem(e) {
    e.preventDefault();
    const id = document.getElementById('sculptureId').value;
    const titulo = document.getElementById('sculptureTitle').value;
    const año = document.getElementById('sculptureYear').value;
    const material = document.getElementById('sculptureMaterial').value;
    const descripcion = document.getElementById('sculptureDescription').value;
    const coleccionSlug = document.getElementById('coleccion').value;
    const estado = document.getElementById('sculptureStatus').value;
    const destacada = document.getElementById('sculptureDestacada').value;

    if (!titulo) { showInfoModal('Error', 'El título es obligatorio', 'exclamation-triangle'); return; }

    const formData = new FormData();
    formData.append('title', titulo);
    formData.append('artist', 'Daniel Guido');
    formData.append('year', año || new Date().getFullYear().toString());
    formData.append('material', material || 'Madera');
    formData.append('description', descripcion || '');
    formData.append('estado', estado === 'active' ? '1' : '0');
    formData.append('orden', id ? (esculturas.find(e => e.id === parseInt(id))?.orden || 0) : esculturas.length);
    if (selectedImageFile) formData.append('image', selectedImageFile);

    showLoader();
    try {
        if (id) {
            await apiPatch('/UpdateEscultura/' + id, formData);
            showInfoModal('Éxito', 'Obra actualizada correctamente');
        } else {
            await apiPost('/CreateEscultura', formData);
            showInfoModal('Éxito', 'Obra creada correctamente');
        }
        await loadData();
    } catch (e) {
        showInfoModal('Error', 'No se pudo guardar la obra', 'exclamation-triangle');
    }
    hideLoader();
    closeItemModal();
    if (currentSection !== 'colecciones' && currentSection !== 'config') renderEsculturas(currentSection);
    else renderColecciones();
}

async function confirmDeleteItem(id) {
    showDeleteModal('¿Eliminar obra?', 'Esta acción no se puede deshacer.', async () => {
        showLoader();
        try {
            await apiDelete('/DeleteEscultura/' + id);
            showInfoModal('Éxito', 'Obra eliminada correctamente');
            await loadData();
        } catch (e) {
            showInfoModal('Error', 'No se pudo eliminar la obra', 'exclamation-triangle');
        }
        hideLoader();
        if (currentSection !== 'colecciones' && currentSection !== 'config') renderEsculturas(currentSection);
        else renderColecciones();
    });
}

// ===== ARTISTAS INVITADOS =====
function renderInvitados() {
    const container = document.getElementById('esculturasSection');
    container.innerHTML = `
        <div class="section-header">
            <h2><i class="fas fa-users"></i> Artistas Invitados</h2>
            <button class="btn-add-item" onclick="openInvitadoModal()">
                <i class="fas fa-plus"></i> Nuevo Invitado
            </button>
        </div>
        <div class="gallery-list">
            ${invitados.length === 0 ? '<p style="color:#8b949e;text-align:center;padding:2rem">No hay artistas invitados.</p>' : ''}
            ${invitados.map(inv => createInvitadoCard(inv)).join('')}
        </div>
    `;
}

function createInvitadoCard(inv) {
    return `
        <div class="obra-card" style="background:rgba(18,24,36,0.8);border:1px solid rgba(71,85,105,0.3);border-radius:12px;overflow:hidden;display:flex;gap:16px;padding:16px;margin-bottom:12px">
            <div style="width:120px;height:90px;border-radius:8px;overflow:hidden;flex-shrink:0;background:#1a1a2e;display:flex;align-items:center;justify-content:center">
                ${inv.imagen
                    ? `<img src="${inv.imagen}" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display='none'">`
                    : '<i class="fas fa-user-circle" style="font-size:2rem;color:#475569"></i>'
                }
            </div>
            <div style="flex:1;min-width:0">
                <div style="display:flex;justify-content:space-between;align-items:start">
                    <h4 style="color:#c9a96e;font-size:1rem;margin:0 0 4px 0">${inv.titulo}</h4>
                    <span class="status-badge" style="background:${inv.estado === 'active' ? 'rgba(34,197,94,0.1)' : 'rgba(205,92,92,0.1)'};color:${inv.estado === 'active' ? '#16a34a' : '#b91c1c'};padding:2px 10px;border-radius:20px;font-size:0.7rem">
                        ${inv.estado === 'active' ? 'Visible' : 'Oculto'}
                    </span>
                </div>
                <p style="color:#8b949e;font-size:0.8rem;margin:0 0 4px 0">${inv.artista} · ${inv.año} · ${inv.material}</p>
                <p style="color:#6b7280;font-size:0.75rem;margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${inv.artistaDescripcion || inv.descripcion || ''}</p>
                <div style="display:flex;gap:8px;margin-top:8px">
                    <button class="btn-sm" style="background:rgba(201,169,110,0.15);color:#c9a96e;border:1px solid rgba(201,169,110,0.3);padding:4px 12px;border-radius:6px;cursor:pointer;font-size:0.75rem" onclick="openInvitadoModal(${inv.id})"><i class="fas fa-edit"></i> Editar</button>
                    <button class="btn-sm" style="background:${inv.estado === 'active' ? 'rgba(245,158,11,0.15)' : 'rgba(34,197,94,0.15)'};color:${inv.estado === 'active' ? '#f59e0b' : '#22c55e'};border:1px solid ${inv.estado === 'active' ? 'rgba(245,158,11,0.3)' : 'rgba(34,197,94,0.3)'};padding:4px 12px;border-radius:6px;cursor:pointer;font-size:0.75rem" onclick="toggleInvitadoEstado(${inv.id})">
                        ${inv.estado === 'active' ? 'Ocultar' : 'Mostrar'}
                    </button>
                    <button class="btn-sm" style="background:rgba(205,92,92,0.15);color:#ef4444;border:1px solid rgba(205,92,92,0.3);padding:4px 12px;border-radius:6px;cursor:pointer;font-size:0.75rem" onclick="confirmDeleteInvitado(${inv.id})"><i class="fas fa-trash"></i> Eliminar</button>
                </div>
            </div>
        </div>
    `;
}

function openInvitadoModal(id = null) {
    editingInvitado = id ? invitados.find(a => a.id === id) : null;
    document.getElementById('modalTitle').textContent = editingInvitado ? 'Editar Invitado' : 'Nuevo Invitado';
    document.getElementById('sculptureId').value = editingInvitado?.id || '';
    document.getElementById('sculptureTitle').value = editingInvitado?.titulo || '';
    document.getElementById('sculptureYear').value = editingInvitado?.año || '';
    document.getElementById('sculptureMaterial').value = editingInvitado?.material || '';
    document.getElementById('sculptureDescription').value = editingInvitado?.descripcion || '';
    document.getElementById('sculptureStatus').value = editingInvitado?.estado || 'active';

    document.querySelectorAll('.status-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.status === (editingInvitado?.estado || 'active')) btn.classList.add('active');
    });

    document.getElementById('coleccion').innerHTML = '<option value="">N/A</option>';
    document.getElementById('coleccion').style.display = 'none';
    document.querySelector('label[for="coleccion"]').style.display = 'none';
    actualizarEstrellaSimple(0);
    document.querySelector('.estrellas-container').style.display = 'none';

    resetImageUpload();
    resetInvImageUpload();
    if (editingInvitado?.imagen) {
        const preview = document.querySelector('#imagePreview img');
        if (preview) { preview.src = editingInvitado.imagen; preview.style.display = 'block'; }
    }
    if (editingInvitado?.artistaImagen) {
        const preview = document.querySelector('#artistImagePreview img');
        if (preview) { preview.src = editingInvitado.artistaImagen; preview.style.display = 'block'; }
    }

    document.querySelector('label[for="sculptureImageFile"]').textContent = 'Imagen de la Obra';
    document.getElementById('artistImageUpload').style.display = 'block';

    document.getElementById('editModal').classList.add('active');
}

async function saveInvitado(e) {
    e.preventDefault();
    const id = document.getElementById('sculptureId').value;
    const titulo = document.getElementById('sculptureTitle').value;
    const año = document.getElementById('sculptureYear').value;
    const material = document.getElementById('sculptureMaterial').value;
    const descripcion = document.getElementById('sculptureDescription').value;
    const estado = document.getElementById('sculptureStatus').value;

    if (!titulo) { showInfoModal('Error', 'El título es obligatorio', 'exclamation-triangle'); return; }

    const formData = new FormData();
    formData.append('title', titulo);
    formData.append('artist', editingInvitado?.artista || 'Artista Invitado');
    formData.append('artist_description', editingInvitado?.artistaDescripcion || '');
    formData.append('year', año || new Date().getFullYear().toString());
    formData.append('material', material || '');
    formData.append('description', descripcion || '');
    formData.append('estado', estado === 'active' ? '1' : '0');
    formData.append('orden', invitados.length);
    if (selectedImageFile) formData.append('image', selectedImageFile);
    if (selectedInvImageFile) formData.append('artist_image', selectedInvImageFile);

    showLoader();
    try {
        if (id) {
            await apiPatch('/UpdateInvitado/' + id, formData);
            showInfoModal('Éxito', 'Invitado actualizado correctamente');
        } else {
            await apiPost('/CreateInvitado', formData);
            showInfoModal('Éxito', 'Invitado creado correctamente');
        }
        await loadData();
    } catch (e) {
        showInfoModal('Error', 'No se pudo guardar', 'exclamation-triangle');
    }
    hideLoader();
    closeItemModal();
    if (currentSection === 'invitados') renderInvitados();
}

async function toggleInvitadoEstado(id) {
    showLoader();
    try {
        await apiPatch('/ToggleInvitado/' + id);
        await loadData();
    } catch (e) {
        showInfoModal('Error', 'No se pudo cambiar el estado', 'exclamation-triangle');
    }
    hideLoader();
    if (currentSection === 'invitados') renderInvitados();
}

async function confirmDeleteInvitado(id) {
    showDeleteModal('¿Eliminar invitado?', 'Esta acción no se puede deshacer.', async () => {
        showLoader();
        try {
            await apiDelete('/DeleteInvitado/' + id);
            showInfoModal('Éxito', 'Invitado eliminado correctamente');
            await loadData();
        } catch (e) {
            showInfoModal('Error', 'No se pudo eliminar', 'exclamation-triangle');
        }
        hideLoader();
        if (currentSection === 'invitados') renderInvitados();
    });
}

// ===== NAVEGACIÓN =====
function toggleSidebar(forceState) {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    const isOpen = forceState !== undefined ? forceState : !sidebar.classList.contains('open');
    if (isOpen) {
        sidebar.classList.add('open');
        overlay.classList.add('active');
    } else {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
    }
}

function switchSection(section) {
    currentSection = section;
    document.querySelectorAll('.sidebar-nav li').forEach(li => li.classList.remove('active'));
    document.getElementById('menuColecciones')?.classList.remove('active');

    if (section === 'colecciones') {
        document.getElementById('menuColecciones')?.classList.add('active');
        document.getElementById('sectionTitle').textContent = 'Gestionar Colecciones';
    } else if (section === 'invitados') {
        document.querySelector('[data-section="invitados"]')?.classList.add('active');
        document.getElementById('sectionTitle').textContent = 'Artistas Invitados';
    } else if (section === 'todas') {
        document.querySelector('[data-section="todas"]')?.classList.add('active');
        document.getElementById('sectionTitle').textContent = 'Todas las Obras';
    } else if (section === 'config') {
        document.querySelector('[data-section="config"]')?.classList.add('active');
        document.getElementById('sectionTitle').textContent = 'Configuración';
    } else {
        document.querySelector(`[data-section="${section}"]`)?.classList.add('active');
        const col = colecciones.find(c => c.slug === section);
        document.getElementById('sectionTitle').textContent = col ? col.nombre : section;
    }

    document.getElementById('coleccionesSection').style.display = section === 'colecciones' ? 'block' : 'none';
    document.getElementById('configSection').style.display = section === 'config' ? 'block' : 'none';
    document.getElementById('esculturasSection').style.display = (section !== 'colecciones' && section !== 'config') ? 'block' : 'none';
    document.getElementById('fabColecciones').style.display = (section !== 'colecciones' && section !== 'config') ? 'flex' : 'none';
    document.getElementById('saveAllBtn').style.display = 'none';

    if (section === 'invitados') {
        renderInvitados();
    } else if (section === 'colecciones' || section === 'config') {
        // no render
    } else {
        renderEsculturas(section);
    }
}

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    renderColecciones();

    document.getElementById('menuToggle').addEventListener('click', () => toggleSidebar());
    document.querySelector('.sidebar-overlay').addEventListener('click', () => toggleSidebar(false));

    document.querySelectorAll('.status-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.status-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            document.getElementById('sculptureStatus').value = e.target.dataset.status;
        });
    });

    document.getElementById('sculptureImageFile').addEventListener('change', handleImageSelect);
    document.getElementById('artistImageFile').addEventListener('change', handleInvImageSelect);

    document.getElementById('sculptureForm').addEventListener('submit', (e) => {
        if (editingInvitado !== null || currentSection === 'invitados') {
            saveInvitado(e);
        } else {
            saveItem(e);
        }
    });

    document.getElementById('coleccionForm').addEventListener('submit', saveColeccion);
    document.getElementById('btnNuevaColeccionHeader').addEventListener('click', () => openColeccionModal());

    document.getElementById('logoutBtn').addEventListener('click', () => {
        window.location.href = '/logout';
    });

    document.getElementById('saveConfigBtn').addEventListener('click', saveConfig);

    // Cerrar modales al hacer clic fuera
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });
    });

    // "Ver Colecciones" FAB
    document.getElementById('fabColecciones').addEventListener('click', () => switchSection('colecciones'));

    hideLoader();
});

function saveConfig() {
    showInfoModal('Info', 'Configuración guardada (demo)');
}

// ===== EXPORTS =====
window.openColeccionModal = openColeccionModal;
window.closeColeccionModal = closeColeccionModal;
window.openItemModal = openItemModal;
window.closeItemModal = closeItemModal;
window.openInvitadoModal = openInvitadoModal;
window.confirmDeleteItem = confirmDeleteItem;
window.confirmDeleteInvitado = confirmDeleteInvitado;
window.toggleInvitadoEstado = toggleInvitadoEstado;
window.closeDeleteModal = closeDeleteModal;
window.closeInfoModal = closeInfoModal;
window.switchSection = switchSection;
window.handleImageSelect = handleImageSelect;
