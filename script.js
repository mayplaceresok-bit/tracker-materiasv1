const planEstudios = [
    { id: 1, nombre: "Introducción a la Informática", año: "1er Año" },
    { id: 2, nombre: "Matemática I", año: "1er Año" },
    { id: 3, nombre: "Programación I", año: "1er Año" },
    { id: 4, nombre: "Sistemas Operativos y Redes", año: "1er Año" },
    { id: 5, nombre: "Inglés Técnico I", año: "1er Año" },
    { id: 6, nombre: "Estructuras de Datos y Algoritmos", año: "1er Año" },
    { id: 7, nombre: "Programación II", año: "1er Año" },
    { id: 8, nombre: "Bases de Datos I", año: "1er Año" },
    { id: 9, nombre: "Arquitectura de Computadoras", año: "1er Año" },
    { id: 10, nombre: "Inglés Técnico II", año: "2do Año" },
    { id: 11, nombre: "Programación III", año: "2do Año" },
    { id: 12, nombre: "Bases de Datos II", año: "2do Año" },
    { id: 13, nombre: "Análisis y Diseño de Sistemas", año: "2do Año" },
    { id: 14, nombre: "Probabilidad y Estadística", año: "2do Año" },
    { id: 15, nombre: "Ingeniería de Software", año: "2do Año" },
    { id: 16, nombre: "Desarrollo de Aplicaciones Web", año: "2do Año" },
    { id: 17, nombre: "Redes y Seguridad Informática", año: "2do Año" },
    { id: 18, nombre: "Práctica Profesionalizante I", año: "2do Año" },
    { id: 19, nombre: "Metodologías de Desarrollo", año: "3er Año" },
    { id: 20, nombre: "Desarrollo de Aplicaciones Móviles", año: "3er Año" },
    { id: 21, nombre: "Legislación y Ética Profesional", año: "3er Año" },
    { id: 22, nombre: "Práctica Profesionalizante II", año: "3er Año" }
];

let appState = {
    user: localStorage.getItem('tracker_user') || '',
    estados: JSON.parse(localStorage.getItem('tracker_estados')) || {},
    notas: JSON.parse(localStorage.getItem('tracker_notas')) || {},
    filtroActual: 'todos'
};

const welcomeScreen = document.getElementById('welcome-screen');
const appContainer = document.getElementById('app-container');
const usernameInput = document.getElementById('username-input');
const btnStart = document.getElementById('btn-start');
const userDisplay = document.getElementById('user-display');
const btnResetProfile = document.getElementById('btn-reset-profile');
const contenedorMaterias = document.getElementById('dashboard-materias');
const currentDateEl = document.getElementById('current-date');

function init() {
    const opcionesFecha = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDateEl.textContent = new Date().toLocaleDateString('es-AR', opcionesFecha);

    if (appState.user) {
        mostrarDashboard();
    } else {
        welcomeScreen.classList.remove('hidden');
        appContainer.classList.add('hidden');
    }
}

function mostrarDashboard() {
    welcomeScreen.classList.add('hidden');
    appContainer.classList.remove('hidden');
    userDisplay.textContent = appState.user;
    actualizarMetricas();
    renderizarMaterias();
}

btnStart.addEventListener('click', () => {
    const nombre = usernameInput.value.trim();
    if (nombre) {
        appState.user = nombre;
        localStorage.setItem('tracker_user', nombre);
        mostrarDashboard();
    }
});

btnResetProfile.addEventListener('click', () => {
    localStorage.clear();
    appState = { user: '', estados: {}, notas: {}, filtroActual: 'todos' };
    usernameInput.value = '';
    welcomeScreen.classList.remove('hidden');
    appContainer.classList.add('hidden');
});

