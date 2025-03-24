import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventDialogComponent, EventDialogData } from './event-dialog.component';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('EventDialogComponent', () => {
  let component: EventDialogComponent;
  let fixture: ComponentFixture<EventDialogComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<EventDialogComponent>>;

  const mockDialogData: EventDialogData = {
    id: '1',
    title: 'Test Event',
    description: 'Test Description',
    time: '14:30',
    urgency: 'High',
    date: new Date('2025-03-24T00:00:00.000Z')
  };

  beforeEach(async () => {
    const dialogRefMock = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
        EventDialogComponent
      ],
      providers: [
        FormBuilder,
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EventDialogComponent);
    component = fixture.componentInstance;
    dialogRefSpy = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<EventDialogComponent>>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with provided dialog data', () => {
    expect(component.eventForm.value).toEqual({
      id: '1',
      title: 'Test Event',
      description: 'Test Description',
      time: '14:30',
      urgency: 'High',
      date: jasmine.any(Date)
    });
    expect(component.eventForm.valid).toBeTrue();
  });

  it('should initialize form with default values when no data is provided', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
        EventDialogComponent
      ],
      providers: [
        FormBuilder,
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EventDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.eventForm.value).toEqual({
      id: null,
      title: '',
      description: '',
      time: '',
      urgency: 'Medium',
      date: jasmine.any(Date)
    });
  });

  it('should close dialog without data on cancel', () => {
    component.onCancel();
    expect(dialogRefSpy.close).toHaveBeenCalledWith();
  });

  it('should close dialog with form data on save when form is valid', () => {
    component.eventForm.patchValue({
      title: 'New Event',
      description: 'New Description',
      time: '10:00',
      urgency: 'Low',
      date: new Date('2025-03-25T00:00:00.000Z')
    });
    component.onSave();
    expect(dialogRefSpy.close).toHaveBeenCalledWith({
      id: '1',
      title: 'New Event',
      description: 'New Description',
      time: '10:00',
      urgency: 'Low',
      date: jasmine.any(Date)
    });
  });

  it('should not close dialog on save when form is invalid', () => {
    component.eventForm.patchValue({
      title: '',
      time: '25:00'
    });
    component.onSave();
    expect(dialogRefSpy.close).not.toHaveBeenCalled();
  });

  it('should have correct urgency levels', () => {
    expect(component.urgencyLevels).toEqual(['Low', 'Medium', 'High']);
  });

  it('should validate time field with correct pattern', () => {
    const timeControl = component.eventForm.get('time');

    timeControl?.setValue('14:30');
    expect(timeControl?.valid).toBeTrue();

    timeControl?.setValue('25:00');
    expect(timeControl?.invalid).toBeTrue();

    timeControl?.setValue('12:60');
    expect(timeControl?.invalid).toBeTrue();

    timeControl?.setValue(''); // Optional field
    expect(timeControl?.valid).toBeTrue();
  });
});