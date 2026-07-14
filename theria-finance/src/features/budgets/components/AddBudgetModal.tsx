import React, { useState } from 'react';
import { MessageSquare, RotateCcw, TrendingDown } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { CompactFormModal } from '../../../shared/components/CompactFormModal';
import { Calculator, CalculatorKeypad } from '../../../shared/components/Calculator';
import { CapsuleSelector } from '../../../shared/components/CapsuleSelector';
import { PickerRow, PickerTile } from '../../../shared/components/PickerRow';
import { Input } from '../../../shared/components/ui/input';
import { useData } from '../../../core/state/DataContext';
import { useCurrency } from '../../../core/state/CurrencyContext';
import { type TimeFilterValue } from '../../../shared/components/TimeFilter';
import { IconComponent } from '../../../shared/components/IconComponent';
import { IconColorSubModal, NoteModal, SelectionSubModal } from '../../../shared/components/submodals';
import { AddStreamModal } from '../../streams/components/AddStreamModal';

interface AddBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  editId?: string | null;
}

/** Budget periods exclude the dashboard-only 'custom' range. */
type BudgetPeriodFilter = Exclude<TimeFilterValue, 'custom'>;

const PERIOD_BY_FILTER = {
  day: 'daily',
  week: 'weekly',
  month: 'monthly',
  quarter: 'quarterly',
  year: 'yearly',
} as const;

const PERIOD_LABEL = {
  day: 'Daily',
  week: 'Weekly',
  month: 'Monthly',
  quarter: 'Quarterly',
  year: 'Yearly',
} as const;

const FILTERS: BudgetPeriodFilter[] = ['day', 'week', 'month', 'quarter', 'year'];

