// =========================
// QUESTLINK 2.0
// =========================

let currentUser = null;

let map = null;
let marker = null;
let watchId = null;

let startPosition = null;
let totalDistance = 0;

const levelDistances = [
    200,
    400,
    600,
    800,
    1000,
    1500,
    2000,
    3000,
    4000,
    5000
];

// =========================
// SECCIONES
// =========================

function showSection(sectionId){

    document.querySelectorAll(".section").forEach(section=>{
        section.classList.add("hidden");
    });

    const target = document.getElementById(sectionId);

    if(target){
        target.classList.remove("hidden");
    }

    if(sectionId === "mapSection"){
        setTimeout(initMap,300);
    }
}

// =========================
// LOGIN / REGISTER
// =========================

function setAuthMode(mode){

    const loginForm =
    document.getElementById("loginForm");

    const registerForm =
    document.getElementById("registerForm");

    const loginTab =
    document.getElementById("loginTab");

    const registerTab =
    document.getElementById("registerTab");

    if(mode === "login"){

        loginForm.classList.remove("hidden");
        registerForm.classList.add("hidden");

        loginTab.classList.add("tab-active");
        registerTab.classList.remove("tab-active");

    }else{

        registerForm.classList.remove("hidden");
        loginForm.classList.add("hidden");

        registerTab.classList.add("tab-active");
        loginTab.classList.remove("tab-active");
    }
}

function submitRegister(){

    const username =
    document.getElementById("registerUsername").value.trim();

    const email =
    document.getElementById("registerEmail").value.trim();

    const password =
    document.getElementById("registerPassword").value;

    const confirm =
    document.getElementById("registerConfirmPassword").value;

    if(
        !username ||
        !email ||
        !password ||
        !confirm
    ){
        alert("Completa todos los campos");
        return;
    }

    if(password !== confirm){
        alert("Las contraseñas no coinciden");
        return;
    }

    if(localStorage.getItem(email)){
        alert("Este correo ya existe");
        return;
    }

    const user = {
        username,
        email,
        password,
        level:1,
        xp:0,
        tokens:0,
        distance:0,
        missions:0
    };

    localStorage.setItem(
        email,
        JSON.stringify(user)
    );

    alert("Cuenta creada correctamente");

    setAuthMode("login");
}

function submitLogin(){

    const email =
    document.getElementById("loginEmail").value.trim();

    const password =
    document.getElementById("loginPassword").value;

    const user =
    JSON.parse(localStorage.getItem(email));

    if(!user){
        alert("Usuario no encontrado");
        return;
    }

    if(user.password !== password){
        alert("Contraseña incorrecta");
        return;
    }

    localStorage.setItem(
        "loggedUser",
        email
    );

    loadUser(user);

    showSection("dashboard");
}

function logout(){

    localStorage.removeItem(
        "loggedUser"
    );

    location.reload();
}

// =========================
// USUARIO
// =========================

function loadUser(user){

    currentUser = user;

    document.getElementById(
        "dashboardUsername"
    ).textContent = user.username;

    document.getElementById(
        "userNameDisplay"
    ).textContent = user.username;

    document.getElementById(
        "profileName"
    ).textContent = user.username;

    document.getElementById(
        "profileLevel"
    ).textContent = user.level;

    document.getElementById(
        "profileXP"
    ).textContent = user.xp;

    document.getElementById(
        "profileTokens"
    ).textContent = user.tokens;

    document.getElementById(
        "profileDistance"
    ).textContent = Math.round(user.distance);

    document.getElementById(
        "profileMissions"
    ).textContent = user.missions;

    document.getElementById(
        "levelDisplay"
    ).textContent = user.level;

    document.getElementById(
        "xpDisplay"
    ).textContent = user.xp;

    document.getElementById(
        "tokensDisplay"
    ).textContent = user.tokens;

    document.getElementById(
        "xpText"
    ).textContent =
    user.xp + " / 100";

    document.getElementById(
        "xpFill"
    ).style.width =
    user.xp + "%";

    document.getElementById(
        "auth"
    ).classList.add("hidden");

    document.getElementById(
        "logoutButton"
    ).classList.remove("hidden");

    updateMission();
}

function saveUser(){

    if(!currentUser) return;

    localStorage.setItem(
        currentUser.email,
        JSON.stringify(currentUser)
    );
}

// =========================
// MISIONES
// =========================

