import clsx from 'clsx';

export function Profile({ user, className }: { user: User; className?: string }) {
  return (
    <div className={clsx('flex items-center gap-1 whitespace-nowrap', className)}>
      <img className={'w-4 h-4 rounded-full'} src={user.photoUrl || ''} />
      {user?.name}
    </div>
  );
}
