import type { CSSProperties } from 'react';
import { useContrast } from '../contrast';
import './Asset.css';

/*
 * Drop a file into src/assets/ whose path (minus extension) matches `name`,
 * e.g. src/assets/icons/home.svg for name="icons/home", and it replaces the placeholder.
 */
const files = import.meta.glob('../assets/**/*.{svg,png,jpg,jpeg,webp,gif}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const urlByName: Record<string, string> = Object.fromEntries(
  Object.entries(files).map(([path, url]) => [path.replace('../assets/', '').replace(/\.[^.]+$/, ''), url]),
);

export function assetUrl(name: string): string | undefined {
  return urlByName[name];
}

/** HTML string version, for non-React contexts such as Leaflet divIcons. */
export function assetHtml(name: string, width: number, height: number): string {
  const url = assetUrl(name);
  const size = `width:${width}px;height:${height}px`;
  return url
    ? `<img src="${url}" alt="" style="${size};object-fit:contain;display:block" />`
    : `<span class="asset-placeholder" style="${size}" title="${name}"></span>`;
}

type AssetProps = {
  name: string;
  width: number;
  height: number;
  alt?: string;
  fit?: 'contain' | 'cover';
  className?: string;
};

export function Asset({ name, width, height, alt = '', fit = 'contain', className }: AssetProps) {
  // 고대비: use the dark export at src/assets/contrast/<name> when there is one
  const { contrast } = useContrast();
  const url = (contrast && assetUrl(`contrast/${name}`)) || assetUrl(name);
  const style: CSSProperties = { width, height };

  if (url) {
    return <img src={url} alt={alt} className={className} style={{ ...style, objectFit: fit, display: 'block' }} />;
  }

  return (
    <span className={`asset-placeholder ${className ?? ''}`} style={style} title={name} aria-hidden={!alt}>
      {width >= 160 && height >= 60 && <span className="asset-placeholder__label">{name}</span>}
    </span>
  );
}
