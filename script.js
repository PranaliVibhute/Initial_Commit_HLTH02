/* =========================================================
   EMERGENCYLINK
   MAIN JAVASCRIPT
========================================================= */


/* =========================================================
   DATA
========================================================= */

const hospitals = [

    {
        id: "H01",
        name: "CityCare Emergency Hospital",
        short: "CityCare",
        lat: 18.5208,
        lng: 73.8500,
        beds: 18,
        icu: 6,
        distance: "2.1 km",
        eta: "6 min",
        condition: "ready",
        capacity: 34,
        trauma: true
    },

    {
        id: "H02",
        name: "Metro Life Hospital",
        short: "Metro Life",
        lat: 18.5270,
        lng: 73.8650,
        beds: 9,
        icu: 2,
        distance: "2.8 km",
        eta: "8 min",
        condition: "busy",
        capacity: 68,
        trauma: true
    },

    {
        id: "H03",
        name: "Sunrise Multispeciality",
        short: "Sunrise",
        lat: 18.5135,
        lng: 73.8385,
        beds: 25,
        icu: 9,
        distance: "3.4 km",
        eta: "10 min",
        condition: "ready",
        capacity: 42,
        trauma: true
    },

    {
        id: "H04",
        name: "Green Valley Medical Centre",
        short: "Green Valley",
        lat: 18.5355,
        lng: 73.8320,
        beds: 6,
        icu: 1,
        distance: "4.2 km",
        eta: "12 min",
        condition: "busy",
        capacity: 81,
        trauma: false
    },

    {
        id: "H05",
        name: "Prime Health Institute",
        short: "Prime Health",
        lat: 18.5005,
        lng: 73.8605,
        beds: 0,
        icu: 0,
        distance: "4.6 km",
        eta: "13 min",
        condition: "full",
        capacity: 100,
        trauma: false
    },

    {
        id: "H06",
        name: "Hope Emergency Centre",
        short: "Hope Centre",
        lat: 18.5410,
        lng: 73.8555,
        beds: 15,
        icu: 4,
        distance: "5.1 km",
        eta: "14 min",
        condition: "ready",
        capacity: 47,
        trauma: true
    }
];


const ambulances = [

    {
        id: "MH-12-AB-2048",
        type: "Advanced Life Support",
        status: "En Route",
        crew: "3 members",
        eta: "06 min"
    },

    {
        id: "MH-12-CD-1092",
        type: "Basic Life Support",
        status: "Available",
        crew: "2 members",
        eta: "—"
    },

    {
        id: "MH-12-EF-7781",
        type: "Advanced Life Support",
        status: "Available",
        crew: "3 members",
        eta: "—"
    },

    {
        id: "MH-12-GH-4420",
        type: "Basic Life Support",
        status: "En Route",
        crew: "2 members",
        eta: "11 min"
    },

    {
        id: "MH-12-JK-3055",
        type: "Advanced Life Support",
        status: "Available",
        crew: "3 members",
        eta: "—"
    },

    {
        id: "MH-12-LM-8890",
        type: "Basic Life Support",
        status: "Maintenance",
        crew: "—",
        eta: "—"
    }

];


/* =========================================================
   GLOBAL STATE
========================================================= */

const state = {

    selectedHospital: null,

    emergencyStatus:
        "Awaiting Hospital",

    ambulancePosition:
        [18.5314, 73.8446],

    currentPage:
        "dashboard",

    dagStep:
        0,

    logs: [

        {
            time: "06:42:12",
            event: "Emergency request received",
            entity: "EM-2048",
            status: "SUCCESS"
        },

        {
            time: "06:42:18",
            event: "Ambulance assigned",
            entity: "MH-12-AB-2048",
            status: "SUCCESS"
        },

        {
            time: "06:43:02",
            event: "Hospital network queried",
            entity: "HOSPITAL-NET",
            status: "SUCCESS"
        },

        {
            time: "06:43:15",
            event: "Patient data packet prepared",
            entity: "EM-2048",
            status: "SUCCESS"
        }

    ]

};


/* =========================================================
   DOM
========================================================= */

const $ = id =>
    document.getElementById(id);


/* =========================================================
   PAGE NAVIGATION
========================================================= */

