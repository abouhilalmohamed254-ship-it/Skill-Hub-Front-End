"use client"

import { useState } from "react"
import { ChevronUp, ChevronDown } from "lucide-react"
import Link from "next/link"
import type { Course } from "@/lib/types"

type CourseFormProps = {
  action: (formData: FormData) => Promise<void>
  course?: Course
  submitLabel: string
  submitIcon: React.ReactNode
}

export default function CourseForm({ action, course, submitLabel, submitIcon }: CourseFormProps) {
  const [inputs, setInputs] = useState({
    title: course?.title ?? "",
    description: course?.description ?? "",
    category: course?.category ?? "Design",
    level: course?.level ?? "Beginner",
    status: course?.status ?? "Draft",
    instructor: course?.instructor ?? "",
    price: course?.price ?? 0,
    duration: course?.duration ?? 0,
    studentsNumber: course?.studentsNumber ?? 0,
    certification: course?.certification ?? "Certificated",
  })

  const [errors, setErrors] = useState({
    title: false,
    description: false,
    instructor: false,
    price: false,
    studentsNumber: false,
    duration: false,
  })

  const [submitting, setSubmitting] = useState(false)

  function handleInputs(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setInputs({ ...inputs, [e.target.name]: e.target.value })
  }

  function handleNumberChange(name: string, delta: number) {
    setInputs({ ...inputs, [name]: Math.max(0, Number(inputs[name as keyof typeof inputs]) + delta) })
  }

  async function handleSubmit() {
    const newErrors = {
      title: !inputs.title,
      description: !inputs.description,
      instructor: !inputs.instructor,
      price: inputs.price <= 0,
      studentsNumber: inputs.studentsNumber < 0,
      duration: inputs.duration <= 0,
    }
    setErrors(newErrors)
    if (Object.values(newErrors).includes(true)) return

    setSubmitting(true)
    const fd = new FormData()
    if (course?.id) fd.set("id", course.id)
    fd.set("title", inputs.title)
    fd.set("description", inputs.description)
    fd.set("category", inputs.category)
    fd.set("level", inputs.level)
    fd.set("status", inputs.status)
    fd.set("instructor", inputs.instructor)
    fd.set("price", String(inputs.price))
    fd.set("duration", String(inputs.duration))
    fd.set("studentsNumber", String(inputs.studentsNumber))
    fd.set("certification", inputs.certification)

    await action(fd)
    setSubmitting(false)
  }

  const inputCls = (hasError: boolean) =>
    `w-full px-4 py-3 bg-white dark:bg-neutral-900 border ${hasError ? "border-red-500/50 dark:border-red-400/50" : "border-neutral-300 dark:border-neutral-700"} rounded-xl text-neutral-900 dark:text-neutral-50 placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600 transition-all duration-200`

  const selectCls = "w-full px-4 py-3 pr-10 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600 transition-all duration-200 cursor-pointer appearance-none"

  return (
    <>
      <style>{`
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        input[type="number"] { -moz-appearance: textfield; }
        select { -webkit-appearance: none; -moz-appearance: none; appearance: none; }
      `}</style>

      <div className="bg-white/80 dark:bg-neutral-800/50 backdrop-blur-sm border border-neutral-200/60 dark:border-neutral-700/60 rounded-2xl shadow-sm dark:shadow-black/20 p-5 lg:p-6 mb-5">
        <h2 className="text-xl lg:text-2xl font-bold text-neutral-900 dark:text-neutral-50 mb-5">Course Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Title</label>
            <input placeholder="Enter course title" type="text" name="title" className={inputCls(errors.title)} value={inputs.title} onChange={handleInputs} />
            {errors.title && <p className="text-xs text-red-600 dark:text-red-400 mt-1.5">Title is required</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Description</label>
            <textarea placeholder="Enter course description" name="description" rows={4} className={`${inputCls(errors.description)} resize-none`} value={inputs.description} onChange={handleInputs} />
            {errors.description && <p className="text-xs text-red-600 dark:text-red-400 mt-1.5">Description is required</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Instructor</label>
            <input placeholder="Enter instructor name" type="text" name="instructor" className={inputCls(errors.instructor)} value={inputs.instructor} onChange={handleInputs} />
            {errors.instructor && <p className="text-xs text-red-600 dark:text-red-400 mt-1.5">Instructor is required</p>}
          </div>
        </div>
      </div>

      <div className="bg-white/80 dark:bg-neutral-800/50 backdrop-blur-sm border border-neutral-200/60 dark:border-neutral-700/60 rounded-2xl shadow-sm dark:shadow-black/20 p-5 lg:p-6 mb-5">
        <h2 className="text-xl lg:text-2xl font-bold text-neutral-900 dark:text-neutral-50 mb-5">Course Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {[
            { name: "category", label: "Category", options: ["Design", "Development", "Marketing", "Business", "Languages"] },
            { name: "level", label: "Level", options: ["Beginner", "Intermediate", "Advanced", "Expert"] },
            { name: "status", label: "Status", options: ["Draft", "Archive", "Public"] },
            { name: "certification", label: "Certification", options: ["Certificated", "Not Certificated"] },
          ].map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">{field.label}</label>
              <div className="relative">
                <select className={selectCls} name={field.name} value={inputs[field.name as keyof typeof inputs] as string} onChange={handleInputs}>
                  {field.options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 dark:text-neutral-400 pointer-events-none" />
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: "price", label: "Price (DH)", error: errors.price, errMsg: "Price must be greater than 0" },
            { name: "studentsNumber", label: "Students", error: errors.studentsNumber, errMsg: "Must be 0 or greater" },
            { name: "duration", label: "Duration (hours)", error: errors.duration, errMsg: "Duration must be greater than 0" },
          ].map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">{field.label}</label>
              <div className="relative">
                <input placeholder="0" type="number" name={field.name} className={`${inputCls(field.error)} pr-10`} value={inputs[field.name as keyof typeof inputs]} onChange={handleInputs} />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col">
                  <button type="button" onClick={() => handleNumberChange(field.name, 1)} className="p-0.5 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors duration-150">
                    <ChevronUp className="w-3 h-3 text-neutral-600 dark:text-neutral-400" />
                  </button>
                  <button type="button" onClick={() => handleNumberChange(field.name, -1)} className="p-0.5 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors duration-150">
                    <ChevronDown className="w-3 h-3 text-neutral-600 dark:text-neutral-400" />
                  </button>
                </div>
              </div>
              {field.error && <p className="text-xs text-red-600 dark:text-red-400 mt-1.5">{field.errMsg}</p>}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Link href="/dashboard" className="px-6 py-3 bg-white/50 dark:bg-neutral-800/30 text-neutral-900 dark:text-neutral-50 rounded-xl font-semibold border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-200/70 dark:hover:bg-neutral-700/50 hover:scale-105 transition-all duration-200">
          Cancel
        </Link>
        <button
          className="px-6 py-3 bg-gradient-to-br from-neutral-900 to-neutral-950 dark:from-neutral-100 dark:to-neutral-50 text-neutral-50 dark:text-neutral-900 rounded-xl font-semibold shadow-md dark:shadow-black/20 hover:shadow-lg hover:scale-105 transition-all duration-200 border border-neutral-900 dark:border-neutral-100 flex items-center gap-2 disabled:opacity-50"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitIcon}
          {submitting ? "Saving..." : submitLabel}
        </button>
      </div>
    </>
  )
}
