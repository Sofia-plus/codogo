alert("JavaScript conectado");
let map;
let watchId;
let startPosition = null;

// Mostrar secciones
function showSection(sectionId){

```
document.querySelectorAll(".section").forEach(section=>{
    section.classList.add("hidden");
});

document.getElementById(sectionId)
    .classList.remove("hidden");

if(sectionId === "mapSection"){
    setTimeout(initMap,300);
}
```

}

// Cambiar entre login y registro
function setAuthMode(mode){

```
const loginForm =
    document.getElementById("loginForm");

const registerForm =
    document.getElementById("registerForm");

if(mode === "login"){

    loginForm.classList.remove("hidden");
    registerForm.classList.add("hidden");

}else{

    registerForm.classList.remove("hidden");
    loginForm.classList.add("hidden");

}
```

}

// Registrar usuario
function submitRegister(){

```
const username =
    document.getElementById("registerUsername").value.trim();

const email =
    document.getElementById("registerEmail").value.trim();

const password =
    document.getElementById("registerPassword").value;

const confirm =
    document.getElementById("registerConfirmPassword").value;

if(!username || !email || !password){
    alert("Completa todos los campos");
    return;
}

if(password !== confirm){
    alert("Las contraseñas no coinciden");
    return;
}

if(localStorage.getItem(email)){
    alert("Ese correo ya está registrado");
    return;
}

const user = {
    username,
    email,
    password,
    level:1,
    tokens:0
};

localStorage.setItem(
    email,
    JSON.stringify(user)
);

alert("Cuenta creada correctamente");

setAuthMode("login");
```

}

// Iniciar sesión
function submitLogin(){

```
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
```

}

// Cargar usuario
function loadUser(user){

```
document.getElementById(
    "dashboardUsername"
).textContent = user.username;

document.getElementById(
    "profileName"
).textContent = user.username;

document.getElementById(
    "userNameDisplay"
).textContent = user.username;

document.getElementById(
    "logoutButton"
).classList.remove("hidden");
```

}

// Cerrar sesión
function logout(){

```
localStorage.removeItem(
    "loggedUser"
);

location.reload();
```

}

// Comprar objeto
function buyItem(btn){

```
alert(
    "Artículo canjeado correctamente"
);

btn.innerText = "Canjeado";

btn.disabled = true;
```

}

// Subir foto
function uploadPhoto(id,btn){

```
const input =
    document.getElementById(
        `photoUpload-${id}`
    );

if(!input){
    alert("No se encontró el campo");
    return;
}

const file = input.files[0];

if(!file){
    alert("Selecciona una imagen");
    return;
}

const allowed = [
    "image/jpeg",
    "image/png",
    "image/webp"
];

if(!allowed.includes(file.type)){
    alert("Formato inválido");
    return;
}

if(file.size > 5*1024*1024){
    alert("Máximo 5MB");
    return;
}

btn.innerText =
    "Foto verificada";

btn.disabled = true;

alert("Imagen validada");
```

}

// Distancia GPS
function calculateDistance(lat1,lon1,lat2,lon2){

```
const R = 6371000;

const dLat =
    (lat2-lat1) * Math.PI/180;

const dLon =
    (lon2-lon1) * Math.PI/180;

const a =
    Math.sin(dLat/2) *
    Math.sin(dLat/2)
    +
    Math.cos(lat1*Math.PI/180)
    *
    Math.cos(lat2*Math.PI/180)
    *
    Math.sin(dLon/2)
    *
    Math.sin(dLon/2);

const c =
    2 * Math.atan2(
        Math.sqrt(a),
        Math.sqrt(1-a)
    );

return R*c;
```

}

// GPS REAL
function startWalkVerification(id,btn){

```
if(!navigator.geolocation){

    alert(
        "Tu navegador no soporta GPS"
    );

    return;
}

btn.innerText =
    "Esperando movimiento...";

navigator.geolocation.getCurrentPosition(

    function(position){

        startPosition = {

            lat:position.coords.latitude,

            lon:position.coords.longitude
        };

        watchId =
        navigator.geolocation.watchPosition(

            function(newPosition){

                const distance =
                calculateDistance(

                    startPosition.lat,

                    startPosition.lon,

                    newPosition.coords.latitude,

                    newPosition.coords.longitude

                );

                btn.innerText =
                "Distancia: "
                +
                Math.round(distance)
                +
                " m";

                if(distance >= 1800){

                    navigator.geolocation
                    .clearWatch(watchId);

                    btn.innerText =
                    "Misión completada";

                    btn.disabled = true;

                    alert(
                    "Has recorrido 1.8 km"
                    );
                }

            },

            function(){

                alert(
                    "Error al obtener ubicación"
                );

            },

            {
                enableHighAccuracy:true
            }
        );

    },

    function(){

        alert(
            "Permiso GPS denegado"
        );

    }
);
```

}

// Mapa
function initMap(){

```
if(map){
    map.invalidateSize();
    return;
}

map = L.map("map")
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

navigator.geolocation.getCurrentPosition(

    function(pos){

        const lat =
            pos.coords.latitude;

        const lon =
            pos.coords.longitude;

        map.setView(
            [lat,lon],
            15
        );

        L.marker(
            [lat,lon]
        )
        .addTo(map)
        
        .bindPopup(
            "Tu ubicación"
        )
        .openPopup();
    }
);
```

}

// Mantener sesión iniciada
window.onload = ()=>{

```
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
    }

}else{

    showSection(
        "auth"
    );
}
```

};
