import fs from "fs";
import path from "path";

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");

// Helper to ensure data directory exists and returns file path
function getFilePath(tableName: string): string {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const file = path.join(DATA_DIR, `${tableName}.json`);
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify([], null, 2), "utf8");
  }
  return file;
}

// Low-level read/write functions with cache to avoid disk thrashing
const cache: { [key: string]: any[] } = {};

function readTable<T>(tableName: string): T[] {
  if (cache[tableName]) {
    return cache[tableName] as T[];
  }
  const file = getFilePath(tableName);
  try {
    const content = fs.readFileSync(file, "utf8");
    const data = JSON.parse(content);
    cache[tableName] = data;
    return data as T[];
  } catch (err) {
    console.error(`Error reading table ${tableName}:`, err);
    return [];
  }
}

function writeTable<T>(tableName: string, data: T[]): void {
  cache[tableName] = data;
  const file = getFilePath(tableName);
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error(`Error writing table ${tableName}:`, err);
  }
}

// Generate a random 8-character ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

// Model class to mimic Mongoose
export class DBCollection<T extends { id: string; [key: string]: any }> {
  constructor(private tableName: string) {}

  find(filter?: Partial<T> | ((item: T) => boolean)): T[] {
    const data = readTable<T>(this.tableName);
    if (!filter) return data;
    if (typeof filter === "function") {
      return data.filter(filter);
    }
    return data.filter((item) => {
      for (const key in filter) {
        if (item[key] !== filter[key]) return false;
      }
      return true;
    });
  }

  findOne(filter: Partial<T> | ((item: T) => boolean)): T | null {
    const results = this.find(filter);
    return results.length > 0 ? results[0] : null;
  }

  findById(id: string): T | null {
    return this.findOne({ id } as any);
  }

  create(doc: Omit<T, "id"> & { id?: string }): T {
    const data = readTable<T>(this.tableName);
    const newDoc = {
      id: generateId(),
      ...doc,
      createdAt: new Date().toISOString(),
    } as unknown as T;
    data.push(newDoc);
    writeTable(this.tableName, data);
    return newDoc;
  }

  findByIdAndUpdate(id: string, update: Partial<T>): T | null {
    const data = readTable<T>(this.tableName);
    const index = data.findIndex((item) => item.id === id);
    if (index === -1) return null;
    data[index] = { ...data[index], ...update, updatedAt: new Date().toISOString() };
    writeTable(this.tableName, data);
    return data[index];
  }

  findByIdAndDelete(id: string): boolean {
    const data = readTable<T>(this.tableName);
    const index = data.findIndex((item) => item.id === id);
    if (index === -1) return false;
    data.splice(index, 1);
    writeTable(this.tableName, data);
    return true;
  }

  // Helper to clear table (mainly for seeding)
  clear(): void {
    writeTable(this.tableName, []);
  }
}

// Instantiate and export database collections
export const Users = new DBCollection<any>("users");
export const Branches = new DBCollection<any>("branches");
export const Subjects = new DBCollection<any>("subjects");
export const Faculty = new DBCollection<any>("faculty");
export const Students = new DBCollection<any>("students");
export const Rooms = new DBCollection<any>("rooms");
export const Timetables = new DBCollection<any>("timetables");
export const Notifications = new DBCollection<any>("notifications");

// Clash Detection Helper
export function checkTimetableClash(newClass: {
  id?: string;
  day: string;
  startTime: string;
  endTime: string;
  faculty: string;
  room: string;
  branch: string;
  section: string;
  semester: string;
}): { clash: boolean; message?: string } {
  const list = Timetables.find((t) => t.status !== "Rejected" && t.day === newClass.day && t.id !== newClass.id);

  const toMins = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  const sNew = toMins(newClass.startTime);
  const eNew = toMins(newClass.endTime);

  for (const item of list) {
    const sItem = toMins(item.startTime);
    const eItem = toMins(item.endTime);

    // Check overlap
    const overlaps = Math.max(sNew, sItem) < Math.min(eNew, eItem);
    if (overlaps) {
      // 1. Faculty clash
      if (item.faculty === newClass.faculty) {
        return {
          clash: true,
          message: `Faculty clash: Faculty member already has a class "${item.subject}" in Room ${item.room} at this time (${item.startTime} - ${item.endTime}).`,
        };
      }
      // 2. Room clash
      if (item.room === newClass.room) {
        return {
          clash: true,
          message: `Room clash: Room ${newClass.room} is already booked for class "${item.subject}" (${item.startTime} - ${item.endTime}).`,
        };
      }
      // 3. Class (Branch + Section + Semester) clash
      if (
        item.branch === newClass.branch &&
        item.section === newClass.section &&
        item.semester === newClass.semester
      ) {
        return {
          clash: true,
          message: `Section clash: Branch ${newClass.branch}, Section ${newClass.section}, Semester ${newClass.semester} already has class "${item.subject}" at this time (${item.startTime} - ${item.endTime}).`,
        };
      }
    }
  }

  return { clash: false };
}
