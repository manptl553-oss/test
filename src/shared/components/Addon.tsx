import { Control, useWatch } from "react-hook-form";
import {
  addOnLabels,
  durationLabels,
  EBankStatementDuration,
  EOnboardingAddonType,
} from "../constants";
import { Label } from "./Label";
import { Select } from "./Select";

export function AddOnsConfig({
  control,
  setValue, // Add this
  name = "addons",
  errors,
}: {
  control?: Control<any>;
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
    <div className="wf-addon-root">
      <Label className="wf-addon-title">Select Add-Ons</Label>

      <div className="wf-addon-list">
        {Object.values(EOnboardingAddonType).map((addonType) => {
          const isChecked =
            selectedAddons?.some(
              (addon: any) => addon.addonType === addonType
            ) || false;

          const isDisabled =
            addonType === EOnboardingAddonType.BankAuth &&
            isChecked &&
            isBankStatementsSelected;

          return (
            <div key={addonType} className="wf-addon-item">
              <div className="wf-addon-row">
                <input
                  type="checkbox"
                  id={addonType}
                  checked={isChecked}
                  onChange={(e) =>
                    handleAddonToggle(addonType, e.target.checked)
                  }
                  disabled={isDisabled}
                  className="wf-checkbox"
                />

                <label htmlFor={addonType} className={`wf-addon-label`}>
                  {addOnLabels[addonType]}
                </label>
              </div>

              {addonType === EOnboardingAddonType.BankStatements &&
                isBankStatementsSelected && (
                  <div className="wf-addon-select-block">
                    <Label className="wf-addon-select-label">
                      Select range
                    </Label>
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

      {errors && <p className="wf-error-text">{errors.message}</p>}
    </div>
  );
}
