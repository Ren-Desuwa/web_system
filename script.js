function changeCardColors() {
    const cards = document.querySelectorAll('.dropdown');
    const isChecked = document.getElementById('checkbox').checked;
    cards.forEach(card => {
        card.style.backgroundColor = isChecked ? '#e7a572' : '#23325a';
    });
}

const button = document.getElementById("glowButton");
let stars = [];

button.addEventListener("mouseover", () => {
    removeStars();
    for (let i = 0; i < 5; i++) { 
        let star = document.createElement("div");
        star.classList.add("stars");
        if (Math.random() > 0.5) star.classList.add("large");
        document.body.appendChild(star);

        let buttonRect = button.getBoundingClientRect();
        let startX = Math.random() * buttonRect.width + buttonRect.left;
        let startY = Math.random() * buttonRect.height + buttonRect.top;
                
        star.style.left = `${startX}px`;
        star.style.top = `${startY}px`;

        setTimeout(() => {
            let angle = Math.random() * 2 * Math.PI;
            let distance = Math.random() * 50 + 20;
            let moveX = Math.cos(angle) * distance;
            let moveY = Math.sin(angle) * distance;
            star.style.transform = `rotate(45deg) translate(${moveX}px, ${moveY}px)`;
            star.style.opacity = "1";
        }, 50);
                
        stars.push(star);
    }
});

button.addEventListener("mouseleave", () => {
    removeStars();
});

function removeStars() {
    stars.forEach(star => {
        star.style.opacity = "0";
        setTimeout(() => star.remove(), 500);
    });
    stars = []; 
}