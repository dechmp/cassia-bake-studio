import './style.css'

document.querySelector('#app').innerHTML = `
<!-- MENU PANEL -->
<div id="menu-panel" class="menu-panel">
  <button id="menu-panel-close" class="menu-panel-close" aria-label="Close menu">×</button>

  <div id="menu-view-cats" class="menu-view">
    <p class="menu-panel-label">Our Products</p>
    <ul class="menu-cat-list">
      <li><button class="menu-cat-btn" data-cat="breads"><span class="menu-cat-name">Breads</span><span class="menu-cat-arrow">→</span></button></li>
      <li><button class="menu-cat-btn" data-cat="tarts"><span class="menu-cat-name">Cookies</span><span class="menu-cat-arrow">→</span></button></li>
      <li><button class="menu-cat-btn" data-cat="desserts"><span class="menu-cat-name">Desserts</span><span class="menu-cat-arrow">→</span></button></li>
      <li><button class="menu-cat-btn" data-cat="cakes"><span class="menu-cat-name">Celebration Cakes</span><span class="menu-cat-arrow">→</span></button></li>
      <li><button class="menu-cat-btn" data-cat="custom"><span class="menu-cat-name">Customized Cakes</span><span class="menu-cat-arrow">→</span></button></li>
      <li><button class="menu-cat-btn" data-cat="standard"><span class="menu-cat-name">Standard Cakes</span><span class="menu-cat-arrow">→</span></button></li>
      <li><button class="menu-cat-btn" data-cat="corporate"><span class="menu-cat-name">Corporate Orders</span><span class="menu-cat-arrow">→</span></button></li>
    </ul>
  </div>

  <div id="menu-view-products" class="menu-view" style="display:none;">
    <button id="menu-back-btn" class="menu-back-btn">← Back</button>
    <p id="menu-products-label" class="menu-panel-label"></p>
    <ul id="menu-products-list" class="menu-products-list"></ul>
  </div>

  <div id="menu-view-detail" class="menu-view menu-view-detail" style="display:none;">
    <button id="menu-detail-back" class="menu-back-btn">← Back</button>
    <div class="menu-detail-img" id="menu-detail-img"></div>
    <div class="menu-detail-body">
      <span class="menu-detail-tag" id="menu-detail-tag"></span>
      <h3 class="menu-detail-name" id="menu-detail-name"></h3>
      <p class="menu-detail-desc" id="menu-detail-desc"></p>
      <div class="menu-detail-footer">
        <span class="menu-detail-price" id="menu-detail-price"></span>
        <button class="btn-add-cart menu-detail-add-btn" id="menu-detail-add">Add to Cart</button>
      </div>
    </div>
  </div>
</div>
<div id="menu-panel-overlay" class="menu-panel-bg"></div>

<!-- FOUNDER MODAL -->
<div id="founder-modal" class="founder-modal-overlay">
  <div class="founder-modal">
    <button class="founder-modal-close" id="founder-modal-close">×</button>
    <img data-src="/lekha.jpeg" alt="Lekha, Founder of Cassia Bake Studio" class="founder-photo" id="founder-photo">
    <div class="founder-modal-body">
      <p class="founder-modal-label">Our Founder</p>
      <h2 class="founder-modal-name">Lekha</h2>
      <p class="founder-modal-quote">"Every loaf begins with intention. We bake not to fill shelves, but to feed the people we love."</p>
      <blockquote class="founder-fun-quote"><p>"I spent years managing frozen assets, but now I'm just trying to keep my butter from melting! I told my boss I was leaving to finally make some serious dough, then swapped my spreadsheets for flour sifters. Turns out, a perfect rise is way more rewarding than a fluctuating interest rate!"</p><cite>— Lekha</cite></blockquote>    </div>
  </div>
</div>

<div id="team-modal" class="founder-modal-overlay">
  <div class="founder-modal">
    <button class="founder-modal-close" id="team-modal-close">×</button>
    <img data-src="/team.jpg" alt="The Cassia Team" class="founder-photo" id="team-photo">
    <div class="founder-modal-body">
      <p class="founder-modal-label">Our Team</p>
      <h2 class="founder-modal-name">The Cassia Team</h2>
      <p class="founder-modal-quote">"Together we craft every bake with passion, precision and a deep love for the art of baking."</p>
    </div>
  </div>
</div>

<!-- CART DRAWER -->
<div id="cart-overlay" class="cart-overlay"></div>
<div id="cart-drawer" class="cart-drawer">
  <div class="cart-drawer-header">
    <span class="cart-drawer-title">Your Cart</span>
    <button id="cart-close" class="cart-close" aria-label="Close cart">×</button>
  </div>
  <div id="cart-items" class="cart-items"></div>
  <div id="cart-footer" class="cart-footer" style="display:none;">
    <div class="cart-total">
      <span>Total</span>
      <span id="cart-total-price"></span>
    </div>

    <!-- Step 1: Proceed -->
    <div id="cart-proceed-wrap">
      <button class="btn-proceed-order" id="btn-proceed-order">Proceed to Order →</button>
    </div>

    <!-- Step 2: Auth choice -->
    <div id="cart-auth-choice" class="cart-step" style="display:none;">
      <button class="cart-back-btn" id="btn-back-to-cart">← Back</button>
      <p class="cart-step-title">How would you like to continue?</p>
      <button class="btn-auth-primary" id="btn-continue-guest">Continue as Guest</button>
      <button class="btn-auth-secondary" id="btn-continue-login">I have an account</button>
      <p class="cart-auth-or">New here? <button class="btn-text-link" id="btn-show-register">Create an account</button></p>
    </div>

    <!-- Step 3a: Login -->
    <div id="cart-login-form" class="cart-step" style="display:none;">
      <button class="cart-back-btn" id="btn-back-from-login">← Back</button>
      <p class="cart-step-title">Login to your account</p>
      <div class="cart-form-group">
        <label class="form-label">Username</label>
        <input type="text" id="login-username" class="form-input" placeholder="your_username">
      </div>
      <div class="cart-form-group">
        <label class="form-label">Password</label>
        <input type="password" id="login-password" class="form-input" placeholder="••••••••">
      </div>
      <p id="login-error" class="cart-form-error" style="display:none;"></p>
      <button class="btn-submit" id="btn-do-login">Login</button>
      <p class="cart-auth-or">New here? <button class="btn-text-link" id="btn-show-register2">Create an account</button></p>
    </div>

    <!-- Step 3b: Register -->
    <div id="cart-register-form" class="cart-step" style="display:none;">
      <button class="cart-back-btn" id="btn-back-from-register">← Back</button>
      <p class="cart-step-title">Create an account</p>
      <div class="cart-form-group">
        <label class="form-label">Username</label>
        <input type="text" id="reg-username" class="form-input" placeholder="e.g. eleanor_m">
      </div>
      <div class="cart-form-row">
        <div class="cart-form-group">
          <label class="form-label">First Name</label>
          <input type="text" id="reg-firstname" class="form-input" placeholder="Eleanor">
        </div>
        <div class="cart-form-group">
          <label class="form-label">Last Name</label>
          <input type="text" id="reg-lastname" class="form-input" placeholder="Marsh">
        </div>
      </div>
      <div class="cart-form-group">
        <label class="form-label">Email</label>
        <input type="email" id="reg-email" class="form-input" placeholder="you@example.com">
        <span class="field-error" id="reg-email-error"></span>
      </div>
      <div class="cart-form-group">
        <label class="form-label">Mobile Number</label>
        <input type="tel" id="reg-mobile" class="form-input" placeholder="+91 98765 43210">
      </div>
      <div class="cart-form-group">
        <label class="form-label">Password</label>
        <input type="password" id="reg-password" class="form-input" placeholder="••••••••">
      </div>
      <p id="register-error" class="cart-form-error" style="display:none;"></p>
      <button class="btn-submit" id="btn-do-register">Create Account</button>
    </div>

    <!-- Step 4: Order form -->
    <div id="cart-order-form" class="cart-step cart-order-form" style="display:none;">
      <button class="cart-back-btn" id="btn-back-from-order">← Back</button>
      <div id="cart-user-badge" class="cart-user-badge" style="display:none;"></div>
      <div class="cart-form-row">
        <div class="cart-form-group">
          <label class="form-label">First Name</label>
          <input type="text" id="form-firstname" class="form-input" placeholder="Eleanor">
        </div>
        <div class="cart-form-group">
          <label class="form-label">Last Name</label>
          <input type="text" id="form-lastname" class="form-input" placeholder="Marsh">
        </div>
      </div>
      <div class="cart-form-group">
        <label class="form-label">Email</label>
        <input type="email" id="form-email" class="form-input" placeholder="you@example.com">
        <span class="field-error" id="form-email-error"></span>
      </div>
      <div class="cart-form-group">
        <label class="form-label">Mobile Number</label>
        <input type="tel" id="form-mobile" class="form-input" placeholder="+91 98765 43210">
      </div>
      <div class="cart-form-group">
        <label class="form-label">Pickup Date</label>
        <input type="date" id="form-date" class="form-input">
      </div>
      <div class="cart-form-group">
        <label class="form-label">Notes / Special Requests</label>
        <textarea id="form-notes" class="form-textarea" placeholder="Allergies, dedication message..."></textarea>
      </div>
      <p id="order-form-error" class="cart-form-error" style="display:none;"></p>
      <button class="btn-submit" id="btn-order-submit" disabled>Place Order</button>
    </div>

    <button class="btn-continue-shopping" id="cart-continue">← Continue Shopping</button>
  </div>
</div>

<!-- MOBILE NAV OVERLAY -->
<div class="mobile-nav-overlay" id="mobile-nav-overlay">
  <nav class="mobile-nav-links">
    <a href="#" class="mobile-nav-btn" id="mobile-home-btn">Home <span class="mobile-nav-arrow">→</span></a>
    <button class="mobile-nav-btn" id="mobile-menu-btn">Products <span class="mobile-nav-arrow">→</span></button>
    <a href="#process" class="mobile-nav-btn" id="mobile-craft-link">Our Craft <span class="mobile-nav-arrow">→</span></a>
    <button class="mobile-nav-btn mobile-nav-subbtn" id="mobile-founder-btn">Our Founder <span class="mobile-nav-arrow">→</span></button>
    <button class="mobile-nav-btn mobile-nav-subbtn" id="mobile-team-btn">Our Team <span class="mobile-nav-arrow">→</span></button>
  </nav>
  <div class="mobile-nav-footer">
    <div class="mobile-nav-social">
      <a href="https://www.instagram.com/cassiathebakestudio/" target="_blank" rel="noopener noreferrer" class="social-link instagram">
        <svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
      </a>
      <a href="https://wa.me/919945602982" target="_blank" rel="noopener noreferrer" class="social-link whatsapp">
        <svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/></svg>
      </a>
    </div>
    <p class="mobile-nav-info">Mon–Sat, 9am–5pm · Indiranagar, Bangalore</p>
  </div>
</div>

<!-- NAV -->
<nav>
  <div class="nav-brand">
    <div class="nav-logo">
      <img src="/logo.jpg" alt="Cassia" class="nav-logo-img">
      <span class="nav-logo-text">Cassia The Bake Studio</span>
    </div>
    <div class="nav-social">
      <a href="https://www.instagram.com/cassiathebakestudio/" target="_blank" rel="noopener noreferrer" class="social-link instagram">
        <svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
      </a>
      <a href="https://wa.me/919945602982" target="_blank" rel="noopener noreferrer" class="social-link whatsapp">
        <svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/></svg>
      </a>
    </div>
  </div>
  <ul class="nav-links">
    <li><a href="#" id="home-nav-btn" class="menu-nav-trigger">Home</a></li>
    <li><button id="menu-nav-btn" class="menu-nav-trigger">Products</button></li>
    <li><a href="#process">Our Craft</a></li>
    <li class="nav-team-item">
      <button id="team-nav-btn" class="menu-nav-trigger">Our Team</button>
      <div class="team-dropdown" id="team-dropdown">
        <button class="team-dropdown-item" id="founder-note-btn">Our Founder</button>
        <button class="team-dropdown-item" id="team-member-btn">Our Team</button>
      </div>
    </li>
    <li><button id="cart-button" class="cart-nav-btn">Cart (<span id="cart-count">0</span>)</button></li>
  </ul>
  <!-- Mobile: cart count + hamburger -->
  <div class="nav-mobile-actions">
    <button class="mobile-cart-btn" id="cart-button-mobile">Cart (<span id="cart-count-mobile">0</span>)</button>
    <button class="nav-hamburger" id="nav-hamburger" aria-label="Open menu">
      <span></span><span></span><span></span>
    </button>
  </div>
</nav>

<!-- HERO -->
<section class="hero">
  <div class="hero-left">
    <p class="hero-eyebrow">Est. 2009 · Artisan Bakery</p>
    <h1 class="hero-title">Baked<br>with <em>intent</em></h1>
    <p class="hero-subtitle">Where slow fermentation meets patient hands. Every loaf, tart, and pastry tells the story of its ingredients.</p>
    <div class="hero-cta">
      <a href="#menu" class="btn-primary">See our Products</a>
    </div>
    <div class="hero-social">
      <a href="https://www.instagram.com/cassiathebakestudio/" target="_blank" rel="noopener noreferrer" class="social-link instagram">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      </a>
      <a href="https://wa.me/919945602982" target="_blank" rel="noopener noreferrer" class="social-link whatsapp">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
        </svg>
      </a>
    </div>
    <div class="hero-scroll-hint">
      <span class="scroll-line"></span>
      <span>Scroll to explore</span>
    </div>
  </div>
  <div class="hero-right">
    <div class="hero-illustration">
      <img src="/general.jpg" alt="Cassia Bake Studio" class="hero-img">
    </div>
  </div>
</section>

<!-- MARQUEE -->
<div class="marquee-wrap">
  <div class="marquee-track">
    <span class="marquee-item">Sourdough <span class="marquee-dot">·</span></span>
    <span class="marquee-item">Croissants <span class="marquee-dot">·</span></span>
    <span class="marquee-item">Tarts &amp; Galettes <span class="marquee-dot">·</span></span>
    <span class="marquee-item">Custom Orders <span class="marquee-dot">·</span></span>
    <span class="marquee-item">Seasonal Specials <span class="marquee-dot">·</span></span>
    <span class="marquee-item">Wedding Cakes <span class="marquee-dot">·</span></span>
    <span class="marquee-item">Morning Pastries <span class="marquee-dot">·</span></span>
    <span class="marquee-item">Artisan Breads <span class="marquee-dot">·</span></span>
    <span class="marquee-item">Sourdough <span class="marquee-dot">·</span></span>
    <span class="marquee-item">Croissants <span class="marquee-dot">·</span></span>
    <span class="marquee-item">Tarts &amp; Galettes <span class="marquee-dot">·</span></span>
    <span class="marquee-item">Custom Orders <span class="marquee-dot">·</span></span>
    <span class="marquee-item">Seasonal Specials <span class="marquee-dot">·</span></span>
    <span class="marquee-item">Wedding Cakes <span class="marquee-dot">·</span></span>
    <span class="marquee-item">Morning Pastries <span class="marquee-dot">·</span></span>
    <span class="marquee-item">Artisan Breads <span class="marquee-dot">·</span></span>
  </div>
</div>

<!-- MENU -->
<section class="menu" id="menu">
  <div class="section-header reveal">
    <div>
      <h2 class="section-title">Baked <em>daily</em><br>with purpose</h2>
    </div>
  </div>
  <div id="product-showcase" class="product-showcase"></div>
  <div id="home-product-detail" class="home-product-detail" style="display:none;">
    <div class="home-product-img-wrap" id="home-product-img-wrap">
      <div id="home-product-img" class="home-product-img-media"></div>
      <button class="home-product-arrow home-product-arrow--prev" id="home-product-prev" aria-label="Previous">&#8249;</button>
      <button class="home-product-arrow home-product-arrow--next" id="home-product-next" aria-label="Next">&#8250;</button>
    </div>
    <div class="home-product-body">
      <span class="home-product-tag" id="home-product-tag"></span>
      <h3 class="home-product-name" id="home-product-name"></h3>
      <p class="home-product-desc" id="home-product-desc"></p>
      <div class="home-product-footer">
        <span class="home-product-price" id="home-product-price"></span>
        <button class="btn-add-cart" id="home-product-add">Add to Cart</button>
      </div>
      <div class="home-product-nav">
        <button class="home-product-back" id="home-product-close">← Back</button>
        <span class="home-product-counter" id="home-product-counter"></span>
      </div>
    </div>
  </div>
</section>

<!-- PROCESS -->
<section class="process" id="process">
  <div class="reveal">
    <h2 class="section-title">How we <em>work</em></h2>
  </div>
  <div class="process-steps">
    <div class="step reveal">
      <h3 class="step-title">Source</h3>
      <p class="step-body">We partner directly with three farms within 80 miles. Heritage wheat varieties, unpasteurized dairy, and orchard fruit harvested to order.</p>
    </div>
    <div class="step reveal">
      <h3 class="step-title">Ferment</h3>
      <p class="step-body">Levain built across two days. No commercial yeast. Wild cultures, time, and temperature do all the work.</p>
    </div>
    <div class="step reveal">
      <h3 class="step-title">Shape</h3>
      <p class="step-body">Every piece shaped by hand. No molds. No machines. Slight asymmetry is a mark of honesty, not error.</p>
    </div>
    <div class="step reveal">
      <h3 class="step-title">Bake</h3>
      <p class="step-body">Stone deck oven at 500°. Scored with a blade. The oven does what only high heat can — caramelise, blister, bloom.</p>
    </div>
  </div>
</section>

<!-- TESTIMONIAL -->
<section class="testimonial">
  <div class="testimonial-track" id="testimonial-track">
    <div class="testimonial-slide active">
      <p class="testimonial-text">"I've eaten bread in Paris, in Naples, in Tokyo — and <em>nothing</em> has undone me quite like a loaf from Cassia still warm from the oven."</p>
      <span class="testimonial-author">— Priya Nair, Regular Since 2018</span>
    </div>
    <div class="testimonial-slide">
      <p class="testimonial-text">"The lemon tart is the most honest thing I have eaten in years. Sharp, buttery, and made with <em>real</em> care. I order one every single week."</p>
      <span class="testimonial-author">— Arjun Menon, Indiranagar</span>
    </div>
    <div class="testimonial-slide">
      <p class="testimonial-text">"Lekha baked our wedding cake and it was the centrepiece of the evening. Every guest asked for the name of the baker. <em>Unforgettable.</em>"</p>
      <span class="testimonial-author">— Deepika & Rohit Sharma, Koramangala</span>
    </div>
    <div class="testimonial-slide">
      <p class="testimonial-text">"The sourdough has ruined every other bread for me. That <em>crust</em>, that crumb — I don't know how she does it, but I hope she never stops."</p>
      <span class="testimonial-author">— Kavitha Krishnamurthy, Regular Since 2021</span>
    </div>
    <div class="testimonial-slide">
      <p class="testimonial-text">"We get the morning pastry box every Saturday. It has become a <em>ritual</em> for our family. The cardamom knots alone are worth the trip."</p>
      <span class="testimonial-author">— Suresh & Meena Iyer, Jayanagar</span>
    </div>
  </div>
  <div class="testimonial-dots" id="testimonial-dots">
    <button class="t-dot active" data-idx="0"></button>
    <button class="t-dot" data-idx="1"></button>
    <button class="t-dot" data-idx="2"></button>
    <button class="t-dot" data-idx="3"></button>
    <button class="t-dot" data-idx="4"></button>
  </div>
</section>


<!-- FOOTER -->
<footer id="footer">
  <div class="footer-top">
    <div class="footer-brand">
      <p class="brand-name">Cassia</p>
      <p class="footer-social">
        <a href="https://www.instagram.com/cassiathebakestudio/" target="_blank" rel="noopener noreferrer">Instagram</a> · 
        <a href="https://wa.me/919945602982" target="_blank" rel="noopener noreferrer">WhatsApp</a>
      </p>
      <p>Artisan baking on Millbrook Lane since 2009. Everything made by hand, from ingredients you can trace.</p>
    </div>
    <div>
      <p class="footer-col-title">Products</p>
      <ul class="footer-links">
        <li><a href="#menu">Breads</a></li>
        <li><a href="#menu">Pastries</a></li>
        <li><a href="#menu">Cakes</a></li>
        <li><a href="#menu">Seasonal</a></li>
      </ul>
    </div>
    <div>
      <p class="footer-col-title">Visit</p>
      <ul class="footer-links">
        <li><a href="#">Indiranagar</a></li>
        <li><a href="#">Bangalore, Karnataka</a></li>
        <li><a href="#">India</a></li>
        <li><a href="#">Tue–Sun 7am–3pm</a></li>
        <li><a href="#">(212) 555-BAKE</a></li>
      </ul>
    </div>
    <div>
      <p class="footer-col-title">Connect</p>
      <ul class="footer-links">
        <li><a href="https://www.instagram.com/cassiathebakestudio/" target="_blank" rel="noopener noreferrer">Instagram</a></li>
        <li><a href="https://wa.me/919945602982" target="_blank" rel="noopener noreferrer">WhatsApp</a></li>
        <li><a href="#">Newsletter</a></li>
        <li><a href="#">Wholesale</a></li>
      </ul>
    </div>
  </div>
  <div class="footer-bottom">
    <span class="footer-copy">© 2026 Cassia. All rights reserved.</span>
    <span class="footer-copy">Handmade with patience.</span>
  </div>
</footer>
`

