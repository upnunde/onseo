import React from "react";

type SectionVisibilityToggleProps = {
  label: string;
  active: boolean;
  onChange: (nextActive: boolean) => void;
};

export function SectionVisibilityToggle({
  label,
  active,
  onChange,
}: SectionVisibilityToggleProps) {
  return (
    <div className="space-y-3">
      <Row
        stateLabel="활성"
        label={label}
        checked={active}
        onClick={() => onChange(true)}
        active={active}
      />
      <Row
        stateLabel="비활성"
        label={label}
        checked={!active}
        onClick={() => onChange(false)}
        active={!active}
        disabledStyle
      />
    </div>
  );
}

type RowProps = {
  stateLabel: string;
  label: string;
  checked: boolean;
  active: boolean;
  disabledStyle?: boolean;
  onClick: () => void;
};

function Row({
  stateLabel,
  label,
  checked,
  active,
  disabledStyle,
  onClick,
}: RowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-between gap-3"
    >
      <span className="w-[90px] flex-shrink-0 text-[13px] font-medium text-[#45556C] mt-0 text-left">
        {stateLabel}
      </span>
      <div
        className={[
          "flex-1 flex items-center justify-between rounded-full px-4 py-3 border transition-colors",
          active
            ? "border-slate-300 bg-white"
            : "border-slate-200 bg-slate-50",
          disabledStyle ? "text-slate-400" : "text-slate-900",
        ].join(" ")}
      >
        <span className="text-sm">{label}</span>
        <span
          className={[
            "inline-flex items-center justify-center w-5 h-5 rounded-full border transition-colors",
            checked
              ? "border-slate-900 bg-slate-900"
              : "border-slate-300 bg-white",
          ].join(" ")}
        >
          <span
            className={[
              "w-2.5 h-2.5 rounded-full",
              checked ? "bg-white" : "bg-transparent",
            ].join(" ")}
          />
        </span>
      </div>
    </button>
  );
}

