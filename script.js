'use strict';

class TodoList {
    constructor() {
        this.todos = [];
        this.form = document.getElementById('todo-form');
        this.input = document.getElementById('todo-input');
        this.list = document.getElementById('todo-list');
        this.autoDeleteCheckbox = document.getElementById('auto-delete-checkbox');
        this.disableAlertCheckbox = document.getElementById('disable-alert-checkbox');

        this.loadTodos();
        this.attachEventListeners();
    }

    attachEventListeners() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTodo();
        });

        this.list.addEventListener('click', (e) => {
            const todoItem = e.target.closest('.todo-item');
            if (!todoItem) return;

            const id = parseInt(todoItem.dataset.id);

            if (e.target.classList.contains('delete-btn')) {
                this.deleteTodo(id);
            }
        });

        this.list.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox') {
                const todoItem = e.target.closest('.todo-item');
                const id = parseInt(todoItem.dataset.id);
                this.toggleTodo(id);
            }
        });
    }

    sanitizeInput(input) {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }

    formatDate(date) {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    }

    addTodo() {
        const todoText = this.input.value.trim();

        if (todoText) {
            const todo = {
                id: Date.now(),
                text: this.sanitizeInput(todoText),
                completed: false,
                created: new Date().toISOString()
            };

            this.todos.push(todo);
            this.saveTodos();
            this.renderTodos();
            this.input.value = '';
        }
    }

    toggleTodo(id) {
        this.todos = this.todos.map(todo => {
            if (todo.id === id) {
                const updatedTodo = { ...todo, completed: !todo.completed };

                // Automatically delete if auto-delete is enabled and task is completed
                if (this.autoDeleteCheckbox.checked && updatedTodo.completed) {
                    this.deleteTodo(id);
                    return null; // Skip adding this task back to the list
                }

                return updatedTodo;
            }
            return todo;
        }).filter(Boolean); // Remove null values
        this.saveTodos();
        this.renderTodos();
    }

    deleteTodo(id) {
        if (this.disableAlertCheckbox.checked || confirm('Are you sure you want to delete this task?')) {
            this.todos = this.todos.filter(todo => todo.id !== id);
            this.saveTodos();
            this.renderTodos();
        }
    }

    saveTodos() {
        try {
            localStorage.setItem('todos', JSON.stringify(this.todos));
        } catch (e) {
            console.error('Error saving todos:', e);
            alert('Failed to save todos. Please check your browser settings.');
        }
    }

    loadTodos() {
        try {
            const savedTodos = localStorage.getItem('todos');
            if (savedTodos) {
                const parsed = JSON.parse(savedTodos);
                if (!Array.isArray(parsed)) {
                    throw new Error('Invalid todos data structure');
                }
                this.todos = parsed;
                this.renderTodos();
            }
        } catch (e) {
            console.error('Error loading todos:', e);
            this.todos = [];
            localStorage.removeItem('todos');
        }
    }

    renderTodos() {
        this.list.innerHTML = '';

        this.todos.forEach(todo => {
            const li = document.createElement('li');
            li.className = 'todo-item';
            li.dataset.id = todo.id;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = todo.completed;

            const contentDiv = document.createElement('div');
            contentDiv.className = 'todo-content';
            if (todo.completed) {
                contentDiv.classList.add('completed');
            }

            const textSpan = document.createElement('span');
            textSpan.className = 'todo-text';
            textSpan.innerHTML = todo.text;

            const timestamp = document.createElement('span');
            timestamp.className = 'timestamp';
            timestamp.textContent = this.formatDate(todo.created);

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.className = 'delete-btn';

            contentDiv.appendChild(textSpan);
            contentDiv.appendChild(timestamp);

            li.appendChild(checkbox);
            li.appendChild(contentDiv);
            li.appendChild(deleteBtn);

            this.list.appendChild(li);
        });
    }
}

// Initialize the todo list when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const todoList = new TodoList();
});
