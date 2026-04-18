import React, { useState } from 'react';
import { Calendar } from './ui/calendar';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

interface CustomDateRangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRange: (startDate: Date, endDate: Date) => void;
}

export const CustomDateRangeModal: React.FC<CustomDateRangeModalProps> = ({
  isOpen,
  onClose,
  onSelectRange,
}) => {
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());

  const handleSubmit = () => {
    if (startDate && endDate) {
      onSelectRange(startDate, endDate);
      onClose();
    }
  };

  const isDisabled = (date: Date): boolean => {
    if (!startDate) return false;
    return date < startDate;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Select Custom Date Range</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Start Date</label>
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={setStartDate}
              className="rounded-md border"
            />
          </div>
          <div>
            <label className="text-sm font-medium">End Date</label>
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={setEndDate}
              disabled={isDisabled}
              className="rounded-md border"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!startDate || !endDate}>
              Apply Range
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
