// Timeline functionality with zoom levels
const timeline = {
    events: [],
    zoomLevel: 'all', // 'key' | 'mid' | 'all'
    
    init() {
        this.loadEvents();
        this.setupEventListeners();
        this.renderTimeline();
    },
    
    loadEvents() {
        const stored = localStorage.getItem('timelineEvents');
        this.events = stored ? JSON.parse(stored) : [];
        // Sort events by date
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
        
        // Zoom buttons
        document.getElementById('zoomOutBtn').onclick = () => this.setZoom('key');
        document.getElementById('zoomMidBtn').onclick = () => this.setZoom('mid');
        document.getElementById('zoomInBtn').onclick = () => this.setZoom('all');
        
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
    
    setZoom(level) {
        this.zoomLevel = level;
        document.getElementById('zoomOutBtn').classList.remove('active');
        document.getElementById('zoomMidBtn').classList.remove('active');
        document.getElementById('zoomInBtn').classList.remove('active');
        
        if (level === 'key') {
            document.getElementById('zoomOutBtn').classList.add('active');
        } else if (level === 'mid') {
            document.getElementById('zoomMidBtn').classList.add('active');
        } else {
            document.getElementById('zoomInBtn').classList.add('active');
        }
        
        this.renderTimeline();
    },
    
    getVisibleEvents() {
        if (this.zoomLevel === 'key') {
            return this.events.filter(e => e.importance === 'key');
        } else if (this.zoomLevel === 'mid') {
            return this.events.filter(e => e.importance === 'key' || e.importance === 'major');
        } else {
            return this.events; // 'all'
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
    
    getYearFromDate(dateString) {
        return new Date(dateString).getFullYear();
    },
    
    renderTimeline() {
        const container = document.getElementById('timeline');
        container.innerHTML = '';
        
        const visibleEvents = this.getVisibleEvents();
        
        if (visibleEvents.length === 0) {
            container.innerHTML = '<p class="no-events">No events at this zoom level. Add events or adjust zoom.</p>';
            return;
        }
        
        // Create SVG for the timeline line
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'timeline-svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        svg.setAttribute('viewBox', '0 0 1000 300');
        
        // Draw horizontal line
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', '50');
        line.setAttribute('y1', '150');
        line.setAttribute('x2', '950');
        line.setAttribute('y2', '150');
        line.setAttribute('stroke', '#3498db');
        line.setAttribute('stroke-width', '3');
        svg.appendChild(line);
        
        // Calculate spacing
        const spacing = 900 / (visibleEvents.length - 1 || 1);
        
        // Draw dots and labels
        visibleEvents.forEach((event, index) => {
            const x = 50 + (index * spacing);
            
            // Determine dot color and size based on importance
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
            
            // Draw dot
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', x);
            circle.setAttribute('cy', '150');
            circle.setAttribute('r', dotRadius);
            circle.setAttribute('fill', dotColor);
            circle.setAttribute('stroke', 'white');
            circle.setAttribute('stroke-width', '2');
            circle.setAttribute('class', 'timeline-dot');
            circle.setAttribute('data-event-id', event.id);
            svg.appendChild(circle);
            
            // Get year from date
            const year = this.getYearFromDate(event.date);
            
            // Add title text above dot
            const titleText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            titleText.setAttribute('x', x);
            titleText.setAttribute('y', '130');
            titleText.setAttribute('text-anchor', 'middle');
            titleText.setAttribute('class', 'timeline-title');
            titleText.setAttribute('data-event-id', event.id);
            titleText.textContent = event.title;
            svg.appendChild(titleText);
            
            // Add year text below dot
            const yearText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            yearText.setAttribute('x', x);
            yearText.setAttribute('y', '180');
            yearText.setAttribute('text-anchor', 'middle');
            yearText.setAttribute('class', 'timeline-year');
            yearText.setAttribute('data-event-id', event.id);
            yearText.textContent = year;
            svg.appendChild(yearText);
            
            // Add hover effect and click to show details
            circle.addEventListener('click', () => this.showEventDetails(event));
            circle.addEventListener('mouseover', () => {
                circle.setAttribute('r', dotRadius + 3);
                titleText.setAttribute('font-weight', 'bold');
                yearText.setAttribute('font-weight', 'bold');
            });
            circle.addEventListener('mouseout', () => {
                circle.setAttribute('r', dotRadius);
                titleText.setAttribute('font-weight', 'normal');
                yearText.setAttribute('font-weight', 'normal');
            });
            
            titleText.addEventListener('click', () => this.showEventDetails(event));
            yearText.addEventListener('click', () => this.showEventDetails(event));
            
            titleText.addEventListener('mouseover', () => {
                circle.setAttribute('r', dotRadius + 3);
                titleText.setAttribute('font-weight', 'bold');
                yearText.setAttribute('font-weight', 'bold');
            });
            titleText.addEventListener('mouseout', () => {
                circle.setAttribute('r', dotRadius);
                titleText.setAttribute('font-weight', 'normal');
                yearText.setAttribute('font-weight', 'normal');
            });
            
            yearText.addEventListener('mouseover', () => {
                circle.setAttribute('r', dotRadius + 3);
                titleText.setAttribute('font-weight', 'bold');
                yearText.setAttribute('font-weight', 'bold');
            });
            yearText.addEventListener('mouseout', () => {
                circle.setAttribute('r', dotRadius);
                titleText.setAttribute('font-weight', 'normal');
                yearText.setAttribute('font-weight', 'normal');
            });
        });
        
        container.appendChild(svg);
    },
    
    showEventDetails(event) {
        // Create and show event details in a popup or card
        const details = `
            <div class="event-details-popup" onclick="timeline.closePopup(event)">
                <div class="event-details-card" onclick="event.stopPropagation()">
                    <h3>${event.title}</h3>
                    <p><strong>Date:</strong> ${event.date}</p>
                    <p><strong>Description:</strong> ${event.description}</p>
                    <p><strong>Importance:</strong> <span class="importance-badge importance-${event.importance}">${event.importance}</span></p>
                    <button onclick="timeline.deleteEvent(${event.id})">Delete Event</button>
                    <button onclick="timeline.closePopup(event)" class="close-btn">Close</button>
                </div>
            </div>
        `;
        
        // Remove existing popup if any
        const existingPopup = document.querySelector('.event-details-popup');
        if (existingPopup) existingPopup.remove();
        
        // Create popup element
        const popup = document.createElement('div');
        popup.innerHTML = details;
        document.body.appendChild(popup);
    },
    
    closePopup() {
        const popup = document.querySelector('.event-details-popup');
        if (popup) popup.remove();
    }
};

document.addEventListener('DOMContentLoaded', () => timeline.init());
