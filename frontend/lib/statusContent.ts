'use client';

export type StatusKey =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'shipped'
  | 'dispatched'
  | 'delivered'
  | 'cancelled';

export const statusContent: Record<StatusKey, { title: string; subtitle: string }> = {
  pending: {
    title: 'Commande reçue',
    subtitle: 'Nous avons bien reçu votre commande et elle est en attente de validation. Notre équipe la vérifie et vous serez informé des prochaines étapes.',
  },
  confirmed: {
    title: 'Commande validée',
    subtitle:
      "Votre commande a été reçue avec succès et vérifiée avec soin par notre équipe. Nous préparons maintenant vos parfums et produits de beauté sélectionnés avec la plus grande attention aux détails, en assurant l'authenticité, le contrôle de qualité et un traitement sécurisé avant de passer à l'étape suivante.",
  },
  preparing: {
    title: 'Préparation de votre colis',
    subtitle:
      "Vos articles sont actuellement soigneusement sélectionnés, inspectés et élégamment emballés afin de garantir qu’ils arrivent en parfait état. Chaque produit est manipulé avec attention pour préserver sa qualité, sa fraîcheur et sa présentation avant d’être confié à notre partenaire de livraison.",
  },
  shipped: {
    title: 'En cours de livraison',
    subtitle:
      "Excellente nouvelle ! Votre colis a quitté nos installations et est actuellement en transit avec notre partenaire de livraison de confiance. Il est en route vers votre adresse et sera livré dans le délai estimé. Veuillez garder votre téléphone à portée de main au cas où le livreur aurait besoin de vous contacter.",
  },
  dispatched: {
    title: 'En cours de livraison',
    subtitle:
      "Excellente nouvelle ! Votre colis a quitté nos installations et est actuellement en transit avec notre partenaire de livraison de confiance. Il est en route vers votre adresse et sera livré dans le délai estimé. Veuillez garder votre téléphone à portée de main au cas où le livreur aurait besoin de vous contacter.",
  },
  delivered: {
    title: 'Livré avec succès',
    subtitle:
      "Votre commande a été livrée en toute sécurité par notre livreur et se trouve désormais entre vos mains. Nous espérons que votre nouveau parfum vous apportera satisfaction et plaisir. Merci de nous avoir fait confiance pour votre commande.",
  },
  cancelled: {
    title: 'Commande annulée',
    subtitle: "Cette commande a été annulée. Si vous pensez qu'il s'agit d'une erreur, contactez notre support pour assistance.",
  },
};

export const STATUS_LABELS: Record<string, string> = {
  pending:    'Commande reçue',
  confirmed:  'Commande confirmée',
  preparing:  'Préparation de votre colis',
  dispatched: 'En cours de livraison',
  shipped:    'En cours de livraison',
  delivered:  'Colis livré',
  cancelled:  'Annulée',
};
