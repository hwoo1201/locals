export default function LogoMark({ size = 40, color = "#BEBEBE" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="13" cy="13" r="11" fill={color} />
      <circle cx="27" cy="13" r="11" fill={color} />
      <circle cx="13" cy="27" r="11" fill={color} />
      <circle cx="27" cy="27" r="11" fill={color} />
    </svg>
  );
}
