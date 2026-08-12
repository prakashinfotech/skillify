import { createApi } from '@reduxjs/toolkit/query/react'
import { axiosBaseQuery } from '../utils/axiosBaseQuery'

export const enrollmentApi = createApi({
  reducerPath: 'enrollmentApi',
  baseQuery: axiosBaseQuery({ baseUrl: '/api/v1' }),
  tagTypes: ['Enrollment'],
  endpoints: (builder) => ({
    enroll: builder.mutation({
      query: (courseId) => ({ url: '/enrollments', method: 'POST', data: { courseId } }),
      invalidatesTags: ['Enrollment'],
    }),
    getMyEnrollments: builder.query({
      query: () => ({ url: '/enrollments/my', method: 'GET' }),
      providesTags: ['Enrollment'],
    }),
    unenroll: builder.mutation({
      query: (courseId) => ({ url: `/enrollments/${courseId}`, method: 'DELETE' }),
      invalidatesTags: ['Enrollment'],
    }),
    getCourseEnrollments: builder.query({
      query: (courseId) => ({ url: `/enrollments/course/${courseId}`, method: 'GET' }),
    }),
    completeCourseEnrollment: builder.mutation({
      query: (courseId) => ({ url: `/enrollments/course/${courseId}/complete`, method: 'PATCH' }),
      invalidatesTags: ['Enrollment'],
    }),
  }),
})

export const {
  useEnrollMutation,
  useGetMyEnrollmentsQuery,
  useUnenrollMutation,
  useGetCourseEnrollmentsQuery,
  useCompleteCourseEnrollmentMutation,
} = enrollmentApi
