import React, { useEffect, useRef, useState } from 'react';
import { CalendarClock, Camera, Check, ImagePlus, MessageSquare, ShieldCheck, Trash2, Trophy, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { CompactFormModal } from '../../../shared/components/CompactFormModal';
import { Calculator, CalculatorKeypad } from '../../../shared/components/Calculator';
import { CapsuleSelector } from '../../../shared/components/CapsuleSelector';
import { PickerRow } from '../../../shared/components/PickerRow';
import { Input } from '../../../shared/components/ui/input';
import { useData } from '../../../core/state/DataContext';
import { useCurrency } from '../../../core/state/CurrencyContext';
import { useModalStackLayer } from '../../../core/state/ModalStackContext';
import { modalBackdropProps, modalShellProps } from '../../../shared/lib/modalLayer';
import { IconComponent } from '../../../shared/components/IconComponent';
import { IconColorSubModal, NoteModal } from '../../../shared/components/submodals';
import { CalendarSubModal } from '../../../shared/components/submodals/CalendarSubModal';

interface AddSavingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  editId?: string | null;
}

const KIND_META = {
  goal: { label: 'Goal', color: '#EC4899', iconName: 'Target' },
  savings: { label: 'Fund', color: '#0EA5E9', iconName: 'Shield' },
} as const;

/** Downscale an uploaded photo so the data URL stays small enough for localStorage. */
const readAndResizePhoto = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read the file'));
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const MAX = 640;
        const scale = Math.min(MAX / img.width, MAX / img.height, 1);
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(Math.round(img.width * scale), 1);
        canvas.height = Math.max(Math.round(img.height * scale), 1);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas unavailable'));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = () => reject(new Error('Not a readable image'));
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });

