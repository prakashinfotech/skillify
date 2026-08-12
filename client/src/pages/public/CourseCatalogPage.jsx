import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import CourseFilters from '../../components/course/CourseFilters';
import CourseGrid from '../../components/course/CourseGrid';
import Pagination from '../../components/common/Pagination';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { useGetCoursesQuery } from '../../services/courseApi';
import { useGetMyEnrollmentsQuery, useEnrollMutation } from '../../services/enrollmentApi';
import { useToast } from '../../hooks/useToast';

export default function CourseCatalogPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();
  const auth = useSelector((s) => s.auth);
  const isAuthenticated = !!auth?.accessToken;
  const isAdmin = auth?.user?.role === 'admin';

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    level: searchParams.get('level') || '',
    teacher: searchParams.get('teacher') || '',
    sort: searchParams.get('sort') || 'newest',
    page: parseInt(searchParams.get('page') || '1', 10),
    limit: 10,
  });

  // Sync URL → state when searchParams change externally
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      category: searchParams.get('category') || '',
      search: searchParams.get('search') || '',
      level: searchParams.get('level') || '',
      teacher: searchParams.get('teacher') || '',
      sort: searchParams.get('sort') || 'newest',
      page: parseInt(searchParams.get('page') || '1', 10),
    }));
  }, [searchParams.toString()]); // eslint-disable-line react-hooks/exhaustive-deps

  const { data: coursesData, isLoading, isFetching } = useGetCoursesQuery(filters);
  const { data: enrollmentsData } = useGetMyEnrollmentsQuery(undefined, {
    skip: !isAuthenticated,
  });
  const [enroll] = useEnrollMutation();

  const courses = coursesData?.data?.courses || [];
  const total = coursesData?.data?.total || courses.length;
  const totalPages = coursesData?.data?.totalPages || Math.ceil(total / filters.limit);

  const enrollments = enrollmentsData?.data?.enrollments || [];
  const enrolledIds = new Set(
    enrollments
      .filter((e) => e.status !== 'dropped')
      .map((e) => String(typeof e.course === 'object' ? e.course?._id : e.course))
  );

  const updateFilters = (newFilters) => {
    const updated = { ...filters, ...newFilters, page: newFilters.page || 1 };
    setFilters(updated);
    const params = {};
    if (updated.search) params.search = updated.search;
    if (updated.category) params.category = updated.category;
    if (updated.level) params.level = updated.level;
    if (updated.teacher) params.teacher = updated.teacher;
    if (updated.sort && updated.sort !== 'newest') params.sort = updated.sort;
    if (updated.page > 1) params.page = String(updated.page);
    setSearchParams(params);
  };

  const handleEnroll = async (courseId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      await enroll(courseId).unwrap();
      showToast('Successfully enrolled in course!', 'success');
    } catch (err) {
      showToast(err?.data?.message || 'Enrollment failed', 'danger');
    }
  };

  const removeFilter = (key) => updateFilters({ [key]: '', page: 1 });

  const startIdx = (filters.page - 1) * filters.limit + 1;
  const endIdx = Math.min(filters.page * filters.limit, total);

  const appliedFilters = [
    filters.search && { key: 'search', label: `"${filters.search}"` },
    filters.category && { key: 'category', label: filters.category },
    filters.level && { key: 'level', label: filters.level },
    filters.teacher && { 
      key: 'teacher', 
      label: courses[0]?.teacher?.name ? `Instructor: ${courses[0].teacher.name}` : 'Specific Instructor' 
    },
  ].filter(Boolean);

  return (
    <div className="d-flex flex-column min-vh-100" style={{ paddingTop: 'var(--navbar-height)' }}>
      <Navbar />

      {/* Sticky Filter Bar */}
      <div
        className="bg-white border-bottom py-2 px-4"
        style={{ position: 'sticky', top: 56, zIndex: 100 }}
      >
        <div className="container-fluid">
          <CourseFilters filters={filters} onChange={updateFilters} />
        </div>
      </div>

      <div className="container py-4">
        {/* Results Info + Active Filter Badges */}
        <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
          {!isLoading && total > 0 && (
            <span className="text-muted small">
              Showing <strong>{startIdx}–{endIdx}</strong> of <strong>{total}</strong> courses
            </span>
          )}
          {appliedFilters.map((f) => (
            <span key={f.key} className="badge bg-primary d-flex align-items-center gap-1">
              {f.label}
              <button
                type="button"
                className="btn-close btn-close-white"
                style={{ fontSize: '0.6rem' }}
                aria-label="Remove filter"
                onClick={() => removeFilter(f.key)}
              />
            </span>
          ))}
          {appliedFilters.length > 0 && (
            <button
              className="btn btn-link btn-sm text-decoration-none p-0"
              onClick={() =>
                updateFilters({ search: '', category: '', level: '', teacher: '', sort: 'newest', page: 1 })
              }
            >
              Clear all
            </button>
          )}
        </div>

        {/* Course Grid */}
        {isLoading || isFetching ? (
          <Loader />
        ) : courses.length === 0 ? (
          <EmptyState
            icon="bi-search"
            title="No courses found"
            message="Try adjusting your filters or search term."
          />
        ) : (
          <CourseGrid
            courses={courses}
            enrolledIds={enrolledIds}
            onEnroll={isAdmin ? undefined : handleEnroll}
          />
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

      <Footer />
    </div>
  );
}
