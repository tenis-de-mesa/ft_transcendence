import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';
import { SessionEntity } from '../entities';

@EventSubscriber()
export class SessionSubscriber
  implements EntitySubscriberInterface<SessionEntity>
{
  /**
   * Indicates that this subscriber only listen to Session events.
   */
  listenTo() {
    return SessionEntity;
  }

  /**
   * Called before Session insertion.
   */
  beforeInsert(event: InsertEvent<SessionEntity>) {
    const json = JSON.parse(event.entity.json);
    const userId = json.passport.user;
    const manager = event.manager;
    manager.merge(SessionEntity, event.entity, { userId: userId });
  }
}
