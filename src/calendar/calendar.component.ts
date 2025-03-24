import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { SplitPipe } from '../app/split.pipe';
import { EventDialogComponent, CalendarEvent } from '../event-dialog/event-dialog.component';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { CalendarService } from './calendar.service';
import { Observable } from 'rxjs';
import { isSameDay } from 'date-fns';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatDialogModule,
    MatSelectModule,
    FormsModule,
    SplitPipe,
    DragDropModule
  ],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {
  currentDate = new Date();
  daysInMonth: (Date | null)[] = [];
  selectedDate: Date | null = null;
  events$: Observable<CalendarEvent[]>;
  events: CalendarEvent[] = [];

  selectedMonth: string;
  selectedYear: number;
  months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  years: number[] = [];

  constructor(
    private dialog: MatDialog,
    private calendarService: CalendarService
  ) {
    this.events$ = this.calendarService.getEvents();
    this.selectedMonth = this.months[this.currentDate.getMonth()];
    this.selectedYear = this.currentDate.getFullYear();

    const currentYear = this.currentDate.getFullYear();
    for (let i = currentYear - 50; i <= currentYear + 50; i++) {
      this.years.push(i);
    }
  }

  ngOnInit() {
    this.generateCalendar();
    this.events$.subscribe(events => {
      this.events = events || [];
    });
  }

  generateCalendar() {
    this.daysInMonth = this.calendarService.generateCalendar(this.currentDate);
  }

  selectDay(day: Date | null) {
    this.selectedDate = day;
  }

  openEventDialog(day: Date | null, eventToEdit?: CalendarEvent) {
    if (!day) return;
    const dialogRef = this.dialog.open(EventDialogComponent, {
      width: '400px',
      data: eventToEdit ? { ...eventToEdit } : { date: day }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (eventToEdit) {
          this.calendarService.updateEvent(result);
        } else {
          this.calendarService.addEvent(result);
        }
      }
    });
  }

  getEventsForDay(day: Date | null, events?: CalendarEvent[] | null): CalendarEvent[] {
    if (!day) return [];
    const eventsToFilter = events !== undefined && events !== null ? events : this.events;
    return eventsToFilter.filter(event => isSameDay(event.date, day)) || [];
  }

  isSameDay(date1: Date | null, date2: Date): boolean {
    if (!date1) return false;
    return isSameDay(date1, date2);
  }

  changeMonth(offset: number) {
    this.currentDate = new Date(this.currentDate.setMonth(this.currentDate.getMonth() + offset));
    this.selectedMonth = this.months[this.currentDate.getMonth()];
    this.selectedYear = this.currentDate.getFullYear();
    this.generateCalendar();
  }

  goToToday() {
    this.currentDate = new Date();
    this.selectedMonth = this.months[this.currentDate.getMonth()];
    this.selectedYear = this.currentDate.getFullYear();
    this.selectedDate = this.currentDate;
    this.generateCalendar();
  }

  onMonthChange(month: string) {
    const monthIndex = this.months.indexOf(month);
    this.currentDate = new Date(this.currentDate.setMonth(monthIndex));
    this.generateCalendar();
  }

  onYearChange(year: number) {
    this.currentDate = new Date(this.currentDate.setFullYear(year));
    this.generateCalendar();
  }

  getDayIds(): string[] {
    return this.daysInMonth.map((_, i) => 'day-' + i);
  }

  drop(event: CdkDragDrop<any>) {
    if (event.previousContainer === event.container) {
      // Reordering within the same container
      if (event.container.id === 'events-list') {
        const eventsForDay = event.container.data as CalendarEvent[];
        moveItemInArray(eventsForDay, event.previousIndex, event.currentIndex);
        const otherEvents = this.events.filter(e => !this.selectedDate || !isSameDay(e.date, this.selectedDate));
        this.events = [...otherEvents, ...eventsForDay];
        this.events.forEach(e => this.calendarService.updateEvent(e)); // Persist the new order
      }
      // No action for calendar days since they don’t support reordering
    } else {
      // Moving between containers
      if (event.previousContainer.id === 'events-list' && event.container.id.startsWith('day-')) {
        // Moving from events list to calendar grid
        const eventToMove = (event.previousContainer.data as CalendarEvent[])[event.previousIndex];
        const newDate = event.container.data as Date | null;
        if (newDate) {
          eventToMove.date = new Date(newDate);
          this.calendarService.updateEvent(eventToMove);
          if (this.selectedDate && isSameDay(this.selectedDate, newDate)) {
            this.selectedDate = newDate; // Keep selected date in sync
          }
        }
      } else if (event.previousContainer.id.startsWith('day-') && event.container.id === 'events-list') {
        // Moving from calendar grid to events list
        const eventToMove = this.events.find(e => isSameDay(e.date, event.previousContainer.data as Date))!;
        const targetDate = this.selectedDate;
        if (targetDate) {
          eventToMove.date = new Date(targetDate);
          this.calendarService.updateEvent(eventToMove);
        }
      }
    }
  }

  editEvent(event: CalendarEvent) {
    if (this.selectedDate) {
      this.openEventDialog(this.selectedDate, event);
    }
  }

  removeEvent(event: CalendarEvent) {
    this.calendarService.removeEvent(event);
  }
}
