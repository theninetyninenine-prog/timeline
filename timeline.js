// Timeline functionality with mouse wheel zoom
const timeline = {
    events: [],
    scale: 100,
    
    init() {
        this.loadEvents();
        this.setupEventListeners();
        this.renderTimeline();
    },
    
    loadEvents() {
        const stored = localStorage.getItem('timelineEvents');
        this.events = stored ? JSON.parse(stored) : [];
        this.events.sort((a, b) => new Date(a.date) - new Date(b.date));
    },
    
    saveEvents() {
        localStorage.setItem('timelineEvents', JSON.stringify(this.events));
    },
    
    setupEventListeners() {
        const addBtn = document.getElementById('addEventBtn');
        const modal = document.getElementById('eventModal');
        const closeBtn = document.querySelector('.close');
        const form = document.getElementById('eventForm');
        const timelineContainer = document.getElementById('timeline');
        
        // Mouse wheel zoom
        timelineContainer.addEventListener('wheel', (e) => {
            e.preventDefault();
            if (e.deltaY < 0) {
                this.scale = Math.min(this.scale + 50, 5000);
            } else {
                this.scale = Math.max(this.scale - 50, 100);
            }
            this.renderTimeline();
        }, { passive: false });
        
        addBtn.addEventListener('click', () => {
            modal.style.display = 'block';
        });
        
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
        
        form.addEventListener('submit', (e) => {
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
        });
    },
    
    getVisibleEvents() {
        if (this.scale < 500) {
            return this.events.filter(e => e.importance === 'key');
        } else if (this.scale < 2000) {
            return this.events.filter(e => e.importance === 'key' || e.importance === 'major');
        } else {
            return this.events;
        }
    },
    
    addEvent(event) {
        this.events.push(event);
        this.events.sort((a, b) => new Date(a.date) - new Date(b.date));
        this.saveEvents();
        this.renderTimeline();
    },
    
    deleteEvent(id) {
        this.events = this.events.filter(e => e.id !== id);
        this.saveEvents();
        this.renderTimeline();
    },
    
    formatDateLabel(dateString) {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][date.getMonth()];
        const day = date.getDate();
        
        if (this.scale < 500) {
            return year;
        } else if (this.scale < 2000) {
            return year;
        } else if (this.scale < 4000) {
            return `${month} ${year}`;
        } else {
            return `${month} ${day}, ${year}`;
        }
    },
    
    renderTimeline() {
        const container = document.getElementById('timeline');
        container.innerHTML = '';
        
        const visibleEvents = this.getVisibleEvents();
        
        if (visibleEvents.length === 0) {
            container.innerHTML = '<p class="no-events">No events at this zoom level. Add some events!</p>';
            return;
        }
        
        const totalWidth = 100 + (visibleEvents.length * this.scale);
        
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'timeline-svg');
        svg.setAttribute('width', totalWidth);
        svg.setAttribute('height', 300);
        
        // Draw line
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', '20');
        line.setAttribute('y1', '150');
        line.setAttribute('x2', totalWidth - 20);
        line.setAttribute('y2', '150');
        line.setAttribute('stroke', '#3498db');
        line.setAttribute('stroke-width', '3');
        svg.appendChild(line);
        
        const minDate = new Date(visibleEvents[0].date);
        const maxDate = new Date(visibleEvents[visibleEvents.length - 1].date);
        const timeRange = maxDate - minDate || 1;
        
        visibleEvents.forEach((event) => {
            const eventDate = new Date(event.date);
            const positionRatio = (eventDate - minDate) / timeRange;
            const x = 50 + (positionRatio * (totalWidth - 100));
            
            let dotColor, dotRadius;
            if (event.importance === 'key') {
                dotColor = '#e74c3c';
                dotRadius = 8;
            } else if (event.importance === 'major') {
                dotColor = '#f39c12';
                dotRadius = 6;
            } else {
                dotColor = '#27ae60';
                dotRadius = 4;
            }
            
            // Dot
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', x);
            circle.setAttribute('cy', '150');
            circle.setAttribute('r', dotRadius);
            circle.setAttribute('fill', dotColor);
            circle.setAttribute('stroke', 'white');
            circle.setAttribute('stroke-width', '2');
            circle.setAttribute('class', 'timeline-dot');
            circle.style.cursor = 'pointer';
            svg.appendChild(circle);
            
            // Title
            const titleText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            titleText.setAttribute('x', x);
            titleText.setAttribute('y', '120');
            titleText.setAttribute('text-anchor', 'middle');
            titleText.setAttribute('class', 'timeline-label');
            titleText.setAttribute('font-size', '12');
            titleText.textContent = event.title;
            titleText.style.cursor = 'pointer';
            svg.appendChild(titleText);
            
            // Date
            const dateText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            dateText.setAttribute('x', x);
            dateText.setAttribute('y', '180');
            dateText.setAttribute('text-anchor', 'middle');
            dateText.setAttribute('class', 'timeline-label');
            dateText.setAttribute('font-size', '11');
            dateText.setAttribute('fill', '#7f8c8d');
            dateText.textContent = this.formatDateLabel(event.date);
            dateText.style.cursor = 'pointer';
            svg.appendChild(dateText);
            
            // Event handlers
            const showDetails = () => this.showEventDetails(event);
            circle.addEventListener('click', showDetails);
            titleText.addEventListener('click', showDetails);
            dateText.addEventListener('click', showDetails);
            
            circle.addEventListener('mouseover', () => circle.setAttribute('r', dotRadius + 3));
            circle.addEventListener('mouseout', () => circle.setAttribute('r', dotRadius));
        });
        
        container.appendChild(svg);
    },
    
    showEventDetails(event) {
        const popup = document.createElement('div');
        popup.className = 'event-details-popup';
        popup.innerHTML = `
            <div class="event-details-card">
                <h3>${event.title}</h3>
                <p><strong>Date:</strong> ${event.date}</p>
                <p><strong>Description:</strong> ${event.description}</p>
                <p><strong>Importance:</strong> <span class="importance-badge importance-${event.importance}">${event.importance}</span></p>
                <button onclick="timeline.deleteEvent(${event.id})">Delete</button>
                <button onclick="timeline.closePopup()" class="close-btn">Close</button>
            </div>
        `;
        
        const existing = document.querySelector('.event-details-popup');
        if (existing) existing.remove();
        
        popup.addEventListener('click', (e) => {
            if (e.target === popup) this.closePopup();
        });
        
        document.body.appendChild(popup);
    },
    
    closePopup() {
        const popup = document.querySelector('.event-details-popup');
        if (popup) popup.remove();
    }
};

document.addEventListener('DOMContentLoaded', () => timeline.init());
