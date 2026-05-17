interface SvgIconProps {
  svg: string;
  className?: string;
}

export function SvgIcon({ svg, className = 'contents' }: SvgIconProps) {
  // SAFETY: svg strings come from internal registry plugin constants, never from user input.
  return <span className={className} aria-hidden="true" dangerouslySetInnerHTML={{ __html: svg }} />;
}
