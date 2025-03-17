import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDay, startOfWeek, addDays } from 'date-fns';
import { SplitPipe } from '../split.pipe';

interface CalendarEvent {
  title: string;
  date: Date;
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    SplitPipe
  ],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {
  currentDate = new Date();
  daysInMonth: (Date | null)[] = []; // Allow null for empty cells
  selectedDate: Date | null = null;
  events: CalendarEvent[] = [
    { title: 'Team Meeting', date: new Date(2025, 2, 20) } // March 20, 2025
  ];

  ngOnInit() {
    this.generateCalendar();
  }

  /**
   * Generates the days of the month to display in the calendar.
   *
   * It first calculates the start and end dates of the month.
   * Then it calculates the start date of the week containing the 1st of the month
   * (which may be before the 1st of the month, since the week starts on Sunday).
   * Then it generates an array of all the days in the month.
   * Finally, it pads the beginning of the array with nulls to align with the week
   * start date, and fills the rest of the array with dates from the next month
   * to make it 42 days long (6 weeks).
   */
  generateCalendar() {
    const monthStart = startOfMonth(this.currentDate);
    const monthEnd = endOfMonth(this.currentDate);
    // const weekStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday as week start
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Calculate padding for days before the 1st
    const firstDayIndex = getDay(monthStart); // 0 = Sunday, 1 = Monday, etc.
    const paddedDays: (Date | null)[] = Array(firstDayIndex).fill(null); // Empty cells before 1st

    // Add actual days of the month
    this.daysInMonth = [...paddedDays, ...days];

    // Fill the rest of the grid to make it 42 cells (6 weeks)
    const totalCells = 42; // 6 rows * 7 columns
    const remainingCells = totalCells - this.daysInMonth.length;
    if (remainingCells > 0) {
      const nextMonthStart = addDays(monthEnd, 1);
      const nextDays = eachDayOfInterval({ start: nextMonthStart, end: addDays(nextMonthStart, remainingCells - 1) });
      this.daysInMonth = [...this.daysInMonth, ...nextDays];
    }
  }

  /**
   * Selects the given date, which should be a day of the month visible in the calendar.
   *
   * If the `day` argument is null, deselects any currently selected date.
   *
   * @param day The date to select, or null to deselect.
   */
  selectDay(day: Date | null) {
    this.selectedDate = day;
  }

  /**
   * Returns a list of calendar events for the given day.
   *
   * If the `day` argument is null, returns an empty list.
   *
   * @param day The day to look up events for.
   * @returns A list of calendar events on the given day.
   */
  getEventsForDay(day: Date | null): CalendarEvent[] {
    if (!day) return [];
    return this.events.filter(event => isSameDay(event.date, day));
  }

/**
 * Checks if two dates represent the same calendar day.
 *
 * @param date1 The first date to compare, which can be null.
 * @param date2 The second date to compare.
 * @returns True if both dates are the same calendar day; false if date1 is null or the dates differ.
 */

  isSameDay(date1: Date | null, date2: Date): boolean {
    if (!date1) return false;
    return isSameDay(date1, date2);
  }

  /**
   * Increment or decrement the month of the calendar by the given offset.
   * Recalculates the calendar grid after changing the month.
   *
   * @param offset The number of months to move forward (positive) or backward (negative).
   */
  changeMonth(offset: number) {
    this.currentDate = new Date(this.currentDate.setMonth(this.currentDate.getMonth() + offset));
    this.generateCalendar();
  }
}