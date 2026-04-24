// src/api/mockData.ts
import type { AutomationAction } from '@/types/workflow';

export const MOCK_ACTIONS: AutomationAction[] = [
  {
    id: 'send-email',
    name: 'Send Email',
    description: 'Send a notification email to specified recipients',
    params: [
      { key: 'to', label: 'Recipient', type: 'string', required: true },
      { key: 'subject', label: 'Subject', type: 'string', required: true },
      { key: 'template', label: 'Template', type: 'select', required: true,
        options: ['onboarding', 'reminder', 'approval-request', 'rejection'] },
    ],
  },
  {
    id: 'create-jira-ticket',
    name: 'Create Jira Ticket',
    description: 'Create a ticket in the configured Jira project',
    params: [
      { key: 'projectKey', label: 'Project Key', type: 'string', required: true },
      { key: 'issueType', label: 'Issue Type', type: 'select', required: true,
        options: ['Task', 'Story', 'Bug'] },
      { key: 'priority', label: 'Priority', type: 'select', required: false,
        options: ['Low', 'Medium', 'High', 'Critical'], defaultValue: 'Medium' },
    ],
  },
  {
    id: 'slack-notify',
    name: 'Slack Notification',
    description: 'Post a message to a Slack channel',
    params: [
      { key: 'channel', label: 'Channel', type: 'string', required: true,
        placeholder: '#general' },
      { key: 'message', label: 'Message', type: 'string', required: true },
      { key: 'mentionAssignee', label: 'Mention Assignee', type: 'boolean',
        required: false, defaultValue: false },
    ],
  },
];