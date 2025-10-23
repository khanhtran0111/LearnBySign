export declare class UpdateUserDto {
    fullName?: string;
    phone?: string;
    birthDate?: string;
    avatarUrl?: string;
    level?: 'newbie' | 'basic' | 'advanced';
    preferences?: {
        language?: 'vi' | 'en';
        theme?: 'light' | 'dark';
        subtitles?: boolean;
        cameraFps?: 15 | 30 | 60;
    };
    status?: {
        isActive?: boolean;
        emailVerified?: boolean;
        phoneVerified?: boolean;
    };
}
