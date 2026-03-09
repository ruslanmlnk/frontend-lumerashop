import GeneralInfoLayout from '@/components/info/GeneralInfoLayout';

export default function ObchodniPodminkyPage() {
    return (
        <GeneralInfoLayout
            title="Obchodní podmínky"
            breadcrumbs={[{ label: 'Obchodní podmínky' }]}
        >
            <h2>I. Úvodní ustanovení</h2>
            <p>
                Tyto obchodní podmínky platí pro nákup v internetovém obchodě LumeraShop.cz, provozovaném společností MAX & VLD s.r.o., IČO: 23254246.
            </p>

            <h2>II. Uživatelský účet</h2>
            <p>
                Na základě registrace kupujícího provedené na webové stránce může kupující přistupovat do svého uživatelského rozhraní. Z uživatelského rozhraní může kupující provádět objednávání zboží.
            </p>

            <h2>III. Uzavření kupní smlouvy</h2>
            <p>
                Veškerá prezentace zboží umístěná ve webovém rozhraní obchodu je informativního charakteru a prodávající není povinen uzavřít kupní smlouvu ohledně tohoto zboží.
            </p>

            <h2>IV. Cena zboží a platební podmínky</h2>
            <p>
                Cenu zboží a případné náklady spojené s dodáním zboží dle kupní smlouvy může kupující uhradit prodávajícímu způsoby uvedenými na podstránce Doprava a platba.
            </p>

            <p className="italic text-[14px]">
                Kompletní znění obchodních podmínek je k dispozici v sídle společnosti.
            </p>
        </GeneralInfoLayout>
    );
}
