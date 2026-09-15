"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotmartTrigger = void 0;
const FLOW_EVENT_MAP = {
    'PURCHASE_APPROVED': 0,
    'PURCHASE_COMPLETE': 1,
    'PURCHASE_CANCELED': 2,
    'PURCHASE_REFUNDED': 3,
    'PURCHASE_CHARGEBACK': 4,
    'PURCHASE_BILLET_PRINTED': 5,
    'PURCHASE_DELAYED': 6,
    'PURCHASE_EXPIRED': 7,
    'PURCHASE_OUT_OF_SHOPPING_CART': 8,
    'PURCHASE_PROTEST': 9,
    'SUBSCRIPTION_CANCELLATION': 10,
    'SWITCH_PLAN': 11,
    'CLUB_FIRST_ACCESS': 12,
    'CLUB_MODULE_COMPLETED': 13,
    'CLUB_COMPLETED_MODULE': 13,
    'CLUB_COURSE_COMPLETED': 13,
};
const FLOW_OUTPUT_NAMES = [
    { type: 'main', displayName: 'Purchase Approved' },
    { type: 'main', displayName: 'Purchase Complete' },
    { type: 'main', displayName: 'Purchase Canceled' },
    { type: 'main', displayName: 'Purchase Refunded' },
    { type: 'main', displayName: 'Chargeback' },
    { type: 'main', displayName: 'Billet Printed' },
    { type: 'main', displayName: 'Purchase Delayed' },
    { type: 'main', displayName: 'Purchase Expired' },
    { type: 'main', displayName: 'Cart Abandonment' },
    { type: 'main', displayName: 'Dispute Opened' },
    { type: 'main', displayName: 'Subscription Cancel.' },
    { type: 'main', displayName: 'Plan Switch' },
    { type: 'main', displayName: 'First Access' },
    { type: 'main', displayName: 'Course Completed' },
    { type: 'main', displayName: 'Others' },
];
const SUPER_FLOW_OUTPUT_NAMES = [
    { type: 'main', displayName: 'Single Purchase' },
    { type: 'main', displayName: 'New Subscription' },
    { type: 'main', displayName: 'Renewal' },
    { type: 'main', displayName: 'Cancellation' },
    { type: 'main', displayName: 'Payment Issue' },
    { type: 'main', displayName: 'Others' },
];
function getFlowOutputIndex(eventType) {
    var _a;
    return (_a = FLOW_EVENT_MAP[eventType]) !== null && _a !== void 0 ? _a : 14;
}
function getSuperFlowOutputIndex(eventType, bodyData) {
    const data = bodyData.data || {};
    const purchase = data.purchase || {};
    const subscription = data.subscription;
    const recurrencyNumber = purchase.recurrency_number || 0;
    if (eventType === 'PURCHASE_APPROVED' || eventType === 'PURCHASE_COMPLETE') {
        if (!subscription) {
            return 0;
        }
        if (recurrencyNumber === 1) {
            return 1;
        }
        return 2;
    }
    if (['PURCHASE_CANCELED', 'SUBSCRIPTION_CANCELLATION', 'PURCHASE_REFUNDED'].includes(eventType)) {
        return 3;
    }
    if (['PURCHASE_CHARGEBACK', 'PURCHASE_PROTEST', 'PURCHASE_DELAYED', 'PURCHASE_EXPIRED'].includes(eventType)) {
        return 4;
    }
    return 5;
}
function parseWebhookData(bodyData) {
    const eventType = bodyData.event;
    const webhookData = {
        event: eventType,
        data: bodyData.data || bodyData,
        creation_date: bodyData.creation_date,
        id: bodyData.id,
    };
    if (bodyData.data && typeof bodyData.data === 'object') {
        const data = bodyData.data;
        if (data.buyer) {
            webhookData.buyer = data.buyer;
        }
        if (data.product) {
            webhookData.product = data.product;
        }
        if (data.purchase) {
            webhookData.purchase = data.purchase;
        }
        if (data.subscription) {
            webhookData.subscription = data.subscription;
        }
        if (data.producer) {
            webhookData.producer = data.producer;
        }
        if (data.affiliate) {
            webhookData.affiliate = data.affiliate;
        }
        if (data.subscriber) {
            webhookData.subscriber = data.subscriber;
        }
        if (data.plans) {
            webhookData.plans = data.plans;
        }
        if (data.offer) {
            webhookData.offer = data.offer;
        }
        if (data.checkout_country) {
            webhookData.checkout_country = data.checkout_country;
        }
        if (data.affiliates) {
            webhookData.affiliates = data.affiliates;
        }
        if (data.commissions) {
            webhookData.commissions = data.commissions;
        }
        if (data.plan) {
            webhookData.plan = data.plan;
        }
        if (data.user) {
            webhookData.user = data.user;
        }
        if (data.student) {
            webhookData.student = data.student;
        }
        if (data.module) {
            webhookData.module = data.module;
        }
        if (data.course) {
            webhookData.course = data.course;
        }
    }
    return webhookData;
}
function createMultiOutputResponse(totalOutputs, activeIndex, webhookData, context) {
    const workflowData = [];
    for (let i = 0; i < totalOutputs; i++) {
        if (i === activeIndex) {
            workflowData.push(context.helpers.returnJsonArray([webhookData]));
        }
        else {
            workflowData.push([]);
        }
    }
    return { workflowData };
}
class HotmartTrigger {
    constructor() {
        this.description = {
            displayName: 'Hotmart Trigger',
            name: 'hotmartTrigger',
            icon: 'file:hotmart.svg',
            group: ['trigger'],
            version: 1,
            subtitle: '={{$parameter["webhookMode"] === "flow" ? "Flow: " + "15 outputs" : $parameter["webhookMode"] === "superFlow" ? "Super Flow: 6 outputs" : $parameter["event"]}}',
            description: 'Starts the workflow when a Hotmart webhook event occurs.',
            defaults: {
                name: 'Hotmart Trigger',
            },
            inputs: [],
            outputs: `={{
            $parameter["webhookMode"] === "flow" 
                ? [
                    { type: 'main', displayName: $parameter["customizeOutputs"] ? $parameter["output_flow_approved"] : "Purchase Approved" },
                    { type: 'main', displayName: $parameter["customizeOutputs"] ? $parameter["output_flow_complete"] : "Purchase Complete" },
                    { type: 'main', displayName: $parameter["customizeOutputs"] ? $parameter["output_flow_canceled"] : "Purchase Canceled" },
                    { type: 'main', displayName: $parameter["customizeOutputs"] ? $parameter["output_flow_refunded"] : "Purchase Refunded" },
                    { type: 'main', displayName: $parameter["customizeOutputs"] ? $parameter["output_flow_chargeback"] : "Chargeback" },
                    { type: 'main', displayName: $parameter["customizeOutputs"] ? $parameter["output_flow_billet"] : "Billet Printed" },
                    { type: 'main', displayName: $parameter["customizeOutputs"] ? $parameter["output_flow_delayed"] : "Purchase Delayed" },
                    { type: 'main', displayName: $parameter["customizeOutputs"] ? $parameter["output_flow_expired"] : "Purchase Expired" },
                    { type: 'main', displayName: $parameter["customizeOutputs"] ? $parameter["output_flow_abandoned"] : "Cart Abandonment" },
                    { type: 'main', displayName: $parameter["customizeOutputs"] ? $parameter["output_flow_dispute"] : "Dispute Opened" },
                    { type: 'main', displayName: $parameter["customizeOutputs"] ? $parameter["output_flow_sub_cancel"] : "Subscription Cancel." },
                    { type: 'main', displayName: $parameter["customizeOutputs"] ? $parameter["output_flow_plan_switch"] : "Plan Switch" },
                    { type: 'main', displayName: $parameter["customizeOutputs"] ? $parameter["output_flow_first_access"] : "First Access" },
                    { type: 'main', displayName: $parameter["customizeOutputs"] ? $parameter["output_flow_course_completed"] : "Course Completed" },
                    { type: 'main', displayName: $parameter["customizeOutputs"] ? $parameter["output_flow_other"] : "Others" },
                ]
                : $parameter["webhookMode"] === "superFlow"
                    ? [
                        { type: 'main', displayName: $parameter["customizeOutputs"] ? $parameter["output_super_single"] : "Single Purchase" },
                        { type: 'main', displayName: $parameter["customizeOutputs"] ? $parameter["output_super_new_sub"] : "New Subscription" },
                        { type: 'main', displayName: $parameter["customizeOutputs"] ? $parameter["output_super_renewal"] : "Renewal" },
                        { type: 'main', displayName: $parameter["customizeOutputs"] ? $parameter["output_super_cancellation"] : "Cancellation" },
                        { type: 'main', displayName: $parameter["customizeOutputs"] ? $parameter["output_super_payment"] : "Payment Issue" },
                        { type: 'main', displayName: $parameter["customizeOutputs"] ? $parameter["output_super_other"] : "Others" },
                    ]
                    : ["main"]
        }}`,
            webhooks: [
                {
                    name: 'default',
                    httpMethod: 'POST',
                    responseMode: 'onReceived',
                    path: '={{ $parameter["path"] ? $parameter["path"] : "webhook" }}',
                },
            ],
            properties: [
                {
                    displayName: 'Webhook Mode',
                    name: 'webhookMode',
                    type: 'options',
                    noDataExpression: true,
                    options: [
                        {
                            name: 'Standard',
                            value: 'standard',
                            description: 'A single output for all events',
                        },
                        {
                            name: 'Flow',
                            value: 'flow',
                            description: 'Separate outputs by event type (15 outputs)',
                        },
                        {
                            name: 'Super Flow',
                            value: 'superFlow',
                            description: 'Granular outputs by context (6 outputs: Single Purchase, New Subscription, Renewal, etc.)',
                        },
                    ],
                    default: 'standard',
                    description: 'Defines how events are routed to the workflow outputs',
                },
                {
                    displayName: 'Event',
                    name: 'event',
                    type: 'options',
                    noDataExpression: true,
                    displayOptions: {
                        show: {
                            webhookMode: ['standard'],
                        },
                    },
                    options: [
                        {
                            name: 'Cart Abandonment',
                            value: 'PURCHASE_OUT_OF_SHOPPING_CART',
                            description: 'Trigger when there is a cart abandonment',
                        },
                        {
                            name: 'Billet Printed',
                            value: 'PURCHASE_BILLET_PRINTED',
                            description: 'Trigger when a billet is printed',
                        },
                        {
                            name: 'Subscription Cancellation',
                            value: 'SUBSCRIPTION_CANCELLATION',
                            description: 'Trigger when a subscription is canceled',
                        },
                        {
                            name: 'Chargeback',
                            value: 'PURCHASE_CHARGEBACK',
                            description: 'Trigger when a chargeback occurs',
                        },
                        {
                            name: 'Purchase Approved',
                            value: 'PURCHASE_APPROVED',
                            description: 'Trigger when a purchase is approved',
                        },
                        {
                            name: 'Purchase Delayed',
                            value: 'PURCHASE_DELAYED',
                            description: 'Trigger when a purchase is delayed',
                        },
                        {
                            name: 'Purchase Canceled',
                            value: 'PURCHASE_CANCELED',
                            description: 'Trigger when a purchase is canceled',
                        },
                        {
                            name: 'Purchase Complete',
                            value: 'PURCHASE_COMPLETE',
                            description: 'Trigger when a purchase is completed',
                        },
                        {
                            name: 'Purchase Expired',
                            value: 'PURCHASE_EXPIRED',
                            description: 'Trigger when a purchase expires',
                        },
                        {
                            name: 'Purchase Refunded',
                            value: 'PURCHASE_REFUNDED',
                            description: 'Trigger when a purchase is refunded',
                        },
                        {
                            name: 'Course Completed (Club)',
                            value: 'CLUB_COURSE_COMPLETED',
                            description: 'Trigger when a student completes the course',
                        },
                        {
                            name: 'Dispute Opened',
                            value: 'PURCHASE_PROTEST',
                            description: 'Trigger when a dispute is opened',
                        },
                        {
                            name: 'Module Completed (Club)',
                            value: 'CLUB_MODULE_COMPLETED',
                            description: 'Trigger when a student completes a course module',
                        },
                        {
                            name: 'First Access (Club)',
                            value: 'CLUB_FIRST_ACCESS',
                            description: 'Trigger when a student accesses the course for the first time',
                        },
                        {
                            name: 'All Events',
                            value: 'all',
                            description: 'Trigger on any Hotmart webhook event',
                        },
                        {
                            name: 'Billing Day Change',
                            value: 'UPDATE_SUBSCRIPTION_CHARGE_DATE',
                            description: 'Trigger when the subscription billing day is changed',
                        },
                        {
                            name: 'Plan Switch',
                            value: 'SWITCH_PLAN',
                            description: 'Trigger when a subscription plan changes',
                        },
                    ],
                    default: 'all',
                    description: 'The event to listen for',
                },
                {
                    displayName: 'Hottok (Secret)',
                    name: 'hottok',
                    type: 'string',
                    typeOptions: {
                        password: true,
                    },
                    default: '',
                    description: 'Optional: The Hottok secret from the Hotmart webhook settings. If set, requests without a valid hottok will be rejected.',
                },
                {
                    displayName: 'Custom Path',
                    name: 'path',
                    type: 'string',
                    default: 'webhook',
                    placeholder: 'webhook',
                    description: 'The webhook URL path. Default is "webhook".',
                },
                {
                    displayName: 'Customize Output Names',
                    name: 'customizeOutputs',
                    type: 'boolean',
                    default: false,
                    description: 'Whether to rename the outputs for Flow and Super Flow modes',
                },
                {
                    displayName: 'Alternative Name For: Single Purchase',
                    name: 'output_super_single',
                    type: 'string',
                    default: 'Single Purchase',
                    displayOptions: {
                        show: {
                            webhookMode: ['superFlow'],
                            customizeOutputs: [true],
                        },
                    },
                },
                {
                    displayName: 'Alternative Name For: New Subscription',
                    name: 'output_super_new_sub',
                    type: 'string',
                    default: 'New Subscription',
                    displayOptions: {
                        show: {
                            webhookMode: ['superFlow'],
                            customizeOutputs: [true],
                        },
                    },
                },
                {
                    displayName: 'Alternative Name For: Renewal',
                    name: 'output_super_renewal',
                    type: 'string',
                    default: 'Renewal',
                    displayOptions: {
                        show: {
                            webhookMode: ['superFlow'],
                            customizeOutputs: [true],
                        },
                    },
                },
                {
                    displayName: 'Alternative Name For: Cancellation',
                    name: 'output_super_cancellation',
                    type: 'string',
                    default: 'Cancellation',
                    displayOptions: {
                        show: {
                            webhookMode: ['superFlow'],
                            customizeOutputs: [true],
                        },
                    },
                },
                {
                    displayName: 'Alternative Name For: Payment Issue',
                    name: 'output_super_payment',
                    type: 'string',
                    default: 'Payment Issue',
                    displayOptions: {
                        show: {
                            webhookMode: ['superFlow'],
                            customizeOutputs: [true],
                        },
                    },
                },
                {
                    displayName: 'Alternative Name For: Others',
                    name: 'output_super_other',
                    type: 'string',
                    default: 'Others',
                    displayOptions: {
                        show: {
                            webhookMode: ['superFlow'],
                            customizeOutputs: [true],
                        },
                    },
                },
                {
                    displayName: 'Alternative Name For: Purchase Approved',
                    name: 'output_flow_approved',
                    type: 'string',
                    default: 'Purchase Approved',
                    displayOptions: {
                        show: {
                            webhookMode: ['flow'],
                            customizeOutputs: [true],
                        },
                    },
                },
                {
                    displayName: 'Alternative Name For: Purchase Complete',
                    name: 'output_flow_complete',
                    type: 'string',
                    default: 'Purchase Complete',
                    displayOptions: {
                        show: {
                            webhookMode: ['flow'],
                            customizeOutputs: [true],
                        },
                    },
                },
                {
                    displayName: 'Alternative Name For: Purchase Canceled',
                    name: 'output_flow_canceled',
                    type: 'string',
                    default: 'Purchase Canceled',
                    displayOptions: {
                        show: {
                            webhookMode: ['flow'],
                            customizeOutputs: [true],
                        },
                    },
                },
                {
                    displayName: 'Alternative Name For: Purchase Refunded',
                    name: 'output_flow_refunded',
                    type: 'string',
                    default: 'Purchase Refunded',
                    displayOptions: {
                        show: {
                            webhookMode: ['flow'],
                            customizeOutputs: [true],
                        },
                    },
                },
                {
                    displayName: 'Alternative Name For: Chargeback',
                    name: 'output_flow_chargeback',
                    type: 'string',
                    default: 'Chargeback',
                    displayOptions: {
                        show: {
                            webhookMode: ['flow'],
                            customizeOutputs: [true],
                        },
                    },
                },
                {
                    displayName: 'Alternative Name For: Billet Printed',
                    name: 'output_flow_billet',
                    type: 'string',
                    default: 'Billet Printed',
                    displayOptions: {
                        show: {
                            webhookMode: ['flow'],
                            customizeOutputs: [true],
                        },
                    },
                },
                {
                    displayName: 'Alternative Name For: Purchase Delayed',
                    name: 'output_flow_delayed',
                    type: 'string',
                    default: 'Purchase Delayed',
                    displayOptions: {
                        show: {
                            webhookMode: ['flow'],
                            customizeOutputs: [true],
                        },
                    },
                },
                {
                    displayName: 'Alternative Name For: Purchase Expired',
                    name: 'output_flow_expired',
                    type: 'string',
                    default: 'Purchase Expired',
                    displayOptions: {
                        show: {
                            webhookMode: ['flow'],
                            customizeOutputs: [true],
                        },
                    },
                },
                {
                    displayName: 'Alternative Name For: Cart Abandonment',
                    name: 'output_flow_abandoned',
                    type: 'string',
                    default: 'Cart Abandonment',
                    displayOptions: {
                        show: {
                            webhookMode: ['flow'],
                            customizeOutputs: [true],
                        },
                    },
                },
                {
                    displayName: 'Alternative Name For: Dispute Opened',
                    name: 'output_flow_dispute',
                    type: 'string',
                    default: 'Dispute Opened',
                    displayOptions: {
                        show: {
                            webhookMode: ['flow'],
                            customizeOutputs: [true],
                        },
                    },
                },
                {
                    displayName: 'Alternative Name For: Subscription Cancel.',
                    name: 'output_flow_sub_cancel',
                    type: 'string',
                    default: 'Subscription Cancel.',
                    displayOptions: {
                        show: {
                            webhookMode: ['flow'],
                            customizeOutputs: [true],
                        },
                    },
                },
                {
                    displayName: 'Alternative Name For: Plan Switch',
                    name: 'output_flow_plan_switch',
                    type: 'string',
                    default: 'Plan Switch',
                    displayOptions: {
                        show: {
                            webhookMode: ['flow'],
                            customizeOutputs: [true],
                        },
                    },
                },
                {
                    displayName: 'Alternative Name For: First Access',
                    name: 'output_flow_first_access',
                    type: 'string',
                    default: 'First Access',
                    displayOptions: {
                        show: {
                            webhookMode: ['flow'],
                            customizeOutputs: [true],
                        },
                    },
                },
                {
                    displayName: 'Alternative Name For: Course Completed',
                    name: 'output_flow_course_completed',
                    type: 'string',
                    default: 'Course Completed',
                    displayOptions: {
                        show: {
                            webhookMode: ['flow'],
                            customizeOutputs: [true],
                        },
                    },
                },
                {
                    displayName: 'Alternative Name For: Others',
                    name: 'output_flow_other',
                    type: 'string',
                    default: 'Others',
                    displayOptions: {
                        show: {
                            webhookMode: ['flow'],
                            customizeOutputs: [true],
                        },
                    },
                },
            ],
        };
    }
    async webhook() {
        const bodyData = this.getBodyData();
        const webhookMode = this.getNodeParameter('webhookMode', 'standard');
        const hottok = this.getNodeParameter('hottok');
        if (hottok) {
            const requestHottok = bodyData.hottok;
            if (requestHottok !== hottok) {
                return {
                    webhookResponse: {
                        status: 401,
                        body: 'Unauthorized: invalid Hottok',
                    },
                };
            }
        }
        const eventType = bodyData.event;
        const webhookData = parseWebhookData(bodyData);
        if (webhookMode === 'standard') {
            const event = this.getNodeParameter('event');
            const isMatch = event === 'all' || eventType === event ||
                (event === 'CLUB_COURSE_COMPLETED' && ['CLUB_COURSE_COMPLETED', 'CLUB_MODULE_COMPLETED', 'CLUB_COMPLETED_MODULE'].includes(eventType)) ||
                (event === 'CLUB_MODULE_COMPLETED' && ['CLUB_COURSE_COMPLETED', 'CLUB_MODULE_COMPLETED', 'CLUB_COMPLETED_MODULE'].includes(eventType));
            if (!isMatch) {
                return {
                    webhookResponse: {
                        status: 200,
                        body: 'Event ignored',
                    },
                };
            }
            return {
                workflowData: [
                    this.helpers.returnJsonArray([webhookData]),
                ],
            };
        }
        if (webhookMode === 'flow') {
            const outputIndex = getFlowOutputIndex(eventType);
            return createMultiOutputResponse(FLOW_OUTPUT_NAMES.length, outputIndex, webhookData, this);
        }
        if (webhookMode === 'superFlow') {
            const outputIndex = getSuperFlowOutputIndex(eventType, bodyData);
            return createMultiOutputResponse(SUPER_FLOW_OUTPUT_NAMES.length, outputIndex, webhookData, this);
        }
        return {
            workflowData: [
                this.helpers.returnJsonArray([webhookData]),
            ],
        };
    }
}
exports.HotmartTrigger = HotmartTrigger;
