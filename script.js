alert("JavaScript conectado");

let map = null;
let watchId = null;
let startPosition = null;
let routePoints = [];
let routeLine = null;
let currentMarker = null;
let totalDistance = 0;
let lastPosition = null;
// Mostrar secciones
function showSection(sectionId) {

    document.querySelectorAll(".section").forEach(section => {
        section.classList.add("hidden");
    });

    const section = document.getElementById(sectionId);

    if (section) {
        section.classList.remove("hidden");
    }

    if (sectionId === "map") {
        setTimeout(initMap, 300);
    }
    if(sectionId === "mapSection"){
    setTimeout(initMap,300);
}
}

// Cambiar entre login y registro
function setAuthMode(mode) {

    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");

    if (!loginForm || !registerForm) return;

    if (mode === "login") {
        loginForm.classList.remove("hidden");
        registerForm.classList.add("hidden");
    } else {
        registerForm.classList.remove("hidden");
        loginForm.classList.add("hidden");
    }
}

// Registrar usuario
function submitRegister() {

    const username = document.getElementById("registerUsername").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value;
    const confirmPassword = document.getElementById("registerConfirmPassword").value;

    if (!username || !email || !password || !confirmPassword) {
        alert("Completa todos los campos");
        return;
    }

    if (password !== confirmPassword) {
        alert("Las contraseñas no coinciden");
        return;
    }

    if (localStorage.getItem(email)) {
        alert("Este correo ya está registrado");
        return;
    }

    const user = {
        username,
        email,
        password,
        level: 1,
        tokens: 0
    };

    localStorage.setItem(email, JSON.stringify(user));

    alert("Cuenta creada correctamente");

    document.getElementById("registerUsername").value = "";
    document.getElementById("registerEmail").value = "";
    document.getElementById("registerPassword").value = "";
    document.getElementById("registerConfirmPassword").value = "";

    setAuthMode("login");
}

// Iniciar sesión
function submitLogin() {

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    const user = JSON.parse(localStorage.getItem(email));

    if (!user) {
        alert("Usuario no encontrado");
        return;
    }

    if (user.password !== password) {
        alert("Contraseña incorrecta");
        return;
    }

    localStorage.setItem("loggedUser", email);

    loadUser(user);

    showSection("dashboard");
}

// Cargar usuario
function loadUser(user) {

    const dashboardUsername = document.getElementById("dashboardUsername");
    const userNameDisplay = document.getElementById("userNameDisplay");
    const logoutButton = document.getElementById("logoutButton");

    if (dashboardUsername) {
        dashboardUsername.textContent = user.username;
    }

    if (userNameDisplay) {
        userNameDisplay.textContent = user.username;
        userNameDisplay.classList.remove("hidden");
    }

    if (logoutButton) {
        logoutButton.classList.remove("hidden");
    }

    const authSection = document.getElementById("auth");

    if (authSection) {
        authSection.classList.add("hidden");
    }
}

// Cerrar sesión
function logout() {

    localStorage.removeItem("loggedUser");

    alert("Sesión cerrada");

    location.reload();
}

// Comprar artículos
function buyItem(button) {

    button.innerText = "Canjeado";
    button.disabled = true;

    alert("Recompensa canjeada");
}

// Subir foto
// Subir evidencia (Foto o Video)
function uploadEvidence(id, button) {
    const input = document.getElementById(`evidenceUpload-${id}`);

    if (!input) {
        alert("No se encontró el campo de archivo");
        return;
    }

    const file = input.files[0];

    if (!file) {
        alert("Selecciona una imagen o video");
        return;
    }

    // Permitir imágenes y videos
    const allowedTypes = [
        "image/jpeg", "image/png", "image/webp",
        "video/mp4", "video/webm", "video/ogg"
    ];

    if (!allowedTypes.includes(file.type)) {
        alert("Formato no permitido. Sube una imagen o un video.");
        return;
    }

    // Aumentar el límite a 50MB para permitir videos
    if (file.size > 50 * 1024 * 1024) {
        alert("El archivo supera los 50MB permitidos");
        return;
    }

    button.innerText = "Evidencia verificada";
    button.disabled = true;

    alert("Evidencia validada correctamente");
}
// Calcular distancia GPS
function calculateDistance(lat1, lon1, lat2, lon2) {

    const R = 6371000;

    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(
        Math.sqrt(a),
        Math.sqrt(1 - a)
    );

    return R * c;
}

