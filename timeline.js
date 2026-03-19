renderTimeline() {
    const container = document.getElementById('timeline');
    container.innerHTML = '';
    
    const visibleEvents = this.getVisibleEvents();
    
    if (visibleEvents.length === 0) {
        container.innerHTML = '<p class="no-events">No events at this zoom level. Add events or zoom in.</p>';
        return;
    }
    
    // Create a wrapper div for horizontal scrolling
    const wrapper = document.createElement('div');
    wrapper.className = 'timeline-wrapper';
    
    // Create SVG for the timeline line
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'timeline-svg');
    
    // Keep fixed dimensions - don't scale with zoom
    const svgWidth = 100 + (visibleEvents.length * this.scale);
    const svgHeight = 300;
    
    svg.setAttribute('width', svgWidth);
    svg.setAttribute('height', svgHeight);
    svg.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);
    
    // Draw horizontal line
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', '50');
    line.setAttribute('y1', '150');
    line.setAttribute('x2', svgWidth - 50);
    line.setAttribute('y2', '150');
    line.setAttribute('stroke', '#3498db');
    line.setAttribute('stroke-width', '3');
    svg.appendChild(line);
    
    // Find min and max dates for time scaling
    const minDate = new Date(visibleEvents[0].date);
    const maxDate = new Date(visibleEvents[visibleEvents.length - 1].date);
    const timeRange = maxDate - minDate;
    
    // Calculate spacing between events based on zoom
    const eventSpacing = this.scale;
    
    // Draw dots and labels
    visibleEvents.forEach((event, index) => {
        const eventDate = new Date(event.date);
        
        // Calculate x position based on date and time range
        let x;
        if (timeRange === 0) {
            // If all events are on same date, space them out evenly
            x = 100 + (index * eventSpacing);
        } else {
            // Distribute along timeline based on actual date
            const positionRatio = (eventDate - minDate) / timeRange;
            x = 50 + (positionRatio * (svgWidth - 100));
        }
        
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
        let labelLines = [];
        labelLines.push(event.title);
        
        if (this.zoomLevel === 0) {
            labelLines.push(year);
        } else if (this.zoomLevel === 1) {
            labelLines.push(year);
        } else if (this.zoomLevel === 2) {
            labelLines.push(`${month} ${year}`);
        } else {
            labelLines.push(`${month} ${day}, ${year}`);
        }
        
        // Add text labels above and below dot
        labelLines.forEach((line, lineIndex) => {
            const yOffset = lineIndex === 0 ? -30 : -10;
            
            const titleText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            titleText.setAttribute('x', x);
            titleText.setAttribute('y', 150 + yOffset - (lineIndex * 18));
            titleText.setAttribute('text-anchor', 'middle');
            titleText.setAttribute('class', 'timeline-label');
            titleText.setAttribute('font-size', '12');
            titleText.setAttribute('white-space', 'nowrap');
            titleText.textContent = line;
            svg.appendChild(titleText);
            
            titleText.addEventListener('click', () => this.showEventDetails(event));
            titleText.addEventListener('mouseover', () => {
                circle.setAttribute('r', dotRadius + 3);
                titleText.setAttribute('font-weight', 'bold');
            });
            titleText.addEventListener('mouseout', () => {
                circle.setAttribute('r', dotRadius);
                titleText.setAttribute('font-weight', 'normal');
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
    
    wrapper.appendChild(svg);
    container.appendChild(wrapper);
}
