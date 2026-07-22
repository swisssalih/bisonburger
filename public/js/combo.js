let comboState = null;

function getMenuCategories() {
  return window.bisonMenuCategories || [];
}

function getComboItems(categoryId) {
  const category = getMenuCategories().find(c => c.id === categoryId);
  return (category && category.items) || [];
}

function updateNextButtonLabel(step) {
  const nextBtn = document.getElementById('combo-next');
  const selection = step === 1 ? comboState.side : comboState.drink;

  if (step === 1) {
    nextBtn.textContent = selection ? t('comboNext') : t('comboSkip');
  } else {
    nextBtn.textContent = selection ? t('comboAddToCart') : t('comboSkipAddToCart');
  }
}

function renderComboStep(step) {
  const stepLabel = document.getElementById('combo-step-label');
  const stepTitle = document.getElementById('combo-step-title');
  const optionsContainer = document.getElementById('combo-options');
  const backBtn = document.getElementById('combo-back');

  optionsContainer.dataset.step = String(step);
  stepLabel.textContent = t('comboStepLabel', { current: step, total: 2 });
  stepTitle.textContent = step === 1 ? t('comboStepSide') : t('comboStepDrink');
  backBtn.hidden = step === 1;

  const items = step === 1 ? getComboItems('snacks') : getComboItems('drinks');
  const currentSelection = step === 1 ? comboState.side : comboState.drink;

  optionsContainer.innerHTML = '';
  items.forEach(item => {
    const opt = document.createElement('button');
    opt.type = 'button';
    opt.className = 'combo-option' + (currentSelection && currentSelection.name === item.name ? ' selected' : '');
    opt.dataset.name = item.name;
    opt.dataset.price = item.price;

    const nameEl = document.createElement('span');
    nameEl.className = 'combo-option-name';
    nameEl.textContent = item.name;

    const priceEl = document.createElement('span');
    priceEl.className = 'combo-option-price';
    priceEl.textContent = `${Number(item.price).toFixed(2)} CHF`;

    opt.appendChild(nameEl);
    opt.appendChild(priceEl);
    optionsContainer.appendChild(opt);
  });

  updateNextButtonLabel(step);
}

function openComboModal(burgerName, burgerPrice) {
  comboState = { burger: { name: burgerName, price: burgerPrice }, side: null, drink: null };
  renderComboStep(1);
  openModal(document.getElementById('combo-modal'));
}

document.addEventListener('DOMContentLoaded', () => {
  const optionsContainer = document.getElementById('combo-options');
  const backBtn = document.getElementById('combo-back');
  const nextBtn = document.getElementById('combo-next');
  const comboModal = document.getElementById('combo-modal');

  optionsContainer.addEventListener('click', event => {
    const opt = event.target.closest('.combo-option');
    if (!opt || !comboState) return;

    const step = Number(optionsContainer.dataset.step);
    const alreadySelected = opt.classList.contains('selected');

    optionsContainer.querySelectorAll('.combo-option').forEach(o => o.classList.remove('selected'));

    if (alreadySelected) {
      if (step === 1) comboState.side = null; else comboState.drink = null;
    } else {
      opt.classList.add('selected');
      const selection = { name: opt.dataset.name, price: Number(opt.dataset.price) };
      if (step === 1) comboState.side = selection; else comboState.drink = selection;
    }

    updateNextButtonLabel(step);
  });

  backBtn.addEventListener('click', () => renderComboStep(1));

  nextBtn.addEventListener('click', () => {
    if (!comboState) return;

    if (Number(optionsContainer.dataset.step) === 1) {
      renderComboStep(2);
      return;
    }

    addItemToCart(comboState.burger.name, comboState.burger.price);
    if (comboState.side) addItemToCart(comboState.side.name, comboState.side.price);
    if (comboState.drink) addItemToCart(comboState.drink.name, comboState.drink.price);
    closeModal(comboModal);
    comboState = null;
  });
});

window.openComboModal = openComboModal;
