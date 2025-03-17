import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDay, startOfWeek, addDays } from 'date-fns';
import { SplitPipe } from '../split.pipe';
import { EventDialogComponent, CalendarEvent } from '../event-dialog/event-dialog.component';

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
    EventDialogComponent
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
      date: new Date(2025, 2, 20)
    }
  ];

  // Properties for month and year selection
  selectedMonth: string;
  selectedYear: number;
  months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  years: number[] = [];

  constructor(private dialog: MatDialog) {
    // Initialize selectedMonth and selectedYear
    this.selectedMonth = this.months[this.currentDate.getMonth()];
    this.selectedYear = this.currentDate.getFullYear();

    // Generate years range (±10 from current year)
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
    const weekStart = startOfWeek(monthStart, { weekStartsOn: 0 });
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
    this.selectedMonth = this.months[this.currentDate.getMonth()]; // Sync dropdown
    this.selectedYear = this.currentDate.getFullYear(); // Sync dropdown
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
}