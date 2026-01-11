import React, { useState, useMemo } from 'react';
import { CompactFormModal } from './CompactFormModal';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { useData } from '../contexts/DataContext';
import { Calculator } from './Calculator';
import { Check, ChevronLeft, ChevronRight, MessageSquare, TargetIcon, TrendingDown } from 'lucide-react';
import type { TimeFilterValue } from './TimeFilter';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge'
import { Textarea } from './ui/textarea';
import { IconComponent } from './IconComponent';



interface AddSavingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddSavingsModal: React.FC<AddSavingsModalProps> = ({ isOpen, onClose }) => {
  const ICON_OPTIONS = ['Briefcase', 'Code', 'ShoppingCart', 'Car', 'Film', 'Home', 'Coffee', 'Heart', 'Zap', 'Gift', 'Book', 'Music', 'Smartphone', 'Utensils', 'Plane'];
  const COLOR_OPTIONS = ['#10B981', '#059669', '#34D399', '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6', '#6366F1'];

  const [color, setColor] = useState('#10B981');
  const [iconName, setIconName] = useState('Zap');

  const [timeFilter, setTimeFilter] = useState<TimeFilterValue>('month');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const showNavigation = true;

  const filters: TimeFilterValue[] = ['day', 'week', 'month', 'quarter', 'year'];
  const { streams, addSavings } = useData();
  const [streamId, setStreamId] = useState('');
  const [limit, setLimit] = useState('');
  const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showIconModal, setShowIconModal] = useState(false);
  const [showStreamsModal, setShowStreamsModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!streamId || !limit) return;

    addSavings({
      name,
      targetAmount: parseFloat(amount),
      streamId,
      note,
      color,
      iconName,
      startDate: currentDate.toISOString(),
      period
    });

    // Reset
    setStreamId('');
    setLimit('');
    setPeriod('monthly');
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
  
  const handleSelectStream = (id: string) => {
    setStreamId(id);
    setShowStreamsModal(false);
  };

  return (
    <CompactFormModal
          isOpen={isOpen}
          onClose={onClose}
          onSubmit={handleSubmit}
          title="Add Savings"
        >
          <div className="grid grid-cols-12">
            <Input
              className="flex items-center gap-2 h-12 rounded-xl border border-border px-3 bg-input-background text-sm shadow-sm grid col-span-10"
              placeholder='Budget Name'
            />
            <div className="grid col-span-2">
              <button
                  type="button"
                  onClick={() => setShowIconModal(true)}
                  className="h-full ml-3 rounded-xl border border-border bg-input-background hover:bg-muted transition-colors flex flex-col items-center justify-center gap-1 text-sm font-semibold shadow-sm"
                  title="Add icon"
                >
                <TargetIcon size={18} />
              </button>
            </div>
          </div>
    
          <div className="my-4 h-px w-full bg-border/60" />
          
          <div className="grid grid-cols-4">
            {/* Stream Selection */}
            <button
              className=" flex items-center px-3 h-20 rounded-xl text-center border border-border mr-3 bg-input-background text-sm shadow-sm grid col-span-1"
              type="button"
              onClick={() => setShowStreamsModal(true)}
            >
              <TrendingDown className='ml-4 mt-2' size={25} />
              <Label className='mb-2 text-xs text-muted-foreground'>Expense Stream</Label>
            </button>
            {/* filter and nav */}
            <div className="grid col-span-3">
              {/* filter buttons */}
              <div className="w-full">
                <div className="grid grid-cols-5 gap-2 p-1 bg-card rounded-lg shadow-md border border-border">
                  {filters.map(filter => (
                    <button
                      key={filter}
                      onClick={() => setTimeFilter(filter)}
                      className={`w-full px-1 py-1.5 rounded-md text-xs font-semibold capitalize transition-all whitespace-nowrap ${
                        timeFilter === filter
                          ? 'bg-primary text-white shadow-sm'
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
                <div className="w-72">
                  <div className="grid grid-cols-8 items-center gap-2 w-full">
                    <button
                      onClick={() => navigateDate('prev')}
                      className="mr-1 col-span-1 p-2 rounded-lg bg-card border border-border hover:bg-muted transition-all shadow-sm min-w-[40px]"
                      title="Previous"
                    >
                      <ChevronLeft size={16} className="text-foreground mx-auto" />
                    </button>
    
                    <div className="ml-3 col-span-6 px-4 py-1 bg-card rounded-lg border border-border shadow-sm text-center">
                      <span className="text-xs font-semibold text-foreground">
                        {formatDateDisplay()}
                      </span>
                    </div>
    
                    <button
                      onClick={() => navigateDate('next')}
                      className="col-span-1 p-2 rounded-lg bg-card border border-border hover:bg-muted transition-all shadow-sm min-w-[40px]"
                      title="Next"
                    >
                      <ChevronRight size={16} className="text-foreground mx-auto" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
    
          <div className="my-4 h-px w-full bg-border/60" />
    
          <div className="space-y-4">
            <div className="space-y-2">
              {/* Amount + Note */}
              <div className="grid grid-cols-4 gap-2 items-start">
                <div className="col-span-3">
                  <Calculator value={amount} onChange={setAmount} />
                </div>
                <button
                  type="button"
                  onClick={() => setShowNoteModal(true)}
                  className="h-full rounded-xl border border-border bg-card hover:bg-muted transition-colors flex flex-col items-center justify-center gap-1 text-sm font-semibold shadow-sm"
                  title="Add note"
                >
                  <MessageSquare size={18} />
                  <span className="text-xs text-muted-foreground">
                    {note ? 'Edit note' : 'Add note'}
                  </span>
                </button>
              </div>
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
              <button
                type="button"
                onClick={() => setShowNoteModal(false)}
                className="w-full px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90"
              >
                Done
              </button>
            </DialogContent>
          </Dialog>
    
          {/* Icon Modal */}
          <CompactFormModal
            isOpen={showIconModal}
            onClose={() => setShowIconModal(false)}
            onSubmit={handleSubmit}
            title="Icon"
          >
            {/* Color */}
            <div className="space-y-2">
              <div className="grid grid-cols-4 gap-2">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`h-10 rounded-lg border-2 transition-all shadow-sm ${
                      color === c
                        ? 'border-foreground scale-105 shadow-md'
                        : 'border-border hover:scale-105'
                    }`}
                    style={{ backgroundColor: c }}
                  >
                    {color === c && <Check className="mx-auto text-white" size={16} strokeWidth={3} />}
                  </button>
                ))}
              </div>
            </div>
    
            {/* Icon */}
            <div className="space-y-2">
              <div className="grid grid-cols-5 gap-2">
                {ICON_OPTIONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setIconName(icon)}
                    className={`p-3 rounded-xl border-2 transition-all shadow-sm ${
                      iconName === icon
                        ? 'border-primary bg-primary/10 shadow-md'
                        : 'border-border hover:border-primary/50 hover:bg-muted'
                    }`}
                  >
                    <IconComponent className='mx-3' name={icon} size={20} />
                  </button>
                ))}
              </div>
            </div>
          </CompactFormModal>
    
          {/* Streams Modal */}
          <CompactFormModal
      isOpen={showStreamsModal}
      onClose={() => setShowStreamsModal(false)}
      onSubmit={handleSubmit}
      title="Choose Expense Stream"
    >
      <div className="space-y-4">
        {groupedByCategory.map(group => (
          <div key={group.category.id}>
            <div className="flex items-center gap-2 px-1 mb-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: group.category.color || '#6B7280' }}
              />
              <p className="text-sm font-semibold text-foreground">
                {group.category.name}
              </p>
              <Badge variant="outline" className="text-xs">
                {group.streams.length}
              </Badge>
            </div>
    
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {group.streams.map(stream => (
                <div
                  key={stream.id}
                  onClick={() => handleSelectStream(stream.id)}
                  className={`flex flex-col bg-card border rounded-2xl p-4 cursor-pointer transition-all shadow-sm min-h-[120px]
                    ${
                      streamId === stream.id
                        ? 'border-primary ring-2 ring-primary/30'
                        : 'border-border hover:shadow-lg'
                    }`}
                  style={{
                    backgroundColor: `${stream.color}12`,
                    boxShadow: `0 6px 20px ${stream.color}20`
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                    style={{ backgroundColor: `${stream.color}22` }}
                  >
                    <IconComponent
                      name={stream.iconName}
                      size={22}
                      style={{ color: stream.color }}
                    />
                  </div>
    
                  <h3 className="font-semibold text-sm text-foreground truncate">
                    {stream.name}
                  </h3>
    
                  <Badge
                    className="mt-auto text-[11px] capitalize border-0 justify-center"
                    style={{ backgroundColor: `${stream.color}22`, color: stream.color }}
                  >
                    expense
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </CompactFormModal>
        </CompactFormModal>
  );
};
