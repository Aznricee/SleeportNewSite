async function loadBreakfastPage() {
    const breakfastList = document.getElementById('breakfast-list');
    const coffeeList = document.getElementById('coffee-list');

    try {
        const response = await fetch('breakfast.json');

        if (!response.ok) {
            throw new Error(
                `Не вдалося завантажити breakfast.json: ${response.status}`
            );
        }

        const data = await response.json();

        document.title = data.title || 'Сніданки та кава — Sleeport';

        setText('page-title', data.pageTitle || 'Сніданки та кава');
        setText('page-description', data.pageDescription || '');
        setText('breakfast-title', data.breakfast?.title || 'Меню сніданків');
        setText('breakfast-description', data.breakfast?.description || '');
        setText('coffee-title', data.coffee?.title || 'Кавове меню');
        setText('coffee-description', data.coffee?.description || '');
        setText('menu-note', data.note || '');

        // Умови сніданку
        renderServiceInfo(
            document.getElementById('service-info'),
            data.serviceInfo
        );

        // Меню сніданків
        renderMenu(
            breakfastList,
            data.breakfast?.items || [],
            data.currency || 'грн'
        );

        // Кавове меню: гаряча та холодна кава
        renderCoffeeCategories(
            coffeeList,
            data.coffee?.categories || [],
            data.currency || 'грн'
        );

    } catch (error) {
        console.error('Помилка завантаження меню:', error);

        if (breakfastList) {
            breakfastList.textContent =
                'Не вдалося завантажити меню сніданків.';
        }

        if (coffeeList) {
            coffeeList.textContent =
                'Не вдалося завантажити кавове меню.';
        }
    }
}


function setText(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}


// Блок умов сніданку
function renderServiceInfo(container, serviceInfo) {
    if (!container) return;

    container.replaceChildren();

    if (!serviceInfo || !Array.isArray(serviceInfo.items)) {
        container.hidden = true;
        return;
    }

    const visibleItems = serviceInfo.items.filter(
        item => item.visible !== false
    );

    if (visibleItems.length === 0) {
        container.hidden = true;
        return;
    }

    container.hidden = false;

    const heading = document.createElement('h2');
    heading.textContent = serviceInfo.title || 'Умови сніданку';
    container.appendChild(heading);

    const list = document.createElement('div');
    list.className = 'service-info-list';

    visibleItems.forEach(item => {
        const card = document.createElement('div');
        card.className = 'service-info-item';

        const label = document.createElement('h3');
        label.textContent = item.label || '';

        const value = document.createElement('p');
        value.textContent = item.value || '';

        card.append(label, value);
        list.appendChild(card);
    });

    container.appendChild(list);
}


// Категорії кавового меню
function renderCoffeeCategories(container, categories, currency) {
    if (!container) return;

    container.replaceChildren();

    if (!Array.isArray(categories) || categories.length === 0) {
        const emptyMessage = document.createElement('p');
        emptyMessage.className = 'menu-empty';
        emptyMessage.textContent =
            'Інформація про кавове меню наразі готується.';

        container.appendChild(emptyMessage);
        return;
    }

    categories.forEach(category => {
        const visibleItems = (category.items || []).filter(
            item => item.visible !== false
        );

        if (visibleItems.length === 0) return;

        const section = document.createElement('section');
        section.className = 'coffee-category';

        const heading = document.createElement('h3');
        heading.className = 'coffee-category-title';
        heading.textContent = category.title || '';

        section.appendChild(heading);

        const list = document.createElement('div');
        list.className = 'menu-grid';

        renderMenu(list, visibleItems, currency);

        section.appendChild(list);
        container.appendChild(section);
    });

    if (!container.children.length) {
        const emptyMessage = document.createElement('p');
        emptyMessage.className = 'menu-empty';
        emptyMessage.textContent =
            'Інформація про кавове меню наразі готується.';

        container.appendChild(emptyMessage);
    }
}


// Картки меню
function renderMenu(container, items, currency) {
    if (!container) return;

    container.replaceChildren();

    const visibleItems = items.filter(
        item => item.visible !== false
    );

    if (visibleItems.length === 0) {
        const emptyMessage = document.createElement('p');

        emptyMessage.className = 'menu-empty';
        emptyMessage.textContent =
            'Інформація про позиції меню наразі готується.';

        container.appendChild(emptyMessage);
        return;
    }

    visibleItems.forEach(item => {
        const card = document.createElement('article');
        card.className = 'menu-card';

        // Фото позиції, якщо воно вказане
        if (item.image && item.image.trim() !== '') {
            const imageContainer = document.createElement('div');
            imageContainer.className = 'menu-card-image';

            const image = document.createElement('img');
            image.src = item.image;
            image.alt = item.imageAlt || item.name || '';
            image.loading = 'lazy';

            image.addEventListener('error', () => {
                imageContainer.remove();
            }, { once: true });

            imageContainer.appendChild(image);
            card.appendChild(imageContainer);
        }

        const content = document.createElement('div');
        content.className = 'menu-card-content';

        const title = document.createElement('h3');
        title.textContent = item.name || '';
        content.appendChild(title);

        if (item.description) {
            const description = document.createElement('p');
            description.className = 'menu-card-description';
            description.textContent = item.description;
            content.appendChild(description);
        }

        const footer = document.createElement('div');
        footer.className = 'menu-card-footer';

        const price = document.createElement('span');
        price.className = 'menu-card-price';

        const validPrice =
            item.price !== null &&
            item.price !== undefined &&
            item.price !== '' &&
            Number.isFinite(Number(item.price)) &&
            Number(item.price) >= 0;

        price.textContent = validPrice
            ? `${new Intl.NumberFormat('uk-UA').format(Number(item.price))} ${currency}`
            : 'Уточнюйте ціну';

        footer.appendChild(price);

        if (item.details) {
            const details = document.createElement('span');
            details.className = 'menu-card-details';
            details.textContent = item.details;
            footer.appendChild(details);
        }

        content.appendChild(footer);
        card.appendChild(content);
        container.appendChild(card);
    });
}


document.addEventListener('DOMContentLoaded', loadBreakfastPage);