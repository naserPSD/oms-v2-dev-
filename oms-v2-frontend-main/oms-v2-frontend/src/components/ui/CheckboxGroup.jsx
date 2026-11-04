import React from "react";
import Checkbox from "./Checkbox";

const CheckboxGroup = ({
    options = [],
    selectedValues = [],
    onChange,
    name,
    size = "md",
    color = "primary",
    circular = false,
    disabled = false,
    error = "",
    className = "",
}) => {
    const handleChange = (value) => {
        let updatedValues;
        if (selectedValues.includes(value)) {
            updatedValues = selectedValues.filter((v) => v !== value);
        } else {
            updatedValues = [...selectedValues, value];
        }
        onChange && onChange(updatedValues);
    };

    return (
        <div className={`flex flex-col gap-2 ${className}`}>
            {options.map((option) => (
                <Checkbox
                    key={option.id || option.value}
                    id={`${name}-${option.value}`}
                    name={name}
                    label={option.label}
                    checked={selectedValues.includes(option.value)}
                    onChange={() => handleChange(option.value)}
                    size={size}
                    color={color}
                    circular={circular}
                    disabled={disabled}
                />
            ))}

            {/* Error message for group */}
            {error && <span className="mt-1 text-sm text-red-500">{error}</span>}
        </div>
    );
};

export default CheckboxGroup;
