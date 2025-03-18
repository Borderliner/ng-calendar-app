// calendar.component.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDay, addDays } from 'date-fns';
import { SplitPipe } from '../split.pipe';
import { EventDialogComponent, CalendarEvent } from '../event-dialog/event-dialog.component';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';

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
    EventDialogComponent,
    DragDropModule
  ],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {
  currentDate = new Date();
  daysInMonth: (Date | null)[] = [];
  selectedDate: Date | null = null;
  events: CalendarEvent[] = [
    {
      title: 'Team Meeting',
      description: 'Discuss project updates',
      time: '14:00',
      urgency: 'Medium',
      date: new Date(2025, 2, 20) // March 20, 2025
    }
  ];

  selectedMonth: string;
  selectedYear: number;
  months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  years: number[] = [];

  constructor(
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {
    this.selectedMonth = this.months[this.currentDate.getMonth()];
    this.selectedYear = this.currentDate.getFullYear();

    const currentYear = this.currentDate.getFullYear();
    for (let i = currentYear - 50; i <= currentYear + 50; i++) {
      this.years.push(i);
    }
  }

  ngOnInit() {
    this.generateCalendar();
  }

  generateCalendar() {
    const monthStart = startOfMonth(this.currentDate);
    const monthEnd = endOfMonth(this.currentDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const firstDayIndex = getDay(monthStart);
    const paddedDays: (Date | null)[] = Array(firstDayIndex).fill(null);
    this.daysInMonth = [...paddedDays, ...days];

    const totalCells = 42;
    const remainingCells = totalCells - this.daysInMonth.length;
    if (remainingCells > 0) {
      const nextMonthStart = addDays(monthEnd, 1);
      const nextDays = eachDayOfInterval({ start: nextMonthStart, end: addDays(nextMonthStart, remainingCells - 1) });
      this.daysInMonth = [...this.daysInMonth, ...nextDays];
    }
  }

  selectDay(day: Date | null) {
    this.selectedDate = day;
  }

  openEventDialog(day: Date | null) {
    if (!day) return;
    const dialogRef = this.dialog.open(EventDialogComponent, {
      width: '400px',
      data: { date: day }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.events.push(result);
        this.cdr.detectChanges();
      }
    });
  }

  getEventsForDay(day: Date | null): CalendarEvent[] {
    if (!day) return [];
    return this.events.filter(event => isSameDay(event.date, day));
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
    if (event.previousContainer.id === 'events-list' && event.previousContainer !== event.container) {
      const eventToMove = (event.previousContainer.data as CalendarEvent[])[event.previousIndex];
      const newDate = event.container.data as Date | null;
      if (newDate) {
        console.log('Moving:', eventToMove.title, 'to', newDate);
        eventToMove.date = new Date(newDate);
        this.events = [...this.events]; // Force array reassignment
        this.cdr.detectChanges();
      }
    }
  }

  removeEvent(eventToRemove: CalendarEvent) {
    this.events = this.events.filter(event => event !== eventToRemove);
    this.cdr.detectChanges();
  }
}