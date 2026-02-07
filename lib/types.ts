export type Course = {
  id: string
  title: string
  category: string
  level: string
  status: string
  instructor: string
  price: number
  duration: number
  description: string
  studentsNumber: number
  certification: string
}

export type CourseRow = {
  id: string
  title: string
  category: string
  level: string
  status: string
  instructor: string
  price: number
  duration: number
  description: string
  students_number: number
  certification: string
  created_at: string
  user_id: string | null
}

export function rowToCourse(row: CourseRow): Course {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    level: row.level,
    status: row.status,
    instructor: row.instructor,
    price: row.price,
    duration: row.duration,
    description: row.description,
    studentsNumber: row.students_number,
    certification: row.certification,
  }
}
