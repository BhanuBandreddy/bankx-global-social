// Stub hook - Conductor integration is backend-only
// This is kept for backward compatibility with existing components

export const useConductorContext = () => {
  return {
    getLatestInsight: () => null,
    sendWebhook: async () => {},
    isConnected: false
  };
};