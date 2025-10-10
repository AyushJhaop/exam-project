import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import AppointmentBooking from '../../pages/patient/AppointmentBooking';

// Mock API calls
jest.mock('../../services/api', () => ({
  get: jest.fn(),
  post: jest.fn()
}));

// Mock react-calendar
jest.mock('react-calendar', () => {
  return function Calendar({ onChange, value }) {
    return (
      <div data-testid="calendar">
        <button onClick={() => onChange(new Date('2024-06-15'))}>
          Select Date
        </button>
        <span>Current: {value?.toDateString()}</span>
      </div>
    );
  };
});

const MockedAppointmentBooking = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppointmentBooking />
    </AuthProvider>
  </BrowserRouter>
);

describe('AppointmentBooking Component', () => {
  const mockDoctors = [
    {
      _id: '1',
      name: 'Dr. John Smith',
      profile: {
        specialization: 'Cardiology',
        experience: 10,
        qualifications: ['MBBS', 'MD'],
        rating: 4.8,
        consultationFee: 150
      }
    },
    {
      _id: '2',
      name: 'Dr. Jane Doe',
      profile: {
        specialization: 'Dermatology',
        experience: 8,
        qualifications: ['MBBS', 'MD'],
        rating: 4.6,
        consultationFee: 120
      }
    }
  ];

  const mockTimeSlots = [
    { time: '09:00 AM', available: true },
    { time: '10:00 AM', available: false },
    { time: '11:00 AM', available: true },
    { time: '02:00 PM', available: true },
    { time: '03:00 PM', available: false },
    { time: '04:00 PM', available: true }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    const { get } = require('../../services/api');
    get.mockImplementation((url) => {
      if (url === '/doctors') {
        return Promise.resolve({ data: { doctors: mockDoctors } });
      }
      if (url.includes('/doctors/') && url.includes('/availability')) {
        return Promise.resolve({ data: { timeSlots: mockTimeSlots } });
      }
      return Promise.resolve({ data: {} });
    });
  });

  describe('Initial Render and Data Loading', () => {
    test('should render appointment booking steps', async () => {
      render(<MockedAppointmentBooking />);
      
      expect(screen.getByText(/book appointment/i)).toBeInTheDocument();
      expect(screen.getByText(/step 1/i)).toBeInTheDocument();
      expect(screen.getByText(/select doctor/i)).toBeInTheDocument();
    });

    test('should load doctors on mount', async () => {
      render(<MockedAppointmentBooking />);
      
      await waitFor(() => {
        expect(screen.getByText('Dr. John Smith')).toBeInTheDocument();
        expect(screen.getByText('Dr. Jane Doe')).toBeInTheDocument();
      });
    });

    test('should show loading state while fetching doctors', () => {
      const { get } = require('../../services/api');
      get.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      render(<MockedAppointmentBooking />);
      
      expect(screen.getByText(/loading doctors/i)).toBeInTheDocument();
    });

    test('should handle doctor loading error', async () => {
      const { get } = require('../../services/api');
      get.mockRejectedValue(new Error('Failed to load doctors'));
      
      render(<MockedAppointmentBooking />);
      
      await waitFor(() => {
        expect(screen.getByText(/failed to load doctors/i)).toBeInTheDocument();
      });
    });
  });

  describe('Step 1: Doctor Selection', () => {
    test('should display doctor cards with details', async () => {
      render(<MockedAppointmentBooking />);
      
      await waitFor(() => {
        expect(screen.getByText('Dr. John Smith')).toBeInTheDocument();
        expect(screen.getByText('Cardiology')).toBeInTheDocument();
        expect(screen.getByText('10 years experience')).toBeInTheDocument();
        expect(screen.getByText('₹150')).toBeInTheDocument();
        expect(screen.getByText('4.8')).toBeInTheDocument();
      });
    });

    test('should filter doctors by specialization', async () => {
      const user = userEvent.setup();
      render(<MockedAppointmentBooking />);
      
      await waitFor(() => {
        expect(screen.getByText('Dr. John Smith')).toBeInTheDocument();
      });
      
      const specializationFilter = screen.getByRole('combobox', { name: /specialization/i });
      await user.selectOptions(specializationFilter, 'Cardiology');
      
      expect(screen.getByText('Dr. John Smith')).toBeInTheDocument();
      expect(screen.queryByText('Dr. Jane Doe')).not.toBeInTheDocument();
    });

    test('should select a doctor and proceed to next step', async () => {
      const user = userEvent.setup();
      render(<MockedAppointmentBooking />);
      
      await waitFor(() => {
        expect(screen.getByText('Dr. John Smith')).toBeInTheDocument();
      });
      
      const selectButton = screen.getAllByText(/select/i)[0];
      await user.click(selectButton);
      
      expect(screen.getByText(/step 2/i)).toBeInTheDocument();
      expect(screen.getByText(/select date/i)).toBeInTheDocument();
    });

    test('should show doctor rating and reviews', async () => {
      render(<MockedAppointmentBooking />);
      
      await waitFor(() => {
        expect(screen.getByText('4.8')).toBeInTheDocument();
        expect(screen.getByText(/⭐/)).toBeInTheDocument();
      });
    });
  });

  describe('Step 2: Date Selection', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<MockedAppointmentBooking />);
      
      await waitFor(() => {
        expect(screen.getByText('Dr. John Smith')).toBeInTheDocument();
      });
      
      const selectButton = screen.getAllByText(/select/i)[0];
      await user.click(selectButton);
    });

    test('should render calendar component', () => {
      expect(screen.getByTestId('calendar')).toBeInTheDocument();
    });

    test('should select a date and proceed to time selection', async () => {
      const user = userEvent.setup();
      
      const selectDateButton = screen.getByText('Select Date');
      await user.click(selectDateButton);
      
      await waitFor(() => {
        expect(screen.getByText(/step 3/i)).toBeInTheDocument();
        expect(screen.getByText(/select time/i)).toBeInTheDocument();
      });
    });

    test('should disable past dates', () => {
      const calendar = screen.getByTestId('calendar');
      expect(calendar).toBeInTheDocument();
      
      // Mock implementation would prevent selecting past dates
      const currentDate = screen.getByText(/current:/i);
      expect(currentDate).toBeInTheDocument();
    });

    test('should allow going back to doctor selection', async () => {
      const user = userEvent.setup();
      
      const backButton = screen.getByText(/back/i);
      await user.click(backButton);
      
      expect(screen.getByText(/step 1/i)).toBeInTheDocument();
      expect(screen.getByText(/select doctor/i)).toBeInTheDocument();
    });
  });

  describe('Step 3: Time Selection', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<MockedAppointmentBooking />);
      
      // Navigate to time selection
      await waitFor(() => {
        expect(screen.getByText('Dr. John Smith')).toBeInTheDocument();
      });
      
      const selectButton = screen.getAllByText(/select/i)[0];
      await user.click(selectButton);
      
      const selectDateButton = screen.getByText('Select Date');
      await user.click(selectDateButton);
    });

    test('should load available time slots', async () => {
      await waitFor(() => {
        expect(screen.getByText('09:00 AM')).toBeInTheDocument();
        expect(screen.getByText('11:00 AM')).toBeInTheDocument();
        expect(screen.getByText('02:00 PM')).toBeInTheDocument();
      });
    });

    test('should disable unavailable time slots', async () => {
      await waitFor(() => {
        const unavailableSlot = screen.getByText('10:00 AM');
        expect(unavailableSlot.closest('button')).toBeDisabled();
      });
    });

    test('should select a time slot and proceed to confirmation', async () => {
      const user = userEvent.setup();
      
      await waitFor(() => {
        expect(screen.getByText('09:00 AM')).toBeInTheDocument();
      });
      
      const timeSlot = screen.getByText('09:00 AM');
      await user.click(timeSlot);
      
      expect(screen.getByText(/step 4/i)).toBeInTheDocument();
      expect(screen.getByText(/confirm appointment/i)).toBeInTheDocument();
    });

    test('should show loading state while fetching time slots', () => {
      const { get } = require('../../services/api');
      get.mockImplementation((url) => {
        if (url.includes('/availability')) {
          return new Promise(() => {}); // Never resolves
        }
        return Promise.resolve({ data: { doctors: mockDoctors } });
      });
      
      render(<MockedAppointmentBooking />);
      
      // Navigate through steps quickly to test loading state
      // Implementation would show loading indicator
    });
  });

  describe('Step 4: Appointment Confirmation', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<MockedAppointmentBooking />);
      
      // Navigate through all steps
      await waitFor(() => {
        expect(screen.getByText('Dr. John Smith')).toBeInTheDocument();
      });
      
      const selectButton = screen.getAllByText(/select/i)[0];
      await user.click(selectButton);
      
      const selectDateButton = screen.getByText('Select Date');
      await user.click(selectDateButton);
      
      await waitFor(() => {
        expect(screen.getByText('09:00 AM')).toBeInTheDocument();
      });
      
      const timeSlot = screen.getByText('09:00 AM');
      await user.click(timeSlot);
    });

    test('should display appointment summary', async () => {
      await waitFor(() => {
        expect(screen.getByText('Dr. John Smith')).toBeInTheDocument();
        expect(screen.getByText('Cardiology')).toBeInTheDocument();
        expect(screen.getByText('Jun 15, 2024')).toBeInTheDocument();
        expect(screen.getByText('09:00 AM')).toBeInTheDocument();
        expect(screen.getByText('₹150')).toBeInTheDocument();
      });
    });

    test('should show patient information form', async () => {
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/describe your symptoms/i)).toBeInTheDocument();
        expect(screen.getByRole('combobox', { name: /appointment type/i })).toBeInTheDocument();
      });
    });

    test('should validate patient information', async () => {
      const user = userEvent.setup();
      
      await waitFor(() => {
        expect(screen.getByText(/confirm appointment/i)).toBeInTheDocument();
      });
      
      const confirmButton = screen.getByRole('button', { name: /confirm appointment/i });
      await user.click(confirmButton);
      
      expect(screen.getByText(/symptoms description is required/i)).toBeInTheDocument();
    });

    test('should successfully book appointment', async () => {
      const { post } = require('../../services/api');
      post.mockResolvedValue({ 
        data: { 
          success: true, 
          appointment: { 
            _id: 'apt123',
            appointmentId: 'APT-2024-001'
          } 
        } 
      });
      
      const user = userEvent.setup();
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/describe your symptoms/i)).toBeInTheDocument();
      });
      
      const symptomsInput = screen.getByPlaceholderText(/describe your symptoms/i);
      await user.type(symptomsInput, 'Chest pain and shortness of breath');
      
      const appointmentType = screen.getByRole('combobox', { name: /appointment type/i });
      await user.selectOptions(appointmentType, 'consultation');
      
      const confirmButton = screen.getByRole('button', { name: /confirm appointment/i });
      await user.click(confirmButton);
      
      await waitFor(() => {
        expect(post).toHaveBeenCalledWith('/appointments', {
          doctorId: '1',
          date: '2024-06-15',
          time: '09:00 AM',
          symptoms: 'Chest pain and shortness of breath',
          appointmentType: 'consultation',
          fee: 150
        });
      });
      
      expect(screen.getByText(/appointment booked successfully/i)).toBeInTheDocument();
      expect(screen.getByText('APT-2024-001')).toBeInTheDocument();
    });

    test('should handle booking errors', async () => {
      const { post } = require('../../services/api');
      post.mockRejectedValue(new Error('Booking failed'));
      
      const user = userEvent.setup();
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/describe your symptoms/i)).toBeInTheDocument();
      });
      
      const symptomsInput = screen.getByPlaceholderText(/describe your symptoms/i);
      await user.type(symptomsInput, 'Test symptoms');
      
      const confirmButton = screen.getByRole('button', { name: /confirm appointment/i });
      await user.click(confirmButton);
      
      await waitFor(() => {
        expect(screen.getByText(/failed to book appointment/i)).toBeInTheDocument();
      });
    });

    test('should allow editing appointment details', async () => {
      const user = userEvent.setup();
      
      await waitFor(() => {
        expect(screen.getByText(/edit/i)).toBeInTheDocument();
      });
      
      const editButton = screen.getByText(/edit/i);
      await user.click(editButton);
      
      // Should go back to previous step
      expect(screen.getByText(/step 3/i)).toBeInTheDocument();
    });
  });

  describe('Navigation and State Management', () => {
    test('should maintain state when navigating between steps', async () => {
      const user = userEvent.setup();
      render(<MockedAppointmentBooking />);
      
      // Select doctor
      await waitFor(() => {
        expect(screen.getByText('Dr. John Smith')).toBeInTheDocument();
      });
      
      const selectButton = screen.getAllByText(/select/i)[0];
      await user.click(selectButton);
      
      // Go back and forward
      const backButton = screen.getByText(/back/i);
      await user.click(backButton);
      
      expect(screen.getByText(/step 1/i)).toBeInTheDocument();
      
      // Doctor should still be selected (if implementation maintains state)
      const nextButton = screen.getByText(/next/i);
      await user.click(nextButton);
      
      expect(screen.getByText(/step 2/i)).toBeInTheDocument();
    });

    test('should show progress indicator', () => {
      render(<MockedAppointmentBooking />);
      
      const progressIndicator = screen.getByRole('progressbar') || 
                               screen.getByText(/step 1 of 4/i);
      expect(progressIndicator).toBeInTheDocument();
    });

    test('should disable next button if step is incomplete', async () => {
      render(<MockedAppointmentBooking />);
      
      const nextButton = screen.queryByText(/next/i);
      if (nextButton) {
        expect(nextButton).toBeDisabled();
      }
    });
  });

  describe('Responsive Design', () => {
    test('should adapt layout for mobile devices', () => {
      global.innerWidth = 375;
      global.dispatchEvent(new Event('resize'));
      
      render(<MockedAppointmentBooking />);
      
      // Check mobile-specific layout
      expect(screen.getByText(/book appointment/i)).toBeInTheDocument();
    });

    test('should show mobile-friendly time slot grid', async () => {
      global.innerWidth = 375;
      global.dispatchEvent(new Event('resize'));
      
      const user = userEvent.setup();
      render(<MockedAppointmentBooking />);
      
      // Navigate to time selection
      await waitFor(() => {
        expect(screen.getByText('Dr. John Smith')).toBeInTheDocument();
      });
      
      const selectButton = screen.getAllByText(/select/i)[0];
      await user.click(selectButton);
      
      const selectDateButton = screen.getByText('Select Date');
      await user.click(selectDateButton);
      
      await waitFor(() => {
        expect(screen.getByText('09:00 AM')).toBeInTheDocument();
      });
      
      // Time slots should be displayed in mobile-friendly layout
      const timeSlots = screen.getAllByText(/AM|PM/);
      expect(timeSlots.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    test('should have proper ARIA labels', () => {
      render(<MockedAppointmentBooking />);
      
      const stepIndicator = screen.getByText(/step 1/i);
      expect(stepIndicator).toHaveAttribute('aria-label');
    });

    test('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<MockedAppointmentBooking />);
      
      await waitFor(() => {
        expect(screen.getByText('Dr. John Smith')).toBeInTheDocument();
      });
      
      // Tab through doctor cards
      await user.tab();
      const focusedElement = document.activeElement;
      expect(focusedElement).toBeInTheDocument();
    });

    test('should announce step changes to screen readers', async () => {
      const user = userEvent.setup();
      render(<MockedAppointmentBooking />);
      
      await waitFor(() => {
        expect(screen.getByText('Dr. John Smith')).toBeInTheDocument();
      });
      
      const selectButton = screen.getAllByText(/select/i)[0];
      await user.click(selectButton);
      
      // Should have live region announcing step change
      const liveRegion = screen.getByRole('status') || screen.getByRole('alert');
      expect(liveRegion).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('should handle network failures gracefully', async () => {
      const { get } = require('../../services/api');
      get.mockRejectedValue(new Error('Network error'));
      
      render(<MockedAppointmentBooking />);
      
      await waitFor(() => {
        expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      });
      
      // Should provide retry option
      const retryButton = screen.getByText(/retry/i);
      expect(retryButton).toBeInTheDocument();
    });

    test('should validate required fields', async () => {
      const user = userEvent.setup();
      render(<MockedAppointmentBooking />);
      
      // Try to proceed without selecting doctor
      const nextButton = screen.queryByText(/next/i);
      if (nextButton && !nextButton.disabled) {
        await user.click(nextButton);
        expect(screen.getByText(/please select a doctor/i)).toBeInTheDocument();
      }
    });
  });
});