const pageTitles = {

    dashboard: [
        "Emergency Dashboard",
        "Real-time ambulance and hospital coordination"
    ],

    emergency: [
        "Live Emergency Control",
        "Manage active emergency requests"
    ],

    ambulances: [
        "Ambulance Fleet",
        "Real-time fleet availability"
    ],

    hospitals: [
        "Hospital Network",
        "Capacity, readiness and emergency resources"
    ],

    dag: [
        "DAG Workflow",
        "Dependency-based emergency coordination"
    ],

    analytics: [
        "Analytics",
        "Emergency response performance"
    ],

    audit: [
        "Audit Logs",
        "Traceable emergency workflow events"
    ],

    settings: [
        "System Settings",
        "Configure operator preferences"
    ]

};


function showPage(pageId) {

    document.querySelectorAll(".page")
        .forEach(page => {

            page.classList.remove(
                "active-page"
            );

        });


    const selectedPage =
        document.getElementById(pageId);

    if (selectedPage) {

        selectedPage.classList.add(
            "active-page"
        );

    }


    document.querySelectorAll(".nav-item")
        .forEach(item => {

            item.classList.remove("active");

            if (
                item.dataset.page === pageId
            ) {

                item.classList.add("active");

            }

        });


    const title =
        pageTitles[pageId];

    if (title) {

        $("pageTitle").textContent =
            title[0];

        $("pageSubtitle").textContent =
            title[1];

    }


    state.currentPage =
        pageId;


    if (pageId === "dashboard") {

        setTimeout(() => {

            if (map) {

                map.invalidateSize();

            }

        }, 200);

    }

}


/* nav click */

document.querySelectorAll("[data-page]")
    .forEach(item => {

        item.addEventListener(
            "click",
            () => {

                showPage(
                    item.dataset.page
                );

            }
        );

    });


/* =========================================================
   MAP
========================================================= */

let map;

let ambulanceMarker;

let patientMarker;

let destinationMarker;

let routeLine;

let hospitalMarkers = {};


const ambulanceStart =
    [18.5314, 73.8446];

const patientLocation =
    [18.5275, 73.8482];


/* =========================================================
   CREATE MAP
========================================================= */

function initializeMap() {

    map =
        L.map("map")
        .setView(
            [18.522, 73.851],
            14
        );


    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 19,

            attribution:
                "&copy; OpenStreetMap contributors"
        }
    ).addTo(map);


    /* ================================
       AMBULANCE ICON
    ================================= */

    const ambulanceIcon =
        L.divIcon({

            className: "",

            html:
                `
                <div class="ambulance-marker">
                    <i class="fa-solid fa-truck-medical"></i>
                </div>
                `,

            iconSize: [42,42],

            iconAnchor: [21,21]

        });


    ambulanceMarker =
        L.marker(
            ambulanceStart,
            {
                icon: ambulanceIcon
            }
        )
        .addTo(map)
        .bindPopup(
            `
            <strong>Ambulance MH-12-AB-2048</strong>
            <br>
            Advanced Life Support
            <br>
            Status: En Route
            `
        );


    /* ================================
       PATIENT ICON
    ================================= */

    const patientIcon =
        L.divIcon({

            className: "",

            html:
                `<div class="patient-marker"></div>`,

            iconSize: [22,22],

            iconAnchor: [11,11]

        });


    patientMarker =
        L.marker(
            patientLocation,
            {
                icon: patientIcon
            }
        )
        .addTo(map)
        .bindPopup(
            `
            <strong>Patient Location</strong>
            <br>
            Emergency ID: EM-2048
            `
        );


    /* ================================
       HOSPITAL MARKERS
    ================================= */

    hospitals.forEach(
        hospital => {

            addHospitalMarker(
                hospital
            );

        }
    );

}


/* =========================================================
   HOSPITAL MARKER
========================================================= */

