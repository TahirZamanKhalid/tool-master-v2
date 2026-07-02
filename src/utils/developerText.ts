export const encodeBase64Unicode = (value: string): string => {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
};

export const decodeBase64Unicode = (value: string): string => {
  const cleanValue = value.replace(/\s+/g, "");
  const binary = atob(cleanValue);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
};

export const copyText = async (value: string): Promise<void> => {
  await navigator.clipboard.writeText(value);
};

export const formatBytes = (bytes: number): string => {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 Bytes";
  const units = ["Bytes", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, index);
  return `${Math.round(value * 100) / 100} ${units[index]}`;
};

export const getSizeStats = (original: string, result: string) => {
  const originalSize = new Blob([original]).size;
  const resultSize = new Blob([result]).size;
  const saved = originalSize > 0 ? ((originalSize - resultSize) / originalSize) * 100 : 0;
  return {
    original: originalSize,
    minified: resultSize,
    saved: Number(saved.toFixed(2)),
  };
};

export const escapeCSVValue = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  const stringValue = typeof value === "object" ? JSON.stringify(value) : String(value);
  if (/[",\r\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

export const stringifyCSV = (rows: Record<string, unknown>[]): string => {
  const headers = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
  return [
    headers.map(escapeCSVValue).join(","),
    ...rows.map((row) => headers.map((header) => escapeCSVValue(row[header])).join(",")),
  ].join("\n");
};

export const parseCSV = (input: string): Record<string, string>[] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    const next = input[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        cell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(cell);
      cell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i++;
      row.push(cell);
      if (row.some((value) => value.trim() !== "")) rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  if (inQuotes) {
    throw new Error("CSV has an unclosed quoted value");
  }

  row.push(cell);
  if (row.some((value) => value.trim() !== "")) rows.push(row);

  if (rows.length < 2) {
    throw new Error("CSV must include a header row and at least one data row");
  }

  const headers = rows[0].map((header) => header.trim());
  if (headers.length === 0 || headers.every((header) => !header)) {
    throw new Error("CSV header row is empty");
  }

  return rows.slice(1).map((values) => {
    const item: Record<string, string> = {};
    headers.forEach((header, index) => {
      if (header) item[header] = values[index] ?? "";
    });
    return item;
  });
};

export const formatXMLString = (input: string): string => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(input, "application/xml");
  const parserError = doc.querySelector("parsererror");
  if (parserError) {
    throw new Error(parserError.textContent?.split("\n")[0] || "Invalid XML");
  }

  const serialized = new XMLSerializer().serializeToString(doc);
  const tokens = serialized.replace(/>\s*</g, "><").split(/(?=<)|(?<=>)/g).filter(Boolean);
  let indent = 0;
  const lines: string[] = [];

  tokens.forEach((token) => {
    const trimmed = token.trim();
    if (!trimmed) return;

    if (/^<\//.test(trimmed)) indent = Math.max(indent - 1, 0);
    lines.push(`${"  ".repeat(indent)}${trimmed}`);
    if (/^<[^!?/][^>]*[^/]?>$/.test(trimmed) && !/^<[^>]+><\/[^>]+>$/.test(trimmed)) indent++;
  });

  return lines.join("\n");
};

const needsYamlQuotes = (value: string): boolean =>
  value === "" ||
  /^[\s]|[\s]$/.test(value) ||
  /[:#{}\[\],&*?|\-<>=!%@`]/.test(value) ||
  /^(true|false|null|yes|no|on|off|[-+]?\d+(\.\d+)?)$/i.test(value);

const yamlScalar = (value: unknown): string => {
  if (value === null) return "null";
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  const text = String(value);
  return needsYamlQuotes(text) ? JSON.stringify(text) : text;
};

export const jsonToYaml = (value: unknown, indent = 0): string => {
  const spaces = "  ".repeat(indent);

  if (Array.isArray(value)) {
    if (value.length === 0) return `${spaces}[]\n`;
    return value
      .map((item) => {
        if (item && typeof item === "object") {
          return `${spaces}-\n${jsonToYaml(item, indent + 1)}`;
        }
        return `${spaces}- ${yamlScalar(item)}\n`;
      })
      .join("");
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return `${spaces}{}\n`;
    return entries
      .map(([key, item]) => {
        const safeKey = needsYamlQuotes(key) ? JSON.stringify(key) : key;
        if (item && typeof item === "object") {
          return `${spaces}${safeKey}:\n${jsonToYaml(item, indent + 1)}`;
        }
        return `${spaces}${safeKey}: ${yamlScalar(item)}\n`;
      })
      .join("");
  }

  return `${spaces}${yamlScalar(value)}\n`;
};

export const simpleYamlToJson = (input: string): unknown => {
  const lines = input
    .replace(/\t/g, "  ")
    .split(/\r?\n/)
    .filter((line) => line.trim() && !line.trim().startsWith("#"));

  if (lines.length === 0) return {};

  const parseScalar = (value: string): unknown => {
    const trimmed = value.trim();
    if (trimmed === "null" || trimmed === "~") return null;
    if (trimmed === "true") return true;
    if (trimmed === "false") return false;
    if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);
    if (
      (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'"))
    ) {
      return trimmed.slice(1, -1);
    }
    return trimmed;
  };

  const root: Record<string, unknown> = {};
  const stack: Array<{ indent: number; value: Record<string, unknown> | unknown[] }> = [{ indent: -1, value: root }];

  lines.forEach((line) => {
    const indent = line.match(/^\s*/)?.[0].length ?? 0;
    const content = line.trim();
    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) stack.pop();
    const parent = stack[stack.length - 1].value;

    if (content.startsWith("- ")) {
      if (!Array.isArray(parent)) {
        throw new Error("Nested arrays must be placed under a key");
      }
      parent.push(parseScalar(content.slice(2)));
      return;
    }

    const colonIndex = content.indexOf(":");
    if (colonIndex < 0) throw new Error(`Invalid YAML line: ${content}`);
    const key = content.slice(0, colonIndex).trim().replace(/^['"]|['"]$/g, "");
    const rawValue = content.slice(colonIndex + 1).trim();
    if (!key || Array.isArray(parent)) throw new Error(`Invalid YAML key: ${content}`);

    if (rawValue) {
      parent[key] = parseScalar(rawValue);
      return;
    }

    const nextLine = lines.find((candidate) => {
      const candidateIndent = candidate.match(/^\s*/)?.[0].length ?? 0;
      return candidateIndent > indent;
    });
    const container: Record<string, unknown> | unknown[] = nextLine?.trim().startsWith("- ") ? [] : {};
    parent[key] = container;
    stack.push({ indent, value: container });
  });

  return root;
};

export const normalizeYAML = (input: string): string => {
  const lines = input.replace(/\t/g, "  ").split(/\r?\n/);
  return lines.map((line) => line.replace(/\s+$/g, "")).join("\n").trim();
};

export const formatSQLQuery = (input: string): string => {
  const clauses = [
    "SELECT",
    "FROM",
    "WHERE",
    "GROUP BY",
    "HAVING",
    "ORDER BY",
    "LIMIT",
    "OFFSET",
    "JOIN",
    "LEFT JOIN",
    "RIGHT JOIN",
    "INNER JOIN",
    "OUTER JOIN",
    "FULL JOIN",
    "VALUES",
    "SET",
  ];
  let output = input.replace(/\s+/g, " ").trim();
  clauses.forEach((clause) => {
    output = output.replace(new RegExp(`\\s+${clause}\\s+`, "gi"), `\n${clause} `);
  });
  output = output.replace(/\b(select|from|where|group by|having|order by|limit|offset|join|left join|right join|inner join|outer join|full join|values|set|and|or|insert|update|delete|create|alter|drop|table)\b/gi, (match) => match.toUpperCase());
  output = output.replace(/\s*,\s*/g, ",\n  ");
  output = output.replace(/\s*;\s*$/g, ";");
  return output.trim();
};

export const minifyCSSBasic = (css: string): string =>
  css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s*([{}:;,])\s*/g, "$1")
    .replace(/;}/g, "}")
    .replace(/\s*([>+~])\s*/g, "$1")
    .replace(/\s+/g, " ")
    .trim();

export const minifyHTMLBasic = (html: string): string =>
  html
    .replace(/<!--(?!\[if)[\s\S]*?-->/g, "")
    .replace(/>\s+</g, "><")
    .replace(/\s{2,}/g, " ")
    .trim();
