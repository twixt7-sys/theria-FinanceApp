import React from 'react';
import { Lock } from 'lucide-react';
import {
  AGE_RANGE_OPTIONS,
  GENDER_OPTIONS,
  WORK_OPTIONS,
  USE_CASE_OPTIONS,
} from '../lib/onboardingTemplates';
import { StepHeading, SectionLabel, ChoiceChip } from './onboardingUi';

export interface AboutYouAnswers {
  ageRange?: string;
  gender?: string;
  work?: string;
  useCases: string[];
}

interface StepAboutYouProps {
  answers: AboutYouAnswers;
  onChange: (answers: AboutYouAnswers) => void;
}

export const StepAboutYou: React.FC<StepAboutYouProps> = ({ answers, onChange }) => {
  // Tapping the current answer again clears it — every question stays optional.
  const pickSingle = (field: 'ageRange' | 'gender' | 'work', value: string) =>
    onChange({ ...answers, [field]: answers[field] === value ? undefined : value });

  const toggleUseCase = (id: string) =>
    onChange({
      ...answers,
      useCases: answers.useCases.includes(id)
        ? answers.useCases.filter((u) => u !== id)
        : [...answers.useCases, id],
    });

  return (
    <div>
      <StepHeading
        title="A little about you (optional)"
        subtitle="This helps make Theria better for people like you. Skip anything — or everything."
      />

      <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-primary/25 bg-primary/8 px-3.5 py-3">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Lock size={13} />
        </span>
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Your answers stay on this device and are never tied to your money data.
        </p>
      </div>

      <SectionLabel>Age</SectionLabel>
      <div className="flex flex-wrap gap-1.5">
        {AGE_RANGE_OPTIONS.map((age) => (
          <ChoiceChip
            key={age}
            label={age}
            selected={answers.ageRange === age}
            onToggle={() => pickSingle('ageRange', age)}
          />
        ))}
      </div>

      <SectionLabel>Gender</SectionLabel>
      <div className="flex flex-wrap gap-1.5">
        {GENDER_OPTIONS.map((gender) => (
          <ChoiceChip
            key={gender}
            label={gender}
            selected={answers.gender === gender}
            onToggle={() => pickSingle('gender', gender)}
          />
        ))}
      </div>

      <SectionLabel>Work</SectionLabel>
      <div className="flex flex-wrap gap-1.5">
        {WORK_OPTIONS.map((work) => (
          <ChoiceChip
            key={work}
            label={work}
            selected={answers.work === work}
            onToggle={() => pickSingle('work', work)}
          />
        ))}
      </div>

      <SectionLabel>What brings you to Theria?</SectionLabel>
      <div className="flex flex-wrap gap-1.5">
        {USE_CASE_OPTIONS.map((useCase) => (
          <ChoiceChip
            key={useCase.id}
            label={useCase.label}
            iconName={useCase.iconName}
            selected={answers.useCases.includes(useCase.id)}
            onToggle={() => toggleUseCase(useCase.id)}
          />
        ))}
      </div>
    </div>
  );
};
