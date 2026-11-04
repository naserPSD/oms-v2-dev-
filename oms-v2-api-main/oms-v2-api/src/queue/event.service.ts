// src/events/event.service.ts
import { AppEvent } from './event.interface';

export abstract class EventService {
  abstract publish<T>(event: AppEvent<T>): Promise<void>;
}
