import GeneralInfoLayout from '@/components/info/GeneralInfoLayout';

export default function ReklamaceAVraceniPage() {
    return (
        <GeneralInfoLayout
            title="Reklamace a vrácení"
            breadcrumbs={[{ label: 'Reklamace a vrácení' }]}
        >
            <h2>Vrácení zboží do 14 dnů</h2>
            <p>
                Nesedí vám barva nebo jste si nákup rozmysleli? Žádný problém. Zboží můžete vrátit bez udání důvodu do 14 dnů od převzetí zásilky.
            </p>

            <h3>Jak postupovat při vrácení:</h3>
            <ol>
                <li>Zboží zabalte do původního obalu (pokud je to možné).</li>
                <li>Přiložte vyplněný formulář pro odstoupení od smlouvy.</li>
                <li>Zásilku odešlete na naši adresu nebo využijte zpětný kód Zásilkovny.</li>
            </ol>

            <h2>Reklamace</h2>
            <p>
                Na veškeré kožené zboží poskytujeme zákonnou záruku 24 měsíců. Pokud se na produktu objeví vada, kontaktujte nás na <strong>info@lumerashop.cz</strong>.
            </p>

            <h2>Adresa pro vrácení</h2>
            <p>
                MAX & VLD s.r.o.<br />
                Lisabonská 2394<br />
                190 00 Praha 9-Libeň
            </p>
        </GeneralInfoLayout>
    );
}
