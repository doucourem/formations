<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Bilan du trimestre</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #000; padding: 5px; text-align: left; }
        th { background-color: #1976d2; color: #fff; }
        .text-right { text-align: right; }
        h2, h3 { margin-bottom: 5px; }
    </style>
</head>
<body>
    <h2>Bilan du trimestre – {{ $trimestre->boutique->name }}</h2>
    <p><strong>Dates :</strong> 
        {{ \Carbon\Carbon::parse($trimestre->start_date)->locale('fr')->isoFormat('LL') }} → 
        {{ \Carbon\Carbon::parse($trimestre->end_date)->locale('fr')->isoFormat('LL') }}
    </p>
    <p><strong>Caisse début :</strong> {{ number_format($trimestre->cash_start) }} FCFA</p>
    <p><strong>Capital début :</strong> {{ number_format($trimestre->capital_start) }} FCFA</p>
    <p><strong>Caisse fin :</strong> {{ number_format($trimestre->cash_end) }} FCFA</p>
    <p><strong>Capital fin :</strong> {{ number_format($trimestre->capital_end) }} FCFA</p>
    <p><strong>Résultat :</strong> {{ number_format($trimestre->result) }} FCFA</p>

    {{-- Stocks --}}
    <h3>Stocks</h3>
    <table>
        <thead>
            <tr>
                <th>Produit</th>
                <th>Qté début</th>
                <th>Valeur début</th>
                <th>Total début</th>
                <th>Qté fin</th>
                <th>Valeur fin</th>
                <th>Total fin</th>
            </tr>
        </thead>
        <tbody>
            @php
                $totalStockStart = 0;
                $totalStockEnd = 0;
            @endphp
            @foreach($trimestre->stocks as $s)
                @php
                    $totalDebut = $s->quantity_start * $s->value_start;
                    $totalFin = $s->quantity_end * $s->value_end;
                    $totalStockStart += $totalDebut;
                    $totalStockEnd += $totalFin;
                @endphp
                <tr>
                    <td>{{ $s->produit->name }}</td>
                    <td>{{ $s->quantity_start }}</td>
                    <td>{{ number_format($s->value_start) }}</td>
                    <td>{{ number_format($totalDebut) }}</td>
                    <td>{{ $s->quantity_end }}</td>
                    <td>{{ number_format($s->value_end) }}</td>
                    <td>{{ number_format($totalFin) }}</td>
                </tr>
            @endforeach
            <tr>
                <td colspan="3" class="text-right"><strong>Total :</strong></td>
                <td><strong>{{ number_format($totalStockStart) }}</strong></td>
                <td></td>
                <td></td>
                <td><strong>{{ number_format($totalStockEnd) }}</strong></td>
            </tr>
        </tbody>
    </table>

    {{-- Dépenses --}}
    <h3>Dépenses</h3>
    <table>
        <thead>
            <tr>
                <th>Description</th>
                <th>Montant</th>
            </tr>
        </thead>
        <tbody>
            @php $totalDepenses = 0; @endphp
            @foreach($trimestre->depenses as $d)
                @php $totalDepenses += $d->amount; @endphp
                <tr>
                    <td>{{ $d->description }}</td>
                    <td>{{ number_format($d->amount) }}</td>
                </tr>
            @endforeach
            <tr>
                <td><strong>Total</strong></td>
                <td><strong>{{ number_format($totalDepenses) }}</strong></td>
            </tr>
        </tbody>
    </table>

    {{-- Crédits --}}
    <h3>Crédits</h3>
    <table>
        <thead>
            <tr>
                <th>Description</th>
                <th>Montant</th>
            </tr>
        </thead>
        <tbody>
            @php $totalCredits = 0; @endphp
            @foreach($trimestre->credits as $c)
                @php $totalCredits += $c->amount; @endphp
                <tr>
                    <td>{{ $c->description }}</td>
                    <td>{{ number_format($c->amount) }}</td>
                </tr>
            @endforeach
            <tr>
                <td><strong>Total</strong></td>
                <td><strong>{{ number_format($totalCredits) }}</strong></td>
            </tr>
        </tbody>
    </table>
</body>
</html>