// Verificación GPS
// Verificación GPS y Rastreo de Ruta
function startWalkVerification(id, button) {
    if (!navigator.geolocation) {
        alert("GPS no disponible en este dispositivo");
        return;
    }

    button.innerText = "Fijando ubicación...";
    totalDistance = 0; 
    routePoints = []; 

    // 1. Fijar la ubicación actual del usuario antes de empezar
    navigator.geolocation.getCurrentPosition(
        function(position) {
            lastPosition = {
                lat: position.coords.latitude,
                lon: position.coords.longitude
            };
            
            routePoints.push([lastPosition.lat, lastPosition.lon]);

            if (currentMarker) {
                currentMarker.setLatLng([lastPosition.lat, lastPosition.lon]);
                map.panTo([lastPosition.lat, lastPosition.lon]);
            }

            button.innerText = "Caminando: 0 / 1300 m";

            // 2. Comenzar a rastrear el movimiento
            watchId = navigator.geolocation.watchPosition(
                function(newPosition) {
                    const newLat = newPosition.coords.latitude;
                    const newLng = newPosition.coords.longitude;

                    // Calcular distancia desde el último punto registrado
                    const stepDistance = calculateDistance(
                        lastPosition.lat, lastPosition.lon,
                        newLat, newLng
                    );

                    // Solo registrar si el usuario se movió más de 2 metros (evita "ruido" del GPS estático)
                    if (stepDistance > 2) {
                        totalDistance += stepDistance;
                        lastPosition = { lat: newLat, lon: newLng };
                        
                        routePoints.push([newLat, newLng]);

                        // Mover marcador
                        if(currentMarker){
                            currentMarker.setLatLng([newLat, newLng]);
                        }

                        // Actualizar línea de ruta
                        if(routeLine){
                            map.removeLayer(routeLine);
                        }
                        routeLine = L.polyline(routePoints, {
                            color: "lime",
                            weight: 5,
                            opacity: 0.8
                        }).addTo(map);
                        
                        map.panTo([newLat, newLng]);

                        button.innerText = `Caminando: ${Math.round(totalDistance)} / 1300 m`;

                        // 3. Evaluar si completó la misión (1.3 km = 1300 metros)
                        if (totalDistance >= 1300) {
                            navigator.geolocation.clearWatch(watchId);
                            button.innerText = "Misión completada";
                            button.disabled = true;

                            // Otorgar 1 Token al usuario logueado
                            const loggedEmail = localStorage.getItem("loggedUser");
                            if (loggedEmail) {
                                const user = JSON.parse(localStorage.getItem(loggedEmail));
                                user.tokens = (user.tokens || 0) + 1;
                                localStorage.setItem(loggedEmail, JSON.stringify(user));
                            }

                            alert("¡Felicidades! Has completado 1.3 km y ganaste 1 token.");
                        }
                    }
                },
                function() {
                    alert("Se perdió la señal del GPS");
                },
                { enableHighAccuracy: true }
            );
        },
        function() {
            alert("Permiso GPS denegado. No se puede iniciar la ruta.");
        },
        { enableHighAccuracy: true }
    );
}
// Inicializar mapa
function initMap() {

    if (map) {
        map.invalidateSize();
        return;
    }

    map = L.map("map").setView(
        [4.7110, -74.0721],
        13
    );

    L.tileLayer(
        "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            attribution: "&copy; OpenStreetMap"
        }
    ).addTo(map);

    navigator.geolocation.getCurrentPosition(

        function(position){

            const lat =
            position.coords.latitude;

            const lng =
            position.coords.longitude;

            map.setView(
                [lat, lng],
                16
            );

            currentMarker = L.marker([lat,lng])
            .addTo(map)
            .bindPopup("📍 Tu ubicación")
            .openPopup();

        },

        function(error){

            console.log(error);

            alert(
                "Debes permitir la ubicación"
            );

        }

    );
}

// Al cargar la página
window.onload = function() {

    const loggedEmail = localStorage.getItem("loggedUser");

    if (loggedEmail) {

        const user = JSON.parse(
            localStorage.getItem(loggedEmail)
        );

        if (user) {
            loadUser(user);
            showSection("dashboard");
            return;
        }
    }

    showSection("auth");
};
