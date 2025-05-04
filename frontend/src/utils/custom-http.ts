import {Auth} from "./auth";
import {RequestParams} from "../types";

export class CustomHttp {
    public static async request<T>(url: string, method: string = "GET", body: unknown = null): Promise<T> {

        const params: RequestParams = {
            method: method,
            headers: {
                'Content-type': 'application/json',
                'Accept': 'application/json',
            }
        }
        const token: string | null = localStorage.getItem(Auth.accessTokenKey);
        if (token) {
            params.headers['x-auth-token'] = token;
        }
        if (body) {
            params.body = JSON.stringify(body);
        }
        const response: Response = await fetch(url, params);
        if (!response.ok) {
            if (response.status === 401 && location.pathname !== '/login') {
                await Auth.processUnauthorizedResponse();
                return this.request<T>(url, method, body);
            }
            throw new Error(await response.text());
        }
        return await response.json() as Promise<T>;
    }
}