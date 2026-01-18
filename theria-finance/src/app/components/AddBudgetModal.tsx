import React, { useState, useMemo } from 'react';
import { CompactFormModal } from './CompactFormModal';
import { Input } from './ui/input';
import { useData } from '../contexts/DataContext';
import { Calculator } from './Calculator';
import { type TimeFilterValue } from './TimeFilter';
import { ChevronLeft, ChevronRight, MessageSquare, Target, TrendingDown, RotateCcw } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { IconComponent } from './IconComponent';
import { IconColorSubModal, SelectionSubModal } from './submodals';

interface AddBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddBudgetModal: React.FC<AddBudgetModalProps> = ({ isOpen, onClose}) => {

  const [color, setColor] = useState('#10B981');
  const [iconName, setIconName] = useState('Target');

  const [timeFilter, setTimeFilter] = useState<TimeFilterValue>('month');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const showNavigation = true;

  const filters: TimeFilterValue[] = ['day', 'week', 'month', 'quarter', 'year'];
  const { streams, addBudget } = useData();
  const [streamId, setStreamId] = useState('');
  const [name, setName] = useState('');
  const [limit, setLimit] = useState('');
  const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const [note, setNote] = useState('');

  //Modals
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showIconModal, setShowIconModal] = useState(false);
  const [showStreamsModal, setShowStreamsModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!streamId || !name) return;

    addBudget({
      streamId,
      name,
      limit: parseFloat(limit),
      spent: 0,
      period,
      startDate: new Date().toISOString(),
      endDate: '' as string
    });

    // Reset
    setStreamId('');
    setName('');
    setLimit('');
    setPeriod('monthly');
    setNote('');
    onClose();
  };

  const formatDateDisplay = () => {
    const date = currentDate;

    switch (timeFilter) {
      case 'day':
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });

      case 'week': {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        return `${weekStart.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })} - ${weekEnd.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })}`;
      }

      case 'month':
        return date.toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric',
        });

      case 'quarter': {
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        return `Q${quarter} ${date.getFullYear()}`;
      }

      case 'year':
        return date.getFullYear().toString();

      default:
        return '';
    }
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);

      switch (timeFilter) {
        case 'day':
          newDate.setDate(prev.getDate() + (direction === 'next' ? 1 : -1));
          break;

        case 'week':
          newDate.setDate(prev.getDate() + (direction === 'next' ? 7 : -7));
          break;

        case 'month':
          newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
          break;

        case 'quarter':
          newDate.setMonth(prev.getMonth() + (direction === 'next' ? 3 : -3));
          break;

        case 'year':
          newDate.setFullYear(prev.getFullYear() + (direction === 'next' ? 1 : -1));
          break;
      }

      return newDate;
    });
  };

  const streamCategories = useMemo(() => {
  const map = new Map<string, { id: string; name: string; color?: string }>();

  streams.forEach((stream: any) => {
    if (!map.has(stream.categoryId)) {
      map.set(stream.categoryId, {
        id: stream.categoryId,
        name: stream.categoryId,
        color: stream.color
      });
    }
  });

  return Array.from(map.values());
}, [streams]);

const groupedByCategory = useMemo(() => {
  return streamCategories.map(category => ({
    category,
    streams: streams.filter(
      s => s.categoryId === category.id && s.type === 'expense'
    )
  }));
}, [streams, streamCategories]);

  const getStreamDetails = () => {
    const stream = streams.find(s => s.id === streamId);
    return stream || { iconName: 'Target', color: '#6B7280' };
  };

  const getStreamName = () => {
    const stream = streams.find(s => s.id === streamId);
    return stream ? stream.name : 'Expense Stream';
  };

