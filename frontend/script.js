class TodoApp {
  constructor() {
    this.apiUrl = "http://localhost:5000/api";
    this.todos = [];
    this.currentFilter = "all";

    this.taskInput = document.getElementById("taskInput");
    this.addBtn = document.getElementById("addBtn");
    this.todoList = document.getElementById("todoList");
    this.emptyState = document.getElementById("emptyState");
    this.filterBtns = document.querySelectorAll(".filter-btn");

    this.init();
  }

  init() {
    this.addBtn.addEventListener("click", () => this.addTask());
    this.taskInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.addTask();
    });

    this.filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => this.setFilter(btn.dataset.filter));
    });

    this.loadTodos();
  }

  async loadTodos() {
    try {
      const response = await fetch(`${this.apiUrl}/todos`);
      this.todos = await response.json();
      this.renderTodos();
    } catch (error) {
      console.error("Error loading todos:", error);
      this.showError("Failed to load tasks");
    }
  }

  async addTask() {
    const taskText = this.taskInput.value.trim();

    if (!taskText) {
      alert("Please enter a task!");
      return;
    }

    try {
      const response = await fetch(`${this.apiUrl}/todos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ task: taskText }),
      });

      const newTodo = await response.json();
      this.todos.unshift(newTodo);
      this.taskInput.value = "";
      this.renderTodos();
    } catch (error) {
      console.error("Error adding task:", error);
      this.showError("Failed to add task");
    }
  }

  async updateTask(id, updates) {
    try {
      const response = await fetch(`${this.apiUrl}/todos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      const updatedTodo = await response.json();
      const index = this.todos.findIndex((todo) => todo._id === id);
      if (index !== -1) {
        this.todos[index] = updatedTodo;
        this.renderTodos();
      }
    } catch (error) {
      console.error("Error updating task:", error);
      this.showError("Failed to update task");
    }
  }

  async deleteTask(id) {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      await fetch(`${this.apiUrl}/todos/${id}`, {
        method: "DELETE",
      });

      this.todos = this.todos.filter((todo) => todo._id !== id);
      this.renderTodos();
    } catch (error) {
      console.error("Error deleting task:", error);
      this.showError("Failed to delete task");
    }
  }

  setFilter(filter) {
    this.currentFilter = filter;
    this.filterBtns.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.filter === filter);
    });
    this.renderTodos();
  }

  getFilteredTodos() {
    switch (this.currentFilter) {
      case "completed":
        return this.todos.filter((todo) => todo.status);
      case "pending":
        return this.todos.filter((todo) => !todo.status);
      default:
        return this.todos;
    }
  }

  renderTodos() {
    const filteredTodos = this.getFilteredTodos();

    if (filteredTodos.length === 0) {
      this.todoList.style.display = "none";
      this.emptyState.style.display = "block";
      return;
    }

    this.todoList.style.display = "block";
    this.emptyState.style.display = "none";

    this.todoList.innerHTML = filteredTodos
      .map(
        (todo) => `
            <li class="todo-item ${todo.status ? "completed" : ""}" data-id="${
          todo._id
        }">
                <input 
                    type="checkbox" 
                    class="task-checkbox" 
                    ${todo.status ? "checked" : ""}
                    onchange="app.updateTask('${todo._id}', { task: '${
          todo.task
        }', status: this.checked })"
                >
                <span class="task-text" ondblclick="app.editTask('${
                  todo._id
                }')">${todo.task}</span>
                <div class="task-actions">
                    <button class="edit-btn" onclick="app.editTask('${
                      todo._id
                    }')">Edit</button>
                    <button class="delete-btn" onclick="app.deleteTask('${
                      todo._id
                    }')">Delete</button>
                </div>
            </li>
        `
      )
      .join("");
  }

  editTask(id) {
    const todo = this.todos.find((t) => t._id === id);
    if (!todo) return;

    const newTask = prompt("Edit task:", todo.task);
    if (newTask !== null && newTask.trim() !== "") {
      this.updateTask(id, { task: newTask.trim(), status: todo.status });
    }
  }

  showError(message) {
    alert(message);
  }
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.app = new TodoApp();
});
