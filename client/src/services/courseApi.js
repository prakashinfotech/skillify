import { createApi } from '@reduxjs/toolkit/query/react'
import { axiosBaseQuery } from '../utils/axiosBaseQuery'

export const courseApi = createApi({
  reducerPath: 'courseApi',
  baseQuery: axiosBaseQuery({ baseUrl: '/api/v1' }),
  tagTypes: ['Course', 'MyCourses', 'PendingCourses'],
  endpoints: (builder) => ({
    getCourses: builder.query({
      query: (params) => ({ url: '/courses', method: 'GET', params }),
      providesTags: ['Course'],
    }),
    getCourseById: builder.query({
      query: (id) => ({ url: `/courses/${id}`, method: 'GET' }),
      providesTags: (result, error, id) => [{ type: 'Course', id }],
    }),
    getCourseFullDetail: builder.query({
      query: (id) => ({ url: `/courses/${id}/full`, method: 'GET' }),
      providesTags: (result, error, id) => [{ type: 'Course', id }],
    }),
    createCourse: builder.mutation({
      query: (data) => ({ url: '/courses', method: 'POST', data }),
      invalidatesTags: ['Course', 'MyCourses'],
    }),
    updateCourse: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/courses/${id}`, method: 'PUT', data }),
      invalidatesTags: ['Course', 'MyCourses'],
    }),
    deleteCourse: builder.mutation({
      query: (id) => ({ url: `/courses/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Course', 'MyCourses'],
    }),
    submitForApproval: builder.mutation({
      query: (id) => ({ url: `/courses/${id}/submit`, method: 'PATCH' }),
      invalidatesTags: ['Course', 'MyCourses'],
    }),
    approveCourse: builder.mutation({
      query: (id) => ({ url: `/courses/${id}/approve`, method: 'PATCH' }),
      invalidatesTags: ['Course', 'PendingCourses'],
    }),
    rejectCourse: builder.mutation({
      query: ({ id, reason }) => ({ url: `/courses/${id}/reject`, method: 'PATCH', data: { reason } }),
      invalidatesTags: ['Course', 'PendingCourses'],
    }),
    getMyCourses: builder.query({
      query: () => ({ url: '/courses/teacher/mine', method: 'GET' }),
      providesTags: ['MyCourses'],
    }),
    bulkUpdateCourse: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/courses/${id}/bulk-update`, method: 'PUT', data }),
      invalidatesTags: ['Course', 'MyCourses'],
    }),
  }),
})

export const {
  useGetCoursesQuery,
  useGetCourseByIdQuery,
  useGetCourseFullDetailQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useBulkUpdateCourseMutation,
  useDeleteCourseMutation,
  useSubmitForApprovalMutation,
  useApproveCourseMutation,
  useRejectCourseMutation,
  useGetMyCoursesQuery,
} = courseApi
