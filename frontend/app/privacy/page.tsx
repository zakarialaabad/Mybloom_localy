export const dynamic = 'force-dynamic';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy | MyBloom',
  description: 'How we collect, use, and protect your personal information at MyBloom.',
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        {/* Page Header */}
        <div className="bg-[#fcfcfc] border-b border-[#f5eedf] pt-16 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-serif text-[#403531] mb-4">Politique de confidentialité</h1>
            <div className="w-12 h-[2px] bg-[#da2966] mx-auto mb-6"></div>
            <p className="text-[#888] font-serif text-[15px] italic">
              Last updated: April 3, 2026
            </p>
          </div>
        </div>

        {/* Breadcrumbs */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-2 text-[12px] font-serif text-gray-400">
              <Link href="/" className="hover:text-[#da2966] transition-colors">Accueil</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-[#403531]">Politique de confidentialité</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-24">
          <div className="prose prose-sm md:prose-base max-w-none text-[#555] font-serif leading-relaxed">
            
            <p className="mb-10 text-[15px]">
              Bienvenue chez <strong>MyBloom</strong>. Nous respectons votre confidentialité et nous nous engageons à protéger vos données personnelles. 
              Cette politique de confidentialité vous informera sur la manière dont nous gérons vos données personnelles lorsque vous visitez notre site web 
              (quel que soit l'endroit d'où vous le visitez) et vous informera sur vos droits à la vie privée et la manière dont la loi vous protège.
            </p>

            <h2 className="text-2xl text-[#403531] mb-6 mt-12 font-bold tracking-wide">1. Informations que nous collectons</h2>
            <p className="mb-6 text-[15px]">
              Lorsque vous achetez quelque chose dans notre magasin, dans le cadre du processus d'achat et de vente, nous collectons les informations personnelles que vous nous fournissez, telles que votre nom, votre adresse, votre numéro de téléphone et votre adresse e-mail. Nous recevons également automatiquement l'adresse de protocole Internet (IP) de votre ordinateur pour nous fournir des informations qui nous aident à en savoir plus sur votre navigateur et votre système d'exploitation.
            </p>
            <ul className="list-disc pl-5 mb-8 space-y-3 marker:text-[#da2966]">
              <li><strong>Données d'identité :</strong> inclut le prénom, le nom de famille, le nom d'utilisateur ou un identifiant similaire.</li>
              <li><strong>Données de contact :</strong> inclut l'adresse de facturation, l'adresse de livraison, l'adresse e-mail et les numéros de téléphone.</li>
              <li><strong>Données financières :</strong> détails sur les paiements à vous et à partir de vous via nos partenaires de paiement sécurisés.</li>
              <li><strong>Données de transaction :</strong> détails sur les produits et services que vous avez achetés auprès de nous.</li>
            </ul>

            <h2 className="text-2xl text-[#403531] mb-6 mt-12 font-bold tracking-wide">2. Comment nous utilisons vos données</h2>
            <p className="mb-6 text-[15px]">
              Nous n'utiliserons vos données personnelles que lorsque la loi nous y autorise. Le plus souvent, nous utiliserons vos données personnelles dans les circonstances suivantes :
            </p>
            <ul className="list-disc pl-5 mb-8 space-y-3 marker:text-[#da2966]">
              <li>Lorsque nous avons besoin d'exécuter le contrat que nous sommes sur le point de conclure ou avons conclu avec vous (par exemple, exécuter une commande).</li>
              <li>Lorsqu'il est nécessaire pour nos intérêts légitimes (ou ceux d'un tiers) et que vos intérêts et droits fondamentaux ne dépassent pas ces intérêts.</li>
              <li>Lorsque nous avons besoin de respecter une obligation légale ou réglementaire.</li>
            </ul>

            <h2 className="text-2xl text-[#403531] mb-6 mt-12 font-bold tracking-wide">3. Divulgation de vos données</h2>
            <p className="mb-8 text-[15px]">
              Nous pouvons partager vos données personnelles avec des tiers tels que les fournisseurs de services (par exemple, les entreprises de livraison, les passerelles de paiement). 
              Nous exigeons que tous les tiers respectent la sécurité de vos données personnelles et les traitent conformément à la loi. 
              Nous ne permettons pas à nos fournisseurs de services tiers d'utiliser vos données personnelles à leurs propres fins et nous ne les autorisons qu'à traiter vos données personnelles à des fins spécifiées et conformément à nos instructions.
            </p>

            <h2 className="text-2xl text-[#403531] mb-6 mt-12 font-bold tracking-wide">4. Sécurité des données</h2>
            <p className="mb-8 text-[15px]">
              Nous avons mis en place les mesures de sécurité appropriées pour empêcher vos données personnelles d'être accidentellement perdues, utilisées, 
              ou consultées de manière non autorisée, modifiées ou divulguées. De plus, nous limitons l'accès à vos données personnelles aux 
              employés, agents, entrepreneurs et autres tiers qui ont besoin d'y accéder pour des raisons professionnelles.
            </p>

            <h2 className="text-2xl text-[#403531] mb-6 mt-12 font-bold tracking-wide">5. Vos droits légaux</h2>
            <p className="mb-6 text-[15px]">
              Dans certaines circonstances, vous avez des droits en vertu des lois sur la protection des données concernant vos données personnelles, y compris le droit de :
            </p>
            <ul className="list-disc pl-5 mb-8 space-y-3 marker:text-[#da2966]">
              <li>Demander l'accès à vos données personnelles.</li>
              <li>Demander la correction de vos données personnelles.</li>
              <li>Demander la suppression de vos données personnelles.</li>
              <li>Vous opposer au traitement de vos données personnelles.</li>
            </ul>

            <div className="bg-[#fcfcfc] border border-[#f5eedf] rounded-[5px] p-6 sm:p-8 mt-12 sm:mt-16 text-center">
              <h3 className="text-xl text-[#403531] mb-3 font-semibold">Des questions sur votre confidentialité ?</h3>
              <p className="text-[14px] text-[#888] mb-0">
                Si vous avez des questions sur cette politique de confidentialité, veuillez contacter notre équipe d'assistance à {' '}
                <a href="mailto:privacy@mybloom.ma" className="text-[#da2966] hover:underline font-bold">privacy@mybloom.ma</a>
              </p>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
