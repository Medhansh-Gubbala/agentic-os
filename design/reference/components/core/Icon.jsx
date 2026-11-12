import React from 'react';

/**
 * Icon — thin wrapper around Lucide icons (loaded via CDN on the host page).
 * The host must include the Lucide UMD script; see readme ICONOGRAPHY.
 * PORT NOTE: in the Next.js app use lucide-react imports instead.
 */
export function Icon({ name, size = 16, strokeWidth = 1.75, color = 'currentColor', className = '', style = {} }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const host = ref.current;
    if (!host) return;
    host.innerHTML = `<i data-lucide="${name}"></i>`;
    if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
    const svg = host.querySelector('svg');
    if (svg) {
      svg.setAttribute('width', size);
      svg.setAttribute('height', size);
      svg.setAttribute('stroke-width', strokeWidth);
      svg.style.display = 'block';
    }
  });
  return (
    <span
      ref={ref}
      data-icon={name}
      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: size, height: size, color, flex: '0 0 auto', ...style }}
      className={className}
    />
  );
}
