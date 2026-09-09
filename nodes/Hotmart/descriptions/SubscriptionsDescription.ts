import type { INodeProperties } from 'n8n-workflow';

export const subscriptionsOperations: INodeProperties[] = [
    {
        displayName: 'Operação',
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
                name: 'Alterar Data De Cobrança',
                value: 'changeBillingDate',
                description: 'Alterar data de cobrança da assinatura',
                action: 'Alterar data de cobran a',
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
                name: 'Cancelar Assinatura',
                value: 'cancel',
                description: 'Cancelar uma assinatura',
                action: 'Cancelar uma assinatura',
                routing: {
                    request: {
                        method: 'POST',
                        url: '=/payments/api/v1/subscriptions/{{$parameter.subscriberCode}}/cancel',
                    },
                },
            },
            {
                name: 'Cancelar Lista De Assinaturas',
                value: 'cancelBatch',
                description: 'Cancelar múltiplas assinaturas de uma vez',
                action: 'Cancelar lista de assinaturas',
                routing: {
                    request: {
                        method: 'POST',
                        url: '/payments/api/v1/subscriptions/cancel',
                    },
                },
            },
            {
                name: 'Compras De Assinatura',
                value: 'getPurchases',
                description: 'Obter compras de assinatura',
                action: 'Listar compras de assinatura',
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
                name: 'Compras Do Assinante',
                value: 'getSubscriberPurchases',
                description: 'Obter compras de um assinante específico',
                action: 'Listar compras do assinante',
                routing: {
                    request: {
                        method: 'GET',
                        url: '=/payments/api/v1/subscriptions/{{$parameter.subscriberCode}}/purchases',
                    },
                },
            },
            {
                name: 'Get Many',
                value: 'getAll',
                description: 'Obter todas as assinaturas',
                action: 'Listar todas as assinaturas',
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
                name: 'Reativar Assinatura',
                value: 'reactivate',
                description: 'Reativar uma assinatura',
                action: 'Reativar uma assinatura',
                routing: {
                    request: {
                        method: 'POST',
                        url: '=/payments/api/v1/subscriptions/{{$parameter.subscriberCode}}/reactivate',
                    },
                },
            },
            {
                name: 'Reativar Lista De Assinaturas',
                value: 'reactivateBatch',
                description: 'Reativar múltiplas assinaturas de uma vez',
                action: 'Reativar lista de assinaturas',
                routing: {
                    request: {
                        method: 'POST',
                        url: '/payments/api/v1/subscriptions/reactivate',
                    },
                },
            },
            {
                name: 'Resumo De Assinaturas',
                value: 'getSummary',
                description: 'Obter resumo das assinaturas',
                action: 'Obter resumo das assinaturas',
                routing: {
                    request: {
                        method: 'GET',
                        url: '/payments/api/v1/subscriptions/summary',
                    },
                },
            },
            {
                name: 'Transações De Assinatura',
                value: 'getTransactions',
                description: 'Obter transações detalhadas das assinaturas',
                action: 'Listar transa es de assinatura',
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
        ],
        default: 'getAll',
    },
];

