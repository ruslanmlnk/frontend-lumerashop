'use client';

const stats = [
    {
        title: 'Originální modely',
        description: 'Přímo od italských výrobců — pečlivě vybrané pro vás.'
    },
    {
        title: 'Prémiová kvalita',
        description: 'Pouze pravá kůže a precizní zpracování — rozdíl je vidět i cítit.'
    },
    {
        title: 'Exkluzivita',
        description: 'Kousky, které jinde nenajdete, nyní dostupné online.'
    },
    {
        title: 'Osobní přístup',
        description: 'Malý tým, velká vášeň pro krásu a design.'
    }
];

const AboutStats = () => {
    return (
        <section className="py-24 bg-[#f9f9f9]">
            <div className="max-w-[1140px] mx-auto px-4 lg:px-0">
                <h2
                    className="text-[42px] font-serif font-bold text-[#111111] mb-16 text-center"
                    style={{ fontFamily: '"Cormorant Garamond", serif' }}
                >
                    Proč právě Lumera
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {stats.map((stat, index) => (
                        <div key={index} className="flex flex-col items-center text-center group">
                            <div className="w-12 h-[2px] bg-black mb-8 group-hover:w-20 transition-all duration-500" />
                            <h3 className="text-[18px] font-bold text-[#111111] mb-4 uppercase tracking-wider">
                                {stat.title}
                            </h3>
                            <p className="text-[15px] text-gray-500 leading-relaxed font-light">
                                {stat.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default AboutStats;
