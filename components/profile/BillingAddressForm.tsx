'use client';

const BillingAddressForm = () => {
    return (
        <div className="max-w-[700px]">
            <h2 className="text-[24px] font-normal mb-8 border-b border-gray-100 pb-2">Fakturační adresa</h2>
            <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-[14px] mb-2 font-medium">Křestní jméno <span className="text-red-500">*</span></label>
                        <input type="text" className="w-full bg-white border border-gray-200 h-[50px] px-4 focus:outline-none focus:border-gray-500 rounded-sm" required />
                    </div>
                    <div>
                        <label className="block text-[14px] mb-2 font-medium">Příjmení <span className="text-red-500">*</span></label>
                        <input type="text" className="w-full bg-white border border-gray-200 h-[50px] px-4 focus:outline-none focus:border-gray-500 rounded-sm" required />
                    </div>
                </div>

                <div>
                    <label className="block text-[14px] mb-2 font-medium">Země / Region <span className="text-red-500">*</span></label>
                    <select className="w-full bg-white border border-gray-200 h-[50px] px-4 focus:outline-none focus:border-gray-500 rounded-sm">
                        <option value="CZ">Česká republika</option>
                        <option value="SK">Slovensko</option>
                    </select>
                </div>

                <div>
                    <label className="block text-[14px] mb-2 font-medium">Ulice a č.p. <span className="text-red-500">*</span></label>
                    <input type="text" placeholder="Číslo domu a název ulice" className="w-full bg-white border border-gray-200 h-[50px] px-4 focus:outline-none focus:border-gray-500 rounded-sm mb-4" required />
                    <input type="text" placeholder="Apartmán, jednotka, atd. (volitelné)" className="w-full bg-white border border-gray-200 h-[50px] px-4 focus:outline-none focus:border-gray-500 rounded-sm" />
                </div>

                <div>
                    <label className="block text-[14px] mb-2 font-medium">Město <span className="text-red-500">*</span></label>
                    <input type="text" className="w-full bg-white border border-gray-200 h-[50px] px-4 focus:outline-none focus:border-gray-500 rounded-sm" required />
                </div>

                <div>
                    <label className="block text-[14px] mb-2 font-medium">PSČ <span className="text-red-500">*</span></label>
                    <input type="text" className="w-full bg-white border border-gray-200 h-[50px] px-4 focus:outline-none focus:border-gray-500 rounded-sm" required />
                </div>

                <div>
                    <label className="block text-[14px] mb-2 font-medium">Telefon <span className="text-red-500">*</span></label>
                    <input type="tel" className="w-full bg-white border border-gray-200 h-[50px] px-4 focus:outline-none focus:border-gray-500 rounded-sm" required />
                </div>

                <div>
                    <label className="block text-[14px] mb-2 font-medium">E-mailová adresa <span className="text-red-500">*</span></label>
                    <input type="email" className="w-full bg-white border border-gray-200 h-[50px] px-4 focus:outline-none focus:border-gray-500 rounded-sm" required />
                </div>

                <button
                    type="submit"
                    className="bg-[#E1B12C] text-white px-8 h-[50px] font-bold text-[14px] hover:bg-[#c79a24] transition-colors rounded-sm uppercase tracking-wider"
                >
                    Uložit adresu
                </button>
            </form>
        </div>
    );
};

export default BillingAddressForm;
