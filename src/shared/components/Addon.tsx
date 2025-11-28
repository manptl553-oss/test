import { useWatch } from "react-hook-form";
import { Label } from "./Label";
import { Select } from "./Select";
import { EOnboardingAddonType } from "../constants";

export enum EBankStatementDuration {
  LastMonth = "lastMonth",
  PastTwoMonths = "pastTwoMonths",
  PastThreeMonths = "pastThreeMonths",
  PastSixMonths = "pastSixMonths",
}

const addOnLabels: Record<EOnboardingAddonType, string> = {
  [EOnboardingAddonType.PEPCheck]: "PEP Check",
  [EOnboardingAddonType.SSNVerification]: "SSN Verification",
  [EOnboardingAddonType.CriminalBackgroundCheck]: "Criminal Background Check",
  [EOnboardingAddonType.BankAuth]: "Bank Account Verification",
  [EOnboardingAddonType.BankStatements]: "Bank Statement Retrieval",
};

const durationLabels: Record<EBankStatementDuration, string> = {
  [EBankStatementDuration.PastTwoMonths]: "Past 2 months",
  [EBankStatementDuration.PastThreeMonths]: "Past 3 months",
  [EBankStatementDuration.PastSixMonths]: "Past 6 months",
  [EBankStatementDuration.LastMonth]: "Last month",
};

export function AddOnsConfig({
  control,
  setValue, // Add this
  name = "addons",
  errors,
}: {
  control?: any;
  setValue?: any; // From useForm()
  name?: string;
  errors?: any;
}) {
  const selectedAddons = useWatch({
    control,
    name: name,
  });

  const isBankStatementsSelected = selectedAddons?.some(
    (addon: any) => addon.addonType === EOnboardingAddonType.BankStatements
  );

  const isBankAccountVerificationSelected = selectedAddons?.some(
    (addon: any) => addon.addonType === EOnboardingAddonType.BankAuth
  );

  const handleAddonToggle = (
    addonType: EOnboardingAddonType,
    isChecked: boolean
  ) => {
    if (!setValue) return;

    const currentAddons = Array.isArray(selectedAddons) ? selectedAddons : [];

    let newAddons: any[] = [];

    if (isChecked) {
      newAddons = [...currentAddons];

      if (addonType === EOnboardingAddonType.BankStatements) {
        // Add BankStatements with default duration
        const hasStatements = newAddons.some(
          (a) => a.addonType === EOnboardingAddonType.BankStatements
        );
        if (!hasStatements) {
          newAddons.push({
            addonType: EOnboardingAddonType.BankStatements,
            metadata: {
              duration: EBankStatementDuration.PastTwoMonths,
            },
          });
        }

        // Auto-add BankAuth if not present
        const hasBankAuth = newAddons.some(
          (a) => a.addonType === EOnboardingAddonType.BankAuth
        );
        if (!hasBankAuth) {
          newAddons.push({
            addonType: EOnboardingAddonType.BankAuth,
          });
        }
      } else if (
        addonType !== EOnboardingAddonType.BankAuth ||
        !isBankStatementsSelected
      ) {
        // Only allow manual check of BankAuth if BankStatements is NOT selected
        newAddons.push({ addonType });
      }
    } else {
      // Remove the addon
      newAddons = currentAddons.filter(
        (addon: any) => addon.addonType !== addonType
      );

      // If unchecking BankStatements, optionally keep BankAuth or remove?
      // Here we keep it (safe default)
    }

    // Properly update using setValue
    setValue(name, newAddons, { shouldDirty: true, shouldValidate: true });
  };

  const handleDurationChange = (duration: string) => {
    if (!setValue) return;

    const currentAddons = Array.isArray(selectedAddons) ? selectedAddons : [];

    const updatedAddons = currentAddons.map((addon: any) =>
      addon.addonType === EOnboardingAddonType.BankStatements
        ? { ...addon, metadata: { ...addon.metadata, duration } }
        : addon
    );

    setValue(name, updatedAddons, { shouldDirty: true, shouldValidate: true });
  };
  return (
    <div className="space-y-4">
      <Label className="text-lg font-semibold">Select Add-Ons</Label>

      <div className="space-y-3">
        {Object.values(EOnboardingAddonType).map((addonType) => {
          const isChecked =
            selectedAddons?.some(
              (addon: any) => addon.addonType === addonType
            ) || false;

          // Disable Bank Auth checkbox only when it's checked AND Bank Statements is also checked
          const isDisabled =
            addonType === EOnboardingAddonType.BankAuth &&
            isChecked &&
            isBankStatementsSelected;

          return (
            <div key={addonType} className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={addonType}
                  checked={isChecked}
                  onChange={(e) =>
                    handleAddonToggle(addonType, e.target.checked)
                  }
                  disabled={isDisabled}
                  className="w-4 h-4 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                />
                <label
                  htmlFor={addonType}
                  className={`cursor-pointer ${isDisabled ? "opacity-50" : ""}`}
                >
                  {addOnLabels[addonType]}
                  {isDisabled && (
                    <span className="text-xs text-gray-500 ml-2">
                      (Required for Bank Statements)
                    </span>
                  )}
                </label>
              </div>

              {/* Bank Statements Duration Select */}
              {addonType === EOnboardingAddonType.BankStatements &&
                isBankStatementsSelected && (
                  <div className="ml-6 space-y-1">
                    <Label className="text-sm">Select range</Label>
                    <Select
                      options={Object.entries(durationLabels).map(
                        ([value, label]) => ({
                          value,
                          label,
                        })
                      )}
                      value={
                        selectedAddons?.find(
                          (addon: any) =>
                            addon.addonType ===
                            EOnboardingAddonType.BankStatements
                        )?.metadata?.duration ||
                        EBankStatementDuration.PastTwoMonths
                      }
                      onValueChange={handleDurationChange}
                      placeholder="Select duration"
                    />
                  </div>
                )}
            </div>
          );
        })}
      </div>

      {errors && <p className="text-red-500 text-xs">{errors.message}</p>}
    </div>
  );
}
