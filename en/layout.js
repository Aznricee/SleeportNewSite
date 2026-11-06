function copyPhone(phone) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(phone);
    } else {
        window.prompt("Copy phone number:", phone);
    }
}

class SiteHeaderEn extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <header class="header">
            <div class="top-bar">
                <div class="top-bar-container">
                    <div class="phone-numbers">
                        <a href="mailto:sleeporthotelsleeport.dnk@gmail.com">sleeporthotelsleeport.dnk@gmail.com</a>
                        <button class="phone-copy" onclick="copyPhone('+380 96 375 95 30')">
                            +380 96 375 95 30
                        </button>
                        <button class="phone-copy secondary-phone" onclick="copyPhone('+380 66 252 77 27')">
                            +380 66 252 77 27
                        </button>
                    </div>
                    <div class="language-switch">
                        <a href="../index.html" id="ua-lang-link">UA</a>
                        <span>|</span>
                        <a href="index.html" class="active">EN</a>
                    </div>
                </div>
            </div>

            <div class="main-header">
                <div class="header-container">
                    <a href="index.html" class="logo">Sleeport</a>
                    
                    <nav class="navigation" id="main-navigation">
                        <a href="about.html">About Us</a>
                        <a href="rooms.html">Room Inventory</a>
                        <a href="gallery.html">Gallery</a>
                        <a href="breakfast.html">Breakfast</a>
                        <a href="coop.html">Corporate Clients</a>
                        <a href="contacts.html">Contacts</a>
                        <a href="rules.html">Hotel Rules</a>
                        <a href="booking.html" class="mobile-booking-link">Book a Room</a>
                    </nav>

                    <div class="header-actions">
                        <a href="booking.html" class="booking-button desktop-booking-button">Book Now</a>
                        <button class="burger-menu-btn" id="burger-btn" type="button" aria-label="Open menu" aria-expanded="false">
                            <span class="burger-line"></span>
                            <span class="burger-line"></span>
                            <span class="burger-line"></span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
        `;

        this.initMobileMenu();
        this.highlightActiveLink();
        this.setupLanguageSwitcher();
    }

    initMobileMenu() {
        const burgerBtn = this.querySelector("#burger-btn");
        const navigation = this.querySelector("#main-navigation");

        if (!burgerBtn || !navigation) return;

        const toggleMenu = (open) => {
            const shouldOpen = open !== undefined ? open : !navigation.classList.contains("open");
            navigation.classList.toggle("open", shouldOpen);
            burgerBtn.classList.toggle("active", shouldOpen);
            burgerBtn.setAttribute("aria-expanded", String(shouldOpen));
            document.body.classList.toggle("menu-locked", shouldOpen);
        };

        burgerBtn.addEventListener("click", () => toggleMenu());

        navigation.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => toggleMenu(false));
        });

        window.addEventListener("resize", () => {
            if (window.innerWidth > 992 && navigation.classList.contains("open")) {
                toggleMenu(false);
            }
        });
    }

    highlightActiveLink() {
        const currentFile = window.location.pathname.split("/").pop() || "index.html";
        const links = this.querySelectorAll(".navigation a");
        links.forEach(link => {
            if (link.getAttribute("href") === currentFile) {
                link.classList.add("active");
                link.style.fontWeight = "600";
            }
        });
    }

    setupLanguageSwitcher() {
        const currentFile = window.location.pathname.split("/").pop() || "index.html";
        const uaLink = this.querySelector("#ua-lang-link");
        if (!uaLink) return;

        let targetUaFile = currentFile;
        if (currentFile === "gallery.html") {
            targetUaFile = "galery.html";
        }

        const queryString = window.location.search || "";
        uaLink.setAttribute("href", `../${targetUaFile}${queryString}`);
    }
}

class SiteFooterEn extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <footer class="footer">
            <div class="footer-container">
                <div class="footer-column footer-about">
                    <a href="index.html" class="footer-logo">Sleeport</a>
                    <p>Comfortable stay<br>and coziness in every detail.</p>
                </div>

                <div class="footer-column">
                    <h3>Navigation</h3>
                    <a href="about.html">About Us</a>
                    <a href="rooms.html">Room Inventory</a>
                    <a href="gallery.html">Gallery</a>
                    <a href="breakfast.html">Breakfast</a>
                    <a href="coop.html">Corporate Clients</a>
                    <a href="contacts.html">Contacts</a>
                    <a href="rules.html">Hotel Rules</a>
                </div>

                <div class="footer-column">
                    <h3>Contacts</h3>
                    <a href="tel:+380963759530">+380 96 375 95 30</a>
                    <a href="tel:+380662527727">+380 66 252 77 27</a>
                    <a href="mailto:sleeporthotelsleeport.dnk@gmail.com">sleeporthotelsleeport.dnk@gmail.com</a>
                    <a href="booking.html">Book a Room</a>
                    
                    <div class="footer-messengers" style="display: flex; gap: 12px; margin-top: 6px;">
                        <a href="https://t.me/HotelSleeport" target="_blank" rel="noopener noreferrer" style="color: #64b5f6; font-weight: 500;">
                            Telegram ↗
                        </a>
                        <span style="color: rgba(255,255,255,0.3);">|</span>
                        <a href="viber://chat?number=%2B380963759530" target="_blank" rel="noopener noreferrer" style="color: #b39ddb; font-weight: 500;">
                            Viber ↗
                        </a>
                    </div>
                </div>

                <div class="footer-column">
                    <h3>Our Address</h3>
                    <p>Dnipro, 5 Teatralna Str.</p>
                    <div class="footer-map-wrapper">
                        <iframe
                            src="https://www.google.com/maps?q=м.+Дніпро,+вул.+Театральна,+5&output=embed"
                            allowfullscreen=""
                            loading="lazy"
                            referrerpolicy="no-referrer-when-downgrade"
                            title="Sleeport Hotel Location on Google Maps">
                        </iframe>
                    </div>
                </div>
            </div>

            <div class="footer-bottom">
                <p>© 2026 Sleeport. All rights reserved.</p>
                <a href="rules.html">Accommodation & Booking Rules</a>
                <a href="privacy.html">Privacy Policy</a>
            </div>
        </footer>
        `;
    }
}

customElements.define("site-header", SiteHeaderEn);
customElements.define("site-footer", SiteFooterEn);