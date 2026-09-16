import type { INodeProperties } from 'n8n-workflow';

export const subscriptionsOperations: INodeProperties[] = [
    {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
            show: {
                resource: ['subscriptions'],
            },
        },
        options: [
            {
                name: 'Cancel Subscription',
                value: 'cancel',
                description: 'Cancel a subscription',
                action: 'Cancel a subscription',
                routing: {
                    request: {
                        method: 'POST',
                        url: '=/payments/api/v1/subscriptions/{{$parameter.subscriberCode}}/cancel',
                    },
                },
            },
            {
                name: 'Cancel Subscription List',
                value: 'cancelBatch',
                description: 'Cancel multiple subscriptions at once',
                action: 'Cancel subscription list',
                routing: {
                    request: {
                        method: 'POST',
                        url: '/payments/api/v1/subscriptions/cancel',
                    },
                },
            },
            {
                name: 'Change Billing Date',
                value: 'changeBillingDate',
                description: 'Change the subscription billing date',
                action: 'Change billing date',
                routing: {
                    request: {
                        method: 'PATCH',
                        url: '=/payments/api/v1/subscriptions/{{$parameter.subscriberCode}}',
                        body: {
                            due_day: '={{$parameter.dueDay}}',
                        },
                    },
                },
            },
            {
                name: 'Get Many',
                value: 'getAll',
                description: 'Get many subscriptions',
                action: 'List all subscriptions',
                routing: {
                    request: {
                        method: 'GET',
                        url: '/payments/api/v1/subscriptions',
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
                name: 'Reactivate Subscription',
                value: 'reactivate',
                description: 'Reactivate a subscription',
                action: 'Reactivate a subscription',
                routing: {
                    request: {
                        method: 'POST',
                        url: '=/payments/api/v1/subscriptions/{{$parameter.subscriberCode}}/reactivate',
                    },
                },
            },
            {
                name: 'Reactivate Subscription List',
                value: 'reactivateBatch',
                description: 'Reactivate multiple subscriptions at once',
                action: 'Reactivate subscription list',
                routing: {
                    request: {
                        method: 'POST',
                        url: '/payments/api/v1/subscriptions/reactivate',
                    },
                },
            },
            {
                name: 'Subscriber Purchases',
                value: 'getSubscriberPurchases',
                description: 'Get the purchases of a specific subscriber',
                action: 'List subscriber purchases',
                routing: {
                    request: {
                        method: 'GET',
                        url: '=/payments/api/v1/subscriptions/{{$parameter.subscriberCode}}/purchases',
                    },
                },
            },
            {
                name: 'Subscription Purchases',
                value: 'getPurchases',
                description: 'Get subscription purchases',
                action: 'List subscription purchases',
                routing: {
                    request: {
                        method: 'GET',
                        url: '/payments/api/v1/subscriptions/purchases',
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
                name: 'Subscription Transactions',
                value: 'getTransactions',
                description: 'Get detailed subscription transactions',
                action: 'List subscription transactions',
                routing: {
                    request: {
                        method: 'GET',
                        url: '/payments/api/v1/subscriptions/transactions',
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
                name: 'Subscriptions Summary',
                value: 'getSummary',
                description: 'Get the subscriptions summary',
                action: 'Get subscriptions summary',
                routing: {
                    request: {
                        method: 'GET',
                        url: '/payments/api/v1/subscriptions/summary',
                    },
                },
            },
        ],
        default: 'getAll',
    },
];

export const subscriptionsFields: INodeProperties[] = [
    // ----------------------------------
    //         Cancel / Reactivate / Change Date
    // ----------------------------------
    {
        displayName: 'Subscriber Code',
        name: 'subscriberCode',
        type: 'string',
        required: true,
        displayOptions: {
            show: {
                resource: ['subscriptions'],
                operation: ['cancel', 'reactivate', 'changeBillingDate', 'getSubscriberPurchases'],
            },
        },
        default: '',
        description: 'The subscriber code to operate on',
    },
    {
        displayName: 'Due Day',
        name: 'dueDay',
        type: 'number',
        required: true,
        displayOptions: {
            show: {
                resource: ['subscriptions'],
                operation: ['changeBillingDate'],
            },
        },
        typeOptions: {
            minValue: 1,
            maxValue: 31,
        },
        default: 1,
        description: 'The new due day for billing (1-31)',
    },
    {
        displayName: 'Send Email',
        name: 'sendMail',
        type: 'boolean',
        displayOptions: {
            show: {
                resource: ['subscriptions'],
                operation: ['cancel', 'cancelBatch'],
            },
        },
        default: true,
        description: 'Whether to send email notification to the subscriber',
        routing: {
            send: {
                type: 'body',
                property: 'send_mail',
            },
        },
    },
    {
        displayName: 'Subscriber Codes',
        name: 'subscriberCodes',
        type: 'string',
        required: true,
        displayOptions: {
            show: {
                resource: ['subscriptions'],
                operation: ['cancelBatch', 'reactivateBatch'],
            },
        },
        default: '',
        placeholder: 'ABC123, DEF456, GHI789',
        description: 'List of subscriber codes separated by commas',
        routing: {
            send: {
                type: 'body',
                property: 'subscriber_code',
                value: '={{ $value.split(",").map(s => s.trim()) }}',
            },
        },
    },
    {
        displayName: 'Generate New Charge',
        name: 'charge',
        type: 'boolean',
        displayOptions: {
            show: {
                resource: ['subscriptions'],
                operation: ['reactivate', 'reactivateBatch'],
            },
        },
        default: false,
        description: 'Whether to generate a new charge when reactivating the subscription',
        routing: {
            send: {
                type: 'body',
                property: 'charge',
            },
        },
    },
    // ----------------------------------
    //         List
    // ----------------------------------
    {
        displayName: 'Return All',
        name: 'returnAll',
        type: 'boolean',
        displayOptions: {
            show: {
                resource: ['subscriptions'],
                operation: ['getAll', 'getPurchases', 'getSummary', 'getTransactions'],
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
                resource: ['subscriptions'],
                operation: ['getAll', 'getPurchases', 'getSummary', 'getTransactions'],
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
                resource: ['subscriptions'],
                operation: ['getAll', 'getPurchases', 'getSummary', 'getTransactions'],
            },
        },
        options: [
            {
                displayName: 'Billing Type',
                name: 'billing_type',
                type: 'options',
                options: [
                    { name: 'Smart Installment', value: 'SMART_INSTALLMENT' },
                    { name: 'Smart Recovery', value: 'SMART_RECOVERY' },
                    { name: 'Subscription', value: 'SUBSCRIPTION' },
                ],
                default: 'SUBSCRIPTION',
                description: 'Filter by recurring billing type',
                routing: {
                    send: {
                        type: 'query',
                        property: 'billing_type',
                    },
                },
            },
            {
                displayName: 'Cancellation Date (End)',
                name: 'end_cancelation_date',
                type: 'dateTime',
                default: '',
                description: 'Subscriptions canceled up to this date',
                routing: {
                    send: {
                        type: 'query',
                        property: 'end_cancelation_date',
                        value: '={{new Date($value).getTime()}}',
                    },
                },
            },
            {
                displayName: 'Cancellation Date (Start)',
                name: 'cancelation_date',
                type: 'dateTime',
                default: '',
                description: 'Subscriptions canceled from this date',
                routing: {
                    send: {
                        type: 'query',
                        property: 'cancelation_date',
                        value: '={{new Date($value).getTime()}}',
                    },
                },
            },
            {
                displayName: 'End Date',
                name: 'end_accession_date',
                type: 'dateTime',
                default: '',
                description: 'Filter subscriptions up to this date',
                routing: {
                    send: {
                        type: 'query',
                        property: 'end_accession_date',
                        value: '={{new Date($value).getTime()}}',
                    },
                },
            },
            {
                displayName: 'Next Charge (End)',
                name: 'end_date_next_charge',
                type: 'dateTime',
                default: '',
                description: 'Subscriptions with next charge up to this date',
                routing: {
                    send: {
                        type: 'query',
                        property: 'end_date_next_charge',
                        value: '={{new Date($value).getTime()}}',
                    },
                },
            },
            {
                displayName: 'Next Charge (Start)',
                name: 'date_next_charge',
                type: 'dateTime',
                default: '',
                description: 'Subscriptions with next charge from this date',
                routing: {
                    send: {
                        type: 'query',
                        property: 'date_next_charge',
                        value: '={{new Date($value).getTime()}}',
                    },
                },
            },
            {
                displayName: 'Offer Code',
                name: 'offer_code',
                type: 'string',
                default: '',
                description: 'Filter by offer code',
                routing: {
                    send: {
                        type: 'query',
                        property: 'offer_code',
                    },
                },
            },
            {
                displayName: 'Payment Type',
                name: 'purchase_payment_type',
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
                        property: 'purchase_payment_type',
                    },
                },
            },
            {
                displayName: 'Plan',
                name: 'plan',
                type: 'string',
                default: '',
                description: 'Filter by subscription plan',
                routing: {
                    send: {
                        type: 'query',
                        property: 'plan',
                    },
                },
            },
            {
                displayName: 'Plan ID',
                name: 'plan_id',
                type: 'number',
                default: 0,
                description: 'Unique identifier of the subscription plan',
                routing: {
                    send: {
                        type: 'query',
                        property: 'plan_id',
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
                displayName: 'Purchase Status',
                name: 'purchase_status',
                type: 'string',
                default: '',
                description: 'Filter by purchase transaction status',
                routing: {
                    send: {
                        type: 'query',
                        property: 'purchase_status',
                    },
                },
            },
            {
                displayName: 'Recurrency Status',
                name: 'recurrency_status',
                type: 'options',
                options: [
                    { name: 'Chargeback', value: 'CHARGEBACK' },
                    { name: 'Claimed', value: 'CLAIMED' },
                    { name: 'Not Paid', value: 'NOT_PAID' },
                    { name: 'Paid', value: 'PAID' },
                    { name: 'Refunded', value: 'REFUNDED' },
                ],
                default: 'PAID',
                description: 'Filter by recurrence payment status',
                routing: {
                    send: {
                        type: 'query',
                        property: 'recurrency_status',
                    },
                },
            },
            {
                displayName: 'Start Date',
                name: 'accession_date',
                type: 'dateTime',
                default: '',
                description: 'Filter subscriptions from this date',
                routing: {
                    send: {
                        type: 'query',
                        property: 'accession_date',
                        value: '={{new Date($value).getTime()}}',
                    },
                },
            },
            {
                displayName: 'Status',
                name: 'status',
                type: 'options',
                options: [
                    { name: 'Active', value: 'ACTIVE' },
                    { name: 'Cancelled By Admin', value: 'CANCELLED_BY_ADMIN' },
                    { name: 'Cancelled By Customer', value: 'CANCELLED_BY_CUSTOMER' },
                    { name: 'Cancelled By Seller', value: 'CANCELLED_BY_SELLER' },
                    { name: 'Delayed', value: 'DELAYED' },
                    { name: 'Expired', value: 'EXPIRED' },
                    { name: 'Inactive', value: 'INACTIVE' },
                    { name: 'Overdue', value: 'OVERDUE' },
                    { name: 'Started', value: 'STARTED' },
                    { name: 'Trial', value: 'TRIAL' },
                ],
                default: 'ACTIVE',
                description: 'Filter by subscription status',
                routing: {
                    send: {
                        type: 'query',
                        property: 'status',
                    },
                },
            },
            {
                displayName: 'Subscriber Code',
                name: 'subscriber_code',
                type: 'string',
                default: '',
                description: 'Filter by subscriber code',
                routing: {
                    send: {
                        type: 'query',
                        property: 'subscriber_code',
                    },
                },
            },
            {
                displayName: 'Subscriber Email',
                name: 'subscriber_email',
                type: 'string',
                default: '',
                description: 'Filter by subscriber email',
                routing: {
                    send: {
                        type: 'query',
                        property: 'subscriber_email',
                    },
                },
            },
            {
                displayName: 'Subscriber Name',
                name: 'subscriber_name',
                type: 'string',
                default: '',
                description: 'Filter by subscriber name',
                routing: {
                    send: {
                        type: 'query',
                        property: 'subscriber_name',
                    },
                },
            },
            {
                displayName: 'Subscription Status',
                name: 'subscription_status',
                type: 'options',
                options: [
                    { name: 'Active', value: 'ACTIVE' },
                    { name: 'Cancelled By Admin', value: 'CANCELLED_BY_ADMIN' },
                    { name: 'Cancelled By Customer', value: 'CANCELLED_BY_CUSTOMER' },
                    { name: 'Cancelled By Seller', value: 'CANCELLED_BY_SELLER' },
                    { name: 'Delayed', value: 'DELAYED' },
                    { name: 'Inactive', value: 'INACTIVE' },
                    { name: 'Overdue', value: 'OVERDUE' },
                    { name: 'Started', value: 'STARTED' },
                ],
                default: 'ACTIVE',
                description: 'Filter by subscription status',
                routing: {
                    send: {
                        type: 'query',
                        property: 'subscription_status',
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
                displayName: 'Transaction Date (End)',
                name: 'end_transaction_date',
                type: 'dateTime',
                default: '',
                description: 'Transactions up to this date',
                routing: {
                    send: {
                        type: 'query',
                        property: 'end_transaction_date',
                        value: '={{new Date($value).getTime()}}',
                    },
                },
            },
            {
                displayName: 'Transaction Date (Start)',
                name: 'transaction_date',
                type: 'dateTime',
                default: '',
                description: 'Transactions from this date',
                routing: {
                    send: {
                        type: 'query',
                        property: 'transaction_date',
                        value: '={{new Date($value).getTime()}}',
                    },
                },
            },
            {
                displayName: 'Trial Period',
                name: 'trial',
                type: 'boolean',
                default: false,
                description: 'Whether to filter subscriptions that have a trial period',
                routing: {
                    send: {
                        type: 'query',
                        property: 'trial',
                    },
                },
            },
        ],
    },
];
