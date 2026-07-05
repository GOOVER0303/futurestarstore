import { v4 as uuidv4 } from "uuid";
export const genId = () => uuidv4();
export const now = () => new Date().toISOString();

export function generateOrderNum(): string {
  const d = new Date();
  const ds = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}`;
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `FC${ds}${rand}`;
}
