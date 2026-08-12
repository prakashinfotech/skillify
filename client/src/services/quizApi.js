import { createApi } from '@reduxjs/toolkit/query/react'
import { axiosBaseQuery } from '../utils/axiosBaseQuery'

export const quizApi = createApi({
  reducerPath: 'quizApi',
  baseQuery: axiosBaseQuery({ baseUrl: '/api/v1' }),
  tagTypes: ['Quiz', 'Progress'],
  endpoints: (builder) => ({
    getQuizzesByCourse: builder.query({
      query: (courseId) => ({ url: `/quizzes/course/${courseId}`, method: 'GET' }),
      providesTags: ['Quiz'],
    }),
    getQuizById: builder.query({
      query: (id) => ({ url: `/quizzes/${id}`, method: 'GET' }),
      providesTags: (result, error, id) => [{ type: 'Quiz', id }],
    }),
    createQuiz: builder.mutation({
      query: (data) => ({ url: '/quizzes', method: 'POST', data }),
      invalidatesTags: ['Quiz'],
    }),
    updateQuiz: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/quizzes/${id}`, method: 'PUT', data }),
      invalidatesTags: ['Quiz'],
    }),
    deleteQuiz: builder.mutation({
      query: (id) => ({ url: `/quizzes/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Quiz'],
    }),
    attemptQuiz: builder.mutation({
      query: ({ id, answers }) => ({ url: `/quizzes/${id}/attempt`, method: 'POST', data: { answers } }),
      invalidatesTags: ['Progress'],
    }),
    getQuizResults: builder.query({
      query: ({ quizId, studentId }) => ({ url: `/quizzes/${quizId}/results/${studentId}`, method: 'GET' }),
    }),
  }),
})

export const {
  useGetQuizzesByCourseQuery,
  useGetQuizByIdQuery,
  useCreateQuizMutation,
  useUpdateQuizMutation,
  useDeleteQuizMutation,
  useAttemptQuizMutation,
  useGetQuizResultsQuery,
} = quizApi