export const AddBudgetModal: React.FC<AddBudgetModalProps> = ({ isOpen, onClose, editId = null }) => {
  const { streams, categories, budgets, addBudget, updateBudget } = useData();
  const categoryNameFor = (categoryId?: string) =>
    categories.find((c) => c.id === categoryId)?.name || 'Other';
  const { mainCurrencySymbol } = useCurrency();

  const [color, setColor] = useState('#10B981');
  const [iconName, setIconName] = useState('Target');
  const [timeFilter, setTimeFilter] = useState<BudgetPeriodFilter>('month');
  const [streamId, setStreamId] = useState('');
  const [name, setName] = useState('');
  const [limit, setLimit] = useState('');
  const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [note, setNote] = useState('');

  // Modals
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showIconModal, setShowIconModal] = useState(false);
  const [showStreamsModal, setShowStreamsModal] = useState(false);
  const [showAddStreamModal, setShowAddStreamModal] = useState(false);
  const [calcKeyboardOpen, setCalcKeyboardOpen] = useState(false);

  React.useEffect(() => {
    if (!isOpen) {
      setCalcKeyboardOpen(false);
      return;
    }

    if (editId) {
      const existingBudget = budgets.find((b) => b.id === editId);
      if (existingBudget) {
        setStreamId(existingBudget.streamId || '');
        setName(existingBudget.name);
        setLimit(existingBudget.limit.toString());
        setPeriod(existingBudget.period === 'yearly' ? 'yearly' : 'monthly');
        setTimeFilter(existingBudget.period === 'yearly' ? 'year' : 'month');

        const stream = streams.find((s) => s.id === existingBudget.streamId);
        if (stream) {
          setIconName(stream.iconName || 'Target');
          setColor(stream.color || '#10B981');
        }
      }
      return;
    }

    // Add mode defaults
    setStreamId('');
    setName('');
    setLimit('');
    setPeriod('monthly');
    setTimeFilter('month');
    setNote('');
    setIconName('Target');
    setColor('#10B981');
  }, [isOpen, editId, budgets, streams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!streamId || !name) return;

    if (editId) {
      const existing = budgets.find((b) => b.id === editId);
      updateBudget(editId, {
        streamId,
        name,
        limit: parseFloat(limit),
        period,
        // preserve existing values where needed
        spent: existing?.spent ?? 0,
        startDate: existing?.startDate ?? new Date().toISOString(),
        endDate: existing?.endDate ?? '',
      });
    } else {
      addBudget({
        streamId,
        name,
        limit: parseFloat(limit),
        spent: 0,
        period,
        startDate: new Date().toISOString(),
        endDate: '' as string
      });
    }

    onClose();
  };

  const handleTimeFilterChange = (next: BudgetPeriodFilter) => {
    setTimeFilter(next);
    // Keep the repeat period in sync while repeating is on.
    if (period) setPeriod(PERIOD_BY_FILTER[next] as any);
  };

  const toggleRepeat = () => {
    setPeriod(period ? ('' as any) : (PERIOD_BY_FILTER[timeFilter] as any));
  };

  const getStreamDetails = () => {
    const stream = streams.find(s => s.id === streamId);
    return stream || { iconName: 'Target', color: '#6B7280' };
  };

  const getStreamName = () => {
    const stream = streams.find(s => s.id === streamId);
    return stream ? stream.name : undefined;
  };

  const handleSelectStream = (id: string) => {
    setStreamId(id);
    setShowStreamsModal(false);
    // Adopt the stream's look unless the user already customized the icon.
    const stream = streams.find((s) => s.id === id);
    if (stream && iconName === 'Target' && color === '#10B981') {
      setIconName(stream.iconName || 'Target');
      setColor(stream.color || '#10B981');
    }
  };

  return (
    <>
    <CompactFormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      title={`${editId ? 'Edit' : 'Add'} ${PERIOD_LABEL[timeFilter]} Budget`}
      accent="#10B981"
      headerTint="#FDBA74"
    >
      <div className="space-y-4">
        {/* Limit — tap to expand the keypad */}
        <Calculator
          variant="record"
          value={limit}
          onChange={setLimit}
          label="Limit"
          currencySymbol={mainCurrencySymbol}
          displayColor="green"
          keyboardOpen={calcKeyboardOpen}
          onKeyboardOpenChange={setCalcKeyboardOpen}
        />

        {/* While the keypad is open it temporarily replaces the rest of the form */}
        <AnimatePresence initial={false} mode="wait">
        {calcKeyboardOpen ? (
          <motion.div
            key="budget-keypad"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <CalculatorKeypad value={limit} onChange={setLimit} />
          </motion.div>
        ) : (
          <motion.div
            key="budget-form"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="space-y-4"
          >
            {/* Period selector — single capsule */}
            <CapsuleSelector
              id="budget-period"
              size="sm"
              value={timeFilter}
              onChange={handleTimeFilterChange}
              options={FILTERS.map((filter) => ({
                value: filter,
                label: filter.charAt(0).toUpperCase() + filter.slice(1),
                color: '#10B981',
              }))}
            />

            {/* Name + icon chooser */}
            <div className="flex gap-2">
              <Input
                className="h-12 min-w-0 flex-1 rounded-xl border border-border bg-input-background px-4 text-sm shadow-md"
                placeholder="Name this budget"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowIconModal(true)}
                title="Choose icon"
                aria-label="Choose icon"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border shadow-md transition-transform hover:scale-105 active:scale-95"
                style={{ backgroundColor: color, borderColor: color }}
              >
                <IconComponent name={iconName} size={18} style={{ color: '#ffffff' }} />
              </button>
            </div>

            {/* Fields — bento grid */}
            <div className="grid grid-cols-2 gap-2">
              {/* Repeat + Stream share the top row; Note drops to a full-width bottom row */}
              <PickerTile
                icon={<RotateCcw size={17} />}
                label="Repeat"
                value={period ? PERIOD_LABEL[timeFilter] : undefined}
                placeholder="One-time"
                color="#10B981"
                onClick={toggleRepeat}
                trailing={
                  <span
                    className={`flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors ${
                      period ? 'bg-emerald-500' : 'bg-muted-foreground/25'
                    }`}
                    aria-hidden
                  >
                    <span
                      className={`h-4 w-4 rounded-full bg-white shadow transition-transform ${
                        period ? 'translate-x-4' : ''
                      }`}
                    />
                  </span>
                }
              />

              <PickerTile
                icon={
                  streamId ? (
                    <IconComponent name={getStreamDetails().iconName} size={17} />
                  ) : (
                    <TrendingDown size={17} />
                  )
                }
                label="Expense stream"
                value={getStreamName()}
                placeholder="Choose stream"
                color={getStreamDetails().color}
                onClick={() => setShowStreamsModal(true)}
              />

              <PickerRow
                className="col-span-2"
                icon={<MessageSquare size={17} />}
                label="Note"
                value={note || undefined}
                placeholder="Add a note (optional)"
                color="#10B981"
                onClick={() => setShowNoteModal(true)}
              />
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </CompactFormModal>

      {/* Note Modal */}
      <NoteModal
        isOpen={showNoteModal}
        onClose={() => setShowNoteModal(false)}
        note={note}
        onNoteChange={setNote}
      />

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
        items={streams
          .filter((s) => s.type === 'expense')
          .map((s) => ({ ...s, category: categoryNameFor(s.categoryId) }))}
        selectedItem={streamId}
        onSelectItem={handleSelectStream}
        showCategories={true}
        onAddItem={() => setShowAddStreamModal(true)}
        addItemLabel="Add Stream"
      />

      <AddStreamModal
        isOpen={showAddStreamModal}
        onClose={() => setShowAddStreamModal(false)}
        initialType="expense"
      />
    </>
  );
};
