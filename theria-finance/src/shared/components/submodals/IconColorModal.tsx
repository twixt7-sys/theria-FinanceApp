import React, { useState, useMemo } from 'react';
import { Check, Search, ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { IconComponent } from '../IconComponent';

interface IconColorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  selectedIcon: string;
  selectedColor: string;
  onIconChange: (icon: string) => void;
  onColorChange: (color: string) => void;
}

// Organized icon categories with representative icons
const ICON_CATEGORIES = {
  essentials: { icon: 'Home', items: ['Home', 'User', 'Settings', 'Bell', 'Search', 'Menu', 'X', 'Plus', 'Minus', 'Check', 'Info', 'HelpCircle', 'AlertCircle'] },
  finance: { icon: 'Wallet', items: ['Wallet', 'CreditCard', 'DollarSign', 'TrendingUp', 'TrendingDown', 'BarChart3', 'PieChart', 'Activity', 'Target', 'Award', 'Trophy', 'Medal', 'PiggyBank'] },
  shopping: { icon: 'ShoppingCart', items: ['ShoppingCart', 'ShoppingBag', 'Package', 'Box', 'Archive', 'Tag', 'Percent', 'Gift', 'Heart', 'Star', 'Diamond', 'Crown', 'Gem'] },
  food: { icon: 'Utensils', items: ['Utensils', 'Coffee', 'Pizza', 'Cookie', 'Apple', 'Cherry', 'Milk', 'Beer', 'Wine', 'Droplet', 'Flame'] },
  transport: { icon: 'Car', items: ['Car', 'Plane', 'Navigation', 'MapPin', 'Compass', 'Map'] },
  technology: { icon: 'Smartphone', items: ['Smartphone', 'Laptop', 'Monitor', 'Tv', 'Camera', 'Headphones', 'Wifi', 'Battery', 'Zap', 'Server', 'Database', 'Cloud', 'Download', 'Upload'] },
  entertainment: { icon: 'Gamepad2', items: ['Gamepad2', 'Music', 'Film', 'Radio', 'Play', 'Pause', 'SkipBack', 'SkipForward', 'Repeat', 'Shuffle', 'Volume2'] },
  health: { icon: 'Heart', items: ['Heart', 'Pill', 'Stethoscope', 'Thermometer', 'Activity', 'Eye', 'Ear', 'Hand', 'Footprints', 'Dumbbell'] },
  nature: { icon: 'TreePine', items: ['TreePine', 'Flower', 'Sun', 'Moon', 'Cloud', 'Wind', 'Droplet', 'Flame'] },
  animals: { icon: 'Dog', items: ['Dog', 'Cat', 'Fish', 'Bird', 'Bug'] },
  work: { icon: 'Briefcase', items: ['Briefcase', 'Laptop', 'FileText', 'Calendar', 'Clock', 'Users', 'UserPlus', 'Mail', 'Phone', 'MessageSquare'] },
  creative: { icon: 'Paintbrush', items: ['PenTool', 'Paintbrush', 'Eraser', 'Scissors', 'Ruler', 'Palette', 'Image', 'Type', 'Bold', 'Italic', 'Underline'] },
  tools: { icon: 'Wrench', items: ['Wrench', 'Hammer', 'Settings', 'Lock', 'Unlock', 'Key', 'Shield'] },
  shapes: { icon: 'Circle', items: ['Circle', 'Square', 'Triangle', 'Hexagon', 'Star', 'Diamond', 'Plus', 'Minus', 'X', 'Divide', 'Equal'] },
  arrows: { icon: 'ArrowUp', items: ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'ChevronLeft', 'ChevronRight', 'ChevronUp', 'ChevronDown', 'ArrowUpLeft', 'ArrowUpRight', 'ArrowDownLeft', 'ArrowDownRight', 'Move', 'RotateCw', 'RotateCcw'] },
  misc: { icon: 'Bookmark', items: ['Bookmark', 'Flag', 'Anchor', 'Magnet', 'Lightbulb', 'Fingerprint', 'IdCard', 'Globe'] }
};

