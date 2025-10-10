import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Simple test component
const TestComponent = () => {
  return (
    <div>
      <h1>Sehat Mitra Test</h1>
      <p>Testing infrastructure is working!</p>
    </div>
  );
};

describe('Testing Infrastructure', () => {
  test('should render test component', () => {
    render(
      <BrowserRouter>
        <TestComponent />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Sehat Mitra Test')).toBeInTheDocument();
    expect(screen.getByText('Testing infrastructure is working!')).toBeInTheDocument();
  });
  
  test('should have proper test environment', () => {
    expect(process.env.NODE_ENV).toBe('test');
  });
});
