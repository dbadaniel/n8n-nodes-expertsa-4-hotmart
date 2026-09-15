import type {
    IExecuteFunctions,
    IDataObject,
    IHttpRequestMethods,
    IHttpRequestOptions,
    JsonObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

export interface IHotmartCredentials {
    environment: 'production' | 'sandbox';
    clientId: string;
    clientSecret: string;
    basicToken: string;
}

interface ITokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    scope?: string;
    jti?: string;
}

interface ITokenCache {
    token: string;
    expiry: number;
    tokenType: string;
}

// Expiry buffer: 5 minutes before the token expires
const TOKEN_EXPIRY_BUFFER_MS = 5 * 60 * 1000;

// Retry settings for rate limiting
const RATE_LIMIT_RETRY_COUNT = 3;
const RATE_LIMIT_BASE_DELAY_MS = 1000;

// Cache for access tokens
const tokenCache: Map<string, ITokenCache> = new Map();

/**
 * Delay helper for retry with backoff
 */
function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Gets the base URL based on the environment
 */
export function getBaseUrl(environment: string): string {
    return environment === 'sandbox'
        ? 'https://sandbox.hotmart.com'
        : 'https://developers.hotmart.com';
}

/**
 * Generates the unique cache key for the credentials
 */
function getCacheKey(credentials: IHotmartCredentials): string {
    return `${credentials.clientId}:${credentials.environment}`;
}

/**
 * Invalidates the token cache for the specified credentials
 */
export function invalidateTokenCache(credentials: IHotmartCredentials): void {
    const cacheKey = getCacheKey(credentials);
    tokenCache.delete(cacheKey);
}

/**
 * Gets an OAuth access token using the client credentials flow
 * Implements caching with a 5-minute expiry buffer
 */
export async function getAccessToken(
    credentials: IHotmartCredentials,
): Promise<string> {
    const cacheKey = getCacheKey(credentials);
    const cached = tokenCache.get(cacheKey);

    // Return the cached token if still valid (with a 5-minute buffer)
    if (cached && cached.expiry > Date.now() + TOKEN_EXPIRY_BUFFER_MS) {
        return cached.token;
    }

    const authUrl = 'https://api-sec-vlc.hotmart.com/security/oauth/token';

    try {
        const response = await fetch(authUrl, {
            method: 'POST',
            headers: {
                Authorization: `Basic ${credentials.basicToken}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'client_credentials',
                client_id: credentials.clientId,
                client_secret: credentials.clientSecret,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Authentication failed (${response.status}): ${errorText || response.statusText}`);
        }

        const data = (await response.json()) as ITokenResponse;

        // Validate the token type
        if (data.token_type?.toLowerCase() !== 'bearer') {
            throw new Error(`Unexpected token type: ${data.token_type}`);
        }

        // Cache the token
        tokenCache.set(cacheKey, {
            token: data.access_token,
            expiry: Date.now() + (data.expires_in * 1000),
            tokenType: data.token_type,
        });

        return data.access_token;
    } catch (error) {
        throw new Error(`Failed to get access token from Hotmart: ${(error as Error).message}`);
    }
}

/**
 * Makes an authenticated request to the Hotmart API
 * Implements automatic retry on 401 (token) and 429 (rate limit) errors
 */
export async function hotmartApiRequest(
    this: IExecuteFunctions,
    method: IHttpRequestMethods,
    endpoint: string,
    body: IDataObject = {},
    qs: IDataObject = {},
    retryCount: number = 0,
): Promise<IDataObject | IDataObject[]> {
    const credentials = await this.getCredentials('hotmartApi') as unknown as IHotmartCredentials;
    const accessToken = await getAccessToken(credentials);
    const baseUrl = getBaseUrl(credentials.environment);

    const options: IHttpRequestOptions = {
        method,
        url: `${baseUrl}${endpoint}`,
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        qs,
        json: true,
    };

    if (Object.keys(body).length > 0) {
        options.body = body;
    }

    try {
        const response = await this.helpers.httpRequest(options);
        return response as IDataObject | IDataObject[];
    } catch (error) {
        const err = error as { statusCode?: number; message?: string };

        // Retry for 401 (expired token) - only on the first attempt
        if (err.statusCode === 401 && retryCount === 0) {
            invalidateTokenCache(credentials);
            return hotmartApiRequest.call(this, method, endpoint, body, qs, 1);
        }

        // Retry for 429 (rate limit) with exponential backoff
        if (err.statusCode === 429 && retryCount < RATE_LIMIT_RETRY_COUNT) {
            const delayMs = RATE_LIMIT_BASE_DELAY_MS * Math.pow(2, retryCount);
            await delay(delayMs);
            return hotmartApiRequest.call(this, method, endpoint, body, qs, retryCount + 1);
        }

        // Improved error message for rate limiting
        let errorMessage = err.message || 'Unknown error in request';
        if (err.statusCode === 429) {
            errorMessage = `Hotmart API rate limit exceeded after ${RATE_LIMIT_RETRY_COUNT} attempts. Wait a few minutes before trying again. Tip: reduce the request frequency or use pagination to fetch less data at a time.`;
        }

        throw new NodeApiError(this.getNode(), {
            message: errorMessage
        } as JsonObject);
    }
}

/**
 * Makes an authenticated request with pagination support
 * Gets all items from paginated endpoints
 */
export async function hotmartApiRequestAllItems(
    this: IExecuteFunctions,
    method: IHttpRequestMethods,
    endpoint: string,
    body: IDataObject = {},
    qs: IDataObject = {},
): Promise<IDataObject[]> {
    const returnData: IDataObject[] = [];
    let pageToken: string | undefined;

    do {
        if (pageToken) {
            qs.page_token = pageToken;
        }

        const response = await hotmartApiRequest.call(this, method, endpoint, body, qs) as IDataObject;

        const items = (response.items as IDataObject[]) || [];
        returnData.push(...items);

        pageToken = response.page_token as string | undefined;
    } while (pageToken);

    return returnData;
}

/**
 * Tests the Hotmart credentials by obtaining a token
 * Returns true if successful, throws an error if it fails
 */
export async function testHotmartCredentials(
    credentials: IHotmartCredentials,
): Promise<boolean> {
    try {
        await getAccessToken(credentials);
        return true;
    } catch (error) {
        throw new Error(`Invalid credentials: ${(error as Error).message}`);
    }
}