// Menu panel data
const menuData = {
  breads: {
    label: 'Breads',
    anchor: '#menu-breads',
    products: [
      { name: 'Babka',                       desc: 'A rich, swirled loaf with layers of buttery dough twisted into a beautiful pattern.', price: 'From ₹749',  id: 'product-babka',         img: '/breads/babka.jpg' },
      { name: 'Cream Cheese Garlic Butter',  desc: 'Pillowy soft bread filled with whipped cream cheese and roasted garlic butter.',      price: 'From ₹849',  id: 'product-cc-garlic',     img: '/breads/CreamCheeseGarlicbutter.jpg' },
      { name: 'Nutella Pista Babka',         desc: 'Chocolate-hazelnut swirls with crushed pistachios baked into a golden, flaky loaf.',  price: 'From ₹899',  id: 'product-nutella-babka', img: '/breads/NutellaPistaBabka.jpeg' },
      { name: 'Pesto Cheese Babka',          desc: 'Fragrant basil pesto and melted cheese layered through a beautifully twisted babka.', price: 'From ₹849',  id: 'product-pesto-babka',   img: '/breads/PestoCheesebabka.jpeg' },
      { name: 'Jalapeno Cream Cheese Babka', desc: 'A spicy, creamy babka with jalapeños and cream cheese twisted through every layer.',   price: 'From ₹849',  id: 'product-jal-babka',     img: '/breads/PestoandCreamcheese.jpg' },
      { name: 'Korean Buns',                desc: 'Pillowy soft Korean-style buns with sweet, creamy fillings and a glossy golden crust.', price: 'From ₹399',  id: 'product-korean-buns',   img: '/breads/KoreanBuns.jpg' },
    ]
  },
  tarts: {
    label: 'Cookies',
    anchor: '#menu-tarts',
    products: [
      { name: 'Choco Chip Cookies', desc: 'Classic golden cookies loaded with pools of melted dark chocolate chips.',         price: 'From ₹349', id: 'product-chocochip',    img: '/Cookies/Chocochip.jpeg' },
      { name: 'Oats & Raisin Cookies', desc: 'Wholesome, chewy cookies with rolled oats, plump raisins and a hint of cinnamon.', price: 'From ₹349', id: 'product-oats-raisin',  img: '/Cookies/OatsRaisin.jpeg' },
      { name: 'Butter Cookies',     desc: 'Melt-in-the-mouth shortbread-style butter cookies with a delicate vanilla finish.',  price: 'From ₹349', id: 'product-butter-cookies', img: '/Cookies/buttercookies.jpeg' },
    ]
  },
  desserts: {
    label: 'Desserts',
    anchor: '#menu-desserts',
    products: [
      { name: 'Brownie',              desc: 'Dense, fudgy chocolate brownie with a crackly top and gooey centre.',           price: 'From ₹299', id: 'product-brownie',       img: '/desserts/Brownie.jpeg' },
      { name: 'Brownie Fudge',       desc: 'Extra-rich brownie loaded with chocolate fudge — indulgence in every bite.',     price: 'From ₹349', id: 'product-brownie-fudge', img: '/desserts/browniefudge.jpg' },
      { name: 'Handpainted Macaroons', desc: 'Artisan French macarons hand-painted with edible colours — as beautiful as they are delicious.', price: 'From ₹399', id: 'product-kunafa', img: '/desserts/handpainted.jpg' },
      { name: 'Chocolate Macaroons',   desc: 'Delicate French macarons filled with a rich, velvety chocolate ganache.',                                  price: 'From ₹349', id: 'product-lemon-mac',    img: '/desserts/chocolatemacaroons.jpg' },
      { name: 'Thandai Tres Leches',   desc: 'Milk-soaked sponge infused with aromatic thandai spices, topped with whipped cream.',                       price: 'From ₹449', id: 'product-tres-leches',  img: '/desserts/thandaitresleches.jpg' },
    ]
  },
  cakes: {
    label: 'Celebration Cakes',
    anchor: '#menu-cakes',
    products: [
      { name: 'Floral Birthday Cake', desc: 'Custom-designed floral birthday cake for every age and occasion.', price: 'From ₹7,999', id: 'product-cakes', whatsapp: true, img: '/Celeberationcakes/FloralBday.jpg' },
      { name: 'Milestone Birthday', desc: 'Mark life\'s biggest milestones with a stunning, personalised celebration cake.', price: '', id: 'product-milestone', whatsapp: true, img: '/Celeberationcakes/MileStoneBirthday.jpg' },
      { name: 'Floral Wedding Cake',   desc: 'A dreamy multi-tiered cake adorned with hand-crafted sugar florals and soft ivory tones.',         price: '', id: 'product-wedding-floral',  whatsapp: true, img: '/Celeberationcakes/Floral.jpg' },
      { name: 'Rosy Wedding Cake',     desc: 'Romantic rose-themed layers in blush and white — a timeless centrepiece for your special day.',   price: '', id: 'product-wedding-rosy',    whatsapp: true, img: '/Celeberationcakes/RoseWeddingcake.jpeg' },
      { name: 'Paw Patrol Cake',       desc: 'A fun, action-packed cake featuring the beloved Paw Patrol pups — perfect for every little hero.', price: '', id: 'product-animal',         whatsapp: true, img: '/Celeberationcakes/PawPetrol.jpg' },
      { name: 'Pink Themed Cake',      desc: 'Soft pink tiers adorned with elegant details — a beautiful cake for every pink-lover.',           price: '', id: 'product-pink-themed',    whatsapp: true, img: '/Celeberationcakes/PinkThemed.jpg' },
      { name: 'Harry Potter Cake',     desc: 'Magical Hogwarts-themed cake for every wizard and witch — buttercream spells included.',          price: '', id: 'product-harry-potter',   whatsapp: true, img: '/Celeberationcakes/HarryPotter.jpg' },
      { name: 'Anniversary Cakes', desc: 'Celebrate your love story with a beautifully crafted anniversary cake.', price: '', id: 'product-anniversary', whatsapp: true, img: '/Celeberationcakes/anniversaycake.jpeg' },
    ]
  },
  corporate: {
    label: 'Corporate Orders',
    anchor: '#menu-corporate',
    products: [
      { name: 'Corporate Gift Boxes',  desc: 'Elegantly curated hamper boxes filled with artisan baked goods — ideal for client gifting, festivals and team appreciation.', price: '', id: 'product-corp-boxes',   whatsapp: true, img: '/CorporateOrders/CoporateBoxes.jpeg' },
      { name: 'Corporate Goodies',     desc: 'Branded or personalised baked treats for events, launches and celebrations — minimum order quantities apply.', price: '', id: 'product-corp-goodies', whatsapp: true, img: '/CorporateOrders/Goodies.jpeg' },
    ]
  },
  standard: {
    label: 'Standard Cakes',
    anchor: '#menu-standard',
    products: [
      { name: 'Fresh Strawberry Cake',  desc: 'Light vanilla sponge layered with fresh strawberries and whipped cream — a classic crowd-pleaser.', price: 'From ₹1,299', id: 'product-std-strawberry', img: '/GenrealCakes/FreshStrawberryCake.jpg' },
      { name: 'Fresh Fruit Cake',       desc: 'Seasonal fruits piled high on a soft cream cake — colourful, refreshing and irresistible.',         price: 'From ₹1,199', id: 'product-std-freshfruit', img: '/GenrealCakes/FreshfruitCake.jpeg' },
      { name: 'Fruit Cake',             desc: 'A rich, moist cake packed with dried fruits and a hint of warm spice — perfect for every occasion.', price: 'From ₹999',  id: 'product-std-fruit',      img: '/GenrealCakes/FruitCake.jpg' },
      { name: 'Naked Fruit Cake',       desc: 'Rustic unfrosted layers of sponge with luscious cream and jewel-bright fresh fruits.',               price: 'From ₹1,499', id: 'product-std-naked',      img: '/GenrealCakes/NakedFruitCake.jpeg' },
      { name: 'Pineapple Cake',         desc: 'The timeless favourite — soft vanilla sponge, fresh pineapple chunks and smooth whipped cream.',     price: 'From ₹899',  id: 'product-std-pineapple',  img: '/GenrealCakes/Pineapplecake.jpg' },
    ]
  },
  custom: {
    label: 'Customized Cakes',
    anchor: '#menu-custom',
    products: [
      { name: 'Biryani Inspired Cake',   desc: 'A showstopper designed to look like a pot of biryani.',              price: '', id: 'product-custom-biryani',   tag: 'Custom', whatsapp: true, img: '/customizedcakes/BiryaniCake.webp' },
      { name: 'Princess Cake',           desc: 'Fondant roses, a tiara, and fairy-tale layers of sponge and cream.',  price: '', id: 'product-custom-princess',  whatsapp: true, img: '/customizedcakes/Princess.jpg' },
      { name: 'Cricket Fan Cake',        desc: 'A sculpted cake celebrating the sport they adore.',                   price: '', id: 'product-custom-cricket',   whatsapp: true, img: '/customizedcakes/cricketer.jpg' },
      { name: "Doctor's Cake",           desc: 'Custom designed with medical details that make it truly personal.',   price: '', id: 'product-custom-doctor',   whatsapp: true, img: '/customizedcakes/doctorcake.webp' },
      { name: 'Golf Theme Cake',         desc: 'Fondant greens, flags and a custom touch for the golfer.',            price: '', id: 'product-custom-golf',     whatsapp: true, img: '/customizedcakes/golf.jpg' },
      { name: "Grandad's Special",       desc: 'Personalised with love and filled with memories.',                    price: '', id: 'product-custom-grandad',  whatsapp: true, img: '/customizedcakes/grandad.jpg' },
      { name: 'Mini Mouse Cake',         desc: 'Fondant ears and polka dots — perfect for a first birthday.',         price: '', id: 'product-custom-minimouse',whatsapp: true, img: '/customizedcakes/minimouse.jpg' },
      { name: 'Party Time Cake',         desc: 'Bright, colourful and bursting with celebration.',                    price: '', id: 'product-custom-party',    whatsapp: true, img: '/customizedcakes/partytime.jpg' },
      { name: "Book Lover's Cake",       desc: 'Hand-crafted pages and fondant characters for the avid reader.',      price: '', id: 'product-custom-reader',   whatsapp: true, img: '/customizedcakes/reader.jpg' },
      { name: 'Treehouse Adventure Cake',desc: 'Multi-tier with fondant treehouse, figures and woodland details.',    price: '', id: 'product-custom-treehouse',whatsapp: true, img: '/customizedcakes/treehouse.jpg' },
    ]
  }
};

