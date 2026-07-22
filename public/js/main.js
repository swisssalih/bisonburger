const accountLink = document.getElementById('account-link');
const cartButton = document.getElementById('cart-button');
const accountModal = document.getElementById('account-modal');
const cartModal = document.getElementById('cart-modal');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginTab = document.getElementById('login-tab');
const registerTab = document.getElementById('register-tab');
const accountMessage = document.getElementById('account-message');
const logoutBtn = document.getElementById('logout-btn');
const cartItemsContainer = document.getElementById('cart-items');
const cartSummary = document.getElementById('cart-summary');
const cartMessage = document.getElementById('cart-message');
const checkoutForm = document.getElementById('checkout-form');
const checkoutSubmitBtn = checkoutForm.querySelector('button[type="submit"]');
const contactForm = document.getElementById('contact-form');
const contactSubmitBtn = contactForm.querySelector('button[type="submit"]');
const contactStatus = document.getElementById('contact-status');
const closeButtons = document.querySelectorAll('.close-btn');
const langEn = document.getElementById('lang-en');
const langDe = document.getElementById('lang-de');
const navHome = document.getElementById('nav-home');
const navMenu = document.getElementById('nav-menu');
const navAbout = document.getElementById('nav-about');
const navContact = document.getElementById('nav-contact');
const heroSubtitle = document.querySelector('.hero-left h3');
const heroDescription = document.querySelector('.hero-left p');
const btnViewMenu = document.getElementById('btn-view-menu');
const btnContact = document.getElementById('btn-contact');
const accountModalTitle = document.getElementById('account-modal-title');
const cartModalTitle = document.querySelector('#cart-modal h2');
const loginEmailLabel = document.querySelector('label[for="login-email"]');
const loginPasswordLabel = document.querySelector('label[for="login-password"]');
const registerNameLabel = document.querySelector('label[for="register-name"]');
const registerEmailLabel = document.querySelector('label[for="register-email"]');
const registerPasswordLabel = document.querySelector('label[for="register-password"]');
const deliveryNameLabel = document.querySelector('label[for="delivery-name"]');
const deliveryPhoneLabel = document.querySelector('label[for="delivery-phone"]');
const deliveryAddressLabel = document.querySelector('label[for="delivery-address"]');
const deliveryNotesLabel = document.querySelector('label[for="delivery-notes"]');
const deliveryNameInput = document.getElementById('delivery-name');
const deliveryPhoneInput = document.getElementById('delivery-phone');
const deliveryAddressInput = document.getElementById('delivery-address');
const deliveryNotesInput = document.getElementById('delivery-notes');
const orderTracker = document.getElementById('order-tracker');
const trackerOrderIdEl = document.getElementById('tracker-order-id');
const trackerCloseBtn = document.getElementById('tracker-close');
const STATUS_ORDER = ['new', 'preparing', 'sent', 'delivered'];
let trackerSource = null;
let trackedOrderId = null;
let currentLanguage = localStorage.getItem('bisonLang') || 'en';

