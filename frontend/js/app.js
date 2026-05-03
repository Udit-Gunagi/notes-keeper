// app.js - the entry point that ties everything together

const App = (() => {

  const showAuth = () => {
    document.getElementById('auth-page').classList.remove('hidden');
    document.getElementById('dashboard-page').classList.add('hidden');
  };

  const showDashboard = () => {
    document.getElementById('auth-page').classList.add('hidden');
    document.getElementById('dashboard-page').classList.remove('hidden');

    const user = Auth.getUser();
    if (user) {
      UI.populateSidebar(user);
    }

    // reload notes whenever we enter the dashboard
    Notes.loadNotes();
    lucide.createIcons();
  };

  const init = async () => {
    // init lucide icons
    lucide.createIcons();

    // init modules
    UI.init();
    Auth.init();
    Notes.init();

    // hide loading screen after a short delay regardless of what happens
    const hideLoader = () => {
      const loader = document.getElementById('loading-screen');
      const app = document.getElementById('app');
      loader.style.opacity = '0';
      loader.style.transition = 'opacity 0.4s ease';
      setTimeout(() => {
        loader.style.display = 'none';
        app.style.display = '';
      }, 400);
    };

    // check if user is already logged in
    if (Auth.isLoggedIn()) {
      try {
        // verify the stored token is still valid with the server
        await API.auth.me();
        showDashboard();
      } catch {
        // token expired or invalid - kick them back to login
        Auth.clearSession();
        showAuth();
      }
    } else {
      showAuth();
    }

    hideLoader();
  };

  // start everything once the DOM is ready
  document.addEventListener('DOMContentLoaded', init);

  return { showAuth, showDashboard };
})();
