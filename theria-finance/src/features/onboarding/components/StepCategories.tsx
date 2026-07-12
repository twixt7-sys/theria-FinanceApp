import React from 'react';
import {
  ACCOUNT_CATEGORY_TEMPLATES,
  STREAM_CATEGORY_TEMPLATES,
} from '../lib/onboardingTemplates';
import { StepHeading, SectionLabel, QuickSelectRow, TemplateToggleCard } from './onboardingUi';

interface StepCategoriesProps {
  selected: Set<string>;
  onToggle: (id: string) => void;
  onSelectPopular: () => void;
  onClear: () => void;
}

export const StepCategories: React.FC<StepCategoriesProps> = ({
  selected,
  onToggle,
  onSelectPopular,
  onClear,
}) => {
  const accountCount = ACCOUNT_CATEGORY_TEMPLATES.filter((c) => selected.has(c.id)).length;
  const streamCount = STREAM_CATEGORY_TEMPLATES.filter((c) => selected.has(c.id)).length;

  return (
    <div>
      <StepHeading
        title="How do you like things organized?"
        subtitle="Categories group your accounts and money flows. Tap the ones that sound like your life."
      />
      <QuickSelectRow onSelectPopular={onSelectPopular} onClear={onClear} />

      <SectionLabel count={accountCount}>For your accounts</SectionLabel>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {ACCOUNT_CATEGORY_TEMPLATES.map((category) => (
          <TemplateToggleCard
            key={category.id}
            name={category.name}
            iconName={category.iconName}
            color={category.color}
            selected={selected.has(category.id)}
            onToggle={() => onToggle(category.id)}
          />
        ))}
      </div>

      <SectionLabel count={streamCount}>For income & expenses</SectionLabel>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {STREAM_CATEGORY_TEMPLATES.map((category) => (
          <TemplateToggleCard
            key={category.id}
            name={category.name}
            iconName={category.iconName}
            color={category.color}
            selected={selected.has(category.id)}
            onToggle={() => onToggle(category.id)}
          />
        ))}
      </div>
    </div>
  );
};
