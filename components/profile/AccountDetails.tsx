'use client';

const AccountDetails = () => {
    return (
        <div className="max-w-[700px]">
            <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-[14px] mb-2 font-medium">Křestní jméno <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            className="w-full bg-white border border-gray-200 h-[50px] px-4 focus:outline-none focus:border-gray-500 rounded-sm"
                            defaultValue="Ruslan"
                        />
                    </div>
                    <div>
                        <label className="block text-[14px] mb-2 font-medium">Příjmení <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            className="w-full bg-white border border-gray-200 h-[50px] px-4 focus:outline-none focus:border-gray-500 rounded-sm"
                            defaultValue=""
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-[14px] mb-2 font-medium">Zobrazované jméno <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        className="w-full bg-white border border-gray-200 h-[50px] px-4 focus:outline-none focus:border-gray-500 rounded-sm"
                        defaultValue="Ruslan"
                    />
                    <p className="mt-1 text-[13px] text-gray-500 italic">Toto jméno bude zobrazeno v uživatelském účtu a u recenzí.</p>
                </div>

                <div>
                    <label className="block text-[14px] mb-2 font-medium">E-mailová adresa <span className="text-red-500">*</span></label>
                    <input
                        type="email"
                        className="w-full bg-white border border-gray-200 h-[50px] px-4 focus:outline-none focus:border-gray-500 rounded-sm"
                        defaultValue="ruslan.mlnk@gmail.com" // Placeholder or from user data
                    />
                </div>

                <fieldset className="border border-gray-100 p-6 rounded-sm space-y-6">
                    <legend className="px-2 text-[18px] font-medium">Změna hesla</legend>

                    <div>
                        <label className="block text-[14px] mb-2 font-medium">Současné heslo (ponechte prázdné, pokud jej nechcete měnit)</label>
                        <input
                            type="password"
                            className="w-full bg-white border border-gray-200 h-[50px] px-4 focus:outline-none focus:border-gray-500 rounded-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-[14px] mb-2 font-medium">Nové heslo (ponechte prázdné, pokud jej nechcete měnit)</label>
                        <input
                            type="password"
                            className="w-full bg-white border border-gray-200 h-[50px] px-4 focus:outline-none focus:border-gray-500 rounded-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-[14px] mb-2 font-medium">Potvrdit nové heslo</label>
                        <input
                            type="password"
                            className="w-full bg-white border border-gray-200 h-[50px] px-4 focus:outline-none focus:border-gray-500 rounded-sm"
                        />
                    </div>
                </fieldset>

                <button
                    type="submit"
                    className="bg-[#E1B12C] text-white px-8 h-[50px] font-bold text-[14px] hover:bg-[#c79a24] transition-colors rounded-sm uppercase tracking-wider"
                >
                    Uložit změny
                </button>
            </form>
        </div>
    );
};

export default AccountDetails;
