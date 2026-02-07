import { createClient } from "@/lib/supabase/server"
import { rowToCourse } from "@/lib/types"
import type { CourseRow } from "@/lib/types"
import { redirect } from "next/navigation"
import DashboardClient from "./dashboard-client"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/")

  const { data } = await supabase
    .from("courses")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })

  const courses = (data as CourseRow[] | null)?.map(rowToCourse) ?? []

  return <DashboardClient courses={courses} />
}
