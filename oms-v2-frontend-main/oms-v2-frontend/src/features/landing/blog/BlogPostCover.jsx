import ImageSlot from "@/features/landing/components/ImageSlot";
import { color } from "@/features/landing/tokens";

export default function BlogPostCover({
  src,
  label,
  height,
  radius = 20,
}) {
  if (src) {
    return (
      <div
        style={{
          position: "relative",
          width: "100%",
          height,
          borderRadius: radius,
          overflow: "hidden",
          background: color.bgTint,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={label || "Blog cover"}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      </div>
    );
  }

  return (
    <ImageSlot label={label || "Blog cover"} height={height} radius={radius} />
  );
}
