import type { INodeProperties } from 'n8n-workflow';

export const authOperations: INodeProperties[] = [
    {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
            show: {
                resource: ['auth'],
            },
        },
        options: [
            {
                name: 'Get Access Token',
                value: 'getAccessToken',
                description: 'Get an access token using your OAuth credentials. Use this token in subsequent SaaS mode operations.',
                action: 'Get access token',
            },
        ],
        default: 'getAccessToken',
    },
];

export const authFields: INodeProperties[] = [
    // ----------------------------------
    //         Get Access Token
    // ----------------------------------
    {
        displayName: 'Client ID',
        name: 'authClientId',
        type: 'string',
        required: true,
        displayOptions: {
            show: {
                resource: ['auth'],
                operation: ['getAccessToken'],
            },
        },
        default: '',
        description: 'The Client ID from your Hotmart Developer Credentials. Find it in: your Hotmart account -> Tools -> Developer Credentials.',
    },
    {
        displayName: 'Client Secret',
        name: 'authClientSecret',
        type: 'string',
        typeOptions: {
            password: true,
        },
        required: true,
        displayOptions: {
            show: {
                resource: ['auth'],
                operation: ['getAccessToken'],
            },
        },
        default: '',
        description: 'The Client Secret from your Hotmart Developer Credentials. Keep this value secure and never share it.',
    },
    {
        displayName: 'Basic Token',
        name: 'authBasicToken',
        type: 'string',
        typeOptions: {
            password: true,
        },
        required: true,
        displayOptions: {
            show: {
                resource: ['auth'],
                operation: ['getAccessToken'],
            },
        },
        default: '',
        description: 'The Basic Token for OAuth authentication. IMPORTANT: Do not include the "Basic " prefix - only the token itself. This is the Base64 value of the client_id:client_secret string.',
    },
    {
        displayName: 'Environment',
        name: 'authEnvironment',
        type: 'options',
        required: true,
        displayOptions: {
            show: {
                resource: ['auth'],
                operation: ['getAccessToken'],
            },
        },
        options: [
            {
                name: 'Production',
                value: 'production',
            },
            {
                name: 'Sandbox',
                value: 'sandbox',
            },
        ],
        default: 'production',
        description: 'The Hotmart environment. IMPORTANT: Production credentials only work in Production. Sandbox credentials only work in Sandbox.',
    },
];
