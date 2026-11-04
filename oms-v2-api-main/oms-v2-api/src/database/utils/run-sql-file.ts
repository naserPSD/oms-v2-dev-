import * as fs from 'fs';
import * as path from 'path';
import { QueryRunner } from 'typeorm';

/**
 * Executes a .sql dump file statement-by-statement.
 * Handles mysqldump output (comments, LOCK/UNLOCK, SET directives).
 */
export async function runSqlFile(
  queryRunner: QueryRunner,
  filePath: string,
): Promise<void> {
  const absolute = path.isAbsolute(filePath)
    ? filePath
    : path.join(process.cwd(), filePath);

  if (!fs.existsSync(absolute)) {
    throw new Error(`SQL file not found: ${absolute}`);
  }

  let sql = fs.readFileSync(absolute, 'utf8');
  // Strip UTF-8 BOM if present (PowerShell Out-File)
  if (sql.charCodeAt(0) === 0xfeff) {
    sql = sql.slice(1);
  }

  const statements = splitSqlStatements(sql);
  for (const statement of statements) {
    await queryRunner.query(statement);
  }
}

export function splitSqlStatements(sql: string): string[] {
  const lines = sql.replace(/\r\n/g, '\n').split('\n');
  const kept: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith('--')) continue;
    // Skip mysqldump versioned comments that only restore session vars
    if (/^\/\*![0-9]{5}.*\*\/;?\s*$/.test(trimmed)) {
      // keep SET NAMES / FOREIGN_KEY_CHECKS style directives inside /*!...*/
      if (
        /SET\s+/i.test(trimmed) ||
        /UNIQUE_CHECKS|FOREIGN_KEY_CHECKS|SQL_MODE|NAMES|TIME_ZONE|SQL_NOTES/i.test(
          trimmed,
        )
      ) {
        kept.push(
          trimmed.replace(/^\/\*![0-9]{5}\s*/, '').replace(/\*\/;?$/, ';'),
        );
      }
      continue;
    }
    kept.push(line);
  }

  const body = kept.join('\n');
  const statements: string[] = [];
  let buffer = '';
  let inSingle = false;
  let inDouble = false;
  let escaped = false;

  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    buffer += ch;

    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === '\\') {
      escaped = true;
      continue;
    }
    if (ch === "'" && !inDouble) {
      inSingle = !inSingle;
      continue;
    }
    if (ch === '"' && !inSingle) {
      inDouble = !inDouble;
      continue;
    }
    if (ch === ';' && !inSingle && !inDouble) {
      const stmt = buffer.trim().replace(/;$/, '').trim();
      buffer = '';
      if (!stmt) continue;
      // Skip CREATE/USE database — connection already targets MYSQL_DATABASE
      if (/^(CREATE DATABASE|USE)\b/i.test(stmt)) continue;
      statements.push(stmt);
    }
  }

  const tail = buffer.trim().replace(/;$/, '').trim();
  if (tail && !/^(CREATE DATABASE|USE)\b/i.test(tail)) {
    statements.push(tail);
  }

  return statements;
}
