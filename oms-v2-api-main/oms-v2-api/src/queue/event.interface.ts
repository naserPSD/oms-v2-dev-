// src/queue/event.interface.ts
export interface AppEvent<T = any> {
  name: string; // e.g. "employee.created"
  payload: T; // data for the event
  timestamp?: number; // optional
}
