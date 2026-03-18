// timeline.js

class Timeline {
    constructor() {
        this.events = [];
    }

    addEvent(event) {
        this.events.push(event);
        console.log(`Event added: ${JSON.stringify(event)}`);
    }

    deleteEvent(eventId) {
        this.events = this.events.filter(event => event.id !== eventId);
        console.log(`Event deleted with ID: ${eventId}`);
    }

    exportEvents() {
        return JSON.stringify(this.events);
    }

    importEvents(eventsData) {
        this.events = JSON.parse(eventsData);
        console.log('Events imported.');
    }
}

// Example Usage:
const timeline = new Timeline();
timeline.addEvent({ id: 1, title: 'Event 1', date: '2026-03-18 17:14:20' });
timeline.addEvent({ id: 2, title: 'Event 2', date: '2026-03-19 17:14:20' });
let exportedData = timeline.exportEvents();
timeline.deleteEvent(1);
timeline.importEvents(exportedData);