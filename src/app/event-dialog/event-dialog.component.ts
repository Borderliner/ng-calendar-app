import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select'; // For urgency dropdown
import { FormsModule } from '@angular/forms';

export interface EventDialogData {
  title?: string;
  description?: string;
  time?: string; // e.g., "14:30"
  urgency?: string; // e.g., "Low", "Medium", "High"
  date?: Date;
}

export interface CalendarEvent {
  title: string;
  description: string;
  time: string;
  urgency: string;
  date: Date;
}

@Component({
  selector: 'app-event-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    FormsModule
  ],
  templateUrl: './event-dialog.component.html',
  styleUrls: ['./event-dialog.component.css']
})
export class EventDialogComponent {
  event: CalendarEvent;
  urgencyLevels = ['Low', 'Medium', 'High']; // Options for urgency

  constructor(
    public dialogRef: MatDialogRef<EventDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EventDialogData
  ) {
    this.event = {
      title: data.title || '',
      description: data.description || '',
      time: data.time || '', // Empty by default, user will input
      urgency: data.urgency || 'Medium', // Default to Medium
      date: data.date || new Date()
    };
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.event.title) { // Require title for saving
      this.dialogRef.close(this.event);
    }
  }
}