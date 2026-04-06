import type { DashboardView } from "../types";

export const componentRegistry: Record<string, DashboardView> = {
  "weekly-snapshot": {
    title: "Weekly Snapshot",
    subtitle: "Financial overview for this week",
    components: [
      { type: "summary-cards", dataKey: "weekly-summary-cards" },
      { type: "tabbed-bar-chart", dataKey: "weekly-tabbed-chart" },
      { type: "transaction-list", dataKey: "weekly-transactions" },
    ],
  },

  "ad-spend": {
    title: "Weekly Ad Spend",
    subtitle: "Advertising spend breakdown by platform",
    components: [
      { type: "summary-cards", dataKey: "adspend-summary-cards" },
      { type: "bar-chart", dataKey: "adspend-bar-chart" },
    ],
  },

  payroll: {
    title: "Payroll Overview",
    subtitle: "Employee compensation and department breakdown",
    components: [
      { type: "summary-cards", dataKey: "payroll-summary-cards" },
      { type: "bar-chart", dataKey: "payroll-bar-chart" },
      { type: "payroll-table", dataKey: "payroll-data" },
    ],
  },

  transactions: {
    title: "Recent Transactions",
    subtitle: "Transaction history and details",
    components: [{ type: "transaction-list", dataKey: "weekly-transactions" }],
  },

  all: {
    title: "All Components",
    subtitle: "Full component library",
    components: [
      { type: "summary-cards", dataKey: "weekly-summary-cards" },
      { type: "tabbed-bar-chart", dataKey: "weekly-tabbed-chart" },
      { type: "bar-chart", dataKey: "adspend-bar-chart" },
      { type: "transaction-list", dataKey: "weekly-transactions" },
      { type: "payroll-table", dataKey: "payroll-data" },
    ],
  },
};
