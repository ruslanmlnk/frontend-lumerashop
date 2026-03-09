'use client';

interface ProductSortProps {
    value: string;
    onChange: (value: string) => void;
    totalResults: number;
}

const ProductSort = ({ value, onChange, totalResults }: ProductSortProps) => {
    return (
        <div className="mb-10 flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-[15px] text-gray-500 font-sans">
                {"Zobrazeno "}
                <span className="font-semibold text-black">{totalResults}</span>
                {" výsledků"}
            </p>

            <div className="flex items-center gap-3">
                <label className="hidden text-[14px] text-gray-500 md:block">{"Seřadit podle:"}</label>
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="cursor-pointer appearance-none border border-gray-200 bg-white px-6 py-3 pr-12 text-[14px] font-medium outline-none transition-colors focus:border-black"
                    style={{
                        backgroundImage:
                            'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'currentColor\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 15px center',
                        backgroundSize: '16px',
                    }}
                >
                    <option value="popularity">{"Seřadit podle oblíbenosti"}</option>
                    <option value="rating">{"Seřadit podle hodnocení"}</option>
                    <option value="newest">{"Seřadit od nejnovějších"}</option>
                    <option value="price-low">{"Cena: od nejnižší"}</option>
                    <option value="price-high">{"Cena: od nejvyšší"}</option>
                </select>
            </div>
        </div>
    );
};

export default ProductSort;
