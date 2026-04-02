import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import App from '../App';

// Mock the auth API to avoid real fetch calls
vi.mock('../api/auth', () => ({
  getMe: vi.fn().mockRejectedValue(new Error('Unauthorized')),
  login: vi.fn(),
  logout: vi.fn(),
}));

describe('App', () => {
  it('renders the login page when not authenticated', async () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>,
    );

    expect(await screen.findByText('PKU-MAT')).toBeInTheDocument();
    expect(screen.getByText('Zaloguj sie')).toBeInTheDocument();
  });

  it('redirects to login when accessing protected route', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <App />
      </MemoryRouter>,
    );

    // Should show loading first, then redirect to login
    expect(
      await screen.findByText('PKU-MAT', {}, { timeout: 3000 }),
    ).toBeInTheDocument();
  });
});
