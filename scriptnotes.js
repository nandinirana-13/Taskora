document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const notesList = document.getElementById('notesList');
    const addNoteBtn = document.getElementById('addNoteBtn');
    const saveNoteBtn = document.getElementById('saveNoteBtn');
    const deleteNoteBtn = document.getElementById('deleteNoteBtn');
    const searchInput = document.getElementById('searchInput');
    const noteTitle = document.getElementById('noteTitle');
    const noteContent = document.getElementById('noteContent');
    const wordCount = document.getElementById('wordCount');
    const lastSaved = document.getElementById('lastSaved');
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');

    // Toolbar buttons
    const boldBtn = document.getElementById('boldBtn');
    const italicBtn = document.getElementById('italicBtn');
    const underlineBtn = document.getElementById('underlineBtn');
    const strikeBtn = document.getElementById('strikeBtn');
    const headingBtn = document.getElementById('headingBtn');
    const listBtn = document.getElementById('listBtn');
    const checklistBtn = document.getElementById('checklistBtn');
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');

    // Application state
    let notes = JSON.parse(localStorage.getItem('notes')) || [];
    let currentNoteId = null;

    // Initialize the app
    function initApp() {
        renderNotesList();
        updateWordCount();

        // If there are notes, open the first one
        if (notes.length > 0) {
            openNote(notes[0].id);
        } else {
            // If no notes, clear the editor
            currentNoteId = null;
            noteTitle.value = '';
            noteContent.innerHTML = '<p>Start typing your note here...</p>';
            lastSaved.textContent = 'Never saved';
            deleteNoteBtn.style.display = 'none';
        }
    }

    // Create a new note
    function createNewNote() {
        const newNote = {
            id: Date.now(),
            title: 'Untitled Note',
            content: '<p>Start typing your note here...</p>',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        notes.unshift(newNote);
        saveNotesToStorage();
        renderNotesList();
        openNote(newNote.id);

        // Show toast
        showToast('New note created');
    }

    // Open a note in the editor
    function openNote(noteId) {
        const note = notes.find(note => note.id === noteId);
        if (!note) return;

        currentNoteId = note.id;
        noteTitle.value = note.title;
        noteContent.innerHTML = note.content;

        // Update last saved date
        const date = new Date(note.updatedAt);
        lastSaved.textContent = `Last saved: ${formatDate(date)}`;

        // Update word count
        updateWordCount();

        // Show delete button
        deleteNoteBtn.style.display = 'flex';

        // Update active note in the list
        document.querySelectorAll('.note-item').forEach(item => {
            item.classList.remove('active');
        });

        const activeItem = document.querySelector(`.note-item[data-id="${noteId}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
            activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    // Save the current note
    function saveCurrentNote() {
        if (currentNoteId === null) return;

        const noteIndex = notes.findIndex(note => note.id === currentNoteId);
        if (noteIndex === -1) return;

        notes[noteIndex].title = noteTitle.value || 'Untitled Note';
        notes[noteIndex].content = noteContent.innerHTML;
        notes[noteIndex].updatedAt = new Date().toISOString();

        saveNotesToStorage();
        renderNotesList();

        // Update last saved date
        const date = new Date(notes[noteIndex].updatedAt);
        lastSaved.textContent = `Last saved: ${formatDate(date)}`;

        // Show toast
        showToast('Note saved successfully');
    }

    // Delete the current note
    function deleteCurrentNote() {
        if (currentNoteId === null) return;

        if (confirm('Are you sure you want to delete this note?')) {
            notes = notes.filter(note => note.id !== currentNoteId);
            saveNotesToStorage();
            renderNotesList();

            // Show toast
            showToast('Note deleted');

            // If there are notes, open the first one, otherwise clear the editor
            if (notes.length > 0) {
                openNote(notes[0].id);
            } else {
                currentNoteId = null;
                noteTitle.value = '';
                noteContent.innerHTML = '<p>Start typing your note here...</p>';
                lastSaved.textContent = 'Never saved';
                deleteNoteBtn.style.display = 'none';
            }
        }
    }

    // Search notes
    function searchNotes(query) {
        if (!query) {
            renderNotesList();
            return;
        }

        const filteredNotes = notes.filter(note =>
            note.title.toLowerCase().includes(query.toLowerCase()) ||
            stripHtml(note.content).toLowerCase().includes(query.toLowerCase())
        );

        renderNotesList(filteredNotes);
    }

    // Render the notes list
    function renderNotesList(notesToRender = notes) {
        notesList.innerHTML = '';

        if (notesToRender.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-notes';
            emptyMessage.textContent = 'No notes found';
            notesList.appendChild(emptyMessage);
            return;
        }

        notesToRender.forEach(note => {
            const noteItem = document.createElement('div');
            noteItem.className = 'note-item';
            noteItem.dataset.id = note.id;
            if (note.id === currentNoteId) {
                noteItem.classList.add('active');
            }

            const title = document.createElement('div');
            title.className = 'note-item-title';
            title.textContent = note.title;

            const preview = document.createElement('div');
            preview.className = 'note-item-preview';
            preview.textContent = stripHtml(note.content);

            const date = document.createElement('div');
            date.className = 'note-item-date';
            date.textContent = formatDate(new Date(note.updatedAt));

            noteItem.appendChild(title);
            noteItem.appendChild(preview);
            noteItem.appendChild(date);

            noteItem.addEventListener('click', () => openNote(note.id));

            notesList.appendChild(noteItem);
        });
    }

    // Save notes to local storage
    function saveNotesToStorage() {
        localStorage.setItem('notes', JSON.stringify(notes));
    }

    // Format date
    function formatDate(date) {
        const now = new Date();
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);

        if (date.toDateString() === now.toDateString()) {
            return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        } else if (date.toDateString() === yesterday.toDateString()) {
            return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    }

    // Strip HTML tags for preview
    function stripHtml(html) {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        return temp.textContent || temp.innerText || '';
    }

    // Update word count
    function updateWordCount() {
        const text = stripHtml(noteContent.innerHTML);
        const words = text.trim().split(/\s+/).filter(word => word.length > 0);
        wordCount.textContent = `${words.length} words`;
    }

    // Show toast notification
    function showToast(message) {
        toastMessage.textContent = message;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // Toolbar formatting functions
    function execFormatCommand(command, value = null) {
        document.execCommand(command, false, value);
        noteContent.focus();
    }

    // Event Listeners
    addNoteBtn.addEventListener('click', createNewNote);
    saveNoteBtn.addEventListener('click', saveCurrentNote);
    deleteNoteBtn.addEventListener('click', deleteCurrentNote);

    searchInput.addEventListener('input', () => {
        searchNotes(searchInput.value);
    });

    noteContent.addEventListener('input', updateWordCount);

    // Auto-save on content change (debounced)
    let saveTimeout;
    noteContent.addEventListener('input', () => {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(saveCurrentNote, 1500);  // Auto-save after 1.5s
    });

    noteTitle.addEventListener('input', () => {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(saveCurrentNote, 1500);  // Auto-save after 1.5s
    });

    // Toolbar event listeners
    boldBtn.addEventListener('click', () => execFormatCommand('bold'));
    italicBtn.addEventListener('click', () => execFormatCommand('italic'));
    underlineBtn.addEventListener('click', () => execFormatCommand('underline'));
    strikeBtn.addEventListener('click', () => execFormatCommand('strikeThrough'));

    headingBtn.addEventListener('click', () => execFormatCommand('formatBlock', '<h2>'));
    listBtn.addEventListener('click', () => execFormatCommand('insertUnorderedList'));
    checklistBtn.addEventListener('click', () => {
        execFormatCommand('insertHTML', '<div><input type="checkbox"> <span contenteditable="true">New item</span></div>');
    });

    undoBtn.addEventListener('click', () => execFormatCommand('undo'));
    redoBtn.addEventListener('click', () => execFormatCommand('redo'));

    // Initialize the app
    initApp();
    const content = document.getElementById("noteContent");
const title = document.getElementById("noteTitle");

function saveNote() {
  const note = {
    title: title.value,
    content: content.innerHTML
  };
  localStorage.setItem("note", JSON.stringify(note));
}

function loadNote() {
  const saved = JSON.parse(localStorage.getItem("note"));
  if (saved) {
    title.value = saved.title;
    content.innerHTML = saved.content;
  }
}

document.getElementById("saveNoteBtn").onclick = () => {
  saveNote();
  alert("Idea saved!");
};

loadNote();
});