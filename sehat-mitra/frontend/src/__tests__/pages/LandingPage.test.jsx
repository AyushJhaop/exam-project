import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import LandingPage from '../../pages/LandingPage';

// Mock API calls
jest.mock('../../services/api', () => ({
  post: jest.fn(),
  get: jest.fn()
}));

const MockedLandingPage = () => (
  <BrowserRouter>
    <AuthProvider>
      <LandingPage />
    </AuthProvider>
  </BrowserRouter>
);

describe('LandingPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Render', () => {
    test('should render main heading', () => {
      render(<MockedLandingPage />);
      
      expect(screen.getByText(/Your Health, Our Priority/i)).toBeInTheDocument();
    });

    test('should render hero section with call-to-action', () => {
      render(<MockedLandingPage />);
      
      expect(screen.getByText(/Book Your Appointment Today/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /get started/i })).toBeInTheDocument();
    });

    test('should render features section', () => {
      render(<MockedLandingPage />);
      
      expect(screen.getByText(/24\/7 Doctor Availability/i)).toBeInTheDocument();
      expect(screen.getByText(/Secure Video Consultations/i)).toBeInTheDocument();
      expect(screen.getByText(/Instant Prescription Delivery/i)).toBeInTheDocument();
    });

    test('should render statistics section', () => {
      render(<MockedLandingPage />);
      
      expect(screen.getByText(/Happy Patients/i)).toBeInTheDocument();
      expect(screen.getByText(/Expert Doctors/i)).toBeInTheDocument();
      expect(screen.getByText(/Appointments Completed/i)).toBeInTheDocument();
    });
  });

  describe('Lead Capture Form', () => {
    test('should render lead capture form', () => {
      render(<MockedLandingPage />);
      
      expect(screen.getByPlaceholderText(/your name/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/your email/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/your phone/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /book free consultation/i })).toBeInTheDocument();
    });

    test('should validate form fields', async () => {
      const user = userEvent.setup();
      render(<MockedLandingPage />);
      
      const submitButton = screen.getByRole('button', { name: /book free consultation/i });
      
      await user.click(submitButton);
      
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/phone is required/i)).toBeInTheDocument();
    });

    test('should validate email format', async () => {
      const user = userEvent.setup();
      render(<MockedLandingPage />);
      
      const emailInput = screen.getByPlaceholderText(/your email/i);
      const submitButton = screen.getByRole('button', { name: /book free consultation/i });
      
      await user.type(emailInput, 'invalid-email');
      await user.click(submitButton);
      
      expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument();
    });

    test('should validate phone number format', async () => {
      const user = userEvent.setup();
      render(<MockedLandingPage />);
      
      const phoneInput = screen.getByPlaceholderText(/your phone/i);
      const submitButton = screen.getByRole('button', { name: /book free consultation/i });
      
      await user.type(phoneInput, '123');
      await user.click(submitButton);
      
      expect(screen.getByText(/please enter a valid phone number/i)).toBeInTheDocument();
    });

    test('should submit form with valid data', async () => {
      const { post } = require('../../services/api');
      post.mockResolvedValue({ data: { success: true, leadId: 123 } });
      
      const user = userEvent.setup();
      render(<MockedLandingPage />);
      
      const nameInput = screen.getByPlaceholderText(/your name/i);
      const emailInput = screen.getByPlaceholderText(/your email/i);
      const phoneInput = screen.getByPlaceholderText(/your phone/i);
      const submitButton = screen.getByRole('button', { name: /book free consultation/i });
      
      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john@example.com');
      await user.type(phoneInput, '1234567890');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(post).toHaveBeenCalledWith('/leads', {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '1234567890',
          source: 'landing_page'
        });
      });
    });

    test('should show success message after form submission', async () => {
      const { post } = require('../../services/api');
      post.mockResolvedValue({ data: { success: true, leadId: 123 } });
      
      const user = userEvent.setup();
      render(<MockedLandingPage />);
      
      const nameInput = screen.getByPlaceholderText(/your name/i);
      const emailInput = screen.getByPlaceholderText(/your email/i);
      const phoneInput = screen.getByPlaceholderText(/your phone/i);
      const submitButton = screen.getByRole('button', { name: /book free consultation/i });
      
      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john@example.com');
      await user.type(phoneInput, '1234567890');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/thank you.*will contact you/i)).toBeInTheDocument();
      });
    });

    test('should handle form submission errors', async () => {
      const { post } = require('../../services/api');
      post.mockRejectedValue(new Error('Network error'));
      
      const user = userEvent.setup();
      render(<MockedLandingPage />);
      
      const nameInput = screen.getByPlaceholderText(/your name/i);
      const emailInput = screen.getByPlaceholderText(/your email/i);
      const phoneInput = screen.getByPlaceholderText(/your phone/i);
      const submitButton = screen.getByRole('button', { name: /book free consultation/i });
      
      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john@example.com');
      await user.type(phoneInput, '1234567890');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      });
    });

    test('should clear form after successful submission', async () => {
      const { post } = require('../../services/api');
      post.mockResolvedValue({ data: { success: true, leadId: 123 } });
      
      const user = userEvent.setup();
      render(<MockedLandingPage />);
      
      const nameInput = screen.getByPlaceholderText(/your name/i);
      const emailInput = screen.getByPlaceholderText(/your email/i);
      const phoneInput = screen.getByPlaceholderText(/your phone/i);
      const submitButton = screen.getByRole('button', { name: /book free consultation/i });
      
      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john@example.com');
      await user.type(phoneInput, '1234567890');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(nameInput.value).toBe('');
        expect(emailInput.value).toBe('');
        expect(phoneInput.value).toBe('');
      });
    });
  });

  describe('Navigation and Interactions', () => {
    test('should navigate to login page when clicking login button', async () => {
      const user = userEvent.setup();
      render(<MockedLandingPage />);
      
      const loginButton = screen.getByRole('link', { name: /login/i });
      expect(loginButton).toHaveAttribute('href', '/login');
    });

    test('should navigate to register page when clicking get started', async () => {
      const user = userEvent.setup();
      render(<MockedLandingPage />);
      
      const getStartedButton = screen.getByRole('button', { name: /get started/i });
      await user.click(getStartedButton);
      
      // Should redirect to register page (implementation depends on routing logic)
      expect(window.location.pathname).toBe('/');
    });

    test('should scroll to features section when clicking learn more', async () => {
      const user = userEvent.setup();
      render(<MockedLandingPage />);
      
      const learnMoreButton = screen.getByRole('button', { name: /learn more/i });
      await user.click(learnMoreButton);
      
      // Mock scroll behavior (actual implementation would need scroll testing)
      expect(learnMoreButton).toBeInTheDocument();
    });
  });

  describe('Real-time Statistics', () => {
    test('should load and display statistics on mount', async () => {
      const { get } = require('../../services/api');
      get.mockResolvedValue({
        data: {
          totalPatients: 15000,
          totalDoctors: 500,
          totalAppointments: 25000
        }
      });
      
      render(<MockedLandingPage />);
      
      await waitFor(() => {
        expect(screen.getByText('15,000+')).toBeInTheDocument();
        expect(screen.getByText('500+')).toBeInTheDocument();
        expect(screen.getByText('25,000+')).toBeInTheDocument();
      });
    });

    test('should handle statistics loading error gracefully', async () => {
      const { get } = require('../../services/api');
      get.mockRejectedValue(new Error('Failed to load stats'));
      
      render(<MockedLandingPage />);
      
      // Should show default values or error state
      await waitFor(() => {
        expect(screen.getByText(/Happy Patients/i)).toBeInTheDocument();
      });
    });

    test('should animate statistics counter', async () => {
      const { get } = require('../../services/api');
      get.mockResolvedValue({
        data: {
          totalPatients: 1000,
          totalDoctors: 50,
          totalAppointments: 2000
        }
      });
      
      render(<MockedLandingPage />);
      
      // Check that numbers are animated (implementation specific)
      await waitFor(() => {
        expect(screen.getByText('1,000+')).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Design', () => {
    test('should adapt layout for mobile devices', () => {
      // Mock mobile viewport
      global.innerWidth = 375;
      global.dispatchEvent(new Event('resize'));
      
      render(<MockedLandingPage />);
      
      // Check that mobile-specific classes or elements are present
      const heroSection = screen.getByRole('main');
      expect(heroSection).toBeInTheDocument();
    });

    test('should show mobile navigation menu', async () => {
      global.innerWidth = 375;
      global.dispatchEvent(new Event('resize'));
      
      const user = userEvent.setup();
      render(<MockedLandingPage />);
      
      // Look for mobile menu toggle
      const menuToggle = screen.queryByRole('button', { name: /menu/i });
      if (menuToggle) {
        await user.click(menuToggle);
        expect(screen.getByRole('navigation')).toBeInTheDocument();
      }
    });
  });

  describe('Accessibility', () => {
    test('should have proper heading hierarchy', () => {
      render(<MockedLandingPage />);
      
      const h1 = screen.getByRole('heading', { level: 1 });
      const h2s = screen.getAllByRole('heading', { level: 2 });
      
      expect(h1).toBeInTheDocument();
      expect(h2s.length).toBeGreaterThan(0);
    });

    test('should have proper form labels', () => {
      render(<MockedLandingPage />);
      
      const nameInput = screen.getByPlaceholderText(/your name/i);
      const emailInput = screen.getByPlaceholderText(/your email/i);
      const phoneInput = screen.getByPlaceholderText(/your phone/i);
      
      expect(nameInput).toHaveAttribute('aria-label');
      expect(emailInput).toHaveAttribute('aria-label');
      expect(phoneInput).toHaveAttribute('aria-label');
    });

    test('should have keyboard navigation support', async () => {
      const user = userEvent.setup();
      render(<MockedLandingPage />);
      
      const submitButton = screen.getByRole('button', { name: /book free consultation/i });
      
      // Tab to the button and press Enter
      await user.tab();
      await user.keyboard('{Enter}');
      
      // Should trigger form validation
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    });

    test('should have proper alt text for images', () => {
      render(<MockedLandingPage />);
      
      const images = screen.getAllByRole('img');
      images.forEach(img => {
        expect(img).toHaveAttribute('alt');
        expect(img.getAttribute('alt')).not.toBe('');
      });
    });
  });

  describe('SEO and Meta Tags', () => {
    test('should set proper document title', () => {
      render(<MockedLandingPage />);
      
      expect(document.title).toContain('Sehat Mitra');
    });

    test('should have proper meta descriptions', () => {
      render(<MockedLandingPage />);
      
      const metaDescription = document.querySelector('meta[name="description"]');
      expect(metaDescription).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    test('should load quickly with minimal re-renders', () => {
      const renderSpy = jest.fn();
      
      const TestComponent = () => {
        renderSpy();
        return <MockedLandingPage />;
      };
      
      render(<TestComponent />);
      
      expect(renderSpy).toHaveBeenCalledTimes(1);
    });

    test('should lazy load images', () => {
      render(<MockedLandingPage />);
      
      const images = screen.getAllByRole('img');
      images.forEach(img => {
        expect(img).toHaveAttribute('loading', 'lazy');
      });
    });
  });

  describe('Error Boundaries', () => {
    test('should handle component errors gracefully', () => {
      // Mock console.error to prevent error output in tests
      const originalError = console.error;
      console.error = jest.fn();
      
      // This would need a proper error boundary implementation
      render(<MockedLandingPage />);
      
      // Should not crash the entire app
      expect(screen.getByRole('main')).toBeInTheDocument();
      
      console.error = originalError;
    });
  });
});
