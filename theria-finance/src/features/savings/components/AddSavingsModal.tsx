import React, { useEffect, useRef, useState } from 'react';
import { Camera, Check, ImagePlus, MessageSquare, ShieldCheck, Trash2, Trophy, Wallet, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { CompactFormModal } from '../../../shared/components/CompactFormModal';
import { Calculator, CalculatorKeypad } from '../../../shared/components/Calculator';
import { Input } from '../../../shared/components/ui/input';
import { useData } from '../../../core/state/DataContext';
import { useModalStackLayer } from '../../../core/state/ModalStackContext';
import { modalBackdropProps, modalShellProps } from '../../../shared/lib/modalLayer';
import { IconComponent } from '../../../shared/components/IconComponent';
import { IconColorSubModal, NoteModal, SelectionSubModal } from '../../../shared/components/submodals';
import { AddAccountModal } from '../../account_management/components/AddAccountModal';

interface AddSavingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  editId?: string | null;
}

/** Curated emoji pictures for savings — shown on the cards. */
const SAVINGS_EMOJIS = ['🎯', '🛟', '☔', '🚗', '🏠', '✈️', '🏝️', '💍', '📱', '💻', '🎓', '📚', '🎸', '🛵', '⌚', '🎁', '👶', '🐶', '🧾', '💼'];

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
  const { accounts, addSavings, updateSavings, savings } = useData();

  const [kind, setKind] = useState<'goal' | 'savings'>('goal');
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [emoji, setEmoji] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [accountId, setAccountId] = useState('');
  const [note, setNote] = useState('');
  const [iconName, setIconName] = useState<string>(KIND_META.goal.iconName);
  const [color, setColor] = useState<string>(KIND_META.goal.color);
  const [iconTouched, setIconTouched] = useState(false);

  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showPictureModal, setShowPictureModal] = useState(false);
  const [showIconModal, setShowIconModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
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
        setEmoji(existing.emoji || '');
        setPhotoUrl(existing.photoUrl || '');
        setAccountId(existing.accountId);
        setNote(existing.note || '');
        setIconName(existing.iconName || KIND_META.goal.iconName);
        setColor(existing.color || KIND_META.goal.color);
        setIconTouched(true);
      }
      return;
    }
    setKind('goal');
    setName('');
    setTarget('');
    setEmoji('');
    setPhotoUrl('');
    setAccountId('');
    setNote('');
    setIconName(KIND_META.goal.iconName);
    setColor(KIND_META.goal.color);
    setIconTouched(false);
  }, [editId, isOpen, savings]);

  const account = accounts.find((a) => a.id === accountId);
  const kindMeta = KIND_META[kind];
  const hasPicture = Boolean(photoUrl || emoji);

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
    if (!accountId || !Number.isFinite(parsedTarget) || parsedTarget <= 0) return;

    const trimmedName = name.trim() || (kind === 'goal' ? 'New goal' : 'New fund');

    if (editId) {
      updateSavings(editId, {
        name: trimmedName,
        kind,
        emoji,
        photoUrl,
        target: parsedTarget,
        accountId,
        note,
        iconName,
        color,
      });
    } else {
      const now = new Date();
      addSavings({
        name: trimmedName,
        kind,
        emoji,
        photoUrl,
        target: parsedTarget,
        accountId,
        current: 0,
        note,
        color,
        iconName,
        period: 'yearly',
        startDate: now.toISOString(),
        endDate: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString(),
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
        title={editId ? 'Edit Savings' : 'Add Savings'}
        bottomSlot={
          <AnimatePresence initial={false}>
            {calcKeyboardOpen && (
              <motion.div
                key="savings-calc-keypad"
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ type: 'spring', damping: 26, stiffness: 340 }}
                className="pointer-events-auto w-90 max-w-md rounded-2xl border border-border bg-card/95 p-3 shadow-2xl backdrop-blur-sm"
                onClick={(e) => e.stopPropagation()}
              >
                <CalculatorKeypad value={target} onChange={setTarget} />
              </motion.div>
            )}
          </AnimatePresence>
        }
      >
        <div className="space-y-4">
          {/* Target amount */}
          <Calculator
            variant="record"
            value={target}
            onChange={setTarget}
            displayColor="green"
            keyboardOpen={calcKeyboardOpen}
            onKeyboardOpenChange={setCalcKeyboardOpen}
          />

          {/* Kind banner */}
          <div
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm text-white shadow-md"
            style={{ backgroundColor: kindMeta.color, borderColor: kindMeta.color }}
          >
            <span className="text-sm font-semibold">{kindMeta.label}</span>
          </div>

          {/* Kind buttons */}
          <div className="flex gap-2">
            {(
              [
                { key: 'goal', icon: <Trophy size={18} />, label: 'Goal', active: 'bg-pink-500/10 border-pink-500/20 text-pink-500' },
                { key: 'savings', icon: <ShieldCheck size={18} />, label: 'Fund', active: 'bg-sky-500/10 border-sky-500/20 text-sky-500' },
              ] as const
            ).map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => selectKind(option.key)}
                className={`flex-1 h-12 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md ${
                  kind === option.key
                    ? option.active
                    : 'bg-card border-border text-muted-foreground hover:bg-muted'
                }`}
              >
                {option.icon}
                <span>{option.label}</span>
              </button>
            ))}
          </div>

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

          <div className="my-4 h-px w-full bg-border/80" />

          {/* Note, Picture, Account cluster */}
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setShowNoteModal(true)}
              className={`h-20 rounded-xl border border-border transition-colors flex flex-col items-center justify-center gap-1 text-sm font-semibold shadow-sm ${
                note ? 'bg-green-500/10 border-green-500/20' : 'bg-card hover:bg-muted'
              }`}
              title="Add note"
            >
              <MessageSquare size={18} className={note ? 'text-green-500' : 'text-muted-foreground'} />
              <span className={`text-xs ${note ? 'text-green-500 font-medium' : 'text-muted-foreground'}`}>
                {note ? 'Edit note' : 'Note'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setShowPictureModal(true)}
              className={`relative h-20 overflow-hidden rounded-xl border transition-colors flex flex-col items-center justify-center gap-1 text-sm font-semibold shadow-sm ${
                hasPicture ? 'border-pink-500/30' : 'border-border bg-card hover:bg-muted'
              }`}
              title="Choose a picture"
            >
              {photoUrl ? (
                <>
                  <img src={photoUrl} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
                  <span className="absolute inset-x-0 bottom-0 bg-black/45 py-0.5 text-center text-[10px] font-medium text-white backdrop-blur-sm">
                    Edit picture
                  </span>
                </>
              ) : emoji ? (
                <>
                  <span className="text-2xl leading-none" aria-hidden>{emoji}</span>
                  <span className="text-xs font-medium text-pink-500">Picture</span>
                </>
              ) : (
                <>
                  <Camera size={18} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Picture</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowAccountModal(true)}
              className="flex h-20 flex-col items-center justify-center gap-1 rounded-xl border px-2 text-center shadow-sm transition-colors"
              style={{
                backgroundColor: account ? `${account.color}20` : undefined,
                borderColor: account ? account.color : 'var(--border)',
              }}
              title="Choose account"
            >
              {account ? (
                <IconComponent name={account.iconName} size={18} style={{ color: account.color }} />
              ) : (
                <Wallet size={18} className="text-muted-foreground" />
              )}
              <span className="w-full truncate text-xs font-medium text-foreground">
                {account ? account.name : 'Account'}
              </span>
            </button>
          </div>
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

                  <div>
                    <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Or pick an emoji
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {SAVINGS_EMOJIS.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setEmoji(emoji === option ? '' : option)}
                          aria-pressed={emoji === option}
                          className={`flex h-8 w-8 items-center justify-center rounded-full text-base transition-all ${
                            emoji === option
                              ? 'bg-pink-500/15 ring-2 ring-pink-500 scale-110'
                              : 'hover:bg-muted'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                    {photoUrl && (
                      <p className="mt-1.5 text-[10px] text-muted-foreground">
                        The photo is shown on the card; the emoji is a fallback.
                      </p>
                    )}
                  </div>

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

      {/* Account picker */}
      <SelectionSubModal
        isOpen={showAccountModal}
        onClose={() => setShowAccountModal(false)}
        onSubmit={() => setShowAccountModal(false)}
        title="Choose Account"
        items={accounts}
        selectedItem={accountId}
        onSelectItem={(id: string) => {
          setAccountId(id);
          setShowAccountModal(false);
        }}
        showCategories={true}
        onAddItem={() => setShowAddAccountModal(true)}
        addItemLabel="Add Account"
      />

      <AddAccountModal
        isOpen={showAddAccountModal}
        onClose={() => setShowAddAccountModal(false)}
      />
    </>
  );
};
