<h2>FACTURE LIVRAISON</h2>

<p>Client : {{ $delivery->client_name }}</p>
<p>Produit : {{ $delivery->product_name }}</p>
<p>Prix : {{ number_format($delivery->price,0,',',' ') }} CFA</p>

<hr>

<h4>Paiements</h4>
<ul>
@foreach($delivery->payments as $p)
<li>{{ number_format($p->amount,0,',',' ') }} CFA — {{ $p->created_at->format('d/m/Y') }}</li>
@endforeach
</ul>

<p><strong>Total payé :</strong> {{ number_format($delivery->payments->sum('amount'),0,',',' ') }} CFA</p>
<p><strong>Reste :</strong> {{ number_format($delivery->price - $delivery->payments->sum('amount'),0,',',' ') }} CFA</p>