/**
 * Main JavaScript file for Blueprint CSD
 * Contains core functionality used across all pages
 */

// Database mock - in production this would be replaced with actual server calls
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
        return !!user;
    },

    isAdmin(userId) {
        const user = this.getUserById(userId);
        return user && user.role === "admin";
    },

    createSchedule(userId, date, room, timeStart, meridianStart, timeEnd, meridianEnd, subject, professor) {
        const user = this.getUserById(userId);
        if (!user) return null;
        return this.addSchedule(userId, date, room, timeStart, meridianStart, timeEnd, meridianEnd, subject, professor);
    },

    viewSchedules(userId) {
        const user = this.getUserById(userId);
        if (!user) return [];
        return this.getSchedulesByUserId(userId);
    },

    removeSchedule(scheduleId) {
        return this.deleteSchedule(scheduleId);
    }
};

// Auth and routing functions
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

    // Setup logout button event handler
    const menuCheckbox = document.getElementById('menu');
    
    // Close menu when clicking anywhere on the document
    document.addEventListener('click', function(event) {
        // If the clicked element is not the menu or a descendant of the menu
        if (!event.target.closest('.nav-menu') && !event.target.matches('.menu-checkbox')) {
            menuCheckbox.checked = false;
        }
    });
    
    // Prevent clicks inside the menu from bubbling up to document
    const navMenu = document.querySelector('.nav-menu');
    navMenu.addEventListener('click', function(event) {
        event.stopPropagation();
    });

    const loginMenuItem = document.getElementById('loginMenuItem');
    const userIsLoggedIn = checkIfUserIsLoggedIn(); // This function will check login status
    
    // Update menu item text based on login status
    let loginMenuItem = document.querySelector('.menu-items a:first-child');
    if (!loginMenuItem) {
        console.error("Menu item not found. Check your HTML structure.");
        return;
    }
    
    // Check if user is logged in
    const userIsLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
    
    // Set initial text
    loginMenuItem.textContent = userIsLoggedIn ? 'Log out' : 'Log in';
    
    // Add click handler
    loginMenuItem.addEventListener('click', function(event) {
        event.preventDefault();
        
        if (userIsLoggedIn) {
            // Handle logout
            localStorage.removeItem('userLoggedIn');
            alert('You have been logged out.');
            loginMenuItem.textContent = 'Log in';
            window.location.reload(); // Refresh page to update UI
        } else {
            // Handle login - show modal
            const loginModal = document.getElementById('loginModal');
            if (loginModal) {
                loginModal.classList.add('active');
                // Make login form visible
                const loginForm = document.querySelector('.login');
                if (loginForm) {
                    loginForm.style.display = 'block';
                }
            }
        }
    });
    
    // Close menu when clicking anywhere on the document
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.nav-menu') && !event.target.matches('.menu-checkbox')) {
            menuCheckbox.checked = false;
        }
    });
    
    // Prevent clicks inside the menu from bubbling up to document
    navMenu.addEventListener('click', function(event) {
        event.stopPropagation();
    });
    
    // Function to check if user is logged in
    function checkIfUserIsLoggedIn() {
        // Check localStorage, cookies, or session for login status
        return localStorage.getItem('userLoggedIn') === 'true';
    }
    
    // Function to handle logout
    function handleLogout(event) {
        event.preventDefault();
        // Clear login data
        localStorage.removeItem('userLoggedIn');
        // Update UI or redirect
        window.location.reload();
    }
    
    // Function to show login modal
    function showLoginModal(event) {
        event.preventDefault();
        const loginModal = document.getElementById('loginModal');
        if (loginModal) {
            loginModal.classList.add('active');
            // Add your login form display code here
            // You might already have this function elsewhere
        }
    }
});

// Login modal functions
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

// Logout function for all pages
function logout() {
    sessionStorage.clear();
    // Check if we're in a subdirectory
    if (window.location.pathname.includes("/pages/")) {
        window.location.href = "../index.html";
    } else {
        window.location.href = "index.html";
    }
}

// Utility functions
function getRoomName(roomId) {
    return "Room " + roomId.split("-")[1].toUpperCase();
}

function convertTo24Hour(time, meridian) {
    let [hours, minutes] = time.split(':');
    hours = parseInt(hours);
    
    if (meridian === 'PM' && hours < 12) {
        hours += 12;
    }
    if (meridian === 'AM' && hours === 12) {
        hours = 0;
    }
    
    return hours * 60 + parseInt(minutes);
}

function isValidTimeFormat(time) {
    const timeRegex = /^([0-9]|0[0-9]|1[0-2]):([0-5][0-9])$/;
    return timeRegex.test(time);
}

// Update date and time for pages that need it
function updateDateTime() {
    if (!document.getElementById('currentTime')) return;
    
    const now = new Date();
    
    // Format the date: April 23, 2025
    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = now.toLocaleDateString('en-US', dateOptions);
    
    // Get day name
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = days[now.getDay()];
    
    // Format time: HH:MM:SS
    const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
    const formattedTime = now.toLocaleTimeString('en-US', timeOptions);
    
    // Update the DOM
    document.getElementById('currentDate').textContent = formattedDate;
    document.getElementById('currentDay').textContent = dayName;
    document.getElementById('currentTime').textContent = formattedTime;
}