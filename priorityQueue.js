class PriorityQueue {
    constructor() {
        this.heap = [];
        this.size = 0;
    }

    // Helper methods for heap operations
    parent(index) {
        return Math.floor((index - 1) / 2);
    }

    leftChild(index) {
        return 2 * index + 1;
    }

    rightChild(index) {
        return 2 * index + 2;
    }

    swap(i, j) {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }

    // Insert a new task into the priority queue
    insert(task) {
        this.heap.push(task);
        this.size++;
        this.heapifyUp(this.size - 1);
    }

    // Remove and return the highest priority task
    remove() {
        if (this.size === 0) return null;

        const task = this.heap[0];
        this.heap[0] = this.heap[this.size - 1];
        this.heap.pop();
        this.size--;

        if (this.size > 0) {
            this.heapifyDown(0);
        }

        return task;
    }

    // Get the highest priority task without removing it
    peek() {
        return this.size > 0 ? this.heap[0] : null;
    }

    // Maintain heap property after insertion
    heapifyUp(index) {
        let current = index;
        while (current > 0 && this.heap[current].priority < this.heap[this.parent(current)].priority) {
            this.swap(current, this.parent(current));
            current = this.parent(current);
        }
    }

    // Maintain heap property after removal
    heapifyDown(index) {
        let current = index;
        let smallest = current;
        const left = this.leftChild(current);
        const right = this.rightChild(current);

        if (left < this.size && this.heap[left].priority < this.heap[smallest].priority) {
            smallest = left;
        }

        if (right < this.size && this.heap[right].priority < this.heap[smallest].priority) {
            smallest = right;
        }

        if (smallest !== current) {
            this.swap(current, smallest);
            this.heapifyDown(smallest);
        }
    }

    // Update a task's priority
    updateTask(taskId, newPriority) {
        const index = this.heap.findIndex(task => task.id === taskId);
        if (index === -1) return false;

        const oldPriority = this.heap[index].priority;
        this.heap[index].priority = newPriority;

        if (newPriority < oldPriority) {
            this.heapifyUp(index);
        } else {
            this.heapifyDown(index);
        }

        return true;
    }

    // Get all tasks in priority order
    getAllTasks() {
        return [...this.heap].sort((a, b) => a.priority - b.priority);
    }

    // Check if the queue is empty
    isEmpty() {
        return this.size === 0;
    }
} 