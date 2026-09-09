import type { INodeProperties } from 'n8n-workflow';

export const installmentsOperations: INodeProperties[] = [
    {
        displayName: 'Operação',
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
                name: 'Gerar Negociação',
                value: 'negotiate',
                description: 'Gerar boleto ou PIX para negociar parcelas em atraso de inadimplentes',
                action: 'Gerar negocia o de parcelas',
            },
        ],
        default: 'negotiate',
    },
];

export const installmentsFields: INodeProperties[] = [
    // Gerar Negociação
    {
        displayName: 'ID Da Assinatura',
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
        description: 'Número de identificação da assinatura na Hotmart',
    },
    {
        displayName: 'Recorrências',
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
        description: 'Números das recorrências para negociar (separados por vírgula). Máximo de 5 valores. Para assinaturas com Club, apenas a última parcela pode ser negociada.',
    },
    {
        displayName: 'Tipo De Pagamento',
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
                name: 'Boleto Bancário',
                value: 'BILLET',
                description: 'Gerar boleto bancário (requer CPF/CNPJ)',
            },
            {
                name: 'PIX',
                value: 'PIX',
                description: 'Gerar código PIX para pagamento',
            },
        ],
        default: 'PIX',
        description: 'Meio de pagamento para a negociação',
    },
    {
        displayName: 'CPF/CNPJ do Comprador',
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
        description: 'CPF ou CNPJ do comprador inadimplente. Obrigatório para pagamento via Boleto.',
    },
    {
        displayName: 'Oferecer Desconto',
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
        displayName: 'Tipo De Desconto',
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
        description: 'Tipo de desconto (atualmente só CUSTOM é suportado pela API)',
    },
    {
        displayName: 'Valor Do Desconto',
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
        description: 'Valor do desconto. Para CUSTOM, informe em reais (ex: 50.00). Para PERCENTAGE, informe o percentual (ex: 10 para 10%).',
    },
];
