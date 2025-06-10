import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResumeBuilder } from '@/components/resume-builder';
import { mockRouter } from '@/lib/test-utils';
import '@testing-library/jest-dom';
import { PersonalInfoFormProps } from './form/personal-info-form';
import { EducationFormProps } from './form/education-form';
import { ExperienceFormProps } from './form/experience-form';
import { SkillsFormProps } from './form/skills-form';
import { ResumePreviewProps } from './resume-preview';
import { TemplateSelectorProps } from './template-selector';

// Mock the hooks and components
vi.mock('next/navigation', async () => {
  const actual = await vi.importActual('next/navigation');
  return {
    ...actual,
    useRouter: () => mockRouter,
    useSearchParams: () => new URLSearchParams(),
  };
});

vi.mock('@/hooks/use-translation', () => ({
  useTranslation: () => ({
    t: (key: string) => key, // Simply return the key for testing
  }),
}));

// Mock the form components
vi.mock('@/components/form/personal-info-form', () => ({
  PersonalInfoForm: ({ initialData, onSave }: PersonalInfoFormProps) => (
    <div data-testid='personal-info-form'>
      <button
        data-testid='save-personal-info'
        onClick={() => onSave({ ...initialData, name: 'John Doe' })}
      >
        Save Personal Info
      </button>
    </div>
  ),
}));

vi.mock('@/components/form/education-form', () => ({
  EducationForm: ({ initialData, onSave }: EducationFormProps) => (
    <div data-testid='education-form'>
      <button
        data-testid='save-education'
        onClick={() =>
          onSave([{ ...initialData[0], institution: 'Test University' }])
        }
      >
        Save Education
      </button>
    </div>
  ),
}));

vi.mock('@/components/form/experience-form', () => ({
  ExperienceForm: ({ initialData, onSave }: ExperienceFormProps) => (
    <div data-testid='experience-form'>
      <button
        data-testid='save-experience'
        onClick={() => onSave([{ ...initialData[0], company: 'Test Company' }])}
      >
        Save Experience
      </button>
    </div>
  ),
}));

vi.mock('@/components/form/skills-form', () => ({
  SkillsForm: ({
    initialData = ['JavaScript', 'React'],
    onSave,
  }: SkillsFormProps) => (
    <div data-testid='skills-form'>
      <button data-testid='save-skills' onClick={() => onSave(initialData)}>
        Save Skills
      </button>
    </div>
  ),
}));

vi.mock('@/components/resume-preview', () => ({
  ResumePreview: ({ data, template }: ResumePreviewProps) => (
    <div data-testid='resume-preview'>
      <div data-testid='preview-name'>{data.personalInfo.name}</div>
      <div data-testid='preview-template'>{template}</div>
    </div>
  ),
}));

vi.mock('@/components/template-selector', () => ({
  TemplateSelector: ({
    selectedTemplate = 'modern',
    onTemplateChangeAction: onTemplateChange,
  }: TemplateSelectorProps) => (
    <div data-testid='template-selector'>
      <button
        data-testid='change-template'
        onClick={() => onTemplateChange(selectedTemplate)}
      >
        Change Template
      </button>
    </div>
  ),
}));

