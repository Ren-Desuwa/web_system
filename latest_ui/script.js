document.addEventListener('DOMContentLoaded', () => {
    const loginModal = document.querySelector('.login');
    const overlay = document.querySelector('.overlay');
    const loginButtons = document.querySelectorAll('.login-button, .get_started');

    loginButtons.forEach(button => {
        button.addEventListener('click', () => {
            loginModal.style.display = 'block';
            overlay.classList.add('active');
            setTimeout(() => {
                loginModal.classList.add('transitioned');
            }, 10);
        });
    });

    overlay.addEventListener('click', () => {
        loginModal.classList.remove('transitioned');
        setTimeout(() => {
            loginModal.style.display = 'none';
            overlay.classList.remove('active');
        }, 500);
    });

    const loginDiv = document.getElementById('loginDiv');
    const loginForm = document.getElementById('loginForm');
    const inputs = loginForm.querySelectorAll('input');
    let hasTransitioned = false;

    // Add a single transition effect for the login container
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            if (!hasTransitioned) {
                loginDiv.classList.add('transitioned');
                hasTransitioned = true;
            }
        });
    });

    // Redirect to schedule.html or admin.html after form submission
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent actual form submission
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

        if (username === '' || password === '') {
            alert('Please fill in both fields.');
        } else if (username === 'admin' && password === 'admin') {
            window.location.href = 'pages/admin.html';
        } else {
            window.location.href = 'pages/schedule.html';
        }
    });

    document.querySelectorAll('.tab-container input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.checked) {
                const scheduleContainer = document.getElementById('scheduleContainer');
                scheduleContainer.innerHTML = `<h2>${this.value} Schedule</h2>`;
                
                // Add visual feedback
                document.querySelectorAll('.tab').forEach(tab => {
                    tab.style.borderBottom = '2px solid transparent';
                });
                this.nextElementSibling.style.borderBottom = '2px solid white';
            }
        });
    });

    const sched = document.getElementsByClassName('schedule');
    const ground = document.getElementById('ground');
    sched.forEach(scheds => {
        ground.addEventListener(checked, () => {
            scheds.style.borderRadius = ground.checked ? '0 5px 5px 5px' : '5px';
        });
    });

    document.getElementsByClassName('ground').forEach((ground) => {
        ground.addEventListener(checked, () => {
            ground.forEach(test => {
                test.style.backgroundColor = ground.checked ? '#e7a572' : '#23325a';
            });
        });
    });
    
    
    // Trigger initial state
    document.querySelector('.tab-container input[type="radio"]:checked').dispatchEvent(new Event('change'));
});


const infoIcon = document.querySelector('.info-icon'); // Select the info-icon
const infoPopup = document.querySelector('.MIS-info-container'); // Select the popup

// Show the popup when the info-icon is clicked
infoIcon.addEventListener('click', () => {
    infoPopup.style.display = 'block';
    setTimeout(() => {
        infoPopup.classList.add('transitioned');
    }, 10);
});

// Optional: Hide the popup when clicking outside of it
window.addEventListener('click', (event) => {
    if (!infoPopup.contains(event.target) && event.target !== infoIcon) {
        infoPopup.classList.remove('transitioned');
        setTimeout(() => {
            infoPopup.style.display = 'none';
        }, 500);
    }
});