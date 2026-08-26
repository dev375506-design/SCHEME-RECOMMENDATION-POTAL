function renderNav() {
  const user = typeof Auth !== 'undefined' ? Auth.getUser() : null;
  const path = window.location.pathname.split('/').pop() || 'index.html';

  const loggedOutLinks = `
    <a href="/directory.html" class="nav-link">Find Entrepreneurs</a>
    <a href="/map.html" class="nav-link">Map</a>
    <a href="/schemes.html" class="nav-link">Schemes</a>
    <a href="/register.html" class="nav-link">Register Business</a>
    <a href="/login.html" class="btn btn-primary btn-sm">Login</a>
  `;

  const loggedInLinks = `
    <a href="/directory.html" class="nav-link">Find Entrepreneurs</a>
    <a href="/map.html" class="nav-link">Map</a>
    <a href="/schemes.html" class="nav-link">Schemes</a>
    ${user && user.role === 'admin' ? '<a href="/admin.html" class="nav-link">Admin</a>' : '<a href="/dashboard.html" class="nav-link">Dashboard</a>'}
    <button id="logoutBtn" class="btn btn-outline btn-sm">Logout</button>
  `;

  const header = document.getElementById('site-header');
  if (header) {
    header.innerHTML = `
      <a href="#main" class="skip-link">Skip to content</a>
      <nav class="site-nav">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <a href="/index.html" class="flex items-center gap-2 font-display font-bold text-lg" style="color:var(--color-ink)">
            <span aria-hidden="true" style="background:var(--color-saffron); width:10px;height:10px;border-radius:3px;display:inline-block;"></span>
            Udyam Setu
          </a>
          <div class="hidden md:flex items-center gap-6">
            ${user ? loggedInLinks : loggedOutLinks}
          </div>
          <button id="mobileMenuBtn" class="md:hidden btn btn-outline btn-sm" aria-label="Open menu" aria-expanded="false">☰ Menu</button>
        </div>
        <div id="mobileMenu" class="md:hidden hidden border-t px-4 py-3 flex flex-col gap-3" style="border-color:var(--color-border)">
          ${user ? loggedInLinks : loggedOutLinks}
        </div>
      </nav>
    `;

    document.querySelectorAll('.nav-link').forEach((a) => {
      if (a.getAttribute('href') === `/${path}`) a.classList.add('active');
    });

    const mobileBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileBtn) {
      mobileBtn.addEventListener('click', () => {
        const isHidden = mobileMenu.classList.contains('hidden');
        mobileMenu.classList.toggle('hidden');
        mobileBtn.setAttribute('aria-expanded', String(isHidden));
      });
    }
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', () => Auth.logout());
  }

  const footer = document.getElementById('site-footer');
  if (footer) {
    footer.innerHTML = `
      <footer class="mt-16" style="background:var(--color-ink); color:#DCE7E4;">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid gap-8 md:grid-cols-3">
          <div>
            <div class="font-display font-bold text-lg text-white mb-2">Udyam Setu</div>
            <p class="text-sm" style="color:#B7C7C3;">A bridge (setu) connecting marginalised and local entrepreneurs to customers, government schemes and support — built for SIH 2026, Problem Statement 92.</p>
          </div>
          <div>
            <div class="font-semibold text-white mb-2 text-sm">Explore</div>
            <ul class="text-sm space-y-1" style="color:#B7C7C3;">
              <li><a href="/directory.html" class="hover:underline">Find Entrepreneurs</a></li>
              <li><a href="/map.html" class="hover:underline">Map</a></li>
              <li><a href="/schemes.html" class="hover:underline">Government Schemes</a></li>
              <li><a href="/register.html" class="hover:underline">Register Your Business</a></li>
            </ul>
          </div>
          <div>
            <div class="font-semibold text-white mb-2 text-sm">About this MVP</div>
            <p class="text-sm" style="color:#B7C7C3;">Demo data is clearly marked. Scheme information is seeded from publicly known official sources — always verify on the official portal before applying.</p>
          </div>
        </div>
        <div class="text-center text-xs py-4 border-t" style="border-color:rgba(255,255,255,0.12); color:#8FA29D;">
          Smart India Hackathon 2026 · Problem Statement 92 · Prototype for demonstration purposes
        </div>
      </footer>
    `;
  }
}

document.addEventListener('DOMContentLoaded', renderNav);