// Comprehensive color palette organized by standard color wheel arrangement - removing super light and super dark shades
const COLOR_CATEGORIES = {
  red: {
    name: 'Red',
    colors: ['#EF4444', '#DC2626', '#B91C1C', '#991B1B', '#7F1D1D'],
    middle: '#DC2626'
  },
  orange: {
    name: 'Orange',
    colors: ['#F97316', '#EA580C', '#C2410C', '#9A3412', '#7C2D12'],
    middle: '#EA580C'
  },
  amber: {
    name: 'Amber',
    colors: ['#FBBF24', '#F59E0B', '#D97706', '#B45309', '#92400E'],
    middle: '#F59E0B'
  },
  yellow: {
    name: 'Yellow',
    colors: ['#FACC15', '#EAB308', '#CA8A04', '#A16207', '#854D0E'],
    middle: '#EAB308'
  },
  lime: {
    name: 'Lime',
    colors: ['#A3E635', '#84CC16', '#65A30D', '#4D7C0F', '#365314'],
    middle: '#84CC16'
  },
  green: {
    name: 'Green',
    colors: ['#22C55E', '#16A34A', '#15803D', '#166534', '#14532D'],
    middle: '#16A34A'
  },
  emerald: {
    name: 'Emerald',
    colors: ['#10B981', '#059669', '#047857', '#065F46', '#064E3B'],
    middle: '#10B981'
  },
  teal: {
    name: 'Teal',
    colors: ['#14B8A6', '#0D9488', '#0F766E', '#115E59', '#134E4A'],
    middle: '#14B8A6'
  },
  cyan: {
    name: 'Cyan',
    colors: ['#06B6D4', '#0891B2', '#0E7490', '#155E75', '#164E63'],
    middle: '#06B6D4'
  },
  sky: {
    name: 'Sky',
    colors: ['#38BDF8', '#0EA5E9', '#0284C7', '#0369A1', '#075985'],
    middle: '#0EA5E9'
  },
  blue: {
    name: 'Blue',
    colors: ['#3B82F6', '#2563EB', '#1D4ED8', '#1E40AF', '#1E3A8A'],
    middle: '#2563EB'
  },
  indigo: {
    name: 'Indigo',
    colors: ['#6366F1', '#4F46E5', '#4338CA', '#3730A3', '#312E81'],
    middle: '#4F46E5'
  },
  violet: {
    name: 'Violet',
    colors: ['#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6', '#4C1D95'],
    middle: '#7C3AED'
  },
  fuchsia: {
    name: 'Fuchsia',
    colors: ['#E879F9', '#D946EF', '#C026D3', '#A21CAF', '#86198F'],
    middle: '#D946EF'
  },
  pink: {
    name: 'Pink',
    colors: ['#EC4899', '#DB2777', '#BE185D', '#9F1239', '#831843'],
    middle: '#DB2777'
  },
  rose: {
    name: 'Rose',
    colors: ['#FB7185', '#F43F5E', '#E11D48', '#BE123C', '#9F1239'],
    middle: '#F43F5E'
  },
  slate: {
    name: 'Slate',
    colors: ['#94A3B8', '#64748B', '#475569', '#334155', '#1E293B'],
    middle: '#64748B'
  },
  gray: {
    name: 'Gray',
    colors: ['#9CA3AF', '#6B7280', '#4B5563', '#374151', '#1F2937'],
    middle: '#6B7280'
  },
  zinc: {
    name: 'Zinc',
    colors: ['#A1A1AA', '#71717A', '#52525B', '#3F3F46', '#27272A'],
    middle: '#71717A'
  },
  neutral: {
    name: 'Neutral',
    colors: ['#D4D4D4', '#A3A3A3', '#737373', '#525252', '#404040'],
    middle: '#A3A3A3'
  }
};

