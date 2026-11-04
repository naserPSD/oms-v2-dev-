// src/module/media/subscribers/media.subscriber.ts
import {
  EventSubscriber,
  EntitySubscriberInterface,
  DataSource,
  InsertEvent,
  UpdateEvent,
  RemoveEvent,
  LoadEvent,
} from 'typeorm';
import { Media } from '../entities/media.entity';
import { MediaService } from '../media.service';
import { Injectable } from '@nestjs/common';

/**
 * This subscriber ensures that whenever a Media entity is loaded,
 * it calls MediaService.getFile() to make sure the file exists locally.
 */
@Injectable()
@EventSubscriber()
export class MediaSubscriber implements EntitySubscriberInterface<Media> {
  constructor(
    private dataSource: DataSource,
    private readonly mediaService: MediaService,
  ) {
    this.dataSource.subscribers.push(this);
  }

  listenTo() {
    return Media;
  }

  /**
   * Trigger after entity is loaded from database
   */
  async afterLoad(entity: Media, event?: LoadEvent<Media>): Promise<void> {
    if (entity?.id && entity.filename) {
      try {
        await this.mediaService.downloadFileFromAwsByFileNameIfMissing(entity);
      } catch (e) {
        // You can log but don’t throw here, to avoid blocking loading
        console.warn(
          `[MediaSubscriber] Failed to sync file ID=${entity.id}`,
          e.message,
        );
      }
    }
  }
}
