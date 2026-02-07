import { createClient } from "@/lib/supabase/server"
import { rowToCourse } from "@/lib/types"
import type { CourseRow } from "@/lib/types"
import CatalogueClient from "./catalogue-client"

export default async function CataloguePage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("courses")
    .select("*")
    .eq("status", "Public")
    .order("created_at", { ascending: true })

  const courses = (data as CourseRow[] | null)?.map(rowToCourse) ?? []

  return <CatalogueClient courses={courses} />
}
