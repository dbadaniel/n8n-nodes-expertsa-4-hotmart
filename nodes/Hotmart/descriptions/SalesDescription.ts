import type { INodeProperties } from 'n8n-workflow';

export const salesOperations: INodeProperties[] = [
    {
        displayName: 'Operação',
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
                name: 'Detalhes De Preço',
                value: 'getPriceDetails',
                description: 'Obter detalhes de preço de uma venda',
                action: 'Obter detalhes de pre o',
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
                name: 'Get Many',
                value: 'getAll',
                description: 'Obter histórico de vendas',
                action: 'Listar hist rico de vendas',
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
                name: 'Listar Comissões',
                value: 'getCommissions',
                description: 'Obter comissões de vendas',
                action: 'Listar comiss es de vendas',
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
                name: 'Participantes De Vendas',
                value: 'getUsers',
                description: 'Obter informações dos participantes das vendas',
                action: 'Listar participantes de vendas',
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
                name: 'Reembolsar Venda',
                value: 'refund',
                description: 'Solicitar reembolso de uma venda',
                action: 'Reembolsar venda',
                routing: {
                    request: {
                        method: 'PUT',
                        url: '=/payments/api/v1/sales/{{$parameter.transactionCode}}/refund',
                    },
                },
            },
            {
                name: 'Resumo De Vendas',
                value: 'getSummary',
                description: 'Obter resumo de vendas',
                action: 'Obter resumo de vendas',
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
        displayName: 'Código Da Transação',
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
        description: 'Código único de referência da transação a ser reembolsada',
    },
    {
        displayName: 'Retornar Todos',
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
        displayName: 'Limite',
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
        displayName: 'Filtros',
        name: 'filters',
        type: 'collection',
        placeholder: 'Adicionar Filtro',
        default: {},
        displayOptions: {
            show: {
                resource: ['sales'],
                operation: ['getAll', 'getCommissions', 'getPriceDetails', 'getSummary', 'getUsers'],
            },
        },
        options: [
            {
                displayName: 'Código Da Oferta',
                name: 'offer_code',
                type: 'string',
                default: '',
                description: 'Filtrar por código de oferta do produto',
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
                displayName: 'Comissionado Como',
                name: 'commission_as',
                type: 'options',
                options: [
                    { name: 'Afiliado', value: 'AFFILIATE' },
                    { name: 'Coprodutor', value: 'COPRODUCER' },
                    { name: 'Produtor', value: 'PRODUCER' },
                ],
                default: 'PRODUCER',
                description: 'Como o usuário foi comissionado pela venda',
                routing: {
                    send: {
                        type: 'query',
                        property: 'commission_as',
                    },
                },
            },
            {
                displayName: 'Data Final',
                name: 'end_date',
                type: 'dateTime',
                default: '',
                description: 'Filtrar vendas até esta data',
                routing: {
                    send: {
                        type: 'query',
                        property: 'end_date',
                        value: '={{new Date($value).getTime()}}',
                    },
                },
            },
            {
                displayName: 'Data Inicial',
                name: 'start_date',
                type: 'dateTime',
                default: '',
                description: 'Filtrar vendas a partir desta data',
                routing: {
                    send: {
                        type: 'query',
                        property: 'start_date',
                        value: '={{new Date($value).getTime()}}',
                    },
                },
            },
            {
                displayName: 'Email do Comprador',
                name: 'buyer_email',
                type: 'string',
                default: '',
                description: 'Filtrar por email do comprador',
                routing: {
                    send: {
                        type: 'query',
                        property: 'buyer_email',
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
                displayName: 'Nome Do Afiliado',
                name: 'affiliate_name',
                type: 'string',
                default: '',
                description: 'Nome da pessoa Afiliada responsável pela venda',
                routing: {
                    send: {
                        type: 'query',
                        property: 'affiliate_name',
                    },
                },
            },
            {
                displayName: 'Nome do Comprador',
                name: 'buyer_name',
                type: 'string',
                default: '',
                description: 'Filtrar por nome da pessoa compradora',
                routing: {
                    send: {
                        type: 'query',
                        property: 'buyer_name',
                    },
                },
            },
            {
                displayName: 'Origem (SRC)',
                name: 'sales_source',
                type: 'string',
                default: '',
                placeholder: 'nomedacampanha',
                description: 'Código SRC utilizado no link da página de pagamento',
                routing: {
                    send: {
                        type: 'query',
                        property: 'sales_source',
                    },
                },
            },
            {
                displayName: 'Status Da Transação',
                name: 'transaction_status',
                type: 'options',
                options: [
                    { name: 'Aguardando Pagamento', value: 'WAITING_PAYMENT' },
                    { name: 'Aprovada', value: 'APPROVED' },
                    { name: 'Bloqueada', value: 'BLOCKED' },
                    { name: 'Boleto Impresso', value: 'PRINTED_BILLET' },
                    { name: 'Cancelada', value: 'CANCELLED' },
                    { name: 'Chargeback', value: 'CHARGEBACK' },
                    { name: 'Completa', value: 'COMPLETE' },
                    { name: 'Em Análise', value: 'UNDER_ANALISYS' },
                    { name: 'Em Disputa', value: 'PROTESTED' },
                    { name: 'Expirada', value: 'EXPIRED' },
                    { name: 'Iniciada', value: 'STARTED' },
                    { name: 'Parcialmente Reembolsada', value: 'PARTIALLY_REFUNDED' },
                    { name: 'Pré-Venda', value: 'PRE_ORDER' },
                    { name: 'Processando', value: 'PROCESSING_TRANSACTION' },
                    { name: 'Reembolsada', value: 'REFUNDED' },
                    { name: 'Sem Fundos', value: 'NO_FUNDS' },
                    { name: 'Vencida', value: 'OVERDUE' },
                ],
                default: 'APPROVED',
                description: 'Filtrar por status da transação',
                routing: {
                    send: {
                        type: 'query',
                        property: 'transaction_status',
                    },
                },
            },
            {
                displayName: 'Tipo De Pagamento',
                name: 'payment_type',
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
                        property: 'payment_type',
                    },
                },
            },
        ],
    },
];
