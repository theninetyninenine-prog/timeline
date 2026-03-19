class InteractiveTimeline {
    constructor() {
        this.events = [];
        this.currentZoomLevel = 'all';
        this.init();
    }

    init() {
        this.loadEvents();
        this.attachEventListeners();
        this.render();
    }

    loadEvents() {
        const stored = localStorage.getItem('timeline-events');
        this.events = stored ? JSON.parse(stored) : [];
        this.events.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    saveEvents() {
        localStorage.setItem('timeline-events', JSON.stringify(this.events));
    }

    attachEventListeners() {
     const scroller = document.querySelector('.timeline-scroller');

scroller.addEventListener('wheel', (e) => {
    if (e.ctrlKey) { // pinch gesture
        e.preventDefault();

        if (e.deltaY < 0) {
            this.zoomIn();
        } else {
            this.zoomOut();
        }
    }
}, { passive: false });
    }

    openModal() {
        document.getElementById('event-modal').style.display = 'block';
        document.getElementById('event-date').focus();
    }

    closeModal() {
        document.getElementById('event-modal').style.display = 'none';
        document.getElementById('event-form').reset();
    }

    handleAddEvent(e) {
        e.preventDefault();

        const event = {
            id: Date.now(),
            date: document.getElementById('event-date').value,
            title: document.getElementById('event-title').value,
            description: document.getElementById('event-description').value,
            importance: document.getElementById('event-importance').value,
        };

        this.events.push(event);
        this.events.sort((a, b) => new Date(a.date) - new Date(b.date));
        this.saveEvents();
        this.closeModal();
        this.render();
    }

    deleteEvent(id) {
        this.events = this.events.filter(e => e.id !== id);
        this.saveEvents();
        this.render();
    }

   zoomIn() {
    if (this.currentZoomIndex < this.zoomLevels.length - 1) {
        this.currentZoomIndex++;
        this.setZoomLevel(this.zoomLevels[this.currentZoomIndex]);
    }
}

zoomOut() {
    if (this.currentZoomIndex > 0) {
        this.currentZoomIndex--;
        this.setZoomLevel(this.zoomLevels[this.currentZoomIndex]);
    }
}
    }

    shouldShowEvent(event) {
        if (this.currentZoomLevel === 'all') return true;
        if (this.currentZoomLevel === 'key') return event.importance === 'key';
        return event.importance === this.currentZoomLevel;
    }

    getVisibleEvents() {
        return this.events.filter(event => this.shouldShowEvent(event));
    }

    render() {
        const container = document.getElementById('events-container');
        container.innerHTML = '';

        if (this.events.length === 0) {
            container.innerHTML = '<div style="text-align: center; width: 100%; color: #6b7280; padding: 2rem;">No events yet. Click "+ Add Event" to get started!</div>';
            this.drawTimeline([]);
            return;
        }

        this.events.forEach(event => {
            const eventEl = document.createElement('div');
            eventEl.className = `event importance-${event.importance}`;
            if (!this.shouldShowEvent(event)) {
                eventEl.classList.add('hidden');
            }

            const dateObj = new Date(event.date);
            const formattedDate = dateObj.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });

            eventEl.innerHTML = `
                <div class="event-marker"></div>
                <div class="event-content">
                    <div class="event-date">${formattedDate}</div>
                    <div class="event-title">${this.escapeHtml(event.title)}</div>
                    ${event.description ? `<div class="event-description">${this.escapeHtml(event.description)}</div>` : ''}
                    <button class="event-delete" data-id="${event.id}" title="Delete event">×</button>
                </div>
            `;

            eventEl.querySelector('.event-delete').addEventListener('click', () => this.deleteEvent(event.id));
            container.appendChild(eventEl);
        });

        this.drawTimeline(this.getVisibleEvents());
    }

    drawTimeline(visibleEvents) {
        const svg = document.getElementById('timeline-svg');
        svg.innerHTML = '';

        if (visibleEvents.length === 0) return;

        const svgNS = 'http://www.w3.org/2000/svg';
        const line = document.createElementNS(svgNS, 'line');
        line.setAttribute('x1', '0');
        line.setAttribute('y1', '60');
        line.setAttribute('x2', '100%');
        line.setAttribute('y2', '60');
        line.setAttribute('class', 'timeline-line');
        svg.appendChild(line);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize timeline when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new InteractiveTimeline();
});
    }

    init() {
        this.loadEvents();
        this.attachEventListeners();
        this.render();
    }

    loadEvents() {
        const stored = localStorage.getItem('timeline-events');
        this.events = stored ? JSON.parse(stored) : [];
        this.events.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    saveEvents() {
        localStorage.setItem('timeline-events', JSON.stringify(this.events));
    }

    attachEventListeners() {
        document.getElementById('add-event-btn').addEventListener('click', () => this.openModal());
        document.getElementById('event-form').addEventListener('submit', (e) => this.handleAddEvent(e));
        document.querySelector('.close').addEventListener('click', () => this.closeModal());

        document.getElementById('zoom-out-btn').addEventListener('click', () => this.setZoomLevel('key'));
        document.getElementById('zoom-in-btn').addEventListener('click', () => this.setZoomLevel('all'));

        window.addEventListener('click', (e) => {
            const modal = document.getElementById('event-modal');
            if (e.target === modal) {
                this.closeModal();
            }
        });
    }

    openModal() {
        document.getElementById('event-modal').style.display = 'block';
        document.getElementById('event-date').focus();
    }

    closeModal() {
        document.getElementById('event-modal').style.display = 'none';
        document.getElementById('event-form').reset();
    }

    handleAddEvent(e) {
        e.preventDefault();

        const event = {
            id: Date.now(),
            date: document.getElementById('event-date').value,
            title: document.getElementById('event-title').value,
            description: document.getElementById('event-description').value,
            importance: document.getElementById('event-importance').value,
        };

        this.events.push(event);
        this.events.sort((a, b) => new Date(a.date) - new Date(b.date));
        this.saveEvents();
        this.closeModal();
        this.render();
    }

    deleteEvent(id) {
        this.events = this.events.filter(e => e.id !== id);
        this.saveEvents();
        this.render();
    }

    setZoomLevel(level) {
        this.currentZoomLevel = level;
        document.getElementById('zoom-out-btn').classList.toggle('active', level === 'key');
        document.getElementById('zoom-in-btn').classList.toggle('active', level === 'all');
        this.render();
    }

    shouldShowEvent(event) {
        if (this.currentZoomLevel === 'all') return true;
        if (this.currentZoomLevel === 'key') return event.importance === 'key';
        return event.importance === this.currentZoomLevel;
    }

    getVisibleEvents() {
        return this.events.filter(event => this.shouldShowEvent(event));
    }

render() {
    const container = document.getElementById('events-container');
    const svg = document.getElementById('timeline-svg');

    container.innerHTML = '';
    svg.innerHTML = '';

    if (this.events.length === 0) {
        container.innerHTML = '<div style="text-align:center;width:100%">No events yet</div>';
        return;
    }

    const visibleEvents = this.getVisibleEvents();

    const minDate = new Date(this.events[0].date);
    const maxDate = new Date(this.events[this.events.length - 1].date);
    const totalTime = maxDate - minDate;

    const timelineWidth = this.getTimelineWidth();

    container.style.position = 'relative';
    container.style.width = timelineWidth + 'px';
    svg.style.width = timelineWidth + 'px';

    visibleEvents.forEach(event => {
        const eventEl = document.createElement('div');
        eventEl.className = `event importance-${event.importance}`;

        const eventTime = new Date(event.date) - minDate;
        const position = eventTime / totalTime;

        eventEl.style.position = 'absolute';
        eventEl.style.left = `${position * timelineWidth}px`;
        eventEl.style.top = '0';

        const dateObj = new Date(event.date);
        const formattedDate = dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: this.currentZoomLevel === 'key' ? undefined : 'short',
            day: this.currentZoomLevel === 'all' ? 'numeric' : undefined
        });

        eventEl.innerHTML = `
            <div class="event-marker"></div>
            <div class="event-content">
                <div class="event-date">${formattedDate}</div>
                <div class="event-title">${this.escapeHtml(event.title)}</div>
                ${event.description ? `<div class="event-description">${this.escapeHtml(event.description)}</div>` : ''}
                <button class="event-delete" data-id="${event.id}">×</button>
            </div>
        `;

        eventEl.querySelector('.event-delete')
            .addEventListener('click', () => this.deleteEvent(event.id));

        container.appendChild(eventEl);
    });

    this.drawTimeline(timelineWidth);
}
  drawTimeline(width) {
    const svg = document.getElementById('timeline-svg');
    svg.innerHTML = '';

    const svgNS = 'http://www.w3.org/2000/svg';

    const line = document.createElementNS(svgNS, 'line');
    line.setAttribute('x1', '0');
    line.setAttribute('y1', '60');
    line.setAttribute('x2', width);
    line.setAttribute('y2', '60');
    line.setAttribute('class', 'timeline-line');

    svg.appendChild(line);
}
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize timeline when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new InteractiveTimeline();
});
getTimelineWidth() {
    if (this.currentZoomLevel === 'key') return this.baseWidth;
    if (this.currentZoomLevel === 'major') return this.baseWidth * 3;
    if (this.currentZoomLevel === 'all') return this.baseWidth * 8;
}
