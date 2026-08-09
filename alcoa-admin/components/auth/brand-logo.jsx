import Image from "next/image";

/** ALCOA brand logo — served from alcoa-admin/public/brand/logo.png */
export const BRAND_LOGO_SRC = "/brand/logo.png";

export function BrandLogo({ variant = "desktop", className = "", priority = false }) {
  const isMobile = variant === "mobile";
  return (
    <Image
      src={BRAND_LOGO_SRC}
      alt="ALCOA Aluminium Scaffolding."
      width={isMobile ? 240 : 320}
      height={isMobile ? 90 : 120}
      priority={priority}
      className={
        className ||
        `h-auto object-contain ${isMobile ? "w-[min(240px,100%)]" : "w-[min(320px,100%)]"}`
      }
    />
  );
}