const translations = {
  en: {
    home: 'Home',
    menu: 'Menu',
    about: 'About',
    contact: 'Contact',
    account: 'Account',
    cart: 'Cart',
    viewMenu: 'VIEW MENU',
    contactBtn: 'CONTACT',
    premiumExperience: 'PREMIUM BURGER EXPERIENCE',
    login: 'Login',
    register: 'Register',
    customerLogin: 'Customer Login',
    createAccount: 'Create Account',
    logout: 'Logout',
    orderNow: 'Order Now',
    yourOrder: 'Your Order',
    fullName: 'Full Name',
    phone: 'Phone',
    deliveryAddress: 'Delivery Address',
    notes: 'Notes',
    placeOrder: 'Place Order',
    placingOrder: 'Placing order…',
    total: 'Total',
    emptyCart: 'Your cart is empty.',
    fillFields: 'Please fill in your delivery details.',
    cartEmpty: 'Your cart is empty.',
    orderPlaced: 'Thank you! Your order #{orderId} has been placed.',
    orderFailed: 'Something went wrong placing your order. Please try again.',
    fillAll: 'Please fill in all fields.',
    invalidLogin: 'Email or password is incorrect.',
    loggedIn: 'Logged in successfully.',
    accountCreated: 'Account created successfully.',
    loggedOut: 'Logged out successfully.',
    addedToCart: '{name} added to cart.',
    removedFromCart: '{name} removed from cart.',
    hello: 'Hi',
    email: 'Email',
    password: 'Password',
    submenu: 'OUR MENU',
    classicBurgers: 'Classic Burgers',
    baconBurgers: 'Bacon Burgers',
    hawaiiBurgers: 'Hawaii Burgers',
    specialBurgers: 'Special Burgers',
    premiumPicks: 'Premium Picks',
    burgerExperienceDesc: '100% Fresh Beef, Homemade Sauces, Fresh Ingredients and unforgettable taste.',
    checkoutTitle: 'Your Order',
    aboutTitle: 'ABOUT US',
    aboutParagraph1: "Bison Burger started with a simple idea: a burger doesn't need shortcuts to be great. Every patty is 160g+ of fresh beef, ground and grilled the same day — never frozen, never pre-formed.",
    aboutParagraph2: 'Our sauces are made in-house, our buns are baked locally, and our kitchen is open every day of the week so your next craving is never far away.',
    badgeFreshBeef: 'Fresh Beef',
    badgeNoFreezer: 'Frozen Ingredients',
    badgeDaysWeek: 'Open Every Day',
    contactTitle: 'CONTACT',
    contactAddressLabel: 'Address',
    contactHoursLabel: 'Opening Hours',
    contactMessageLabel: 'Message',
    contactSendBtn: 'Send Message',
    contactSending: 'Sending…',
    contactSent: "Thanks! We'll get back to you soon.",
    contactFailed: 'Something went wrong sending your message. Please try again.',
    footerTagline: 'Premium burgers, honestly made.',
    footerQuickLinks: 'Quick Links',
    footerRights: 'All rights reserved.',
    trackerTitle: 'Tracking order',
    trackerReceived: 'Received',
    trackerPreparing: 'Preparing',
    trackerSent: 'On the way',
    trackerDelivered: 'Delivered'
  },
  de: {
    home: 'Startseite',
    menu: 'Menü',
    about: 'Über uns',
    contact: 'Kontakt',
    account: 'Konto',
    cart: 'Warenkorb',
    viewMenu: 'MENÜ ANSEHEN',
    contactBtn: 'KONTAKT',
    premiumExperience: 'PREMIUM BURGER ERLEBNIS',
    login: 'Anmelden',
    register: 'Registrieren',
    customerLogin: 'Kundenanmeldung',
    createAccount: 'Konto erstellen',
    logout: 'Abmelden',
    orderNow: 'Jetzt bestellen',
    yourOrder: 'Ihre Bestellung',
    fullName: 'Vollständiger Name',
    phone: 'Telefon',
    deliveryAddress: 'Lieferadresse',
    notes: 'Notizen',
    placeOrder: 'Bestellung abschicken',
    placingOrder: 'Bestellung wird aufgegeben…',
    total: 'Gesamt',
    emptyCart: 'Ihr Warenkorb ist leer.',
    fillFields: 'Bitte füllen Sie Ihre Lieferdetails aus.',
    cartEmpty: 'Ihr Warenkorb ist leer.',
    orderPlaced: 'Danke! Ihre Bestellung #{orderId} wurde aufgegeben.',
    orderFailed: 'Beim Aufgeben Ihrer Bestellung ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
    fillAll: 'Bitte füllen Sie alle Felder aus.',
    invalidLogin: 'E-Mail oder Passwort ist falsch.',
    loggedIn: 'Erfolgreich angemeldet.',
    accountCreated: 'Konto erfolgreich erstellt.',
    loggedOut: 'Erfolgreich abgemeldet.',
    addedToCart: '{name} zum Warenkorb hinzugefügt.',
    removedFromCart: '{name} aus dem Warenkorb entfernt.',
    hello: 'Hallo',
    email: 'E-Mail',
    password: 'Passwort',
    submenu: 'UNSER MENÜ',
    classicBurgers: 'Classic Burger',
    baconBurgers: 'Bacon Burger',
    hawaiiBurgers: 'Hawaii Burger',
    specialBurgers: 'Special Burger',
    premiumPicks: 'Premium Auswahlen',
    burgerExperienceDesc: '100% frisches Rindfleisch, hausgemachte Soßen, frische Zutaten und unvergesslicher Geschmack.',
    checkoutTitle: 'Ihre Bestellung',
    aboutTitle: 'ÜBER UNS',
    aboutParagraph1: 'Bison Burger begann mit einer einfachen Idee: Ein Burger braucht keine Abkürzungen, um grossartig zu sein. Jedes Patty besteht aus 160g+ frischem Rindfleisch, am selben Tag gewolft und gegrillt — nie tiefgekühlt, nie vorgeformt.',
    aboutParagraph2: 'Unsere Saucen werden selbst gemacht, unsere Brötchen lokal gebacken, und unsere Küche ist jeden Tag der Woche geöffnet, damit dein nächster Hunger nie weit ist.',
    badgeFreshBeef: 'Frisches Rindfleisch',
    badgeNoFreezer: 'Tiefkühlzutaten',
    badgeDaysWeek: 'Täglich geöffnet',
    contactTitle: 'KONTAKT',
    contactAddressLabel: 'Adresse',
    contactHoursLabel: 'Öffnungszeiten',
    contactMessageLabel: 'Nachricht',
    contactSendBtn: 'Nachricht senden',
    contactSending: 'Wird gesendet…',
    contactSent: 'Danke! Wir melden uns bald bei dir.',
    contactFailed: 'Beim Senden Ihrer Nachricht ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
    footerTagline: 'Premium Burger, ehrlich gemacht.',
    footerQuickLinks: 'Schnellzugriff',
    footerRights: 'Alle Rechte vorbehalten.',
    trackerTitle: 'Bestellung verfolgen',
    trackerReceived: 'Erhalten',
    trackerPreparing: 'Wird zubereitet',
    trackerSent: 'Unterwegs',
    trackerDelivered: 'Geliefert'
  }
};

