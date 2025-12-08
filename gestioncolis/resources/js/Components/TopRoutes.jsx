import React from 'react';
import { MapPin, TrendingUp, Ticket } from 'lucide-react';

export default function TopRoutes({ routes }) {

    if (!routes || routes.length === 0) {
        return (
            <div className="text-center text-gray-500 py-6">
                Aucune donnée disponible.
            </div>
        );
    }

    return (
        <div className="space-y-4">

            {routes.map((r, index) => (
                <div
                    key={index}
                    className="p-4 bg-gray-50 border rounded-lg flex items-center justify-between hover:bg-gray-100 transition"
                >
                    {/* Left part */}
                    <div className="flex items-center space-x-4">

                        {/* Rank bubble */}
                        <div className="w-10 h-10 flex items-center justify-center rounded-full
                            font-bold text-white
                            bg-gradient-to-br from-blue-500 to-blue-700">
                            {index + 1}
                        </div>

                        {/* Icon + route name */}
                        <div>
                            <div className="flex items-center font-semibold text-lg">
                                <MapPin className="w-5 h-5 text-red-600 mr-2" />
                                {r.route}
                            </div>

                            <div className="text-sm text-gray-600 flex items-center">
                                <Ticket className="w-4 h-4 text-gray-500 mr-1" />
                                {r.parcels_count} colis 
                            </div>
                        </div>
                    </div>

                    {/* Right part: revenue */}
                    <div className="text-right">
                        <div className="flex items-center justify-end">
                            <TrendingUp className="w-5 h-5 text-green-600 mr-1" />
                            <span className="font-bold text-green-700">
                                {r.revenue.toLocaleString()} FCFA
                            </span>
                        </div>
                        <div className="text-xs text-gray-500">Revenu total</div>
                    </div>
                </div>
            ))}

        </div>
    );
}
