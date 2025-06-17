import { screen } from '@testing-library/react';
import { ResumePreview } from './resume-preview';
import { ResumeData } from './resume-builder';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import { render } from '@/lib/test-utils';

describe('ResumePreview', () => {
  const mockData: ResumeData = {
    personalInfo: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '123-456-7890',
      address: '123 Main St',
      summary: 'I am a software engineer with 5 years of experience.',
      jobTitle: 'Software Engineer',
      photo: 'https://example.com/photo.jpg',
      socialLinks: [
        {
          platform: 'LinkedIn',
          url: 'https://www.linkedin.com/in/johndoe',
          username: 'johndoe',
        },
      ],
    },
    education: [
      {
        institution: 'University A',
        degree: 'B.Sc. in Computer Science',
        fieldOfStudy: 'Computer Science',
        startDate: '2020-06-01',
        endDate: '2023-06-30',
        description: "I have a Bachelor's degree in Computer Science from University A.",
      },
    ],
    experience: [
      {
        company: 'Company X',
        position: 'Software Engineer',
        location: 'Remote',
        startDate: '2020-06-01',
        endDate: '2023-06-30',
        current: false,
        description: 'I have 5 years of experience in software development.',
        achievements: 'Achieved multiple awards and accolades.',
        techStack: 'React, Node.js, JavaScript',
      },
    ],
    skills: ['React', 'Node.js', 'JavaScript'],
  };
  const emptyMockData: ResumeData = {
    personalInfo: {
      name: '',
      email: '',
      phone: '',
      address: '',
      summary: '',
      jobTitle: '',
      photo: '',
      socialLinks: [],
    },
    education: [],
    experience: [],
    skills: [],
  };

  it('renders the empty message when no data is provided', () => {
    render(<ResumePreview data={emptyMockData} />);
    const emptyMessage = screen.getByText('previewEmpty');
    expect(emptyMessage).toBeInTheDocument();
  });

  it('defaults to compact template when no template is provided', () => {
    render(<ResumePreview data={mockData} />);
    const defaultTemplate = screen.getByTestId('compact-template');
    expect(defaultTemplate).toBeInTheDocument();
  });

  it('renders the modern template when specified', () => {
    render(<ResumePreview data={mockData} template='modern' />);
    const modernTemplate = screen.getByTestId('modern-template');
    expect(modernTemplate).toBeInTheDocument();
  });

  it('renders the professional template when specified', () => {
    render(<ResumePreview data={mockData} template='professional' />);
    const professionalTemplate = screen.getByTestId('professional-template');
    expect(professionalTemplate).toBeInTheDocument();
  });

  it('renders the compact template when specified', () => {
    render(<ResumePreview data={mockData} template='compact' />);
    const compactTemplate = screen.getByTestId('compact-template');
    expect(compactTemplate).toBeInTheDocument();
  });
});
