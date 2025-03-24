import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CalendarService } from './calendar.service';
import { TransferState } from '@angular/core';
import { PLATFORM_ID } from '@angular/core';
import { CalendarEvent } from '../event-dialog/event-dialog.component';

describe('CalendarService', () => {
  let service: CalendarService;

  const mockEvents: CalendarEvent[] = [
    {
      id: '1',
      title: 'Event 1',
      date: new Date('2025-03-24T00:00:00.000Z'),
      description: '',
      time: '15:30',
      urgency: 'Medium',
    },
  ];

  beforeEach(() => {
    const transferSpy = jasmine.createSpyObj('TransferState', ['get', 'set']);
    transferSpy.get.and.returnValue(mockEvents);

    TestBed.configureTestingModule({
      providers: [
        CalendarService,
        { provide: TransferState, useValue: transferSpy },
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: 'SERVER_EVENTS', useValue: null, multi: false },
      ],
    });

    // Mock localStorage
    spyOn(localStorage, 'getItem').and.returnValue(
      JSON.stringify(mockEvents.map((e) => ({ ...e, date: e.date.toISOString() })))
    );
    spyOn(localStorage, 'setItem');

    service = TestBed.inject(CalendarService);

    // Ensure initial events are loaded
    (service as any).eventsSubject.next(mockEvents);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add an event', fakeAsync(() => {
    const newEvent: CalendarEvent = {
      title: 'New Event',
      date: new Date('2025-03-25T00:00:00.000Z'),
      description: '',
      time: '10:00',
      urgency: 'Medium',
    };
    service.addEvent(newEvent);
    let events: CalendarEvent[] = [];
    service.getEvents().subscribe((e) => (events = e));
    tick();
    expect(events.length).toBe(2);
    expect(events[1].title).toBe('New Event');
  }));

  it('should update an event', fakeAsync(() => {
    const updatedEvent = { ...mockEvents[0], title: 'Updated Event' };
    service.updateEvent(updatedEvent);
    let events: CalendarEvent[] = [];
    service.getEvents().subscribe((e) => (events = e));
    tick();
    expect(events[0].title).toBe('Updated Event');
  }));

  it('should remove an event', fakeAsync(() => {
    service.removeEvent(mockEvents[0]);
    let events: CalendarEvent[] = [];
    service.getEvents().subscribe((e) => (events = e));
    tick();
    expect(events.length).toBe(0);
  }));

  it('should generate calendar days for a month', () => {
    const date = new Date('2025-03-01T00:00:00.000Z');
    const days = service.generateCalendar(date);
    expect(days.length).toBe(42);
    expect(days[0]).toBeNull();
    expect(days.some((day) => day && day.getDate() === 1 && day.getMonth() === 2)).toBeTrue();
  });

  it('should save events to localStorage', () => {
    const events: CalendarEvent[] = [
      {
        id: '1',
        title: 'Event 1',
        date: new Date('2025-03-24T00:00:00.000Z'),
        description: '',
        time: '15:30',
        urgency: 'High',
      },
    ];
    (service as any).saveEventsToLocalStorage(events);
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'calendar_events',
      JSON.stringify(events.map((e) => ({ ...e, date: e.date.toISOString() })))
    );
  });
});