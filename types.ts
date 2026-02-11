
export interface SchoolSettings {
  id: string;
  school_name: string;
}

export interface ClassData {
  id: string;
  name: string;
  teacher_name: string;
  teacher_nip: string;
  headmaster_name: string;
  headmaster_nip: string;
}

export interface Student {
  id: string;
  nis: string;
  name: string;
  class_name: string;
  status: 'active' | 'inactive';
}

export interface Attendance {
  id: string;
  student_id: string;
  status: 'Hadir' | 'Sakit' | 'Izin' | 'Alfa';
  note?: string;
  date: string;
  student?: Student;
}

export interface Teacher {
  id: string;
  nip: string;
  name: string;
  role: string;
}

export interface TeacherAttendance {
  id: string;
  teacher_id: string;
  status: 'Hadir' | 'Sakit' | 'Izin' | 'Alfa';
  note?: string;
  date: string;
  teacher?: Teacher;
}