export const subscriptionsFields: INodeProperties[] = [
    // ----------------------------------
    //         Cancelar / Reativar / Alterar Data
    // ----------------------------------
    {
        displayName: 'Código Do Assinante',
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
        description: 'O código do assinante para operar',
    },
    {
        displayName: 'Dia De Vencimento',
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
        description: 'O novo dia de vencimento para cobrança (1-31)',
    },
    {
        displayName: 'Enviar Email',
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
        displayName: 'Códigos Dos Assinantes',
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
        description: 'Lista de códigos de assinantes separados por vírgula',
        routing: {
            send: {
                type: 'body',
                property: 'subscriber_code',
                value: '={{ $value.split(",").map(s => s.trim()) }}',
            },
        },
    },
    {
        displayName: 'Gerar Nova Cobrança',
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
    //         Listar
    // ----------------------------------
    {
        displayName: 'Retornar Todos',
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
        displayName: 'Limite',
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
        displayName: 'Filtros',
        name: 'filters',
        type: 'collection',
        placeholder: 'Adicionar Filtro',
        default: {},
        displayOptions: {
            show: {
                resource: ['subscriptions'],
                operation: ['getAll', 'getPurchases', 'getSummary', 'getTransactions'],
            },
        },
        options: [
            {
                displayName: 'Código Da Oferta',
                name: 'offer_code',
                type: 'string',
                default: '',
                description: 'Filtrar por código da oferta',
                routing: {
                    send: {
                        type: 'query',
                        property: 'offer_code',
                    },
                },
            },
            {
                displayName: 'Código Da Transação',
                name: 'transaction',
                type: 'string',
                default: '',
                description: 'Filtrar por código da transação',
                routing: {
                    send: {
                        type: 'query',
                        property: 'transaction',
                    },
                },
            },
            {
                displayName: 'Código Do Assinante',
                name: 'subscriber_code',
                type: 'string',
                default: '',
                description: 'Filtrar por código do assinante',
                routing: {
                    send: {
                        type: 'query',
                        property: 'subscriber_code',
                    },
                },
            },
            {
                displayName: 'Data Cancelamento (Fim)',
                name: 'end_cancelation_date',
                type: 'dateTime',
                default: '',
                description: 'Assinaturas canceladas até esta data',
                routing: {
                    send: {
                        type: 'query',
                        property: 'end_cancelation_date',
                        value: '={{new Date($value).getTime()}}',
                    },
                },
            },
            {
                displayName: 'Data Cancelamento (Início)',
                name: 'cancelation_date',
                type: 'dateTime',
                default: '',
                description: 'Assinaturas canceladas a partir desta data',
                routing: {
                    send: {
                        type: 'query',
                        property: 'cancelation_date',
                        value: '={{new Date($value).getTime()}}',
                    },
                },
            },
            {
                displayName: 'Data Final',
                name: 'end_accession_date',
                type: 'dateTime',
                default: '',
                description: 'Filtrar assinaturas até esta data',
                routing: {
                    send: {
                        type: 'query',
                        property: 'end_accession_date',
                        value: '={{new Date($value).getTime()}}',
                    },
                },
            },
            {
                displayName: 'Data Inicial',
                name: 'accession_date',
                type: 'dateTime',
                default: '',
                description: 'Filtrar assinaturas a partir desta data',
                routing: {
                    send: {
                        type: 'query',
                        property: 'accession_date',
                        value: '={{new Date($value).getTime()}}',
                    },
                },
            },
            {
                displayName: 'Data Transação (Fim)',
                name: 'end_transaction_date',
                type: 'dateTime',
                default: '',
                description: 'Transações até esta data',
                routing: {
                    send: {
                        type: 'query',
                        property: 'end_transaction_date',
                        value: '={{new Date($value).getTime()}}',
                    },
                },
            },
            {
                displayName: 'Data Transação (Início)',
                name: 'transaction_date',
                type: 'dateTime',
                default: '',
                description: 'Transações a partir desta data',
                routing: {
                    send: {
                        type: 'query',
                        property: 'transaction_date',
                        value: '={{new Date($value).getTime()}}',
                    },
                },
            },
            {
                displayName: 'Email Do Assinante',
                name: 'subscriber_email',
                type: 'string',
                default: '',
                description: 'Filtrar por email do assinante',
                routing: {
                    send: {
                        type: 'query',
                        property: 'subscriber_email',
                    },
                },
            },
            {
                displayName: 'ID Do Plano',
                name: 'plan_id',
                type: 'number',
                default: 0,
                description: 'Identificador único do plano de assinatura',
                routing: {
                    send: {
                        type: 'query',
                        property: 'plan_id',
                    },
                },
            },
            {
                displayName: 'ID Do Produto',
                name: 'product_id',
                type: 'number',
                default: 0,
                description: 'Filtrar por ID do produto',
                routing: {
                    send: {
                        type: 'query',
                        property: 'product_id',
                    },
                },
            },
            {
                displayName: 'Nome Do Assinante',
                name: 'subscriber_name',
                type: 'string',
                default: '',
                description: 'Filtrar por nome do assinante',
                routing: {
                    send: {
                        type: 'query',
                        property: 'subscriber_name',
                    },
                },
            },
            {
                displayName: 'Período De Teste',
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
            {
                displayName: 'Plano',
                name: 'plan',
                type: 'string',
                default: '',
                description: 'Filtrar por plano de assinatura',
                routing: {
                    send: {
                        type: 'query',
                        property: 'plan',
                    },
                },
            },
            {
                displayName: 'Próxima Cobrança (Fim)',
                name: 'end_date_next_charge',
                type: 'dateTime',
                default: '',
                description: 'Assinaturas com próxima cobrança até esta data',
                routing: {
                    send: {
                        type: 'query',
                        property: 'end_date_next_charge',
                        value: '={{new Date($value).getTime()}}',
                    },
                },
            },
            {
                displayName: 'Próxima Cobrança (Início)',
                name: 'date_next_charge',
                type: 'dateTime',
                default: '',
                description: 'Assinaturas com próxima cobrança a partir desta data',
                routing: {
                    send: {
                        type: 'query',
                        property: 'date_next_charge',
                        value: '={{new Date($value).getTime()}}',
                    },
                },
            },
            {
                displayName: 'Status',
                name: 'status',
                type: 'options',
                options: [
                    { name: 'Ativa', value: 'ACTIVE' },
                    { name: 'Atrasada', value: 'DELAYED' },
                    { name: 'Cancelada Pelo Admin', value: 'CANCELLED_BY_ADMIN' },
                    { name: 'Cancelada Pelo Cliente', value: 'CANCELLED_BY_CUSTOMER' },
                    { name: 'Cancelada pelo Vendedor', value: 'CANCELLED_BY_SELLER' },
                    { name: 'Expirada', value: 'EXPIRED' },
                    { name: 'Inativa', value: 'INACTIVE' },
                    { name: 'Iniciada', value: 'STARTED' },
                    { name: 'Trial', value: 'TRIAL' },
                    { name: 'Vencida', value: 'OVERDUE' },
                ],
                default: 'ACTIVE',
                description: 'Filtrar por status da assinatura',
                routing: {
                    send: {
                        type: 'query',
                        property: 'status',
                    },
                },
            },
            {
                displayName: 'Status Da Assinatura',
                name: 'subscription_status',
                type: 'options',
                options: [
                    { name: 'Ativa', value: 'ACTIVE' },
                    { name: 'Atrasada', value: 'DELAYED' },
                    { name: 'Cancelada Pelo Admin', value: 'CANCELLED_BY_ADMIN' },
                    { name: 'Cancelada Pelo Cliente', value: 'CANCELLED_BY_CUSTOMER' },
                    { name: 'Cancelada pelo Vendedor', value: 'CANCELLED_BY_SELLER' },
                    { name: 'Inativa', value: 'INACTIVE' },
                    { name: 'Iniciada', value: 'STARTED' },
                    { name: 'Vencida', value: 'OVERDUE' },
                ],
                default: 'ACTIVE',
                description: 'Filtrar por status da assinatura',
                routing: {
                    send: {
                        type: 'query',
                        property: 'subscription_status',
                    },
                },
            },
            {
                displayName: 'Status Da Compra',
                name: 'purchase_status',
                type: 'string',
                default: '',
                description: 'Filtrar por status da transação de compra',
                routing: {
                    send: {
                        type: 'query',
                        property: 'purchase_status',
                    },
                },
            },
            {
                displayName: 'Status Da Recorrência',
                name: 'recurrency_status',
                type: 'options',
                options: [
                    { name: 'Chargeback', value: 'CHARGEBACK' },
                    { name: 'Não Pago', value: 'NOT_PAID' },
                    { name: 'Pago', value: 'PAID' },
                    { name: 'Reclamado', value: 'CLAIMED' },
                    { name: 'Reembolsado', value: 'REFUNDED' },
                ],
                default: 'PAID',
                description: 'Filtrar por status do pagamento da recorrência',
                routing: {
                    send: {
                        type: 'query',
                        property: 'recurrency_status',
                    },
                },
            },
            {
                displayName: 'Tipo De Cobrança',
                name: 'billing_type',
                type: 'options',
                options: [
                    { name: 'Assinatura', value: 'SUBSCRIPTION' },
                    { name: 'Smart Installment', value: 'SMART_INSTALLMENT' },
                    { name: 'Smart Recovery', value: 'SMART_RECOVERY' },
                ],
                default: 'SUBSCRIPTION',
                description: 'Filtrar por tipo de cobrança recorrente',
                routing: {
                    send: {
                        type: 'query',
                        property: 'billing_type',
                    },
                },
            },
            {
                displayName: 'Tipo De Pagamento',
                name: 'purchase_payment_type',
                type: 'options',
                options: [
                    { name: 'Boleto', value: 'BILLET' },
                    { name: 'Cartão De Crédito', value: 'CREDIT_CARD' },
                    { name: 'Débito Direto', value: 'DIRECT_DEBIT' },
                    { name: 'Google Pay', value: 'GOOGLE_PAY' },
                    { name: 'PayPal', value: 'PAYPAL' },
                    { name: 'PayPal Internacional', value: 'PAYPAL_INTERNACIONAL' },
                    { name: 'PicPay', value: 'PICPAY' },
                    { name: 'Pix', value: 'PIX' },
                    { name: 'Samsung Pay', value: 'SAMSUNG_PAY' },
                    { name: 'Transferência Bancária', value: 'DIRECT_BANK_TRANSFER' },
                    { name: 'Wallet', value: 'WALLET' },
                ],
                default: 'CREDIT_CARD',
                description: 'Filtrar por tipo de pagamento',
                routing: {
                    send: {
                        type: 'query',
                        property: 'purchase_payment_type',
                    },
                },
            },
        ],
    },
];
