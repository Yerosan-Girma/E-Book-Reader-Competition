/**
 * Component tests for Login page
 * Tests form validation, user interactions, and error states
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../../src/pages/Login';

// Mock navigation and location
const mockNavigate = vi.fn();
const mockLocation = { state: null };

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
  };
});

// Mock AuthContext
const mockUseAuth = vi.fn();
vi.mock('../../src/context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
  AuthProvider: ({ children }) => children,
}));

// Mock assets
vi.mock('../../src/assets/login.jpg', () => ({
  default: 'mock-login-image.jpg',
}));

describe('Login Component', () => {
  let mockLogin;

  beforeEach(() => {
    mockNavigate.mockClear();
    mockLocation.state = null;
    mockLogin = vi.fn();
    mockUseAuth.mockReturnValue({
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
        <Login />
      </BrowserRouter>
    );
  };

  describe('Render', () => {
    it('should render login form', () => {
      renderLogin();

      expect(screen.getByText('Welcome back')).toBeInTheDocument();
      expect(screen.getByText(/sign in to continue your reading journey/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText('reader@example.com')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('should render register link', () => {
      renderLogin();

      expect(screen.getByText(/new to readrise\?/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /create an account/i })).toBeInTheDocument();
    });

    it('should not show error initially', () => {
      renderLogin();

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should update email input on change', () => {
      renderLogin();

      const emailInput = screen.getByPlaceholderText('reader@example.com');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      expect(emailInput.value).toBe('test@example.com');
    });

    it('should update password input on change', () => {
      renderLogin();

      const passwordInput = screen.getByPlaceholderText('••••••••');
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      expect(passwordInput.value).toBe('password123');
    });

    it('should call login with trimmed email and password on submit', async () => {
      renderLogin();

      const emailInput = screen.getByPlaceholderText('reader@example.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

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

      const emailInput = screen.getByPlaceholderText('reader@example.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
        expect(submitButton).toHaveTextContent(/verifying credentials/i);
      });
    });

    it('should navigate to dashboard on successful login', async () => {
      mockLogin.mockResolvedValue();
      renderLogin();

      const emailInput = screen.getByPlaceholderText('reader@example.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
      });
    });

    it('should navigate to from location if provided', async () => {
      mockLocation.state = { from: '/books' };
      mockLogin.mockResolvedValue();
      renderLogin();

      const emailInput = screen.getByPlaceholderText('reader@example.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

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

      const emailInput = screen.getByPlaceholderText('reader@example.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

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

      const emailInput = screen.getByPlaceholderText('reader@example.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid email or password. Please try again.')).toBeInTheDocument();
      });
    });

    it('should clear error on new submit attempt', async () => {
      mockLogin.mockRejectedValueOnce({
        response: { data: { error: 'Invalid credentials' } },
      }).mockResolvedValueOnce();

      renderLogin();

      const emailInput = screen.getByPlaceholderText('reader@example.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

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

      const emailInput = screen.getByPlaceholderText('reader@example.com');
      expect(emailInput).toHaveAttribute('required');
    });

    it('should require password field', () => {
      renderLogin();

      const passwordInput = screen.getByPlaceholderText('••••••••');
      expect(passwordInput).toHaveAttribute('required');
    });

    it('should enforce minimum password length', () => {
      renderLogin();

      const passwordInput = screen.getByPlaceholderText('••••••••');
      expect(passwordInput).toHaveAttribute('minLength', '6');
    });

    it('should validate email format', () => {
      renderLogin();

      const emailInput = screen.getByPlaceholderText('reader@example.com');
      expect(emailInput).toHaveAttribute('type', 'email');
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels through placeholders', () => {
      renderLogin();

      const emailInput = screen.getByPlaceholderText('reader@example.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');

      expect(emailInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
    });

    it('should disable button during submission for accessibility', async () => {
      mockLogin.mockImplementation(() => new Promise(() => {}));
      renderLogin();

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      const emailInput = screen.getByPlaceholderText('reader@example.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
    });

    it('should have error message in visible error container', async () => {
      mockLogin.mockRejectedValue({
        response: { data: { error: 'Error message' } },
      });

      renderLogin();

      const emailInput = screen.getByPlaceholderText('reader@example.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

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
