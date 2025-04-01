document.addEventListener('DOMContentLoaded', () => {
    const getStartedButton = document.getElementById('getStartedButton');
    const loginDiv = document.getElementById('loginDiv');
    const overlay = document.getElementById('overlay');
    const loginForm = document.getElementById('loginForm');
    const inputs = loginForm.querySelectorAll('input');
    let hasTransitioned = false;

    // Show the login div and overlay when "Get Started" is clicked
    getStartedButton.addEventListener('click', () => {
        loginDiv.style.display = 'block';
        overlay.classList.add('active');
        setTimeout(() => {
            loginDiv.classList.add('transitioned'); // Add the transition class after making it visible
        }, 10); // Small delay to ensure the transition is applied
    });

    // Hide the login div and overlay when clicking outside the login
    overlay.addEventListener('click', () => {
        loginDiv.style.display = 'none';
        overlay.classList.remove('active');
        loginDiv.classList.remove('transitioned');
        hasTransitioned = false; // Reset transition state
    });

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

    const sched = document.getElementById('schedule');
    const ground = document.getElementById('ground');
    sched.style.borderRadius = isChecked ? '0 5px 5px 5px' : '5px';

    function updateBorderRadius() {
        sched.style.borderRadius = ground.checked ? '0 5px 5px 5px' : '5px';
    }

    updateBorderRadius();

    ground.addEventListener('change', updateBorderRadius);
    
    // Trigger initial state
    document.querySelector('.tab-container input[type="radio"]:checked').dispatchEvent(new Event('change'));
});