const handleSelectStream = (id: string) => {
  setStreamId(id);
  setShowStreamsModal(false);
};

  return (
    <CompactFormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      title="Add Budget"
    >
      <div className="space-y-2">
        {/* Period Display */}
        <div className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-border text-xs shadow-md`}
            style={{ backgroundColor: '#10B981', borderColor: '#10B981' }}
        >
          <span className="text-xs font-semibold capitalize text-white">
            {timeFilter === 'day' ? 'Daily' : 
             timeFilter === 'week' ? 'Weekly' : 
             timeFilter === 'month' ? 'Monthly' : 
             timeFilter === 'quarter' ? 'Quarterly' : 'Yearly'}
          </span>
        </div>

        {/* Time filter and navigation */}
        <div className="grid grid-cols-1 gap-2">
          {/* filter buttons */}
          <div className="w-full">
            <div className="grid grid-cols-5 gap-1.5 p-1 bg-card rounded-lg shadow-md border border-border">
              {filters.map(filter => (
                <button
                  key={filter}
                  onClick={() => setTimeFilter(filter)}
                  className={`w-full px-0.5 py-1 rounded-md text-[10px] font-semibold capitalize transition-all duration-300 ease-in-out whitespace-nowrap ${
                    timeFilter === filter
                      ? 'bg-muted text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
          {/* navigation */}
          {showNavigation && navigateDate && (
            <div className="w-full">
              <div className="grid grid-cols-8 items-center gap-2 w-full">
                <button
                  onClick={() => navigateDate('prev')}
                  className="mr-0.5 col-span-1 p-1.5 rounded-lg bg-card border border-border hover:bg-muted transition-all shadow-sm min-w-[32px]"
                  title="Previous"
                >
                  <ChevronLeft size={14} className="text-foreground mx-auto" />
                </button>

                <div className="ml-2 col-span-6 px-3 py-0.5 bg-card rounded-lg border border-border shadow-sm text-center">
                  <span className="text-[10px] font-semibold text-foreground">
                    {formatDateDisplay()}
                  </span>
                </div>

                <button
                  onClick={() => navigateDate('next')}
                  className="col-span-1 p-1.5 rounded-lg bg-card border border-border hover:bg-muted transition-all shadow-sm min-w-[32px]"
                  title="Next"
                >
                  <ChevronRight size={14} className="text-foreground mx-auto" />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="my-2 h-px w-full bg-border/80" />

        {/* Budget Name and Icon */}
        <div className="grid grid-cols-12">
          <Input
            className="flex items-center gap-2 h-8 rounded-xl border border-border px-3 bg-input-background text-sm shadow-sm grid col-span-10"
            placeholder='Budget Name'
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className="grid col-span-2">
            <button
            type="button"
            onClick={() => setShowIconModal(true)}
            className="h-full ml-1.5 rounded-xl border border-border hover:bg-muted transition-colors flex flex-col items-center justify-center gap-1 text-sm font-semibold shadow-sm"
            title="Add icon"
            style={{ backgroundColor: (iconName !== 'Target' || color !== '#10B981') ? color : undefined, borderColor: (iconName !== 'Target' || color !== '#10B981') ? color : undefined }}
          >
            {iconName !== 'Target' || color !== '#10B981' ? (
              <IconComponent name={iconName} size={14} style={{ color: '#ffffff' }} />
            ) : (
              <Target size={14} className="text-muted-foreground" />
            )}
          </button>
          </div>
        </div>

        <div className="my-2 h-px w-full bg-border/80" />

        {/* Note, Expense Stream, and Repeat Toggle */}
        <div className='grid grid-cols-3 gap-2'>
          {/* Note button - 1/3 ratio */}
          <div className='col-span-1'>
            <button
              type="button"
              onClick={() => setShowNoteModal(true)}
              className={`h-full rounded-xl border border-border transition-colors flex flex-col items-center justify-center gap-1 text-[10px] font-semibold shadow-sm w-full ${
                note ? 'bg-green-500/10 border-green-500/20' : 'bg-card hover:bg-muted'
              }`}
              title="Add note"
            >
              <MessageSquare size={14} className={note ? 'text-green-500' : 'text-muted-foreground'} />
              <span className={`text-[8px] ${note ? 'text-green-500 font-medium' : 'text-muted-foreground'}`}>
                {note ? 'Edit note' : 'Add note'}
              </span>
            </button>
          </div>

          {/* Expense Stream and Repeat Toggle - 2/3 ratio */}
          <div className='col-span-2 space-y-2'>
            {/* Expense Stream */}
            <button
              className="flex items-center px-3 h-16 rounded-xl text-center border border-border text-[10px] shadow-sm w-full"
              type="button"
              onClick={() => setShowStreamsModal(true)}
              style={{ backgroundColor: streamId ? getStreamDetails().color + '20' : undefined, borderColor: streamId ? getStreamDetails().color : undefined }}
            >
              <div className="pl-6">
                {streamId ? (
                  <IconComponent name={getStreamDetails().iconName} className='mr-3' size={18} style={{ color: getStreamDetails().color }} />
                ) : (
                  <TrendingDown className='mr-3' size={18} />
                )}
              </div>
              <div className="flex flex-col items-center flex-1">
                <span className="text-[8px] text-muted-foreground mb-0.5">Expense Stream</span>
                <span className="text-[10px] font-medium truncate">{getStreamName()}</span>
              </div>
            </button>

            {/* Repeat Toggle */}
            <button
              type="button"
              onClick={() => {
                // Simple toggle logic
                const periodMap = {
                  'day': 'daily',
                  'week': 'weekly',
                  'month': 'monthly', 
                  'quarter': 'quarterly',
                  'year': 'yearly'
                };
                const targetPeriod = periodMap[timeFilter];
                setPeriod(period === targetPeriod ? '' as any : targetPeriod as any);
              }}
              className={`flex items-center px-3 h-16 rounded-xl text-center border border-border text-[10px] shadow-sm w-full transition-colors ${
                period ? 'bg-green-500/10 border-green-500/20 hover:bg-green-500/15' : 'bg-card hover:bg-muted'
              }`}
            >
              <div className="pl-6">
                <RotateCcw size={18} className={`mr-3 ${period ? 'text-green-500' : 'text-muted-foreground'}`} />
              </div>
              <div className="flex flex-col items-center flex-1">
                <span className="text-[8px] text-muted-foreground mb-0.5">Repeat</span>
                <span className={`text-[10px] font-medium ${period ? 'text-green-500' : 'text-foreground'}`}>
                  {timeFilter === 'day' ? 'Daily' : 
                   timeFilter === 'week' ? 'Weekly' : 
                   timeFilter === 'month' ? 'Monthly' : 
                   timeFilter === 'quarter' ? 'Quarterly' : 'Yearly'}
                </span>
              </div>
            </button>
          </div>
        </div>

        <div className="my-2 h-px w-full bg-border/80" />

        {/* Calculator */}
        <div className="col-span-5">
          <Calculator value={limit} onChange={setLimit} label="Limit" />
        </div>
      </div>

      {/* Note Modal */}
      <Dialog open={showNoteModal} onOpenChange={setShowNoteModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Enter note..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="min-h-32"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setNote('')}
              className="flex-1 px-2.5 py-1 bg-muted text-muted-foreground rounded-lg font-semibold hover:bg-muted/80"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => setShowNoteModal(false)}
              className="flex-1 px-2.5 py-1 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90"
            >
              Done
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Icon Modal */}
      <IconColorSubModal
        isOpen={showIconModal}
        onClose={() => setShowIconModal(false)}
        title="Icon"
        selectedIcon={iconName}
        selectedColor={color}
        onIconChange={setIconName}
        onColorChange={setColor}
      />

      {/* Streams Modal */}
      <SelectionSubModal
        isOpen={showStreamsModal}
        onClose={() => setShowStreamsModal(false)}
        onSubmit={() => setShowStreamsModal(false)}
        title="Choose Expense Stream"
        items={groupedByCategory.flatMap(group => group.streams)}
        selectedItem={streamId}
        onSelectItem={handleSelectStream}
        showCategories={true}
      />
    </CompactFormModal>
  );
};
