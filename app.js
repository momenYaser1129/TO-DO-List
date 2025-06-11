// Initialize the priority queue
const taskQueue = new PriorityQueue();

// Task ID counter
let taskIdCounter = 1;

// DOM Elements
const taskForm = document.getElementById('taskForm');
const taskList = document.getElementById('taskList');
const taskCount = document.getElementById('taskCount');
const searchInput = document.getElementById('searchTask');
const filterPriority = document.getElementById('filterPriority');
const filterStatus = document.getElementById('filterStatus');
const currentTimeDisplay = document.getElementById('currentTime');

// Local Storage Keys
const STORAGE_KEY = 'taskManagerData';
const COUNTER_KEY = 'taskIdCounter';

// Load data from local storage
function loadFromLocalStorage() {
    try {
        const savedData = localStorage.getItem(STORAGE_KEY);
        const savedCounter = localStorage.getItem(COUNTER_KEY);
        
        if (savedData) {
            const tasks = JSON.parse(savedData);
            taskQueue.heap = tasks;
            taskQueue.size = tasks.length;
        }
        
        if (savedCounter) {
            taskIdCounter = parseInt(savedCounter);
        }
        
        updateTaskList();
        showNotification('Tasks loaded successfully', 'info');
    } catch (error) {
        showNotification('Error loading tasks from storage', 'error');
    }
}

// Save data to local storage
function saveToLocalStorage() {
    try {
        const tasks = taskQueue.getAllTasks();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
        localStorage.setItem(COUNTER_KEY, taskIdCounter.toString());
    } catch (error) {
        showNotification('Error saving tasks to storage', 'error');
    }
}

// Configure Toastr
$(document).ready(function() {
    toastr.options = {
        "closeButton": true,
        "debug": false,
        "newestOnTop": true,
        "progressBar": true,
        "positionClass": "toast-top-right",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "3000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    };
});

// Show notification function
function showNotification(message, type) {
    switch(type) {
        case 'success':
            toastr.success(message);
            break;
        case 'error':
            toastr.error(message);
            break;
        case 'warning':
            toastr.warning(message);
            break;
        case 'info':
            toastr.info(message);
            break;
    }
}

// Set min date for due date input to today
const dueDateInput = document.getElementById('taskDueDate');
const today = new Date();
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, '0');
const dd = String(today.getDate()).padStart(2, '0');
const minDate = `${yyyy}-${mm}-${dd}`;
dueDateInput.setAttribute('min', minDate);

// Update current time
function updateCurrentTime() {
    const now = new Date();
    currentTimeDisplay.textContent = now.toLocaleTimeString();
}
setInterval(updateCurrentTime, 1000);
updateCurrentTime();

// Event Listeners
taskForm.addEventListener('submit', handleTaskSubmit);
searchInput.addEventListener('input', updateTaskList);
filterPriority.addEventListener('change', updateTaskList);
filterStatus.addEventListener('change', updateTaskList);

// Input validation
function validateTaskInput(title, description, dueDate) {
    if (title.trim().length < 3) {
        throw new Error('Task title must be at least 3 characters long');
    }
    if (description.trim().length > 500) {
        throw new Error('Description cannot exceed 500 characters');
    }
    if (!dueDate) {
        throw new Error('Due date is required');
    }
}

// Handle form submission
function handleTaskSubmit(e) {
    e.preventDefault();

    try {
        const title = document.getElementById('taskTitle').value;
        const description = document.getElementById('taskDescription').value;
        const dueDateValue = document.getElementById('taskDueDate').value;
        
        validateTaskInput(title, description, dueDateValue);

        const selectedDate = new Date(dueDateValue);
        selectedDate.setHours(0,0,0,0);
        today.setHours(0,0,0,0);
        if (selectedDate < today) {
            throw new Error('Due date cannot be in the past!');
        }

        const task = {
            id: taskIdCounter++,
            title: title,
            description: description,
            priority: parseInt(document.getElementById('taskPriority').value),
            dueDate: dueDateValue,
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        taskQueue.insert(task);
        updateTaskList();
        saveToLocalStorage();
        taskForm.reset();
        showNotification('Task added successfully!', 'success');
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

// Filter tasks
function filterTasks(tasks) {
    const searchTerm = searchInput.value.toLowerCase();
    const priorityFilter = filterPriority.value;
    const statusFilter = filterStatus.value;

    return tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchTerm) ||
                            task.description.toLowerCase().includes(searchTerm);
        const matchesPriority = priorityFilter === 'all' || task.priority === parseInt(priorityFilter);
        const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
        return matchesSearch && matchesPriority && matchesStatus;
    });
}

