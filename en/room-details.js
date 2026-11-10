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
            throw new Error(`Failed to load rooms.json: ${response.status}`);
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
            `${String(room.number || "").padStart(2, "0")} / ROOM CATEGORY`;
        document.getElementById("room-title").textContent = room.name || "";
        document.getElementById("room-short-desc").textContent = room.description || "";
        document.getElementById("room-full-description").textContent =
            room.fullDescription || room.description || "";

        document.getElementById("spec-capacity").textContent = room.capacity || "1–2 guests";
        document.getElementById("spec-area").textContent = room.area ? `${room.area} m²` : "Cozy";
        document.getElementById("spec-bed").textContent = room.bedType || "Comfortable sleeping setup";

        const currency = globalData.currency || "UAH";
        const priceFormatted = Number.isFinite(Number(room.price))
            ? `${new Intl.NumberFormat("en-US").format(Number(room.price))} ${currency}`
            : "Inquire price";

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
        const prevBtn = document.getElementById("details-prev-btn");
        const nextBtn = document.getElementById("details-next-btn");

        thumbsContainer.replaceChildren();

        const images = (room.gallery && room.gallery.length > 0)
            ? room.gallery
            : [room.image];

        let currentIndex = 0;

        function updateMainView(index) {
            currentIndex = (index + images.length) % images.length;
            mainImg.src = images[currentIndex] || room.image || "";
            mainImg.alt = `${room.name} — photo ${currentIndex + 1}`;

            thumbsContainer.querySelectorAll(".details-thumb-btn").forEach((btn, idx) => {
                btn.classList.toggle("active", idx === currentIndex);
            });
        }

        updateMainView(0);

        if (images.length <= 1) {
            if (prevBtn) prevBtn.style.display = "none";
            if (nextBtn) nextBtn.style.display = "none";
        } else {
            if (prevBtn) {
                prevBtn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    updateMainView(currentIndex - 1);
                });
            }
            if (nextBtn) {
                nextBtn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    updateMainView(currentIndex + 1);
                });
            }
        }

        mainImg.addEventListener("click", () => {
            openLightbox(images, currentIndex, room.name);
        });

        images.forEach((imgSrc, index) => {
            const thumbBtn = document.createElement("button");
            thumbBtn.type = "button";
            thumbBtn.className = `details-thumb-btn ${index === 0 ? "active" : ""}`;

            const thumbImg = document.createElement("img");
            thumbImg.src = imgSrc;
            thumbImg.alt = `${room.name} — photo ${index + 1}`;
            thumbImg.loading = "lazy";

            thumbBtn.appendChild(thumbImg);

            thumbBtn.addEventListener("click", () => {
                updateMainView(index);
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
                            "name": "Home",
                            "item": "https://sleeport.dp.ua/en/"
                        },
                        {
                            "@type": "ListItem",
                            "position": 2,
                            "name": "Rooms",
                            "item": "https://sleeport.dp.ua/en/rooms.html"
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
                        "url": "https://sleeport.dp.ua/en/"
                    },
                    "offers": {
                        "@type": "Offer",
                        "price": room.price,
                        "priceCurrency": "UAH",
                        "availability": "https://schema.org/InStock",
                        "url": `https://sleeport.dp.ua/en/booking.html?room=${encodeURIComponent(room.id)}`
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
    const lightboxPrev = document.getElementById("lightbox-prev-btn");
    const lightboxNext = document.getElementById("lightbox-next-btn");

    let lbImages = [];
    let lbIndex = 0;
    let lbTitle = "";

    function openLightbox(imagesArray, startIndex, captionTitle) {
        lbImages = imagesArray;
        lbIndex = startIndex;
        lbTitle = captionTitle || "";

        updateLightboxView();

        if (lbImages.length <= 1) {
            if (lightboxPrev) lightboxPrev.style.display = "none";
            if (lightboxNext) lightboxNext.style.display = "none";
        } else {
            if (lightboxPrev) lightboxPrev.style.display = "flex";
            if (lightboxNext) lightboxNext.style.display = "flex";
        }

        lightbox.classList.add("active");
        document.body.style.overflow = "hidden";
    }

    function updateLightboxView() {
        lightboxImg.src = lbImages[lbIndex] || "";
        lightboxCaption.textContent = lbImages.length > 1
            ? `${lbTitle} (${lbIndex + 1} of ${lbImages.length})`
            : lbTitle;
    }

    function prevLightboxImage() {
        if (lbImages.length <= 1) return;
        lbIndex = (lbIndex - 1 + lbImages.length) % lbImages.length;
        updateLightboxView();
    }

    function nextLightboxImage() {
        if (lbImages.length <= 1) return;
        lbIndex = (lbIndex + 1) % lbImages.length;
        updateLightboxView();
    }

    function closeLightbox() {
        lightbox.classList.remove("active");
        lightboxImg.src = "";
        document.body.style.overflow = "";
    }

    if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
    if (lightboxPrev) lightboxPrev.addEventListener("click", (e) => {
        e.stopPropagation();
        prevLightboxImage();
    });
    if (lightboxNext) lightboxNext.addEventListener("click", (e) => {
        e.stopPropagation();
        nextLightboxImage();
    });

    if (lightbox) {
        lightbox.addEventListener("click", (e) => {
            if (e.target === lightbox) closeLightbox();
        });
    }

    document.addEventListener("keydown", (e) => {
        if (!lightbox || !lightbox.classList.contains("active")) return;

        if (e.key === "Escape") {
            closeLightbox();
        } else if (e.key === "ArrowLeft") {
            prevLightboxImage();
        } else if (e.key === "ArrowRight") {
            nextLightboxImage();
        }
    });
});