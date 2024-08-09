export function EmptyState() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-center gap-2">
      <svg
        width="33"
        height="32"
        viewBox="0 0 33 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12.5 6.761L4.5 11.381V20.617L12.5 25.237L20.5 20.617V11.381L12.5 6.759V6.761ZM22.5 10.225L12.5 4.453L2.5 10.225V21.773L12.5 27.547L22.5 21.773V10.225ZM28.5 20.617L18.5 26.391L20.5 27.547L30.5 21.773V10.225L20.5 4.453L18.5 5.607L28.5 11.381V20.617ZM14.5 15.999C14.5 17.103 13.604 17.999 12.5 17.999C11.396 17.999 10.5 17.103 10.5 15.999C10.5 14.895 11.396 13.999 12.5 13.999C13.604 13.999 14.5 14.895 14.5 15.999Z"
          fill="black"
          fillOpacity="0.2"
        />
      </svg>

      <div style={{ color: 'var(--figma-color-text-tertiary)' }}>
        Changes to Figma variables will be displayed here
      </div>
    </div>
  );
}
