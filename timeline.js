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
        
        addBtn.onclick = () => {
            modal.style.display = 'block';
        };
        
        closeBtn.onclick = () => {
            modal.style.display = 'none';
        };
        
        window.onclick = (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        };
        
        form.onsubmit = (e) => {
            e.preventDefault();
            
            const title = document.getElementById('eventTitle').value;
            const date = document.getElementById('eventDate').value;
            const description = document.getElementById('eventDescription').value;
            const importance = document.getElementById('eventImportance').value;
            
            this.addEvent({
                id: Date.now(),
                title: title,
                date: date,
                description: description,
                importance: importance
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
        
        if (this.events.length === 0) {
            container.innerHTML = '<p style="padding: 1rem; text-align: center; color: #999;">No events yet. Click "Add Event" to create one!</p>';
            return;
        }
        
        this.events.forEach(event => {
            const div = document.createElement('div');
            div.className = `event-item importance-${event.importance}`;
            div.innerHTML = `
                <h3>${event.title}</h3>
                <p class="date"><strong>Date:</strong> ${event.date}</p>
                <p class="description"><strong>Description:</strong> ${event.description}</p>
                <p class="importance"><strong>Level:</strong> ${event.importance}</p>
                <button onclick="timeline.deleteEvent(${event.id})">Delete</button>
            `;
            container.appendChild(div);
        });
    }
};

document.addEventListener('DOMContentLoaded', () => timeline.init());
