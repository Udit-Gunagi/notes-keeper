// notes.js - manages note state, rendering, and all note interactions

const Notes = (() => {
  // local cache of all notes
  let allNotes = [];
  let currentView = 'all'; // 'all' or 'pinned'
  let editingNoteId = null; // null means we're creating, otherwise it's an id
  let pendingDeleteId = null;
  let selectedColor = '#ffffff';
  let searchTimeout = null;

  // format a date into a human-readable relative string
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 2) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'yesterday';
    if (days < 7) return `${days} days ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // build the html for a single note card
  const renderCard = (note, index) => {
    const card = document.createElement('div');
    card.className = 'note-card';
    card.dataset.id = note.id;
    card.style.background = note.color || '#ffffff';
    card.style.animationDelay = `${index * 40}ms`;

    card.innerHTML = `
      <div class="note-card-header">
        <h3 class="note-card-title">${escapeHtml(note.title)}</h3>
        <div class="note-card-actions">
          <button class="note-action-btn pin-btn ${note.pinned ? 'pin-active' : ''}" 
                  title="${note.pinned ? 'Unpin' : 'Pin'}" data-id="${note.id}">
            <i data-lucide="pin"></i>
          </button>
          <button class="note-action-btn edit-btn" title="Edit" data-id="${note.id}">
            <i data-lucide="pencil"></i>
          </button>
          <button class="note-action-btn delete-btn" title="Delete" data-id="${note.id}">
            <i data-lucide="trash-2"></i>
          </button>
        </div>
      </div>
      ${note.content ? `<p class="note-card-content">${escapeHtml(note.content)}</p>` : ''}
      <div class="note-card-footer">
        <span class="note-card-date">${formatDate(note.updated_at)}</span>
        ${note.pinned ? '<span class="pin-badge"><i data-lucide="pin"></i> Pinned</span>' : ''}
      </div>
    `;

    // attach button handlers
    card.querySelector('.pin-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      togglePin(note.id);
    });

    card.querySelector('.edit-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      openEditModal(note);
    });

    card.querySelector('.delete-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      confirmDelete(note.id);
    });

    // clicking anywhere on the card opens edit too
    card.addEventListener('click', () => openEditModal(note));

    return card;
  };

  // render all notes to the grid
  const renderNotes = (notes) => {
    const grid = document.getElementById('notes-grid');
    const emptyState = document.getElementById('empty-state');
    const countEl = document.getElementById('notes-count');

    grid.innerHTML = '';

    const visible = currentView === 'pinned'
      ? notes.filter(n => n.pinned)
      : notes;

    countEl.textContent = `${visible.length} ${visible.length === 1 ? 'note' : 'notes'}`;

    if (visible.length === 0) {
      emptyState.classList.remove('hidden');
      return;
    }

    emptyState.classList.add('hidden');
    visible.forEach((note, i) => {
      grid.appendChild(renderCard(note, i));
    });

    // re-init lucide icons for the newly added cards
    lucide.createIcons();
  };

  // load notes from the API
  const loadNotes = async (search = '') => {
    try {
      const data = await API.notes.getAll(search);
      allNotes = data.notes;
      renderNotes(allNotes);
    } catch (err) {
      // silently fail on load - user will just see empty state
      // which is fine for a fresh account
      allNotes = [];
      renderNotes([]);
    }
  };

  // toggle pinned state on a note
  const togglePin = async (id) => {
    try {
      const data = await API.notes.togglePin(id);
      // update the local cache instead of reloading everything
      const idx = allNotes.findIndex(n => n.id === id);
      if (idx !== -1) allNotes[idx] = data.note;
      renderNotes(allNotes);
      lucide.createIcons();
      UI.showToast(data.note.pinned ? 'Note pinned' : 'Note unpinned', 'info');
    } catch (err) {
      UI.showToast('Could not update pin', 'error');
    }
  };

  // --- modal logic ---

  const openCreateModal = () => {
    editingNoteId = null;
    selectedColor = '#ffffff';
    document.getElementById('modal-title-label').textContent = 'New Note';
    document.getElementById('note-title-input').value = '';
    document.getElementById('note-content-input').value = '';
    setActiveSwatch('#ffffff');
    UI.openModal();
  };

  const openEditModal = (note) => {
    editingNoteId = note.id;
    selectedColor = note.color || '#ffffff';
    document.getElementById('modal-title-label').textContent = 'Edit Note';
    document.getElementById('note-title-input').value = note.title;
    document.getElementById('note-content-input').value = note.content || '';
    setActiveSwatch(selectedColor);
    UI.openModal();
  };

  const setActiveSwatch = (color) => {
    document.querySelectorAll('.swatch').forEach(s => {
      s.classList.toggle('active', s.dataset.color === color);
    });
  };

  // save handler - called when the save button is clicked in the modal
  const saveNote = async () => {
    const title = document.getElementById('note-title-input').value.trim();
    const content = document.getElementById('note-content-input').value.trim();
    const saveBtn = document.getElementById('modal-save');

    if (!title) {
      UI.showToast('Please add a title', 'error');
      document.getElementById('note-title-input').focus();
      return;
    }

    saveBtn.disabled = true;

    try {
      if (editingNoteId) {
        const data = await API.notes.update(editingNoteId, { title, content, color: selectedColor });
        const idx = allNotes.findIndex(n => n.id === editingNoteId);
        if (idx !== -1) allNotes[idx] = data.note;
        UI.showToast('Note updated!', 'success');
      } else {
        const data = await API.notes.create(title, content, selectedColor);
        allNotes.unshift(data.note);
        UI.showToast('Note saved!', 'success');
      }

      UI.closeModal();
      renderNotes(allNotes);
      lucide.createIcons();
    } catch (err) {
      UI.showToast(err.message, 'error');
    } finally {
      saveBtn.disabled = false;
    }
  };

  // delete flow
  const confirmDelete = (id) => {
    pendingDeleteId = id;
    document.getElementById('delete-modal-backdrop').classList.remove('hidden');
  };

  const executeDelete = async () => {
    if (!pendingDeleteId) return;

    try {
      await API.notes.delete(pendingDeleteId);
      allNotes = allNotes.filter(n => n.id !== pendingDeleteId);
      renderNotes(allNotes);
      lucide.createIcons();
      UI.showToast('Note deleted', 'info');
    } catch (err) {
      UI.showToast('Could not delete note', 'error');
    } finally {
      pendingDeleteId = null;
      document.getElementById('delete-modal-backdrop').classList.add('hidden');
    }
  };

  // search with a small debounce so we don't spam the API on every keypress
  const initSearch = () => {
    const input = document.getElementById('search-input');
    const clearBtn = document.getElementById('search-clear');

    input.addEventListener('input', () => {
      const val = input.value;
      clearBtn.classList.toggle('hidden', !val);

      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => loadNotes(val), 300);
    });

    clearBtn.addEventListener('click', () => {
      input.value = '';
      clearBtn.classList.add('hidden');
      loadNotes();
    });
  };

  // color swatch picker
  const initSwatches = () => {
    document.querySelectorAll('.swatch').forEach(swatch => {
      swatch.addEventListener('click', () => {
        selectedColor = swatch.dataset.color;
        setActiveSwatch(selectedColor);
      });
    });
  };

  // sidebar nav view switching
  const initNavItems = () => {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        item.classList.add('active');

        currentView = item.dataset.view;
        const title = currentView === 'pinned' ? 'Pinned Notes' : 'All Notes';
        document.getElementById('section-title').textContent = title;

        renderNotes(allNotes);
        lucide.createIcons();

        // close sidebar on mobile after nav click
        if (window.innerWidth < 768) {
          UI.closeSidebar();
        }
      });
    });
  };

  const init = () => {
    initSearch();
    initSwatches();
    initNavItems();

    // new note buttons (fab and top bar)
    document.getElementById('fab-btn').addEventListener('click', openCreateModal);
    document.getElementById('new-note-top-btn').addEventListener('click', openCreateModal);

    // modal save/cancel
    document.getElementById('modal-save').addEventListener('click', saveNote);
    document.getElementById('modal-cancel').addEventListener('click', UI.closeModal);
    document.getElementById('modal-close').addEventListener('click', UI.closeModal);

    // delete confirm/cancel
    document.getElementById('delete-confirm').addEventListener('click', executeDelete);
    document.getElementById('delete-cancel').addEventListener('click', () => {
      pendingDeleteId = null;
      document.getElementById('delete-modal-backdrop').classList.add('hidden');
    });

    // close modal on backdrop click
    document.getElementById('note-modal-backdrop').addEventListener('click', (e) => {
      if (e.target === document.getElementById('note-modal-backdrop')) UI.closeModal();
    });
    document.getElementById('delete-modal-backdrop').addEventListener('click', (e) => {
      if (e.target === document.getElementById('delete-modal-backdrop')) {
        pendingDeleteId = null;
        e.target.classList.add('hidden');
      }
    });

    loadNotes();
  };

  return { init, loadNotes };
})();

// small helper to avoid XSS when rendering user content
function escapeHtml(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}