function addHospitalMarker(hospital) {

    const icon =
        L.divIcon({

            className: "",

            html:
                `
                <div
                    class="hospital-marker"
                    id="marker-${hospital.id}"
                >
                    <i class="fa-solid fa-hospital"></i>
                </div>
                `,

            iconSize: [34,34],

            iconAnchor: [17,17]

        });


    const marker =
        L.marker(
            [hospital.lat, hospital.lng],
            {
                icon: icon
            }
        )
        .addTo(map);


    marker.bindPopup(
        `
        <strong>${hospital.name}</strong>
        <br>
        ${hospital.beds} emergency beds
        <br>
        ${hospital.distance} away
        <br><br>

        <button
            onclick="selectHospital('${hospital.id}')"
            style="
                border:none;
                background:#2563eb;
                color:white;
                padding:7px 10px;
                border-radius:6px;
                cursor:pointer;
            "
        >
            Select Hospital
        </button>
        `
    );


    marker.on(
        "click",
        () => {

            selectHospital(
                hospital.id
            );

        }
    );


    hospitalMarkers[
        hospital.id
    ] = marker;

}


/* =========================================================
   SELECT HOSPITAL
========================================================= */

function selectHospital(
    hospitalId
) {

    const hospital =
        hospitals.find(
            h => h.id === hospitalId
        );


    if (!hospital) return;


    state.selectedHospital =
        hospital;


    /* update hospital list */

    renderHospitalList();


    /* update details */

    updateSelectedHospital();


    /* update destination */

    drawHospitalDestination(
        hospital
    );


    /* update emergency */

    $("emergencyDestination")
        .textContent =
        hospital.short;


    $("bannerDestination")
        .textContent =
        hospital.short;


    /* create audit log */

    addLog(
        `Hospital selected: ${hospital.short}`,
        hospital.id
    );


    /* zoom to route */

    setTimeout(
        () => {

            fitSelectedRoute();

        },
        150
    );


    showToast(
        "Destination Updated",
        `${hospital.short} selected as emergency destination`
    );

}


/* =========================================================
   DRAW SELECTED DESTINATION
========================================================= */

function drawHospitalDestination(
    hospital
) {

    const destinationIcon =
        L.divIcon({

            className: "",

            html:
                `
                <div class="destination-marker">
                    <i class="fa-solid fa-hospital"></i>
                </div>
                `,

            iconSize: [40,40],

            iconAnchor: [20,40]

        });


    /* remove old destination */

    if (destinationMarker) {

        map.removeLayer(
            destinationMarker
        );

    }


    /* create blue destination */

    destinationMarker =
        L.marker(
            [hospital.lat, hospital.lng],
            {
                icon: destinationIcon,
                zIndexOffset: 1000
            }
        )
        .addTo(map)
        .bindPopup(
            `
            <strong>Selected Destination</strong>
            <br>
            ${hospital.name}
            <br>
            ETA: ${hospital.eta}
            `
        );


    /* draw blue route */

    drawRoute(
        hospital
    );


    /* update marker style */

    document
        .querySelectorAll(
            ".hospital-marker"
        )
        .forEach(marker => {

            marker.classList.remove(
                "selected"
            );

        });


    const selectedMarker =
        document.getElementById(
            `marker-${hospital.id}`
        );


    if (selectedMarker) {

        selectedMarker.classList.add(
            "selected"
        );

    }

}


/* =========================================================
   DRAW BLUE ROUTE
========================================================= */

function drawRoute(
    hospital
) {

    if (routeLine) {

        map.removeLayer(
            routeLine
        );

    }


    /*
       Prototype route.

       In the real system this array will
       come from OSRM / Google Maps /
       another routing service.

       The route color is BLUE because
       the hospital is the selected destination.
    */

    const routePoints = [

        state.ambulancePosition,

        [18.5298, 73.8460],

        [18.5270, 73.8480],

        [18.5235, 73.8505],

        [18.5185, 73.8520],

        [18.5140, 73.8525],

        [hospital.lat, hospital.lng]

    ];


    routeLine =
        L.polyline(
            routePoints,
            {

                color:
                    "#2563eb",

                weight:
                    6,

                opacity:
                    0.95,

                lineCap:
                    "round",

                lineJoin:
                    "round"

            }
        )
        .addTo(map);


    /* glow route */

    L.polyline(
        routePoints,
        {

            color:
                "#60a5fa",

            weight:
                12,

            opacity:
                0.13,

            lineCap:
                "round"

        }
    ).addTo(
        map
    );


    routeLine.bindTooltip(
        "Selected Emergency Route",
        {
            sticky: true
        }
    );

}


/* =========================================================
   FIT ROUTE
========================================================= */