function renderizarMaterias() {
    contenedorMaterias.innerHTML = '';
    
    const materiasFiltradas = planEstudios.filter(materia => {
        if (appState.filtroActual === 'todos') return true;
        return materia.año === appState.filtroActual;
    });

    materiasFiltradas.forEach(materia => {
        const estado = appState.estados[materia.id] || 'Pendiente';
        const nota = appState.notas[materia.id] || '';
        
        const card = document.createElement('div');
        card.className = 'card-materia';
        card.setAttribute('data-estado', estado);
        
        card.innerHTML = `
            <div class="info">
                <span>${materia.año}</span>
                <h3>${materia.nombre}</h3>
            </div>
            <div class="controls-group">
                <select class="selector-estado" data-id="${materia.id}">
                    <option value="Pendiente" ${estado === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
                    <option value="En Curso" ${estado === 'En Curso' ? 'selected' : ''}>En Curso</option>
                    <option value="Regular" ${estado === 'Regular' ? 'selected' : ''}>Regular</option>
                    <option value="Aprobada" ${estado === 'Aprobada' ? 'selected' : ''}>Aprobada</option>
                </select>
                <input type="number" class="input-nota ${estado !== 'Aprobada' ? 'hidden' : ''}" 
                       data-id="${materia.id}" min="1" max="10" placeholder="Nota Final" value="${nota}">
            </div>
        `;
        
        contenedorMaterias.appendChild(card);
    });

    conectarEventosComponentes();
}

function conectarEventosComponentes() {
    document.querySelectorAll('.selector-estado').forEach(select => {
        select.addEventListener('change', (e) => {
            const id = e.target.getAttribute('data-id');
            const nuevoEstado = e.target.value;
            
            appState.estados[id] = nuevoEstado;
            
            const inputNota = e.target.nextElementSibling;
            if (nuevoEstado === 'Aprobada') {
                inputNota.classList.remove('hidden');
            } else {
                inputNota.classList.add('hidden');
                inputNota.value = '';
                delete appState.notas[id];
            }
            
            guardarEstadoYActualizar(e.target.closest('.card-materia'), nuevoEstado);
        });
    });

    document.querySelectorAll('.input-nota').forEach(input => {
        input.addEventListener('input', (e) => {
            const id = e.target.getAttribute('data-id');
            let valor = parseInt(e.target.value);
            
            if (valor >= 1 && valor <= 10) {
                appState.notas[id] = valor;
            } else {
                delete appState.notas[id];
            }
            
            localStorage.setItem('tracker_notas', JSON.stringify(appState.notas));
            actualizarMetricas();
        });
    });
}

function guardarEstadoYActualizar(cardElement, estado) {
    localStorage.setItem('tracker_estados', JSON.stringify(appState.estados));
    localStorage.setItem('tracker_notas', JSON.stringify(appState.notas));
    cardElement.setAttribute('data-estado', estado);
    actualizarMetricas();
}

function actualizarMetricas() {
    const totalMaterias = planEstudios.length;
    let aprobadasCount = 0;
    let sumaNotas = 0;
    let materiasConNotaCount = 0;

    planEstudios.forEach(materia => {
        if (appState.estados[materia.id] === 'Aprobada') {
            aprobadasCount++;
            const nota = appState.notas[materia.id];
            if (nota) {
                sumaNotas += nota;
                materiasConNotaCount++;
            }
        }
    });

    const porcentajeProgreso = Math.round((aprobadasCount / totalMaterias) * 100);
    document.getElementById('metric-progress').textContent = `${porcentajeProgreso}%`;
    document.getElementById('progress-bar-fill').style.width = `${porcentajeProgreso}%`;

    const promedio = materiasConNotaCount > 0 ? (sumaNotas / materiasConNotaCount).toFixed(2) : '-.-';
    document.getElementById('metric-average').textContent = promedio;

    document.getElementById('metric-count').textContent = `${aprobadasCount} / ${totalMaterias}`;
}

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        appState.filtroActual = e.target.getAttribute('data-filter');
        renderizarMaterias();
    });
});

document.addEventListener('DOMContentLoaded', init);
