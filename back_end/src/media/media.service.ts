import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseClient } from '../supabase.client';

@Injectable()
export class MediaService {
    private supabase: SupabaseClient;
    private readonly bucketName = 'learnbysign-media';

    constructor(private configService: ConfigService) {
        const url = this.configService.get<string>('SUPABASE_URL');
        const key =
            this.configService.get<string>('SUPABASE_SERVICE_ROLE') ||
            this.configService.get<string>('SUPABASE_PUBLIC_ANON_KEY');

        if (!url || !key) {
            throw new Error('Missing Supabase URL or Key');
        }

        this.supabase = getSupabaseClient(url, key);
    }

    async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
        if (!file) {
            throw new BadRequestException('File is required');
        }

        const fileName = `${Date.now()}_${file.originalname.replace(/\s+/g, '_')}`;
        const filePath = folder ? `${folder}/${fileName}` : fileName;

        const { error } = await this.supabase.storage
            .from(this.bucketName)
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: false,
            });

        if (error) {
            throw new BadRequestException(`Upload failed: ${error.message}`);
        }

        const { data: publicUrlData } = this.supabase.storage
            .from(this.bucketName)
            .getPublicUrl(filePath);

        return publicUrlData.publicUrl;
    }

    async listFiles(folder: string): Promise<any[]> {
        const { data, error } = await this.supabase.storage
            .from(this.bucketName)
            .list(folder || '', {
                limit: 100,
                offset: 0,
                sortBy: { column: 'name', order: 'asc' },
            });

        if (error) {
            throw new BadRequestException(`List files failed: ${error.message}`);
        }

        // Generate public URLs for each file
        return data.map((file) => {
            const filePath = folder ? `${folder}/${file.name}` : file.name;
            const { data: publicUrlData } = this.supabase.storage
                .from(this.bucketName)
                .getPublicUrl(filePath);

            return {
                ...file,
                publicUrl: publicUrlData.publicUrl,
            };
        });
    }
}
