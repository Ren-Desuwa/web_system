const express = require('express');
const app = express();
const port = 3000;

// Middleware to parse JSON request bodies
app.use(express.json());

// Pseudo-database
const database = {
    users: [
        { username: 'admin', password: 'admin', role: 'admin' },
        { username: 'user1', password: 'password1', role: 'user' }
    ],
    schedules: {
        admin: ['Admin Task 1', 'Admin Task 2'],
        user: ['User Task 1', 'User Task 2']
    }
};

// Endpoint to validate login
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const user = database.users.find(u => u.username === username && u.password === password);
    if (user) {
        res.json({ success: true, role: user.role });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

// Endpoint to get schedules
app.get('/schedules/:role', (req, res) => {
    const { role } = req.params;

    if (database.schedules[role]) {
        res.json({ success: true, schedules: database.schedules[role] });
    } else {
        res.status(404).json({ success: false, message: 'Schedules not found' });
    }
});

// Endpoint to add a new user
app.post('/add-user', (req, res) => {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const userExists = database.users.some(u => u.username === username);
    if (userExists) {
        return res.status(400).json({ success: false, message: 'User already exists' });
    }

    database.users.push({ username, password, role });
    res.json({ success: true, message: 'User added successfully' });
});

// Endpoint to remove a user
app.delete('/remove-user/:username', (req, res) => {
    const { username } = req.params;

    const userIndex = database.users.findIndex(u => u.username === username);
    if (userIndex === -1) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    database.users.splice(userIndex, 1);
    res.json({ success: true, message: 'User removed successfully' });
});

// Endpoint to add a schedule
app.post('/add-schedule', (req, res) => {
    const { role, task } = req.body;

    if (!role || !task) {
        return res.status(400).json({ success: false, message: 'Role and task are required' });
    }

    if (!database.schedules[role]) {
        database.schedules[role] = [];
    }

    database.schedules[role].push(task);
    res.json({ success: true, message: 'Schedule added successfully' });
});

// Endpoint to remove a schedule
app.delete('/remove-schedule', (req, res) => {
    const { role, task } = req.body;

    if (!role || !task) {
        return res.status(400).json({ success: false, message: 'Role and task are required' });
    }

    if (!database.schedules[role]) {
        return res.status(404).json({ success: false, message: 'Role not found' });
    }

    const taskIndex = database.schedules[role].indexOf(task);
    if (taskIndex === -1) {
        return res.status(404).json({ success: false, message: 'Task not found' });
    }

    database.schedules[role].splice(taskIndex, 1);
    res.json({ success: true, message: 'Schedule removed successfully' });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
