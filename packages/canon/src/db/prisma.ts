export async function getPrisma() {
  return {
    deniedDecision: {
      create: async (params: any) => {
        console.log("Would create denied decision:", params);
        return { id: "stub" };
      },
    },
  };
}
