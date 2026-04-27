const MESSAGES = [
  'New SS\'26 collection — limited pieces',
  'Made in Pakistan · Ethically crafted',
  'Handcrafted with intention · Shop the drop',
  'Small-batch drops · Every piece is intentional',
];

export default function AnnouncementBar() {
  // Duplicate messages for seamless loop
  const all = [...MESSAGES, ...MESSAGES];

  return (
    <div className="fixed top-0 inset-x-0 z-40 bg-ink h-9 overflow-hidden flex items-center">
      <div
        className="flex whitespace-nowrap w-max animate-[announcementScroll_28s_linear_infinite]"
      >
        {all.map((msg, i) => (
          <span key={i} className="text-[11px] font-semibold tracking-[.08em] text-white/75 px-10">
            {msg}
            <span className="mx-6 text-white/25">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}
