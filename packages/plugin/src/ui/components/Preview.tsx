import { IconWorld } from '@tabler/icons-react';
import { GitHubLogo } from '../icons/GitHubLogo';
import { SlackLogo } from '../icons/SlackLogo';

const tutorials = [
  {
    label: 'Commit changes',
    url: 'https://figma-variable-history-docs.vercel.app/manage-changes/commit-changes',
    icon: (
      <svg
        width="33"
        height="32"
        viewBox="0 0 33 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="0.75" width="32" height="32" rx="8" fill="#E5F4FF" />
        <path
          d="M18.75 16C18.75 17.1046 17.8546 18 16.75 18C15.6454 18 14.75 17.1046 14.75 16M18.75 16C18.75 14.8955 17.8546 14 16.75 14C15.6454 14 14.75 14.8955 14.75 16M18.75 16H22.75M14.75 16H10.75"
          stroke="#0D99FF"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: 'Restore to a commit',
    url: 'https://figma-variable-history-docs.vercel.app/version-history/restore-version',
    icon: (
      <svg
        width="33"
        height="32"
        viewBox="0 0 33 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="0.25" width="32" height="32" rx="8" fill="#CFF7D3" />
        <path
          d="M10.2505 16C10.2505 17.1867 10.6024 18.3467 11.2617 19.3334C11.921 20.3201 12.858 21.0892 13.9544 21.5433C15.0507 21.9974 16.2571 22.1162 17.421 21.8847C18.5849 21.6532 19.654 21.0818 20.4931 20.2426C21.3322 19.4035 21.9037 18.3344 22.1352 17.1705C22.3667 16.0067 22.2479 14.8003 21.7938 13.7039C21.3396 12.6075 20.5706 11.6705 19.5839 11.0112C18.5972 10.3519 17.4372 10 16.2505 10C14.5731 10.0063 12.9631 10.6608 11.7572 11.8267L10.2505 13.3333"
          stroke="#14AE5C"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10.2505 10V13.3333H13.5838"
          stroke="#14AE5C"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M16.2505 12.6667V16L18.9172 17.3334"
          stroke="#14AE5C"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: 'Generate changelog',
    url: 'https://figma-variable-history-docs.vercel.app/logging',
    icon: (
      <svg
        width="33"
        height="32"
        viewBox="0 0 33 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="0.75" width="32" height="32" rx="8" fill="#FFF1C2" />
        <path
          d="M16.7495 19.3333V10"
          stroke="#FAB815"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12.7495 15.3333L16.7495 19.3333L20.7495 15.3333"
          stroke="#FAB815"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M21.4163 22H12.083"
          stroke="#FAB815"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: 'Set up sync tasks',
    url: 'https://figma-variable-history-docs.vercel.app/sync-variables/enable-github-sync',
    icon: (
      <div className="flex gap-2 items-center">
        <GitHubLogo size={22} />
        <SlackLogo size={22} />
        <IconWorld className="text-neutral-900 -ml-0.5" />
      </div>
    ),
  },
];

export function Preview() {
  return (
    <div className="p-8 w-full h-full">
      <h2 className="text-base font-semibold">No changes</h2>
      <p className="mt-2" style={{ color: 'var(--figma-color-text-secondary)' }}>
        There are no uncommitted changes in this file. Learn how{' '}
        <span className="font-semibold">Variable History</span> can help you manage variable
        changes.
      </p>

      <div className="grid grid-cols-2 gap-2 mt-6">
        {tutorials.map(({ label, url, icon }) => (
          <a
            href={url}
            target="_blank"
            key={label}
            className="border rounded-lg grow py-6 text-center flex flex-col gap-3 items-center justify-center hover:bg-[color:var(--figma-color-bg-secondary)]"
            style={{
              color: 'var(--figma-color-text-secondary)',
              borderColor: 'var(--figma-color-border)',
            }}
          >
            {icon}
            {label}
          </a>
        ))}
      </div>
    </div>
  );
}
