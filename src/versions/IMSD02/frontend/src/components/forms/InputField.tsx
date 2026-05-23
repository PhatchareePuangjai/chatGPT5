import React from "react";

export function InputField(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const { label, value, onChange, placeholder } = props;
  return (
    <label style={{ display: "grid", gap: 4 }}>
      <span style={{ fontSize: 12, color: "#374151" }}>{label}</span>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{
          borderRadius: 6,
          border: "1px solid #d1d5db",
          padding: "8px 10px",
          fontSize: 14
        }}
      />
    </label>
  );
}

