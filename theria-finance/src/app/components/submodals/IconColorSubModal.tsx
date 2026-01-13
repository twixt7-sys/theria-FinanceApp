import React, { useState, useMemo, useRef } from 'react';
import { Check, Search, Palette, Grid3X3, Heart, Briefcase, Home, Car, ShoppingCart, Coffee, Utensils, Plane, Gamepad2, Dumbbell, BookOpen, Music, Film, Camera, Smartphone, Laptop, Tv, Radio, Headphones, Wifi, Battery, Zap, Lightbulb, Flame, Droplet, Wind, Sun, Moon, Cloud, TreePine, Flower, Apple, Cherry, Pizza, Cookie, Milk, Beer, Wine, Pill, Stethoscope, Thermometer, Eye, Ear, Hand, Footprints, Dog, Cat, Fish, Bird, Bug, Shirt, Package, Box, Archive, FileText, FileImage, FileVideo, FileAudio, Download, Upload, Share2, Link, Mail, Phone, MessageSquare, Users, User, UserPlus, MapPin, Map, Compass, Navigation, Clock, Calendar, Bell, AlertCircle, Info, HelpCircle, Settings, Wrench, Hammer, Paintbrush, Eraser, Scissors, Ruler, PenTool, Type, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, ListOrdered, Indent, Outdent, Maximize2, Minimize2, Move, RotateCw, RotateCcw, FlipHorizontal, FlipVertical, Crop, Filter, Sliders, Volume2, VolumeX, Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, ArrowUpLeft, ArrowUpRight, ArrowDownLeft, ArrowDownRight, Circle, Square, Triangle, Hexagon, Star, Diamond, Plus, Minus, X, Divide, Equal, Percent, Hash, AtSign, DollarSign, CreditCard, Wallet, PiggyBank, TrendingUp, TrendingDown, BarChart3, PieChart, Activity, Target, Award, Trophy, Medal, Crown, Gem, Key, Lock, Unlock, Shield, EyeOff, Fingerprint, IdCard, Globe, Server, Database, CloudDownload, CloudUpload, Terminal, Code, GitBranch, Github, Gitlab, ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { IconComponent } from '../IconComponent';
import { SimpleFormModal } from '../SimpleFormModal';

interface IconColorSubModalProps {
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

// Comprehensive color palette organized by categories - sorted from brightest to darkest
const COLOR_CATEGORIES = {
  primary: {
    name: 'Primary',
    colors: ['#3B82F6', '#2563EB', '#1D4ED8', '#1E40AF', '#1E3A8A'],
    middle: '#2563EB'
  },
  secondary: {
    name: 'Secondary',
    colors: ['#6B7280', '#4B5563', '#374151', '#1F2937', '#111827'],
    middle: '#374151'
  },
  success: {
    name: 'Success',
    colors: ['#10B981', '#059669', '#047857', '#065F46', '#064E3B'],
    middle: '#047857'
  },
  warning: {
    name: 'Warning',
    colors: ['#F59E0B', '#D97706', '#B45309', '#92400E', '#78350F'],
    middle: '#B45309'
  },
  error: {
    name: 'Error',
    colors: ['#EF4444', '#DC2626', '#B91C1C', '#991B1B', '#7F1D1D'],
    middle: '#B91C1C'
  },
  info: {
    name: 'Info',
    colors: ['#06B6D4', '#0891B2', '#0E7490', '#155E75', '#164E63'],
    middle: '#0E7490'
  },
  purple: {
    name: 'Purple',
    colors: ['#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6', '#4C1D95'],
    middle: '#6D28D9'
  },
  pink: {
    name: 'Pink',
    colors: ['#EC4899', '#DB2777', '#BE185D', '#9F1239', '#831843'],
    middle: '#BE185D'
  },
  indigo: {
    name: 'Indigo',
    colors: ['#6366F1', '#4F46E5', '#4338CA', '#3730A3', '#312E81'],
    middle: '#4338CA'
  },
  teal: {
    name: 'Teal',
    colors: ['#14B8A6', '#0D9488', '#0F766E', '#115E59', '#134E4A'],
    middle: '#0F766E'
  },
  orange: {
    name: 'Orange',
    colors: ['#FB923C', '#F97316', '#EA580C', '#C2410C', '#9A3412'],
    middle: '#EA580C'
  },
  emerald: {
    name: 'Emerald',
    colors: ['#34D399', '#10B981', '#059669', '#047857', '#065F46'],
    middle: '#10B981'
  },
  rose: {
    name: 'Rose',
    colors: ['#FB7185', '#F43F5E', '#E11D48', '#BE123C', '#9F1239'],
    middle: '#E11D48'
  },
  cyan: {
    name: 'Cyan',
    colors: ['#22D3EE', '#06B6D4', '#0891B2', '#0E7490', '#155E75'],
    middle: '#06B6D4'
  },
  amber: {
    name: 'Amber',
    colors: ['#FCD34D', '#FBBF24', '#F59E0B', '#D97706', '#B45309'],
    middle: '#F59E0B'
  },
  lime: {
    name: 'Lime',
    colors: ['#BEF264', '#A3E635', '#84CC16', '#65A30D', '#4D7C0F'],
    middle: '#84CC16'
  },
  slate: {
    name: 'Slate',
    colors: ['#CBD5E1', '#94A3B8', '#64748B', '#475569', '#334155'],
    middle: '#64748B'
  }
};

export const IconColorSubModal: React.FC<IconColorSubModalProps> = ({
  isOpen,
  onClose,
  title,
  selectedIcon,
  selectedColor,
  onIconChange,
  onColorChange
}) => {
  const [activeIconCategory, setActiveIconCategory] = useState<string>('essentials');
  const [activeColorCategory, setActiveColorCategory] = useState<string>('primary');
  const [searchQuery, setSearchQuery] = useState('');
  const [iconPage, setIconPage] = useState(0);
  const [colorPage, setColorPage] = useState(0);
  const colorContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  
  const ITEMS_PER_PAGE = 7;
  
  // Pagination for icon categories
  const iconCategoryKeys = Object.keys(ICON_CATEGORIES);
  const totalIconPages = Math.ceil(iconCategoryKeys.length / ITEMS_PER_PAGE);
  const currentIconCategories = iconCategoryKeys.slice(
    iconPage * ITEMS_PER_PAGE, 
    (iconPage + 1) * ITEMS_PER_PAGE
  );
  
  // Pagination for color categories
  const colorCategoryKeys = Object.keys(COLOR_CATEGORIES);
  const totalColorPages = Math.ceil(colorCategoryKeys.length / ITEMS_PER_PAGE);
  const currentColorCategories = colorCategoryKeys.slice(
    colorPage * ITEMS_PER_PAGE, 
    (colorPage + 1) * ITEMS_PER_PAGE
  );

  // Filter icons based on search
  const filteredIcons = useMemo(() => {
    if (!searchQuery) return ICON_CATEGORIES[activeIconCategory as keyof typeof ICON_CATEGORIES]?.items || [];
    
    const allIcons = Object.values(ICON_CATEGORIES).flatMap(cat => cat.items);
    return allIcons.filter(icon => 
      icon.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [activeIconCategory, searchQuery]);

  return (
    <SimpleFormModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      className="max-w-2xl"
    >
      <div className="space-y-4">
        {/* Dual Preview Section */}
        <div className="flex items-center justify-center gap-4 p-3 bg-muted/20 rounded-lg border">
          <div className="text-center">
            <div 
              className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-md"
              style={{ backgroundColor: selectedColor }}
            >
              <IconComponent
                name={selectedIcon}
                style={{ color: '#ffffff' }}
                size={28}
              />
            </div>
            <p className="text-xs text-muted-foreground">Solid</p>
          </div>
          <div className="text-center">
            <div 
              className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-md"
              style={{ backgroundColor: `${selectedColor}20` }}
            >
              <IconComponent
                name={selectedIcon}
                style={{ color: selectedColor }}
                size={28}
              />
            </div>
            <p className="text-xs text-muted-foreground">Subtle</p>
          </div>
        </div>

        {/* Icon Selection */}
        <div className="space-y-3">
          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border/60" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Icons</span>
            <div className="h-px flex-1 bg-border/60" />
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search size={14} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search icons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 border border-border rounded-md bg-input-background text-xs focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary"
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
                      }}
                      className={`flex items-center gap-1 px-3 py-2 rounded-md text-xs font-medium capitalize transition-all ${
                      activeIconCategory === key && !searchQuery
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                      title={key}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <IconComponent name={ICON_CATEGORIES[key as keyof typeof ICON_CATEGORIES].icon} size={14} />
                      <span className="hidden sm:inline">{key}</span>
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

          {/* Icons Grid - Larger and centered */}
          <div className="max-h-48 overflow-y-auto border border-border rounded-md p-3 bg-muted/10">
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
              {filteredIcons.map((icon) => (
                <motion.button
                  key={icon}
                  type="button"
                  onClick={() => onIconChange(icon)}
                  className={`w-12 h-12 rounded-lg border-2 transition-all flex items-center justify-center ${
                    selectedIcon === icon
                      ? 'border-primary bg-primary/10 shadow-sm'
                      : 'border-border hover:border-primary/50 hover:bg-muted'
                  }`}
                  title={icon}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <IconComponent name={icon} size={20} />
                </motion.button>
              ))}
            </div>
            
            {filteredIcons.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-xs">No icons found for "{searchQuery}"</p>
              </div>
            )}
          </div>
        </div>

        {/* Color Selection */}
        <div className="space-y-3">
          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border/60" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Colors</span>
            <div className="h-px flex-1 bg-border/60" />
          </div>
          
          {/* Color Category Navigation with Swipe and Page Dots */}
          <div className="relative">
            <div 
              ref={colorContainerRef}
              className="overflow-hidden rounded-lg"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            >
              <div 
                className="flex gap-3 transition-transform duration-300 ease-out"
                style={{ 
                  transform: `translateX(calc(-${colorPage * 100}% + ${dragOffset}px))`,
                  width: `${totalColorPages * 100}%`
                }}
              >
                {Array.from({ length: totalColorPages }).map((_, pageIndex) => (
                  <div 
                    key={pageIndex} 
                    className="w-full flex gap-3 justify-center py-2"
                    style={{ minWidth: '100%' }}
                  >
                    {colorCategoryKeys.slice(
                      pageIndex * ITEMS_PER_PAGE, 
                      (pageIndex + 1) * ITEMS_PER_PAGE
                    ).map((key) => {
                      const category = COLOR_CATEGORIES[key as keyof typeof COLOR_CATEGORIES];
                      return (
                        <motion.div 
                          key={key} 
                          className="flex flex-col gap-1 items-center flex-shrink-0"
                          initial={{ scale: 0.9 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          {/* Middle color as label */}
                          <motion.div 
                            className="w-8 h-8 rounded-full border-2 border-border shadow-sm"
                            style={{ backgroundColor: category.middle }}
                            title={category.name}
                            whileHover={{ scale: 1.1 }}
                          />
                          {/* Vertical color list - brightest to darkest */}
                          <div className="flex flex-col gap-1">
                            {category.colors.map((color) => (
                              <motion.button
                                key={color}
                                type="button"
                                onClick={() => onColorChange(color)}
                                className={`w-10 h-10 rounded-lg border-2 transition-all flex-shrink-0 ${
                                  selectedColor === color
                                    ? 'border-foreground scale-110 shadow-md'
                                    : 'border-border hover:scale-105'
                                }`}
                                style={{ backgroundColor: color }}
                                title={color}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                {selectedColor === color && <Check className="mx-auto text-white" size={14} strokeWidth={3} />}
                              </motion.button>
                            ))}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Page Dots */}
            {totalColorPages > 1 && (
              <div className="flex justify-center gap-1.5 mt-3">
                {Array.from({ length: totalColorPages }).map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      setColorPage(index);
                      setDragOffset(0);
                    }}
                    className={`transition-all duration-200 ${
                      colorPage === index
                        ? 'w-6 h-2 bg-primary rounded-full'
                        : 'w-2 h-2 bg-muted-foreground/40 rounded-full hover:bg-muted-foreground/60'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </SimpleFormModal>
  );
};
