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
    setupRoomDropdown();

    handleRoomTabSelection();

        window.addEventListener('resize', function() {
            setupRoomDropdown(); 
        }); 

    const login = document.getElementById('logoutBtn');
    const logout = document.getElementById('loginMenuItem');

    if (loggedIn) {
        logout.style.display = "none";
        login.style.display = "block";
    } else {
        logout.style.display = "block";
        login.style.display = "none";
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

// Function to handle the MIS Room dropdown
function setupRoomDropdown() {
    const trigger = document.getElementById('misRoomTrigger');
    const subMenu = document.getElementById('roomsSubMenu');
    const dropdownContainer = document.querySelector('.dropdown-container');
    
    if (!trigger || !subMenu || !dropdownContainer) return;
    
    let timeout;
    const delay = 300; // milliseconds to wait before hiding submenu
    
    // Open submenu on click (works on all devices)
    trigger.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        this.classList.toggle('active');
        subMenu.classList.toggle('active');
        
        // If menu is now active, add a click handler to the document to close it
        if (this.classList.contains('active')) {
            setTimeout(() => {
                document.addEventListener('click', closeSubmenuOnClickOutside);
            }, 10);
        } else {
            document.removeEventListener('click', closeSubmenuOnClickOutside);
        }
    });
    
    // For desktop: Add hover behavior with delay
    if (window.matchMedia("(min-width: 769px)").matches) {
        // Mouse enter dropdown container
        dropdownContainer.addEventListener('mouseenter', function() {
            clearTimeout(timeout);
            trigger.classList.add('active');
            subMenu.classList.add('active');
        });
        
        // Mouse leave dropdown container
        dropdownContainer.addEventListener('mouseleave', function() {
            timeout = setTimeout(() => {
                // Only close if it wasn't clicked open
                if (!trigger.classList.contains('clicked')) {
                    trigger.classList.remove('active');
                    subMenu.classList.remove('active');
                }
            }, delay);
        });
        
        // Keep menu open when moving from trigger to submenu
        subMenu.addEventListener('mouseenter', function() {
            clearTimeout(timeout);
        });
    }

    // Function to close submenu when clicking outside
    function closeSubmenuOnClickOutside(e) {
        if (!dropdownContainer.contains(e.target)) {
            trigger.classList.remove('active', 'clicked');
            subMenu.classList.remove('active');
            document.removeEventListener('click', closeSubmenuOnClickOutside);
        }
    }
    trigger.addEventListener('mousedown', function() {
        this.classList.add('clicked');
    });
}

function handleRoomTabSelection() {
    // Check if we're on the rooms.html page
    if (window.location.pathname.includes('rooms.html')) {
        // Get the room parameter from URL
        const urlParams = new URLSearchParams(window.location.search);
        const roomParam = urlParams.get('room');
        
        // If a room parameter exists, open that tab
        if (roomParam) {
            openRoom(roomParam);
            
            // Also update the active tab button
            const tabs = document.querySelectorAll('.tab');
            tabs.forEach(tab => {
                tab.classList.remove('active');
                if (tab.getAttribute('onclick').includes(`'${roomParam}'`)) {
                    tab.classList.add('active');
                }
            });
        }
    }
}

function openRoom(roomId) {
    // Hide all tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Show the selected tab content
    const selectedTab = document.getElementById(roomId);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
}