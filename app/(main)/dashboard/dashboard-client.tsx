"use client"

import { CirclePlus, SquarePen, Trash, BookOpen, Users, Wallet, Award } from "lucide-react"
import { useMemo } from "react"
import Link from "next/link"
import type { Course } from "@/lib/types"
import { deleteCourseAction } from "../actions"
import { useRouter } from "next/navigation"

const statusBadges: Record<string, string> = {
  Draft: "bg-neutral-500/20 dark:bg-neutral-400/10 border border-neutral-500/30 dark:border-neutral-400/20 text-neutral-700 dark:text-neutral-300",
  Archive: "bg-yellow-500/20 dark:bg-yellow-400/10 border border-yellow-500/30 dark:border-yellow-400/20 text-yellow-700 dark:text-yellow-300",
  Public: "bg-green-500/20 dark:bg-green-400/10 border border-green-500/30 dark:border-green-400/20 text-green-700 dark:text-green-300",
}

export default function DashboardClient({ courses }: { courses: Course[] }) {
  const router = useRouter()

  const statistics = useMemo(() => {
    const activeCourses = courses.filter((c) => c.status === "Public").length
    const totalStudents = courses.reduce((sum, c) => sum + c.studentsNumber, 0)
    const totalIncomes = courses.reduce((sum, c) => sum + c.price * c.studentsNumber, 0)
    const bestCourses = courses.filter((c) => c.studentsNumber >= 100).length
    return { activeCourses, totalStudents, totalIncomes, bestCourses }
  }, [courses])

  async function handleDelete(id: string) {
    await deleteCourseAction(id)
    router.refresh()
  }

  return (
    <div className="h-full overflow-y-auto p-4 lg:p-6 bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center gap-4 mb-6 lg:mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-neutral-50">Dashboard</h1>
          <Link
            className="px-6 py-3 bg-gradient-to-br from-neutral-900 to-neutral-950 dark:from-neutral-100 dark:to-neutral-50 text-neutral-50 dark:text-neutral-900 rounded-xl font-semibold shadow-md dark:shadow-black/20 hover:shadow-lg hover:scale-105 transition-all duration-200 border border-neutral-900 dark:border-neutral-100 flex items-center gap-2"
            href="/dashboard/add"
          >
            <CirclePlus className="w-5 h-5" />
            <span className="hidden md:block lg:block">Add Course</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6 lg:mb-8">
          {[
            { label: "Active", value: statistics.activeCourses, Icon: BookOpen },
            { label: "Students", value: statistics.totalStudents, Icon: Users },
            { label: "Income", value: statistics.totalIncomes, Icon: Wallet, suffix: "DH" },
            { label: "Best", value: statistics.bestCourses, Icon: Award },
          ].map((stat) => (
            <div key={stat.label} className="relative bg-white/80 dark:bg-neutral-800/50 backdrop-blur-sm p-3 lg:p-5 rounded-xl lg:rounded-2xl shadow-sm dark:shadow-black/20 border border-neutral-200/60 dark:border-neutral-700/60 hover:shadow-md dark:hover:shadow-black/30 transition-all duration-200">
              <div className="flex items-center gap-2 lg:flex-col lg:items-start mb-2 lg:mb-3">
                <div className="bg-neutral-100 dark:bg-neutral-800 p-1.5 lg:p-2 rounded-lg lg:absolute lg:top-3 lg:right-3">
                  <stat.Icon className="w-4 h-4 lg:w-5 lg:h-5 text-neutral-600 dark:text-neutral-400" />
                </div>
                <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-500 uppercase tracking-wide">{stat.label}</div>
              </div>
              <div className="text-2xl lg:text-4xl font-bold text-neutral-900 dark:text-neutral-50">
                {stat.value}
                {stat.suffix && <span className="text-sm lg:text-lg font-normal text-neutral-600 dark:text-neutral-400 ml-1">{stat.suffix}</span>}
              </div>
            </div>
          ))}
        </div>

        <h2 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-neutral-50 mb-4 lg:mb-6">All Courses</h2>

        {courses.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-lg font-semibold text-neutral-600 dark:text-neutral-400 mb-2">No courses yet</p>
            <p className="text-sm text-neutral-500 mb-4">Create your first course to get started.</p>
            <Link href="/dashboard/add" className="px-6 py-3 bg-gradient-to-br from-neutral-900 to-neutral-950 dark:from-neutral-100 dark:to-neutral-50 text-neutral-50 dark:text-neutral-900 rounded-xl font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center gap-2">
              <CirclePlus className="w-5 h-5" />
              Add Course
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
          {courses.map((course) => (
            <div className="bg-gradient-to-br from-white/80 to-neutral-50/50 dark:from-neutral-800/50 dark:to-neutral-900/30 backdrop-blur-sm rounded-2xl shadow-md dark:shadow-black/30 border border-neutral-200/60 dark:border-neutral-700/60 hover:shadow-lg dark:hover:shadow-black/50 transition-all duration-200 overflow-hidden" key={course.id}>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-50 leading-tight line-clamp-2 flex-1">{course.title}</h3>
                  <div className={`${statusBadges[course.status] ?? ""} rounded-lg px-2 py-1 text-xs font-bold tracking-wide whitespace-nowrap`}>
                    {course.status}
                  </div>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 line-clamp-2">{course.description}</p>
                <div className="space-y-2 mb-4 pb-4 border-b border-neutral-200/50 dark:border-neutral-700/50">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-neutral-500">Instructor</span>
                    <span className="font-medium text-neutral-900 dark:text-neutral-100">{course.instructor}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-neutral-500">Category</span>
                    <span className="font-medium text-neutral-900 dark:text-neutral-100">{course.category}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-neutral-500">Students</span>
                    <span className="font-medium text-neutral-900 dark:text-neutral-100">{course.studentsNumber}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <div className="text-xs text-neutral-500 mb-1">Price</div>
                    <div className="text-lg font-bold text-neutral-900 dark:text-neutral-50">{course.price} DH</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-neutral-500 mb-1">Income</div>
                    <div className="text-lg font-bold text-neutral-900 dark:text-neutral-50">{course.price * course.studentsNumber} DH</div>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4 border-t border-neutral-200/50 dark:border-neutral-700/50">
                  <Link className="bg-white/50 dark:bg-neutral-800/30 text-neutral-900 dark:text-neutral-50 p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-200/70 dark:hover:bg-neutral-700/50 hover:scale-105 transition-all duration-200" href={`/dashboard/edit/${course.id}`}>
                    <SquarePen className="w-4 h-4" />
                  </Link>
                  <button type="button" className="bg-red-500/20 dark:bg-red-400/10 text-red-700 dark:text-red-300 p-2 rounded-lg border border-red-500/30 dark:border-red-400/20 hover:bg-red-500/30 dark:hover:bg-red-400/20 hover:scale-105 transition-all duration-200" onClick={() => handleDelete(course.id)}>
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
