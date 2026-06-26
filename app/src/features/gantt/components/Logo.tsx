/** Brand mark: a Gantt cascade — left axis bar with staggered task bars.
 *  Colors match the favicon (app/src/app/icon.svg) exactly. */
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      role="img"
      aria-label="gantt-ng logo"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="4" y="4" width="4.5" height="24" rx="2.25" fill="#ca3500" />
      <rect x="11" y="6" width="15" height="5" rx="2.5" fill="#db703b" />
      <rect x="13" y="13.5" width="15" height="5" rx="2.5" fill="#ca3500" />
      <rect x="11" y="21" width="11" height="5" rx="2.5" fill="#db703b" />
    </svg>
  );
}
