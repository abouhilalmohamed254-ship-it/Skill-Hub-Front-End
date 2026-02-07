import { createClient } from "@/lib/supabase/server"
import { rowToCourse } from "@/lib/types"
import type { CourseRow } from "@/lib/types"
import { redirect } from "next/navigation"
import EditCourseClient from "./edit-client"

export default async function CourseEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/")

  const { data } = await supabase
    .from("courses")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (!data) redirect("/dashboard")

  const course = rowToCourse(data as CourseRow)

  return <EditCourseClient course={course} />
}
