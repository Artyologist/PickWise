export default function StarRating({ value, size = 18 }) {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="flex items-center gap-1">
      {stars.map(n => (
        <svg
          key={n}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill={n <= value ? '#FACC15' : '#E5E7EB'}
          width={size}
          height={size}
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.974a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.382 2.455a1 1 0 00-.364 1.118l1.286 3.974c.3.921-.755 1.688-1.54 1.118l-3.382-2.455a1 1 0 00-1.176 0l-3.382 2.455c-.784.57-1.838-.197-1.539-1.118l1.286-3.974a1 1 0 00-.364-1.118L2.03 9.401c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.974z" />
        </svg>
      ))}
    </div>
  );
}
