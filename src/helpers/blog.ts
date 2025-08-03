export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')   // แทนที่ช่องว่าง/อักขระพิเศษด้วย "-"
    .replace(/(^-|-$)+/g, '');     // ตัด "-" ที่หัวและท้าย
}

export function generateExcerpt(content: string, length = 150) {
  return content.replace(/[#>*_`~\-]/g, "") // ลบ markdown
                .slice(0, length)
                .trim() + "...";
}