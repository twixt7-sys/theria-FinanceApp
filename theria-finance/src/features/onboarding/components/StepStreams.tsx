import React from 'react';
import {
  STREAM_CATEGORY_TEMPLATES,
  type StreamTemplate,
} from '../lib/onboardingTemplates';
import { StepHeading, QuickSelectRow, TemplateToggleCard } from './onboardingUi';

interface StepStreamsProps {
  type: 'income' | 'expense';
  templates: StreamTemplate[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  onSelectPopular: () => void;
  onClear: () => void;
}

const categoryName = (id?: string) =>
  STREAM_CATEGORY_TEMPLATES.find((c) => c.id === id)?.name ?? '';

const COPY = {
  income: {
    title: 'Where does money come in?',
    subtitle:
      'These become your income streams — every peso or dollar you record flows through one of them.',
  },
  expense: {
    title: 'Where does money go out?',
    subtitle:
      "Pick your usual spending. Don't overthink it — the popular ones cover most people's month.",
  },
} as const;

export const StepStreams: React.FC<StepStreamsProps> = ({
  type,
  templates,
  selected,
  onToggle,
  onSelectPopular,
  onClear,
}) => (
  <div>
    <StepHeading title={COPY[type].title} subtitle={COPY[type].subtitle} />
    <QuickSelectRow onSelectPopular={onSelectPopular} onClear={onClear} />

    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {templates.map((stream) => (
        <TemplateToggleCard
          key={stream.id}
          name={stream.name}
          iconName={stream.iconName}
          color={stream.color}
          selected={selected.has(stream.id)}
          onToggle={() => onToggle(stream.id)}
          subtitle={categoryName(stream.categoryId)}
        />
      ))}
    </div>
  </div>
);