function fitSelectedRoute() {

    if (
        !state.selectedHospital ||
        !routeLine
    ) {

        showToast(
            "Select Hospital",
            "Please select a hospital first"
        );

        return;

    }


    const bounds =
        L.latLngBounds([

            state.ambulancePosition,

            [
                state.selectedHospital.lat,
                state.selectedHospital.lng
            ]

        ]);


    map.fitBounds(
        bounds,
        {
            padding: [60,60],
            maxZoom: 15,
            animate: true
        }
    );

}


/* =========================================================
   HOSPITAL LIST UI
========================================================= */

function renderHospitalList() {

    const container =
        $("hospitalList");


    container.innerHTML =
        "";


    hospitals.forEach(
        hospital => {

            const selected =
                state.selectedHospital &&
                state.selectedHospital.id ===
                hospital.id;


            const conditionClass =
                hospital.condition;


            const conditionText =
                hospital.condition === "ready"
                    ? "READY"
                    : hospital.condition === "busy"
                        ? "BUSY"
                        : "FULL";


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                `hospital-item ${
                    selected ? "selected" : ""
                }`;


            item.innerHTML =
                `
                <div class="hospital-item-icon">
                    <i class="fa-solid fa-hospital"></i>
                </div>

                <div class="hospital-item-info">

                    <strong>
                        ${hospital.short}
                    </strong>

                    <small>
                        ${hospital.distance}
                        ·
                        ${hospital.beds} beds
                    </small>

                </div>

                <span
                    class="ready-badge ${conditionClass}"
                >
                    ${conditionText}
                </span>
                `;


            item.addEventListener(
                "click",
                () => {

                    selectHospital(
                        hospital.id
                    );

                }
            );


            container.appendChild(
                item
            );

        }
    );

}


/* =========================================================
   SELECTED HOSPITAL DETAILS
========================================================= */

function updateSelectedHospital() {

    const hospital =
        state.selectedHospital;


    if (!hospital) {

        $("selectedHospitalName")
            .textContent =
            "No hospital selected";

        $("selectedBeds")
            .textContent =
            "Select hospital";

        $("selectedEta")
            .textContent =
            "—";

        $("selectedDistance")
            .textContent =
            "—";

        updateDispatchButton(
            null
        );

        return;

    }


    $("selectedHospitalName")
        .textContent =
        hospital.name;


    $("selectedBeds")
        .textContent =
        `${hospital.beds} beds · ${hospital.icu} ICU`;


    $("selectedEta")
        .textContent =
        hospital.eta;


    $("selectedDistance")
        .textContent =
        hospital.distance;


    updateDispatchButton(
        hospital
    );

}


/* =========================================================
   CONDITION BASED DISPATCH BUTTON
========================================================= */

function updateDispatchButton(
    hospital
) {

    const button =
        $("dispatchBtn");

    const text =
        $("dispatchText");


    /* reset */

    button.disabled =
        false;

    button.className =
        "dispatch-btn";


    if (!hospital) {

        button.disabled =
            true;

        button.classList.add(
            "disabled"
        );

        text.textContent =
            "Select Hospital";

        return;

    }


    /* ============================
       READY
    ============================ */

    if (
        hospital.condition ===
        "ready"
    ) {

        button.classList.add(
            "ready-btn"
        );

        text.textContent =
            "Dispatch to Hospital";

        return;

    }


    /* ============================
       BUSY
    ============================ */

    if (
        hospital.condition ===
        "busy"
    ) {

        button.classList.add(
            "busy-btn"
        );

        text.textContent =
            "Dispatch · Capacity Limited";

        return;

    }


    /* ============================
       FULL
    ============================ */

    if (
        hospital.condition ===
        "full"
    ) {

        button.classList.add(
            "full-btn"
        );

        button.disabled =
            true;

        text.textContent =
            "Hospital Full · Select Another";

    }

}


/* =========================================================
   DISPATCH
========================================================= */

$("dispatchBtn")
    .addEventListener(
        "click",
        () => {

            const hospital =
                state.selectedHospital;


            if (!hospital) {

                return;

            }


            if (
                hospital.condition ===
                "full"
            ) {

                return;

            }


            state.emergencyStatus =
                "Ambulance Dispatched";


            $("emergencyStatus")
                .textContent =
                "Ambulance Dispatched";


            addLog(
                `Ambulance dispatched to ${hospital.short}`,
                "EM-2048"
            );


            showToast(
                "Ambulance Dispatched",
                `Route activated for ${hospital.short}`
            );


            updateDispatchButton(
                hospital
            );

        }
    );


