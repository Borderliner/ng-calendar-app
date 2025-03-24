import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CalendarComponent } from './calendar.component';
import { CalendarService } from './calendar.service';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Observable, of } from 'rxjs';
import { CalendarEvent, EventDialogComponent } from '../event-dialog/event-dialog.component';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { SplitPipe } from '../app/split.pipe';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { isSameDay } from 'date-fns';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('CalendarComponent', () => {
  let component: CalendarComponent;
  let fixture: ComponentFixture<CalendarComponent>;
  let calendarServiceSpy: jasmine.SpyObj<CalendarService>;

  const mockEvents: CalendarEvent[] = [
    { id: '1', title: 'Event 1', date: new Date('2025-03-24T00:00:00.000Z'), description: '', time: '15:30', urgency: 'Medium' },
    { id: '2', title: 'Event 2', date: new Date('2025-03-24T00:00:00.000Z'), description: '', time: '16:00', urgency: 'High' },
    { id: '3', title: 'Event 3', date: new Date('2025-03-25T00:00:00.000Z'), description: '', time: '15:30', urgency: 'Low' }
  ];

  beforeEach(fakeAsync(() => {
    const calendarSpy = jasmine.createSpyObj('CalendarService', [
      'getEvents', 'addEvent', 'updateEvent', 'removeEvent', 'generateCalendar'
    ]);
    const dialogMock = jasmine.createSpyObj('MatDialog', ['open']);

    calendarSpy.getEvents.and.returnValue(of(mockEvents));
    calendarSpy.generateCalendar.and.returnValue(
      Array(42).fill(null).map((_, i) => (i < 31 ? new Date(`2025-03-${i + 1}T00:00:00.000Z`) : null))
    );

    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        MatToolbarModule,
        MatIconModule,
        MatButtonModule,
        MatListModule,
        MatDialogModule,
        MatSelectModule,
        FormsModule,
        DragDropModule,
        NoopAnimationsModule,
        CalendarComponent,
        SplitPipe
      ],
      providers: [
        { provide: CalendarService, useValue: calendarSpy },
        { provide: MatDialog, useValue: dialogMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CalendarComponent);
    component = fixture.componentInstance;
    calendarServiceSpy = TestBed.inject(CalendarService) as jasmine.SpyObj<CalendarService>;

    component.currentDate = new Date('2025-03-01T00:00:00.000Z');
    component.events = [...mockEvents];
    component.ngOnInit();
    tick(); // Process async subscriptions
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with current date and generate calendar', () => {
    expect(component.currentDate.getFullYear()).toBe(2025);
    expect(component.daysInMonth.length).toBe(42);
    expect(calendarServiceSpy.generateCalendar).toHaveBeenCalled();
  });

  it('should select a day', () => {
    const day = new Date('2025-03-24T00:00:00.000Z');
    component.selectDay(day);
    expect(component.selectedDate).toEqual(day);
    fixture.detectChanges();
  });

  it('should change month', () => {
    const initialMonth = component.currentDate.getMonth();
    component.changeMonth(1);
    expect(component.currentDate.getMonth()).toBe(initialMonth + 1);
    expect(calendarServiceSpy.generateCalendar).toHaveBeenCalled();
    fixture.detectChanges();
  });

  it('should go to today', () => {
    component.goToToday();
    expect(component.currentDate.getFullYear()).toBe(new Date().getFullYear());
    expect(component.selectedDate).toEqual(component.currentDate);
    fixture.detectChanges();
  });

  it('should handle drop event for reordering within events list', fakeAsync(() => {
    component.selectedDate = new Date('2025-03-24T00:00:00.000Z');
    const eventsForDay = component.getEventsForDay(component.selectedDate);
    const container = { id: 'events-list', data: [...eventsForDay] };
    const mockDropEvent = {
      previousContainer: container,
      container: container,
      previousIndex: 0,
      currentIndex: 1
    } as CdkDragDrop<any>;
    component.drop(mockDropEvent);
    tick();
    expect(calendarServiceSpy.updateEvent).toHaveBeenCalledTimes(3);
  }));

  it('should handle drop event from events list to calendar day', fakeAsync(() => {
    const mockDropEvent = {
      previousContainer: { id: 'events-list', data: [...mockEvents] },
      container: { id: 'day-25', data: new Date('2025-03-26T00:00:00.000Z') },
      previousIndex: 0,
      currentIndex: 0
    } as CdkDragDrop<any>;
    component.drop(mockDropEvent);
    tick();
    expect(calendarServiceSpy.updateEvent).toHaveBeenCalledTimes(1);
  }));

  it('should remove an event', () => {
    const eventToRemove = mockEvents[0];
    component.removeEvent(eventToRemove);
    expect(calendarServiceSpy.removeEvent).toHaveBeenCalledWith(eventToRemove);
  });
});