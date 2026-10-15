import { describe, expect, it } from "vitest";
import { crc32, readZip, writeZip } from "./zip";

describe("zip", () => {
  it("computes the standard CRC-32", () => {
    expect(crc32(new TextEncoder().encode("123456789")) >>> 0).toBe(0xcbf43926);
  });

  it("reads back what it writes", async () => {
    const entries = [
      { name: "p/configuration.json", data: new TextEncoder().encode('{"a":1}') },
      { name: "p/scene_images/s.png", data: new Uint8Array([1, 2, 3, 250]) },
    ];
    const blob = await writeZip(entries);
    const back = await readZip(await blob.arrayBuffer());
    expect(back.map(e => e.name)).toEqual(entries.map(e => e.name));
    expect([...back[1].data]).toEqual([1, 2, 3, 250]);
    expect(new TextDecoder().decode(back[0].data)).toBe('{"a":1}');
  });
});
