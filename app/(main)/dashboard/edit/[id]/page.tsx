"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { CourseForm } from "@/components/course-form"
import type { Course } from "@/lib/types"
import { Loader2 } from "lucide-react"

export default function CourseEditPage() {
  const params = useParams()
  const id = params.id as string
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCourse() {
      const supabase = createClient()
      const { data } = await supabase
        .from("courses")
        .select("*")
        .eq("id", id)
        .single()

      if (data) {
        setCourse({
          id: data.id,
          title: data.title,
          category: data.category,
          level: data.level,
          status: data.status,
          instructor: data.instructor,
          price: data.price,
          duration: data.duration,
          description: data.description,
          studentsNumber: data.students_number,
          certification: data.certification,
        })
      }
      setLoading(false)
    }
    fetchCourse()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Course not found.</p>
      </div>
    )
  }

  return <CourseForm mode="edit" initialData={course} />
}
