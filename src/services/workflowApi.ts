import type { WorkflowDefinition } from "../types/workflow";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const templates: WorkflowDefinition[] = [
  {
    id: "leave-approval-template",
    name: "Leave Approval Workflow",
    nodes: [
      {
        id: "start-1",
        type: "start",
        position: { x: 120, y: 120 },
        data: {
          type: "start",
          config: { label: "Request Submitted" },
        },
      },
      {
        id: "approval-1",
        type: "approval",
        position: { x: 360, y: 120 },
        data: {
          type: "approval",
          config: {
            label: "Manager Approval",
            approverName: "Priya",
            role: "Engineering Manager",
          },
        },
      },
      {
        id: "condition-1",
        type: "condition",
        position: { x: 620, y: 120 },
        data: {
          type: "condition",
          config: {
            label: "Leave Days > 5?",
            field: "leaveDays",
            operator: "gt",
            value: 5,
          },
        },
      },
      {
        id: "action-1",
        type: "apiCall",
        position: { x: 880, y: 60 },
        data: {
          type: "apiCall",
          config: {
            label: "Validate Leave API",
            endpoint: "/api/leaves/validate",
            method: "POST",
            delayMs: 1500,
          },
        },
      },
      {
        id: "action-1b",
        type: "action",
        position: { x: 1110, y: 60 },
        data: {
          type: "action",
          config: {
            label: "Notify HR",
            actionType: "email",
            target: "hr@company.com",
          },
        },
      },
      {
        id: "action-2",
        type: "action",
        position: { x: 880, y: 200 },
        data: {
          type: "action",
          config: {
            label: "Auto Approve",
            actionType: "update-status",
            target: "Approved",
          },
        },
      },
    ],
    edges: [
      { id: "e-start-approval", source: "start-1", target: "approval-1" },
      { id: "e-approval-condition", source: "approval-1", target: "condition-1" },
      {
        id: "e-condition-true",
        source: "condition-1",
        sourceHandle: "true",
        target: "action-1",
        label: "true",
      },
      { id: "e-api-action", source: "action-1", target: "action-1b" },
      {
        id: "e-condition-false",
        source: "condition-1",
        sourceHandle: "false",
        target: "action-2",
        label: "false",
      },
    ],
  },
];

export const workflowApi = {
  async fetchWorkflowTemplates(): Promise<WorkflowDefinition[]> {
    await delay(700);
    return structuredClone(templates);
  },

  async saveWorkflow(workflow: WorkflowDefinition): Promise<{ success: boolean }> {
    await delay(900);
    console.info("Mock Save Workflow", workflow);
    return { success: true };
  },

  async runWorkflow(workflow: WorkflowDefinition): Promise<{ accepted: boolean }> {
    await delay(800);
    console.info("Mock Run Workflow", workflow.id);
    return { accepted: true };
  },
};
