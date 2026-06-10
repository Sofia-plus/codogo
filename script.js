alert("JavaScript conectado");

let map = null;
let watchId = null;
let startPosition = null;

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
function uploadPhoto(id, button) {

    const input = document.getElementById(`photoUpload-${id}`);

    if (!input) {
        alert("No se encontró el campo de imagen");
        return;
    }

    const file = input.files[0];

    if (!file) {
        alert("Selecciona una imagen");
        return;
    }

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    if (!allowedTypes.includes(file.type)) {
        alert("Formato no permitido");
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        alert("La imagen supera los 5MB");
        return;
    }

    button.innerText = "Foto verificada";
    button.disabled = true;

    alert("Imagen validada correctamente");
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
function startWalkVerification(id, button) {

    if (!navigator.geolocation) {
        alert("GPS no disponible");
        return;
    }

    button.innerText = "Iniciando GPS...";

    navigator.geolocation.getCurrentPosition(

        function(position) {

            startPosition = {
                lat: position.coords.latitude,
                lon: position.coords.longitude
            };

            watchId = navigator.geolocation.watchPosition(

                function(newPosition) {

                    const distance = calculateDistance(
                        startPosition.lat,
                        startPosition.lon,
                        newPosition.coords.latitude,
                        newPosition.coords.longitude
                    );

                    button.innerText =
                        "Distancia: " +
                        Math.round(distance) +
                        " m";

                    if (distance >= 1800) {

                        navigator.geolocation.clearWatch(watchId);

                        button.innerText = "Misión completada";
                        button.disabled = true;

                        alert("¡Has recorrido 1.8 km!");
                    }

                },

                function() {
                    alert("Error al leer el GPS");
                },

                {
                    enableHighAccuracy: true
                }
            );
        },

        function() {
            alert("Permiso GPS denegado");
        }
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

            L.marker([lat,lng])
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
