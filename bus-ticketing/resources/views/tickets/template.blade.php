<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Billet</title>
  <style>
    body { font-family: Arial, sans-serif; }
    .ticket { border: 2px solid #333; padding: 20px; max-width: 400px; margin: auto; }
    .qr { text-align: center; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="ticket">
    <h1 style="text-align:center;">🎫 Billet de voyage</h1>
    <p><strong>Départ :</strong> {{ $trip->route->departureCity->name ?? 'N/A' }}</p>
    <p><strong>Arrivée :</strong> {{ $trip->route->arrivalCity->name ?? 'N/A' }}</p>
    <p><strong>Bus :</strong> {{ $trip->bus->registration_number ?? 'N/A' }}</p>
    <p><strong>Départ à :</strong> {{ optional($trip->departure_at)->format('H:i') ?? 'N/A' }}</p>
    <p><strong>Arrivée à :</strong> {{ optional($trip->arrival_at)->format('H:i') ?? 'N/A' }}</p>
    <p><strong>Prix :</strong> {{ $trip->route->price ?? 'N/A' }} FCFA</p>
    <p><strong>Paiement :</strong> {{ $payment_method }}</p>
    <div class="qr">
      <img src="{{ $qr_code_path }}" width="150" height="150" alt="QR Code">
    </div>
  </div>
</body>
</html>
