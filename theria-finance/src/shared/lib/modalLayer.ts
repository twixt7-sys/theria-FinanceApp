import type { CSSProperties } from 'react';

type ModalLayer = {
  layerProps: {
    style: CSSProperties;
    onPointerDown: () => void;
  };
};

/** Shared fixed overlay classes; z-order comes from inline style. */
export const MODAL_OVERLAY_CLASS = 'fixed inset-0';

export function modalBackdropProps(layer: ModalLayer) {
  return {
    ...layer.layerProps,
    className: `${MODAL_OVERLAY_CLASS} bg-black/50 backdrop-blur-sm`,
  };
}

export function modalShellProps(layer: ModalLayer) {
  return {
    ...layer.layerProps,
    className: `${MODAL_OVERLAY_CLASS} flex items-center justify-center p-2`,
  };
}