// ── Home page showcase (display only, no cart) ────────────────────────────────
const showcaseProducts = [
  { name: 'Breads',            desc: 'Slow-fermented sourdoughs, focaccias and artisan loaves baked fresh every morning.', price: 'From ₹749',   img: '/breads.jpeg',  cat: 'breads' },
  { name: 'Cookies',           desc: 'Buttery, hand-rolled cookies in seasonal flavours — from cardamom to dark chocolate.', price: 'From ₹349',  img: '/cookies.jpg',                    cat: 'tarts' },
  { name: 'Celebration Cakes', desc: 'Custom-designed for weddings, birthdays and every moment worth celebrating.',         price: 'From ₹7,999', img: '/celeberationcakes.jpeg',         cat: 'cakes' },
  { name: 'Desserts',          desc: 'Laminated pastries, kouign-amann, and sweet treats made with cultured butter.',       price: 'From ₹349',   img: '/Desserts.jpg', cat: 'desserts' },
  { name: 'Corporate Orders',  desc: 'Custom gift boxes and branded baked treats for teams, clients and corporate celebrations.', price: '', img: '/CorporateOrders/CoporateBoxes.jpeg', cat: 'corporate' },
  { name: 'Standard Cakes',    desc: 'Beautifully crafted everyday cakes — fresh fruit, pineapple, and more, made with the finest ingredients.', price: 'From ₹899', img: '/GenrealCakes/FreshfruitCake.jpeg', cat: 'standard' },
  { name: 'Customized Cakes',  desc: 'Bring your vision to life. We design bespoke cakes for every occasion and every story.', price: '', tag: 'Custom', img: '/image1.webp', cat: 'custom' },
];
document.getElementById('product-showcase').innerHTML = showcaseProducts.map((p, i) => `
  <div class="showcase-card reveal${p.cat ? ' showcase-card--linked' : ''}" data-showcase-idx="${i}">
    <div class="showcase-img-wrap">${p.img ? `<img src="${p.img}" alt="${p.name}">` : (p.svg || '')}</div>
    <div class="showcase-body">
      ${p.tag ? `<span class="product-tag">${p.tag}</span>` : ''}
      <h3 class="showcase-name">${p.name}</h3>
      <p class="showcase-desc">${p.desc}</p>
      <span class="showcase-price">${p.price}</span>
    </div>
  </div>
`).join('');

