import { createSocialImage, SOCIAL_IMAGE_SIZE } from "@/lib/social-image";

export const alt = "Hibiscus Group — local services delivered 2 U";
export const size = SOCIAL_IMAGE_SIZE;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return createSocialImage();
}
