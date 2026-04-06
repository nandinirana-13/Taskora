const form = document.querySelector(".input-area");
const input = document.getElementById("task-input");
const list = document.getElementById("task-list");
const emptyMsg = document.getElementById("empty-msg");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// SAVE
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// DISPLAY
function renderTasks() {
  list.innerHTML = "";

  if (tasks.length === 0) {
    emptyMsg.style.display = "block";
  } else {
    emptyMsg.style.display = "none";
  }

  tasks.forEach((task, index) => {
    const li = document.createElement("li");
    li.textContent = task;

    // CLICK TO DELETE
    li.onclick = () => {
      tasks.splice(index, 1);
      saveTasks();
      renderTasks();
    };

    list.appendChild(li);
  });
}

// ADD TASK
form.addEventListener("submit", (e) => {
  e.preventDefault(); // VERY IMPORTANT

  if (input.value.trim() === "") return;

  tasks.push(input.value);
  input.value = "";

  saveTasks();
  renderTasks();
});

// INITIAL LOAD
renderTasks();