function t(key, vars = {}) {
  const value = translations[currentLanguage] && translations[currentLanguage][key] !== undefined
    ? translations[currentLanguage][key]
    : translations.en[key] || '';
  return Object.keys(vars).reduce((text, varName) => text.replace(`{${varName}}`, vars[varName]), value);
}

function applyLanguage() {
  navHome.textContent = t('home');
  navMenu.textContent = t('menu');
  navAbout.textContent = t('about');
  navContact.textContent = t('contact');
  accountLink.textContent = getCurrentUserEmail() ? `${t('hello')}, ${getCurrentUserName() || getCurrentUserEmail()}` : t('account');
  btnViewMenu.textContent = t('viewMenu');
  btnContact.textContent = t('contactBtn');
  heroSubtitle.textContent = t('premiumExperience');
  heroDescription.textContent = t('burgerExperienceDesc');
  cartModalTitle.textContent = t('checkoutTitle');
  loginTab.textContent = t('login');
  registerTab.textContent = t('register');
  accountModalTitle.textContent = loginForm.style.display === 'grid' ? t('customerLogin') : t('createAccount');
  loginEmailLabel.textContent = t('email');
  loginPasswordLabel.textContent = t('password');
  registerNameLabel.textContent = t('fullName');
  registerEmailLabel.textContent = t('email');
  registerPasswordLabel.textContent = t('password');
  deliveryNameLabel.textContent = t('fullName');
  deliveryPhoneLabel.textContent = t('phone');
  deliveryAddressLabel.textContent = t('deliveryAddress');
  deliveryNotesLabel.textContent = t('notes');
  deliveryNameInput.placeholder = t('fullName');
  deliveryPhoneInput.placeholder = '+41 79 123 45 67';
  deliveryAddressInput.placeholder = t('deliveryAddress');
  deliveryNotesInput.placeholder = t('notes');
  loginForm.querySelector('button[type="submit"]').textContent = t('login');
  registerForm.querySelector('button[type="submit"]').textContent = t('createAccount');
  logoutBtn.textContent = t('logout');
  if (!checkoutSubmitBtn.disabled) {
    checkoutSubmitBtn.textContent = t('placeOrder');
  }
  if (!contactSubmitBtn.disabled) {
    contactSubmitBtn.textContent = t('contactSendBtn');
  }
  if (langEn && langDe) {
    langEn.classList.toggle('active', currentLanguage === 'en');
    langDe.classList.toggle('active', currentLanguage === 'de');
  }
  document.querySelectorAll('.card a').forEach(link => {
    link.textContent = t('orderNow');
  });
  document.querySelectorAll('[data-i18n-key]').forEach(el => {
    el.textContent = t(el.dataset.i18nKey);
  });
}

