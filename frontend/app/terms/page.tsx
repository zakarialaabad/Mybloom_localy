import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export const metadata = {
  title: 'Terms & Conditions | MyBloom',
  description: 'Terms and conditions for purchasing from MyBloom store.',
};

export default function TermsConditionsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#fff9f9]">
        {/* Page Header */}
        <div className="bg-[#fff9f9] border-b border-[#f5eedf] pt-16 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-serif text-[#403531] mb-4">Conditions générales</h1>
            <div className="w-12 h-[2px] bg-[#da2966] mx-auto mb-6"></div>
            <p className="text-[#888] font-serif text-[15px] italic">
              Effective from: April 3, 2026
            </p>
          </div>
        </div>

        {/* Breadcrumbs */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-2 text-[12px] font-serif text-gray-400">
              <Link href="/" className="hover:text-[#da2966] transition-colors">Accueil</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-[#403531]">Conditions générales</span>
            </div>
          </div>
        </div>

        {/* Content Container */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-24">
          <div className="bg-white border border-[#f5eedf] rounded-[8px] p-5 sm:p-8 md:p-12 shadow-sm font-serif text-[#555] leading-relaxed relative">
            
            {/* Background absolute subtle pattern placeholder (optional) */}
            <div className="absolute top-0 right-0 opacity-5 pointer-events-none p-4">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="#403531"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            </div>

            <p className="mb-10 text-[15px] first-letter:text-[40px] first-letter:font-bold first-letter:text-[#da2966] first-letter:mr-1 first-letter:float-left">
              Ces conditions d'utilisation énoncent les règles et réglementations d'utilisation du site Web de MyBloom, 
              situé à <strong>www.mybloom.ma</strong>. En accédant à ce site Web, nous supposons que vous acceptez ces 
              conditions d'utilisation. N'utilisez pas MyBloom si vous n'acceptez pas toutes les conditions 
              et conditions énoncées sur cette page.
            </p>

            <h2 className="text-2xl text-[#4a403a] mb-6 mt-12 font-bold tracking-wide border-l-4 border-[#da2966] pl-4">
              1. Définitions
            </h2>
            <p className="mb-6 text-[15px]">
              « Client », « Vous » et « Votre » se réfèrent à vous, la personne connectée à ce site Web et 
              conforme aux conditions d'utilisation de l'entreprise. « L'entreprise », « Nous-mêmes », 
              « Nous », « Notre » et « Nous », se réfère à notre entreprise. « Partie », 
              « Parties », ou « Nous », se réfère à la fois au client et à nous.
            </p>

            <h2 className="text-2xl text-[#4a403a] mb-6 mt-12 font-bold tracking-wide border-l-4 border-[#da2966] pl-4">
              2. Produits et achats
            </h2>
            <p className="mb-6 text-[15px]">
              Nos parfums de luxe, brumes corporelles et beurres corporels sont fabriqués aux normes les plus élevées. Cependant, l'emballage, les dimensions, 
              et les couleurs peuvent varier légèrement par rapport aux images affichées en ligne. 
              En complétant une commande, vous acceptez :
            </p>
            <ul className="list-inside mb-8 space-y-3">
              <li className="flex items-start gap-2">
                <span className="text-[#da2966] mt-1 font-bold">»</span> 
                Fournir des informations d'expédition, de facturation et de contact exactes.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#da2966] mt-1 font-bold">»</span> 
                Confirmer que le mode de paiement que vous utilisez vous appartient légalement.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#da2966] mt-1 font-bold">»</span> 
                Ne pas utiliser nos produits pour la revente ou la distribution commerciale sans autorisation écrite explicite.
              </li>
            </ul>

            <h2 className="text-2xl text-[#4a403a] mb-6 mt-12 font-bold tracking-wide border-l-4 border-[#da2966] pl-4">
              3. Prix et disponibilité
            </h2>
            <p className="mb-8 text-[15px]">
              Les prix de nos produits sont sujets à changement sans préavis. Nous nous réservons le droit, à tout moment, de modifier ou de 
              suspendre le service (ou toute partie ou contenu de celui-ci) sans préavis. Nous ne serons pas responsables 
              envers vous ou envers toute partie tierce pour toute modification, changement de prix, suspension ou discontinuation de nos parfums.
            </p>

            <h2 className="text-2xl text-[#4a403a] mb-6 mt-12 font-bold tracking-wide border-l-4 border-[#da2966] pl-4">
              4. Expédition, annulation et retours
            </h2>
            <p className="mb-6 text-[15px]">
              Veuillez vous reporter à notre politique d'expédition pour les détails sur les délais et les coûts de livraison. Les commandes peuvent uniquement être annulées 
              avant qu'elles ne soient passées au statut « En cours de traitement » ou « Expédiées ». En raison de la nature délicate 
              des cosmétiques de luxe, nous n'acceptons les retours que pour les articles qui arrivent endommagés ou sensiblement non conformes à la description 
              dans les 7 jours suivant la livraison.
            </p>

            <h2 className="text-2xl text-[#4a403a] mb-6 mt-12 font-bold tracking-wide border-l-4 border-[#da2966] pl-4">
              5. Propriété intellectuelle
            </h2>
            <p className="mb-8 text-[15px]">
              Sauf indication contraire, MyBloom et/ou ses concédants sont propriétaires des droits de propriété intellectuelle pour tous les matériaux sur 
              le site Web. Tous les droits de propriété intellectuelle sont réservés. Vous pouvez accéder à ceci de MyBloom pour votre utilisation personnelle 
              selon les restrictions énoncées dans ces conditions d'utilisation.
            </p>

            <div className="mt-16 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center bg-[#fdfcfb] px-6 py-4 rounded-[4px]">
              <p className="text-[13px] text-[#888] font-sans md:mb-0 mb-4 text-center md:text-left">
                Avez-vous d'autres questions ou avez-vous besoin d'aide ?
              </p>
              <Link 
                href="/contact" 
                className="bg-[#403531] text-white px-5 py-2.5 rounded-[3px] text-[13px] font-sans hover:bg-[#2d2522] transition-colors"
              >
                Contacter l'équipe juridique
              </Link>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