// showcase click handlers wired after openMenuPanel/showProductView are defined (see below)

const menuPanel     = document.getElementById('menu-panel');
const menuPanelBg   = document.getElementById('menu-panel-overlay');
const menuViewCats  = document.getElementById('menu-view-cats');
const menuViewProds = document.getElementById('menu-view-products');
const menuProdLabel = document.getElementById('menu-products-label');
const menuProdList  = document.getElementById('menu-products-list');

function openMenuPanel() {
  showCategoryView();
  menuPanel.classList.add('open');
  menuPanelBg.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeMenuPanel() {
  menuPanel.classList.remove('open');
  menuPanelBg.classList.remove('open');
  document.body.style.overflow = '';
}

function showCategoryView() {
  menuViewCats.style.display = 'block';
  menuViewProds.style.display = 'none';
  document.getElementById('menu-view-detail').style.display = 'none';
}

let currentCatKey = null;

function showProductView(catKey) {
  currentCatKey = catKey;
  const cat = menuData[catKey];
  menuProdLabel.textContent = cat.label;
  menuProdList.innerHTML = cat.products.map(p => `
    <li>
      <a href="#${p.id}" class="menu-product-link" data-id="${p.id}">
        <span class="menu-product-info">
          <span class="menu-product-name">${p.name}${p.tag ? `<span class="menu-product-tag">${p.tag}</span>` : ''}</span>
          <span class="menu-product-desc">${p.desc}</span>
        </span>
        ${p.price ? `<span class="menu-product-price">${p.price}</span>` : ''}
      </a>
    </li>
  `).join('');

  menuProdList.querySelectorAll('.menu-product-link').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const product = menuData[currentCatKey].products.find(p => p.id === a.dataset.id);
      if (product) showProductDetail(product);
    });
  });

  menuViewCats.style.display = 'none';
  menuViewProds.style.display = 'block';
  document.getElementById('menu-view-detail').style.display = 'none';
}

