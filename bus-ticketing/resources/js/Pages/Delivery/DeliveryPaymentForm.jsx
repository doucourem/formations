import { useForm } from "@inertiajs/react";

export default function DeliveryPaymentForm({ delivery }) {
    const { data, setData, post, processing, reset } = useForm({
        amount: "",
        method: "cash",
        note: ""
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("deliveries.payments.store", delivery.id), {
            onSuccess: () => reset(),
        });
    };

    return (
        <form onSubmit={submit} className="p-4 border rounded space-y-3">
            <h3 className="font-bold">Ajouter un paiement</h3>

            <input
                type="number"
                placeholder="Montant"
                value={data.amount}
                onChange={e => setData("amount", e.target.value)}
                className="input"
            />

            <select
                value={data.method}
                onChange={e => setData("method", e.target.value)}
                className="input"
            >
                <option value="cash">Cash</option>
                <option value="mobile">Mobile Money</option>
                <option value="bank">Banque</option>
            </select>

            <textarea
                placeholder="Note"
                value={data.note}
                onChange={e => setData("note", e.target.value)}
                className="input"
            />

            <button disabled={processing} className="btn btn-primary">
                Enregistrer paiement
            </button>
        </form>
    );
}