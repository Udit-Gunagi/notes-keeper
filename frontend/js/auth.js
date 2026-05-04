// auth.js - handles login, register, logout, and session state

const Auth = (() => {
  const TOKEN_KEY = 'nk_token';
  const USER_KEY = 'nk_user';

  const saveSession = (token, user) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  };

  const clearSession = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  const getUser = () => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY));
    } catch {
      return null;
    }
  };

  const isLoggedIn = () => !!localStorage.getItem(TOKEN_KEY) && !!getUser();

  // wire up login form
  const initLoginForm = () => {
    const btn = document.getElementById('login-btn');
    const errorEl = document.getElementById('login-error');

    const showError = (msg) => {
      errorEl.textContent = msg;
      errorEl.classList.remove('hidden');
    };

    const hideError = () => errorEl.classList.add('hidden');

    btn.addEventListener('click', async () => {
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;

      hideError();

      if (!email || !password) {
        showError('Please fill in both fields.');
        return;
      }

      btn.disabled = true;
      btn.querySelector('span').textContent = 'Signing in...';

      try {
        const data = await API.auth.login(email, password);
        saveSession(data.token, data.user);
        App.showDashboard();
      } catch (err) {
        showError(err.message);
      } finally {
        btn.disabled = false;
        btn.querySelector('span').textContent = 'Sign In';
      }
    });

    // allow pressing enter to submit
    document.getElementById('login-password').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') btn.click();
    });
  };

  // wire up register form
  const initRegisterForm = () => {
    const btn = document.getElementById('register-btn');
    const errorEl = document.getElementById('register-error');

    const showError = (msg) => {
      errorEl.textContent = msg;
      errorEl.classList.remove('hidden');
    };

    const hideError = () => errorEl.classList.add('hidden');

    btn.addEventListener('click', async () => {
      const username = document.getElementById('reg-username').value.trim();
      const email = document.getElementById('reg-email').value.trim();
      const password = document.getElementById('reg-password').value;

      hideError();

      if (!username || !email || !password) {
        showError('All fields are required.');
        return;
      }

      btn.disabled = true;
      btn.querySelector('span').textContent = 'Creating account...';

      try {
        const data = await API.auth.register(username, email, password);
        saveSession(data.token, data.user);
        App.showDashboard();
      } catch (err) {
        showError(err.message);
      } finally {
        btn.disabled = false;
        btn.querySelector('span').textContent = 'Create Account';
      }
    });
  };

  // tab switching between login and register
  const initTabs = () => {
    const tabs = document.querySelectorAll('.auth-tab');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        if (tab.dataset.tab === 'login') {
          loginForm.classList.remove('hidden');
          registerForm.classList.add('hidden');
        } else {
          loginForm.classList.add('hidden');
          registerForm.classList.remove('hidden');
        }
      });
    });
  };

  const init = () => {
    initTabs();
    initLoginForm();
    initRegisterForm();

    document.getElementById('logout-btn').addEventListener('click', () => {
      clearSession();
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.height = '';
      App.showAuth();
      UI.showToast('You\'ve been signed out', 'info');
    });
  };

  return { init, isLoggedIn, getUser, clearSession };
})();
