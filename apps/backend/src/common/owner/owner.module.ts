import { Module } from '@nestjs/common';
import { OWNER_STRATEGIES } from './owner.constants';
import { ClientIdOwnerStrategy, IpOwnerStrategy } from './owner-identification.strategy';
import { OwnerService } from './owner.service';

/**
 * Provides the owner-identification strategies (Strategy + Factory) and the
 * {@link OwnerService} that resolves a visitor's opaque owner key.
 */
@Module({
  providers: [
    ClientIdOwnerStrategy,
    IpOwnerStrategy,
    {
      provide: OWNER_STRATEGIES,
      useFactory: (clientId: ClientIdOwnerStrategy, ip: IpOwnerStrategy) => [clientId, ip],
      inject: [ClientIdOwnerStrategy, IpOwnerStrategy],
    },
    OwnerService,
  ],
  exports: [OwnerService],
})
export class OwnerModule {}
