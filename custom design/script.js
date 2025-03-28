const button = document.getElementById("glowButton");
        let stars = [];

        button.addEventListener("mouseover", () => {
            removeStars();
            const buttonRect = button.getBoundingClientRect();
            const centerX = buttonRect.left + buttonRect.width / 2;
            const centerY = buttonRect.top + buttonRect.height / 2;

            for (let i = 0; i < 10; i++) { 
                let star = document.createElement("div");
                star.classList.add("stars");
                if (Math.random() > 0.5) star.classList.add("large");
                document.body.appendChild(star);

                const angle = Math.random() * 2 * Math.PI; // Random angle
                const radius = Math.random() * 50 + 20; // Random radius (distance from center)
                const startX = centerX + Math.cos(angle) * radius;
                const startY = centerY + Math.sin(angle) * radius;
                const randomRotation = Math.random() * 360;

                star.style.transform = `rotate(${randomRotation}deg)`;
                star.style.left = `${startX}px`;
                star.style.top = `${startY}px`;

                setTimeout(() => {
                    const moveDistance = Math.random() * 80 + 50;
                    const moveX = Math.cos(angle) * moveDistance * 4.5;
                    const moveY = Math.sin(angle) * moveDistance * 0.5;
                    star.style.transform = `rotate(${randomRotation}deg) translate(${moveX}px, ${moveY}px)`;
                    star.style.opacity = "0";
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