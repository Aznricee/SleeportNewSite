document.addEventListener("DOMContentLoaded", async () => {
    const loadingEl = document.getElementById("details-loading");
    const errorEl = document.getElementById("details-error");
    const contentEl = document.getElementById("details-content");

    const urlParams = new URLSearchParams(window.location.search);
    const categoryId = urlParams.get("category");

    if (!categoryId) {
        showError();
        return;
    }

    try {
        const response = await fetch("rooms.json");
        if (!response.ok) {
            throw new Error(`Помилка отримання rooms.json: ${response.status}`);
        }

        const data = await response.json();
        const room = (data.rooms || []).find(r => r.id === categoryId);

        if (!room) {
            showError();
            return;
        }

        renderRoomDetails(room, data);

        loadingEl.style.display = "none";
        contentEl.style.display = "block";
    } catch (err) {
        console.error(err);
        showError();
    }

    function showError() {
        loadingEl.style.display = "none";
        contentEl.style.display = "none";
        errorEl.style.display = "block";
    }

    function renderRoomDetails(room, globalData) {
        document.title = `Sleeport hotel — ${room.name}`;

        document.getElementById("room-category-badge").textContent =
            `${String(room.number || "").padStart(2, "0")} / КАТЕГОРІЯ НОМЕРА`;
        document.getElementById("room-title").textContent = room.name || "";
        document.getElementById("room-short-desc").textContent = room.description || "";
        document.getElementById("room-full-description").textContent =
            room.fullDescription || room.description || "";

        document.getElementById("spec-capacity").textContent = room.capacity || "1–2 гостя";
        document.getElementById("spec-area").textContent = room.area ? `${room.area} м²` : "Затишна";
        document.getElementById("spec-bed").textContent = room.bedType || "Комфортне спальне місце";

        const currency = globalData.currency || "грн";
        const priceFormatted = Number.isFinite(Number(room.price))
            ? `${new Intl.NumberFormat("uk-UA").format(Number(room.price))} ${currency}`
            : "Уточнюйте ціну";

        document.getElementById("spec-price").textContent = priceFormatted;
        document.getElementById("sidebar-price-val").textContent = priceFormatted;

        const bookingBtn = document.getElementById("book-room-btn");
        bookingBtn.href = `booking.html?room=${encodeURIComponent(room.id)}`;

        const amenitiesList = document.getElementById("room-amenities");
        amenitiesList.replaceChildren();

        const combinedAmenities = room.amenities && room.amenities.length > 0
            ? room.amenities
            : [...(globalData.commonFeatures || []), ...(room.features || [])];

        combinedAmenities.forEach(feature => {
            const li = document.createElement("li");
            li.textContent = feature;
            amenitiesList.appendChild(li);
        });

        setupGallery(room);
        injectDynamicRoomSchema(room, globalData);
    }

    function setupGallery(room) {
        const mainImg = document.getElementById("main-view-image");
        const thumbsContainer = document.getElementById("gallery-thumbs");
        thumbsContainer.replaceChildren();

        const images = (room.gallery && room.gallery.length > 0)
            ? room.gallery
            : [room.image];

        mainImg.src = images[0] || room.image || "";
        mainImg.alt = room.imageAlt || room.name;

        mainImg.addEventListener("click", () => {
            openLightbox(mainImg.src, room.name);
        });

        images.forEach((imgSrc, index) => {
            const thumbBtn = document.createElement("button");
            thumbBtn.type = "button";
            thumbBtn.className = `details-thumb-btn ${index === 0 ? "active" : ""}`;

            const thumbImg = document.createElement("img");
            thumbImg.src = imgSrc;
            thumbImg.alt = `${room.name} — фото ${index + 1}`;
            thumbImg.loading = "lazy";

            thumbBtn.appendChild(thumbImg);

            thumbBtn.addEventListener("click", () => {
                mainImg.src = imgSrc;
                thumbsContainer.querySelectorAll(".details-thumb-btn").forEach(btn => {
                    btn.classList.remove("active");
                });
                thumbBtn.classList.add("active");
            });

            thumbsContainer.appendChild(thumbBtn);
        });
    }

    function injectDynamicRoomSchema(room, globalData) {
        const existingScript = document.getElementById("room-schema-jsonld");
        if (existingScript) existingScript.remove();

        const schemaData = {
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        {
                            "@type": "ListItem",
                            "position": 1,
                            "name": "Головна",
                            "item": "https://sleeport.dp.ua/"
                        },
                        {
                            "@type": "ListItem",
                            "position": 2,
                            "name": "Номерний фонд",
                            "item": "https://sleeport.dp.ua/rooms.html"
                        },
                        {
                            "@type": "ListItem",
                            "position": 3,
                            "name": room.name,
                            "item": window.location.href
                        }
                    ]
                },
                {
                    "@type": "HotelRoom",
                    "@id": `${window.location.href}#room`,
                    "name": room.name,
                    "description": room.fullDescription || room.description,
                    "bed": room.bedType,
                    "occupancy": {
                        "@type": "QuantitativeValue",
                        "value": parseInt(room.capacity, 10) || 2
                    },
                    "floorSize": {
                        "@type": "QuantitativeValue",
                        "value": parseInt(room.area, 10) || 16,
                        "unitCode": "MTK"
                    },
                    "partOf": {
                        "@type": "Hotel",
                        "name": "Sleeport Hotel",
                        "url": "https://sleeport.dp.ua/"
                    },
                    "offers": {
                        "@type": "Offer",
                        "price": room.price,
                        "priceCurrency": "UAH",
                        "availability": "https://schema.org/InStock",
                        "url": `https://sleeport.dp.ua/booking.html?room=${encodeURIComponent(room.id)}`
                    }
                }
            ]
        };

        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.id = "room-schema-jsonld";
        script.textContent = JSON.stringify(schemaData);
        document.head.appendChild(script);
    }

    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    const lightboxCaption = document.getElementById("lightbox-caption");
    const lightboxClose = document.getElementById("lightbox-close");

    function openLightbox(src, caption) {
        lightboxImg.src = src;
        lightboxCaption.textContent = caption || "";
        lightbox.classList.add("active");
        document.body.style.overflow = "hidden";
    }

    function closeLightbox() {
        lightbox.classList.remove("active");
        lightboxImg.src = "";
        document.body.style.overflow = "";
    }

    if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
    if (lightbox) {
        lightbox.addEventListener("click", (e) => {
            if (e.target === lightbox) closeLightbox();
        });
    }
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && lightbox.classList.contains("active")) {
            closeLightbox();
        }
    });
});