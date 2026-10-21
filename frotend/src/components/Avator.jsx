export default function Avatar({ name = '?', size = 36, src }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={{ width: size, height: size }}
        className="rounded-full object-cover ring-2 ring-cream-100"
      />
    );
  }
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      className="rounded-full bg-forest-600 text-cream-50 font-semibold
                 flex items-center justify-center ring-2 ring-cream-100"
    >
      {initials}
    </div>
  );
}