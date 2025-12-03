import z from "zod";
export enum EOnboardingAddonType {
  PEPCheck = "PEP_CHECK",
  CriminalBackgroundCheck = "CRIMINAL_BACKGROUND_CHECK",
  SSNVerification = "SSN_VERIFICATION",
  BankAuth = "PLAID_BANK_VERIFICATION",
  BankStatements = "PLAID_BANK_STATEMENTS",
}

export enum EBankStatementDuration {
  LastMonth = "lastMonth",
  PastTwoMonths = "pastTwoMonths",
  PastThreeMonths = "pastThreeMonths",
  PastSixMonths = "pastSixMonths",
}

export const addOnLabels: Record<EOnboardingAddonType, string> = {
  [EOnboardingAddonType.PEPCheck]: "PEP Check",
  [EOnboardingAddonType.SSNVerification]: "SSN Verification",
  [EOnboardingAddonType.CriminalBackgroundCheck]: "Criminal Background Check",
  [EOnboardingAddonType.BankAuth]: "Bank Account Verification",
  [EOnboardingAddonType.BankStatements]: "Bank Statement Retrieval",
};

export const durationLabels: Record<EBankStatementDuration, string> = {
  [EBankStatementDuration.PastTwoMonths]: "Past 2 months",
  [EBankStatementDuration.PastThreeMonths]: "Past 3 months",
  [EBankStatementDuration.PastSixMonths]: "Past 6 months",
  [EBankStatementDuration.LastMonth]: "Last month",
};

export const addOnSchema = z.object({
  addonType: z.enum(EOnboardingAddonType, "Please Select type"),
  metadata: z.any().optional(),
});
