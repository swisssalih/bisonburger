async function loadOnlineMenu() {
  const container = document.getElementById('online-menu');
  if (!container) return;
  try {
    const res = await fetch('./menu.json');
    if (!res.ok) throw new Error('menu.json not found; run the scraper first');
    const data = await res.json();
    container.innerHTML = '';
    data.categories.forEach(cat => {
      const catEl = document.createElement('div');
      catEl.className = 'menu-category';
      const h = document.createElement('h3');
      h.className = 'category-title';
      h.textContent = cat.name;
      catEl.appendChild(h);

      const grid = document.createElement('div');
      grid.className = 'menu-grid';

      (cat.items||[]).forEach(it => {
        const card = document.createElement('div');
        card.className = 'card';
        const name = document.createElement('h3');
        name.textContent = it.name || '';
        const desc = document.createElement('p');
        desc.textContent = it.description || '';
        const price = document.createElement('span');
        price.textContent = it.price || '';
        const btn = document.createElement('a');
        btn.href = '#';
        btn.textContent = 'Order Now';
        card.appendChild(name);
        if (desc.textContent) card.appendChild(desc);
        card.appendChild(price);
        card.appendChild(btn);
        grid.appendChild(card);
      });

      catEl.appendChild(grid);
      container.appendChild(catEl);
    });
  } catch (err) {
    container.innerHTML = '<div style="color:#f88;padding:20px;">Could not load online menu: ' + (err.message||err) + '</div>';
    console.error(err);
  }
}

document.addEventListener('DOMContentLoaded', loadOnlineMenu);