vi.mock('@/components/export/export-dialog', () => ({
  ExportDialog: () => <div data-testid='export-dialog'></div>,
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('ResumeBuilder', () => {
  // Setup localStorage mock
  const localStorageMock = (() => {
    let store: Record<string, string> = {};

    return {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value;
      }),
      clear: vi.fn(() => {
        store = {};
      }),
    };
  })();

  beforeEach(() => {
    // Setup localStorage mock
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
    });
    localStorageMock.clear();

    // Reset router mock
    mockRouter.push.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the builder with initial tabs', () => {
    render(<ResumeBuilder />);

    expect(screen.getByText('builder.title')).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: 'builder.personal' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: 'builder.education' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: 'builder.experience' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: 'builder.skills' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: 'builder.preview' }),
    ).toBeInTheDocument();

    // Personal info form should be visible by default
    expect(screen.getByTestId('personal-info-form')).toBeInTheDocument();
  });

  it('allows users to navigate through the form steps', async () => {
    render(<ResumeBuilder />);
    const user = userEvent.setup();

    // Start with personal info
    expect(screen.getByTestId('personal-info-form')).toBeInTheDocument();

    // Save personal info, should advance to education
    await user.click(screen.getByTestId('save-personal-info'));
    expect(screen.getByTestId('education-form')).toBeInTheDocument();

    // Save education, should advance to experience
    await user.click(screen.getByTestId('save-education'));
    expect(screen.getByTestId('experience-form')).toBeInTheDocument();

    // Save experience, should advance to skills
    await user.click(screen.getByTestId('save-experience'));
    expect(screen.getByTestId('skills-form')).toBeInTheDocument();

    // Save skills, should advance to preview
    await user.click(screen.getByTestId('save-skills'));

    // Preview tab should show template selector and export options
    expect(screen.getByTestId('template-selector')).toBeInTheDocument();
  });

  it('allows users to manually switch between tabs', async () => {
    render(<ResumeBuilder />);
    const user = userEvent.setup();

    // Start with personal info
    expect(screen.getByTestId('personal-info-form')).toBeInTheDocument();

    // Switch to education tab
    await user.click(screen.getByRole('tab', { name: 'builder.education' }));
    expect(screen.getByTestId('education-form')).toBeInTheDocument();

    // Switch to experience tab
    await user.click(screen.getByRole('tab', { name: 'builder.experience' }));
    expect(screen.getByTestId('experience-form')).toBeInTheDocument();

    // Switch to skills tab
    await user.click(screen.getByRole('tab', { name: 'builder.skills' }));
    expect(screen.getByTestId('skills-form')).toBeInTheDocument();

    // Switch to preview tab
    await user.click(screen.getByRole('tab', { name: 'builder.preview' }));
    expect(screen.getByTestId('template-selector')).toBeInTheDocument();

    // Go back to personal info
    await user.click(screen.getByRole('tab', { name: 'builder.personal' }));
    expect(screen.getByTestId('personal-info-form')).toBeInTheDocument();
  });

  it('updates resume data when forms are saved', async () => {
    render(<ResumeBuilder />);
    const user = userEvent.setup();

    // Save personal info with name "John Doe"
    await user.click(screen.getByTestId('save-personal-info'));

    // Save education with Test University
    await user.click(screen.getByTestId('save-education'));

    // Save experience with Test Company
    await user.click(screen.getByTestId('save-experience'));

    // Save skills with JavaScript and React
    await user.click(screen.getByTestId('save-skills'));

    // Check if the preview reflects the updated data
    expect(screen.getByTestId('preview-name')).toHaveTextContent('John Doe');
  });

  it('allows changing templates', async () => {
    render(<ResumeBuilder />);
    const user = userEvent.setup();

    // Go to preview tab
    await user.click(screen.getByRole('tab', { name: 'builder.preview' }));

    // Change template to modern
    await user.click(screen.getByTestId('change-template'));

    // Check if template was updated in preview
    expect(screen.getByTestId('preview-template')).toHaveTextContent('modern');
  });

  it('opens save dialog when save button is clicked for a new resume', async () => {
    render(<ResumeBuilder />);
    const user = userEvent.setup();

    // Click save button
    await user.click(screen.getByRole('button', { name: 'builder.save' }));

    // Check if save dialog is open using more specific selectors
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'builder.saveAs' }),
    ).toBeInTheDocument();
  });

  it('saves a new resume with a name', async () => {
    render(<ResumeBuilder />);
    const user = userEvent.setup();

    // Click save button to open dialog
    await user.click(screen.getByRole('button', { name: 'builder.save' }));

    // Enter resume name - use ID selector to be more specific
    const inputField = screen.getByLabelText('builder.resumeName');
    await user.type(inputField, 'My Test Resume');

    // Click save button in dialog - be more specific
    await user.click(screen.getByRole('button', { name: 'common.save' }));

    // Check if localStorage was updated
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'savedResumes',
      expect.stringContaining('My Test Resume'),
    );

    // Check if router redirected to edit URL
    expect(mockRouter.push).toHaveBeenCalledWith(
      expect.stringContaining('/builder?id='),
    );
  });

  it('handles export dialog opening', async () => {
    render(<ResumeBuilder />);
    const user = userEvent.setup();

    // Go to preview tab
    await user.click(screen.getByRole('tab', { name: 'builder.preview' }));

    // Click export button
    await user.click(screen.getByRole('button', { name: 'builder.export' }));

    // Export dialog should be visible
    await waitFor(() => {
      expect(screen.getByTestId('export-dialog')).toBeInTheDocument();
    });
  });
});
