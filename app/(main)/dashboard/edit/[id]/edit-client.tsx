"use client"

import CourseForm from "@/components/course-form"
import { editCourseAction } from "../../../actions"
import { SquarePen } from "lucide-react"
import type { Course } from "@/lib/types"

export default function EditCourseClient({ course }: { course: Course }) {
  return (
    <div className="h-full overflow-y-auto p-4 lg:p-6 bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-neutral-50 mb-6 lg:mb-8">
          Edit Course
        </h1>
        <CourseForm
          action={editCourseAction}
          course={course}
          submitLabel="Save Changes"
          submitIcon={<SquarePen className="w-5 h-5" />}
        />
      </div>
    </div>
  )
}
