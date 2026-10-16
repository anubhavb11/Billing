// Bansal Store logo (same drawing as public/logo.svg). Inline SVG, so it also
// appears in the shared bill picture.
export default function Logo({ size = 32, className }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 512 512" role="img" aria-label="Bansal Store">
      <rect width="512" height="512" rx="112" fill="#e25629" />
      <path fill="#fff" d="M84 104h344l-12 58H96z" />
      <path
        fill="#fff"
        d="M96 162h80v12a40 40 0 0 1-80 0zM176 162h80v12a40 40 0 0 1-80 0zM256 162h80v12a40 40 0 0 1-80 0zM336 162h80v12a40 40 0 0 1-80 0z"
      />
      <path fill="#f6b8a1" d="M176 162h80v12a40 40 0 0 1-80 0zM336 162h80v12a40 40 0 0 1-80 0z" />
      <path
        fill="#fff"
        fillRule="evenodd"
        d="M176 246h96c46 0 74 22 74 58 0 21-11 37-29 45 25 7 41 27 41 54 0 39-30 63-80 63H176zM222 286v52h46c19 0 30-10 30-26s-11-26-30-26zM222 376v56h52c21 0 34-11 34-28s-13-28-34-28z"
      />
    </svg>
  );
}
