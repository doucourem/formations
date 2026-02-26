<?php
// app/Exports/DailySummaryExport.php
namespace App\Exports;

use App\Models\Parcel;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class DailySummaryExport implements FromCollection, WithHeadings
{
    public function collection()
    {
        $parcels = Parcel::select('created_at', 'amount')->get();

        // Regrouper par date
        $summary = $parcels->groupBy(function($item){
            return $item->created_at->format('d/m/Y');
        });

        $result = collect();
        foreach ($summary as $date => $items) {
            $result->push([
                'date' => $date,
                'nombre_colis' => $items->count(),
                'montant_total' => $items->sum('amount'),
            ]);
        }

        return $result;
    }

    public function headings(): array
    {
        return ['Date', 'Nombre de colis', 'Montant total'];
    }
}