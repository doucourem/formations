<?php

namespace App\Exports;

use App\Models\Ticket;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class TicketsExport implements FromCollection, WithHeadings
{
    protected $query;

    public function __construct($query)
    {
        $this->query = $query;
    }

    public function collection()
    {
        return $this->query->get()->map(function ($ticket) {
            $route = $ticket->trip?->route;
            return [
                'ID' => $ticket->id,
                'Client' => $ticket->client_name,
                'Status' => $ticket->status,
                'Seat' => $ticket->seat_number,
                'Price' => $ticket->price,
                'Route' => $route && $route->departureCity && $route->arrivalCity
                    ? $route->departureCity->name . ' → ' . $route->arrivalCity->name
                    : null,
            ];
        });
    }

    public function headings(): array
    {
        return [
            'ID',
            'Client',
            'Status',
            'Seat',
            'Price',
            'Route',
        ];
    }
}
