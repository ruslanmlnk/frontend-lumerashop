'use client';
import Link from 'next/link';

const Downloads = () => {
    return (
        <div className="space-y-6">
            <div className="bg-blue-50 border-t-4 border-blue-400 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center bg-blue-100 rounded-full">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="Value 13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <span className="text-[15px] text-blue-700">Doposud nic ke stažení.</span>
                </div>
                <Link
                    href="/shop"
                    className="bg-[#E1B12C] text-white px-6 py-2.5 font-bold text-[13px] hover:bg-[#c79a24] transition-colors rounded-sm"
                >
                    PŘEJÍT DO OBCHODU
                </Link>
            </div>
        </div>
    );
};

export default Downloads;
