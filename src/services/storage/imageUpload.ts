import { fileToDataUrl } from "@/lib/utils";

export async function uploadImages(files: File[]): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) {
    const dataUrl = await fileToDataUrl(file);
    urls.push(dataUrl);
  }
  return urls;
}
