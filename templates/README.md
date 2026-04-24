# Attendex Data Upload Templates

This folder contains CSV templates for bulk data management in the Attendex system.

## 1. Bulk Student Upload (`bulk_student_upload.csv`)
Use this to add all students to a class at once.
- **name**: Full name of the student.
- **roll_number**: Institutional Register Number (e.g., U03FS24C0001).
- **email**: Student's institutional or personal email.
- **parent_email**: Guardian's email (for automated alerts).
- **department**: e.g., BCOM, BCA, BBA.
- **batch**: e.g., A, B, C.

## 2. Marks Entry (`bulk_marks_upload.csv`)
Use this to upload internal marks for a specific subject.
- **reg_number**: Student's Register Number.
- **subject_code**: The code assigned to the subject (e.g., BCOM1, BCOMENG).
- **cia1 / cia2**: Continuous Internal Assessment marks (out of 10).
- **test1 / test2**: Test scores (out of 25).

## 3. Class Timetable (`bulk_timetable_upload.csv`)
Use this to set the weekly schedule.
- **class_name**: e.g., II SEM B.COM.
- **section**: e.g., A, B, C.
- **day**: Monday, Tuesday, etc.
- **subject**: Subject name.
- **faculty**: Teacher's name.
- **room**: Room number.
- **start / end**: Time in HH:MM format (e.g., 09:00).

## 4. Initial Attendance (`bulk_initial_attendance.csv`)
Use this when migrating from manual registers mid-semester.
- **reg_number**: Student's Register Number.
- **subject_code**: Subject code.
- **total_classes**: Total classes held so far.
- **total_present**: Classes attended by the student.

---
**Note:** Always ensure the headers remain exactly as they are in the templates. Save as **CSV (Comma Delimited)** before uploading.