/* =========================================================
   MAP BUTTONS
========================================================= */

$("fitRouteBtn")
    .addEventListener(
        "click",
        fitSelectedRoute
    );


$("mapLocateBtn")
    .addEventListener(
        "click",
        locateUser
    );


$("locateBtn")
    .addEventListener(
        "click",
        locateUser
    );


/* =========================================================
   USER LOCATION
========================================================= */

function locateUser() {

    if (
        !navigator.geolocation
    ) {

        showToast(
            "Location unavailable",
            "Browser geolocation is not supported"
        );

        return;

    }


    navigator.geolocation.getCurrentPosition(

        position => {

            const coords = [

                position.coords.latitude,

                position.coords.longitude

            ];


            map.flyTo(
                coords,
                15
            );


            $("locationName")
                .textContent =
                "Current Location";


            showToast(
                "Location Updated",
                "Map centered on your current location"
            );

        },

        () => {

            showToast(
                "Location Permission",
                "Could not access your current location"
            );

        }

    );

}


/* =========================================================
   AMBULANCE PAGE
========================================================= */

function renderAmbulances() {

    const grid =
        $("ambulanceGrid");


    grid.innerHTML =
        "";


    ambulances.forEach(
        ambulance => {

            let statusClass =
                ambulance.status
                    .toLowerCase()
                    .replace(
                        " ",
                        "-"
                    );


            grid.innerHTML +=
                `
                <div class="ambulance-card">

                    <div class="ambulance-top">

                        <div class="ambulance-icon">
                            <i class="fa-solid fa-truck-medical"></i>
                        </div>

                        <span
                            class="ready-badge ${
                                ambulance.status === "Available"
                                    ? "ready"
                                    : ambulance.status === "En Route"
                                        ? "busy"
                                        : "full"
                            }"
                        >
                            ${ambulance.status}
                        </span>

                    </div>

                    <h3>
                        ${ambulance.id}
                    </h3>

                    <p>
                        ${ambulance.type}
                    </p>

                    <div class="ambulance-status">

                        <span>
                            Crew
                            <strong>
                                ${ambulance.crew}
                            </strong>
                        </span>

                        <span>
                            ETA
                            <strong>
                                ${ambulance.eta}
                            </strong>
                        </span>

                    </div>

                </div>
                `;

        }
    );

}


/* =========================================================
   HOSPITAL NETWORK PAGE
========================================================= */

function renderHospitalNetwork(
    search = ""
) {

    const grid =
        $("hospitalNetworkGrid");


    const filtered =
        hospitals.filter(
            hospital =>
                hospital.name
                    .toLowerCase()
                    .includes(
                        search.toLowerCase()
                    )
        );


    grid.innerHTML =
        "";


    filtered.forEach(
        hospital => {

            const statusText =
                hospital.condition === "ready"
                    ? "READY"
                    : hospital.condition === "busy"
                        ? "BUSY"
                        : "FULL";


            grid.innerHTML +=
                `
                <div
                    class="network-hospital-card"
                    onclick="selectHospital('${hospital.id}')"
                >

                    <div class="network-hospital-top">

                        <div class="network-hospital-icon">
                            <i class="fa-solid fa-hospital"></i>
                        </div>

                        <span
                            class="ready-badge ${hospital.condition}"
                        >
                            ${statusText}
                        </span>

                    </div>

                    <h3>
                        ${hospital.name}
                    </h3>

                    <p>
                        ${hospital.distance}
                        from ambulance
                    </p>


                    <div class="resource-row">

                        <span>
                            Emergency beds
                        </span>

                        <strong>
                            ${hospital.beds}
                        </strong>

                    </div>


                    <div class="capacity-bar">

                        <div
                            class="capacity-fill"
                            style="
                                width:
                                ${hospital.capacity}%
                            "
                        ></div>

                    </div>


                    <div class="resource-row">

                        <span>
                            ICU beds
                        </span>

                        <strong>
                            ${hospital.icu}
                        </strong>

                    </div>

                </div>
                `;

        }
    );


    renderNetworkSummary();

}


