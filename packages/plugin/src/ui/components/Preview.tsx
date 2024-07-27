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
    label: 'Restore a commit',
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
    label: 'Sync to GitHub',
    url: 'https://figma-variable-history-docs.vercel.app/sync-variables/enable-github-sync',
    icon: (
      <svg
        width="33"
        height="32"
        viewBox="0 0 33 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clipPath="url(#clip0_1680_2255)">
          <mask
            id="mask0_1680_2255"
            style={{ maskType: 'luminance' }}
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="33"
            height="32"
          >
            <path d="M32.25 0H0.25V32H32.25V0Z" fill="white" />
          </mask>
          <g mask="url(#mask0_1680_2255)">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M16.2626 0.639984C7.61788 0.639984 0.629395 7.67998 0.629395 16.3895C0.629395 23.3513 5.10716 29.2444 11.319 31.3303C12.0956 31.4871 12.3801 30.9913 12.3801 30.5744C12.3801 30.2092 12.3545 28.9577 12.3545 27.6537C8.00572 28.5927 7.10012 25.7763 7.10012 25.7763C6.40124 23.9511 5.36572 23.4819 5.36572 23.4819C3.94236 22.5171 5.4694 22.5171 5.4694 22.5171C7.04828 22.6215 7.87676 24.1337 7.87676 24.1337C9.2742 26.5324 11.526 25.8547 12.432 25.4375C12.5612 24.4204 12.9756 23.7164 13.4156 23.3255C9.94716 22.9603 6.29788 21.6044 6.29788 15.5548C6.29788 13.8339 6.91868 12.4259 7.90236 11.3309C7.74716 10.9398 7.20348 9.32286 8.05788 7.1587C8.05788 7.1587 9.37788 6.74142 12.3542 8.77534C13.6285 8.4306 14.9426 8.25522 16.2626 8.25374C17.5826 8.25374 18.9282 8.43646 20.1708 8.77534C23.1474 6.74142 24.4674 7.1587 24.4674 7.1587C25.3218 9.32286 24.7778 10.9398 24.6226 11.3309C25.6322 12.4259 26.2274 13.8339 26.2274 15.5548C26.2274 21.6044 22.5782 22.934 19.0838 23.3255C19.6534 23.8208 20.1449 24.7593 20.1449 26.2457C20.1449 28.3577 20.1193 30.0528 20.1193 30.574C20.1193 30.9913 20.4041 31.4871 21.1804 31.3305C27.3922 29.2441 31.87 23.3513 31.87 16.3895C31.8956 7.67998 24.8816 0.639984 16.2626 0.639984Z"
              fill="#24292F"
            />
          </g>
        </g>
        <defs>
          <clipPath id="clip0_1680_2255">
            <rect width="32" height="32" fill="white" transform="translate(0.25)" />
          </clipPath>
        </defs>
      </svg>
    ),
  },
];

export function Preview() {
  return (
    <div className="p-8 w-full h-full">
      <h2 className="text-base font-semibold">No changes</h2>
      <p className="mt-2" style={{ color: 'var(--figma-color-text-secondary)' }}>
        There are no changes in this file. Learn how{' '}
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
            style={{ color: 'var(--figma-color-text-secondary)' }}
          >
            {icon}
            {label}
          </a>
        ))}
      </div>
    </div>
  );
}
