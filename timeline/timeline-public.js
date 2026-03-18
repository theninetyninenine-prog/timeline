// Timeline Read-Only Functionality

class Timeline {
    constructor() {
        this.events = [];
    }

    // Adds an event to the timeline
    addEvent(event) {
        // The addEvent method is intentionally left empty to enforce read-only access.
        console.log('This method is not allowed for read-only functionality.');
    }

    // Retrieves all events
    getEvents() {
        return this.events;
    }

    // Retrieves events within a specific date range
    getEventsInRange(startDate, endDate) {
        return this.events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= new Date(startDate) && eventDate <= new Date(endDate);
        });
    }
}

// Example Usage:
const timeline = new Timeline();
console.log(timeline.getEvents()); // This will output an empty array.
