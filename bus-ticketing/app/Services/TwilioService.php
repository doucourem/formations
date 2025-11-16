<?php

namespace App\Services;

use Twilio\Rest\Client;

class TwilioService
{
    protected $client;
    protected $from;

    public function __construct()
    {
        $this->client = new Client(env('TWILIO_SID'), env('TWILIO_AUTH_TOKEN'));
        $this->from = env('TWILIO_PHONE');
    }

    // Envoyer un SMS
    public function sendSms($to, $message)
    {
        return $this->client->messages->create($to, [
            'from' => $this->from,
            'body' => $message,
        ]);
    }

    // Envoyer un message WhatsApp
    public function sendWhatsapp($to, $message)
    {
        return $this->client->messages->create("whatsapp:$to", [
            'from' => "whatsapp:{$this->from}",
            'body' => $message,
        ]);
    }
}
