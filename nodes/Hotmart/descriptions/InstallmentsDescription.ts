import type { INodeProperties } from 'n8n-workflow';

export const installmentsOperations: INodeProperties[] = [
    {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
            show: {
                resource: ['installments'],
            },
        },
        options: [
            {
                name: 'Generate Negotiation',
                value: 'negotiate',
                description: 'Generate a billet or PIX to negotiate overdue installments for delinquent customers',
                action: 'Generate installment negotiation',
            },
        ],
        default: 'negotiate',
    },
];

export const installmentsFields: INodeProperties[] = [
    // Generate Negotiation
    {
        displayName: 'Subscription ID',
        name: 'subscriptionId',
        type: 'string',
        required: true,
        displayOptions: {
            show: {
                resource: ['installments'],
                operation: ['negotiate'],
            },
        },
        default: '',
        description: 'Identification number of the subscription in Hotmart',
    },
    {
        displayName: 'Recurrences',
        name: 'recurrences',
        type: 'string',
        required: true,
        displayOptions: {
            show: {
                resource: ['installments'],
                operation: ['negotiate'],
            },
        },
        default: '',
        placeholder: '1, 2, 3',
        description: 'Recurrence numbers to negotiate (comma-separated). Maximum of 5 values. For subscriptions with Club, only the last installment can be negotiated.',
    },
    {
        displayName: 'Payment Type',
        name: 'paymentType',
        type: 'options',
        required: true,
        displayOptions: {
            show: {
                resource: ['installments'],
                operation: ['negotiate'],
            },
        },
        options: [
            {
                name: 'Bank Billet',
                value: 'BILLET',
                description: 'Generate a bank billet (requires CPF/CNPJ)',
            },
            {
                name: 'PIX',
                value: 'PIX',
                description: 'Generate a PIX code for payment',
            },
        ],
        default: 'PIX',
        description: 'Payment method for the negotiation',
    },
    {
        displayName: 'Buyer CPF/CNPJ',
        name: 'document',
        type: 'string',
        required: true,
        displayOptions: {
            show: {
                resource: ['installments'],
                operation: ['negotiate'],
                paymentType: ['BILLET'],
            },
        },
        default: '',
        placeholder: '123.456.789-00',
        description: 'CPF or CNPJ of the delinquent buyer. Required for payment via Billet.',
    },
    {
        displayName: 'Offer Discount',
        name: 'offerDiscount',
        type: 'boolean',
        displayOptions: {
            show: {
                resource: ['installments'],
                operation: ['negotiate'],
            },
        },
        default: false,
        description: 'Whether to offer a discount during negotiation',
    },
    {
        displayName: 'Discount Type',
        name: 'discountType',
        type: 'hidden',
        displayOptions: {
            show: {
                resource: ['installments'],
                operation: ['negotiate'],
                offerDiscount: [true],
            },
        },
        default: 'CUSTOM',
        description: 'Discount type (currently only CUSTOM is supported by the API)',
    },
    {
        displayName: 'Discount Value',
        name: 'discountValue',
        type: 'number',
        typeOptions: {
            minValue: 0,
            numberPrecision: 2,
        },
        displayOptions: {
            show: {
                resource: ['installments'],
                operation: ['negotiate'],
                offerDiscount: [true],
            },
        },
        default: 0,
        description: 'Discount value. For CUSTOM, enter the amount (e.g. 50.00). For PERCENTAGE, enter the percentage (e.g. 10 for 10%).',
    },
];
