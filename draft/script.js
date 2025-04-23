// Database and site-wide functionality
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

// Utility functions
function convertTo24Hour(time, meridian) {
    let [hours, minutes] = time.split(':');
    hours = parseInt(hours);
    
    if (meridian === 'PM' && hours < 12) {
        hours += 12;
    }
    if (meridian === 'AM' && hours === 12) {
        hours = 0;
    }
    
    return hours * 60 + parseInt(minutes || 0);
}

function isValidTimeFormat(time) {
    const timeRegex = /^([0-9]|0[0-9]|1[0-2]):([0-5][0-9])$/;
    return timeRegex.test(time);
}

function getRoomName(roomId) {
    // Convert room-301 to Room 301
    return "Room " + roomId.split("-")[1].toUpperCase();
}

// Function to toggle menu visibility
function toggleMenu() {
    const menuCheckbox = document.getElementById('menu');
    const dropdownMenu = document.querySelector('.nav-menu > div');
    
    if (menuCheckbox && dropdownMenu) {
        // Update the dropdown visibility based on checkbox state
        dropdownMenu.style.display = menuCheckbox.checked ? 'block' : 'none';
    }
}

// Site-wide initialization
document.addEventListener("DOMContentLoaded", () => {
    const loggedIn = sessionStorage.getItem("loggedIn") === "true";
    const role = sessionStorage.getItem("role");
    const path = window.location.pathname;
    const isLanding = !path.includes("/pages/");

    // Menu toggle functionality
    const menuCheckbox = document.getElementById('menu');
    if (menuCheckbox) {
        menuCheckbox.addEventListener('change', toggleMenu);
    }

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

    // Run room gallery initialization if on the rooms page
    if (path.includes("rooms.html")) {
        initializeGallery();
    }
});

// Login modal functionality
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

// Unified logout function for all pages
function logout() {
    sessionStorage.clear();
    // Check if we're in a subdirectory
    if (window.location.pathname.includes("/pages/")) {
        window.location.href = "../index.html";
    } else {
        window.location.href = "index.html";
    }
}

// Date and time functionality
function updateDateTime() {
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
    
    // Update the DOM if elements exist
    const dateElement = document.getElementById('currentDate');
    const dayElement = document.getElementById('currentDay');
    const timeElement = document.getElementById('currentTime');
    
    if (dateElement) dateElement.textContent = formattedDate;
    if (dayElement) dayElement.textContent = dayName;
    if (timeElement) timeElement.textContent = formattedTime;
}

// Room tabs functionality
function openRoom(roomId) {
    // Hide all tab contents
    const tabContents = document.getElementsByClassName('tab-content');
    for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].classList.remove('active');
    }
    
    // Remove active class from all tabs
    const tabs = document.getElementsByClassName('tab');
    for (let i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove('active');
    }
    
    // Show the selected tab content
    document.getElementById(roomId).classList.add('active');
    
    // Add active class to the clicked tab
    const clickedTab = document.querySelector(`[onclick="openRoom('${roomId}')"]`);
    clickedTab.classList.add('active');
    
    // Reset all galleries to show first slide
    initializeGallery();
}

// Gallery functionality
function initializeGallery() {
    const galleries = document.querySelectorAll('.gallery-container');
    
    galleries.forEach(gallery => {
        const slides = gallery.querySelectorAll('.gallery-slide');
        const dots = gallery.querySelectorAll('.gallery-dot');
        let currentSlide = 0;
        
        // Initial state
        if (slides.length > 0) {
            slides[0].classList.add('active');
        }
        if (dots.length > 0) {
            dots[0].classList.add('active');
        }
        
        // Start automatic slideshow
        const interval = setInterval(() => {
            nextSlide(gallery);
        }, 5000);
        
        // Store interval reference
        gallery.dataset.interval = interval;
        
        // Set up dot click handlers
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                clearInterval(parseInt(gallery.dataset.interval));
                showSlide(gallery, index);
                
                // Restart automatic slideshow
                gallery.dataset.interval = setInterval(() => {
                    nextSlide(gallery);
                }, 5000);
            });
        });
    });
}

function showSlide(gallery, index) {
    const slides = gallery.querySelectorAll('.gallery-slide');
    const dots = gallery.querySelectorAll('.gallery-dot');
    
    // Hide all slides
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    // Show selected slide
    slides[index].classList.add('active');
    dots[index].classList.add('active');
}

function nextSlide(gallery) {
    const slides = gallery.querySelectorAll('.gallery-slide');
    const dots = gallery.querySelectorAll('.gallery-dot');
    
    // Find current active slide
    let currentIndex = 0;
    slides.forEach((slide, index) => {
        if (slide.classList.contains('active')) {
            currentIndex = index;
        }
    });
    
    // Move to next slide
    const nextIndex = (currentIndex + 1) % slides.length;
    showSlide(gallery, nextIndex);
}