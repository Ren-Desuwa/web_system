/**
 * Schedule and Admin page specific JavaScript
 * Handles room management, reservations, and admin approvals
 */

// Initialize page-specific functionality
document.addEventListener("DOMContentLoaded", () => {
    const role = sessionStorage.getItem("role");
    
    // Only run this code on pages with rooms
    if (document.querySelectorAll(".room[id]").length > 0) {
        // Update room status
        updateRoomStatus();
        
        // Add click events to rooms
        document.querySelectorAll(".room[id]").forEach(room => {
            if (room.id === "room-MIS") return; // Skip MIS room
            
            room.addEventListener("click", () => {
                if (role === "admin") {
                    showRoomRequests(room.id);
                } else {
                    showReservationForm(room.id);
                }
            });
        });
        
        // Setup modals
        setupModals();
        
        // Start clock if needed
        if (document.getElementById('currentTime')) {
            updateDateTime();
            setInterval(updateDateTime, 1000);
        }
    }
});

// Room status management
function updateRoomStatus() {
    // This function updates all rooms with their statuses
    const role = sessionStorage.getItem("role");
    
    // Group schedules by room
    const schedulesByRoom = {};
    Database.schedules.forEach(schedule => {
        const roomId = schedule.room.toLowerCase();
        if (!schedulesByRoom[roomId]) {
            schedulesByRoom[roomId] = [];
        }
        schedulesByRoom[roomId].push(schedule);
    });

    // Update each room with request/reservation count
    document.querySelectorAll(".room[id]").forEach(room => {
        const roomId = room.id.toLowerCase();
        if (roomId === "room-mis") return; // Skip MIS room

        const schedules = schedulesByRoom[roomId] || [];
        const count = schedules.length;
        
        const roomHeader = room.querySelector("h1");
        const roomName = getRoomName(roomId);
        
        if (role === "admin") {
            // Admin view
            roomHeader.textContent = `${roomName} (${count} Requests)`;
            room.classList.toggle("has-requests", count > 0);
        } else {
            // User view
            if (count === 0) {
                room.classList.add("Availability");
                roomHeader.textContent = `${roomName} (Available)`;
            } else {
                room.classList.remove("Availability");
                roomHeader.textContent = `${roomName} (${count} Reservations)`;
            }
        }
    });
}

// Setup modal functionality
function setupModals() {
    // Request modal (admin)
    const requestModal = document.getElementById("requestModal");
    if (requestModal) {
        document.getElementById("closeRequestModal")?.addEventListener("click", () => {
            requestModal.classList.remove("active");
        });
        
        requestModal.addEventListener("click", (e) => {
            if (e.target === requestModal) {
                requestModal.classList.remove("active");
            }
        });
    }
    
    // Reservation modal (user)
    const reservationModal = document.getElementById("reservationModal");
    if (reservationModal) {
        document.getElementById("closeReservationModal")?.addEventListener("click", () => {
            reservationModal.classList.remove("active");
        });
        
        reservationModal.addEventListener("click", (e) => {
            if (e.target === reservationModal) {
                reservationModal.classList.remove("active");
            }
        });
        
        // Handle reservation form submission
        document.getElementById("reserveForm")?.addEventListener("submit", handleReservationSubmit);
    }
}

// ADMIN FUNCTIONS

function showRoomRequests(roomId) {
    const modal = document.getElementById("requestModal");
    const modalTitle = document.getElementById("modalRoomTitle");
    const requestsList = document.getElementById("requestsList");
    
    // Clear previous requests
    requestsList.innerHTML = "";
    
    // Update title
    const roomName = getRoomName(roomId);
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
        
        // Add event listeners to buttons
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

function acceptRequest(scheduleId) {
    const schedule = Database.schedules.find(s => s.id === scheduleId);
    if (schedule) {
        alert(`Reservation for ${schedule.subject} has been accepted!`);
        // In a real system, you might update a status field instead of removing
        updateRequestDisplay(scheduleId, true);
    }
}

function declineRequest(scheduleId) {
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
            
            // Update the room status
            updateRoomStatus();
        }, 500); // Match the animation duration
    }
}

// USER FUNCTIONS

