async function loadRoomsPage() {
    const list = document.getElementById('rooms-list');

    try {
        const response = await fetch('rooms.json');

        if (!response.ok) {
            throw new Error(
                `Не вдалося завантажити rooms.json: ${response.status}`
            );
        }

        const data = await response.json();

        document.title = `Sleeport hotel — ${data.title || 'Номерний фонд'}`;

        document.getElementById('rooms-title').textContent =
            data.title || 'Номерний фонд';

        document.getElementById('common-title').textContent =
            data.commonTitle || 'Стандартна комплектація номерів';

        document.getElementById('common-description').textContent =
            data.commonDescription || '';

        document.getElementById('common-note').textContent =
            data.commonNote || '';

        document.getElementById('add-note').textContent =
            data.addNote || '';

        document.getElementById('rooms-bottom-note').textContent =
            data.bottomNote || '';

        document.getElementById('contacts-link').textContent =
            data.contactsLinkText || 'Контакти готелю ↗';

        const commonFeatures = document.getElementById('common-features');
        commonFeatures.replaceChildren();

        (data.commonFeatures || []).forEach(feature => {
            const item = document.createElement('li');
            item.textContent = feature;
            commonFeatures.appendChild(item);
        });

        list.replaceChildren();

        const visibleRooms = (data.rooms || []).filter(
            room => room.visible !== false
        );

        if (visibleRooms.length === 0) {
            list.textContent = 'Наразі категорії номерів не опубліковані.';
            return;
        }

        visibleRooms.forEach(room => {
            const article = document.createElement('article');
            article.className = 'room-card';

            const detailsUrl = `room-details.html?category=${encodeURIComponent(room.id || '')}`;

            const photoLink = document.createElement('a');
            photoLink.className = 'room-photo';
            photoLink.href = detailsUrl;
            photoLink.setAttribute('aria-label', `Детальніше про номер ${room.name || ''}`);

            const img = document.createElement('img');
            img.src = room.image || '';
            img.alt = room.imageAlt || room.name || 'Номер готелю';
            img.loading = 'lazy';

            photoLink.appendChild(img);

            const info = document.createElement('div');
            info.className = 'room-info';

            const category = document.createElement('span');
            category.className = 'room-category';
            category.textContent = `${String(room.number || '').padStart(2, '0')} / КАТЕГОРІЯ`;

            const title = document.createElement('h2');
            const titleLink = document.createElement('a');
            titleLink.href = detailsUrl;
            titleLink.textContent = room.name || '';
            titleLink.style.color = 'inherit';
            titleLink.style.textDecoration = 'none';
            title.appendChild(titleLink);

            const description = document.createElement('p');
            description.className = 'room-description content-text';
            description.textContent = room.description || '';

            const listTitle = document.createElement('p');
            listTitle.className = 'room-list-title';
            listTitle.textContent = 'У номері:';

            const features = document.createElement('ul');
            features.className = 'room-features';

            (room.features || []).forEach(feature => {
                const li = document.createElement('li');
                li.textContent = feature;
                features.appendChild(li);
            });

            const price = document.createElement('div');
            price.className = 'room-price';

            const amount = document.createElement('strong');

            if (
                room.price !== null &&
                room.price !== undefined &&
                room.price !== '' &&
                Number.isFinite(Number(room.price))
            ) {
                amount.textContent =
                    `${new Intl.NumberFormat('uk-UA').format(Number(room.price))} ${data.currency || 'грн'}`;
            } else {
                amount.textContent = 'Уточнюйте ціну';
            }

            const period = document.createElement('span');
            period.textContent = ` / ${data.pricePeriod || 'доба'}`;

            price.append(amount, period);

            const actions = document.createElement('div');
            actions.className = 'room-actions';

            const details = document.createElement('a');
            details.className = 'room-details-button';
            details.href = detailsUrl;
            details.textContent = 'Детальніше';

            const booking = document.createElement('a');
            booking.className = 'room-book-button';
            booking.href = `booking.html?room=${encodeURIComponent(room.id || '')}`;
            booking.textContent = 'Забронювати';

            actions.append(details, booking);

            info.append(
                category,
                title,
                description,
                listTitle,
                features,
                price,
                actions
            );

            article.append(photoLink, info);
            list.appendChild(article);
        });

    } catch (error) {
        console.error(error);

        list.textContent =
            'Не вдалося завантажити інформацію про номери. ' +
            'Перевірте, чи сайт відкрито через вебсервер ' +
            'і чи доступний файл rooms.json.';
    }
}

document.addEventListener('DOMContentLoaded', loadRoomsPage);