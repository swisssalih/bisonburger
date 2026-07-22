const BURGER_CATEGORY_IDS = ['classic-burgers', 'bacon-burgers', 'hawaii-burgers', 'special-burgers', 'premium-picks'];

function getRatedItems() {
  return JSON.parse(localStorage.getItem('bisonRatedItems') || '{}');
}

function saveRatedItems(map) {
  localStorage.setItem('bisonRatedItems', JSON.stringify(map));
}

function buildRating(itemId, summary) {
  const container = document.createElement('div');
  container.className = 'rating';
  container.dataset.itemId = itemId;

  const ratedItems = getRatedItems();
  const userRating = ratedItems[itemId];
  const displayValue = userRating || Math.round(summary.average || 0);

  const starsWrap = document.createElement('div');
  starsWrap.className = 'rating-stars';

  for (let i = 1; i <= 5; i++) {
    const star = document.createElement(userRating ? 'span' : 'button');
    star.className = 'star' + (i <= displayValue ? ' filled' : '');
    star.textContent = '★';
    if (!userRating) {
      star.type = 'button';
      star.dataset.value = String(i);
      star.setAttribute('aria-label', `Rate ${i} star${i > 1 ? 's' : ''}`);
    }
    starsWrap.appendChild(star);
  }

  const summaryEl = document.createElement('span');
  summaryEl.className = 'rating-summary';
  summaryEl.textContent = summary.count > 0
    ? `${Number(summary.average).toFixed(1)} (${summary.count})`
    : 'No ratings yet';

  container.appendChild(starsWrap);
  container.appendChild(summaryEl);
  return container;
}

function buildCard(item, ratingsMap) {
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

  if (item.id) {
    const summary = (ratingsMap && ratingsMap[item.id]) || { average: 0, count: 0 };
    card.appendChild(buildRating(item.id, summary));
  }

  const orderLink = document.createElement('a');
  orderLink.href = '#';
  orderLink.textContent = 'Order Now';
  card.appendChild(orderLink);

  return card;
}

function buildBurgerCategory(category, ratingsMap) {
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
  (category.items || []).forEach(item => grid.appendChild(buildCard(item, ratingsMap)));
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
    const [menuRes, ratingsRes] = await Promise.all([
      fetch('/api/menu'),
      fetch('/api/ratings')
    ]);
    if (!menuRes.ok) throw new Error(`server responded ${menuRes.status}`);
    const data = await menuRes.json();
    const ratingsMap = ratingsRes.ok ? await ratingsRes.json() : {};
    const categories = data.categories || [];

    if (burgerContainer) {
      burgerContainer.innerHTML = '';
      categories
        .filter(cat => BURGER_CATEGORY_IDS.includes(cat.id))
        .forEach(cat => burgerContainer.appendChild(buildBurgerCategory(cat, ratingsMap)));
    }

    const snacksCategory = categories.find(cat => cat.id === 'snacks');
    if (snacksContainer && snacksCategory) {
      snacksContainer.innerHTML = '';
      (snacksCategory.items || []).forEach(item => snacksContainer.appendChild(buildCard(item, ratingsMap)));
    }

    const drinksCategory = categories.find(cat => cat.id === 'drinks');
    if (drinksContainer && drinksCategory) {
      drinksContainer.innerHTML = '';
      (drinksCategory.items || []).forEach(item => drinksContainer.appendChild(buildCard(item, ratingsMap)));
    }

    if (typeof window.applyLanguage === 'function') {
      window.applyLanguage();
    }
  } catch (err) {
    [burgerContainer, snacksContainer, drinksContainer].forEach(c => c && showError(c, err.message || String(err)));
    console.error(err);
  }
}

document.body.addEventListener('click', async event => {
  const star = event.target.closest('.star[data-value]');
  if (!star) return;
  event.preventDefault();

  const ratingContainer = star.closest('.rating');
  if (!ratingContainer) return;
  const itemId = ratingContainer.dataset.itemId;
  const value = Number(star.dataset.value);

  const ratedItems = getRatedItems();
  if (ratedItems[itemId]) return;

  try {
    const res = await fetch('/api/ratings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, rating: value })
    });
    if (!res.ok) throw new Error('vote failed');
    const summary = await res.json();

    ratedItems[itemId] = value;
    saveRatedItems(ratedItems);

    ratingContainer.replaceWith(buildRating(itemId, summary));
  } catch (err) {
    console.error(err);
  }
});

document.addEventListener('DOMContentLoaded', loadOnlineMenu);
