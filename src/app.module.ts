import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { ToursModule } from './tours/tours.module';
import { DestinationsModule } from './destinations/destinations.module';
import { FormsModule } from './forms/forms.module';
import { ReviewsModule } from './reviews/reviews.module';
import { ContactsModule } from './contacts/contacts.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        '.env',
        '.env.development',
        '.env.staging',
        '.env.production',
      ],
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    ToursModule,
    DestinationsModule,
    FormsModule,
    ReviewsModule,
    ContactsModule,
    ProductsModule,
    OrdersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
