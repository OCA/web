Done:

- [x] POC: layout store, grid, drag & drop, insert-shift, long-press edit
- [x] Groups/separators (split, title, remove, drag-to-reorder)
- [x] Responsive rows (6/4 columns, position-preserving overflow)
- [x] Premium UX pass (lift, ghost, haptics, FLIP spring, cascade-in,
      hint, multi-undo, + Group)
- [x] Preferences-side Reset layout
- [ ] Verify in a live 19.0 database (desktop + mobile viewport)
- [ ] JS tests for the layout store
- [ ] Readme screenshot for the OCA PR

Ideas:

- Folders: drop an icon on another app to group them.
- Multiple pages with page dots.
- Multi-select drag (move several icons at once).
- Keyboard-accessible rearrangement in edit mode.
- Admin-set default layout for new users.
- Long-press progress indicator and glide-home drop animation.

## Design record

- Separate addon on `19.0`, template patch replacing `.o-app-menu-list`
  inside `web_responsive.AppsMenu` — keeps review blast radius small.
- Row-semantic layout `rows: [{cells: {col: menuId}, title, sep}]`
  persisted per user in `res.users.settings.apps_menu_grid_layout`
  (`{v: 2, rows}`, v1 migrates): positions survive resizes.
- Separators are explicit (`sep` flag) overlays on a margin — never
  grid rows.
- `makeDraggableHook` (PoS floor-plan mechanism); drop targets resolved
  by cached cell rects + scroll delta, not `elementFromPoint`.
- Alternatives rejected: editing `web_responsive` in place, stacking on
  PR #3756, `useSortable`, auto-fill columns, swap-on-drop (superseded
  by insert-shift), flat cell indexes (superseded by row-semantic).
