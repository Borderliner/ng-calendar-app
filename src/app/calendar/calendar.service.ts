// calendar.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CalendarEvent } from '../event-dialog/event-dialog.component';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addDays,
} from 'date-fns';

@Injectable({
  providedIn: 'root',
})
export class CalendarService {
  private eventsSubject = new BehaviorSubject<CalendarEvent[]>([
    {
      id: 1,
      title: 'Team Meeting',
      description: 'Discuss project updates',
      time: '14:00',
      urgency: 'Medium',
      date: new Date(2025, 2, 20),
    },
  ]);
  private events$ = this.eventsSubject.asObservable();

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
    const index = currentEvents.findIndex(e => e.id === updatedEvent.id);
    if (index !== -1) {
      currentEvents[index] = { ...updatedEvent };
      this.eventsSubject.next([...currentEvents]);
    } else {
      console.warn('Event not found for update:', updatedEvent);
    }
  }

  public removeEvent(eventToRemove: CalendarEvent): void {
    const currentEvents = this.eventsSubject.value;
    const updatedEvents = currentEvents.filter(e => e.id !== eventToRemove.id);
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
}