function updateMission(){

    const level =
    currentUser.level;

    const distanceGoal =
    levelDistances[
        Math.min(level-1,
        levelDistances.length-1)
    ];

    document.getElementById(
        "missionText"
    ).textContent =
    `Camina ${distanceGoal} metros`;
}

function addRewards(){

    currentUser.xp += 25;
    currentUser.tokens += 15;
    currentUser.missions += 1;

    if(currentUser.xp >= 100){

        currentUser.level++;

        currentUser.xp = 0;

        alert(
        "🎉 Subiste al nivel "
        + currentUser.level
        );
    }

    saveUser();

    loadUser(currentUser);
}

// =========================
// GPS
// =========================

function startMission(){

    const startPhoto =
    document.getElementById(
        "startPhoto"
    ).files[0];

    const endPhoto =
    document.getElementById(
        "endPhoto"
    ).files[0];

    if(!startPhoto){
        alert(
        "Debes subir la foto inicial"
        );
        return;
    }

    if(!navigator.geolocation){
        alert("GPS no disponible");
        return;
    }

    totalDistance = 0;

    navigator.geolocation
    .getCurrentPosition(position=>{

        startPosition = {
            lat: position.coords.latitude,
            lon: position.coords.longitude
        };

        alert(
        "GPS iniciado. Comienza a caminar."
        );

        watchGPS(endPhoto);

    });
}

function watchGPS(endPhoto){

    watchId =
    navigator.geolocation.watchPosition(

    position=>{

        const distance =
        calculateDistance(
        startPosition.lat,
        startPosition.lon,
        position.coords.latitude,
        position.coords.longitude
        );

        totalDistance = distance;

        document.getElementById(
        "distanceDisplay"
        ).textContent =
        "Distancia recorrida: "
        + Math.round(distance)
        + " m";

        const target =
        levelDistances[
        Math.min(
        currentUser.level-1,
        levelDistances.length-1
        )
        ];

        if(distance >= target){

            navigator.geolocation
            .clearWatch(watchId);

            if(!endPhoto){

                alert(
                "Sube la foto final"
                );

                return;
            }

            currentUser.distance +=
            distance;

            addRewards();

            alert(
            "🎉 Misión completada"
            );
        }

    },

    error=>{
        alert(
        "Error leyendo GPS"
        );
    },

    {
        enableHighAccuracy:true
    }

    );
}

// =========================
// DISTANCIA
// =========================

function calculateDistance(
lat1,
lon1,
lat2,
lon2
){

    const R = 6371000;

    const dLat =
    (lat2-lat1) *
    Math.PI / 180;

    const dLon =
    (lon2-lon1) *
    Math.PI / 180;

    const a =

    Math.sin(dLat/2) *
    Math.sin(dLat/2)

    +

    Math.cos(
    lat1*Math.PI/180
    )

    *

    Math.cos(
    lat2*Math.PI/180
    )

    *

    Math.sin(dLon/2) *
    Math.sin(dLon/2);

    const c =
    2*Math.atan2(
    Math.sqrt(a),
    Math.sqrt(1-a)
    );

    return R*c;
}

// =========================
// MAPA
// =========================

function initMap(){

    const mapDiv =
    document.getElementById("map");

    if(!mapDiv) return;

    if(map){

        map.invalidateSize();
        return;
    }

    map =
    L.map("map")
    .setView(
    [4.7110,-74.0721],
    13
    );

    L.tileLayer(
    "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        attribution:
        "&copy; OpenStreetMap"
    }
    ).addTo(map);

    navigator.geolocation
    .getCurrentPosition(position=>{

        const lat =
        position.coords.latitude;

        const lon =
        position.coords.longitude;

        map.setView(
        [lat,lon],
        15
        );

        marker =
        L.marker(
        [lat,lon]
        )
        .addTo(map)
        .bindPopup(
        "Tu ubicación"
        );

    });
}

// =========================
// TIENDA
// =========================

function buyItem(price){

    if(currentUser.tokens < price){

        alert(
        "No tienes suficientes tokens"
        );

        return;
    }

    currentUser.tokens -= price;

    saveUser();

    loadUser(currentUser);

    alert(
    "🎁 Compra realizada"
    );
}

// =========================
// INICIO
// =========================

window.onload = ()=>{

    const email =
    localStorage.getItem(
    "loggedUser"
    );

    if(email){

        const user =
        JSON.parse(
        localStorage.getItem(email)
        );

        if(user){

            loadUser(user);

            showSection(
            "dashboard"
            );

            return;
        }
    }

    showSection("auth");
};
