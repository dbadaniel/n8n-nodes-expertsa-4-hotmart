"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productsFields = exports.productsOperations = void 0;
exports.productsOperations = [
    {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
            show: {
                resource: ['products'],
            },
        },
        options: [
            {
                name: 'Get Many',
                value: 'getAll',
                description: 'Get all products',
                action: 'List all products',
                routing: {
                    request: {
                        method: 'GET',
                        url: '/products/api/v1/products',
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
            {
                name: 'List Product Offers',
                value: 'getOffers',
                description: 'Get the offers of a product',
                action: 'List product offers',
                routing: {
                    request: {
                        method: 'GET',
                        url: '=/products/api/v1/products/{{$parameter.productUcode}}/offers',
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
            {
                name: 'List Product Plans',
                value: 'getPlans',
                description: 'Get the subscription plans of a product',
                action: 'List product plans',
                routing: {
                    request: {
                        method: 'GET',
                        url: '=/products/api/v1/products/{{$parameter.productUcode}}/plans',
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
        default: 'getAll',
    },
];
exports.productsFields = [
    {
        displayName: 'Product UUID',
        name: 'productUcode',
        type: 'string',
        required: true,
        displayOptions: {
            show: {
                resource: ['products'],
                operation: ['getOffers', 'getPlans'],
            },
        },
        default: '',
        placeholder: 'ab907e46-a9aa-4d25-ae4f-cec316d01560',
        description: 'Unique identifier (UUID) of the product',
    },
    {
        displayName: 'Return All',
        name: 'returnAll',
        type: 'boolean',
        displayOptions: {
            show: {
                resource: ['products'],
                operation: ['getAll', 'getOffers', 'getPlans'],
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
                resource: ['products'],
                operation: ['getAll', 'getOffers', 'getPlans'],
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
                resource: ['products'],
                operation: ['getAll'],
            },
        },
        options: [
            {
                displayName: 'Format',
                name: 'format',
                type: 'options',
                options: [
                    { name: 'Agent', value: 'AGENT' },
                    { name: 'Audios', value: 'AUDIOS' },
                    { name: 'Bundle', value: 'BUNDLE' },
                    { name: 'Serial Codes', value: 'SERIAL_CODES' },
                    { name: 'Community', value: 'COMMUNITY' },
                    { name: 'Online Course', value: 'ONLINE_COURSE' },
                    { name: 'E-Book', value: 'EBOOK' },
                    { name: 'E-Ticket', value: 'ETICKET' },
                    { name: 'Online Event', value: 'ONLINE_EVENT' },
                    { name: 'Images', value: 'IMAGES' },
                    { name: 'Mobile Apps', value: 'MOBILE_APPS' },
                    { name: 'Online Service', value: 'ONLINE_SERVICE' },
                    { name: 'Software', value: 'SOFTWARE' },
                    { name: 'Templates', value: 'TEMPLATES' },
                    { name: 'Videos', value: 'VIDEOS' },
                ],
                default: 'ONLINE_COURSE',
                description: 'Filter by product format',
                routing: {
                    send: {
                        type: 'query',
                        property: 'format',
                    },
                },
            },
            {
                displayName: 'Product ID',
                name: 'id',
                type: 'number',
                default: 0,
                description: 'Filter by specific product ID',
                routing: {
                    send: {
                        type: 'query',
                        property: 'id',
                    },
                },
            },
            {
                displayName: 'Status',
                name: 'status',
                type: 'options',
                options: [
                    { name: 'Changes Pending', value: 'CHANGES_PENDING_ON_PRODUCT' },
                    { name: 'Active', value: 'ACTIVE' },
                    { name: 'Deleted', value: 'DELETED' },
                    { name: 'In Review', value: 'IN_REVIEW' },
                    { name: 'Not Approved', value: 'NOT_APPROVED' },
                    { name: 'Paused', value: 'PAUSED' },
                    { name: 'Draft', value: 'DRAFT' },
                ],
                default: 'ACTIVE',
                description: 'Filter by product status',
                routing: {
                    send: {
                        type: 'query',
                        property: 'status',
                    },
                },
            },
        ],
    },
];
