<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Billet de voyage</title>
  <style>
    body { font-family: 'Arial', sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
    .ticket-container { max-width: 450px; margin: 30px auto; padding: 20px; background: #fff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-left: 6px solid #007bff; }
    h1 { text-align: center; color: #007bff; margin-bottom: 20px; }
    .section { margin-bottom: 15px; }
    .section strong { display: inline-block; width: 120px; color: #333; }
    .qr { text-align: center; margin-top: 20px; }
    .divider { border-top: 1px dashed #ccc; margin: 15px 0; }
    .highlight { color: #007bff; font-weight: bold; }
  </style>
</head>
<body>
  <div class="ticket-container">
    <h1>🎫 Billet de voyage</h1>

    <div class="section">
      <strong>Client :</strong> <span class="highlight">{{ $ticket->client_name ?? 'N/A' }}</span><br>
      <strong>Siège :</strong> <span class="highlight">{{ $ticket->seat_number ?? 'N/A' }}</span>
    </div>

    <div class="divider"></div>

    <div class="section">
      <strong>Départ :</strong> {{ $trip->route->departureCity->name ?? 'N/A' }}<br>
      <strong>Arrivée :</strong> {{ $trip->route->arrivalCity->name ?? 'N/A' }}<br>
      <strong>Bus :</strong> {{ $trip->bus->registration_number ?? 'N/A' }}<br>
      <strong>Départ à :</strong> {{ optional($trip->departure_at)->format('H:i') ?? 'N/A' }}<br>
      <strong>Arrivée à :</strong> {{ optional($trip->arrival_at)->format('H:i') ?? 'N/A' }}
    </div>

    <div class="divider"></div>

    <div class="section">
      <strong>Prix :</strong> <span class="highlight">{{ number_format($trip->route->price ?? 0, 0, ',', ' ') }} FCFA</span><br>
      <strong>Paiement :</strong> {{ $payment_method ?? 'N/A' }}
    </div>

    <div class="qr">
      <img src="{{ $qr_code_path }}" width="180" height="180" alt="QR Code">
      <p style="font-size:12px; color:#666; margin-top:8px;">Scannez pour vérifier votre billet</p>
    </div>
  </div>
</body>
</html>