let currentProductIndex = 0;

function showProductDetail(product, index) {
  closeMenuPanel();

  const products = menuData[currentCatKey]?.products || [];
  currentProductIndex = index !== undefined ? index : products.findIndex(p => p.id === product.id);
  if (currentProductIndex < 0) currentProductIndex = 0;

  // Update prev/next buttons
  const prevBtn = document.getElementById('home-product-prev');
  const nextBtn = document.getElementById('home-product-next');
  const counter = document.getElementById('home-product-counter');
  prevBtn.disabled = currentProductIndex === 0;
  nextBtn.disabled = currentProductIndex === products.length - 1;
  counter.textContent = products.length > 1 ? `${currentProductIndex + 1} / ${products.length}` : '';

  const detailEl = document.getElementById('home-product-detail');
  const mediaEl  = document.getElementById('home-product-img');
  const bodyEl   = detailEl.querySelector('.home-product-body');
  const alreadyVisible = detailEl.style.display === 'grid';

  function applyProduct() {
    // image / htm / svg
    if (product.img) {
      const img = new Image();
      img.alt = product.name;
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
      img.onload  = () => { mediaEl.innerHTML = ''; mediaEl.appendChild(img); mediaEl.style.opacity = '1'; };
      img.onerror = () => { mediaEl.style.opacity = '1'; };
      mediaEl.style.opacity = '0';
      mediaEl.innerHTML = '';
      img.src = product.img; // set src AFTER onload so cached images fire correctly
    } else if (product.htm) {
      mediaEl.innerHTML = `<iframe src="${product.htm}" class="product-htm-frame" title="${product.name}" loading="lazy"></iframe>`;
      mediaEl.style.opacity = '1';
    } else if (product.svg) {
      mediaEl.innerHTML = product.svg;
      mediaEl.style.opacity = '1';
    } else {
      mediaEl.innerHTML = '';
      mediaEl.style.opacity = '1';
    }

    // text content
    const tagEl = document.getElementById('home-product-tag');
    tagEl.textContent  = product.tag || '';
    tagEl.style.display = product.tag ? 'inline-block' : 'none';
    document.getElementById('home-product-name').textContent = product.name;
    document.getElementById('home-product-desc').textContent = product.desc;
    const priceEl = document.getElementById('home-product-price');
    priceEl.textContent  = product.price || '';
    priceEl.style.display = product.price ? 'inline' : 'none';

    // add / whatsapp button
    const addBtn = document.getElementById('home-product-add');
    if (product.whatsapp) {
      addBtn.textContent = 'Get in touch with us';
      addBtn.onclick = () => window.open('https://wa.me/919945602982', 'cassia_whatsapp');
    } else {
      addBtn.textContent = 'Add to Cart';
      addBtn.onclick = () => {
        const _existing = cart.find(i => i.name === product.name);
        if (_existing) { _existing.qty += 1; } else { cart.push({ name: product.name, price: (product.price || '').replace(/^From\s+/, ''), qty: 1 }); }
        updateCartCount(); renderCart(); openCartDrawer();
      };
    }

    detailEl.style.display = 'grid';
    bodyEl.style.opacity = '1';
    if (!alreadyVisible) detailEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  if (alreadyVisible) {
    bodyEl.style.opacity = '0';
    setTimeout(applyProduct, 180);
  } else {
    applyProduct();
  }
}

document.getElementById('home-product-close').addEventListener('click', () => {
  if (currentCatKey) { openMenuPanel(); showProductView(currentCatKey); }
});

document.getElementById('home-product-prev').addEventListener('click', () => {
  const products = menuData[currentCatKey]?.products || [];
  if (currentProductIndex > 0) showProductDetail(products[currentProductIndex - 1], currentProductIndex - 1);
});

document.getElementById('home-product-next').addEventListener('click', () => {
  const products = menuData[currentCatKey]?.products || [];
  if (currentProductIndex < products.length - 1) showProductDetail(products[currentProductIndex + 1], currentProductIndex + 1);
});

// ── Hamburger / Mobile Nav ─────────────────────────────────────────────────────
const hamburgerBtn    = document.getElementById('nav-hamburger');
const mobileNavOverlay = document.getElementById('mobile-nav-overlay');

function openMobileNav() {
  mobileNavOverlay.classList.add('open');
  hamburgerBtn.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeMobileNav() {
  mobileNavOverlay.classList.remove('open');
  hamburgerBtn.classList.remove('open');
  document.body.style.overflow = '';
}

hamburgerBtn.addEventListener('click', () => {
  mobileNavOverlay.classList.contains('open') ? closeMobileNav() : openMobileNav();
});

document.getElementById('mobile-home-btn').addEventListener('click', closeMobileNav);
document.getElementById('mobile-menu-btn').addEventListener('click', () => {
  closeMobileNav(); openMenuPanel();
});
document.getElementById('mobile-founder-btn').addEventListener('click', () => {
  closeMobileNav();
  document.getElementById('founder-modal').classList.add('open');
});
document.getElementById('mobile-team-btn').addEventListener('click', () => {
  closeMobileNav();
  openTeamModal();
});

document.getElementById('cart-button-mobile').addEventListener('click', () => {
  renderCart(); openCartDrawer();
});

function openFounderModal() {
  const img = document.getElementById('founder-photo');
  if (img && img.dataset.src) { img.src = img.dataset.src; delete img.dataset.src; }
  document.getElementById('founder-modal').classList.add('open');
}
function openTeamModal() {
  const img = document.getElementById('team-photo');
  if (img && img.dataset.src) { img.src = img.dataset.src; delete img.dataset.src; }
  document.getElementById('team-modal').classList.add('open');
}

document.getElementById('founder-note-btn').addEventListener('click', () => {
  document.getElementById('team-dropdown').classList.remove('open');
  openFounderModal();
});
document.getElementById('founder-modal-close').addEventListener('click', () => {
  document.getElementById('founder-modal').classList.remove('open');
});
document.getElementById('founder-modal').addEventListener('click', (e) => {
  if (e.target === document.getElementById('founder-modal')) {
    document.getElementById('founder-modal').classList.remove('open');
  }
});

// Desktop "Our Team" dropdown
const teamDropdown = document.getElementById('team-dropdown');
document.getElementById('team-nav-btn').addEventListener('click', (e) => {
  e.stopPropagation();
  teamDropdown.classList.toggle('open');
});
document.getElementById('team-member-btn').addEventListener('click', () => {
  teamDropdown.classList.remove('open');
  openTeamModal();
});
document.getElementById('team-modal-close').addEventListener('click', () => {
  document.getElementById('team-modal').classList.remove('open');
});
document.getElementById('team-modal').addEventListener('click', (e) => {
  if (e.target === document.getElementById('team-modal'))
    document.getElementById('team-modal').classList.remove('open');
});
document.addEventListener('click', () => teamDropdown.classList.remove('open'));

document.getElementById('menu-nav-btn').addEventListener('click', openMenuPanel);

document.querySelectorAll('.showcase-card--linked').forEach(card => {
  const p = showcaseProducts[card.dataset.showcaseIdx];
  card.addEventListener('click', () => {
    openMenuPanel();
    showProductView(p.cat);
  });
});
document.getElementById('menu-panel-close').addEventListener('click', closeMenuPanel);
document.getElementById('menu-panel-overlay').addEventListener('click', closeMenuPanel);
document.getElementById('menu-back-btn').addEventListener('click', showCategoryView);
document.getElementById('menu-detail-back').addEventListener('click', () => showProductView(currentCatKey));

document.querySelectorAll('.menu-cat-btn').forEach(btn => {
  btn.addEventListener('click', () => showProductView(btn.dataset.cat));
});

// Scroll reveal
const reveals = document.querySelectorAll('.reveal');
const obs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
  });
}, { threshold: 0.12 });
reveals.forEach(r => obs.observe(r));

