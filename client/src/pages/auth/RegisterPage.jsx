import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../features/auth/authSlice';
import { useRegisterMutation } from '../../services/authApi';
import { useToast } from '../../hooks/useToast';

const schema = yup.object({
  name: yup.string().required('Full name is required').min(2, 'Name must be at least 2 characters'),
  email: yup.string().required('Email is required').email('Enter a valid email'),
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
  role: yup
    .string()
    .required('Please select a role')
    .oneOf(['student', 'teacher'], 'Role must be student or teacher'),
  terms: yup
    .boolean()
    .required('You must agree to the terms')
    .oneOf([true], 'You must agree to the Terms of Service'),
});

function getPasswordStrength(password) {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password) || /[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score; // 1-4
}

const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const STRENGTH_COLORS = ['', 'danger', 'warning', 'info', 'success'];

export default function RegisterPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const [registerUser, { isLoading }] = useRegisterMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { role: 'student' },
  });

  const watchPassword = watch('password', '');
  const watchRole = watch('role', 'student');
  const passwordStrength = getPasswordStrength(watchPassword);

  const onSubmit = async (data) => {
    setServerError('');
    try {
      const result = await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
      }).unwrap();
      const { user, accessToken } = result.data || result;
      dispatch(setCredentials({ user, accessToken }));
      showToast(`Welcome to Skillify, ${user.name}!`, 'success');
      if (user.role === 'teacher') {
        navigate('/teacher/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      setServerError(err?.data?.message || 'Registration failed. Please try again.');
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
            Start your learning journey today.
          </h3>
          <p className="text-white-50 mb-4" style={{ lineHeight: 1.7 }}>
            Join over 10,000 students and teachers who use Skillify every day to grow their
            skills and share their knowledge.
          </p>

          <ul className="list-unstyled">
            {[
              'Free forever — no credit card needed',
              'Self-paced courses across 7 subjects',
              'Quizzes and progress tracking',
              'Certificate of completion',
            ].map((item) => (
              <li key={item} className="d-flex align-items-center gap-2 mb-2 text-white-50">
                <i className="bi bi-check-circle-fill text-success"></i>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div
          className="card border-0 p-4 rounded-3"
          style={{ background: 'rgba(255,255,255,0.1)' }}
        >
          <p className="fst-italic mb-3 text-white-50" style={{ lineHeight: 1.7 }}>
            "I created my first online course on Skillify and had 200 students enrolled within
            the first week. The platform makes it incredibly easy."
          </p>
          <div className="d-flex align-items-center gap-2">
            <img
              src="https://ui-avatars.com/api/?name=James+T&background=2d6a4f&color=fff"
              alt="James T."
              className="rounded-circle"
              width={36}
              height={36}
            />
            <div>
              <strong className="d-block small">James T.</strong>
              <small className="text-white-50">Computer Science Instructor</small>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="col-md-7 d-flex align-items-center justify-content-center py-5 px-4 bg-white">
        <div style={{ width: '100%', maxWidth: 480 }}>
          {/* Mobile logo */}
          <div className="d-flex d-md-none align-items-center gap-2 mb-4">
            <i className="bi bi-mortarboard-fill text-primary" style={{ fontSize: '2rem' }}></i>
            <span className="fw-bold fs-4">Skillify</span>
          </div>

          <h3 className="fw-bold mb-1">Create your account</h3>
          <p className="text-muted mb-4">Free to join. Start learning in minutes.</p>

          {serverError && (
            <div className="alert alert-danger d-flex align-items-center gap-2" role="alert">
              <i className="bi bi-exclamation-triangle-fill"></i>
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Full Name */}
            <div className="mb-3">
              <label htmlFor="name" className="form-label fw-semibold">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                className={`form-control form-control-lg ${errors.name ? 'is-invalid' : ''}`}
                placeholder="Jane Doe"
                autoComplete="name"
                {...register('name')}
              />
              {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
            </div>

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
              {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
            </div>

            {/* Password + Strength */}
            <div className="mb-3">
              <label htmlFor="password" className="form-label fw-semibold">
                Password
              </label>
              <div className="input-group">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className={`form-control form-control-lg ${errors.password ? 'is-invalid' : ''}`}
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
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
              {/* Strength Indicator */}
              {watchPassword && (
                <div className="mt-2">
                  <div className="d-flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className="rounded"
                        style={{
                          height: 4,
                          flex: 1,
                          backgroundColor:
                            passwordStrength >= level
                              ? `var(--bs-${STRENGTH_COLORS[passwordStrength]})`
                              : '#dee2e6',
                          transition: 'background-color 0.3s',
                        }}
                      />
                    ))}
                  </div>
                  <small className={`text-${STRENGTH_COLORS[passwordStrength]}`}>
                    {STRENGTH_LABELS[passwordStrength]}
                  </small>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="mb-3">
              <label htmlFor="confirmPassword" className="form-label fw-semibold">
                Confirm Password
              </label>
              <div className="input-group">
                <input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  className={`form-control form-control-lg ${
                    errors.confirmPassword ? 'is-invalid' : ''
                  }`}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowConfirm((v) => !v)}
                  tabIndex={-1}
                >
                  <i className={`bi ${showConfirm ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </button>
                {errors.confirmPassword && (
                  <div className="invalid-feedback">{errors.confirmPassword.message}</div>
                )}
              </div>
            </div>

            {/* Role Selection Cards */}
            <div className="mb-3">
              <label className="form-label fw-semibold d-block mb-2">I am a…</label>
              <div className="row g-2">
                {[
                  {
                    value: 'student',
                    icon: 'bi-mortarboard',
                    title: 'Student',
                    desc: 'Learn from expert teachers',
                  },
                  {
                    value: 'teacher',
                    icon: 'bi-person-chalkboard',
                    title: 'Teacher',
                    desc: 'Share your knowledge',
                  },
                ].map((option) => (
                  <div className="col-6" key={option.value}>
                    <div
                      className={`card border-2 p-3 text-center rounded-3 ${
                        watchRole === option.value
                          ? 'border-primary bg-primary bg-opacity-10'
                          : 'border-light'
                      }`}
                      style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                      onClick={() => setValue('role', option.value, { shouldValidate: true })}
                    >
                      <i
                        className={`bi ${option.icon} fs-3 mb-2 ${
                          watchRole === option.value ? 'text-primary' : 'text-muted'
                        }`}
                      ></i>
                      <div className="fw-semibold">{option.title}</div>
                      <small className="text-muted">{option.desc}</small>
                      {watchRole === option.value && (
                        <i className="bi bi-check-circle-fill text-primary mt-2"></i>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {errors.role && (
                <div className="text-danger small mt-1">{errors.role.message}</div>
              )}
            </div>

            {/* Terms */}
            <div className="mb-4">
              <div className="form-check">
                <input
                  className={`form-check-input ${errors.terms ? 'is-invalid' : ''}`}
                  type="checkbox"
                  id="terms"
                  {...register('terms')}
                />
                <label className="form-check-label small" htmlFor="terms">
                  I agree to the{' '}
                  <a href="#" className="text-decoration-none">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-decoration-none">
                    Privacy Policy
                  </a>
                </label>
                {errors.terms && (
                  <div className="invalid-feedback">{errors.terms.message}</div>
                )}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn btn-primary w-100 btn-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" />
                  Creating account…
                </>
              ) : (
                'Create Account'
              )}
            </button>

            {/* Divider */}
            <div className="d-flex align-items-center gap-2 my-3">
              <hr className="flex-grow-1" />
              <small className="text-muted">or sign up with</small>
              <hr className="flex-grow-1" />
            </div>

            {/* Google OAuth */}
            <a
              href={`${import.meta.env.VITE_API_URL}/api/v1/auth/google`}
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
            Already have an account?{' '}
            <Link to="/login" className="text-decoration-none fw-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
