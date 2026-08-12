import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../features/auth/authSlice';
import { useLoginMutation } from '../../services/authApi';
import { useToast } from '../../hooks/useToast';

const schema = yup.object({
  email: yup.string().required('Email is required').email('Enter a valid email'),
  password: yup.string().required('Password is required'),
});

export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const [login, { isLoading }] = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data) => {
    setServerError('');
    try {
      const result = await login(data).unwrap();
      const { user, accessToken } = result.data || result;
      dispatch(setCredentials({ user, accessToken }));
      showToast(`Welcome back, ${user.name}!`, 'success');

      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'teacher') {
        navigate('/teacher/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      const msg = err?.data?.message || 'Invalid credentials. Please try again.';
      setServerError(msg);
      showToast(msg, 'error');
    }
  };

  return (
    <div className="row g-0" style={{ minHeight: '100vh' }}>
      {/* Left Panel — Branded */}
      <div
        className="col-md-5 d-none d-md-flex flex-column justify-content-between py-5 px-5 text-white"
        style={{ background: '#1d3557' }}
      >
        <div>
          <div className="d-flex align-items-center gap-2 mb-5">
            <i className="bi bi-mortarboard-fill text-white" style={{ fontSize: '3rem' }}></i>
            <h2 className="fw-bold mb-0">Skillify</h2>
          </div>
          <h3 className="fw-bold mb-3" style={{ lineHeight: 1.4 }}>
            Unlock your potential with world-class education.
          </h3>
          <p className="text-white-50" style={{ lineHeight: 1.7 }}>
            Join thousands of learners who have transformed their skills and careers through
            our expert-led courses.
          </p>
        </div>

        {/* Testimonial */}
        <div
          className="card border-0 p-4 rounded-3"
          style={{ background: 'rgba(255,255,255,0.1)' }}
        >
          <p className="fst-italic mb-3 text-white-50" style={{ lineHeight: 1.7 }}>
            "Skillify helped me go from zero to landing my first software engineering job in
            just 8 months. The structured courses and quizzes kept me on track every day."
          </p>
          <div className="d-flex align-items-center gap-2">
            <img
              src="https://ui-avatars.com/api/?name=Sarah+K&background=2d6a4f&color=fff"
              alt="Sarah K."
              className="rounded-circle"
              width={36}
              height={36}
            />
            <div>
              <strong className="d-block small">Sarah K.</strong>
              <small className="text-white-50">Software Engineer, Google</small>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="col-md-7 d-flex align-items-center justify-content-center py-5 px-4 bg-white">
        <div style={{ width: '100%', maxWidth: 440 }}>
          {/* Mobile logo */}
          <div className="d-flex d-md-none align-items-center gap-2 mb-4">
            <i className="bi bi-mortarboard-fill text-primary" style={{ fontSize: '2rem' }}></i>
            <span className="fw-bold fs-4">Skillify</span>
          </div>

          <h3 className="fw-bold mb-1">Welcome back</h3>
          <p className="text-muted mb-4">Sign in to continue your learning journey.</p>

          {/* {serverError && (
            <div className="alert alert-danger d-flex align-items-center gap-2" role="alert">
              <i className="bi bi-exclamation-triangle-fill"></i>
              {serverError}
            </div>
          )} */}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Email */}
            <div className="mb-3">
              <label htmlFor="email" className="form-label fw-semibold">
                Email address
              </label>
              <input
                id="email"
                type="email"
                className={`form-control form-control-lg ${errors.email ? 'is-invalid' : ''}`}
                placeholder="you@example.com"
                autoComplete="email"
                {...register('email')}
              />
              {errors.email && (
                <div className="invalid-feedback">{errors.email.message}</div>
              )}
            </div>

            {/* Password */}
            <div className="mb-3">
              <label htmlFor="password" className="form-label fw-semibold">
                Password
              </label>
              <div className="input-group">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className={`form-control form-control-lg ${errors.password ? 'is-invalid' : ''}`}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  {...register('password')}
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                >
                  <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </button>
                {errors.password && (
                  <div className="invalid-feedback">{errors.password.message}</div>
                )}
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="rememberMe"
                  {...register('rememberMe')}
                />
                <label className="form-check-label small" htmlFor="rememberMe">
                  Remember me
                </label>
              </div>
              <Link to="/forgot-password" className="text-decoration-none text-muted small">
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn btn-primary w-100 btn-lg mb-3"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" />
                  Signing in…
                </>
              ) : (
                'Sign In'
              )}
            </button>

            {/* Divider */}
            <div className="d-flex align-items-center gap-2 my-3">
              <hr className="flex-grow-1" />
              <small className="text-muted">or continue with</small>
              <hr className="flex-grow-1" />
            </div>

            {/* Google OAuth */}
            <a
              href="http://localhost:5000/api/v1/auth/google"
              className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                <path fill="none" d="M0 0h48v48H0z"/>
              </svg>
              Continue with Google
            </a>
          </form>

          <p className="text-center mt-4 mb-0 text-muted small">
            Don't have an account?{' '}
            <Link to="/register" className="text-decoration-none fw-semibold">
              Sign up for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