export const AddSavingsModal: React.FC<AddSavingsModalProps> = ({ isOpen, onClose, editId }) => {
  const { addSavings, updateSavings, savings } = useData();
  const { mainCurrencySymbol } = useCurrency();

  const [kind, setKind] = useState<'goal' | 'savings'>('goal');
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [accountId, setAccountId] = useState('');
  const [note, setNote] = useState('');
  /** Optional goal deadline as a date-only string (empty = none). */
  const [deadline, setDeadline] = useState('');
  const [iconName, setIconName] = useState<string>(KIND_META.goal.iconName);
  const [color, setColor] = useState<string>(KIND_META.goal.color);
  const [iconTouched, setIconTouched] = useState(false);

  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showPictureModal, setShowPictureModal] = useState(false);
  const [showDeadlineModal, setShowDeadlineModal] = useState(false);
  const [showIconModal, setShowIconModal] = useState(false);
  const [calcKeyboardOpen, setCalcKeyboardOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stacked layer so the picture picker always sits above this modal.
  const pictureLayer = useModalStackLayer(showPictureModal);

  useEffect(() => {
    if (!isOpen) {
      setCalcKeyboardOpen(false);
      return;
    }
    if (editId) {
      const existing = savings.find((s) => s.id === editId);
      if (existing) {
        setKind(existing.kind === 'savings' ? 'savings' : 'goal');
        setName(existing.name || '');
        setTarget(existing.target.toString());
        setPhotoUrl(existing.photoUrl || '');
        setAccountId(existing.accountId);
        setNote(existing.note || '');
        setDeadline(existing.endDate ? existing.endDate.split('T')[0] : '');
        setIconName(existing.iconName || KIND_META.goal.iconName);
        setColor(existing.color || KIND_META.goal.color);
        setIconTouched(true);
      }
      return;
    }
    setKind('goal');
    setName('');
    setTarget('');
    setPhotoUrl('');
    setAccountId('');
    setNote('');
    setDeadline('');
    setIconName(KIND_META.goal.iconName);
    setColor(KIND_META.goal.color);
    setIconTouched(false);
  }, [editId, isOpen, savings]);

  const kindMeta = KIND_META[kind];
  const hasPicture = Boolean(photoUrl);

  const selectKind = (next: 'goal' | 'savings') => {
    setKind(next);
    // Follow the kind's default accent until the user picks their own.
    if (!iconTouched) {
      setIconName(KIND_META[next].iconName);
      setColor(KIND_META[next].color);
    }
  };

  const handlePhotoPick = async (file: File | undefined) => {
    if (!file) return;
    try {
      setPhotoUrl(await readAndResizePhoto(file));
    } catch {
      // Unreadable file — leave the current picture untouched.
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedTarget = parseFloat(target);
    if (!Number.isFinite(parsedTarget) || parsedTarget <= 0) return;

    const trimmedName = name.trim() || (kind === 'goal' ? 'New goal' : 'New fund');
    // Deadlines only apply to goals; empty means no deadline.
    const endDate = kind === 'goal' && deadline ? deadline : '';

    if (editId) {
      updateSavings(editId, {
        name: trimmedName,
        kind,
        photoUrl,
        target: parsedTarget,
        accountId,
        note,
        iconName,
        color,
        endDate,
      });
    } else {
      addSavings({
        name: trimmedName,
        kind,
        photoUrl,
        target: parsedTarget,
        accountId,
        current: 0,
        note,
        color,
        iconName,
        period: 'yearly',
        startDate: new Date().toISOString(),
        endDate,
      });
    }
    onClose();
  };

  return (
    <>
      <CompactFormModal
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={handleSubmit}
        title={`${editId ? 'Edit' : 'Add'} ${kindMeta.label}`}
        accent={kindMeta.color}
        headerTint="#ec4899"
      >
        <div className="space-y-4">
          {/* Picture display — sits above the amount like the account card preview */}
          <button
            type="button"
            onClick={() => setShowPictureModal(true)}
            title="Choose a picture"
            className="relative flex h-24 w-full items-center justify-center overflow-hidden rounded-xl border shadow-sm transition-colors"
            style={
              hasPicture
                ? { borderColor: `${kindMeta.color}66` }
                : { borderColor: 'var(--border)', backgroundColor: `${kindMeta.color}0D` }
            }
          >
            {photoUrl ? (
              <>
                <img src={photoUrl} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
                <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-black/45 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
                  <ImagePlus size={12} strokeWidth={2.25} /> Edit picture
                </span>
              </>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${kindMeta.color}20`, color: kindMeta.color }}
                >
                  <Camera size={18} strokeWidth={2.25} />
                </span>
                <span className="text-xs font-medium text-foreground">Add a picture</span>
              </div>
            )}
          </button>

          {/* Target amount */}
          <Calculator
            variant="record"
            value={target}
            onChange={setTarget}
            currencySymbol={mainCurrencySymbol}
            displayColor="green"
            keyboardOpen={calcKeyboardOpen}
            onKeyboardOpenChange={setCalcKeyboardOpen}
          />

          {/* While the keypad is open it temporarily replaces the rest of the form */}
          <AnimatePresence initial={false} mode="wait">
          {calcKeyboardOpen ? (
            <motion.div
              key="savings-keypad"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              <CalculatorKeypad value={target} onChange={setTarget} />
            </motion.div>
          ) : (
            <motion.div
              key="savings-form"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="space-y-4"
            >
          {/* Kind selector — icon-only capsule; the header spells out the kind */}
          <CapsuleSelector
            id="savings-kind"
            iconOnly
            value={kind}
            onChange={selectKind}
            options={[
              { value: 'goal', label: 'Goal', icon: <Trophy size={16} />, color: KIND_META.goal.color },
              { value: 'savings', label: 'Fund', icon: <ShieldCheck size={16} />, color: KIND_META.savings.color },
            ]}
          />

          {/* Name + icon chooser */}
          <div className="flex gap-2">
            <Input
              className="h-12 min-w-0 flex-1 rounded-xl border border-border bg-input-background px-4 text-sm shadow-md"
              placeholder={kind === 'goal' ? 'What are you saving for?' : 'Name this fund'}
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

          {/* Fields — deadline (goals only) and note stacked vertically */}
          <div className="space-y-2">
            {/* Goals can carry an optional deadline; funds have none */}
            {kind === 'goal' && (
              <div className="relative">
                <PickerRow
                  icon={<CalendarClock size={17} />}
                  label="Deadline"
                  value={
                    deadline
                      ? new Date(deadline).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : undefined
                  }
                  placeholder="Optional"
                  color={KIND_META.goal.color}
                  onClick={() => setShowDeadlineModal(true)}
                />
                {deadline && (
                  <button
                    type="button"
                    onClick={() => setDeadline('')}
                    title="Clear deadline"
                    aria-label="Clear deadline"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
                  >
                    <X size={13} strokeWidth={2.25} />
                  </button>
                )}
              </div>
            )}

            <PickerRow
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

      <NoteModal
        isOpen={showNoteModal}
        onClose={() => setShowNoteModal(false)}
        note={note}
        onNoteChange={setNote}
      />

      {/* Picture: photo upload or emoji — stacked so it layers above this modal */}
      <AnimatePresence>
        {showPictureModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPictureModal(false)}
              {...modalBackdropProps(pictureLayer)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              {...modalShellProps(pictureLayer)}
            >
              <div className="bg-card border border-border rounded-2xl w-full max-w-md max-h-[95vh] overflow-hidden flex flex-col shadow-2xl">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/50 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowPictureModal(false)}
                    className="p-1.5 hover:bg-muted rounded-lg transition-colors text-foreground"
                  >
                    <X size={16} />
                  </button>
                  <h2 className="font-bold text-base text-center flex-1">Picture</h2>
                  <button
                    type="button"
                    onClick={() => setShowPictureModal(false)}
                    className="p-1.5 hover:bg-primary/20 rounded-lg transition-colors text-primary"
                  >
                    <Check size={16} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      void handlePhotoPick(e.target.files?.[0]);
                      e.target.value = '';
                    }}
                  />

                  {photoUrl ? (
                    <div className="relative overflow-hidden rounded-2xl border border-border/50">
                      <img src={photoUrl} alt="Savings picture" className="h-36 w-full object-cover" />
                      <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1.5 bg-gradient-to-t from-black/55 to-transparent p-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-foreground shadow-sm hover:bg-white"
                        >
                          <ImagePlus size={11} strokeWidth={2.5} />
                          Replace
                        </button>
                        <button
                          type="button"
                          onClick={() => setPhotoUrl('')}
                          className="flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-destructive shadow-sm hover:bg-white"
                        >
                          <Trash2 size={11} strokeWidth={2.5} />
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex h-24 w-full flex-col items-center justify-center gap-1.5 rounded-2xl border border-dashed border-border bg-muted/20 transition-colors hover:border-pink-500/40 hover:bg-pink-500/5"
                    >
                      <ImagePlus size={20} className="text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground">
                        Upload a photo of what you're saving for
                      </span>
                    </button>
                  )}

                  <p className="text-[10px] text-muted-foreground">
                    No photo? The icon you picked next to the name is shown instead.
                  </p>

                  <button
                    type="button"
                    onClick={() => setShowPictureModal(false)}
                    className="w-full rounded-lg bg-primary px-2.5 py-1.5 text-sm font-semibold text-white hover:bg-primary/90"
                  >
                    Done
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Deadline picker */}
      <CalendarSubModal
        isOpen={showDeadlineModal}
        onClose={() => setShowDeadlineModal(false)}
        onSelectDate={(date: Date) => setDeadline(date.toISOString().split('T')[0])}
        selectedDate={deadline ? new Date(deadline) : new Date()}
      />

      {/* Icon + color chooser */}
      <IconColorSubModal
        isOpen={showIconModal}
        onClose={() => setShowIconModal(false)}
        title="Icon"
        selectedIcon={iconName}
        selectedColor={color}
        onIconChange={(next: string) => {
          setIconName(next);
          setIconTouched(true);
        }}
        onColorChange={(next: string) => {
          setColor(next);
          setIconTouched(true);
        }}
      />

    </>
  );
};
