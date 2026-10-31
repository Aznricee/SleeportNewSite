async function loadRoomsPage() {
    const list = document.getElementById('rooms-list');

    try {
        // Завантажуємо дані про номери з JSON-файлу
        const response = await fetch('rooms.json');

        if (!response.ok) {
            throw new Error(
                `Не вдалося завантажити rooms.json: ${response.status}`
            );
        }

        const data = await response.json();

        // Заповнюємо основну інформацію сторінки
        document.title = `Sleeport hotel — ${data.title || 'Номерний фонд'}`;

        document.getElementById('rooms-title').textContent =
            data.title || 'Номерний фонд';

        document.getElementById('common-title').textContent =
            data.commonTitle || '';

        document.getElementById('common-description').textContent =
            data.commonDescription || '';

        document.getElementById('common-note').textContent =
            data.commonNote || '';

            document.getElementById('add-note').textContent =
            data.addNote || '';

        document.getElementById('rooms-bottom-note').textContent =
            data.bottomNote || '';

        document.getElementById('contacts-link').textContent =
            data.contactsLinkText || 'Контакти готелю';

        // Формуємо список стандартних зручностей
        const commonFeatures = document.getElementById('common-features');

        commonFeatures.replaceChildren();

        (data.commonFeatures || []).forEach(feature => {
            const item = document.createElement('li');

            item.textContent = feature;

            commonFeatures.appendChild(item);
        });

        // Готуємо контейнер для карток номерів
        list.replaceChildren();

        // Відображаємо тільки категорії, які не приховані
        const visibleRooms = (data.rooms || []).filter(
            room => room.visible !== false
        );

        if (visibleRooms.length === 0) {
            list.textContent =
                'Наразі категорії номерів не опубліковані.';

            return;
        }

        // Створюємо картку для кожного номера
        visibleRooms.forEach(room => {
            const article = document.createElement('article');

            article.className = 'room-card';

            // Фотографія номера
            const photo = document.createElement('div');

            photo.className = 'room-photo';

            const img = document.createElement('img');

            img.src = room.image || '';
            img.alt = room.imageAlt || room.name || 'Номер готелю';
            img.loading = 'lazy';

            photo.appendChild(img);

            // Основна інформація
            const info = document.createElement('div');

            info.className = 'room-info';

            // Номер категорії
            const category = document.createElement('span');

            category.className = 'room-category';

            category.textContent =
                `${String(room.number || '').padStart(2, '0')} / КАТЕГОРІЯ`;

            // Назва номера
            const title = document.createElement('h2');

            title.textContent = room.name || '';

            // Опис номера
            const description = document.createElement('p');

            description.className = 'room-description';
            description.textContent = room.description || '';

            // Заголовок переліку зручностей
            const listTitle = document.createElement('p');

            listTitle.className = 'room-list-title';
            listTitle.textContent = 'У номері:';

            // Перелік зручностей
            const features = document.createElement('ul');

            features.className = 'room-features';

            (room.features || []).forEach(feature => {
                const li = document.createElement('li');

                li.textContent = feature;

                features.appendChild(li);
            });

            // Вартість проживання
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

            // Кнопки дій
            const actions = document.createElement('div');

            actions.className = 'room-actions';

            // Детальна інформація про номер
            const details = document.createElement('a');

            details.className = 'room-details-button';

            details.href =
                `room-details.html?category=${encodeURIComponent(room.id || '')}`;

            details.textContent = 'Детальніше';

            // Бронювання номера
            const booking = document.createElement('a');

            booking.className = 'room-book-button';

            booking.href =
                `booking.html?room=${encodeURIComponent(room.id || '')}`;

            booking.textContent = 'Забронювати';

            actions.append(details, booking);

            // Об'єднуємо всі елементи картки
            info.append(
                category,
                title,
                description,
                listTitle,
                features,
                price,
                actions
            );

            article.append(photo, info);

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


// Запускаємо завантаження сторінки
document.addEventListener('DOMContentLoaded', () => {
    loadRoomsPage();

    // Налаштовуємо копіювання телефонних номерів
    document.querySelectorAll('[data-phone]').forEach(button => {
        button.addEventListener('click', async () => {
            const phone = button.dataset.phone;

            try {
                await navigator.clipboard.writeText(phone);

                const previousText = button.textContent;

                button.textContent = 'Скопійовано';

                window.setTimeout(() => {
                    button.textContent = previousText;
                }, 1200);

            } catch {
                window.prompt(
                    'Скопіюйте номер телефону:',
                    phone
                );
            }
        });
    });
});