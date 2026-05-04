// ui.js - shared UI utilities: toasts, modals, sidebar toggle

const UI = (() => {

  // show a small toast notification at the bottom of the screen
  const showToast = (message, type = 'info') => {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<div class="toast-dot"></div><span>${message}</span>`;
    container.appendChild(toast);

    // auto-dismiss after 3 seconds
    setTimeout(() => {
      toast.style.animation = 'toastOut 0.25s ease forwards';
      toast.addEventListener('animationend', () => toast.remove());
    }, 3000);
  };

  const openModal = () => {
    const backdrop = document.getElementById('note-modal-backdrop');
    backdrop.classList.remove('hidden');
    // small delay so the animation plays after display:flex kicks in
    requestAnimationFrame(() => {
      backdrop.classList.add('modal-enter');
    });
    // focus the title input so the user can start typing right away
    setTimeout(() => {
      document.getElementById('note-title-input').focus();
    }, 50);
  };

  const closeModal = () => {
    const backdrop = document.getElementById('note-modal-backdrop');
    backdrop.classList.add('hidden');
    backdrop.classList.remove('modal-enter');
  };

  const openSidebar = () => {
    document.getElementById('sidebar').classList.add('open');
    document.getElementById('sidebar-overlay').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  };

  const closeSidebar = () => {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebar-overlay').classList.add('hidden');
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.height = '';
  };

  // fill in the user info in the sidebar header
  const populateSidebar = (user) => {
    const initial = user.username.charAt(0).toUpperCase();
    const avatar = document.getElementById('sidebar-avatar');
    avatar.textContent = initial;
    avatar.style.background = user.avatar_color || '#6C63FF';

    document.getElementById('sidebar-username').textContent = user.username;
    document.getElementById('sidebar-email').textContent = user.email;
  };

  const init = () => {
    document.getElementById('menu-btn').addEventListener('click', openSidebar);
    document.getElementById('sidebar-close').addEventListener('click', closeSidebar);
    document.getElementById('sidebar-overlay').addEventListener('click', closeSidebar);
  };

  return { showToast, openModal, closeModal, openSidebar, closeSidebar, populateSidebar, init };
})();
