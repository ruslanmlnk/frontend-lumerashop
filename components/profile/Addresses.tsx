'use client';

const Addresses = () => {
    return (
        <div className="space-y-8">
            <p className="text-[15px] text-gray-600 leading-relaxed">
                Následující adresy budou použity na stránce pokladny pro výchozí nastavení.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Billing Address */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                        <h3 className="text-[24px] font-normal">Fakturační adresa</h3>
                        <button className="text-[#E1B12C] text-[14px] font-medium hover:underline">Upravit</button>
                    </div>
                    <div className="text-[15px] text-gray-500 italic">
                        Dosud jste nenastavili tento typ adresy.
                    </div>
                </div>

                {/* Shipping Address */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                        <h3 className="text-[24px] font-normal">Doručovací adresa</h3>
                        <button className="text-[#E1B12C] text-[14px] font-medium hover:underline">Upravit</button>
                    </div>
                    <div className="text-[15px] text-gray-500 italic">
                        Dosud jste nenastavili tento typ adresy.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Addresses;
