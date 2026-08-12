import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import Loader from '../../components/common/Loader';
import { useGetCourseByIdQuery, useGetCourseFullDetailQuery } from '../../services/courseApi';
import { useGetMyEnrollmentsQuery, useEnrollMutation } from '../../services/enrollmentApi';
import { useGetQuizzesByCourseQuery } from '../../services/quizApi';
import { useToast } from '../../hooks/useToast';
import { formatDuration, getCategoryBadgeClass } from '../../utils/formatters';

const LEVEL_COLORS = { Beginner: 'success', Intermediate: 'warning', Advanced: 'danger' };

export default function CourseDetailPage() {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const auth = useSelector((s) => s.auth);
  const user = auth?.user;
  const isAuthenticated = !!auth?.accessToken;

  const [activeTab, setActiveTab] = useState('content');

  const { data: courseData, isLoading: courseLoading } = useGetCourseByIdQuery(courseId);
  const { data: enrollmentsData } = useGetMyEnrollmentsQuery(undefined, {
    skip: !isAuthenticated,
  });

  // Compute access early so we only call /full when the user is actually allowed
  const enrollmentsEarly = enrollmentsData?.data?.enrollments || enrollmentsData?.data || enrollmentsData || [];
  const isEnrolledEarly = Array.isArray(enrollmentsEarly) && enrollmentsEarly.some((e) => {
    const cId = typeof e.course === 'object' ? e.course?._id : e.course;
    return String(cId) === String(courseId) && e.status !== 'dropped';
  });
  const courseEarly = courseData?.data?.course || courseData?.data || null;
  const teacherIdEarly = typeof courseEarly?.teacher === 'object' ? courseEarly?.teacher?._id : courseEarly?.teacher;
  const hasAccessEarly = isEnrolledEarly || user?._id === teacherIdEarly || user?.role === 'admin';

  const { data: fullDetailData } = useGetCourseFullDetailQuery(courseId, {
    skip: !isAuthenticated || !hasAccessEarly,
  });
  
  const { data: quizzesData } = useGetQuizzesByCourseQuery(courseId);
  const [enroll, { isLoading: enrolling }] = useEnrollMutation();

  const course = courseData?.data?.course || courseData?.data || null;
  const enrollments = enrollmentsData?.data?.enrollments || enrollmentsData?.data || enrollmentsData || [];
  
  const isEnrolled = enrollments.some((e) => {
    const cId = typeof e.course === 'object' ? e.course?._id : e.course;
    return String(cId) === String(courseId) && e.status !== 'dropped';
  });

  const teacherId = typeof course?.teacher === 'object' ? course.teacher?._id : course?.teacher;
  const isInstructor = user?._id === teacherId;
  const isAdmin = user?.role === 'admin';
  const hasFullAccess = isEnrolled || isInstructor || isAdmin;

  const fullDetail = fullDetailData?.data || null;
  const lessons = fullDetail?.lessons || [];
  const quizzes = quizzesData?.data?.quizzes || quizzesData?.data || [];

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (isInstructor) return; // Instructor shouldn't enroll in their own course
    
    try {
      await enroll(courseId).unwrap();
      showToast('Successfully enrolled!', 'success');
    } catch (err) {
      showToast(err?.data?.message || 'Enrollment failed', 'danger');
    }
  };

  if (courseLoading) return <><Navbar /><Loader /></>;
  if (!course) return <><Navbar /><div className="container py-5 text-center text-muted">Course not found.</div></>;

  const teacher = course.teacher || {};
  const teacherName = teacher.name || 'Unknown Instructor';
  const teacherAvatar = teacher.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(teacherName)}&background=1d3557&color=fff`;

  const lessonCount = course.lessonCount || course.lessons?.length || 0;
  
  // Use real lessons if we have full access, otherwise placeholders
  const displayLessons = hasFullAccess && lessons.length > 0 
    ? lessons 
    : Array.from({ length: lessonCount }, (_, i) => ({
        _id: `placeholder-${i}`,
        title: `Lesson ${i + 1}`,
        duration: null,
      }));

  return (
    <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: '#fcfcfd', paddingTop: 'var(--navbar-height)' }}>
      <Navbar />

      {/* Hero Header */}
      <section className="bg-dark text-white pt-5 pb-5 border-bottom" style={{ background: 'linear-gradient(135deg, #1d3557 0%, #111e30 100%)' }}>
        <div className="container">
          <div className="row g-4">
            <div className="col-md-8">
              <nav aria-label="breadcrumb" className="mb-4">
                <ol className="breadcrumb small">
                  <li className="breadcrumb-item"><Link to="/" className="text-white-50 text-decoration-none">Home</Link></li>
                  <li className="breadcrumb-item"><Link to="/courses" className="text-white-50 text-decoration-none">Courses</Link></li>
                  <li className="breadcrumb-item active text-white fw-bold">{course.title}</li>
                </ol>
              </nav>

              <div className="d-flex align-items-center gap-2 mb-3">
                <span className={`badge bg-${getCategoryBadgeClass(course.category)} px-3 py-2 rounded-2 fw-bold text-uppercase`} style={{ fontSize: '0.7rem' }}>{course.category}</span>
                <span className={`badge bg-${LEVEL_COLORS[course.level] || 'secondary'} bg-opacity-25 text-${LEVEL_COLORS[course.level] || 'secondary'} border border-${LEVEL_COLORS[course.level] || 'secondary'} border-opacity-25 px-3 py-2 rounded-2 fw-bold text-uppercase`} style={{ fontSize: '0.7rem' }}>{course.level} Level</span>
              </div>

              <h1 className="fw-bold display-5 mb-3">{course.title}</h1>
              <p className="text-white-50 mb-4 fs-5" style={{ maxWidth: '650px', lineHeight: '1.6' }}>{course.description}</p>

              <div className="d-flex flex-wrap align-items-center gap-4 text-white-50 small mt-auto">
                <div className="d-flex align-items-center gap-2">
                  <img src={teacherAvatar} alt={teacherName} className="rounded-circle border border-white border-opacity-25" width={32} height={32} />
                  <span className="text-white">Created by <span className="fw-bold">{teacherName}</span></span>
                </div>
                <div className="d-flex align-items-center gap-1"><i className="bi bi-play-circle-fill text-primary"></i> {lessonCount} Lessons</div>
                <div className="d-flex align-items-center gap-1"><i className="bi bi-people-fill text-primary"></i> {(course.enrollmentCount || 0).toLocaleString()} Students Enrolled</div>
                {course.totalDuration > 0 && <div className="d-flex align-items-center gap-1"><i className="bi bi-clock-fill text-primary"></i> {formatDuration(course.totalDuration)}</div>}
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-0 shadow-lg rounded-4 overflow-hidden" style={{ position: 'sticky', top: 90, zIndex: 10 }}>
                {course.thumbnail && <img src={course.thumbnail} alt={course.title} className="card-img-top" style={{ height: 220, objectFit: 'cover' }} />}
                <div className="card-body p-4 bg-white">
                  <div className="h2 fw-bold text-dark mb-4">{!course.price ? 'Free' : `$${course.price}`}</div>
                  
                  {isInstructor ? (
                    <div className="d-grid gap-2">
                      <Link to={`/teacher/courses/${courseId}/edit`} className="btn btn-primary btn-lg rounded-3 fw-bold py-3 shadow-sm">
                        <i className="bi bi-pencil-square me-2"></i>Edit Course Content
                      </Link>
                      <div className="alert alert-info border-0 shadow-none py-2 mb-0 small text-center rounded-3">
                        <i className="bi bi-info-circle me-1"></i> You are viewing your own course.
                      </div>
                    </div>
                  ) : isEnrolled ? (
                    <Link to={`/student/courses/${courseId}/lessons/${lessons[0]?._id || ''}`} className="btn btn-success btn-lg w-100 rounded-3 fw-bold py-3 shadow-sm">
                      <i className="bi bi-play-fill me-2"></i>Continue Learning
                    </Link>
                  ) : (
                    <button className="btn btn-primary btn-lg w-100 rounded-3 fw-bold py-3 shadow-sm" onClick={handleEnroll} disabled={enrolling}>
                      {enrolling ? <><span className="spinner-border spinner-border-sm me-2" />Processing...</> : 'Enroll Now — Get Started'}
                    </button>
                  )}

                  <div className="mt-4 pt-4 border-top">
                    <h6 className="fw-bold mb-3 small text-uppercase text-muted">This course includes:</h6>
                    <ul className="list-unstyled mb-0 d-grid gap-2">
                      <li className="d-flex align-items-center gap-3 small text-secondary">
                        <i className="bi bi-infinity text-primary fs-5"></i> Full lifetime access
                      </li>
                      <li className="d-flex align-items-center gap-3 small text-secondary">
                        <i className="bi bi-phone text-primary fs-5"></i> Access on mobile and TV
                      </li>
                      <li className="d-flex align-items-center gap-3 small text-secondary">
                        <i className="bi bi-award text-primary fs-5"></i> Certificate of completion
                      </li>
                    </ul>

                    {course.prerequisites?.length > 0 && (
                      <div className="mt-4 pt-4 border-top">
                        <h6 className="fw-bold mb-3 small text-uppercase text-danger">
                          <i className="bi bi-exclamation-triangle-fill me-2"></i>Prerequisites:
                        </h6>
                        <ul className="list-unstyled mb-0 d-grid gap-2">
                          {course.prerequisites.map(pre => (
                            <li key={pre._id} className="d-flex align-items-center gap-2 small text-dark fw-medium">
                              <i className="bi bi-check-circle text-muted"></i>
                              <Link to={`/courses/${pre._id}`} className="text-decoration-none hover-primary">{pre.title}</Link>
                            </li>
                          ))}
                        </ul>
                        <p className="mt-3 mb-0 text-muted" style={{ fontSize: '0.75rem' }}>
                          You must complete these courses before you can enroll.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Body */}
      <section className="py-5 bg-white">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              <ul className="nav nav-pills gap-2 mb-5 p-1 bg-light rounded-3 w-fit-content" style={{ width: 'fit-content' }}>
                <li className="nav-item">
                  <button className={`nav-link rounded-2 px-4 py-2 fw-bold ${activeTab === 'content' ? 'active shadow-sm' : 'text-muted'}`} onClick={() => setActiveTab('content')}>Curriculum</button>
                </li>
                <li className="nav-item">
                  <button className={`nav-link rounded-2 px-4 py-2 fw-bold ${activeTab === 'instructor' ? 'active shadow-sm' : 'text-muted'}`} onClick={() => setActiveTab('instructor')}>Instructor</button>
                </li>
              </ul>

              {activeTab === 'content' && (
                <div className="fade-in">
                  <div className="d-flex justify-content-between align-items-end mb-4">
                    <div>
                      <h4 className="fw-bold mb-1">Course Curriculum</h4>
                      <p className="text-muted mb-0">{lessonCount} total lessons • {quizzes.length} Quizzes</p>
                    </div>
                    {!hasFullAccess && !isInstructor && (
                      <span className="text-muted small fw-medium bg-light px-3 py-1 rounded-pill">
                        <i className="bi bi-lock-fill me-1"></i>Enroll to unlock
                      </span>
                    )}
                  </div>

                  <div className="list-group list-group-flush border rounded-4 overflow-hidden shadow-sm">
                    {displayLessons.map((lesson, idx) => (
                      <div key={lesson._id} className={`list-group-item list-group-item-action py-4 px-4 d-flex align-items-center gap-4 border-bottom ${!hasFullAccess && 'bg-light'}`}>
                        <div className="d-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10 text-primary fw-bold" style={{ width: 42, height: 42, flexShrink: 0 }}>
                          {idx + 1}
                        </div>
                        <div className="flex-grow-1">
                          {hasFullAccess ? (
                            <Link to={`/student/courses/${courseId}/lessons/${lesson._id}`} className="text-decoration-none text-dark fw-bold fs-5 hover-primary d-block mb-1">
                              {lesson.title}
                            </Link>
                          ) : (
                            <span className="fw-bold text-muted fs-5 d-block mb-1">{lesson.title}</span>
                          )}
                          <div className="d-flex align-items-center gap-3">
                            <span className="badge bg-light text-muted border px-2 py-1 text-capitalize small">{lesson.contentType || 'Video'}</span>
                            {lesson.duration > 0 && <span className="text-muted small"><i className="bi bi-clock me-1"></i>{lesson.duration}m</span>}
                          </div>
                        </div>
                        {hasFullAccess ? (
                          <i className="bi bi-play-circle-fill text-primary fs-4"></i>
                        ) : (
                          <i className="bi bi-lock-fill text-muted fs-4"></i>
                        )}
                      </div>
                    ))}
                  </div>

                  {quizzes.length > 0 && (
                    <div className="mt-5">
                      <h5 className="fw-bold mb-4 d-flex align-items-center">
                        <span className="bg-warning bg-opacity-10 text-warning p-2 rounded-3 me-3"><i className="bi bi-patch-question-fill"></i></span>
                        Course Quizzes
                      </h5>
                      <div className="list-group list-group-flush border rounded-4 overflow-hidden shadow-sm">
                        {quizzes.map((quiz) => (
                          <div key={quiz._id} className="list-group-item py-4 px-4 d-flex align-items-center gap-4">
                            <i className="bi bi-question-circle text-warning fs-3"></i>
                            <div className="flex-grow-1">
                              <h6 className="fw-bold mb-1 fs-5">{quiz.title}</h6>
                              <div className="text-muted small">{quiz.questions?.length || 0} objective questions • {quiz.passingScore || 70}% passing score</div>
                            </div>
                            {hasFullAccess ? (
                              <Link to={`/student/courses/${courseId}/quiz/${quiz._id}`} className="btn btn-warning rounded-3 fw-bold px-4">Take Quiz</Link>
                            ) : (
                              <i className="bi bi-lock-fill text-muted fs-4"></i>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'instructor' && (
                <div className="fade-in">
                  <div className="card border-0 bg-light rounded-4 p-5">
                    <div className="d-flex align-items-center gap-4 mb-4">
                      <img src={teacherAvatar} alt={teacherName} className="rounded-circle shadow-sm" width={100} height={100} style={{ objectFit: 'cover' }} />
                      <div>
                        <h3 className="fw-bold mb-1">{teacherName}</h3>
                        <p className="text-primary fw-bold mb-0 text-uppercase small">Professional Instructor</p>
                      </div>
                    </div>
                    <p className="text-muted fs-5 lh-base mb-4">
                      {teacher.bio || `${teacherName} is an expert in ${course.category} with years of experience in the industry. They are dedicated to helping students bridge the gap between theory and practical application through engaging, high-quality course content.`}
                    </p>
                    <div className="row g-3">
                      <div className="col-md-4">
                        <div className="p-3 bg-white rounded-3 border text-center">
                          <div className="h4 fw-bold mb-0 text-primary">{lessonCount}</div>
                          <small className="text-muted text-uppercase fw-bold" style={{ fontSize: '0.65rem' }}>Lessons</small>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="p-3 bg-white rounded-3 border text-center">
                          <div className="h4 fw-bold mb-0 text-primary">{(course.enrollmentCount || 0).toLocaleString()}</div>
                          <small className="text-muted text-uppercase fw-bold" style={{ fontSize: '0.65rem' }}>Students</small>
                        </div>
                      </div>
                      <div className="col-md-4 text-center">
                        <Link to={`/courses?teacher=${teacherId}`} className="btn btn-outline-primary w-100 h-100 d-flex flex-column justify-content-center rounded-3">
                          <small className="fw-bold text-uppercase" style={{ fontSize: '0.65rem' }}>View All</small>
                          <div className="fw-bold">Courses</div>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
