import mysql from "mysql2/promise";
import { dbConfig } from "../config/env.js";

let pool: mysql.Pool | null = null;

export function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool;
}

export async function query<T = mysql.RowDataPacket[]>(
  sql: string,
  params?: unknown[]
): Promise<T> {
  const [rows] = params === undefined
    ? await getPool().execute(sql)
    : await getPool().execute(sql, params as mysql.ExecuteValues);
  return rows as T;
}

export async function getConnection(): Promise<mysql.PoolConnection> {
  return getPool().getConnection();
}
