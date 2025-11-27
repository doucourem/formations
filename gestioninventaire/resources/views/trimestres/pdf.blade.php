<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Bilan du trimestre</title>
    <style>
        body { 
            font-family: DejaVu Sans, sans-serif; 
            font-size: 12px; 
            color: #333;
        }
        h2, h3 {
            margin-bottom: 8px;
            color: #1976d2;
        }
        p { margin: 4px 0; }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 20px; 
        }
        th, td { 
            border: 1px solid #ccc; 
            padding: 6px 8px; 
            text-align: left; 
        }
        th { 
            background-color: #1976d2; 
            color: #fff; 
        }
        .text-right { text-align: right; }
        .section {
            padding: 10px;
            margin-bottom: 15px;
            border: 1px solid #ddd;
            border-radius: 4px;
            box-shadow: 1px 1px 3px rgba(0,0,0,0.05);
        }
        .total-row td {
            font-weight: bold;
        }
    </style>
</head>
<body>

    <h2>Bilan du trimestre – {{ $trimestre->boutique->name }}</h2>

    <div class="section">
        <p><strong>Dates :</strong> 
            {{ \Carbon\Carbon::parse($trimestre->start_date)->locale('fr')->isoFormat('LL') }} → 
            {{ \Carbon\Carbon::parse($trimestre->end_date)->locale('fr')->isoFormat('LL') }}
        </p>
        <p><strong>Caisse début :</strong> {{ number_format($trimestre->cash_start, 0, '', '') }} FCFA</p>
        <p><strong>Capital début :</strong> {{ number_format($trimestre->capital_start, 0, '', '') }} FCFA</p>
        <p><strong>Caisse fin :</strong> {{ number_format($trimestre->cash_end, 0, '', '') }} FCFA</p>
        <p><strong>Capital fin :</strong> {{ number_format($trimestre->capital_end, 0, '', '') }} FCFA</p>
        <p><strong>Résultat :</strong> {{ number_format($trimestre->result, 0, '', '') }} FCFA</p>
    </div>

    {{-- Stocks --}}
    <div class="section">
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
                        <td>{{ number_format($s->value_start, 0, '', '') }}</td>
                        <td>{{ number_format($totalDebut, 0, '', '') }}</td>
                        <td>{{ $s->quantity_end }}</td>
                        <td>{{ number_format($s->value_end, 0, '', '') }}</td>
                        <td>{{ number_format($totalFin, 0, '', '') }}</td>
                    </tr>
                @endforeach
                <tr class="total-row">
                    <td colspan="3" class="text-right">Total :</td>
                    <td>{{ number_format($totalStockStart, 0, '', '') }}</td>
                    <td></td>
                    <td></td>
                    <td>{{ number_format($totalStockEnd, 0, '', '') }}</td>
                </tr>
            </tbody>
        </table>
    </div>

    {{-- Dépenses --}}
    <div class="section">
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
                        <td>{{ number_format($d->amount, 0, '', '') }}</td>
                    </tr>
                @endforeach
                <tr class="total-row">
                    <td>Total</td>
                    <td>{{ number_format($totalDepenses, 0, '', '') }}</td>
                </tr>
            </tbody>
        </table>
    </div>

    {{-- Crédits --}}
    <div class="section">
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
                        <td>{{ number_format($c->amount, 0, '', '') }}</td>
                    </tr>
                @endforeach
                <tr class="total-row">
                    <td>Total</td>
                    <td>{{ number_format($totalCredits, 0, '', '') }}</td>
                </tr>
            </tbody>
        </table>
    </div>

</body>
</html>