function setLanguage(lang) {
  localStorage.setItem('bisonLang', lang);
  currentLanguage = lang;
  applyLanguage();
}

function toggleLanguage() {
  setLanguage(currentLanguage === 'en' ? 'de' : 'en');
}

function getAccounts() {
  return JSON.parse(localStorage.getItem('bisonAccounts') || '{}');
}

function saveAccounts(accounts) {
  localStorage.setItem('bisonAccounts', JSON.stringify(accounts));
}

function getCurrentUserEmail() {
  return localStorage.getItem('bisonUser') || '';
}

function getCurrentUserName() {
  return localStorage.getItem('bisonUserName') || '';
}

function saveCurrentUser(email, name) {
  localStorage.setItem('bisonUser', email);
  localStorage.setItem('bisonUserName', name);
}

function clearCurrentUser() {
  localStorage.removeItem('bisonUser');
  localStorage.removeItem('bisonUserName');
}

function getCart() {
  return JSON.parse(localStorage.getItem('bisonCart') || '[]');
}

function saveCart(cart) {
  localStorage.setItem('bisonCart', JSON.stringify(cart));
}

function formatPrice(amount) {
  return Number(amount).toFixed(2) + ' CHF';
}

function parsePrice(priceText) {
  return Number(priceText.replace(/[^0-9.]/g, '')) || 0;
}

function openModal(modal) {
  modal.classList.add('active');
}

function closeModal(modal) {
  modal.classList.remove('active');
}

function setActiveTab(tab) {
  if (tab === 'login') {
    loginForm.style.display = 'grid';
    registerForm.style.display = 'none';
    loginTab.classList.add('active-tab');
    registerTab.classList.remove('active-tab');
    accountModalTitle.textContent = t('customerLogin');
  } else {
    loginForm.style.display = 'none';
    registerForm.style.display = 'grid';
    loginTab.classList.remove('active-tab');
    registerTab.classList.add('active-tab');
    accountModalTitle.textContent = t('createAccount');
  }
}

function showAccountMessage(text, error = false) {
  accountMessage.textContent = text;
  accountMessage.style.color = error ? '#ff6b6b' : '#9bd8ff';
}

function showCartMessage(text, error = false) {
  cartMessage.textContent = text;
  cartMessage.style.color = error ? '#ff6b6b' : '#9bd8ff';
}

function updateAccountUI() {
  const email = getCurrentUserEmail();
  if (email) {
    accountLink.textContent = `${t('hello')}, ${getCurrentUserName() || email}`;
    logoutBtn.style.display = 'inline-block';
  } else {
    accountLink.textContent = t('account');
    logoutBtn.style.display = 'none';
  }
  updateCartCount();
}

function updateCartCount() {
  const count = getCart().reduce((sum, item) => sum + item.quantity, 0);
  cartButton.textContent = `${t('cart')} (${count})`;
}

function addItemToCart(name, price) {
  const cart = getCart();
  const existing = cart.find(item => item.name === name);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ name, price, quantity: 1 });
  }
  saveCart(cart);
  updateCartCount();
  showAccountMessage(t('addedToCart', { name }));
}

function loadCart() {
  const cart = getCart();
  cartItemsContainer.innerHTML = '';
  let total = 0;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `<p>${t('emptyCart')}</p>`;
    checkoutSubmitBtn.disabled = true;
  } else {
    cart.forEach(item => {
      const itemTotal = item.price * item.quantity;
      total += itemTotal;
      const element = document.createElement('div');
      element.className = 'cart-item';
      element.innerHTML = `
        <div>
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-controls">
            <button type="button" class="quantity-btn" data-action="decrease" data-name="${item.name}">−</button>
            <span>${item.quantity}</span>
            <button type="button" class="quantity-btn" data-action="increase" data-name="${item.name}">+</button>
          </div>
        </div>
        <div class="cart-item-actions">
          <span>${formatPrice(itemTotal)}</span>
          <button type="button" class="remove-btn" data-name="${item.name}">Remove</button>
        </div>
      `;
      cartItemsContainer.appendChild(element);
    });
    checkoutSubmitBtn.disabled = false;
  }

  cartSummary.textContent = `Total: ${formatPrice(total)}`;
}

