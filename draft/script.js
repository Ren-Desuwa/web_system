const Database = {
    users: [
        { id: 1, name: "Alice", password: "alice12", role: "user" },
        { id: 2, name: "Bob", password: "bobrich123", role: "user" },
        { id: 3, name: "Admin", password: "Admin123", role: "admin" },
        { id: 4, name: "admin", password: "admin", role: "admin" },
        { id: 5, name: "asd", password: "asd", role: "user" }
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

document.getElementById("loginForm").addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent default form submission

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const userIsValid = Database.validateUser(username, password);

    if (userIsValid) {
        alert("Login successful!");

        const userId = Database.getUserId(username);
        const isAdmin = Database.isAdmin(userId);

        // ✅ Store session data
        sessionStorage.setItem("loggedIn", "true");
        sessionStorage.setItem("username", username);
        sessionStorage.setItem("userId", userId);
        sessionStorage.setItem("role", isAdmin ? "admin" : "user");

        // 🔁 Redirect based on role
        if (isAdmin) {
            window.location.href = "../pages/admin.html";
        } else {
            window.location.href = "../pages/schedule.html";
        }
    } else {
        alert("Invalid username or password");
    }
});

function logout() {
    sessionStorage.clear();
    window.location.href = "../pages/login.html";
}


// const user = controller.validateUser("Admin", "admin123");

// if (user) {
//     console.log("Login successful:", user.name);

//     // 2. Check if user is admin
//     if (controller.isAdmin(user.id)) {
//         console.log("User is an admin.");
//     } else {
//         console.log("User is a regular user.");
//     }

//     // // 3. Create a schedule
//     // controller.createSchedule(
//     //     user.id,
//     //     "2025-04-15",
//     //     "Room 202",
//     //     "11:00", "AM",
//     //     "03:00", "PM",
//     //     "Physics",
//     //     "Dr. Newton"
//     // );

//     // // 4. View schedules for user
//     // const schedules = controller.viewSchedules(user.id);
//     // console.log("Schedules:", schedules);

//     // // 5. Remove a schedule (admin only)
//     // controller.removeSchedule(user.id, 1); // Try removing schedule with ID 1
// }