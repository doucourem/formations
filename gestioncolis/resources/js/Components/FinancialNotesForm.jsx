import React, { useState, useEffect } from 'react';

export default function FinancialNotesForm({ notes, onSave }) {
    const [fieldValues, setFieldValues] = useState({});

    useEffect(() => {
        if (notes) {
            setFieldValues({
                global_cash_balance: notes.global_cash_balance || 0,
                yawi_ash_balance: notes.yawi_ash_balance || 0,
                lpv_balance: notes.lpv_balance || 0,
                airtel_money_balance: notes.airtel_money_balance || 0,
                available_cash: notes.available_cash || 0,
            });
        }
    }, [notes]);

    const handleChange = (key, value) => {
        const newValues = { ...fieldValues, [key]: parseFloat(value) || 0 };
        setFieldValues(newValues);
        onSave(newValues); // Callback pour sauvegarder via Laravel
    };

    return (
        <div className="space-y-4">
            {Object.keys(fieldValues).map((key) => (
                <div key={key} className="flex justify-between items-center bg-gray-50 p-4 rounded">
                    <label className="capitalize">{key.replace(/_/g, ' ')}</label>
                    <input
                        type="number"
                        value={fieldValues[key]}
                        onChange={(e) => handleChange(key, e.target.value)}
                        className="border rounded px-2 py-1 w-32 text-right"
                    />
                </div>
            ))}
        </div>
    );
}