function changeCartQuantity(name, delta) {
  const cart = getCart();
  const item = cart.find(i => i.name === name);
  if (!item) return;
  item.quantity = Math.max(1, item.quantity + delta);
  saveCart(cart);
  updateCartCount();
  loadCart();
}

function removeCartItem(name) {
  let cart = getCart();
  cart = cart.filter(i => i.name !== name);
  saveCart(cart);
  updateCartCount();
  loadCart();
  showCartMessage(t('removedFromCart', { name }));
}

function renderTrackerStatus(status) {
  const idx = STATUS_ORDER.indexOf(status);
  orderTracker.querySelectorAll('.step').forEach(step => {
    const stepIdx = STATUS_ORDER.indexOf(step.dataset.step);
    step.classList.toggle('done', stepIdx !== -1 && stepIdx < idx);
    step.classList.toggle('active', stepIdx === idx);
  });
}

function stopOrderTracking() {
  if (trackerSource) {
    trackerSource.close();
    trackerSource = null;
  }
  trackedOrderId = null;
  orderTracker.hidden = true;
  localStorage.removeItem('bisonLastOrder');
}

async function startOrderTracking(orderId) {
  if (trackedOrderId === orderId) return;
  if (trackerSource) {
    trackerSource.close();
    trackerSource = null;
  }

  try {
    const res = await fetch(`/api/orders/${orderId}/track`);
    if (!res.ok) throw new Error('not found');
    const info = await res.json();

    trackedOrderId = orderId;
    trackerOrderIdEl.textContent = `#${orderId}`;
    orderTracker.hidden = false;
    renderTrackerStatus(info.status);

    if (info.status === 'delivered') return;

    trackerSource = new EventSource(`/api/orders/${orderId}/track/stream`);
    trackerSource.addEventListener('status', event => {
      const data = JSON.parse(event.data);
      renderTrackerStatus(data.status);
      if (data.status === 'delivered') {
        trackerSource.close();
        trackerSource = null;
      }
    });
  } catch (err) {
    console.error(err);
    localStorage.removeItem('bisonLastOrder');
  }
}

function openCartModal() {
  loadCart();
  openModal(cartModal);

  const last = JSON.parse(localStorage.getItem('bisonLastOrder') || 'null');
  if (last && last.id) startOrderTracking(last.id);
}

function registerUser(event) {
  event.preventDefault();
  const name = document.getElementById('register-name').value.trim();
  const email = document.getElementById('register-email').value.trim().toLowerCase();
  const password = document.getElementById('register-password').value;

  if (!name || !email || !password) {
    showAccountMessage(t('fillAll'), true);
    return;
  }

  const accounts = getAccounts();
  if (accounts[email]) {
    showAccountMessage('Email already registered.', true);
    return;
  }

  accounts[email] = { name, password };
  saveAccounts(accounts);
  saveCurrentUser(email, name);
  updateAccountUI();
  showAccountMessage(t('accountCreated'));
  setTimeout(() => closeModal(accountModal), 700);
}

function loginUser(event) {
  event.preventDefault();
  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const password = document.getElementById('login-password').value;

  if (!email || !password) {
    showAccountMessage(t('fillAll'), true);
    return;
  }

  const accounts = getAccounts();
  const account = accounts[email];
  if (!account || account.password !== password) {
    showAccountMessage(t('invalidLogin'), true);
    return;
  }

  saveCurrentUser(email, account.name);
  updateAccountUI();
  showAccountMessage(t('loggedIn'));
  setTimeout(() => closeModal(accountModal), 700);
}

function logoutUser() {
  clearCurrentUser();
  updateAccountUI();
  showAccountMessage(t('loggedOut'));
}

