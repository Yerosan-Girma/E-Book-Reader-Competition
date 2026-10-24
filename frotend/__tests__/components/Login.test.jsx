/**
 * Component tests for Login page
 * Tests form validation, user interactions, and error states
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import Login from '../../src/pages/Login';
import { AuthProvider } from '../../src/context/AuthContext';

// Mock the AuthContext
vi.mock('../../src/context/AuthContext', async () => {
  const actual = await vi.importActual('../../src/context/AuthContext');
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

// Mock navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: null }),
  };
});

// Mock assets
vi.mock('../../src/assets/login.jpg', () => ({
  default: 'mock-login-image.jpg',
}));

describe('Login Component', () => {
  let mockLogin;

  beforeEach(() => {
    mockNavigate.mockClear();
    mockLogin = vi.fn();
    const { useAuth } = require('../../src/context/AuthContext');
    useAuth.mockReturnValue({
      user: null,
      loading: false,
      login: mockLogin,
      register: vi.fn(),
      logout: vi.fn(),
    });
  });

  const renderLogin = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  describe('Render', () => {
    it('should render login form', () => {
      renderLogin();

      expect(screen.getByText('Welcome back')).toBeInTheDocument();
      expect(screen.getByText('Log in to continue your reading streak.')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
    });

    it('should render register link', () => {
      renderLogin();

      expect(screen.getByText('New to ReadRise?')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument();
    });

    it('should not show error initially', () => {
      renderLogin();

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should update email input on change', () => {
      renderLogin();

      const emailInput = screen.getByPlaceholderText('Email');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      expect(emailInput.value).toBe('test@example.com');
    });

    it('should update password input on change', () => {
      renderLogin();

      const passwordInput = screen.getByPlaceholderText('Password');
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      expect(passwordInput.value).toBe('password123');
    });

    it('should call login with trimmed email and password on submit', async () => {
      renderLogin();

      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: /log in/i });

      fireEvent.change(emailInput, { target: { value: '  test@example.com  ' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });

    it('should show loading state while submitting', async () => {
      mockLogin.mockImplementation(() => new Promise(() => {})); // Never resolves
      renderLogin();

      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: /log in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
        expect(submitButton).toHaveTextContent('Please wait…');
      });
    });

    it('should navigate to dashboard on successful login', async () => {
      mockLogin.mockResolvedValue();
      renderLogin();

      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: /log in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
      });
    });

    it('should navigate to from location if provided', async () => {
      const { useLocation } = require('react-router-dom');
      useLocation.mockReturnValue({ state: { from: '/books' } });

      mockLogin.mockResolvedValue();
      renderLogin();

      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: /log in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/books', { replace: true });
      });
    });
  });

  describe('Error Handling', () => {
    it('should show error message on login failure', async () => {
      const errorMessage = 'Invalid credentials';
      mockLogin.mockRejectedValue({
        response: { data: { error: errorMessage } },
      });

      renderLogin();

      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: /log in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('should show generic error message when no error details', async () => {
      mockLogin.mockRejectedValue(new Error('Network error'));

      renderLogin();

      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: /log in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Login failed')).toBeInTheDocument();
      });
    });

    it('should clear error on new submit attempt', async () => {
      mockLogin.mockRejectedValueOnce({
        response: { data: { error: 'Invalid credentials' } },
      }).mockResolvedValueOnce();

      renderLogin();

      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: /log in/i });

      // First attempt - should fail
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrong' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
      });

      // Second attempt - should clear error
      fireEvent.change(passwordInput, { target: { value: 'correct' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByText('Invalid credentials')).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Validation', () => {
    it('should require email field', () => {
      renderLogin();

      const emailInput = screen.getByPlaceholderText('Email');
      expect(emailInput).toHaveAttribute('required');
    });

    it('should require password field', () => {
      renderLogin();

      const passwordInput = screen.getByPlaceholderText('Password');
      expect(passwordInput).toHaveAttribute('required');
    });

    it('should enforce minimum password length', () => {
      renderLogin();

      const passwordInput = screen.getByPlaceholderText('Password');
      expect(passwordInput).toHaveAttribute('minLength', '6');
    });

    it('should validate email format', () => {
      renderLogin();

      const emailInput = screen.getByPlaceholderText('Email');
      expect(emailInput).toHaveAttribute('type', 'email');
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels through placeholders', () => {
      renderLogin();

      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Password');

      expect(emailInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
    });

    it('should disable button during submission for accessibility', async () => {
      mockLogin.mockImplementation(() => new Promise(() => {}));
      renderLogin();

      const submitButton = screen.getByRole('button', { name: /log in/i });
      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Password');

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
    });

    it('should have error message in accessible container', async () => {
      mockLogin.mockRejectedValue({
        response: { data: { error: 'Error message' } },
      });

      renderLogin();

      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: /log in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        const errorElement = screen.getByText('Error message');
        expect(errorElement).toBeInTheDocument();
      });
    });
  });
});