function showReservationForm(roomId) {
    // Update modal title
    const roomName = getRoomName(roomId);
    document.getElementById("reservationRoomTitle").textContent = `${roomName} - Reservation`;
    
    // Set the hidden room ID field
    document.getElementById("roomId").value = roomId;
    
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById("date").value = today;
    document.getElementById("date").min = today;
    
    // Load existing reservations for this room
    loadRoomReservations(roomId);
    
    // Show the modal
    document.getElementById("reservationModal").classList.add("active");
}

function loadRoomReservations(roomId) {
    const reservationsContainer = document.getElementById("roomReservations");
    reservationsContainer.innerHTML = "";
    
    // Get schedules for this room
    const roomSchedules = Database.schedules.filter(
        schedule => schedule.room.toLowerCase() === roomId.toLowerCase()
    );
    
    if (roomSchedules.length === 0) {
        reservationsContainer.innerHTML = "<p class='no-reservations'>No current reservations for this room.</p>";
    } else {
        // Sort schedules by date and time
        roomSchedules.sort((a, b) => {
            if (a.date !== b.date) return new Date(a.date) - new Date(b.date);
            
            // Compare times
            const timeA = convertTo24Hour(a.timeStart, a.meridianStart);
            const timeB = convertTo24Hour(b.timeStart, b.meridianStart);
            return timeA - timeB;
        });
        
        // Create a list of reservations
        roomSchedules.forEach(schedule => {
            const user = Database.getUserById(schedule.userId);
            const reservationItem = document.createElement("div");
            reservationItem.className = "reservation-item";
            
            reservationItem.innerHTML = `
                <div class="reservation-details">
                    <p class="reservation-date">${schedule.date}</p>
                    <p class="reservation-subject">${schedule.subject}</p>
                    <p class="reservation-time">${schedule.timeStart} ${schedule.meridianStart} - ${schedule.timeEnd} ${schedule.meridianEnd}</p>
                    <p class="reservation-user">By: ${user ? user.name : 'Unknown'}</p>
                </div>
            `;
            
            reservationsContainer.appendChild(reservationItem);
        });
    }
}

function isTimeAvailable(roomId, date, startTime, startMeridian, endTime, endMeridian) {
    // Get existing schedules for this room and date
    const existingSchedules = Database.schedules.filter(
        schedule => schedule.room.toLowerCase() === roomId.toLowerCase() && schedule.date === date
    );
    
    if (existingSchedules.length === 0) return true;
    
    // Convert times to minutes from midnight for easier comparison
    const newStart = convertTo24Hour(startTime, startMeridian);
    const newEnd = convertTo24Hour(endTime, endMeridian);
    
    // Check for overlap with any existing schedule
    for (const schedule of existingSchedules) {
        const existingStart = convertTo24Hour(schedule.timeStart, schedule.meridianStart);
        const existingEnd = convertTo24Hour(schedule.timeEnd, schedule.meridianEnd);
        
        // Check for overlap
        if (!(newEnd <= existingStart || newStart >= existingEnd)) {
            return false; // There is an overlap
        }
    }
    
    return true; // No overlap found
}

function handleReservationSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const userId = parseInt(sessionStorage.getItem("userId"));
    const roomId = form.roomId.value;
    const date = form.date.value;
    const subject = form.subject.value;
    const professor = form.professor.value;
    const timeStart = form.timeStart.value;
    const meridianStart = form.meridianStart.value;
    const timeEnd = form.timeEnd.value;
    const meridianEnd = form.meridianEnd.value;
    
    // Validate times
    if (!isValidTimeFormat(timeStart) || !isValidTimeFormat(timeEnd)) {
        alert("Please enter valid times in HH:MM format (e.g., 9:30, 11:00)");
        return;
    }
    
    // Check for time conflict
    if (!isTimeAvailable(roomId, date, timeStart, meridianStart, timeEnd, meridianEnd)) {
        alert("This time slot conflicts with an existing reservation. Please choose a different time.");
        return;
    }
    
    // Create the schedule
    Database.createSchedule(
        userId,
        date,
        roomId,
        timeStart,
        meridianStart,
        timeEnd,
        meridianEnd,
        subject,
        professor
    );
    
    alert("Your reservation request has been submitted and is pending approval.");
    form.reset();
    document.getElementById("reservationModal").classList.remove("active");
    
    // Update room status
    updateRoomStatus();
}