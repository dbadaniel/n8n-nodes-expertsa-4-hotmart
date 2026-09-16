import type { INodeProperties } from 'n8n-workflow';

export const salesOperations: INodeProperties[] = [
    {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
            show: {
                resource: ['sales'],
            },
        },
        options: [
            {
                name: 'Get Many',
                value: 'getAll',
                description: 'Get sales history',
                action: 'List sales history',
                routing: {
                    request: {
                        method: 'GET',
                        url: '/payments/api/v1/sales/history',
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
                name: 'List Commissions',
                value: 'getCommissions',
                description: 'Get sales commissions',
                action: 'List sales commissions',
                routing: {
                    request: {
                        method: 'GET',
                        url: '/payments/api/v1/sales/commissions',
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
                name: 'Price Details',
                value: 'getPriceDetails',
                description: 'Get the price details of a sale',
                action: 'Get price details',
                routing: {
                    request: {
                        method: 'GET',
                        url: '/payments/api/v1/sales/price/details',
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
                name: 'Refund Sale',
                value: 'refund',
                description: 'Request a refund for a sale',
                action: 'Refund sale',
                routing: {
                    request: {
                        method: 'PUT',
                        url: '=/payments/api/v1/sales/{{$parameter.transactionCode}}/refund',
                    },
                },
            },
            {
                name: 'Sales Participants',
                value: 'getUsers',
                description: 'Get information about the participants in the sales',
                action: 'List sales participants',
                routing: {
                    request: {
                        method: 'GET',
                        url: '/payments/api/v1/sales/users',
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
                name: 'Sales Summary',
                value: 'getSummary',
                description: 'Get sales summary',
                action: 'Get sales summary',
                routing: {
                    request: {
                        method: 'GET',
                        url: '/payments/api/v1/sales/summary',
                    },
                },
            },
        ],
        default: 'getAll',
    },
];

export const salesFields: INodeProperties[] = [
    {
        displayName: 'Transaction Code',
        name: 'transactionCode',
        type: 'string',
        required: true,
        displayOptions: {
            show: {
                resource: ['sales'],
                operation: ['refund'],
            },
        },
        default: '',
        placeholder: 'HP17715690036014',
        description: 'Unique reference code of the transaction to be refunded',
    },
    {
        displayName: 'Return All',
        name: 'returnAll',
        type: 'boolean',
        displayOptions: {
            show: {
                resource: ['sales'],
                operation: ['getAll', 'getCommissions', 'getPriceDetails', 'getSummary', 'getUsers'],
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
                resource: ['sales'],
                operation: ['getAll', 'getCommissions', 'getPriceDetails', 'getSummary', 'getUsers'],
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
                resource: ['sales'],
                operation: ['getAll', 'getCommissions', 'getPriceDetails', 'getSummary', 'getUsers'],
            },
        },
        options: [
            {
                displayName: 'Affiliate Name',
                name: 'affiliate_name',
                type: 'string',
                default: '',
                description: 'Name of the affiliate responsible for the sale',
                routing: {
                    send: {
                        type: 'query',
                        property: 'affiliate_name',
                    },
                },
            },
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
                displayName: 'Buyer Name',
                name: 'buyer_name',
                type: 'string',
                default: '',
                description: 'Filter by buyer name',
                routing: {
                    send: {
                        type: 'query',
                        property: 'buyer_name',
                    },
                },
            },
            {
                displayName: 'Commissioned As',
                name: 'commission_as',
                type: 'options',
                options: [
                    { name: 'Affiliate', value: 'AFFILIATE' },
                    { name: 'Co-Producer', value: 'COPRODUCER' },
                    { name: 'Producer', value: 'PRODUCER' },
                ],
                default: 'PRODUCER',
                description: 'How the user was commissioned for the sale',
                routing: {
                    send: {
                        type: 'query',
                        property: 'commission_as',
                    },
                },
            },
            {
                displayName: 'End Date',
                name: 'end_date',
                type: 'dateTime',
                default: '',
                description: 'Filter sales up to this date',
                routing: {
                    send: {
                        type: 'query',
                        property: 'end_date',
                        value: '={{new Date($value).getTime()}}',
                    },
                },
            },
            {
                displayName: 'Offer Code',
                name: 'offer_code',
                type: 'string',
                default: '',
                description: 'Filter by the product offer code',
                routing: {
                    send: {
                        type: 'query',
                        property: 'offer_code',
                    },
                },
            },
            {
                displayName: 'Payment Type',
                name: 'payment_type',
                type: 'options',
                options: [
                    { name: 'Bank Transfer', value: 'DIRECT_BANK_TRANSFER' },
                    { name: 'Billet', value: 'BILLET' },
                    { name: 'Credit Card', value: 'CREDIT_CARD' },
                    { name: 'Direct Debit', value: 'DIRECT_DEBIT' },
                    { name: 'Google Pay', value: 'GOOGLE_PAY' },
                    { name: 'International PayPal', value: 'PAYPAL_INTERNACIONAL' },
                    { name: 'PayPal', value: 'PAYPAL' },
                    { name: 'PicPay', value: 'PICPAY' },
                    { name: 'Pix', value: 'PIX' },
                    { name: 'Samsung Pay', value: 'SAMSUNG_PAY' },
                    { name: 'Wallet', value: 'WALLET' },
                ],
                default: 'CREDIT_CARD',
                description: 'Filter by payment type',
                routing: {
                    send: {
                        type: 'query',
                        property: 'payment_type',
                    },
                },
            },
            {
                displayName: 'Product ID',
                name: 'product_id',
                type: 'number',
                default: 0,
                description: 'Filter by product ID',
                routing: {
                    send: {
                        type: 'query',
                        property: 'product_id',
                    },
                },
            },
            {
                displayName: 'Source (SRC)',
                name: 'sales_source',
                type: 'string',
                default: '',
                placeholder: 'campaignname',
                description: 'SRC code used in the payment page link',
                routing: {
                    send: {
                        type: 'query',
                        property: 'sales_source',
                    },
                },
            },
            {
                displayName: 'Start Date',
                name: 'start_date',
                type: 'dateTime',
                default: '',
                description: 'Filter sales from this date',
                routing: {
                    send: {
                        type: 'query',
                        property: 'start_date',
                        value: '={{new Date($value).getTime()}}',
                    },
                },
            },
            {
                displayName: 'Transaction Code',
                name: 'transaction',
                type: 'string',
                default: '',
                description: 'Filter by transaction code',
                routing: {
                    send: {
                        type: 'query',
                        property: 'transaction',
                    },
                },
            },
            {
                displayName: 'Transaction Status',
                name: 'transaction_status',
                type: 'options',
                options: [
                    { name: 'Approved', value: 'APPROVED' },
                    { name: 'Billet Printed', value: 'PRINTED_BILLET' },
                    { name: 'Blocked', value: 'BLOCKED' },
                    { name: 'Cancelled', value: 'CANCELLED' },
                    { name: 'Chargeback', value: 'CHARGEBACK' },
                    { name: 'Complete', value: 'COMPLETE' },
                    { name: 'Disputed', value: 'PROTESTED' },
                    { name: 'Expired', value: 'EXPIRED' },
                    { name: 'No Funds', value: 'NO_FUNDS' },
                    { name: 'Overdue', value: 'OVERDUE' },
                    { name: 'Partially Refunded', value: 'PARTIALLY_REFUNDED' },
                    { name: 'Pre-Order', value: 'PRE_ORDER' },
                    { name: 'Processing', value: 'PROCESSING_TRANSACTION' },
                    { name: 'Refunded', value: 'REFUNDED' },
                    { name: 'Started', value: 'STARTED' },
                    { name: 'Under Analysis', value: 'UNDER_ANALISYS' },
                    { name: 'Waiting Payment', value: 'WAITING_PAYMENT' },
                ],
                default: 'APPROVED',
                description: 'Filter by transaction status',
                routing: {
                    send: {
                        type: 'query',
                        property: 'transaction_status',
                    },
                },
            },
        ],
    },
];
