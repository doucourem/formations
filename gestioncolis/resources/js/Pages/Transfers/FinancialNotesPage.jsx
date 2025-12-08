import React, { useState, useEffect } from 'react';
import GuestLayout from "@/Layouts/GuestLayout";

export default function FinancialNotesForm({ notes, onSave }) {
    const [fields, setFields] = useState({});

    useEffect(() => {
        setFields({
            global_cash_balance: notes.global_cash_balance ?? 0,
            yawi_ash_balance: notes.yawi_ash_balance ?? 0,
            lpv_balance: notes.lpv_balance ?? 0,
            airtel_money_balance: notes.airtel_money_balance ?? 0,
            available_cash: notes.available_cash ?? 0,
            balde_alpha_debt: notes.balde_alpha_debt ?? 0,
            md_owes_us: notes.md_owes_us ?? 0,
            we_owe_md: notes.we_owe_md ?? 0,
            notes: notes.notes ?? "",
        });
    }, [notes]);

    const handleChange = (key, value) => {
        const newValues = { ...fields, [key]: value };
        setFields(newValues);
        onSave({ id: notes.id, ...newValues });
    };

    return (
            <GuestLayout>
        <div className="space-y-4">
            {Object.keys(fields).map((key) => (
                <div key={key} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                    <label>{key.replace(/_/g, ' ')}</label>
                    <input
                        type="number"
                        value={fields[key]}
                        onChange={(e) => handleChange(key, e.target.value)}
                        className="border rounded p-2 w-32 text-right"
                    />
                </div>
            ))}
        </div>
        </GuestLayout>
    );
}