// cart state & helpers
const cart = [];

function updateCartCount() {
  const total = cart.reduce((s, i) => s + i.qty, 0);
  document.getElementById('cart-count').textContent = total;
  const mobileCount = document.getElementById('cart-count-mobile');
  if (mobileCount) mobileCount.textContent = total;
  const submitBtn = document.getElementById('btn-order-submit');
  if (submitBtn) submitBtn.disabled = cart.length === 0;
}

function openCartDrawer() {
  document.getElementById('cart-drawer').classList.add('open');
  document.getElementById('cart-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCartDrawer() {
  document.getElementById('cart-drawer').classList.remove('open');
  document.getElementById('cart-overlay').classList.remove('open');
  document.body.style.overflow = '';
  resetCartFlow();
  renderCart();
}

function renderCart() {
  const itemsEl = document.getElementById('cart-items');
  const footerEl = document.getElementById('cart-footer');
  const totalEl = document.getElementById('cart-total-price');

  if (cart.length === 0) {
    itemsEl.innerHTML = '<p class="cart-empty">Your cart is empty.</p>';
    footerEl.style.display = 'none';
    return;
  }

  itemsEl.innerHTML = cart.map((item, i) => `
    <div class="cart-item">
      <div class="cart-item-info">
        <span class="cart-item-name">${item.name}</span>
        <span class="cart-item-price">${item.price}</span>
      </div>
      <div class="cart-item-controls">
        <button class="cart-qty-btn" data-index="${i}" data-action="dec" aria-label="Decrease">−</button>
        <span class="cart-qty">${item.qty}</span>
        <button class="cart-qty-btn" data-index="${i}" data-action="inc" aria-label="Increase">+</button>
        <button class="cart-item-remove" data-index="${i}" aria-label="Remove item">Remove</button>
      </div>
    </div>
  `).join('');

  // wire qty and remove buttons
  itemsEl.querySelectorAll('.cart-qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const i = Number(btn.dataset.index);
      if (btn.dataset.action === 'inc') {
        cart[i].qty += 1;
      } else {
        cart[i].qty -= 1;
        if (cart[i].qty <= 0) cart.splice(i, 1);
      }
      updateCartCount();
      renderCart();
    });
  });
  itemsEl.querySelectorAll('.cart-item-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      cart.splice(Number(btn.dataset.index), 1);
      updateCartCount();
      renderCart();
    });
  });

  // total (strip ₹ and commas, sum raw numbers × qty)
  const total = cart.reduce((sum, item) => {
    const num = Number(item.price.replace(/[^0-9]/g, ''));
    return sum + num * item.qty;
  }, 0);
  totalEl.textContent = '₹' + total.toLocaleString('en-IN');
  footerEl.style.display = 'flex';
  // ensure proceed button is visible when cart is re-rendered with items
  const proceedWrap = document.getElementById('cart-proceed-wrap');
  if (proceedWrap && proceedWrap.style.display === 'none') {
    // don't reset if user is mid-checkout flow
  }
}

