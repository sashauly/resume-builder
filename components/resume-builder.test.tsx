import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { render } from '@/lib/test-utils';
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

// Mock next/navigation
vi.mock('next/navigation', async () => {
  const actual = await vi.importActual('next/navigation');
  return {
    ...actual,
    useRouter: () => mockRouter,
    useSearchParams: () => new URLSearchParams('id=test-id'),
  };
});

// Mock translation hook
vi.mock('@/hooks/use-translation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock locale hook
vi.mock('@/hooks/use-locale', () => ({
  useLocale: () => ({
    locale: 'en',
  }),
}));

// Mock export function
vi.mock('@/lib/export', () => ({
  default: vi.fn().mockResolvedValue(undefined),
}));

// Mock form components
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
        onClick={() => onSave([{ ...initialData[0], institution: 'Test University' }])}
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
  SkillsForm: ({ initialData = ['JavaScript', 'React'], onSave }: SkillsFormProps) => (
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
    selectedTemplate,
    onTemplateChangeAction: onTemplateChange,
  }: TemplateSelectorProps) => (
    <div data-testid='template-selector'>
      <button data-testid='change-template' onClick={() => onTemplateChange('modern')}>
        Change Template
      </button>
    </div>
  ),
}));

vi.mock('@/components/export/export-dialog', () => ({
  ExportDialog: () => <div data-testid='export-dialog'></div>,
  ExportFormat: {
    HTML: 'html',
    WORD: 'word',
    IMAGE: 'image',
  },
}));

// Mock format selector
vi.mock('@/components/format-selector', () => ({
  default: () => (
    <div data-testid='format-selector'>
      <button data-testid='export-button'>Export</button>
    </div>
  ),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('ResumeBuilder', () => {
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
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
    localStorageMock.clear();
    mockRouter.push.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the builder with initial tabs', async () => {
    render(<ResumeBuilder />);

    await waitFor(() => {
      expect(screen.getByText('builder.title')).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'builder.personal' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'builder.education' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'builder.experience' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'builder.skills' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'builder.preview' })).toBeInTheDocument();
    });

    expect(screen.getByTestId('personal-info-form')).toBeInTheDocument();
  });

  it('allows users to navigate through the form steps', async () => {
    render(<ResumeBuilder />);
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByTestId('personal-info-form')).toBeInTheDocument();
    });

    await user.click(screen.getByTestId('save-personal-info'));
    await waitFor(() => {
      expect(screen.getByTestId('education-form')).toBeInTheDocument();
    });

    await user.click(screen.getByTestId('save-education'));
    await waitFor(() => {
      expect(screen.getByTestId('experience-form')).toBeInTheDocument();
    });

    await user.click(screen.getByTestId('save-experience'));
    await waitFor(() => {
      expect(screen.getByTestId('skills-form')).toBeInTheDocument();
    });

    await user.click(screen.getByTestId('save-skills'));
    await waitFor(() => {
      expect(screen.getByTestId('template-selector')).toBeInTheDocument();
    });
  });

  it('allows users to manually switch between tabs', async () => {
    render(<ResumeBuilder />);
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByTestId('personal-info-form')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('tab', { name: 'builder.education' }));
    await waitFor(() => {
      expect(screen.getByTestId('education-form')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('tab', { name: 'builder.experience' }));
    await waitFor(() => {
      expect(screen.getByTestId('experience-form')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('tab', { name: 'builder.skills' }));
    await waitFor(() => {
      expect(screen.getByTestId('skills-form')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('tab', { name: 'builder.preview' }));
    await waitFor(() => {
      expect(screen.getByTestId('template-selector')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('tab', { name: 'builder.personal' }));
    await waitFor(() => {
      expect(screen.getByTestId('personal-info-form')).toBeInTheDocument();
    });
  });

  it('updates resume data when forms are saved', async () => {
    render(<ResumeBuilder />);
    const user = userEvent.setup();

    await user.click(screen.getByTestId('save-personal-info'));
    await user.click(screen.getByTestId('save-education'));
    await user.click(screen.getByTestId('save-experience'));
    await user.click(screen.getByTestId('save-skills'));

    await waitFor(() => {
      expect(screen.getByTestId('preview-name')).toHaveTextContent('John Doe');
    });
  });

  it('allows changing templates', async () => {
    render(<ResumeBuilder />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('tab', { name: 'builder.preview' }));
    await user.click(screen.getByTestId('change-template'));

    await waitFor(() => {
      expect(screen.getByTestId('resume-preview')).toBeInTheDocument();
    });
  });

  it('opens save dialog when save button is clicked for a new resume', async () => {
    render(<ResumeBuilder />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'builder.save' }));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'builder.saveAs' })).toBeInTheDocument();
    });
  });

  it('saves a new resume with a name', async () => {
    render(<ResumeBuilder />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'builder.save' }));

    const inputField = screen.getByLabelText('builder.resumeName');
    await user.type(inputField, 'My Test Resume');

    await user.click(screen.getByRole('button', { name: 'common.save' }));

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'savedResumes',
        expect.stringContaining('My Test Resume'),
      );
      expect(mockRouter.push).toHaveBeenCalledWith(expect.stringContaining('/builder?id='));
    });
  });

  it('loads existing resume data when id is present', async () => {
    const mockResume = {
      id: 'test-id',
      name: 'Test Resume',
      data: {
        personalInfo: { name: 'John Doe' },
        education: [],
        experience: [],
        skills: [],
      },
      template: 'modern',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    localStorageMock.getItem.mockReturnValue(JSON.stringify([mockResume]));

    render(<ResumeBuilder />);

    await waitFor(() => {
      expect(screen.getByTestId('preview-name')).toHaveTextContent('John Doe');
    });
  });
});
