declare module '@memberstack/dom' {
  const memberstackDOM: {
    init: (options: { publicKey: string }) => Promise<void>;
  };
  export default memberstackDOM;
}

// Types globaux pour l'API Memberstack
declare global {
  interface Window {
    $memberstackDom: {
      getCurrentMember: () => Promise<{
        data: {
          id: string;
          customFields?: Record<string, unknown>;
        } | null;
      }>;
      getMemberJSON: () => Promise<unknown>;
      updateMemberJSON: (data: unknown) => Promise<void>;
      updateMember: (data: {
        customFields?: Record<string, unknown>;
        memberJSON?: unknown;
      }) => Promise<void>;
      addPlan: (options: { planId: string }) => Promise<void>;
    };
  }
}