function attachAddToCartButtons() {
  document.querySelectorAll('.product-card').forEach(card => {
    if (card.querySelector('.btn-add-cart')) return;
    const btn = document.createElement('button');
    btn.className = 'btn-add-cart btn-secondary';
    btn.textContent = 'Add to Cart';
    card.querySelector('.product-body').appendChild(btn);
    btn.addEventListener('click', () => {
      const name = card.querySelector('.product-name').textContent;
      const priceText = card.querySelector('.product-price').textContent;
      const price = priceText.replace(/^From\s+/, '');
      const existing = cart.find(i => i.name === name);
      if (existing) { existing.qty += 1; } else { cart.push({ name, price, qty: 1 }); }
      updateCartCount();
      renderCart();
      openCartDrawer();
    });
  });
}

document.getElementById('cart-button').addEventListener('click', () => {
  renderCart();
  openCartDrawer();
});
document.getElementById('cart-close').addEventListener('click', closeCartDrawer);
document.getElementById('cart-overlay').addEventListener('click', closeCartDrawer);
document.getElementById('cart-continue').addEventListener('click', closeCartDrawer);

// ── Cart checkout flow ────────────────────────────────────────────────────────

let currentUser = null; // { firstName, lastName, email, mobile } after login/register

const CART_STEPS = ['cart-proceed-wrap', 'cart-auth-choice', 'cart-login-form', 'cart-register-form', 'cart-order-form'];

function showCartStep(stepId) {
  CART_STEPS.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  document.getElementById(stepId).style.display = 'block';
  if (stepId === 'cart-order-form') {
    const _d = new Date();
    const _min2 = new Date(_d.getFullYear(), _d.getMonth(), _d.getDate() + 2);
    document.getElementById('form-date').min = _min2.getFullYear() + '-' + String(_min2.getMonth() + 1).padStart(2, '0') + '-' + String(_min2.getDate()).padStart(2, '0');
  }
}

function resetCartFlow() {
  showCartStep('cart-proceed-wrap');
  ['form-firstname','form-lastname','form-email','form-mobile','form-date','form-notes'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.value = ''; el.readOnly = false; }
  });
  // Restore hidden personal detail rows
  document.getElementById('cart-order-form').querySelectorAll('.cart-form-row, .cart-form-group').forEach(el => {
    el.style.display = '';
  });
  const badge = document.getElementById('cart-user-badge');
  if (badge) badge.style.display = 'none';
}

function prefillOrderForm(user) {
  document.getElementById('form-firstname').value = user.firstName;
  document.getElementById('form-lastname').value  = user.lastName;
  document.getElementById('form-email').value     = user.email;
  document.getElementById('form-mobile').value    = user.mobile || '';
  // Hide personal detail rows — user is already identified
  document.getElementById('cart-order-form').querySelectorAll('.cart-form-row, .cart-form-group').forEach(el => {
    const input = el.querySelector('input, textarea');
    if (input && ['form-firstname','form-lastname','form-email','form-mobile'].includes(input.id)) {
      el.style.display = 'none';
    }
  });
  const badge = document.getElementById('cart-user-badge');
  badge.textContent = `Welcome back, ${user.firstName}! Just pick a date and place your order.`;
  badge.style.display = 'block';
}

// Proceed →
document.getElementById('btn-proceed-order').addEventListener('click', () => {
  if (currentUser) {
    prefillOrderForm(currentUser);
    showCartStep('cart-order-form');
  } else {
    showCartStep('cart-auth-choice');
  }
});

// Back to cart
document.getElementById('btn-back-to-cart').addEventListener('click', () => {
  showCartStep('cart-proceed-wrap');
});

// Guest
document.getElementById('btn-continue-guest').addEventListener('click', () => {
  currentUser = null;
  ['form-firstname','form-lastname','form-email','form-mobile'].forEach(id => {
    const el = document.getElementById(id);
    el.value = ''; el.readOnly = false;
  });
  document.getElementById('cart-user-badge').style.display = 'none';
  showCartStep('cart-order-form');
});

// I have an account
document.getElementById('btn-continue-login').addEventListener('click', () => {
  document.getElementById('login-username').value = '';
  document.getElementById('login-password').value = '';
  const loginErr = document.getElementById('login-error');
  loginErr.style.cssText = 'display:none;';
  showCartStep('cart-login-form');
});

// Show register from auth choice
document.getElementById('btn-show-register').addEventListener('click', () => {
  document.getElementById('register-error').style.display = 'none';
  showCartStep('cart-register-form');
});

