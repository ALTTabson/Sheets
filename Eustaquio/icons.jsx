/* icons.jsx — minimalist line-art SVG icons (no emoji)
   All icons are 16x16 viewBox, currentColor-friendly, 1.5px strokes
*/

const Icon = ({ name, size = 16, ...props }) => {
  const ic = ICONS[name];
  if (!ic) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      {...props}>
      {ic}
    </svg>
  );
};

const ICONS = {
  // Star (inspiration)
  star: <path d="M8 2l1.8 3.6 4 .6-2.9 2.8.7 4L8 11.1 4.4 13l.7-4L2.2 6.2l4-.6L8 2z"/>,
  // Sun (day)
  sun: <g><circle cx="8" cy="8" r="2.8"/><path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3 3l1 1M12 12l1 1M3 13l1-1M12 4l1-1"/></g>,
  // Moon (night)
  moon: <path d="M12.5 9.5A5 5 0 1 1 6.5 3.5a4 4 0 0 0 6 6z"/>,
  // Half-moon (dusk)
  dusk: <g><circle cx="8" cy="8" r="5"/><path d="M8 3v10" /><path d="M8 3a5 5 0 0 1 0 10z" fill="currentColor" stroke="none"/></g>,
  // Hourglass / short rest
  hourglass: <path d="M4 2h8M4 14h8M5 2v2.5L8 7l3-2.5V2M5 14v-2.5L8 9l3 2.5V14"/>,
  // Bed / long rest
  bed: <path d="M2 11V5M2 11h12V8a2 2 0 0 0-2-2H7v5M14 11v2M2 13v-2"/>,
  // Sword
  sword: <path d="M12 4l1-1 1 1-1 1m-1-1L4 12m0 0l-2 .5L2.5 14 4 12zm1 1l1 1m-2-2l-1-1"/>,
  // Shield
  shield: <path d="M8 1.5L2.5 3.5v4.5c0 3 2.5 5 5.5 6 3-1 5.5-3 5.5-6V3.5L8 1.5z"/>,
  // Heart
  heart: <path d="M8 13.5s-5-3-5-7a3 3 0 0 1 5-2.2A3 3 0 0 1 13 6.5c0 4-5 7-5 7z"/>,
  // Boot (speed)
  boot: <path d="M3 3h3v6h6v4H3V3zM6 9h6"/>,
  // Eye (perception)
  eye: <g><path d="M1.5 8s2.5-4.5 6.5-4.5S14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8z"/><circle cx="8" cy="8" r="2"/></g>,
  // Flame (rage)
  flame: <path d="M8 14c-3 0-5-2-5-4.5 0-2 1.5-3 2-4.5 0 1 1 1.5 2 1.5 0-2 1-4 3-5-.5 2 1 3 1 5 1 0 2-.5 2-1.5.5 1.5 2 2.5 2 4.5 0 2.5-2 4.5-5 4.5z"/>,
  // Wind (second wind)
  wind: <path d="M2 6h7a2 2 0 1 0-2-2M2 10h10a2 2 0 1 1-2 2M2 8h5"/>,
  // Bolt (action surge)
  bolt: <path d="M9 1L3 9h4l-1 6 6-8H8l1-6z"/>,
  // Coin
  coin: <g><circle cx="8" cy="8" r="6"/><path d="M6 6h3a1.5 1.5 0 0 1 0 3H6m0 0h3a1.5 1.5 0 0 1 0 3H6V6z"/></g>,
  // Backpack
  pack: <path d="M5 4V3a3 3 0 0 1 6 0v1M3 6h10v8H3V6zM6 9h4"/>,
  // Scroll
  scroll: <path d="M3 3h8v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V3zM11 3h2v9a1 1 0 0 1-2 0M5 6h4M5 9h4"/>,
  // Skull (death)
  skull: <g><path d="M3 7c0-3 2-5 5-5s5 2 5 5v3l-1 1v2H4v-2l-1-1V7z"/><circle cx="6" cy="8" r=".8" fill="currentColor"/><circle cx="10" cy="8" r=".8" fill="currentColor"/></g>,
  // Mountain (dexterity? no — use for nature)
  mountain: <path d="M1 13l4-7 3 4 2-3 5 6H1z"/>,
  // Brain
  brain: <path d="M5 3a2 2 0 0 0-2 2v1a2 2 0 0 0-1 2 2 2 0 0 0 1 2v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1a2 2 0 0 0 1-2 2 2 0 0 0-1-2V5a2 2 0 0 0-2-2H5zM8 3v10"/>,
  // Drop (charisma? no — generic)
  drop: <path d="M8 1l4 7a4 4 0 1 1-8 0l4-7z"/>,
  // Drag handle
  grip: <g><circle cx="6" cy="4" r=".8" fill="currentColor"/><circle cx="10" cy="4" r=".8" fill="currentColor"/><circle cx="6" cy="8" r=".8" fill="currentColor"/><circle cx="10" cy="8" r=".8" fill="currentColor"/><circle cx="6" cy="12" r=".8" fill="currentColor"/><circle cx="10" cy="12" r=".8" fill="currentColor"/></g>,
  // D20
  d20: <g><path d="M8 1L2 5v6l6 4 6-4V5L8 1z"/><path d="M2 5l6 4 6-4M8 9v6"/></g>,
  // Check / circle
  dot: <circle cx="8" cy="8" r="3" fill="currentColor"/>,
  // Empty circle
  ring: <circle cx="8" cy="8" r="3"/>,
  // Plus
  plus: <path d="M8 3v10M3 8h10"/>,
  // Minus
  minus: <path d="M3 8h10"/>,
  // X
  close: <path d="M4 4l8 8M4 12l8-8"/>,
  // Crown / leader
  crown: <path d="M2 11l1-6 3 3 2-5 2 5 3-3 1 6H2zM2 11v2h12v-2"/>,
  // Gear
  gear: <g><circle cx="8" cy="8" r="2.5"/><path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.3 3.3l1.4 1.4M11.3 11.3l1.4 1.4M3.3 12.7l1.4-1.4M11.3 4.7l1.4-1.4"/></g>,
  // Pencil / edit
  pencil: <path d="M11 2l3 3-8 8H3v-3l8-8zM10 3l3 3"/>,
  // Trash
  trash: <path d="M3 4h10M6 4V2.5h4V4M5 4l.5 9h5L11 4M7 6.5v5M9 6.5v5"/>,
  // Palette
  palette: <g><path d="M8 2a6 6 0 0 0 0 12c1.5 0 1.5-1 1-2-.5-1 0-2 1.5-2H13a1.5 1.5 0 0 0 1.5-1.5C14.5 5 11.5 2 8 2z"/><circle cx="5" cy="7" r=".7" fill="currentColor"/><circle cx="8" cy="5" r=".7" fill="currentColor"/><circle cx="11" cy="7" r=".7" fill="currentColor"/></g>,
  // Image (background)
  image: <g><rect x="2" y="3" width="12" height="10"/><path d="M2 11l3.5-3 3 2.5L11 8l3 3"/><circle cx="6" cy="6.5" r="1"/></g>,
  // Sparkle
  sparkle: <path d="M8 2v4M8 10v4M2 8h4M10 8h4"/>
};

window.Icon = Icon;

