const Database = {
    users: [
        { id: 1, name: "Alice", password: "alice12", role: "user", section: "BSCS 1-A" },
        { id: 2, name: "Bob", password: "bobrich123", role: "user", section: "BSIT 2-B" },
        { id: 3, name: "Admin", password: "Admin123", role: "admin" },
        { id: 4, name: "admin", password: "admin", role: "admin" },
        { id: 5, name: "asd", password: "asd", role: "user", section: "BSCS 1-B" }
    ],

    schedules: [
        {
            id: 1,
            userId: 1,
            date: "2025-04-18",
            room: "room-302",
            timeStart: "10:00",
            meridianStart: "AM",
            timeEnd: "12:00",
            meridianEnd: "PM",
            subject: "Math Class",
            professor: "Prof. Reyes"
        },
        {
            id: 2,
            userId: 2,
            date: "2025-04-18",
            room: "room-304",
            timeStart: "1:00",
            meridianStart: "PM",
            timeEnd: "3:00",
            meridianEnd: "PM",
            subject: "Physics Class",
            professor: "Prof. Santos"
        }
    ],

    getUserById(id) {
        return this.users.find(user => user.id === id);
    },

    getUserId(username) {
        const user = this.users.find(u => u.name === username);
        return user ? user.id : null;
    },

    getSchedulesByUserId(userId) {
        return this.schedules.filter(schedule => schedule.userId === userId);
    },

    addSchedule(userId, date, room, timeStart, meridianStart, timeEnd, meridianEnd, subject, professor) {
        const newSchedule = {
            id: this.schedules.length + 1,
            userId,
            date,
            room,
            timeStart,
            meridianStart,
            timeEnd,
            meridianEnd,
            subject,
            professor
        };
        this.schedules.push(newSchedule);
        return newSchedule;
    },

    deleteSchedule(id) {
        const index = this.schedules.findIndex(schedule => schedule.id === id);
        if (index > -1) {
            this.schedules.splice(index, 1);
            return true;
        }
        return false;
    },

    validateUser(name, password) {
        const user = this.users.find(u => u.name === name && u.password === password);
        if (!user) {
            console.log("Invalid username or password.");
            return false;
        }
        return true;
    },

    isAdmin(userId) {
        const user = this.getUserById(userId);
        return user && user.role === "admin";
    },

    createSchedule(userId, date, room, timeStart, meridianStart, timeEnd, meridianEnd, subject, professor) {
        const user = this.getUserById(userId);
        if (!user) {
            console.log("User not found.");
            return null;
        }
        const schedule = this.addSchedule(userId, date, room, timeStart, meridianStart, timeEnd, meridianEnd, subject, professor);
        console.log("Schedule added:", schedule);
        return schedule;
    },

    viewSchedules(userId) {
        const user = this.getUserById(userId);
        if (!user) {
            console.log("User not found.");
            return [];
        }
        const schedules = this.getSchedulesByUserId(userId);
        console.log(`Schedules for ${user.name}:`, schedules);
        return schedules;
    },

    removeSchedule(scheduleId) {
        const success = this.deleteSchedule(scheduleId);
        if (success) {
            console.log("Schedule deleted.");
        } else {
            console.log("Schedule not found.");
        }
        return success;
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const loggedIn = sessionStorage.getItem("loggedIn") === "true";
    const role = sessionStorage.getItem("role");
    const path = window.location.pathname;
    const isLanding = !path.includes("/pages/");

    if (isLanding) {
        // Landing page logic
        document.querySelectorAll(".openLoginBtn, #getStarted").forEach(btn =>
            btn.addEventListener("click", () => {
                if (loggedIn && role) {
                    window.location.href = role === "admin" ? "pages/admin.html" : "pages/schedule.html";
                } else {
                    openLoginModal();
                }
            })
        );
    } else {
        // Pages under /pages/ logic
        if (!loggedIn) {
            window.location.href = "../index.html";
            return;
        }

        if (path.endsWith("admin.html") && role !== "admin") {
            window.location.href = "schedule.html";
            return;
        }
        if (path.endsWith("schedule.html") && role !== "user") {
            window.location.href = "admin.html";
            return;
        }
    }
});

