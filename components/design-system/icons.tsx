export type IconName =
  | "menu"
  | "search"
  | "bookmark"
  | "clock"
  | "info"
  | "share"
  | "external"
  | "calendar"
  | "analytics"
  | "tag"
  | "user"
  | "bell"
  | "sliders"
  | "check"
  | "more"
  | "globe"
  | "chevron-down"
  | "x"
  | "linkedin"
  | "instagram"
  | "youtube";

type IconProps = {
  name: IconName;
  size?: number;
  className?: string;
};

export function Icon({ name, size = 24, className }: IconProps) {
  const paths: Record<IconName, React.ReactNode> = {
    menu: <><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    bookmark: <path d="M6 4.8A1.8 1.8 0 0 1 7.8 3h8.4A1.8 1.8 0 0 1 18 4.8V21l-6-4-6 4Z" />,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v6" /><path d="M12 7.2h.01" /></>,
    share: <><path d="M12 3v12" /><path d="m8 7 4-4 4 4" /><path d="M5 11v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8" /></>,
    external: <><path d="M14 4h6v6" /><path d="m20 4-9 9" /><path d="M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6" /></>,
    calendar: <><rect x="4" y="5" width="16" height="16" rx="2" /><path d="M8 3v4M16 3v4M4 10h16" /><path d="M9 14h.01M15 14h.01M9 17h.01" /></>,
    analytics: <><path d="M4 20h16" /><rect x="5" y="13" width="3" height="5" /><rect x="11" y="9" width="3" height="9" /><rect x="17" y="5" width="3" height="13" /><path d="m5 9 5-4 4 2 5-4" /></>,
    tag: <path d="M20.4 13.4 13 20.8 3.2 11V3.2H11Z" />,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4.5 21a7.5 7.5 0 0 1 15 0Z" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    sliders: <><path d="M4 6h5M13 6h7" /><circle cx="11" cy="6" r="2" /><path d="M4 12h9M17 12h3" /><circle cx="15" cy="12" r="2" /><path d="M4 18h3M11 18h9" /><circle cx="9" cy="18" r="2" /></>,
    check: <><circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16 9" /></>,
    more: <><circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" /></>,
    globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" /></>,
    "chevron-down": <path d="m8 10 4 4 4-4" />,
    x: <><path d="M5 4.5 19 19.5" /><path d="M19 4.5 5 19.5" /></>,
    linkedin: <><path d="M7 9v10M7 5.5v.01M11 19v-6a4 4 0 0 1 8 0v6M11 9v10" /></>,
    instagram: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><path d="M17.5 6.5h.01" /></>,
    youtube: <><rect x="2.5" y="5.5" width="19" height="13" rx="4" /><path d="m10 9 5 3-5 3Z" /></>,
  };

  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      {paths[name]}
    </svg>
  );
}
