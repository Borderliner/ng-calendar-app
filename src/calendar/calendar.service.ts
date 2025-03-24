// calendar.service.ts
import { Injectable, Inject, PLATFORM_ID, TransferState, makeStateKey, Optional } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { CalendarEvent } from '../event-dialog/event-dialog.component';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addDays,
} from 'date-fns';

const EVENTS_STATE_KEY = makeStateKey<CalendarEvent[]>('calendarEvents');

@Injectable({
  providedIn: 'root',
})
export class CalendarService {
  private readonly LOCAL_STORAGE_KEY = 'calendar_events';
  private eventsSubject = new BehaviorSubject<CalendarEvent[]>([]);
  private events$: Observable<CalendarEvent[]>;
  private isBrowser: boolean;
  private isServer: boolean;

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private transferState: TransferState,
    @Optional() @Inject('SERVER_EVENTS') private serverEvents?: CalendarEvent[]
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.isServer = isPlatformServer(platformId);

    let initialEvents: CalendarEvent[] = [];
    if (this.isBrowser) {
      // Browser: Load from localStorage
      initialEvents = this.loadEventsFromLocalStorage();
    } else if (this.isServer) {
      // Server: Use events from TransferState or injected SERVER_EVENTS
      initialEvents = this.serverEvents ?? this.transferState.get(EVENTS_STATE_KEY, null) ?? [];
    }

    // Fallback to default if no events are found
    this.eventsSubject = new BehaviorSubject<CalendarEvent[]>(initialEvents ?? []);
    this.events$ = this.eventsSubject.asObservable();

    // Subscribe to save changes reactively
    if (this.isBrowser) {
      this.events$.subscribe((events) => {
        this.saveEventsToLocalStorage(events);
      });
    }
    if (this.isServer) {
      this.events$.subscribe((events) => {
        this.transferState.set(EVENTS_STATE_KEY, events);
      });
    }
  }

  public getEvents(): Observable<CalendarEvent[]> {
    return this.events$;
  }

  public addEvent(event: CalendarEvent): void {
    const currentEvents = this.eventsSubject.value;
    const newEvent = { ...event, id: event.id || Date.now().toString() };
    this.eventsSubject.next([...currentEvents, newEvent]);
  }

  public updateEvent(updatedEvent: CalendarEvent): void {
    const currentEvents = this.eventsSubject.value;
    const index = currentEvents.findIndex((e) => e.id === updatedEvent.id);
    if (index !== -1) {
      currentEvents[index] = { ...updatedEvent };
      this.eventsSubject.next([...currentEvents]);
    } else {
      console.warn('Event not found for update:', updatedEvent);
    }
  }

  public removeEvent(eventToRemove: CalendarEvent): void {
    const currentEvents = this.eventsSubject.value;
    const updatedEvents = currentEvents.filter(
      (e) => e.id !== eventToRemove.id
    );
    this.eventsSubject.next(updatedEvents);
  }

  public generateCalendar(currentDate: Date): (Date | null)[] {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const firstDayIndex = getDay(monthStart);
    const paddedDays: (Date | null)[] = Array(firstDayIndex).fill(null);
    let daysInMonth = [...paddedDays, ...days];

    const totalCells = 42;
    const remainingCells = totalCells - daysInMonth.length;
    if (remainingCells > 0) {
      const nextMonthStart = addDays(monthEnd, 1);
      const nextDays = eachDayOfInterval({
        start: nextMonthStart,
        end: addDays(nextMonthStart, remainingCells - 1),
      });
      daysInMonth = [...daysInMonth, ...nextDays];
    }
    return daysInMonth;
  }

  private saveEventsToLocalStorage(events: CalendarEvent[]): void {
    // Convert Date objects to ISO strings for storage
    const serializedEvents = events.map((event) => ({
      ...event,
      date: event.date.toISOString(),
    }));
    localStorage.setItem(
      this.LOCAL_STORAGE_KEY,
      JSON.stringify(serializedEvents)
    );
  }

  private loadEventsFromLocalStorage(): CalendarEvent[] {
    const savedData = localStorage.getItem(this.LOCAL_STORAGE_KEY);
    if (!savedData) return [];

    try {
      const parsedEvents: CalendarEvent[] = JSON.parse(savedData);
      return parsedEvents.map((event) => ({
        ...event,
        date: new Date(event.date),
      }));
    } catch (error) {
      console.error('Failed to load events from localStorage:', error);
      return [];
    }
  }
}
