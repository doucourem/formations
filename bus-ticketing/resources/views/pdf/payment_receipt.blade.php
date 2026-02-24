<h2>REÇU DE PAIEMENT</h2>

<p>Livraison #{{ $payment->delivery->id }}</p>
<p>Client : {{ $payment->delivery->client_name }}</p>

<p>Montant : <strong>{{ number_format($payment->amount,0,',',' ') }} CFA</strong></p>
<p>Méthode : {{ $payment->method ?? '—' }}</p>
<p>Date : {{ $payment->created_at->format('d/m/Y H:i') }}</p>

<hr>

<p>Produit : {{ $payment->delivery->product_name }}</p>
<p>Chauffeur : {{ $payment->delivery->driver->first_name ?? '' }}</p>
<p>Véhicule : {{ $payment->delivery->bus->registration_number ?? '' }}</p>

<br><br>
<p>Signature & Cachet</p>
<div style="height:80px;border:1px solid #000;width:200px"></div>