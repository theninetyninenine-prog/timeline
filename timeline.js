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
                this.scale = Math.min(this.scale + 100, 50000);
            } else {
                this.scale = Math.max(this.scale - 100, 100);
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
        const zoomLevel = this.getZoomLevel();
        
        if (zoomLevel === 'decade') {
            // Only show key events at decade level
            return this.events.filter(e => e.importance === 'key');
        } else if (zoomLevel === 'year') {
            // Show key and major events at year level
            return this.events.filter(e => e.importance === 'key' || e.importance === 'major');
        } else {
            // Show all events at month/day level
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
    
    getZoomLevel() {
        if (this.scale < 500) return 'decade';
        if (this.scale < 2000) return 'year';
        if (this.scale < 5000) return 'month';
        return 'day';
    },
    
    formatDateLabel(dateString) {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][date.getMonth()];
        const day = date.getDate();
        const decade = Math.floor(year / 10) * 10;
        
        const zoomLevel = this.getZoomLevel();
        if (zoomLevel === 'decade') {
            return `${decade}s`;
        } else if (zoomLevel === 'year') {
            return year;
        } else if (zoomLevel === 'month') {
            return `${month} ${year}`;
        } else {
            return `${month} ${day}`;
        }
    },
    
    calculatePixelsPerDay() {
        return this.scale / 100;
    },
    
    renderTimeline() {
        const container = document.getElementById('timeline');
        container.innerHTML = '';
        
        const visibleEvents = this.getVisibleEvents();
        
        if (visibleEvents.length === 0) {
            container.innerHTML = '<p class="no-events">No events at this zoom level. Add some events!</p>';
            return;
        }
        
        // Calculate time range
        const minDate = new Date(visibleEvents[0].date);
        const maxDate = new Date(visibleEvents[visibleEvents.length - 1].date);
        
        // Add padding (10% on each side)
        const timeRange = maxDate - minDate;
        const padding = timeRange * 0.1;
        const startDate = new Date(minDate.getTime() - padding);
        const endDate = new Date(maxDate.getTime() + padding);
        const totalTimeRange = endDate - startDate;
        
        // Calculate total width based on date range
        const pixelsPerDay = this.calculatePixelsPerDay();
        const totalDays = totalTimeRange / (1000 * 60 * 60 * 24);
        const totalWidth = Math.max(500, totalDays * pixelsPerDay + 100);
        
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'timeline-svg');
        svg.setAttribute('width', totalWidth);
        svg.setAttribute('height', 400);
        svg.setAttribute('style', 'background-color: white;');
        
        // Draw horizontal line
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', '20');
        line.setAttribute('y1', '200');
        line.setAttribute('x2', totalWidth - 20);
        line.setAttribute('y2', '200');
        line.setAttribute('stroke', '#3498db');
        line.setAttribute('stroke-width', '3');
        svg.appendChild(line);
        
        // Draw tick marks and labels based on zoom level
        this.drawTimeMarkers(svg, startDate, endDate, totalWidth, pixelsPerDay);
        
        // Track y positions to prevent overlap
        const eventYPositions = {};
        let nextYPosition = 100;
        const rowHeight = 60;
        
        // Draw events
        visibleEvents.forEach((event, index) => {
            const eventDate = new Date(event.date);
            const positionRatio = (eventDate - startDate) / totalTimeRange;
            const x = 20 + (positionRatio * (totalWidth - 40));
            
            // Determine y position to prevent stacking
            const eventKey = event.date;
            if (!eventYPositions[eventKey]) {
                eventYPositions[eventKey] = nextYPosition;
                nextYPosition += rowHeight;
            }
            const y = eventYPositions[eventKey];
            
            // Ensure we don't go off the bottom
            if (y > 350) {
                eventYPositions[eventKey] = 100;
            }
            
            // Draw line from timeline to event
            const connector = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            connector.setAttribute('x1', x);
            connector.setAttribute('y1', '200');
            connector.setAttribute('x2', x);
            connector.setAttribute('y2', eventYPositions[eventKey]);
            connector.setAttribute('stroke', '#bdc3c7');
            connector.setAttribute('stroke-width', '1');
            connector.setAttribute('stroke-dasharray', '5,5');
            svg.appendChild(connector);
            
            // Determine dot color and size
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
            
            // Draw dot on timeline
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', x);
            circle.setAttribute('cy', '200');
            circle.setAttribute('r', dotRadius);
            circle.setAttribute('fill', dotColor);
            circle.setAttribute('stroke', 'white');
            circle.setAttribute('stroke-width', '2');
            circle.setAttribute('class', 'timeline-dot');
            circle.style.cursor = 'pointer';
            svg.appendChild(circle);
            
            // Draw event box
            const boxX = x - 40;
            const boxY = eventYPositions[eventKey] - 35;
            const boxWidth = 80;
            const boxHeight = 50;
            
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', boxX);
            rect.setAttribute('y', boxY);
            rect.setAttribute('width', boxWidth);
            rect.setAttribute('height', boxHeight);
            rect.setAttribute('fill', 'white');
            rect.setAttribute('stroke', dotColor);
            rect.setAttribute('stroke-width', '2');
            rect.setAttribute('rx', '4');
            rect.style.cursor = 'pointer';
            svg.appendChild(rect);
            
            // Draw title text
            const titleText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            titleText.setAttribute('x', x);
            titleText.setAttribute('y', boxY + 15);
            titleText.setAttribute('text-anchor', 'middle');
            titleText.setAttribute('font-size', '10');
            titleText.setAttribute('font-weight', 'bold');
            titleText.setAttribute('class', 'timeline-label');
            titleText.setAttribute('data-event-id', event.id);
            titleText.textContent = event.title.substring(0, 12);
            titleText.style.cursor = 'pointer';
            svg.appendChild(titleText);
            
            // Draw date text
            const dateText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            dateText.setAttribute('x', x);
            dateText.setAttribute('y', boxY + 32);
            dateText.setAttribute('text-anchor', 'middle');
            dateText.setAttribute('font-size', '9');
            dateText.setAttribute('fill', '#7f8c8d');
            dateText.setAttribute('class', 'timeline-label');
            dateText.textContent = this.formatDateLabel(event.date);
            dateText.style.cursor = 'pointer';
            svg.appendChild(dateText);
            
            // Event handlers
            const showDetails = () => this.showEventDetails(event);
            circle.addEventListener('click', showDetails);
            titleText.addEventListener('click', showDetails);
            dateText.addEventListener('click', showDetails);
            rect.addEventListener('click', showDetails);
            
            circle.addEventListener('mouseover', () => {
                circle.setAttribute('r', dotRadius + 3);
                rect.setAttribute('stroke-width', '3');
            });
            circle.addEventListener('mouseout', () => {
                circle.setAttribute('r', dotRadius);
                rect.setAttribute('stroke-width', '2');
            });
        });
        
        container.appendChild(svg);
    },
    
    drawTimeMarkers(svg, startDate, endDate, totalWidth, pixelsPerDay) {
        const zoomLevel = this.getZoomLevel();
        const totalTimeRange = endDate - startDate;
        
        if (zoomLevel === 'decade') {
            // Draw decade markers (1960s, 1970s, etc.)
            let currentYear = Math.floor(startDate.getFullYear() / 10) * 10;
            while (currentYear < endDate.getFullYear()) {
                const decadeStart = new Date(currentYear, 0, 1);
                const positionRatio = (decadeStart - startDate) / totalTimeRange;
                const x = 20 + (positionRatio * (totalWidth - 40));
                
                // Tick mark
                const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                tick.setAttribute('x1', x);
                tick.setAttribute('y1', '190');
                tick.setAttribute('x2', x);
                tick.setAttribute('y2', '210');
                tick.setAttribute('stroke', '#3498db');
                tick.setAttribute('stroke-width', '2');
                svg.appendChild(tick);
                
                // Decade label
                const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                label.setAttribute('x', x);
                label.setAttribute('y', '225');
                label.setAttribute('text-anchor', 'middle');
                label.setAttribute('font-size', '12');
                label.setAttribute('font-weight', 'bold');
                label.textContent = `${currentYear}s`;
                svg.appendChild(label);
                
                currentYear += 10;
            }
        } else if (zoomLevel === 'year') {
            // Draw year markers
            let currentDate = new Date(startDate);
            currentDate.setMonth(0);
            currentDate.setDate(1);
            
            while (currentDate < endDate) {
                const positionRatio = (currentDate - startDate) / totalTimeRange;
                const x = 20 + (positionRatio * (totalWidth - 40));
                
                // Tick mark
                const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                tick.setAttribute('x1', x);
                tick.setAttribute('y1', '190');
                tick.setAttribute('x2', x);
                tick.setAttribute('y2', '210');
                tick.setAttribute('stroke', '#3498db');
                tick.setAttribute('stroke-width', '1');
                svg.appendChild(tick);
                
                // Year label
                const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                label.setAttribute('x', x);
                label.setAttribute('y', '225');
                label.setAttribute('text-anchor', 'middle');
                label.setAttribute('font-size', '11');
                label.textContent = currentDate.getFullYear();
                svg.appendChild(label);
                
                currentDate.setFullYear(currentDate.getFullYear() + 1);
            }
        } else if (zoomLevel === 'month') {
            // Draw month markers
            let currentDate = new Date(startDate);
            currentDate.setDate(1);
            
            while (currentDate < endDate) {
                const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
                const positionRatio = (currentDate - startDate) / totalTimeRange;
                const x = 20 + (positionRatio * (totalWidth - 40));
                
                // Tick mark
                const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                tick.setAttribute('x1', x);
                tick.setAttribute('y1', '195');
                tick.setAttribute('x2', x);
                tick.setAttribute('y2', '205');
                tick.setAttribute('stroke', '#3498db');
                tick.setAttribute('stroke-width', '1');
                svg.appendChild(tick);
                
                // Month label (every 3 months to avoid clutter)
                if (currentDate.getMonth() % 3 === 0) {
                    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                    label.setAttribute('x', x);
                    label.setAttribute('y', '225');
                    label.setAttribute('text-anchor', 'middle');
                    label.setAttribute('font-size', '10');
                    label.textContent = `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
                    svg.appendChild(label);
                }
                
                currentDate = nextMonth;
            }
        } else {
            // Draw day markers
            let currentDate = new Date(startDate);
            while (currentDate < endDate) {
                const nextDay = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
                const positionRatio = (currentDate - startDate) / totalTimeRange;
                const x = 20 + (positionRatio * (totalWidth - 40));
                
                // Tick mark (only for Sundays and first of month)
                if (currentDate.getDay() === 0 || currentDate.getDate() === 1) {
                    const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    tick.setAttribute('x1', x);
                    tick.setAttribute('y1', '195');
                    tick.setAttribute('x2', x);
                    tick.setAttribute('y2', '205');
                    tick.setAttribute('stroke', '#3498db');
                    tick.setAttribute('stroke-width', '1');
                    svg.appendChild(tick);
                    
                    // Label for 1st of month
                    if (currentDate.getDate() === 1) {
                        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                        label.setAttribute('x', x);
                        label.setAttribute('y', '225');
                        label.setAttribute('text-anchor', 'middle');
                        label.setAttribute('font-size', '9');
                        label.textContent = `${months[currentDate.getMonth()]}`;
                        svg.appendChild(label);
                    }
                }
                
                currentDate = nextDay;
            }
        }
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
