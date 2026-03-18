// Timeline functionality
const timeline = {
    events: [],
    
    init() {
        this.loadEvents();
        this.setupEventListeners();
        this.renderEvents();
    },
    
    loadEvents() {
        const stored = localStorage.getItem('timelineEvents');
        this.events = stored ? JSON.parse(stored) : [];
    },
    
    saveEvents() {
        localStorage.setItem('timelineEvents', JSON.stringify(this.events));
    },
    
    setupEventListeners() {
        const addBtn = document.getElementById('addEventBtn');
        const modal = document.getElementById('eventModal');
        const closeBtn = document.querySelector('.close');
        const form = document.getElementById('eventForm');
        
        addBtn.onclick = () => modal.style.display = 'block';
        closeBtn.onclick = () => modal.style.display = 'none';
        window.onclick = (e) => {
            if (e.target === modal) modal.style.display = 'none';
        };
        
        form.onsubmit = (e) => {
            e.preventDefault();
            this.addEvent({
                title: document.getElementById('eventTitle').value,
                date: document.getElementById('eventDate').value,
                description: document.getElementById('eventDescription').value,
                importance: document.getElementById('eventImportance').value,
                id: Date.now()
            });
            form.reset();
            modal.style.display = 'none';
        };
    },
    
    addEvent(event) {
        this.events.push(event);
        this.saveEvents();
        this.renderEvents();
    },
    
    deleteEvent(id) {
        this.events = this.events.filter(e => e.id !== id);
        this.saveEvents();
        this.renderEvents();
    },
    
    renderEvents() {
        const container = document.querySelector('.timeline');
        container.innerHTML = '';
        
        this.events.forEach(event => {
            const div = document.createElement('div');
            div.className = `event-item importance-${event.importance}`;
            div.innerHTML = `
                <h3>${event.title}</h3>
                <p class="date">${event.date}</p>
                <p class="description">${event.description}</p>
                <p class="importance">Level: ${event.importance}</p>
                <button onclick="timeline.deleteEvent(${event.id})">Delete</button>
            `;
            container.appendChild(div);
        });
    }
};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => timeline.init());
