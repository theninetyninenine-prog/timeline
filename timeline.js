// Timeline functionality with mouse wheel zoom
const timeline = {
    events: [],
    zoomLevel: 0, // 0 = key only, 1 = yearly, 2 = monthly, 3 = daily
    scale: 1, // Tracks actual zoom scale (100 to 10000+)
    
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
        const timelineContainer = document.getElementById('timeline');
        
        // Wheel zoom
        timelineContainer.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.handleZoom(e.deltaY);
        }, { passive: false });
        
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
    
    handleZoom(deltaY) {
        // Zoom in with scroll up (negative deltaY), zoom out with scroll down (positive deltaY)
        const zoomStep = 100;
        const minScale = 100;
        const maxScale = 50000; // Allow very detailed daily view
        
        if (deltaY < 0) {
            this.scale = Math.min(this.scale + zoomStep, maxScale);
        } else {
            this.scale = Math.max(this.scale - zoomStep, minScale);
        }
        
        // Update zoom level based on scale
        if (this.scale < 500) {
            this.zoomLevel = 0; // Key events only
        } else if (this.scale < 2000) {
            this.zoomLevel = 1; // Yearly with key + major
        } else if (this.scale < 5000) {
            this.zoomLevel = 2; // Monthly with all events
        } else {
            this.zoomLevel = 3; // Daily with all events
        }
        
        this.updateZoomDisplay();
        this.renderTimeline();
    },
    
    updateZoomDisplay() {
        const display = document.getElementById('zoomLevelDisplay');
        const descriptions = [
            'Zoom Level: Key Events Only',
            'Zoom Level: Yearly View (Key + Major Events)',
            'Zoom Level: Monthly View (All Events)',
            'Zoom Level: Daily View (All Events)'
        ];
        display.textContent = descriptions[this.zoomLevel];
    },
    
    getVisibleEvents() {
        if (this.zoomLevel === 0) {
            return this.events.filter(e => e.importance === 'key');
        } else if (this.zoomLevel === 1) {
            return this.events.filter(e => e.importance === 'key' || e.importance === 'major');
        } else {
            return this.events; // All events for zoom levels 2 and 3
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
    
    getMonthFromDate(dateString) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months[new Date(dateString).getMonth()];
    },
    
    getDayFromDate(dateString) {
        return new Date(dateString).getDate();
    },
    
    renderTimeline() {
        const container = document.getElementById('timeline');
        container.innerHTML = '';
        
        const visibleEvents = this.getVisibleEvents();
        
        if (visibleEvents.length === 0) {
            container.innerHTML = '<p class="no-events">No events at this zoom level. Add events or zoom in.</p>';
            return;
        }
        
        // Create SVG for the timeline line
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'timeline-svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        
        // Scale the viewBox based on zoom level
        const viewBoxWidth = this.scale;
        const viewBoxHeight = 300;
        svg.setAttribute('viewBox', `0 0 ${viewBoxWidth} ${viewBoxHeight}`);
        svg.setAttribute('preserveAspectRatio', 'none');
        
        // Draw horizontal line
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', '0');
        line.setAttribute('y1', '150');
        line.setAttribute('x2', viewBoxWidth);
        line.setAttribute('y2', '150');
        line.setAttribute('stroke', '#3498db');
        line.setAttribute('stroke-width', '3');
        svg.appendChild(line);
        
        // Find min and max dates
        const minDate = new Date(visibleEvents[0].date);
        const maxDate = new Date(visibleEvents[visibleEvents.length - 1].date);
        const timeRange = maxDate - minDate;
        
        // Draw dots and labels
        visibleEvents.forEach((event, index) => {
            const eventDate = new Date(event.date);
            const positionRatio = timeRange === 0 ? 0.5 : (eventDate - minDate) / timeRange;
            const x = positionRatio * (viewBoxWidth - 50) + 25;
            
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
            
            // Get year, month, day from date
            const year = this.getYearFromDate(event.date);
            const month = this.getMonthFromDate(event.date);
            const day = this.getDayFromDate(event.date);
            
            // Build label based on zoom level
            let labelText;
            if (this.zoomLevel === 0) {
                labelText = `${event.title}\n${year}`;
            } else if (this.zoomLevel === 1) {
                labelText = `${event.title}\n${year}`;
            } else if (this.zoomLevel === 2) {
                labelText = `${event.title}\n${month} ${year}`;
            } else {
                labelText = `${event.title}\n${month} ${day}, ${year}`;
            }
            
            // Add title text above dot
            const lines = labelText.split('\n');
            lines.forEach((line, lineIndex) => {
                const titleText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                titleText.setAttribute('x', x);
                titleText.setAttribute('y', 120 - (lineIndex * 20));
                titleText.setAttribute('text-anchor', 'middle');
                titleText.setAttribute('class', 'timeline-label');
                titleText.setAttribute('data-event-id', event.id);
                titleText.setAttribute('font-size', '12');
                titleText.textContent = line;
                svg.appendChild(titleText);
                
                titleText.addEventListener('click', () => this.showEventDetails(event));
                titleText.addEventListener('mouseover', () => {
                    circle.setAttribute('r', dotRadius + 3);
                });
                titleText.addEventListener('mouseout', () => {
                    circle.setAttribute('r', dotRadius);
                });
            });
            
            // Add hover effect and click to show details
            circle.addEventListener('click', () => this.showEventDetails(event));
            circle.addEventListener('mouseover', () => {
                circle.setAttribute('r', dotRadius + 3);
            });
            circle.addEventListener('mouseout', () => {
                circle.setAttribute('r', dotRadius);
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
