import type { INodeProperties } from 'n8n-workflow';

export const membersOperations: INodeProperties[] = [
    {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
            show: {
                resource: ['members'],
            },
        },
        options: [
            {
                name: 'Student Progress',
                value: 'getStudentProgress',
                description: 'Get student progress (summary with % or detailed lesson history)',
                action: 'Get student progress',
            },
            {
                name: 'List Students',
                value: 'getStudents',
                description: 'Get the list of students in the member area',
                action: 'List students in the member area',
                routing: {
                    request: {
                        method: 'GET',
                        url: '/club/api/v1/users',
                        qs: {
                            subdomain: '={{$parameter.subdomain}}',
                        },
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
                name: 'List Modules',
                value: 'getModules',
                description: 'Get the modules of a member area',
                action: 'List modules in the member area',
                routing: {
                    request: {
                        method: 'GET',
                        url: '/club/api/v1/modules',
                        qs: {
                            subdomain: '={{$parameter.subdomain}}',
                        },
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
                name: 'List Pages',
                value: 'getPages',
                description: 'Get the pages of a module',
                action: 'List pages of a module',
                routing: {
                    request: {
                        method: 'GET',
                        url: '=/club/api/v1/modules/{{$parameter.moduleId}}/pages',
                        qs: {
                            subdomain: '={{$parameter.subdomain}}',
                        },
                    },
                },
            },
        ],
        default: 'getStudentProgress',
    },
];

export const membersFields: INodeProperties[] = [
    // ----------------------------------
    //         Common: Subdomain
    // ----------------------------------
    {
        displayName: 'Subdomain',
        name: 'subdomain',
        type: 'string',
        required: true,
        displayOptions: {
            show: {
                resource: ['members'],
                operation: ['getStudents', 'getModules', 'getPages', 'getStudentProgress', 'getStudentsProgress'],
            },
        },
        default: '',
        description: 'The subdomain of your member area (e.g. "myproduct" from myproduct.club.hotmart.com)',
    },
    // ----------------------------------
    //         Student Progress: View Mode
    // ----------------------------------
    {
        displayName: 'View Mode',
        name: 'progressMode',
        type: 'options',
        options: [
            {
                name: 'Percentage / General Summary',
                value: 'summary',
                description: 'Provides the completion %, total lessons, and completed lessons (with optional filter by email)',
            },
            {
                name: 'Detailed Lessons (Lesson By Lesson)',
                value: 'detailed',
                description: 'Provides the detailed status of each lesson in the course watched by the student',
            },
        ],
        default: 'summary',
        displayOptions: {
            show: {
                resource: ['members'],
                operation: ['getStudentProgress'],
            },
        },
        description: 'Choose whether you want the completion summary with the percentage (%) or the lesson-by-lesson breakdown',
    },
    // ----------------------------------
    //         List Pages
    // ----------------------------------
    {
        displayName: 'Product ID',
        name: 'productId',
        type: 'number',
        required: true,
        displayOptions: {
            show: {
                resource: ['members'],
                operation: ['getPages'],
            },
        },
        default: 0,
        description: 'Unique identifier (ID) of the product',
        routing: {
            send: {
                type: 'query',
                property: 'product_id',
            },
        },
    },
    {
        displayName: 'Module ID',
        name: 'moduleId',
        type: 'string',
        required: true,
        displayOptions: {
            show: {
                resource: ['members'],
                operation: ['getPages'],
            },
        },
        default: '',
        description: 'The module ID to get the pages for',
    },
    // ----------------------------------
    //         List Students / Modules / Pagination
    // ----------------------------------
    {
        displayName: 'Return All',
        name: 'returnAll',
        type: 'boolean',
        displayOptions: {
            show: {
                resource: ['members'],
                operation: ['getStudents', 'getModules', 'getPages', 'getStudentProgress', 'getStudentsProgress'],
            },
            hide: {
                progressMode: ['detailed'],
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
                resource: ['members'],
                operation: ['getStudents', 'getModules', 'getPages', 'getStudentProgress', 'getStudentsProgress'],
                returnAll: [false],
            },
            hide: {
                progressMode: ['detailed'],
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
    // ----------------------------------
    //         Filters: Student Progress (Email and ID Only)
    // ----------------------------------
    {
        displayName: 'Filters',
        name: 'filters',
        type: 'collection',
        placeholder: 'Add Filter',
        default: {},
        displayOptions: {
            show: {
                resource: ['members'],
                operation: ['getStudentProgress'],
            },
        },
        options: [
            {
                displayName: 'Email',
                name: 'email',
                type: 'string',
                default: '',
                placeholder: 'e.g. student@email.com',
                description: 'Filter by student email',
            },
            {
                displayName: 'Student ID (User_id)',
                name: 'userId',
                type: 'string',
                default: '',
                placeholder: 'e.g. 12345678',
                description: 'Filter by student ID in Hotmart',
            },
        ],
    },
    // ----------------------------------
    //         Filters: List Students / Modules
    // ----------------------------------
    {
        displayName: 'Filters',
        name: 'filters',
        type: 'collection',
        placeholder: 'Add Filter',
        default: {},
        displayOptions: {
            show: {
                resource: ['members'],
                operation: ['getStudents', 'getModules'],
            },
        },
        options: [
            {
                displayName: 'Email',
                name: 'email',
                type: 'string',
                placeholder: 'name@email.com',
                default: '',
                description: 'Filter by student email',
                routing: {
                    send: {
                        type: 'query',
                        property: 'email',
                    },
                },
            },
            {
                displayName: 'Extra Modules',
                name: 'is_extra',
                type: 'boolean',
                default: false,
                description: 'Whether to return only extra modules (if true) or only main modules (if false)',
                routing: {
                    send: {
                        type: 'query',
                        property: 'is_extra',
                    },
                },
            },
            {
                displayName: 'Name',
                name: 'name',
                type: 'string',
                default: '',
                description: 'Filter by student name',
                routing: {
                    send: {
                        type: 'query',
                        property: 'name',
                    },
                },
            },
            {
                displayName: 'Status',
                name: 'status',
                type: 'options',
                options: [
                    { name: 'Active', value: 'ACTIVE' },
                    { name: 'Inactive', value: 'INACTIVE' },
                ],
                default: 'ACTIVE',
                description: 'Filter by student status',
                routing: {
                    send: {
                        type: 'query',
                        property: 'status',
                    },
                },
            },
        ],
    },
];
