<h2>REÇU DE PAIEMENT LOCATION</h2>

<p>Location #{{ $payment->rental->id }}</p>
<p>Client : {{ $payment->rental->client_name }}</p>

<p>Montant : <strong>{{ number_format($payment->amount,0,',',' ') }} CFA</strong></p>
<p>Méthode : {{ $payment->method ?? '—' }}</p>
<p>Date : {{ $payment->created_at->format('d/m/Y H:i') }}</p>

<hr>

<p>Véhicule : {{ $payment->rental->bus->registration_number ?? '' }}</p>
<p>Chauffeur : {{ $payment->rental->driver->first_name ?? '' }}</p>
<p>Départ : {{ $payment->rental->departure_location }}</p>
<p>Arrivée : {{ $payment->rental->arrival_location }}</p>

<br><br>
<p>Signature & Cachet</p>
<div style="height:80px;border:1px solid #000;width:200px"></div>