/* =========================================================
   NETWORK SUMMARY
========================================================= */

function renderNetworkSummary() {

    const ready =
        hospitals.filter(
            h => h.condition === "ready"
        ).length;


    const busy =
        hospitals.filter(
            h => h.condition === "busy"
        ).length;


    const full =
        hospitals.filter(
            h => h.condition === "full"
        ).length;


    $("networkSummary").innerHTML =
        `

        <div class="network-summary-item">
            <small>Total Hospitals</small>
            <strong>${hospitals.length}</strong>
        </div>

        <div class="network-summary-item">
            <small>Ready</small>
            <strong style="color:#20c997">
                ${ready}
            </strong>
        </div>

        <div class="network-summary-item">
            <small>Capacity Limited</small>
            <strong style="color:#f5b942">
                ${busy}
            </strong>
        </div>

        <div class="network-summary-item">
            <small>Full</small>
            <strong style="color:#ff4d5a">
                ${full}
            </strong>
        </div>

        `;

}


/* =========================================================
   SEARCH HOSPITAL
========================================================= */

$("hospitalSearch")
    .addEventListener(
        "input",
        event => {

            renderHospitalNetwork(
                event.target.value
            );

        }
    );


/* =========================================================
   AUDIT LOG
========================================================= */

function addLog(
    event,
    entity
) {

    const now =
        new Date();


    const time =
        now.toLocaleTimeString(
            "en-IN",
            {
                hour12: false
            }
        );


    state.logs.unshift({

        time,

        event,

        entity,

        status:
            "SUCCESS"

    });


    renderAuditLogs();

    renderRecentActivity();

}


function renderAuditLogs(
    search = ""
) {

    const table =
        $("auditTable");


    const filtered =
        state.logs.filter(
            log =>
                (
                    log.event +
                    log.entity
                )
                .toLowerCase()
                .includes(
                    search.toLowerCase()
                )
        );


    table.innerHTML =
        "";


    filtered.forEach(
        log => {

            table.innerHTML +=
                `
                <tr>

                    <td>
                        ${log.time}
                    </td>

                    <td>
                        ${log.event}
                    </td>

                    <td>
                        ${log.entity}
                    </td>

                    <td>
                        <span class="log-status">
                            ${log.status}
                        </span>
                    </td>

                </tr>
                `;

        }
    );

}


/* =========================================================
   AUDIT SEARCH
========================================================= */

$("auditSearch")
    .addEventListener(
        "input",
        event => {

            renderAuditLogs(
                event.target.value
            );

        }
    );


/* =========================================================
   RECENT ACTIVITY
========================================================= */

function renderRecentActivity() {

    const container =
        $("recentActivity");


    container.innerHTML =
        "";


    state.logs
        .slice(0,4)
        .forEach(
            (log, index) => {

                const iconClass =
                    index === 0
                        ? "blue"
                        : index === 1
                            ? "green"
                            : "red";


                const icon =
                    index === 0
                        ? "fa-bolt"
                        : index === 1
                            ? "fa-check"
                            : "fa-route";


                container.innerHTML +=
                    `
                    <div class="activity-item">

                        <div
                            class="activity-icon ${iconClass}"
                        >
                            <i class="fa-solid ${icon}"></i>
                        </div>

                        <div class="activity-info">

                            <strong>
                                ${log.event}
                            </strong>

                            <small>
                                ${log.entity}
                            </small>

                        </div>

                        <span class="activity-time">
                            ${log.time}
                        </span>

                    </div>
                    `;

            }
        );

}


/* =========================================================
   EXPORT AUDIT LOGS
========================================================= */

$("exportLogsBtn")
    .addEventListener(
        "click",
        () => {

            let csv =
                "Time,Event,Entity,Status\n";


            state.logs.forEach(
                log => {

                    csv +=
                        `"${log.time}","${log.event}","${log.entity}","${log.status}"\n`;

                }
            );


            const blob =
                new Blob(
                    [csv],
                    {
                        type:
                            "text/csv"
                    }
                );


            const url =
                URL.createObjectURL(
                    blob
                );


            const link =
                document.createElement(
                    "a"
                );

            link.href =
                url;

            link.download =
                "emergency-audit-log.csv";

            link.click();


            URL.revokeObjectURL(
                url
            );


            showToast(
                "Export Complete",
                "Audit log CSV downloaded"
            );

        }
    );


