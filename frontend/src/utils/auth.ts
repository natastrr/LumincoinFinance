import config from "../../config/config";
import {AccessTokenType, ErrorResponseType} from "../types";

export class Auth {
    public static accessTokenKey: string = 'accessToken';
    public static refreshTokenKey: string = 'refreshToken';

    static async processUnauthorizedResponse(): Promise<void> {
        const refreshToken: string | null = localStorage.getItem(this.refreshTokenKey);
        try {
            if (!refreshToken) throw new Error('No refresh token.');
            const response: Response = await fetch(config.host + '/refresh', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({refreshToken})
            });
            if (!response.ok) throw new Error('Refresh failed');
            const result: AccessTokenType | ErrorResponseType = await response.json();
            if (!('tokens' in result)) throw new Error('Invalid token format');
            this.setTokens(result.tokens.accessToken, result.tokens.refreshToken);
        } catch (error) {
            this.removeTokens();
            if (location.pathname !== '/login') location.pathname = '/login';
            console.log('Auth failed:', error instanceof Error ? error.message : error);
        }
    }

    public static setTokens(accessToken: string, refreshToken: string): void {
        localStorage.setItem(this.accessTokenKey, accessToken);
        localStorage.setItem(this.refreshTokenKey, refreshToken);
    }

    public static removeTokens(): void {
        localStorage.removeItem(this.accessTokenKey);
        localStorage.removeItem(this.refreshTokenKey);
        localStorage.removeItem('user');
    }
}