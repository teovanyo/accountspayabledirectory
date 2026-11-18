export function LogoMark({
  size = 36,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <rect width="48" height="48" rx="12" fill="#0f3d3e" />
      <path
        d="M16 11.5h11.5L34 18v16.25c0 1.24-1.01 2.25-2.25 2.25H16a2.25 2.25 0 0 1-2.25-2.25V13.75A2.25 2.25 0 0 1 16 11.5Z"
        stroke="#fbfaf7"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path d="M27.5 11.5V18H34" stroke="#fbfaf7" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M19.5 24h9M19.5 28.5h5.5" stroke="#fbfaf7" strokeWidth="2.2" strokeLinecap="round" />
      <path
        d="m26.4 31.7 2.4 2.4 4.4-4.9"
        stroke="#c8963e"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
