import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import App from '../App';

describe('App', () => {
  it('renders the home page by default', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Welcome to PKU Mat.')).toBeInTheDocument();
  });

  it('renders the about page when navigating to /about', () => {
    render(
      <MemoryRouter initialEntries={['/about']}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('This is the about page.')).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'About' })).toBeInTheDocument();
  });
});
