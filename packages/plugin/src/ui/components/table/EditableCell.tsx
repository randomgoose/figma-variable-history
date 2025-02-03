export function EditableCell({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return <input type="text" value={value} onChange={(e) => onChange(e.target.value)} />;
}