/* =========================================================
   EMERGENCY ACTION BUTTONS
========================================================= */

$("acceptBtn")
    .addEventListener(
        "click",
        () => {

            state.emergencyStatus =
                "Accepted";


            $("emergencyStatus")
                .textContent =
                "Accepted";


            addLog(
                "Emergency accepted",
                "EM-2048"
            );


            showToast(
                "Emergency Accepted",
                "Hospital coordination started"
            );

        }
    );


$("emergencyDispatchBtn")
    .addEventListener(
        "click",
        () => {

            if (
                !state.selectedHospital
            ) {

                showToast(
                    "Hospital Required",
                    "Select a destination hospital first"
                );

                return;

            }


            if (
                state.selectedHospital.condition ===
                "full"
            ) {

                showToast(
                    "Dispatch Blocked",
                    "Selected hospital is currently full"
                );

                return;

            }


            state.emergencyStatus =
                "Ambulance Dispatched";


            $("emergencyStatus")
                .textContent =
                "Ambulance Dispatched";


            addLog(
                "Ambulance dispatched",
                state.selectedHospital.short
            );


            showToast(
                "Dispatch Confirmed",
                `Ambulance → ${state.selectedHospital.short}`
            );

        }
    );


$("arriveBtn")
    .addEventListener(
        "click",
        () => {

            state.emergencyStatus =
                "Ambulance Arrived";


            $("emergencyStatus")
                .textContent =
                "Ambulance Arrived";


            addLog(
                "Ambulance arrived at destination",
                state.selectedHospital
                    ? state.selectedHospital.short
                    : "Unknown"
            );


            showToast(
                "Arrival Recorded",
                "Ambulance arrival logged"
            );

        }
    );


$("completeBtn")
    .addEventListener(
        "click",
        () => {

            state.emergencyStatus =
                "Handover Complete";


            $("emergencyStatus")
                .textContent =
                "Handover Complete";


            addLog(
                "Patient handover completed",
                "EM-2048"
            );


            showToast(
                "Handover Complete",
                "Emergency workflow completed"
            );

        }
    );


/* =========================================================
   DAG
========================================================= */

$("advanceDagBtn")
    .addEventListener(
        "click",
        advanceDAG
    );


function advanceDAG() {

    const steps = [

        "data",
        "prepare",
        "route",
        "arrival",
        "handover"

    ];


    if (
        state.dagStep >=
        steps.length
    ) {

        showToast(
            "Workflow Complete",
            "All DAG tasks completed"
        );

        return;

    }


    const step =
        steps[state.dagStep];


    const node =
        document.querySelector(
            `[data-step="${step}"]`
        );


    if (!node) return;


    node.classList.remove(
        "running",
        "pending"
    );

    node.classList.add(
        "completed"
    );


    const small =
        node.querySelector(
            "small"
        );


    if (small) {

        small.textContent =
            "Completed";

    }


    state.dagStep++;


    addLog(
        `DAG task completed: ${step}`,
        "DAG-ENGINE"
    );


    showToast(
        "Workflow Advanced",
        `${step} task completed`
    );

}


/* =========================================================
   MOBILE MENU
========================================================= */

$("mobileMenu")
    .addEventListener(
        "click",
        () => {

            document
                .querySelector(
                    ".sidebar"
                )
                .classList.toggle(
                    "mobile-open"
                );

        }
    );


/* =========================================================
   TOAST
========================================================= */

let toastTimer;


function showToast(
    title,
    message
) {

    $("toastTitle")
        .textContent =
        title;


    $("toastMessage")
        .textContent =
        message;


    $("toast")
        .classList.add(
            "show"
        );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            () => {

                $("toast")
                    .classList.remove(
                        "show"
                    );

            },
            3000
        );

}


/* =========================================================
   INIT
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeMap();

        renderHospitalList();

        renderAmbulances();

        renderHospitalNetwork();

        renderAuditLogs();

        renderRecentActivity();

        updateSelectedHospital();

        showPage(
            "dashboard"
        );

    }
);