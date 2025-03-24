// calendar.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CalendarEvent } from '../event-dialog/event-dialog.component';
import { startOfMonth, endOfMonth, eachDayOfInterval, getDay, addDays } from 'date-fns';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private eventsSubject = new BehaviorSubject<CalendarEvent[]>([
    {
      title: 'Team Meeting',
      description: 'Discuss project updates',
      time: '14:00',
      urgency: 'Medium',
      date: new Date(2025, 2, 20)
    }
  ]);
  events$ = this.eventsSubject.asObservable();

  getEvents(): Observable<CalendarEvent[]> {
    return this.events$;
  }

  addEvent(event: CalendarEvent): void {
    const currentEvents = this.eventsSubject.value;
    this.eventsSubject.next([...currentEvents, event]);
  }

  updateEvent(updatedEvent: CalendarEvent): void {
    const currentEvents = this.eventsSubject.value;
    const index = currentEvents.findIndex(e =>
      e.title === updatedEvent.title &&
      e.date.getTime() === updatedEvent.date.getTime()
    );
    if (index !== -1) {
      currentEvents[index] = updatedEvent;
      this.eventsSubject.next([...currentEvents]);
    }
  }

  removeEvent(eventToRemove: CalendarEvent): void {
    const currentEvents = this.eventsSubject.value;
    this.eventsSubject.next(currentEvents.filter(event => event !== eventToRemove));
  }

  generateCalendar(currentDate: Date): (Date | null)[] {
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
        end: addDays(nextMonthStart, remainingCells - 1)
      });
      daysInMonth = [...daysInMonth, ...nextDays];
    }
    return daysInMonth;
  }
}