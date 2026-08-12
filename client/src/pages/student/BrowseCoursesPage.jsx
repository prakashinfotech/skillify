import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import CourseFilters from '../../components/course/CourseFilters'
import CourseGrid from '../../components/course/CourseGrid'
import Pagination from '../../components/common/Pagination'
import Loader from '../../components/common/Loader'
import EmptyState from '../../components/common/EmptyState'
import { useGetCoursesQuery } from '../../services/courseApi'
import { useGetMyEnrollmentsQuery, useEnrollMutation } from '../../services/enrollmentApi'
import { useToast } from '../../hooks/useToast'

const BrowseCoursesPage = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { showToast } = useToast()
  const { user } = useSelector((s) => s.auth)

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    level: searchParams.get('level') || '',
    sort: searchParams.get('sort') || 'newest',
    page: parseInt(searchParams.get('page') || '1', 10),
    limit: 10,
  })

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      category: searchParams.get('category') || '',
      search: searchParams.get('search') || '',
      level: searchParams.get('level') || '',
      sort: searchParams.get('sort') || 'newest',
      page: parseInt(searchParams.get('page') || '1', 10),
    }))
  }, [searchParams.toString()]) // eslint-disable-line react-hooks/exhaustive-deps

  const { data: coursesData, isLoading, isFetching } = useGetCoursesQuery(filters)
  const { data: enrollmentsData } = useGetMyEnrollmentsQuery(undefined, {
    skip: user?.role !== 'student',
  })
  const [enroll] = useEnrollMutation()

  const courses = coursesData?.data?.courses || []
  const total = coursesData?.data?.total || courses.length
  const totalPages = coursesData?.data?.totalPages || Math.ceil(total / filters.limit)

  const enrollments = enrollmentsData?.data?.enrollments || []
  const enrolledIds = new Set(enrollments.map((e) => e.course?._id || e.course))

  const updateFilters = (newFilters) => {
    const updated = { ...filters, ...newFilters, page: newFilters.page || 1 }
    setFilters(updated)
    const params = {}
    if (updated.search) params.search = updated.search
    if (updated.category) params.category = updated.category
    if (updated.level) params.level = updated.level
    if (updated.sort && updated.sort !== 'newest') params.sort = updated.sort
    if (updated.page > 1) params.page = String(updated.page)
    setSearchParams(params)
  }

  const handleEnroll = async (courseId) => {
    if (user?.role !== 'student') {
      showToast('Only students can enroll in courses', 'warning')
      return
    }
    try {
      await enroll(courseId).unwrap()
      showToast('Successfully enrolled!', 'success')
    } catch (err) {
      showToast(err?.data?.message || 'Enrollment failed', 'danger')
    }
  }

  const removeFilter = (key) => updateFilters({ [key]: '', page: 1 })

  const startIdx = (filters.page - 1) * filters.limit + 1
  const endIdx = Math.min(filters.page * filters.limit, total)

  const appliedFilters = [
    filters.search && { key: 'search', label: `"${filters.search}"` },
    filters.category && { key: 'category', label: filters.category },
    filters.level && { key: 'level', label: filters.level },
  ].filter(Boolean)

  return (
    <div>
      {/* Page header */}
      <div className="mb-4">
        <h3 className="fw-bold mb-1" style={{ color: '#1d3557' }}>Browse Courses</h3>
        <p className="text-muted mb-0">Discover and enroll in expert-curated courses.</p>
      </div>

      {/* Filters */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body py-2">
          <CourseFilters filters={filters} onChange={updateFilters} />
        </div>
      </div>

      {/* Results info + active filter chips */}
      {(total > 0 || appliedFilters.length > 0) && (
        <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
          {!isLoading && total > 0 && (
            <span className="text-muted small">
              Showing <strong>{startIdx}–{endIdx}</strong> of <strong>{total}</strong> courses
            </span>
          )}
          {appliedFilters.map((f) => (
            <span key={f.key} className="badge bg-primary d-flex align-items-center gap-1" style={{ fontSize: '0.75rem' }}>
              {f.label}
              <button
                type="button"
                className="btn-close btn-close-white ms-1"
                style={{ fontSize: '0.55rem' }}
                onClick={() => removeFilter(f.key)}
              />
            </span>
          ))}
          {appliedFilters.length > 0 && (
            <button
              className="btn btn-link btn-sm text-decoration-none p-0 text-muted"
              onClick={() => updateFilters({ search: '', category: '', level: '', sort: 'newest', page: 1 })}
            >
              Clear all
            </button>
          )}
        </div>
      )}

      {/* Course grid */}
      {isLoading || isFetching ? (
        <Loader />
      ) : courses.length === 0 ? (
        <EmptyState
          icon="bi-search"
          title="No courses found"
          description="Try adjusting your filters or search term."
        />
      ) : (
        <CourseGrid courses={courses} enrolledIds={enrolledIds} onEnroll={handleEnroll} />
      )}

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="mt-4 d-flex justify-content-center">
          <Pagination
            currentPage={filters.page}
            totalPages={totalPages}
            onPageChange={(page) => updateFilters({ page })}
          />
        </div>
      )}
    </div>
  )
}

export default BrowseCoursesPage
