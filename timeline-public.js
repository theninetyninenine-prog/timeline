class InteractiveTimeline {
    constructor(events) {
        this.events = events;
        this.zoomLevel = 1;
        this.startIndex = 0;
    }

    viewEvents() {
        return this.events.slice(this.startIndex, this.startIndex + 10);
    }

    zoomIn() {
        this.zoomLevel += 0.1;
    }

    zoomOut() {
        this.zoomLevel = Math.max(1, this.zoomLevel - 0.1);
    }

    getZoomLevel() {
        return this.zoomLevel;
    }

    nextPage() {
        if (this.startIndex + 10 < this.events.length) {
            this.startIndex += 10;
        }
    }

    previousPage() {
        if (this.startIndex > 0) {
            this.startIndex -= 10;
        }
    }
}