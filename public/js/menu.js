const BURGER_CATEGORY_IDS = ['classic-burgers', 'bacon-burgers', 'hawaii-burgers', 'special-burgers', 'premium-picks'];

function buildCard(item) {
  const card = document.createElement('div');
  card.className = 'card';

  if (item.tag) {
    const tag = document.createElement('div');
    tag.className = 'tag';
    tag.textContent = item.tag;
    card.appendChild(tag);
  }

  const name = document.createElement('h3');
  name.textContent = item.name;
  card.appendChild(name);

  if (item.description) {
    const desc = document.createElement('p');
    desc.textContent = item.description;
    card.appendChild(desc);
  }

  const price = document.createElement('span');
  price.textContent = `${Number(item.price).toFixed(2)} CHF`;
  card.appendChild(price);

  const orderLink = document.createElement('a');
  orderLink.href = '#';
  orderLink.textContent = 'Order Now';
  card.appendChild(orderLink);

  return card;
}

function buildBurgerCategory(category) {
  const wrapper = document.createElement('div');
  wrapper.className = 'menu-category';

  const title = document.createElement('h3');
  title.className = 'category-title';
  title.textContent = category.name;
  if (category.translationKey) {
    title.dataset.i18nKey = category.translationKey;
  }
  wrapper.appendChild(title);

  const grid = document.createElement('div');
  grid.className = 'menu-grid';
  (category.items || []).forEach(item => grid.appendChild(buildCard(item)));
  wrapper.appendChild(grid);

  return wrapper;
}

function showLoading(container) {
  container.innerHTML = '<div class="menu-loading">Loading menu…</div>';
}

function showError(container, message) {
  container.innerHTML = `<div class="menu-error">Could not load menu: ${message}</div>`;
}

async function loadOnlineMenu() {
  const burgerContainer = document.getElementById('burger-menu');
  const snacksContainer = document.getElementById('snacks-menu');
  const drinksContainer = document.getElementById('drinks-menu');
  if (!burgerContainer && !snacksContainer && !drinksContainer) return;

  [burgerContainer, snacksContainer, drinksContainer].forEach(c => c && showLoading(c));

  try {
    const res = await fetch('/api/menu');
    if (!res.ok) throw new Error(`server responded ${res.status}`);
    const data = await res.json();
    const categories = data.categories || [];

    if (burgerContainer) {
      burgerContainer.innerHTML = '';
      categories
        .filter(cat => BURGER_CATEGORY_IDS.includes(cat.id))
        .forEach(cat => burgerContainer.appendChild(buildBurgerCategory(cat)));
    }

    const snacksCategory = categories.find(cat => cat.id === 'snacks');
    if (snacksContainer && snacksCategory) {
      snacksContainer.innerHTML = '';
      (snacksCategory.items || []).forEach(item => snacksContainer.appendChild(buildCard(item)));
    }

    const drinksCategory = categories.find(cat => cat.id === 'drinks');
    if (drinksContainer && drinksCategory) {
      drinksContainer.innerHTML = '';
      (drinksCategory.items || []).forEach(item => drinksContainer.appendChild(buildCard(item)));
    }

    if (typeof window.applyLanguage === 'function') {
      window.applyLanguage();
    }
  } catch (err) {
    [burgerContainer, snacksContainer, drinksContainer].forEach(c => c && showError(c, err.message || String(err)));
    console.error(err);
  }
}

document.addEventListener('DOMContentLoaded', loadOnlineMenu);
