import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import AppResponse from 'src/common/models/AppResponse';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  async create(@Body() createContactDto: CreateContactDto) {
    const { err, data } = await this.contactsService.create(createContactDto);
    if (err) throw err;

    return AppResponse.ok(data);
  }

  @Get()
  async findAll(
    @Query('limit') limit: number,
    @Query('offset') offset: number,
  ) {
    const { err, data } = await this.contactsService.findAll(limit, offset);
    if (err) throw err;

    return AppResponse.ok(data);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const { err, data } = await this.contactsService.findOne(+id);
    if (err) throw err;

    return AppResponse.ok(data);
  }

  @Post(':id')
  async update(
    @Param('id') id: string,
    @Body() updateContactDto: UpdateContactDto,
  ) {
    const { err, data } = await this.contactsService.update(
      +id,
      updateContactDto,
    );
    if (err) throw err;

    return AppResponse.ok(data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const { err, data } = await this.contactsService.delete(+id);
    if (err) throw err;

    return AppResponse.ok(data);
  }
}
