import { useCallback, useRef } from 'react';
import { MESSAGE_TYPE, sendMessage } from '../../utils/message';

export function ResizeHandle() {
  const ref = useRef<HTMLDivElement>(null);

  const onResize = useCallback((e: PointerEvent) => {
    sendMessage(MESSAGE_TYPE.RESIZE, {
      width: Math.max(50, Math.floor(e.clientX + 5)),
      height: Math.max(50, Math.floor(e.clientY + 5)),
    });
  }, []);

  return (
    <div
      ref={ref}
      id="resizeAnchor"
      className={'absolute right-0 bottom-0 z-50 select-none cursor-nwse-resize'}
      onPointerDown={(e) => {
        ref.current!.onpointermove = onResize;
        ref.current?.setPointerCapture(e.pointerId);
      }}
      onPointerUp={(e) => {
        ref.current!.onpointermove = null;
        ref.current!.releasePointerCapture(e.pointerId);
      }}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M13 3V3C13 8.52285 8.52285 13 3 13V13" stroke="var(--figma-color-icon-tertiary)" />
      </svg>
    </div>
  );
}

export default ResizeHandle;
