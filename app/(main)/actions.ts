"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createCourseAction(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/")

  const course = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    category: formData.get("category") as string,
    level: formData.get("level") as string,
    status: formData.get("status") as string,
    instructor: formData.get("instructor") as string,
    price: Number(formData.get("price")),
    duration: Number(formData.get("duration")),
    students_number: Number(formData.get("studentsNumber")),
    certification: formData.get("certification") as string,
    user_id: user.id,
  }

  const { error } = await supabase.from("courses").insert(course)
  if (error) throw new Error(error.message)

  revalidatePath("/dashboard")
  revalidatePath("/catalogue")
  redirect("/dashboard")
}

export async function editCourseAction(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/")

  const id = formData.get("id") as string

  const updates = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    category: formData.get("category") as string,
    level: formData.get("level") as string,
    status: formData.get("status") as string,
    instructor: formData.get("instructor") as string,
    price: Number(formData.get("price")),
    duration: Number(formData.get("duration")),
    students_number: Number(formData.get("studentsNumber")),
    certification: formData.get("certification") as string,
  }

  const { error } = await supabase.from("courses").update(updates).eq("id", id).eq("user_id", user.id)
  if (error) throw new Error(error.message)

  revalidatePath("/dashboard")
  revalidatePath("/catalogue")
  redirect("/dashboard")
}

export async function deleteCourseAction(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/")

  const { error } = await supabase.from("courses").delete().eq("id", id).eq("user_id", user.id)
  if (error) throw new Error(error.message)

  revalidatePath("/dashboard")
  revalidatePath("/catalogue")
}
