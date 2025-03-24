// event-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

export interface EventDialogData {
  id?: string | number,
  title?: string;
  description?: string;
  time?: string;
  urgency?: string;
  date?: Date;
}

export interface CalendarEvent {
  id?: string | number,
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
    ReactiveFormsModule
  ],
  templateUrl: './event-dialog.component.html',
  styleUrls: ['./event-dialog.component.css']
})
export class EventDialogComponent {
  eventForm: FormGroup;
  urgencyLevels = ['Low', 'Medium', 'High'];

  constructor(
    public dialogRef: MatDialogRef<EventDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EventDialogData,
    private fb: FormBuilder
  ) {
    this.eventForm = this.fb.group({
      id: [data.id || undefined],
      title: [data.title || '', Validators.required],
      description: [data.description || ''],
      time: [data.time || '', Validators.pattern('^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$')],
      urgency: [data.urgency || 'Medium', Validators.required],
      date: [data.date || new Date(), Validators.required]
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.eventForm.valid) {
      this.dialogRef.close(this.eventForm.value);
    }
  }
}