function copyPhone(phone) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(phone);
    } else {
        window.prompt("Скопіюйте номер телефону:", phone);
    }
}

class SiteHeader extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <header class="header">
            <div class="top-bar">
                <div class="top-bar-container">
                    <div class="phone-numbers">
                        <button class="phone-copy" onclick="copyPhone('+380 96 375 95 30')">
                            +380 96 375 95 30
                        </button>
                        <button class="phone-copy secondary-phone" onclick="copyPhone('+380 66 252 77 27')">
                            +380 66 252 77 27
                        </button>
                    </div>
                    <div class="language-switch">
                        <a href="index.html" class="active">UA</a>
                        <span>|</span>
                        <a href="en/index.html" id="en-lang-link">EN</a>
                    </div>
                </div>
            </div>

            <div class="main-header">
                <div class="header-container">
                    <a href="index.html" class="logo">Sleeport</a>
                    
                    <nav class="navigation" id="main-navigation">
                        <a href="about.html">Про нас</a>
                        <a href="rooms.html">Номерний фонд</a>
                        <a href="galery.html">Галерея</a>
                        <a href="breakfast.html">Сніданки</a>
                        <a href="coop.html">Для корпоративних клієнтів</a>
                        <a href="contacts.html">Контакти</a>
                        <a href="rules.html">Правила готелю</a>
                        <a href="booking.html" class="mobile-booking-link">Забронювати номер</a>
                    </nav>

                    <div class="header-actions">
                        <a href="booking.html" class="booking-button desktop-booking-button">Забронювати</a>
                        <button class="burger-menu-btn" id="burger-btn" type="button" aria-label="Відкрити меню" aria-expanded="false">
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
        const enLink = this.querySelector("#en-lang-link");
        if (!enLink) return;

        let targetEnFile = currentFile;
        if (currentFile === "galery.html") {
            targetEnFile = "gallery.html";
        }

        const queryString = window.location.search || "";
        enLink.setAttribute("href", `en/${targetEnFile}${queryString}`);
    }
}

class SiteFooter extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <footer class="footer">
            <div class="footer-container">
                <div class="footer-column footer-about">
                    <a href="index.html" class="footer-logo">Sleeport</a>
                    <p>Комфортний відпочинок<br>та затишок у кожній деталі.</p>
                </div>

                <div class="footer-column">
                    <h3>Навігація</h3>
                    <a href="about.html">Про нас</a>
                    <a href="rooms.html">Номерний фонд</a>
                    <a href="galery.html">Галерея</a>
                    <a href="breakfast.html">Сніданки</a>
                    <a href="coop.html">Для корпоративних клієнтів</a>
                    <a href="contacts.html">Контакти</a>
                    <a href="rules.html">Правила готелю</a>
                </div>

                <div class="footer-column">
                    <h3>Контакти</h3>
                    <a href="tel:+380963759530">+380 96 375 95 30</a>
                    <a href="tel:+380662527727">+380 66 252 77 27</a>
                    <a href="mailto:sleeporthotelsleeport.dnk@gmail.com">sleeporthotelsleeport.dnk@gmail.com</a>
                    <a href="booking.html">Забронювати номер</a>
                    
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
                    <h3>Наша адреса</h3>
                    <p>м. Дніпро вул. Театральна, буд. 5</p>
                    <a href="contacts.html" class="footer-map-link">Як нас знайти</a>
                </div>
            </div>

            <div class="footer-bottom">
                <p>© 2026 Sleeport. Усі права захищено.</p>
                <a href="rules.html">Правила проживання та бронювання</a>
                <a href="privacy.html">Політика конфіденційності</a>
            </div>
        </footer>
        `;
    }
}

customElements.define("site-header", SiteHeader);
customElements.define("site-footer", SiteFooter);