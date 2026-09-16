import type {
    IWebhookFunctions,
    INodeType,
    INodeTypeDescription,
    IWebhookResponseData,
    IDataObject,
    INodeExecutionData,
} from 'n8n-workflow';

// Mapping of events to output indices in Flow mode
const FLOW_EVENT_MAP: Record<string, number> = {
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

// Output names for Flow mode (15 outputs)
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

// Output names for Super Flow mode (6 outputs)
const SUPER_FLOW_OUTPUT_NAMES = [
    { type: 'main', displayName: 'Single Purchase' },
    { type: 'main', displayName: 'New Subscription' },
    { type: 'main', displayName: 'Renewal' },
    { type: 'main', displayName: 'Cancellation' },
    { type: 'main', displayName: 'Payment Issue' },
    { type: 'main', displayName: 'Others' },
];

/**
 * Gets the output index for Flow mode
 */
function getFlowOutputIndex(eventType: string): number {
    return FLOW_EVENT_MAP[eventType] ?? 14; // 14 = Others
}

/**
 * Gets the output index for Super Flow mode
 * Analyzes the payload to differentiate purchase types
 */
function getSuperFlowOutputIndex(eventType: string, bodyData: IDataObject): number {
    const data = bodyData.data as IDataObject || {};
    const purchase = data.purchase as IDataObject || {};
    const subscription = data.subscription as IDataObject | undefined;
    const recurrencyNumber = purchase.recurrency_number as number || 0;

    // Purchase Approved or Complete - differentiate types
    if (eventType === 'PURCHASE_APPROVED' || eventType === 'PURCHASE_COMPLETE') {
        // If there is no subscription, it is a single purchase
        if (!subscription) {
            return 0; // Single Purchase
        }
        // If recurrency_number is 1, it is a new subscription
        if (recurrencyNumber === 1) {
            return 1; // New Subscription
        }
        // If recurrency_number > 1, it is a renewal
        return 2; // Renewal
    }

    // Cancellations
    if (['PURCHASE_CANCELED', 'SUBSCRIPTION_CANCELLATION', 'PURCHASE_REFUNDED'].includes(eventType)) {
        return 3; // Cancellation
    }

    // Payment Issues
    if (['PURCHASE_CHARGEBACK', 'PURCHASE_PROTEST', 'PURCHASE_DELAYED', 'PURCHASE_EXPIRED'].includes(eventType)) {
        return 4; // Payment Issue
    }

    return 5; // Others
}

/**
 * Processes webhook data into a standardized format
 */
function parseWebhookData(bodyData: IDataObject): IDataObject {
    const eventType = bodyData.event as string;

    const webhookData: IDataObject = {
        event: eventType,
        data: bodyData.data || bodyData,
        creation_date: bodyData.creation_date,
        id: bodyData.id,
    };

    // Extract common fields for easier access
    if (bodyData.data && typeof bodyData.data === 'object') {
        const data = bodyData.data as IDataObject;

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

/**
 * Creates a response with multiple outputs, activating only the specified output
 */
function createMultiOutputResponse(
    totalOutputs: number,
    activeIndex: number,
    webhookData: IDataObject,
    context: IWebhookFunctions
): IWebhookResponseData {
    // Create an array with empty arrays for all outputs
    const workflowData: INodeExecutionData[][] = [];

    for (let i = 0; i < totalOutputs; i++) {
        if (i === activeIndex) {
            workflowData.push(context.helpers.returnJsonArray([webhookData]));
        } else {
            workflowData.push([]);
        }
    }

    return { workflowData };
}

export class HotmartTrigger implements INodeType {
    description: INodeTypeDescription = {
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
                        name: 'All Events',
                        value: 'all',
                        description: 'Trigger on any Hotmart webhook event',
                    },
                    {
                        name: 'Billet Printed',
                        value: 'PURCHASE_BILLET_PRINTED',
                        description: 'Trigger when a billet is printed',
                    },
                    {
                        name: 'Billing Day Change',
                        value: 'UPDATE_SUBSCRIPTION_CHARGE_DATE',
                        description: 'Trigger when the subscription billing day is changed',
                    },
                    {
                        name: 'Cart Abandonment',
                        value: 'PURCHASE_OUT_OF_SHOPPING_CART',
                        description: 'Trigger when there is a cart abandonment',
                    },
                    {
                        name: 'Chargeback',
                        value: 'PURCHASE_CHARGEBACK',
                        description: 'Trigger when a chargeback occurs',
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
                        name: 'First Access (Club)',
                        value: 'CLUB_FIRST_ACCESS',
                        description: 'Trigger when a student accesses the course for the first time',
                    },
                    {
                        name: 'Module Completed (Club)',
                        value: 'CLUB_MODULE_COMPLETED',
                        description: 'Trigger when a student completes a course module',
                    },
                    {
                        name: 'Plan Switch',
                        value: 'SWITCH_PLAN',
                        description: 'Trigger when a subscription plan changes',
                    },
                    {
                        name: 'Purchase Approved',
                        value: 'PURCHASE_APPROVED',
                        description: 'Trigger when a purchase is approved',
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
                        name: 'Purchase Delayed',
                        value: 'PURCHASE_DELAYED',
                        description: 'Trigger when a purchase is delayed',
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
                        name: 'Subscription Cancellation',
                        value: 'SUBSCRIPTION_CANCELLATION',
                        description: 'Trigger when a subscription is canceled',
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
            // Super Flow Outputs
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
            // Flow Outputs
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

    async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
        const bodyData = this.getBodyData() as IDataObject;
        const headerData = this.getHeaderData();
        const webhookMode = this.getNodeParameter('webhookMode', 'standard') as string;
        const hottok = this.getNodeParameter('hottok') as string;

        // Validate hottok if configured.
        // Hotmart sends it in the "X-Hotmart-Hottok" header; some legacy events also
        // replicate it in the body, so that is checked as a fallback.
        if (hottok) {
            const requestHottok = (headerData['x-hotmart-hottok'] as string) || (bodyData.hottok as string);
            if (requestHottok !== hottok) {
                const res = this.getResponseObject();
                res.status(401).send('Unauthorized: invalid Hottok').end();
                return { noWebhookResponse: true };
            }
        }

        const eventType = bodyData.event as string;
        const webhookData = parseWebhookData(bodyData);

        // Standard mode - original behavior
        if (webhookMode === 'standard') {
            const event = this.getNodeParameter('event') as string;

            // Filter by event if not "all"
            const isMatch = event === 'all' || eventType === event ||
                (event === 'CLUB_COURSE_COMPLETED' && ['CLUB_COURSE_COMPLETED', 'CLUB_MODULE_COMPLETED', 'CLUB_COMPLETED_MODULE'].includes(eventType)) ||
                (event === 'CLUB_MODULE_COMPLETED' && ['CLUB_COURSE_COMPLETED', 'CLUB_MODULE_COMPLETED', 'CLUB_COMPLETED_MODULE'].includes(eventType));

            if (!isMatch) {
                const res = this.getResponseObject();
                res.status(200).send('Event ignored').end();
                return { noWebhookResponse: true };
            }

            return {
                workflowData: [
                    this.helpers.returnJsonArray([webhookData]),
                ],
            };
        }

        // Flow mode - 15 outputs by event type
        if (webhookMode === 'flow') {
            const outputIndex = getFlowOutputIndex(eventType);
            return createMultiOutputResponse(FLOW_OUTPUT_NAMES.length, outputIndex, webhookData, this);
        }

        // Super Flow mode - 6 granular outputs
        if (webhookMode === 'superFlow') {
            const outputIndex = getSuperFlowOutputIndex(eventType, bodyData);
            return createMultiOutputResponse(SUPER_FLOW_OUTPUT_NAMES.length, outputIndex, webhookData, this);
        }

        // Fallback
        return {
            workflowData: [
                this.helpers.returnJsonArray([webhookData]),
            ],
        };
    }
}