function openLoginModal() {
    let modal = document.getElementById("loginModal");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "loginModal";
        modal.className = "modal-overlay";
        document.body.appendChild(modal);
    }

    if (!modal.innerHTML.trim()) {
        loadLoginModal();
    } else {
        modal.classList.add("active");
    }
}

function loadLoginModal() {
    fetch("pages/login.html")
        .then(r => {
            if (!r.ok) throw new Error(r.status);
            return r.text();
        })
        .then(html => {
            const modal = document.getElementById("loginModal");
            modal.innerHTML = html;
            attachModalHandlers();
            modal.classList.add("active");
        })
        .catch(err => console.error("Error loading login modal:", err));
}

function attachModalHandlers() {
    const modal = document.getElementById("loginModal");
    const loginDiv = modal.querySelector(".login");
    const closeBtn = modal.querySelector(".close-button");
    const form = modal.querySelector("#loginForm");

    if (loginDiv) loginDiv.addEventListener("click", e => e.stopPropagation());
    if (closeBtn) closeBtn.addEventListener("click", closeLoginModal);
    modal.addEventListener("click", closeLoginModal);

    if (form)
        form.addEventListener("submit", e => {
            e.preventDefault();
            const u = form.username.value.trim();
            const p = form.password.value;

            if (!Database.validateUser(u, p)) {
                return alert("Invalid username or password");
            }

            alert("Login successful!");
            const userId = Database.getUserId(u);
            const isAdmin = Database.isAdmin(userId);

            sessionStorage.setItem("loggedIn", "true");
            sessionStorage.setItem("username", u);
            sessionStorage.setItem("userId", userId);
            sessionStorage.setItem("role", isAdmin ? "admin" : "user");

            window.location.href = isAdmin ? "pages/admin.html" : "pages/schedule.html";
        });
}

function closeLoginModal() {
    const modal = document.getElementById("loginModal");
    if (modal) modal.classList.remove("active");
}

function logout() {
    sessionStorage.clear();
    window.location.href = "index.html";
}

function logoutpages() {
    sessionStorage.clear();
    window.location.href = "../index.html";
}

// Admin-specific JavaScript
window.addEventListener("DOMContentLoaded", () => {

    // Add request status counters to each room
    updateRoomRequestCounts();
    
    // Add click event to each room to show requests
    document.querySelectorAll(".room[id]").forEach(room => {
        if (room.id === "room-MIS") return; // Skip MIS room if needed
        
        room.addEventListener("click", () => showRoomRequests(room.id));
    });

    // Close modal when clicking on X or outside the modal
    document.getElementById("closeRequestModal").addEventListener("click", closeRequestModal);
    document.getElementById("requestModal").addEventListener("click", (e) => {
        if (e.target === document.getElementById("requestModal")) {
            closeRequestModal();
        }
    });
});

function updateRoomRequestCounts() {
    // Group schedules by room
    const schedulesByRoom = {};
    Database.schedules.forEach(schedule => {
        const roomId = schedule.room.toLowerCase();
        if (!schedulesByRoom[roomId]) {
            schedulesByRoom[roomId] = [];
        }
        schedulesByRoom[roomId].push(schedule);
    });

    // Update each room with request count
    document.querySelectorAll(".room[id]").forEach(room => {
        const roomId = room.id.toLowerCase();
        if (roomId === "room-mis") return; // Skip MIS room

        const schedules = schedulesByRoom[roomId] || [];
        const requestCount = schedules.length;
        
        const roomHeader = room.querySelector("h1");
        const roomName = roomHeader.textContent.split("(")[0].trim();
        roomHeader.textContent = `${roomName} (${requestCount} Requests)`;
        
        // Add a visual indicator for requests
        if (requestCount > 0) {
            room.classList.add("has-requests");
        } else {
            room.classList.remove("has-requests");
        }
    });
}