export const IconColorModal: React.FC<IconColorModalProps> = ({
  isOpen,
  onClose,
  title,
  selectedIcon,
  selectedColor,
  onIconChange,
  onColorChange
}) => {
  const [activeIconCategory, setActiveIconCategory] = useState<string>('essentials');
  const [searchQuery, setSearchQuery] = useState('');
  const [iconPage, setIconPage] = useState(0);
  const [colorPage, setColorPage] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const ITEMS_PER_PAGE = 6;
  const ICONS_PER_ROW = 5;
  const MIN_ICON_ROWS = 2;
  const ICONS_PER_PAGE = ICONS_PER_ROW * MIN_ICON_ROWS; // 10 icons per page
  
  // Filter icons based on search
  const filteredIcons = useMemo(() => {
    if (!searchQuery) return ICON_CATEGORIES[activeIconCategory as keyof typeof ICON_CATEGORIES]?.items || [];
    
    const allIcons = Object.values(ICON_CATEGORIES).flatMap(cat => cat.items);
    return allIcons.filter(icon => 
      icon.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [activeIconCategory, searchQuery]);

  // Pagination for icon categories
  const iconCategoryKeys = Object.keys(ICON_CATEGORIES);
  const totalIconPages = Math.ceil(iconCategoryKeys.length / ITEMS_PER_PAGE);
  const currentIconCategories = iconCategoryKeys.slice(
    iconPage * ITEMS_PER_PAGE, 
    (iconPage + 1) * ITEMS_PER_PAGE
  );
  
  // Pagination for icons
  const [iconGridPage, setIconGridPage] = useState(0);
  const totalIconGridPages = Math.ceil(filteredIcons.length / ICONS_PER_PAGE);
  const currentIcons = filteredIcons.slice(
    iconGridPage * ICONS_PER_PAGE,
    (iconGridPage + 1) * ICONS_PER_PAGE
  );
  
  // Pagination for color categories
  const colorCategoryKeys = Object.keys(COLOR_CATEGORIES);
  const COLORS_PER_PAGE = 8;
  const totalColorPages = Math.ceil(colorCategoryKeys.length / COLORS_PER_PAGE);
  const currentColorCategories = colorCategoryKeys.slice(
    colorPage * COLORS_PER_PAGE, 
    (colorPage + 1) * COLORS_PER_PAGE
  );

  // Handle color page navigation with transitions
  const handleColorPageChange = (newPage: number) => {
    if (newPage !== colorPage && !isTransitioning) {
      setIsTransitioning(true);
      setTimeout(() => {
        setColorPage(newPage);
        setTimeout(() => setIsTransitioning(false), 30);
      }, 80);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-2"
          >
            <div className="bg-card border border-border rounded-2xl w-full max-w-md max-h-[95vh] overflow-hidden flex flex-col shadow-2xl">
              {/* Header */}
              <motion.div
                className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/50 shrink-0"
              >
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 hover:bg-muted rounded-lg transition-colors text-foreground"
                >
                  <X size={16} />
                </button>

                <h2 className="font-bold text-base text-center flex-1">{title}</h2>

                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 hover:bg-primary/20 rounded-lg transition-colors text-primary"
                >
                  <Check size={16} />
                </button>
              </motion.div>

              {/* Content */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex-1 overflow-y-auto p-4 space-y-4"
              >
                {/* Dual Preview Section */}
                <div className="flex items-center justify-center gap-4 p-3 bg-muted/20 rounded-lg border">
                  <div className="text-center">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-md"
                      style={{ backgroundColor: selectedColor }}
                    >
                      <IconComponent
                        name={selectedIcon}
                        style={{ color: '#ffffff' }}
                        size={24}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Solid</p>
                  </div>
                  <div className="text-center">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-md"
                      style={{ backgroundColor: `${selectedColor}20` }}
                    >
                      <IconComponent
                        name={selectedIcon}
                        style={{ color: selectedColor }}
                        size={24}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Subtle</p>
                  </div>
                </div>

                {/* Icon Selection */}
                <div className="space-y-3">
                  {/* Divider */}
                  <div className="h-px bg-border/60" />

                  {/* Search Bar */}
                  <div className="relative">
                    <Search size={14} className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search icons..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-2.5 py-1.5 border border-border rounded-md bg-input-background text-xs focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary shadow-sm"
                    />
                  </div>

                  {/* Icon Category Navigation with Arrows and Animations */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIconPage(Math.max(0, iconPage - 1))}
                      disabled={iconPage === 0}
                      className="p-1.5 rounded-md border border-border bg-card hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeftIcon size={16} />
                    </button>
                    
                    <div className="flex gap-2 flex-1 justify-center overflow-hidden">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={`icon-page-${iconPage}`}
                          initial={{ opacity: 0, x: 50 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -50 }}
                          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                          className="flex gap-2"
                        >
                          {currentIconCategories.map((key) => (
                            <motion.button
                              key={key}
                              type="button"
                              onClick={() => {
                                setActiveIconCategory(key);
                                setSearchQuery('');
                                setIconGridPage(0); // Reset icon grid page when changing category
                              }}
                              className={`flex items-center gap-1 px-1.5 py-1 rounded-md text-xs font-medium capitalize transition-all ${
                              activeIconCategory === key && !searchQuery
                                ? 'bg-primary text-white shadow-sm shadow-primary/20 border border-border'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80 border border-border shadow-sm'
                            }`}
                              title={key}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <IconComponent name={ICON_CATEGORIES[key as keyof typeof ICON_CATEGORIES].icon} size={14} />
                            </motion.button>
                          ))}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => setIconPage(Math.min(totalIconPages - 1, iconPage + 1))}
                      disabled={iconPage === totalIconPages - 1}
                      className="p-1.5 rounded-md border border-border bg-card hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRightIcon size={16} />
                    </button>
                  </div>

                  {/* Icons Grid - Fixed height with integrated pagination */}
                  <div className="relative h-40 overflow-hidden border border-border rounded-md bg-muted/10 shadow-sm">
                    <div className="grid grid-cols-5 gap-2 justify-items-center p-3 pb-10">
                      {currentIcons.map((icon) => (
                        <motion.button
                          key={icon}
                          type="button"
                          onClick={() => onIconChange(icon)}
                          className={`w-10 h-10 rounded-lg border-2 transition-all flex items-center justify-center ${
                            selectedIcon === icon
                              ? 'border-primary bg-primary/10 shadow-sm shadow-primary/20'
                              : 'border-border hover:border-primary/50 hover:bg-muted shadow-sm'
                          }`}
                          title={icon}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <IconComponent name={icon} size={18} />
                        </motion.button>
                      ))}
                    </div>
                    
                    {currentIcons.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <p className="text-xs">No icons found for "{searchQuery}"</p>
                      </div>
                    )}
                    
                    {/* Integrated Pagination */}
                    {totalIconGridPages > 1 && (
                      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between p-2 bg-gradient-to-t from-card to-transparent">
                        <button
                          type="button"
                          onClick={() => setIconGridPage(Math.max(0, iconGridPage - 1))}
                          disabled={iconGridPage === 0}
                          className="p-1.5 rounded-md border border-border bg-card/90 hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronLeftIcon size={12} />
                        </button>
                        
                        <div className="flex gap-1">
                          {Array.from({ length: totalIconGridPages }, (_, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => setIconGridPage(index)}
                              className={`w-1.5 h-1.5 rounded-full transition-all ${
                                iconGridPage === index
                                  ? 'bg-primary'
                                  : 'bg-muted hover:bg-muted-foreground/50'
                              }`}
                              aria-label={`Go to icon grid page ${index + 1}`}
                            />
                          ))}
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => setIconGridPage(Math.min(totalIconGridPages - 1, iconGridPage + 1))}
                          disabled={iconGridPage === totalIconGridPages - 1}
                          className="p-1.5 rounded-md border border-border bg-card/90 hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronRightIcon size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Color Selection */}
                <div className="space-y-2">
                  {/* Divider */}
                  <div className="h-px bg-border/60" />
                  
                  {/* Color Category Navigation - With transitions */}
                  <div className={`p-1 flex gap-1 justify-between overflow-hidden transition-all duration-150 ease-out ${
                    isTransitioning ? 'opacity-50 transform scale-98' : 'opacity-100 transform scale-100'
                  }`}>
                    <div className="flex gap-1 justify-between transition-all duration-150 ease-out w-full">
                      {currentColorCategories.map((key) => {
                        const category = COLOR_CATEGORIES[key as keyof typeof COLOR_CATEGORIES];
                        return (
                          <div 
                            key={key} 
                            className="flex flex-col gap-0.5 items-center flex-shrink-0 transition-all duration-150 ease-out"
                          >
                            {/* Vertical color list - brightest to darkest */}
                            <div className="flex flex-col gap-0.5">
                              {category.colors.map((color) => (
                                <button
                                  key={color}
                                  type="button"
                                  onClick={() => onColorChange(color)}
                                  className={`w-6 h-6 rounded-lg border-2 transition-all flex-shrink-0 ${
                                selectedColor === color
                                    ? 'border-foreground scale-110 shadow-md shadow-black/10'
                                    : 'border-border hover:scale-105 shadow-sm'
                              }`}
                                  style={{ backgroundColor: color }}
                                  title={color}
                                >
                                  {selectedColor === color && <Check className="mx-auto text-white" size={12} strokeWidth={3} />}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Navigation Arrows and Dots */}
                  <div className="flex items-center justify-between gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => handleColorPageChange(Math.max(0, colorPage - 1))}
                      disabled={colorPage === 0}
                      className="px-6 py-2 rounded-md border border-border bg-card hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                    >
                      <ChevronLeftIcon size={16} />
                    </button>
                    
                    {/* Pagination Dots - Centered */}
                    <div className="flex justify-center gap-1.5 flex-1">
                      {Array.from({ length: totalColorPages }, (_, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleColorPageChange(index)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            colorPage === index
                              ? 'bg-primary w-6'
                              : 'bg-muted hover:bg-muted-foreground/50'
                          }`}
                          aria-label={`Go to color page ${index + 1}`}
                        />
                      ))}
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => handleColorPageChange(Math.min(totalColorPages - 1, colorPage + 1))}
                      disabled={colorPage === totalColorPages - 1}
                      className="px-6 py-2 rounded-md border border-border bg-card hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                    >
                      <ChevronRightIcon size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
