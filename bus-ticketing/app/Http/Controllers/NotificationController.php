<?php

namespace App\Http\Controllers;

use App\Services\TwilioService;

class NotificationController extends Controller
{
    protected $twilio;

    public function __construct(TwilioService $twilio)
    {
        $this->twilio = $twilio;
    }

    public function sendSms()
    {
        $to = '+223XXXXXXXX'; // numéro du destinataire
        $message = 'Bonjour depuis Laravel + Twilio !';

        $this->twilio->sendSms($to, $message);

        return 'SMS envoyé avec succès !';
    }

    public function sendWhatsapp()
    {
        $to = '+223XXXXXXXX'; // numéro du destinataire
        $message = 'Message WhatsApp depuis Laravel + Twilio !';

        $this->twilio->sendWhatsapp($to, $message);

        return 'WhatsApp envoyé avec succès !';
    }
}
