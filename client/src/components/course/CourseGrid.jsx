import CourseCard from './CourseCard'
import EmptyState from '../common/EmptyState'
import Loader from '../common/Loader'


const CourseGrid = ({ courses = [], enrolledIds, onEnroll, isLoading }) => {
  if (isLoading) return <Loader />
  if (!courses.length) return <EmptyState title="No courses found" message="Try adjusting your filters." icon="bi-search" />
  return (
    <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
      {courses.map((course) => (
        <div key={course._id} className="col">
          <CourseCard
            course={course}
            isEnrolled={enrolledIds ? enrolledIds.has(String(course._id)) : false}
            onEnroll={onEnroll}
          />
        </div>
      ))}
    </div>
  )
}
export default CourseGrid
