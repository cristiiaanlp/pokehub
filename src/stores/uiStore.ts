'use client';

import { create } from 'zustand';

interface UIState {
  mobileNavOpen: boolean;
  pickerOpen: boolean;
  pickerSlot: number | null;
  setMobileNavOpen: (open: boolean) => void;
  openPicker: (slot: number) => void;
  closePicker: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  mobileNavOpen: false,
  pickerOpen: false,
  pickerSlot: null,
  setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
  openPicker: (slot) => set({ pickerOpen: true, pickerSlot: slot }),
  closePicker: () => set({ pickerOpen: false, pickerSlot: null }),
}));
