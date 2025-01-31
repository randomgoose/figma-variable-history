import { memo } from 'react';

export default memo(({ data }: { data: { name: string } }) => {
  return (
    <>
      <div className="absolute -top-8 left-0 px-2 flex items-center h-6 bg-[var(--figma-color-bg-brand-tertiary)] rounded-md border border-[var(--figma-color-border-brand)]">
        {data.name}
      </div>
    </>
  );
});
