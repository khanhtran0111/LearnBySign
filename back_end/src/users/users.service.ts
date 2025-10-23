// src/users/users.service.ts
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as argon2 from 'argon2';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  private normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }

  async create(dto: CreateUserDto) {
    const email = this.normalizeEmail(dto.email);

    const dup = await this.userModel.findOne({ email }).lean();
    if (dup) throw new ConflictException('Email đã tồn tại');

    try {
      const passwordHash = await argon2.hash(dto.password);
      const doc = await this.userModel.create({
        email,
        phone: dto.phone?.trim(),
        fullName: dto.fullName,
        birthDate: dto.birthDate,
        passwordHash
      });
      return { id: String(doc._id) };
    } catch (e: any) {
      if (e?.code === 11000) throw new ConflictException('Email đã tồn tại');
      throw e;
    }
  }

  findById(id: string) {
    return this.userModel.findById(id).select('-passwordHash').lean();
  }

  findByEmail(email: string) {
    return this.userModel.findOne({ email: this.normalizeEmail(email) }).lean();
  }

  async update(id: string, patch: UpdateUserDto) {
    const safe: any = { ...patch };
    if (safe.email) safe.email = this.normalizeEmail(safe.email);
    if (typeof safe.phone === 'string') safe.phone = safe.phone.trim();
    delete safe.passwordHash;

    try {
      const doc = await this.userModel
        .findByIdAndUpdate(id, safe, { new: true, runValidators: true })
        .select('-passwordHash')
        .lean();
      if (!doc) throw new NotFoundException();
      return doc;
    } catch (e: any) {
      if (e?.code === 11000) throw new ConflictException('Email đã tồn tại');
      throw e;
    }
  }

  async softDelete(id: string) {
    const doc = await this.userModel
      .findByIdAndUpdate(
        id,
        { deletedAt: new Date(), 'status.isActive': false },
        { new: true }
      )
      .lean();
    if (!doc) throw new NotFoundException();
    return { ok: true };
  }
}
