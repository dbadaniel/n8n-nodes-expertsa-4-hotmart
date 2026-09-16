import type { INodeProperties } from 'n8n-workflow';

export const eventsOperations: INodeProperties[] = [
    {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
            show: {
                resource: ['events'],
            },
        },
        options: [
            {
                name: 'Event Information',
                value: 'getInfo',
                description: 'Get information about an event',
                action: 'Get event info',
                routing: {
                    request: {
                        method: 'GET',
                        url: '=/events/api/v1/{{$parameter.eventId}}/info',
                    },
                },
            },
            {
                name: 'List Participants',
                value: 'getParticipants',
                description: 'Get the list of tickets and participants for the event',
                action: 'List event participants',
                routing: {
                    request: {
                        method: 'GET',
                        url: '=/events/api/v1/{{$parameter.eventId}}/participants',
                    },
                    output: {
                        postReceive: [
                            {
                                type: 'rootProperty',
                                properties: {
                                    property: 'items',
                                },
                            },
                        ],
                    },
                },
            },
        ],
        default: 'getInfo',
    },
];

export const eventsFields: INodeProperties[] = [
    {
        displayName: 'Event ID',
        name: 'eventId',
        type: 'number',
        required: true,
        displayOptions: {
            show: {
                resource: ['events'],
            },
        },
        default: 0,
        description: 'Product ID (product in the Event Ticket format)',
    },
    {
        displayName: 'Return All',
        name: 'returnAll',
        type: 'boolean',
        displayOptions: {
            show: {
                resource: ['events'],
                operation: ['getParticipants'],
            },
        },
        default: false,
        description: 'Whether to return all results or only up to a given limit',
    },
    {
        displayName: 'Limit',
        name: 'limit',
        type: 'number',
        displayOptions: {
            show: {
                resource: ['events'],
                operation: ['getParticipants'],
                returnAll: [false],
            },
        },
        typeOptions: {
            minValue: 1,

        },
        default: 50,
        description: 'Max number of results to return',
        routing: {
            send: {
                type: 'query',
                property: 'max_results',
            },
        },
    },
    {
        displayName: 'Filters',
        name: 'filters',
        type: 'collection',
        placeholder: 'Add Filter',
        default: {},
        displayOptions: {
            show: {
                resource: ['events'],
                operation: ['getParticipants'],
            },
        },
        options: [
            {
                displayName: 'Buyer Email',
                name: 'buyer_email',
                type: 'string',
                default: '',
                description: 'Filter by buyer email',
                routing: {
                    send: {
                        type: 'query',
                        property: 'buyer_email',
                    },
                },
            },
            {
                displayName: 'Check-In Status',
                name: 'checkin_status',
                type: 'options',
                options: [
                    { name: 'All', value: 'ALL' },
                    { name: 'Concluded', value: 'CONCLUDED' },
                    { name: 'Partial', value: 'PARTIAL' },
                    { name: 'Pending', value: 'PENDING' },
                ],
                default: 'ALL',
                description: 'Filter by data completion status',
                routing: {
                    send: {
                        type: 'query',
                        property: 'checkin_status',
                    },
                },
            },
            {
                displayName: 'Last Update',
                name: 'last_update',
                type: 'number',
                default: 0,
                description: 'Date of the last update (in milliseconds since 1970-01-01)',
                routing: {
                    send: {
                        type: 'query',
                        property: 'last_update',
                    },
                },
            },
            {
                displayName: 'Lot ID',
                name: 'id_lot',
                type: 'number',
                default: 0,
                description: 'ID of the ticket batch/category',
                routing: {
                    send: {
                        type: 'query',
                        property: 'id_lot',
                    },
                },
            },
            {
                displayName: 'Participant Email',
                name: 'participant_email',
                type: 'string',
                default: '',
                description: 'Filter by participant email',
                routing: {
                    send: {
                        type: 'query',
                        property: 'participant_email',
                    },
                },
            },
            {
                displayName: 'Ticket ID',
                name: 'id_eticket',
                type: 'number',
                default: 0,
                description: 'Sequential ticket ID',
                routing: {
                    send: {
                        type: 'query',
                        property: 'id_eticket',
                    },
                },
            },
            {
                displayName: 'Ticket QR Code',
                name: 'ticket_qr_code',
                type: 'string',
                default: '',
                description: 'Unique ticket code (QR Code)',
                routing: {
                    send: {
                        type: 'query',
                        property: 'ticket_qr_code',
                    },
                },
            },
            {
                displayName: 'Ticket Status',
                name: 'ticket_status',
                type: 'options',
                options: [
                    { name: 'Available', value: 'AVAILABLE' },
                    { name: 'Chargeback', value: 'CHARGEBACK' },
                    { name: 'Excluded', value: 'EXCLUDED' },
                    { name: 'Invite', value: 'INVITE' },
                    { name: 'Invite Canceled', value: 'INVITE_CANCELED' },
                    { name: 'Refunded', value: 'REFUNDED' },
                    { name: 'Reserved', value: 'RESERVED' },
                    { name: 'Sold', value: 'SOLD' },
                ],
                default: 'SOLD',
                description: 'Filter by ticket status',
                routing: {
                    send: {
                        type: 'query',
                        property: 'ticket_status',
                    },
                },
            },
            {
                displayName: 'Ticket Type',
                name: 'ticket_type',
                type: 'options',
                options: [
                    { name: 'All', value: 'ALL' },
                    { name: 'Free', value: 'FREE' },
                    { name: 'Paid', value: 'PAID' },
                ],
                default: 'ALL',
                description: 'Filter by ticket type',
                routing: {
                    send: {
                        type: 'query',
                        property: 'ticket_type',
                    },
                },
            },
        ],
    },
];
