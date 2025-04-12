// controller.js

const db = require(".database.js");

const controller = {
    validateUser(name, password) {
        const user = db.users.find(u => u.name === name && u.password === password);
        if (!user) {
            console.log("Invalid username or password.");
            return false;
        }
    return true;
    },

    isAdmin(userId) {
        const user = db.getUserById(userId);
        return user && user.role === "admin";
    },

    createSchedule(userId, date, room, timeStart, meridianStart, timeEnd, meridianEnd, subject, professor) {
        const user = db.getUserById(userId);
        if (!user) {
            console.log("User not found.");
            return null;
        }
        const schedule = db.addSchedule(userId, date, room, timeStart, meridianStart, timeEnd, meridianEnd, subject, professor);
        console.log("Schedule added:", schedule);
        return schedule;
    },

    viewSchedules(userId) {
        const user = db.getUserById(userId);
        if (!user) {
            console.log("User not found.");
            return [];
        }
        const schedules = db.getSchedulesByUserId(userId);
        console.log(`Schedules for ${user.name}:`, schedules);
        return schedules;
    },

    removeSchedule(scheduleId) {
        const success = db.deleteSchedule(scheduleId);
        if (success) {
            console.log("Schedule deleted.");
        } else {
            console.log("Schedule not found.");
        }
        return success;
    }
};

module.exports = controller;
