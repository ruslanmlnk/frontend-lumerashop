'use client';

interface MultiSelectFilterProps {
    title: string;
    options: string[];
    selected: string[];
    onToggle: (value: string) => void;
    hideTitle?: boolean;
}

const MultiSelectFilter = ({ title, options, selected, onToggle, hideTitle = false }: MultiSelectFilterProps) => {
    if (options.length === 0) {
        return null;
    }

    return (
        <div className="w-full">
            {!hideTitle ? (
                <h3
                    className="mb-[10px] text-[18px] font-bold leading-[21.6px] text-[#111111]"
                    style={{ fontFamily: '"Cormorant Garamond", serif' }}
                >
                    {title}
                </h3>
            ) : null}

            <div className="space-y-[2px]">
                {options.map((option) => {
                    const isSelected = selected.includes(option);

                    return (
                        <label key={option} className="flex w-full cursor-pointer items-center gap-[8.75px] py-[2px] text-left">
                            <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => onToggle(option)}
                                className="sr-only"
                            />

                            <span
                                className={`relative h-[14px] w-[14px] rounded-[2px] ${
                                    isSelected ? 'bg-[#111111]/20' : 'bg-[#111111]/10'
                                }`}
                            >
                                {isSelected && (
                                    <svg
                                        className="absolute inset-0"
                                        width="14"
                                        height="14"
                                        viewBox="0 0 14 14"
                                        fill="none"
                                        aria-hidden="true"
                                    >
                                        <path
                                            d="M12.95 3.08 5.25 10.78 1.4 6.93"
                                            stroke="#111111"
                                            strokeWidth="2.1"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                )}
                            </span>

                            <span className="text-[12.3px] leading-[24.5px] text-[#111111]">{option}</span>
                        </label>
                    );
                })}
            </div>
        </div>
    );
};

export default MultiSelectFilter;
