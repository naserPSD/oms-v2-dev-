import { Injectable, Scope } from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import { CacheService } from 'src/redis/cache.service';

// @Injectable({ scope: Scope.REQUEST })
@Injectable({ scope: Scope.REQUEST })
export class UserContextService {
  private user: User;

  setUser(user: User) {
    this.user = user;
  }

  getUser(): User {
    return this.user;
  }

  getUserId(): number {
    return this.user?.id;
  }

  getUserEmail(): string {
    return this.user?.email;
  }
}
