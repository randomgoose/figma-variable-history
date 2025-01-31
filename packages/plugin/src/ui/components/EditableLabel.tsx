import clsx from 'clsx';
import { useState } from 'react';

interface EditableLabelProps {
  children: string;
  onSave: (value: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

export default function EditableLabel({ children, onSave, className, style }: EditableLabelProps) {
  const [isEditing, setIsEditing] = useState(false);

  return isEditing ? (
    <input
      type="text"
      defaultValue={children}
      onBlur={(e) => {
        setIsEditing(false);
        onSave(e.target.value);
      }}
      style={style}
      className={clsx(
        'rounded-md p-2 absolute left-0 bg-purple-100 border border-purple-300 h-6 flex items-center',
        className
      )}
      // onChange={e => setIsEditing(e.target.value)}
    />
  ) : (
    <div
      className={clsx(
        'rounded-md p-2 absolute left-0 bg-purple-100 border border-purple-300 h-6 flex items-center',
        className
      )}
      onDoubleClick={() => setIsEditing(true)}
      style={style}
    >
      {children}
    </div>
  );
}
