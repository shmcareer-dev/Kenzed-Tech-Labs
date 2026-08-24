"use client";

/**
 * The cmdk-dependent half of the command palette, isolated so it can be a
 * separate chunk.
 *
 * cmdk is ~86KB of JavaScript for a dialog that most visits never open, and
 * KzNav is imported by the root layout for the page transition — so leaving
 * the import here would put the whole search engine on the critical path of
 * every route. KzNav loads this module lazily, the first time the palette is
 * actually opened.
 */

import { Command } from "cmdk";

import type { KzCommandItem } from "./KzNav";

export interface KzCommandListProps {
  label: string;
  placeholder: string;
  emptyMessage: string;
  groups: { name: string; items: KzCommandItem[] }[];
  onRun: (item: KzCommandItem) => void;
}

export function KzCommandList({
  label,
  placeholder,
  emptyMessage,
  groups,
  onRun,
}: KzCommandListProps) {
  return (
    <Command label={label} loop>
      {/* autoFocus rather than the dialog hook's initial-focus pass: this
          subtree mounts a moment after the panel does, so the input does not
          exist yet when focus first moves into the dialog. */}
      <Command.Input autoFocus className="kzcp-input" placeholder={placeholder} />
      <Command.List className="kzcp-list">
        <Command.Empty className="kzcp-empty">{emptyMessage}</Command.Empty>
        {groups.map((group) => (
          <Command.Group key={group.name} heading={group.name}>
            {group.items.map((item) => (
              <Command.Item
                key={item.id}
                value={item.label}
                keywords={item.keywords}
                onSelect={() => onRun(item)}
              >
                <span className="kzcp-item-label">{item.label}</span>
                {item.hint && <span className="kzcp-item-hint">{item.hint}</span>}
              </Command.Item>
            ))}
          </Command.Group>
        ))}
      </Command.List>
    </Command>
  );
}