function showRoomRequests(roomId) {
    const modal = document.getElementById("requestModal");
    const modalTitle = document.getElementById("modalRoomTitle");
    const requestsList = document.getElementById("requestsList");
    
    // Clear previous requests
    requestsList.innerHTML = "";
    
    // Update title
    const roomName = roomId.replace("room-", "Room ").toUpperCase();
    modalTitle.textContent = `${roomName} - Reservation Requests`;
    
    // Get schedules for this room
    const roomSchedules = Database.schedules.filter(
        schedule => schedule.room.toLowerCase() === roomId.toLowerCase()
    );
    
    if (roomSchedules.length === 0) {
        requestsList.innerHTML = "<p class='no-requests'>No reservation requests for this room.</p>";
    } else {
        // Create a request card for each schedule
        roomSchedules.forEach(schedule => {
            const user = Database.getUserById(schedule.userId);
            const requestCard = document.createElement("div");
            requestCard.className = "request-card";
            requestCard.innerHTML = `
                <div class="request-info">
                    <h3>${schedule.subject}</h3>
                    <p><strong>Date:</strong> ${schedule.date}</p>
                    <p><strong>Time:</strong> ${schedule.timeStart} ${schedule.meridianStart} - ${schedule.timeEnd} ${schedule.meridianEnd}</p>
                    <p><strong>Professor:</strong> ${schedule.professor}</p>
                    <p><strong>Requested by:</strong> ${user ? user.name : 'Unknown'} (${user ? user.section : 'N/A'})</p>
                </div>
                <div class="request-actions">
                    <button class="accept-btn" data-id="${schedule.id}">Accept</button>
                    <button class="decline-btn" data-id="${schedule.id}">Decline</button>
                </div>
            `;
            requestsList.appendChild(requestCard);
        });
        
        // Add event listeners to accept/decline buttons
        document.querySelectorAll(".accept-btn").forEach(btn => {
            btn.addEventListener("click", () => acceptRequest(parseInt(btn.dataset.id)));
        });
        
        document.querySelectorAll(".decline-btn").forEach(btn => {
            btn.addEventListener("click", () => declineRequest(parseInt(btn.dataset.id)));
        });
    }
    
    // Show modal
    modal.classList.add("active");
}

function closeRequestModal() {
    document.getElementById("requestModal").classList.remove("active");
}

function acceptRequest(scheduleId) {
    // Here you would normally update the status in the database
    // For now, we'll just show an alert and remove from the list
    const schedule = Database.schedules.find(s => s.id === scheduleId);
    if (schedule) {
        alert(`Reservation for ${schedule.subject} has been accepted!`);
        // In a real system, you might update a status field instead of removing
        updateRequestDisplay(scheduleId, true);
    }
}

function declineRequest(scheduleId) {
    // Similar to accept but with different message
    const schedule = Database.schedules.find(s => s.id === scheduleId);
    if (schedule) {
        alert(`Reservation for ${schedule.subject} has been declined.`);
        Database.removeSchedule(scheduleId);
        updateRequestDisplay(scheduleId, false);
    }
}

function updateRequestDisplay(scheduleId, accepted) {
    // Remove the request card from the display
    const requestCard = document.querySelector(`.request-card button[data-id="${scheduleId}"]`).closest('.request-card');
    if (requestCard) {
        // Add a fade-out animation
        requestCard.classList.add('fade-out');
        setTimeout(() => {
            requestCard.remove();
            
            // If no more requests, show the "no requests" message
            const requestsList = document.getElementById("requestsList");
            if (requestsList.children.length === 0) {
                requestsList.innerHTML = "<p class='no-requests'>No reservation requests for this room.</p>";
            }
            
            // Update the room request counts
            updateRoomRequestCounts();
        }, 500); // Match the animation duration
    }
}