import GeneralInfoLayout from '@/components/info/GeneralInfoLayout';

export default function DopravaAPlatbaPage() {
    return (
        <GeneralInfoLayout
            title="Doprava a platba"
            breadcrumbs={[{ label: 'Doprava a platba' }]}
        >
            <h2>Způsoby dopravy</h2>
            <p>
                Vaše objednávky se snažíme vyřizovat co nejrychleji. Standardní doba doručení je 2–3 pracovní dny.
            </p>
            <ul>
                <li><strong>Zásilkovna – Výdejní místo:</strong> 79 Kč (Zdarma nad 2 500 Kč)</li>
                <li><strong>PPL – Doručení na adresu:</strong> 119 Kč</li>
                <li><strong>Česká pošta – Balík do ruky:</strong> 129 Kč</li>
            </ul>

            <h2>Způsoby platby</h2>
            <p>
                Nabízíme bezpečné a rychlé platební metody pro vaše pohodlí.
            </p>
            <ul>
                <li><strong>Platební karta (online):</strong> Zdarma</li>
                <li><strong>Bankovní převod:</strong> Zdarma</li>
                <li><strong>Dobírka:</strong> 49 Kč</li>
            </ul>

            <h2>Doprava zdarma</h2>
            <p>
                Při nákupu nad <strong>2 500 Kč</strong> získáte dopravu přes Zásilkovnu zcela zdarma. Tato sleva se automaticky uplatní v košíku.
            </p>
        </GeneralInfoLayout>
    );
}
