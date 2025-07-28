import pdfMake from "pdfmake";
import type { Dossier } from "../types/dossier";
import type { Etudiant } from "../types/etudiant";
import type { Payement } from "../types/payement";
import { font } from '../vfs_fonts';
import { drapeau } from "../drapeau";
import { logo } from "../logo";

// Configuration de pdfMake
pdfMake.vfs = font;

/**
 * Formate une date au format dd/MM/yyyy
 * @param date La date à formater
 * @param withTime Inclure l'heure (HH:mm)
 * @returns La date formatée
 */
function formatDate(date: Date, withTime: boolean = false): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  if (withTime) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }
  
  return `${day}/${month}/${year}`;
}

/**
 * Formate une date au format long (dd mois yyyy)
 * @param date La date à formater
 * @returns La date formatée
 */
function formatDateLong(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const year = date.getFullYear();
  
  const months = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
  ];
  
  const month = months[date.getMonth()];
  
  return `${day} ${month} ${year}`;
}

// Interface pour les informations de chambre
interface ChambreInfo {
  nom: string;
  pavillon: string;
  campus: string;
}

/**
 * Génère un PDF pour un dossier résident
 * @param dossier Les données du dossier
 * @param etudiant Les données de l'étudiant
 * @param payments La liste des paiements
 * @param paymentStats Les statistiques de paiement
 * @returns Un objet PDF généré par pdfMake
 */
