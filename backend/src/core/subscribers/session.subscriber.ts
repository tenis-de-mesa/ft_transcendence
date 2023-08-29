import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';
import { Session } from '../entities';

@EventSubscriber()
export class SessionSubscriber implements EntitySubscriberInterface<Session> {
  /**
   * Indicates that this subscriber only listen to Session events.
   */
  listenTo() {
    return Session;
  }

  /**
   * Called before Session insertion.
   */
  beforeInsert(event: InsertEvent<Session>) {
    const json = JSON.parse(event.entity.json);
    const user_id = json.passport.user;
    const manager = event.manager;
    manager.merge(Session, event.entity, { user_id: user_id });
  }
}
