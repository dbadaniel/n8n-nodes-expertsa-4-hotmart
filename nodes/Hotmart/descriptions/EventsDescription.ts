import type { INodeProperties } from 'n8n-workflow';

export const eventsOperations: INodeProperties[] = [
    {
        displayName: 'Operação',
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
                name: 'Informações Do Evento',
                value: 'getInfo',
                description: 'Obter informações de um evento',
                action: 'Obter informa es do evento',
                routing: {
                    request: {
                        method: 'GET',
                        url: '=/events/api/v1/{{$parameter.eventId}}/info',
                    },
                },
            },
            {
                name: 'Listar Participantes',
                value: 'getParticipants',
                description: 'Obter lista de ingressos e participantes do evento',
                action: 'Listar participantes do evento',
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
        displayName: 'ID Do Evento',
        name: 'eventId',
        type: 'number',
        required: true,
        displayOptions: {
            show: {
                resource: ['events'],
            },
        },
        default: 0,
        description: 'ID do produto (produto no formato Ingresso para Eventos)',
    },
    {
        displayName: 'Retornar Todos',
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
        displayName: 'Limite',
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
        displayName: 'Filtros',
        name: 'filters',
        type: 'collection',
        placeholder: 'Adicionar Filtro',
        default: {},
        displayOptions: {
            show: {
                resource: ['events'],
                operation: ['getParticipants'],
            },
        },
        options: [
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
                displayName: 'Email Do Participante',
                name: 'participant_email',
                type: 'string',
                default: '',
                description: 'Filtrar por email do participante',
                routing: {
                    send: {
                        type: 'query',
                        property: 'participant_email',
                    },
                },
            },
            {
                displayName: 'ID Do Ingresso',
                name: 'id_eticket',
                type: 'number',
                default: 0,
                description: 'ID sequencial do ingresso',
                routing: {
                    send: {
                        type: 'query',
                        property: 'id_eticket',
                    },
                },
            },
            {
                displayName: 'ID Do Lote',
                name: 'id_lot',
                type: 'number',
                default: 0,
                description: 'ID do lote/categoria do ingresso',
                routing: {
                    send: {
                        type: 'query',
                        property: 'id_lot',
                    },
                },
            },
            {
                displayName: 'QR Code Do Ingresso',
                name: 'ticket_qr_code',
                type: 'string',
                default: '',
                description: 'Código único do ingresso (QR Code)',
                routing: {
                    send: {
                        type: 'query',
                        property: 'ticket_qr_code',
                    },
                },
            },
            {
                displayName: 'Status Do Check-In',
                name: 'checkin_status',
                type: 'options',
                options: [
                    { name: 'Concluído', value: 'CONCLUDED' },
                    { name: 'Parcial', value: 'PARTIAL' },
                    { name: 'Pendente', value: 'PENDING' },
                    { name: 'Todos', value: 'ALL' },
                ],
                default: 'ALL',
                description: 'Filtrar por status de preenchimento dos dados',
                routing: {
                    send: {
                        type: 'query',
                        property: 'checkin_status',
                    },
                },
            },
            {
                displayName: 'Status Do Ingresso',
                name: 'ticket_status',
                type: 'options',
                options: [
                    { name: 'Chargeback', value: 'CHARGEBACK' },
                    { name: 'Convite', value: 'INVITE' },
                    { name: 'Convite Cancelado', value: 'INVITE_CANCELED' },
                    { name: 'Disponível', value: 'AVAILABLE' },
                    { name: 'Excluído', value: 'EXCLUDED' },
                    { name: 'Reembolsado', value: 'REFUNDED' },
                    { name: 'Reservado', value: 'RESERVED' },
                    { name: 'Vendido', value: 'SOLD' },
                ],
                default: 'SOLD',
                description: 'Filtrar por status do ingresso',
                routing: {
                    send: {
                        type: 'query',
                        property: 'ticket_status',
                    },
                },
            },
            {
                displayName: 'Tipo Do Ingresso',
                name: 'ticket_type',
                type: 'options',
                options: [
                    { name: 'Gratuito', value: 'FREE' },
                    { name: 'Pago', value: 'PAID' },
                    { name: 'Todos', value: 'ALL' },
                ],
                default: 'ALL',
                description: 'Filtrar por tipo do ingresso',
                routing: {
                    send: {
                        type: 'query',
                        property: 'ticket_type',
                    },
                },
            },
            {
                displayName: 'Última Atualização',
                name: 'last_update',
                type: 'number',
                default: 0,
                description: 'Data da última atualização (em milissegundos desde 1970-01-01)',
                routing: {
                    send: {
                        type: 'query',
                        property: 'last_update',
                    },
                },
            },
        ],
    },
];
