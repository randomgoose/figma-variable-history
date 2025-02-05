export function RowTitle({ row }: { row: Row }) {
  return (
    <div className="font-medium p-2 text-xs border-b border-[var(--figma-color-border)] pt-8 sticky left-0 right-0 bg-[var(--figma-color-background)]">
      {row.id}
    </div>
  );
}
