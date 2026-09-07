import type {
    IExecuteFunctions,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
    IHttpRequestMethods,
    IDataObject,
    JsonObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

import {
    salesOperations,
    salesFields,
    subscriptionsOperations,
    subscriptionsFields,
    productsOperations,
    productsFields,
    membersOperations,
    membersFields,
    authOperations,
    authFields,
    couponsOperations,
    couponsFields,
    installmentsOperations,
    installmentsFields,
    eventsOperations,
    eventsFields,
} from './descriptions';

import {
    getAccessToken,
    getBaseUrl,
} from './GenericFunctions';

export class Hotmart implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Hotmart',
        name: 'hotmart',
        icon: 'file:hotmart.png',
        group: ['transform'],
        version: 1,
        subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
        description: 'Integração com a API da Hotmart com suporte a credenciais estáticas e tokens dinâmicos (modo SaaS)',
        defaults: {
            name: 'Hotmart',
        },
        inputs: ['main'],
        outputs: ['main'],
        credentials: [
            {
                name: 'hotmartApi',
                required: true,
                displayOptions: {
                    show: {
                        authMode: ['credentials'],
                    },
                },
            },
        ],
        properties: [
            // Seletor de modo de autenticação
            {
                displayName: 'Modo de Autenticação',
                name: 'authMode',
                type: 'options',
                options: [
                    {
                        name: 'Credenciais (Uso Pessoal)',
                        value: 'credentials',
                        description: 'Usar credenciais salvas no n8n - ideal para uso pessoal/single-tenant',
                    },
                    {
                        name: 'Token Dinâmico (Modo SaaS)',
                        value: 'dynamic',
                        description: 'Passar token de acesso dinamicamente - ideal para aplicações multi-tenant SaaS. Use a operação "Obter Access Token" para obter o token primeiro.',
                    },
                ],
                default: 'credentials',
                description: 'Escolha como autenticar com a API da Hotmart',
            },
            // Campos de token dinâmico (exibidos apenas no modo SaaS)
            {
                displayName: 'Token de Acesso',
                name: 'accessToken',
                type: 'string',
                typeOptions: {
                    password: true,
                },
                displayOptions: {
                    show: {
                        authMode: ['dynamic'],
                        resource: ['sales', 'subscriptions', 'products', 'members', 'coupons', 'installments', 'events'],
                    },
                },
                default: '',
                description: 'O token de acesso OAuth da Hotmart. Use a operação "Autenticação > Obter Access Token" para obter este token, ou passe de um node anterior.',
            },
            {
                displayName: 'Ambiente',
                name: 'environment',
                type: 'options',
                displayOptions: {
                    show: {
                        authMode: ['dynamic'],
                        resource: ['sales', 'subscriptions', 'products', 'members', 'coupons', 'installments', 'events'],
                    },
                },
                options: [
                    {
                        name: 'Produção',
                        value: 'production',
                    },
                    {
                        name: 'Sandbox',
                        value: 'sandbox',
                    },
                ],
                default: 'production',
                description: 'O ambiente da Hotmart. IMPORTANTE: Credenciais de Produção só funcionam em Produção e vice-versa.',
            },
            // Opção de metadados de paginação para AI Agents
            {
                displayName: 'Incluir Metadados de Paginação',
                name: 'includePaginationMetadata',
                type: 'boolean',
                default: false,
                description: 'Retorna metadados úteis para AI Agents junto com os resultados (items_returned, has_more, page_token)',
                displayOptions: {
                    show: {
                        resource: ['sales', 'subscriptions', 'products', 'members', 'events', 'coupons'],
                    },
                },
            },
            // Seletor de recurso
            {
                displayName: 'Recurso',
                name: 'resource',
                type: 'options',
                noDataExpression: true,
                options: [
                    {
                        name: 'Autenticação',
                        value: 'auth',
                    },
                    {
                        name: 'Área de Membros',
                        value: 'members',
                    },
                    {
                        name: 'Assinatura',
                        value: 'subscriptions',
                    },
                    {
                        name: 'Cupom',
                        value: 'coupons',
                    },
                    {
                        name: 'Negociação de Parcelas',
                        value: 'installments',
                    },
                    {
                        name: 'Produto',
                        value: 'products',
                    },
                    {
                        name: 'Venda',
                        value: 'sales',
                    },
                    {
                        name: 'Evento',
                        value: 'events',
                    },
                ],
                default: 'sales',
            },
            // Operações e campos
            ...authOperations,
            ...authFields,
            ...salesOperations,
            ...salesFields,
            ...subscriptionsOperations,
            ...subscriptionsFields,
            ...productsOperations,
            ...productsFields,
            ...membersOperations,
            ...membersFields,
            ...couponsOperations,
            ...couponsFields,
            ...installmentsOperations,
            ...installmentsFields,
            ...eventsOperations,
            ...eventsFields,
        ],
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const items = this.getInputData();
        const returnData: INodeExecutionData[] = [];

        const authMode = this.getNodeParameter('authMode', 0) as string;
        const resource = this.getNodeParameter('resource', 0) as string;
        const operation = this.getNodeParameter('operation', 0) as string;

        // Recurso Auth é tratado separadamente (não requer autenticação prévia)
        if (resource === 'auth') {
            if (operation === 'getAccessToken') {
                for (let i = 0; i < items.length; i++) {
                    try {
                        const clientId = this.getNodeParameter('authClientId', i) as string;
                        const clientSecret = this.getNodeParameter('authClientSecret', i) as string;
                        const basicToken = this.getNodeParameter('authBasicToken', i) as string;
                        const environment = this.getNodeParameter('authEnvironment', i) as 'production' | 'sandbox';

                        const accessToken = await getAccessToken({
                            environment,
                            clientId,
                            clientSecret,
                            basicToken,
                        });

                        // Tokens Hotmart expiram em 7200 segundos (2 horas)
                        const expiresIn = 7200;
                        const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

                        returnData.push({
                            json: {
                                access_token: accessToken,
                                token_type: 'bearer',
                                expires_in: expiresIn,
                                expires_at: expiresAt,
                                environment,
                            },
                        });
                    } catch (error) {
                        if (this.continueOnFail()) {
                            returnData.push({ json: { error: (error as Error).message } });
                            continue;
                        }
                        throw error;
                    }
                }
            }
            return [returnData];
        }

        // Para outros recursos, obter autenticação
        let accessToken: string;
        let baseUrl: string;

        if (authMode === 'credentials') {
            // Modo credenciais do n8n
            const credentials = await this.getCredentials('hotmartApi');
            accessToken = await getAccessToken({
                environment: credentials.environment as 'production' | 'sandbox',
                clientId: credentials.clientId as string,
                clientSecret: credentials.clientSecret as string,
                basicToken: credentials.basicToken as string,
            });
            baseUrl = getBaseUrl(credentials.environment as string);
        } else {
            // Modo dinâmico/SaaS - token passado diretamente
            accessToken = this.getNodeParameter('accessToken', 0, '') as string;
            const environment = this.getNodeParameter('environment', 0, 'production') as string;

            if (!accessToken) {
                throw new Error('Token de Acesso é obrigatório no modo SaaS. Use a operação "Autenticação > Obter Access Token" primeiro.');
            }

            baseUrl = getBaseUrl(environment);
        }

        for (let i = 0; i < items.length; i++) {
            try {
                // No modo SaaS, permite tokens diferentes por item
                let itemAccessToken = accessToken;
                let itemBaseUrl = baseUrl;

                if (authMode === 'dynamic') {
                    const itemToken = this.getNodeParameter('accessToken', i, '') as string;
                    if (itemToken) {
                        itemAccessToken = itemToken;
                    }
                    const itemEnv = this.getNodeParameter('environment', i, 'production') as string;
                    itemBaseUrl = getBaseUrl(itemEnv);
                }

                let endpoint = '';
                let method: IHttpRequestMethods = 'GET';
                const qs: IDataObject = {};
                let body: IDataObject = {};

                // Construir requisição baseada no recurso e operação
                if (resource === 'sales') {
                    if (operation === 'getAll') {
                        endpoint = '/payments/api/v1/sales/history';
                    } else if (operation === 'getSummary') {
                        endpoint = '/payments/api/v1/sales/summary';
                    } else if (operation === 'getCommissions') {
                        endpoint = '/payments/api/v1/sales/commissions';
                    } else if (operation === 'getPriceDetails') {
                        endpoint = '/payments/api/v1/sales/price/details';
                    } else if (operation === 'getUsers') {
                        endpoint = '/payments/api/v1/sales/users';
                    } else if (operation === 'refund') {
                        const transactionCode = this.getNodeParameter('transactionCode', i) as string;
                        endpoint = `/payments/api/v1/sales/${transactionCode}/refund`;
                        method = 'PUT';
                    }

                    // Aplicar filtros e limite para operações de consulta
                    if (['getAll', 'getCommissions', 'getPriceDetails', 'getSummary', 'getUsers'].includes(operation)) {
                        const filters = this.getNodeParameter('filters', i, {}) as IDataObject;
                        Object.assign(qs, filters);

                        const returnAll = this.getNodeParameter('returnAll', i, false) as boolean;
                        if (!returnAll && operation !== 'getSummary') {
                            const limit = this.getNodeParameter('limit', i, 50) as number;
                            qs.max_results = limit;
                        }
                    }
                }

                if (resource === 'subscriptions') {
                    if (operation === 'getAll') {
                        endpoint = '/payments/api/v1/subscriptions';
                    } else if (operation === 'getSummary') {
                        endpoint = '/payments/api/v1/subscriptions/summary';
                    } else if (operation === 'getPurchases') {
                        endpoint = '/payments/api/v1/subscriptions/purchases';
                    } else if (operation === 'getTransactions') {
                        endpoint = '/payments/api/v1/subscriptions/transactions';
                    } else if (operation === 'getSubscriberPurchases') {
                        const subscriberCode = this.getNodeParameter('subscriberCode', i) as string;
                        endpoint = `/payments/api/v1/subscriptions/${subscriberCode}/purchases`;
                    } else if (operation === 'cancel') {
                        const subscriberCode = this.getNodeParameter('subscriberCode', i) as string;
                        endpoint = `/payments/api/v1/subscriptions/${subscriberCode}/cancel`;
                        method = 'POST';
                        const sendMail = this.getNodeParameter('sendMail', i, true) as boolean;
                        qs.send_mail = sendMail;
                    } else if (operation === 'cancelBatch') {
                        endpoint = '/payments/api/v1/subscriptions/cancel';
                        method = 'POST';
                        const subscriberCodesStr = this.getNodeParameter('subscriberCodes', i, '') as string;
                        const sendMail = this.getNodeParameter('sendMail', i, true) as boolean;
                        const subscriberCodes = subscriberCodesStr.split(',').map(s => s.trim()).filter(Boolean);
                        body = {
                            subscriber_code: subscriberCodes,
                            send_mail: sendMail,
                        };
                    } else if (operation === 'reactivate') {
                        const subscriberCode = this.getNodeParameter('subscriberCode', i) as string;
                        endpoint = `/payments/api/v1/subscriptions/${subscriberCode}/reactivate`;
                        method = 'POST';
                        const charge = this.getNodeParameter('charge', i, false) as boolean;
                        qs.charge = charge;
                    } else if (operation === 'reactivateBatch') {
                        endpoint = '/payments/api/v1/subscriptions/reactivate';
                        method = 'POST';
                        const subscriberCodesStr = this.getNodeParameter('subscriberCodes', i, '') as string;
                        const charge = this.getNodeParameter('charge', i, false) as boolean;
                        const subscriberCodes = subscriberCodesStr.split(',').map(s => s.trim()).filter(Boolean);
                        body = {
                            subscriber_code: subscriberCodes,
                            charge,
                        };
                    } else if (operation === 'changeBillingDate') {
                        const subscriberCode = this.getNodeParameter('subscriberCode', i) as string;
                        endpoint = `/payments/api/v1/subscriptions/${subscriberCode}`;
                        method = 'PATCH';
                        const dueDay = this.getNodeParameter('dueDay', i) as number;
                        body = { due_day: dueDay };
                    }

                    // Aplicar filtros para operações de listagem
                    if (['getAll', 'getSummary', 'getPurchases', 'getTransactions'].includes(operation)) {
                        const filters = this.getNodeParameter('filters', i, {}) as IDataObject;
                        Object.assign(qs, filters);

                        const returnAll = this.getNodeParameter('returnAll', i, false) as boolean;
                        if (!returnAll && operation !== 'getSummary') {
                            const limit = this.getNodeParameter('limit', i, 50) as number;
                            qs.max_results = limit;
                        }
                    }
                }

                if (resource === 'products') {
                    if (operation === 'getAll') {
                        endpoint = '/products/api/v1/products';

                        const filters = this.getNodeParameter('filters', i, {}) as IDataObject;
                        Object.assign(qs, filters);
                    } else if (operation === 'getOffers') {
                        const productUcode = this.getNodeParameter('productUcode', i) as string;
                        endpoint = `/products/api/v1/products/${productUcode}/offers`;
                    } else if (operation === 'getPlans') {
                        const productUcode = this.getNodeParameter('productUcode', i) as string;
                        endpoint = `/products/api/v1/products/${productUcode}/plans`;
                    }

                    const returnAll = this.getNodeParameter('returnAll', i, false) as boolean;
                    if (!returnAll) {
                        const limit = this.getNodeParameter('limit', i, 50) as number;
                        qs.max_results = limit;
                    }
                }

                if (resource === 'members') {
                    const subdomain = this.getNodeParameter('subdomain', i) as string;
                    qs.subdomain = subdomain;

                    if (operation === 'getStudents' || operation === 'getStudentsProgress') {
                        endpoint = '/club/api/v1/users';
                    } else if (operation === 'getModules') {
                        endpoint = '/club/api/v1/modules';
                    } else if (operation === 'getPages') {
                        const moduleId = this.getNodeParameter('moduleId', i) as string;
                        endpoint = `/club/api/v1/modules/${moduleId}/pages`;
                        const productId = this.getNodeParameter('productId', i, 0) as number;
                        if (productId) {
                            qs.product_id = productId;
                        }
                    } else if (operation === 'getStudentProgress') {
                        const progressMode = this.getNodeParameter('progressMode', i, 'summary') as string;
                        const filters = this.getNodeParameter('filters', i, {}) as IDataObject;

                        if (progressMode === 'summary') {
                            endpoint = '/club/api/v1/users';
                            if (filters.email) {
                                qs.email = (filters.email as string).trim().replace(/["']/g, '');
                            }
                            if (filters.name) {
                                qs.name = filters.name;
                            }
                            if (filters.status) {
                                qs.status = filters.status;
                            }
                        } else {
                            // Modo detalhado: aceita ID interno ou E-mail do aluno a partir de filters
                            let userId = ((filters.userId as string) || '').trim().replace(/["']/g, '');
                            const email = ((filters.email as string) || '').trim().replace(/["']/g, '');

                            if (!userId && !email) {
                                throw new NodeApiError(this.getNode(), {
                                    message: `No modo "Aulas Detalhadas", adicione o filtro "Email" ou "ID do Aluno (user_id)" para especificar qual aluno deseja consultar.`,
                                } as JsonObject);
                            }

                            const searchEmail = (email || (userId.includes('@') ? userId : '')).toLowerCase();
                            if (searchEmail) {
                                let pageToken: string | undefined = undefined;
                                let foundUserId = '';

                                do {
                                    const userLookupQs: IDataObject = {
                                        subdomain,
                                        max_results: 500,
                                    };
                                    if (pageToken) {
                                        userLookupQs.page_token = pageToken;
                                    }

                                    const userLookup = await this.helpers.httpRequest({
                                        method: 'GET',
                                        url: `${itemBaseUrl}/club/api/v1/users`,
                                        headers: {
                                            Authorization: `Bearer ${itemAccessToken}`,
                                            'Content-Type': 'application/json',
                                        },
                                        qs: userLookupQs,
                                        json: true,
                                    }) as { items?: Array<IDataObject>; page_token?: string };

                                    const foundUser = userLookup?.items?.find((u: IDataObject) =>
                                        String(u.email || '').trim().toLowerCase() === searchEmail
                                    );

                                    if (foundUser && (foundUser.user_id || foundUser.id)) {
                                        foundUserId = String(foundUser.user_id || foundUser.id);
                                        break;
                                    }

                                    pageToken = userLookup?.page_token;
                                } while (pageToken);

                                if (foundUserId) {
                                    userId = foundUserId;
                                } else {
                                    throw new NodeApiError(this.getNode(), {
                                        message: `Nenhum aluno encontrado com o e-mail "${searchEmail}" na área de membros "${subdomain}".`,
                                    } as JsonObject);
                                }
                            }

                            endpoint = `/club/api/v1/users/${userId}/lessons`;
                        }
                    }

                    // Aplicar filtros para operações de listagem
                    const isSummaryProgress = operation === 'getStudentProgress' && this.getNodeParameter('progressMode', i, 'summary') === 'summary';
                    if (['getStudents', 'getStudentsProgress', 'getModules', 'getPages'].includes(operation) || isSummaryProgress) {
                        if (['getStudents', 'getStudentsProgress', 'getModules'].includes(operation)) {
                            const filters = this.getNodeParameter('filters', i, {}) as IDataObject;
                            Object.assign(qs, filters);
                        }

                        const returnAll = this.getNodeParameter('returnAll', i, false) as boolean;
                        if (!returnAll) {
                            const limit = this.getNodeParameter('limit', i, 50) as number;
                            qs.max_results = limit;
                        }
                    }
                }

                if (resource === 'coupons') {
                    const productId = this.getNodeParameter('productId', i, '') as string;

                    if (operation === 'create') {
                        endpoint = `/products/api/v1/product/${productId}/coupon`;
                        method = 'POST';

                        const couponCode = this.getNodeParameter('couponCode', i) as string;
                        const discountPercent = this.getNodeParameter('discount', i) as number;
                        // Converter percentual (1-99) para decimal (0.01-0.99)
                        const discount = discountPercent / 100;

                        body = {
                            code: couponCode,
                            discount,
                        };

                        const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as IDataObject;

                        if (additionalOptions.startDate) {
                            body.start_date = new Date(additionalOptions.startDate as string).getTime();
                        }
                        if (additionalOptions.endDate) {
                            body.end_date = new Date(additionalOptions.endDate as string).getTime();
                        }
                        if (additionalOptions.affiliateId) {
                            body.affiliate = additionalOptions.affiliateId;
                        }
                        if (additionalOptions.offerIds) {
                            body.offer_ids = (additionalOptions.offerIds as string).split(',').map(id => id.trim());
                        }
                    } else if (operation === 'getAll') {
                        endpoint = `/products/api/v1/coupon/product/${productId}`;

                        const filters = this.getNodeParameter('filters', i, {}) as IDataObject;
                        if (filters.code) {
                            qs.code = filters.code;
                        }

                        const returnAll = this.getNodeParameter('returnAll', i, false) as boolean;
                        if (!returnAll) {
                            const limit = this.getNodeParameter('limit', i, 50) as number;
                            qs.max_results = limit;
                        }
                    } else if (operation === 'delete') {
                        const couponId = this.getNodeParameter('couponId', i) as string;
                        endpoint = `/products/api/v1/coupon/${couponId}`;
                        method = 'DELETE';
                    }
                }

                if (resource === 'installments') {
                    if (operation === 'negotiate') {
                        endpoint = '/payments/api/v1/installments/negotiate';
                        method = 'POST';

                        const subscriptionId = this.getNodeParameter('subscriptionId', i) as string;
                        const recurrencesStr = this.getNodeParameter('recurrences', i) as string;
                        const paymentType = this.getNodeParameter('paymentType', i) as string;

                        // Converter string de recorrências para array de números
                        const recurrences = recurrencesStr.split(',').map(r => parseInt(r.trim(), 10)).filter(r => !isNaN(r));

                        body = {
                            subscription_id: parseInt(subscriptionId, 10),
                            recurrences,
                            payment_type: paymentType,
                        };

                        // Adicionar documento para pagamento via boleto
                        if (paymentType === 'BILLET') {
                            const document = this.getNodeParameter('document', i) as string;
                            body.document = document.replace(/[.\-\/]/g, ''); // Remove formatação
                        }

                        // Adicionar desconto se habilitado
                        const offerDiscount = this.getNodeParameter('offerDiscount', i, false) as boolean;
                        if (offerDiscount) {
                            const discountType = this.getNodeParameter('discountType', i) as string;
                            const discountValue = this.getNodeParameter('discountValue', i) as number;
                            body.discount = {
                                type: discountType,
                                value: discountValue,
                            };
                        }
                    }
                }

                if (resource === 'events') {
                    const eventId = this.getNodeParameter('eventId', i) as number;

                    if (operation === 'getInfo') {
                        endpoint = `/events/api/v1/${eventId}/info`;
                    } else if (operation === 'getParticipants') {
                        endpoint = `/events/api/v1/${eventId}/participants`;

                        const filters = this.getNodeParameter('filters', i, {}) as IDataObject;
                        Object.assign(qs, filters);

                        const returnAll = this.getNodeParameter('returnAll', i, false) as boolean;
                        if (!returnAll) {
                            const limit = this.getNodeParameter('limit', i, 50) as number;
                            qs.max_results = limit;
                        }
                    }
                }

                // Fazer requisição à API
                const requestOptions = {
                    method,
                    url: `${itemBaseUrl}${endpoint}`,
                    headers: {
                        Authorization: `Bearer ${itemAccessToken}`,
                        'Content-Type': 'application/json',
                    },
                    qs,
                    body: Object.keys(body).length > 0 ? body : undefined,
                    json: true,
                };

                const response = await this.helpers.httpRequest(requestOptions);

                // Verificar se deve incluir metadados de paginação
                const includePaginationMetadata = this.getNodeParameter('includePaginationMetadata', i, false) as boolean;

                // Tratar resposta
                if (response.items && Array.isArray(response.items)) {
                    // Se for getStudentsProgress ou getStudentProgress no modo summary, formatar dados de progresso no primeiro nível
                    const isProgressSummary =
                        operation === 'getStudentsProgress' ||
                        (operation === 'getStudentProgress' && this.getNodeParameter('progressMode', i, 'summary') === 'summary');

                    let itemsToProcess = isProgressSummary
                        ? response.items.map((student: IDataObject) => {
                            const progress = (student.progress as IDataObject) || {};
                            const completedPercentage = progress.completed_percentage !== undefined ? Number(progress.completed_percentage) : 0;
                            const completedLessons = progress.completed !== undefined ? Number(progress.completed) : 0;
                            const totalLessons = progress.total !== undefined ? Number(progress.total) : 0;
                            return {
                                name: student.name,
                                email: student.email,
                                user_id: student.user_id || student.id,
                                completed_percentage: completedPercentage,
                                completed_lessons: completedLessons,
                                total_lessons: totalLessons,
                                is_completed: completedPercentage >= 100,
                                status: student.status,
                                last_access_date: student.last_access_date || null,
                                access_count: student.access_count ?? null,
                            };
                        })
                        : response.items;

                    if (isProgressSummary) {
                        const filters = this.getNodeParameter('filters', i, {}) as IDataObject;
                        if (filters?.email) {
                            const targetEmail = String(filters.email).trim().toLowerCase();
                            itemsToProcess = itemsToProcess.filter((s: IDataObject) => String(s.email || '').trim().toLowerCase() === targetEmail);
                        }
                        if (filters?.userId) {
                            const targetId = String(filters.userId).trim();
                            itemsToProcess = itemsToProcess.filter((s: IDataObject) => String(s.user_id || s.id || '').trim() === targetId);
                        }
                    }

                    if (includePaginationMetadata) {
                        // Retornar com metadados para AI Agents
                        returnData.push({
                            json: {
                                _metadata: {
                                    items_returned: itemsToProcess.length,
                                    has_more: !!response.page_token,
                                    page_token: response.page_token || null,
                                },
                                items: itemsToProcess,
                            } as IDataObject,
                        });
                    } else {
                        // Comportamento padrão - cada item separado
                        for (const item of itemsToProcess) {
                            returnData.push({ json: item as IDataObject });
                        }
                    }
                } else {
                    // Retornar resposta completa
                    returnData.push({ json: response as IDataObject });
                }
            } catch (error) {
                // Extrair mensagem de erro de forma segura para evitar referências circulares
                const err = error as { message?: string; response?: { data?: { message?: string } }; statusCode?: number };
                const errorMessage = err.response?.data?.message || err.message || 'Erro desconhecido na requisição';

                if (this.continueOnFail()) {
                    returnData.push({ json: { error: errorMessage } });
                    continue;
                }

                throw new NodeApiError(this.getNode(), { message: errorMessage } as JsonObject);
            }
        }

        return [returnData];
    }
}
