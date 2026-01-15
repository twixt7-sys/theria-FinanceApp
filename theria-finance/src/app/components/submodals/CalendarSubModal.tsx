import React from 'react';
import { Calendar } from '../ui/calendar';
import { SimpleFormModal } from '../SimpleFormModal';

interface CalendarSubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDate: (date: Date) => void;
  selectedDate: Date;
}

export const CalendarSubModal: React.FC<CalendarSubModalProps> = ({
  isOpen,
  onClose,
  onSelectDate,
  selectedDate
}) => {
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      // Create a new date object with +1 offset to fix timezone issues
      const selectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
      onSelectDate(selectedDate);
      onClose();
    }
  };

  return (
    <SimpleFormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Select Date"
    >
      <div className="w-full">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          initialFocus
          className="w-full"
        />
      </div>
    </SimpleFormModal>
  );
};