export const generateDossierPDF = (
  dossier: Dossier,
  etudiant: Etudiant,
  payments: Payement[],
) => {
  // Extraction des informations de la chambre
  const chambreInfo: ChambreInfo = typeof dossier.chambreId === 'string' 
    ? { nom: 'Non spécifié', pavillon: 'Non spécifié', campus: 'Non spécifié' }
    : {
        nom: dossier.chambreId?.nom || 'Non spécifié',
        pavillon: (dossier.chambreId?.pavillonId as {nom?: string})?.nom || 'Non spécifié',
        campus: ((dossier.chambreId?.pavillonId as {campusId?: {nom: string}})?.campusId?.nom || 'Non spécifié')
      };
  
  // Extraction de l'année universitaire
  const anneeUniv = typeof dossier.anneeUniversitaireId === 'string' 
    ? dossier.anneeUniversitaireId 
    : dossier.anneeUniversitaireId?.nom || 'Non spécifié';
  
  // Définition du document PDF
  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [40, 60, 40, 60] as [number, number, number, number],
    footer: {
      columns: [
        { text: 'Gestion des résidents universitaires', alignment: 'center', style: 'footer' },
        { text: formatDate(new Date(), true), alignment: 'right', style: 'footer' }
      ],
      margin: [40, 20]
    },
    styles: {
      title: {
        bold: true,
        alignment: 'center',
        fontSize: 16,
        margin: [0, 0, 0, 20],
        color: '#1890ff'
      },
      header: {
        bold: true,
        fontSize: 14,
        margin: [0, 10, 0, 5],
        color: '#1890ff'
      },
      subheader: {
        fontSize: 12,
        bold: true,
        margin: [0, 10, 0, 5]
      },
      normal: {
        fontSize: 10
      },
      field: {
        fontSize: 10,
        bold: true
      },
      value: {
        fontSize: 10,
        margin: [5, 0, 0, 0]
      },
      'value-bold': {
        fontSize: 10,
        margin: [5, 0, 0, 0],
        bold: true
      },
      signature: {
        alignment: 'right',
        margin: [0, 50, 0, 10],
        fontSize: 10,
        bold: true
      },
      footer: {
        alignment: 'center',
        italics: true,
        fontSize: 8,
        color: '#666666'
      },
      'footer-bold': {
        alignment: 'center',
        italics: true,
        fontSize: 8,
        bold: true
      },
      tableHeader: {
        bold: true,
        fontSize: 10,
        color: '#ffffff',
        fillColor: '#1890ff',
        alignment: 'center'
      }
    },
    defaultStyle: {
      font: 'Roboto'
    },
    content: [
      // En-tête
      {
        columns: [
          {
            width: 'auto',
            stack: [
              {text: "RÉPUBLIQUE DU SÉNÉGAL", fontSize: 10, bold: true, alignment: "center"},
              {text: "Un Peuple, Un but, Une Foi", fontSize: 8, margin: [0, 2], alignment: "center"},
              {image: drapeau, width: 40, alignment: "center", margin: [0, 5]},
              {text: "MINISTÈRE DE L'ENSEIGNEMENT SUPÉRIEUR", fontSize: 8, bold: true, margin: [0, 5], alignment: "center"},
              {text: "CENTRE RÉGIONAL DES ŒUVRES UNIVERSITAIRES - CROUS/Z", fontSize: 8, bold: true, margin: [0, 2], alignment: "center"},
              {text: "SERVICE DE L'HEBERGEMENT", fontSize: 8, bold: true, margin: [0, 2], alignment: "center"},
            ]
          },
          {
            width: '*',
            text: ''
          },
          {
            width: 'auto',
            stack: [
              {image: logo, width: 80, alignment: "center"},
              {text: "CROUS/Z", fontSize: 14, bold: true, alignment: "center", margin: [0, 5], color: '#1890ff'},
              {text: "Gestion des résidents", fontSize: 10, alignment: "center", italics: true},
            ]
          }
        ]
      },
      
      // Titre du document
      {
        text: 'FICHE DE DOSSIER RÉSIDENT',
        style: 'title',
        margin: [0, 20, 0, 10]
      },
      
      // Informations du dossier
      {
        text: 'INFORMATIONS DU DOSSIER',
        style: 'header',
        margin: [0, 20, 0, 10]
      },
      {
        style: 'tableExample',
        table: {
          widths: ['30%', '20%', '30%', '20%'],
          headerRows: 1,
          body: [
            [
              {text: 'N° Dossier', style: 'tableHeader'},
              {text: 'Statut', style: 'tableHeader'},
              {text: 'Année Universitaire', style: 'tableHeader'},
              {text: 'Date de création', style: 'tableHeader'}
            ],
            [
              {text: dossier.numero || 'N/A', alignment: 'center'},
              {text: dossier.active ? 'Actif' : 'Inactif', alignment: 'center', color: dossier.active ? '#52c41a' : '#f5222d'},
              {text: anneeUniv, alignment: 'center'},
              {text: dossier.createdAt ? formatDate(new Date(dossier.createdAt)) : 'N/A', alignment: 'center'}
            ]
          ]
        },
        layout: {
          hLineWidth: function() { return 1; },
          vLineWidth: function() { return 1; },
          hLineColor: function() { return '#DDDDDD'; },
          vLineColor: function() { return '#DDDDDD'; },
        }
      },
      
      // Informations financières
      {
        text: 'INFORMATIONS FINANCIÈRES',
        style: 'header',
        margin: [0, 20, 0, 10]
      },
      {
        columns: [
          {
            width: '50%',
            stack: [
              {text: 'Caution:', style: 'field'},
              {text: 'Loyer mensuel:', style: 'field'},
              {text: 'Total payé:', style: 'field'},
              {text: 'Total annuel estimé:', style: 'field'},
            ]
          },
          {
            width: '50%',
            stack: [
              {text: `${(dossier.caution || 0).toLocaleString()} FCFA`, style: 'value-bold'},
              {text: `${(dossier.taux_loyer_mensuelle || 0).toLocaleString()} FCFA`, style: 'value'},
              {text: `${((dossier.taux_loyer_mensuelle || 0) * 12 + (dossier.caution || 0)).toLocaleString()} FCFA`, style: 'value-bold'},
            ]
          }
        ],
        margin: [0, 0, 0, 10]
      },
      
      // Informations de l'étudiant
      {
        text: 'INFORMATIONS DE L\'ÉTUDIANT',
        style: 'header',
        margin: [0, 20, 0, 10]
      },
      {
        style: 'tableExample',
        table: {
          widths: ['25%', '25%', '25%', '25%'],
          body: [
            [
              {text: 'Nom', style: 'tableHeader'},
              {text: 'Prénom', style: 'tableHeader'},
              {text: 'NCS', style: 'tableHeader'},
              {text: 'CNI', style: 'tableHeader'}
            ],
            [
              {text: etudiant.nom || 'N/A', alignment: 'center'},
              {text: etudiant.prenom || 'N/A', alignment: 'center'},
              {text: etudiant.ncs || 'N/A', alignment: 'center'},
              {text: etudiant.cni || 'N/A', alignment: 'center'}
            ],
            [
              {text: 'Téléphone', style: 'tableHeader', colSpan: 2},
              {},
              {text: 'Email', style: 'tableHeader', colSpan: 2},
              {}
            ],
            [
              {text: etudiant.telephone || 'N/A', alignment: 'center', colSpan: 2},
              {},
              {text: etudiant.email || 'N/A', alignment: 'center', colSpan: 2},
              {}
            ]
          ]
        },
        layout: {
          hLineWidth: function() { return 1; },
          vLineWidth: function() { return 1; },
          hLineColor: function() { return '#DDDDDD'; },
          vLineColor: function() { return '#DDDDDD'; },
        }
      },
      
      // Informations de la chambre
      {
        text: 'INFORMATIONS DE LA CHAMBRE',
        style: 'header',
        margin: [0, 20, 0, 10]
      },
      {
        style: 'tableExample',
        table: {
          widths: ['33%', '33%', '34%'],
          body: [
            [
              {text: 'Chambre', style: 'tableHeader'},
              {text: 'Pavillon', style: 'tableHeader'},
              {text: 'Campus', style: 'tableHeader'}
            ],
            [
              {text: chambreInfo.nom, alignment: 'center'},
              {text: chambreInfo.pavillon, alignment: 'center'},
              {text: chambreInfo.campus, alignment: 'center'}
            ]
          ]
        },
        layout: {
          hLineWidth: function() { return 1; },
          vLineWidth: function() { return 1; },
          hLineColor: function() { return '#DDDDDD'; },
          vLineColor: function() { return '#DDDDDD'; },
        }
      },
      
      // Historique des paiements
      {
        text: 'HISTORIQUE DES PAIEMENTS',
        style: 'header',
        margin: [0, 20, 0, 10]
      },
      payments.length > 0 ? {
        style: 'tableExample',
        table: {
          widths: ['33%', '33%', '34%'],
          headerRows: 1,
          body: [
            [
              {text: 'Mois', style: 'tableHeader'},
              {text: 'Montant', style: 'tableHeader'},
              {text: 'N° Facture', style: 'tableHeader'},
            ],
            ...payments.map(payment => [
              {text: payment.mois, alignment: 'center'},
              {text: `${payment.montant.toLocaleString()} FCFA`, alignment: 'center'},
              {text: payment.numero_facture || 'N/A', alignment: 'center'},
            ])
          ]
        },
        layout: {
          hLineWidth: function() { return 1; },
          vLineWidth: function() { return 1; },
          hLineColor: function() { return '#DDDDDD'; },
          vLineColor: function() { return '#DDDDDD'; },
        }
      } : {
        text: 'Aucun paiement enregistré',
        style: 'normal',
        alignment: 'center',
        italics: true,
        margin: [0, 10]
      },
      
      // Signature et date
      {
        columns: [
          {
            width: '60%',
            text: ''
          },
          {
            width: '40%',
            stack: [
              {text: `Fait à Ziguinchor, le ${formatDateLong(new Date())}`, style: 'signature', margin: [0, 30, 0, 10]},
              {text: 'Le Directeur', style: 'signature'},
              {text: '', margin: [0, 20]},
              {text: 'Dr. Salif Baldé', style: 'signature'}
            ]
          }
        ],
        margin: [0, 30, 0, 0]
      },
      
      // QR Code (si nécessaire)
      // { qr: `DOSSIER:${dossier.numero}|ETUDIANT:${etudiant.ncs}`, fit: '80', alignment: 'center', margin: [0, 20] }
    ]
  };
  
  return pdfMake.createPdf(docDefinition);
};
