
-- School Settings Table
CREATE TABLE IF NOT EXISTS school_settings (
  id TEXT PRIMARY KEY,
  school_name TEXT NOT NULL
);

-- Classes Table
CREATE TABLE IF NOT EXISTS classes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  teacher_name TEXT,
  teacher_nip TEXT,
  headmaster_name TEXT,
  headmaster_nip TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Students Table
CREATE TABLE IF NOT EXISTS students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nis TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  class_name TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  note TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, date)
);

-- Teachers Table
CREATE TABLE IF NOT EXISTS teachers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nip TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teacher Attendance Table
CREATE TABLE IF NOT EXISTS teacher_attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  note TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Initial Data (Seed Data)
INSERT INTO school_settings (id, school_name) 
VALUES ('1', 'TK DIGITAL INDONESIA')
ON CONFLICT (id) DO NOTHING;

-- Seed Classes
INSERT INTO classes (name, teacher_name, teacher_nip, headmaster_name, headmaster_nip)
VALUES 
('Kelompok A (Bintang)', 'Siti Aminah, S.Pd', '198501012010012001', 'Hj. Ratna Sari, M.Pd', '197505051998032002'),
('Kelompok B (Matahari)', 'Budi Santoso, S.Pd', '198702022012011002', 'Hj. Ratna Sari, M.Pd', '197505051998032002')
ON CONFLICT DO NOTHING;

-- Seed Students
INSERT INTO students (nis, name, class_name)
VALUES 
('1001', 'Ahmad Fauzi', 'Kelompok A (Bintang)'),
('1002', 'Siti Fatimah', 'Kelompok A (Bintang)'),
('1003', 'Randi Pangestu', 'Kelompok B (Matahari)'),
('1004', 'Larasati Putri', 'Kelompok B (Matahari)'),
('1005', 'Zahra Amira', 'Kelompok B (Matahari)')
ON CONFLICT DO NOTHING;

-- Seed Teachers
INSERT INTO teachers (nip, name, role)
VALUES 
('198501012010012001', 'Siti Aminah, S.Pd', 'Guru Kelas'),
('198702022012011002', 'Budi Santoso, S.Pd', 'Guru Kelas'),
('197505051998032002', 'Hj. Ratna Sari, M.Pd', 'Kepala Sekolah')
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE school_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_attendance ENABLE ROW LEVEL SECURITY;

-- Public Access (For Demo)
CREATE POLICY "Public Read school_settings" ON school_settings FOR SELECT USING (true);
CREATE POLICY "Public Write school_settings" ON school_settings FOR ALL USING (true);
CREATE POLICY "Public Read classes" ON classes FOR SELECT USING (true);
CREATE POLICY "Public Write classes" ON classes FOR ALL USING (true);
CREATE POLICY "Public Read students" ON students FOR SELECT USING (true);
CREATE POLICY "Public Write students" ON students FOR ALL USING (true);
CREATE POLICY "Public Read attendance" ON attendance FOR SELECT USING (true);
CREATE POLICY "Public Write attendance" ON attendance FOR ALL USING (true);
CREATE POLICY "Public Read teachers" ON teachers FOR SELECT USING (true);
CREATE POLICY "Public Write teachers" ON teachers FOR ALL USING (true);
CREATE POLICY "Public Read teacher_attendance" ON teacher_attendance FOR SELECT USING (true);
CREATE POLICY "Public Write teacher_attendance" ON teacher_attendance FOR ALL USING (true);
