'use strict';

class TodoList {
    constructor() {
        this.todos = [];
        this.form = document.getElementById('todo-form');
        this.input = document.getElementById('todo-input');
        this.list = document.getElementById('todo-list');
        this.disableAlertCheckbox = document.getElementById('disable-alert-checkbox');
        this.isDeleting = false; // Track if a task is being deleted

        this.loadSettings();
        this.loadTodos();
        this.attachEventListeners();
    }

    attachEventListeners() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTodo();
        });

		this.list.addEventListener('change', (e) => {
    		if (e.target.type === 'checkbox') {
        		const todoItem = e.target.closest('.todo-item');
        		const id = parseInt(todoItem.dataset.id);
		
        		// Check if the disable confirmation box setting is active
        		if (!this.disableAlertCheckbox.checked) {
            		const confirmAction = confirm('Are you sure you want to mark this task as complete?');
            		if (!confirmAction) {
                		// If the user cancels, reset the checkbox and exit
                		e.target.checked = false;
                		return;
            		}
        		}

		
        		// Prevent multiple checkboxes from being selected during deletion
        		if (this.isDeleting) {
            		e.target.checked = false;
            		return;
        		}
		
        		this.isDeleting = true; // Lock other checkboxes
		
        		this.completeAndRemoveTodoWithDelay(id, todoItem);
    		}
		});
	

        this.disableAlertCheckbox.addEventListener('change', () => {
            this.saveSettings();
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

    completeAndRemoveTodoWithDelay(id, todoItem) {
        // Add a CSS class for visual feedback
        todoItem.classList.add('removing');

        // Delay for visual effect
        setTimeout(() => {
            this.todos = this.todos.filter(todo => todo.id !== id);
            this.saveTodos();
            this.renderTodos();
            this.isDeleting = false; // Re-enable checkboxes after deletion
        }, 250);
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

    saveSettings() {
        const settings = {
            disableAlert: this.disableAlertCheckbox.checked
        };

        try {
            localStorage.setItem('todoSettings', JSON.stringify(settings));
        } catch (e) {
            console.error('Error saving settings:', e);
        }
    }

    loadSettings() {
        try {
            const savedSettings = localStorage.getItem('todoSettings');
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);
                this.disableAlertCheckbox.checked = settings.disableAlert || false;
            }
        } catch (e) {
            console.error('Error loading settings:', e);
        }
    }

	renderTodos() {
    	this.list.innerHTML = '';
	
    	this.todos
        	.sort((a, b) => new Date(b.created) - new Date(a.created)) // Sort from newest to oldest
        	.forEach(todo => {
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
	
            	const editButton = document.createElement('button');
            	editButton.className = 'edit-btn';
            	editButton.textContent = 'Edit';
            	editButton.addEventListener('click', () => this.editTodo(todo.id));

            	contentDiv.appendChild(textSpan);
            	contentDiv.appendChild(timestamp);
	
            	li.appendChild(checkbox);
            	li.appendChild(contentDiv);
            	li.appendChild(editButton);
	
            	this.list.appendChild(li);
        	});
	}
	
	editTodo(id) {
    	const todo = this.todos.find(todo => todo.id === id);
    	if (!todo) return;
	
    	const newText = prompt('Edit your task:', todo.text);
    	if (newText !== null && newText.trim() !== '') {
        	todo.text = this.sanitizeInput(newText.trim());
        	this.saveTodos();
        	this.renderTodos();
    	}
	}
	
}

// Initialize the todo list when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const todoList = new TodoList();
});
