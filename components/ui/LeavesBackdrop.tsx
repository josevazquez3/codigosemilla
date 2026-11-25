import Image from "next/image";
import { images } from "@/lib/images";

export function LeavesBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
      <Image
        src={images.leaves}
        alt=""
        fill
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-background/70" />
    </div>
  );
}
