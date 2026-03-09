import GeneralInfoLayout from '@/components/info/GeneralInfoLayout';

export default function OchranaUdajuPage() {
    return (
        <GeneralInfoLayout
            title="Ochrana osobních údajů"
            breadcrumbs={[{ label: 'Ochrana osobních údajů' }]}
        >
            <h2>Zpracování osobních údajů</h2>
            <p>
                Ochrana vašich osobních údajů je pro nás prioritou. Zpracováváme údaje nezbytné pro vyřízení vaší objednávky a pro komunikaci s vámi.
            </p>

            <h2>Jaké údaje zpracováváme?</h2>
            <ul>
                <li>Jméno a příjmení</li>
                <li>Doručovací a fakturační adresa</li>
                <li>E-mailová adresa</li>
                <li>Telefonní číslo</li>
            </ul>

            <h2>Účel zpracování</h2>
            <p>
                Údaje využíváme výhradně pro plnění kupní smlouvy, vedení uživatelského účtu a informování o stavu objednávky. Pokud jste nám udělili souhlas, můžeme vám zasílat také novinky z našeho blogu.
            </p>

            <h2>Vaše práva</h2>
            <p>
                Máte právo na přístup k vašim údajům, jejich opravu, výmaz nebo omezení zpracování. Své požadavky směřujte na <strong>info@lumerashop.cz</strong>.
            </p>
        </GeneralInfoLayout>
    );
}