// Update the task list display
function updateTaskList() {
    taskList.innerHTML = '';
    const tasks = taskQueue.getAllTasks();
    const filteredTasks = filterTasks(tasks);
    taskCount.textContent = `${filteredTasks.length} Tasks`;

    if (filteredTasks.length === 0) {
        taskList.innerHTML = `
            <div class="text-center text-muted py-5">
                <i class="fas fa-tasks fa-3x mb-3"></i>
                <p>No tasks found</p>
            </div>
        `;
        return;
    }

    filteredTasks.forEach(task => {
        const taskElement = createTaskElement(task);
        taskList.appendChild(taskElement);
    });
}

// Create a task element
function createTaskElement(task) {
    const div = document.createElement('div');
    div.className = `list-group-item task-item priority-${getPriorityClass(task.priority)}`;
    
    const priorityIcon = getPriorityIcon(task.priority);
    const statusIcon = task.status === 'completed' ? 'check-circle' : 'circle';
    const isOverdue = new Date(task.dueDate) < today && task.status !== 'completed';
    
    div.innerHTML = `
        <div class="d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center flex-grow-1">
                <div class="me-3">
                    <i class="fas fa-${statusIcon} ${task.status === 'completed' ? 'text-success' : 'text-muted'}"></i>
                </div>
                <div class="flex-grow-1">
                    <h5 class="mb-1 ${task.status === 'completed' ? 'completed' : ''}">${task.title}</h5>
                    <p class="mb-1 text-muted">${task.description}</p>
                    <div class="d-flex align-items-center">
                        <small class="text-muted me-3">
                            <i class="fas fa-calendar-alt me-1"></i>
                            ${formatDate(task.dueDate)}
                            ${isOverdue ? '<span class="badge bg-danger ms-1">Overdue</span>' : ''}
                        </small>
                        <small class="text-muted">
                            <i class="fas fa-flag me-1"></i>
                            ${priorityIcon} ${getPriorityText(task.priority)}
                        </small>
                    </div>
                </div>
            </div>
            <div class="task-actions">
                <button class="btn btn-sm btn-success me-2" onclick="completeTask(${task.id})">
                    <i class="fas fa-${task.status === 'completed' ? 'undo' : 'check'}"></i>
                    ${task.status === 'completed' ? 'Undo' : 'Complete'}
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteTask(${task.id})">
                    <i class="fas fa-trash"></i>
                    Delete
                </button>
            </div>
        </div>
    `;
    return div;
}

// Get priority class name
function getPriorityClass(priority) {
    switch (priority) {
        case 1: return 'high';
        case 2: return 'medium';
        case 3: return 'low';
        default: return 'medium';
    }
}

// Get priority text
function getPriorityText(priority) {
    switch (priority) {
        case 1: return 'High Priority';
        case 2: return 'Medium Priority';
        case 3: return 'Low Priority';
        default: return 'Medium Priority';
    }
}

// Get priority icon
function getPriorityIcon(priority) {
    switch (priority) {
        case 1: return '<i class="fas fa-arrow-up text-danger"></i>';
        case 2: return '<i class="fas fa-minus text-warning"></i>';
        case 3: return '<i class="fas fa-arrow-down text-success"></i>';
        default: return '<i class="fas fa-minus text-warning"></i>';
    }
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Complete/Undo task
function completeTask(taskId) {
    try {
        const tasks = taskQueue.getAllTasks();
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            task.status = task.status === 'completed' ? 'pending' : 'completed';
            updateTaskList();
            saveToLocalStorage();
            showNotification(`Task ${task.status === 'completed' ? 'completed' : 'marked as pending'}!`, 'success');
        }
    } catch (error) {
        showNotification('Error updating task status', 'error');
    }
}

// Delete task
function deleteTask(taskId) {
    try {
        const tasks = taskQueue.getAllTasks();
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            tasks.splice(taskIndex, 1);
            taskQueue.heap = tasks;
            taskQueue.size = tasks.length;
            updateTaskList();
            saveToLocalStorage();
            showNotification('Task deleted successfully!', 'success');
        }
    } catch (error) {
        showNotification('Error deleting task', 'error');
    }
}

// Initialize the task list and load from local storage
loadFromLocalStorage(); 