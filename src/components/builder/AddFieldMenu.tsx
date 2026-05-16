import { getAllPlugins } from '../../registry';
import type { FieldKind } from '../../types/fields';

interface AddFieldMenuProps {
  onAdd: (kind: FieldKind) => void;
}

function parseIcon(svg: string) {
  return <span dangerouslySetInnerHTML={{ __html: svg }} className="contents" />;
}

export function AddFieldMenu({ onAdd }: AddFieldMenuProps) {
  const plugins = getAllPlugins();
  const groups = Array.from(
    plugins.reduce((map, p) => {
      const g = p.group ?? 'input';
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(p);
      return map;
    }, new Map<string, typeof plugins>()),
  );

  const groupLabel = (g: string) =>
    g === 'input' ? 'Input' : g === 'choice' ? 'Choice' : g === 'special' ? 'Special' : g;

  return (
    <>
      <div className="sticky top-0 bg-inherit px-4 py-3.5 pb-2.5 border-b border-divider z-[var(--z-lifted)]">
        <h3 className="text-caption font-semibold uppercase tracking-wider text-muted m-0">Add field</h3>
      </div>
      <div className="px-3.5 py-3.5 pb-10">
        {groups.map(([group, items]) => (
          <div key={group} className="mb-section">
            <div className="text-2xs font-semibold uppercase tracking-widest text-muted-2 px-2 py-1 mb-1">
              {groupLabel(group)}
            </div>
            {items.map((plugin) => (
              <button
                key={plugin.kind}
                className="flex items-center gap-2.5 w-full px-2 py-1.75 rounded-md text-ui text-ink cursor-pointer transition-colors hover:bg-surface"
                onClick={() => onAdd(plugin.kind as FieldKind)}
              >
                <span className="w-6 h-6 grid place-items-center bg-surface border border-border rounded-md text-ink-2 shrink-0">
                  {parseIcon(plugin.icon)}
                </span>
                <span className="flex-1 text-left">{plugin.displayName}</span>
              </button>
            ))}
          </div>
        ))}
        <div className="h-px bg-divider my-4" />
        <p className="text-caption text-muted px-2">Click a field type to append it at the end of the form.</p>
      </div>
    </>
  );
}
