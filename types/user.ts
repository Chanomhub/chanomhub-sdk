/**
 * Chanomhub SDK - User Types
 */

/** Current logged-in user */
export interface User {
    id: number;
    email: string;
    username: string;
    bio: string | null;
    image: string | null;
    token?: string;
}

/** User response wrapper */
export interface UserResponse {
    user: User;
}

/** Public profile */
export interface Profile {
    username: string;
    bio: string | null;
    image: string | null;
    following: boolean;
}

/** Profile response wrapper */
export interface ProfileResponse {
    profile: Profile;
}
