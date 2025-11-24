<?php 
namespace App\Http\Controllers;

use App\Services\TwilioReservationService;
use Illuminate\Http\Request;

class TwilioWebhookController extends Controller
{
    public function handle(Request $request, TwilioReservationService $service)
    {
        return $service->processIncomingMessage($request);
    }
}