// Show register from login form
document.getElementById('btn-show-register2').addEventListener('click', () => {
  document.getElementById('register-error').style.display = 'none';
  showCartStep('cart-register-form');
});

// Back buttons
document.getElementById('btn-back-from-login').addEventListener('click', () => showCartStep('cart-auth-choice'));
document.getElementById('btn-back-from-register').addEventListener('click', () => showCartStep('cart-auth-choice'));
document.getElementById('btn-back-from-order').addEventListener('click', () => showCartStep('cart-auth-choice'));

// Login
document.getElementById('btn-do-login').addEventListener('click', async () => {
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;
  const errEl    = document.getElementById('login-error');
  errEl.style.display = 'none';
  if (!username || !password) {
    errEl.textContent = 'Please enter your username and password.';
    errEl.style.display = 'block'; return;
  }
  const btn = document.getElementById('btn-do-login');
  btn.disabled = true; btn.textContent = 'Logging in…';
  try {
    const res  = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
    const data = await res.json();
    if (data.success) {
      currentUser = data.user;
      prefillOrderForm(data.user);
      showCartStep('cart-order-form');
    } else {
      errEl.textContent = data.error || 'Invalid email or password.';
      errEl.style.display = 'block';
    }
  } catch {
    errEl.textContent = 'Could not reach server. Please try again.';
    errEl.style.display = 'block';
  } finally {
    btn.disabled = false; btn.textContent = 'Login';
  }
});

// Register
document.getElementById('btn-do-register').addEventListener('click', async () => {
  const username  = document.getElementById('reg-username').value.trim();
  const firstName = document.getElementById('reg-firstname').value.trim();
  const lastName  = document.getElementById('reg-lastname').value.trim();
  const email     = document.getElementById('reg-email').value.trim();
  const mobile    = document.getElementById('reg-mobile').value.trim();
  const password  = document.getElementById('reg-password').value;
  const errEl     = document.getElementById('register-error');
  errEl.style.display = 'none';
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const missing = [];
  if (!username)   missing.push('Username');
  if (!firstName)  missing.push('First Name');
  if (!lastName)   missing.push('Last Name');
  if (!email)      missing.push('Email');
  if (!password)   missing.push('Password');
  if (missing.length) {
    errEl.textContent = 'Please fill in: ' + missing.join(', ');
    errEl.style.display = 'block'; return;
  }
  if (!emailRe.test(email)) {
    errEl.textContent = 'Please enter a valid email address (e.g. you@example.com).';
    errEl.style.display = 'block'; return;
  }
  const btn = document.getElementById('btn-do-register');
  btn.disabled = true; btn.textContent = 'Creating account…';
  try {
    const res  = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, firstName, lastName, email, mobile, password }) });
    const data = await res.json();
    if (data.success) {
      // Pre-fill username so user doesn't have to retype it
      document.getElementById('login-username').value = username;
      document.getElementById('login-password').value = '';
      // Show success message on the login form
      const loginErr = document.getElementById('login-error');
      loginErr.style.cssText = 'display:block; background:#f0f7f0; border-color:#b2d8b2; color:#2e7d32;';
      loginErr.textContent = 'Account created! Please login to continue.';
      showCartStep('cart-login-form');
    } else {
      errEl.textContent = data.error || 'Registration failed. Please try again.';
      errEl.style.display = 'block';
    }
  } catch (err) {
    console.error('Register error:', err);
    errEl.textContent = 'Could not reach server. Please try again.';
    errEl.style.display = 'block';
  } finally {
    btn.disabled = false; btn.textContent = 'Create Account';
  }
});

// ── Order submission ──────────────────────────────────────────────────────────
document.getElementById('btn-order-submit').addEventListener('click', async () => {
  const firstName  = document.getElementById('form-firstname').value.trim();
  const lastName   = document.getElementById('form-lastname').value.trim();
  const email      = document.getElementById('form-email').value.trim();
  const mobile     = document.getElementById('form-mobile').value.trim();
  const item       = cart.length ? cart[0].name : '';
  const pickupDate = document.getElementById('form-date').value;
  const notes      = document.getElementById('form-notes').value.trim();

  const orderErrEl = document.getElementById('order-form-error');
  orderErrEl.style.display = 'none';
  const _emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!firstName || !lastName || !email || !pickupDate) {
    orderErrEl.textContent = 'Please fill in all required fields (First Name, Last Name, Email, Pickup Date).';
    orderErrEl.style.display = 'block';
    return;
  }
  if (!_emailRe.test(email)) {
    orderErrEl.textContent = 'Please enter a valid email address (e.g. you@example.com).';
    orderErrEl.style.display = 'block';
    return;
  }
  const _now = new Date();
  const _min = new Date(_now.getFullYear(), _now.getMonth(), _now.getDate() + 2);
  const _minStr = _min.getFullYear() + '-' + String(_min.getMonth() + 1).padStart(2, '0') + '-' + String(_min.getDate()).padStart(2, '0');
  if (pickupDate < _minStr) {
    orderErrEl.textContent = 'Pickup date must be at least 2 days from today.';
    orderErrEl.style.display = 'block';
    return;
  }

  const submitBtn = document.getElementById('btn-order-submit');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending…';

  try {
    const res = await fetch('/api/send-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName, lastName, email, mobile, item, cartItems: cart, pickupDate, notes })
    });
    const data = await res.json();
    if (data.success) {
      submitBtn.textContent = '✓ Order Placed!';
      const badge = document.getElementById('cart-user-badge');
      badge.style.cssText = 'display:block; background:#f0f7f0; border-color:#b2d8b2; color:#2e7d32;';
      badge.textContent = 'Order placed! We\'ll be in touch soon. Close this panel to continue.';

      cart.length = 0;
      updateCartCount();
    } else {
      throw new Error(data.error || 'Unknown error');
    }
  } catch (err) {
    alert('Failed to send order. Please try again or contact us directly.');
    submitBtn.textContent = 'Place Order';
    submitBtn.disabled = false;
  }
});

updateCartCount();

// ── Email validation (inline, on blur) ────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function attachEmailValidation(inputId, errorId) {
  const input = document.getElementById(inputId);
  const errEl = document.getElementById(errorId);
  if (!input || !errEl) return;
  input.addEventListener('blur', () => {
    const val = input.value.trim();
    if (val && !EMAIL_RE.test(val)) {
      errEl.textContent = 'Please enter a valid email address.';
      input.classList.add('input-invalid');
    } else {
      errEl.textContent = '';
      input.classList.remove('input-invalid');
    }
  });
  input.addEventListener('input', () => {
    if (EMAIL_RE.test(input.value.trim())) {
      errEl.textContent = '';
      input.classList.remove('input-invalid');
    }
  });
}

attachEmailValidation('form-email', 'form-email-error');
attachEmailValidation('reg-email',  'reg-email-error');

// ── Testimonial carousel ───────────────────────────────────────────────────────
(function () {
  const slides = document.querySelectorAll('.testimonial-slide');
  const dots   = document.querySelectorAll('.t-dot');
  let current  = 0;
  let timer;

  function goTo(idx) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = idx;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
  }

  function next() { goTo((current + 1) % slides.length); }

  dots.forEach(dot => dot.addEventListener('click', () => {
    clearInterval(timer);
    goTo(Number(dot.dataset.idx));
    timer = setInterval(next, 5000);
  }));

  timer = setInterval(next, 5000);
})();


