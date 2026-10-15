// Wave Dude 2D web - saving a file the page made (a project, a video, a picture, a colour scheme).
// GPL-3.0-or-later.

/** Offers a blob as a download under this name. */
export function download(blob: Blob, name: string): void {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
