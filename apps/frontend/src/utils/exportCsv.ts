export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  headers: { key: keyof T; label: string }[],
  filename: string
) {
  if (!data.length) return;
  const csvRows = [];
  // ヘッダー
  csvRows.push(headers.map((h) => `"${h.label}"`).join(","));
  // データ
  for (const row of data) {
    csvRows.push(
      headers
        .map((h) => {
          const val = row[h.key];
          // 日付やカンマ対策
          if (typeof val === "string" && (val.includes(",") || val.includes("\n"))) {
            return `"${val.replace(/"/g, '""')}"`;
          }
          return val ?? "";
        })
        .join(",")
    );
  }
  const csvString = csvRows.join("\r\n");
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
