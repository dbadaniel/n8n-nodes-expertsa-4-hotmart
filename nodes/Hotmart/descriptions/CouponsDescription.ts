import type { INodeProperties } from 'n8n-workflow';

export const couponsOperations: INodeProperties[] = [
    {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
            show: {
                resource: ['coupons'],
            },
        },
        options: [
            {
                name: 'Create Coupon',
                value: 'create',
                description: 'Create a new discount coupon for a product',
                action: 'Create coupon',
            },
            {
                name: 'Get Many',
                value: 'getAll',
                description: 'Get coupons for a specific product',
                action: 'List coupons',
            },
            {
                name: 'Delete Coupon',
                value: 'delete',
                description: 'Delete a specific coupon',
                action: 'Delete coupon',
            },
        ],
        default: 'getAll',
    },
];

export const couponsFields: INodeProperties[] = [
    {
        displayName: 'Product ID',
        name: 'productId',
        type: 'string',
        required: true,
        displayOptions: {
            show: {
                resource: ['coupons'],
                operation: ['create', 'getAll'],
            },
        },
        default: '',
        description: 'Unique identifier (ID) of the product (7-digit number)',
    },

    // Create Coupon
    {
        displayName: 'Coupon Code',
        name: 'couponCode',
        type: 'string',
        required: true,
        displayOptions: {
            show: {
                resource: ['coupons'],
                operation: ['create'],
            },
        },
        default: '',
        description: 'Coupon code the customer will use at checkout (25 characters maximum)',
    },
    {
        displayName: 'Discount (%)',
        name: 'discount',
        type: 'number',
        required: true,
        typeOptions: {
            minValue: 1,
            maxValue: 99,
            numberPrecision: 0,
        },
        displayOptions: {
            show: {
                resource: ['coupons'],
                operation: ['create'],
            },
        },
        default: 10,
        description: 'Discount percentage (1-99). Example: 10 for a 10% discount.',
    },
    {
        displayName: 'Additional Options',
        name: 'additionalOptions',
        type: 'collection',
        placeholder: 'Add Option',
        default: {},
        displayOptions: {
            show: {
                resource: ['coupons'],
                operation: ['create'],
            },
        },
        options: [
            {
                displayName: 'Start Date',
                name: 'startDate',
                type: 'dateTime',
                default: '',
                description: 'Date and time the coupon will be activated',
            },
            {
                displayName: 'End Date',
                name: 'endDate',
                type: 'dateTime',
                default: '',
                description: 'Date and time the coupon will be deactivated',
            },
            {
                displayName: 'Affiliate ID',
                name: 'affiliateId',
                type: 'string',
                default: '',
                description: 'Specific affiliate ID to share the coupon exclusively',
            },
            {
                displayName: 'Offer IDs',
                name: 'offerIds',
                type: 'string',
                default: '',
                description: 'Offer codes to apply the coupon to (comma-separated)',
            },
        ],
    },

    // List Coupons
    {
        displayName: 'Filters',
        name: 'filters',
        type: 'collection',
        placeholder: 'Add Filter',
        default: {},
        displayOptions: {
            show: {
                resource: ['coupons'],
                operation: ['getAll'],
            },
        },
        options: [
            {
                displayName: 'Coupon Code',
                name: 'code',
                type: 'string',
                default: '',
                description: 'Filter by a specific coupon code',
            },
        ],
    },
    {
        displayName: 'Return All',
        name: 'returnAll',
        type: 'boolean',
        displayOptions: {
            show: {
                resource: ['coupons'],
                operation: ['getAll'],
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
                resource: ['coupons'],
                operation: ['getAll'],
                returnAll: [false],
            },
        },
        typeOptions: {
            minValue: 1,

        },
        default: 50,
        description: 'Max number of results to return',
    },

    // Delete Coupon
    {
        displayName: 'Coupon ID',
        name: 'couponId',
        type: 'string',
        required: true,
        displayOptions: {
            show: {
                resource: ['coupons'],
                operation: ['delete'],
            },
        },
        default: '',
        description: 'Unique identifier (ID) of the coupon to delete',
    },
];
