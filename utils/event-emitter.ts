
type EventHandler = (...args: any[]) => void;

class EventEmitter {
  private events: Record<string, EventHandler[]> = {};

  on(event: string, handler: EventHandler): () => void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(handler);
    
    // Return a function to remove this event listener
    return () => {
      this.events[event] = this.events[event].filter(h => h !== handler);
    };
  }

  emit(event: string, ...args: any[]): void {
    const handlers = this.events[event];
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(...args);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }
}

export const EVENTS = {
  FAVORITE_CHANGED: 'favorite_changed'
};

// Create a singleton instance to be used throughout the app
export const eventEmitter = new EventEmitter();
