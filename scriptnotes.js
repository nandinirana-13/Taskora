document.addEventListener('DOMContentLoaded', function () {

    // ================== ELEMENTS ==================
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

    // Toolbar
    const boldBtn = document.getElementById('boldBtn');
    const italicBtn = document.getElementById('italicBtn');
    const underlineBtn = document.getElementById('underlineBtn');
    const strikeBtn = document.getElementById('strikeBtn');
    const headingBtn = document.getElementById('headingBtn');
    const listBtn = document.getElementById('listBtn');
    const checklistBtn = document.getElementById('checklistBtn');
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');

    // ================== DATA ==================
    let notes = JSON.parse(localStorage.getItem('notes')) || [];
    let currentNoteId = null;

    // ================== INIT ==================
    function initApp() {
        renderNotesList();
        updateWordCount();

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

    // ================== CREATE ==================
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

        showToast('New note created');
    }

    // ================== OPEN ==================
    function openNote(noteId) {
        const note = notes.find(n => n.id === noteId);
        if (!note) return;

        currentNoteId = note.id;
        noteTitle.value = note.title;
        noteContent.innerHTML = note.content;

        const date = new Date(note.updatedAt);
        lastSaved.textContent = `Last saved: ${formatDate(date)}`;

        updateWordCount();
        deleteNoteBtn.style.display = 'flex';

        document.querySelectorAll('.note-item').forEach(item => {
            item.classList.remove('active');
        });

        const activeItem = document.querySelector(`.note-item[data-id="${noteId}"]`);
        if (activeItem) activeItem.classList.add('active');
    }

    // ================== SAVE ==================
    function saveCurrentNote() {
        if (currentNoteId === null) return;

        const index = notes.findIndex(n => n.id === currentNoteId);
        if (index === -1) return;

        notes[index].title = noteTitle.value || 'Untitled Note';
        notes[index].content = noteContent.innerHTML;
        notes[index].updatedAt = new Date().toISOString();

        saveNotesToStorage();
        renderNotesList();

        const date = new Date(notes[index].updatedAt);
        lastSaved.textContent = `Last saved: ${formatDate(date)}`;

        showToast('Note saved');
    }

    // ================== DELETE ==================
    function deleteCurrentNote() {
        if (currentNoteId === null) return;

        if (confirm('Delete this note?')) {
            notes = notes.filter(n => n.id !== currentNoteId);
            saveNotesToStorage();
            renderNotesList();

            showToast('Note deleted');

            if (notes.length > 0) {
                openNote(notes[0].id);
            } else {
                noteTitle.value = '';
                noteContent.innerHTML = '<p>Start typing your note here...</p>';
                currentNoteId = null;
                deleteNoteBtn.style.display = 'none';
            }
        }
    }

    // ================== SEARCH ==================
    function searchNotes(query) {
        if (!query) return renderNotesList();

        const filtered = notes.filter(n =>
            n.title.toLowerCase().includes(query.toLowerCase()) ||
            stripHtml(n.content).toLowerCase().includes(query.toLowerCase())
        );

        renderNotesList(filtered);
    }

    // ================== RENDER ==================
    function renderNotesList(listToRender = notes) {
        notesList.innerHTML = '';

        if (listToRender.length === 0) {
            notesList.innerHTML = '<div>No notes found</div>';
            return;
        }

        listToRender.forEach(note => {
            const item = document.createElement('div');
            item.className = 'note-item';
            item.dataset.id = note.id;

            item.innerHTML = `
                <div>${note.title}</div>
                <div>${stripHtml(note.content)}</div>
                <div>${formatDate(new Date(note.updatedAt))}</div>
            `;

            item.onclick = () => openNote(note.id);
            notesList.appendChild(item);
        });
    }

    // ================== STORAGE ==================
    function saveNotesToStorage() {
        localStorage.setItem('notes', JSON.stringify(notes));
    }

    // ================== HELPERS ==================
    function stripHtml(html) {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        return temp.textContent || '';
    }

    function updateWordCount() {
        const text = stripHtml(noteContent.innerHTML);
        const words = text.trim().split(/\s+/).filter(w => w.length > 0);
        wordCount.textContent = `${words.length} words`;
    }

    function formatDate(date) {
        return date.toLocaleString();
    }

    function showToast(msg) {
        toastMessage.textContent = msg;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 2000);
    }

    function execCmd(cmd, val = null) {
        document.execCommand(cmd, false, val);
        noteContent.focus();
    }

    // ================== EVENTS ==================
    addNoteBtn.onclick = createNewNote;
    saveNoteBtn.onclick = saveCurrentNote;
    deleteNoteBtn.onclick = deleteCurrentNote;

    searchInput.oninput = () => searchNotes(searchInput.value);

    noteContent.oninput = updateWordCount;

    let timer;
    noteContent.addEventListener('input', () => {
        clearTimeout(timer);
        timer = setTimeout(saveCurrentNote, 1500);
    });

    noteTitle.addEventListener('input', () => {
        clearTimeout(timer);
        timer = setTimeout(saveCurrentNote, 1500);
    });

    // Toolbar
    boldBtn.onclick = () => execCmd('bold');
    italicBtn.onclick = () => execCmd('italic');
    underlineBtn.onclick = () => execCmd('underline');
    strikeBtn.onclick = () => execCmd('strikeThrough');
    headingBtn.onclick = () => execCmd('formatBlock', '<h2>');
    listBtn.onclick = () => execCmd('insertUnorderedList');
    checklistBtn.onclick = () =>
        execCmd('insertHTML', '<div><input type="checkbox"> Task</div>');
    undoBtn.onclick = () => execCmd('undo');
    redoBtn.onclick = () => execCmd('redo');

    // ================== START ==================
    initApp();
});