async function submitCheckout(event) {
  event.preventDefault();
  const name = deliveryNameInput.value.trim();
  const phone = deliveryPhoneInput.value.trim();
  const address = deliveryAddressInput.value.trim();
  const notes = deliveryNotesInput.value.trim();

  if (!name || !phone || !address) {
    showCartMessage(t('fillFields'), true);
    return;
  }

  const cart = getCart();
  if (cart.length === 0) {
    showCartMessage(t('cartEmpty'), true);
    return;
  }

  checkoutSubmitBtn.disabled = true;
  checkoutSubmitBtn.textContent = t('placingOrder');
  showCartMessage('');

  try {
    const location = typeof window.getCheckoutLocation === 'function' ? window.getCheckoutLocation() : null;
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer: { name, phone, address, notes },
        items: cart,
        location
      })
    });

    if (!res.ok) throw new Error(`server responded ${res.status}`);
    const order = await res.json();

    saveCart([]);
    updateCartCount();
    loadCart();
    checkoutForm.reset();
    if (typeof window.resetCheckoutLocation === 'function') window.resetCheckoutLocation();
    localStorage.setItem('bisonLastOrder', JSON.stringify({ id: order.id }));
    startOrderTracking(order.id);
    showCartMessage(t('orderPlaced', { orderId: order.id }));
  } catch (err) {
    console.error(err);
    showCartMessage(t('orderFailed'), true);
  } finally {
    checkoutSubmitBtn.disabled = getCart().length === 0;
    checkoutSubmitBtn.textContent = t('placeOrder');
  }
}

async function submitContact(event) {
  event.preventDefault();
  const name = document.getElementById('contact-name').value.trim();
  const email = document.getElementById('contact-email').value.trim();
  const message = document.getElementById('contact-message').value.trim();

  if (!name || !email || !message) {
    contactStatus.textContent = t('fillAll');
    contactStatus.style.color = '#c0392b';
    return;
  }

  contactSubmitBtn.disabled = true;
  contactSubmitBtn.textContent = t('contactSending');
  contactStatus.textContent = '';

  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message })
    });

    if (!res.ok) throw new Error(`server responded ${res.status}`);

    contactForm.reset();
    contactStatus.textContent = t('contactSent');
    contactStatus.style.color = '#0a8f2f';
  } catch (err) {
    console.error(err);
    contactStatus.textContent = t('contactFailed');
    contactStatus.style.color = '#c0392b';
  } finally {
    contactSubmitBtn.disabled = false;
    contactSubmitBtn.textContent = t('contactSendBtn');
  }
}

loginForm.addEventListener('submit', loginUser);
registerForm.addEventListener('submit', registerUser);
loginTab.addEventListener('click', () => setActiveTab('login'));
registerTab.addEventListener('click', () => setActiveTab('register'));
logoutBtn.addEventListener('click', logoutUser);
accountLink.addEventListener('click', event => {
  event.preventDefault();
  openModal(accountModal);
  setActiveTab('login');
  showAccountMessage('');
});
cartButton.addEventListener('click', event => {
  event.preventDefault();
  openCartModal();
});
if (langEn) {
  langEn.addEventListener('click', event => {
    event.preventDefault();
    setLanguage('en');
  });
}
if (langDe) {
  langDe.addEventListener('click', event => {
    event.preventDefault();
    setLanguage('de');
  });
}
closeButtons.forEach(button => {
  button.addEventListener('click', () => {
    closeModal(button.closest('.modal-overlay'));
  });
});
if (trackerCloseBtn) {
  trackerCloseBtn.addEventListener('click', stopOrderTracking);
}

document.body.addEventListener('click', event => {
  const link = event.target.closest('.card a');
  if (!link) return;
  if (link.textContent.trim().toLowerCase() !== 'order now') return;
  event.preventDefault();
  const card = link.closest('.card');
  const name = card.querySelector('h3').textContent.trim();
  const price = parsePrice(card.querySelector('span').textContent);
  addItemToCart(name, price);
});

cartItemsContainer.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button || !button.dataset.name) return;
  const name = button.dataset.name;
  if (button.classList.contains('quantity-btn')) {
    changeCartQuantity(name, button.dataset.action === 'increase' ? 1 : -1);
    return;
  }
  if (button.classList.contains('remove-btn')) {
    removeCartItem(name);
  }
});

checkoutForm.addEventListener('submit', submitCheckout);
contactForm.addEventListener('submit', submitContact);

applyLanguage();
updateAccountUI();

window.applyLanguage = applyLanguage;
