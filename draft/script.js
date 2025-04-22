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