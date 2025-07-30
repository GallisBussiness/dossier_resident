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
// Définition d'une interface pour les nœuds des tableaux PDF (corrige les erreurs 'any')
interface PdfTableNode {
  table: {
    body: unknown[][];
    widths: Array<string | number>;
  };
}

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
    pageMargins: [40, 80, 40, 60] as [number, number, number, number],
    // Ajout d'un en-tête de page avec numéro de page
    header: (currentPage: number, pageCount: number) => {
      return {
        columns: [
          { text: 'DOCUMENT OFFICIEL', alignment: 'left', style: 'watermark' },
          { text: `Page ${currentPage} / ${pageCount}`, alignment: 'right', style: 'watermark' }
        ],
        margin: [40, 20]
      };
    },
    // Pied de page amélioré
    footer: {
      columns: [
        { text: 'Centre Régional des Œuvres Universitaires - CROUS/Z', alignment: 'left', style: 'footer' },
        { text: formatDate(new Date(), true), alignment: 'right', style: 'footer' }
      ],
      margin: [40, 20]
    },
    // Ajout d'un watermark pour l'aspect officiel
    watermark: { text: 'CROUS/Z', color: '#eeeeee', opacity: 0.07, bold: true, italics: false },
    styles: {
      title: {
        bold: true,
        alignment: 'center',
        fontSize: 18,
        margin: [0, 0, 0, 20],
        color: '#003366',
        decoration: 'underline',
        decorationStyle: 'double',
        decorationColor: '#003366'
      },
      header: {
        bold: true,
        fontSize: 14,
        margin: [0, 15, 0, 8],
        color: '#003366',
        fillColor: '#f0f5ff',
        padding: [5, 3, 5, 3],
        decorationStyle: 'solid'
      },
      subheader: {
        fontSize: 12,
        bold: true,
        margin: [0, 10, 0, 5],
        color: '#003366'
      },
      normal: {
        fontSize: 10
      },
      field: {
        fontSize: 10,
        bold: true,
        color: '#333333'
      },
      value: {
        fontSize: 10,
        margin: [5, 0, 0, 0],
        color: '#333333'
      },
      'value-bold': {
        fontSize: 10,
        margin: [5, 0, 0, 0],
        bold: true,
        color: '#000000'
      },
      signature: {
        alignment: 'right',
        margin: [0, 10, 0, 10],
        fontSize: 10,
        bold: true,
        color: '#003366'
      },
      watermark: {
        fontSize: 8,
        color: '#888888',
        bold: false
      },
      footer: {
        italics: true,
        fontSize: 8,
        color: '#666666'
      },
      'footer-bold': {
        italics: true,
        fontSize: 8,
        bold: true,
        color: '#444444'
      },
      tableHeader: {
        bold: true,
        fontSize: 10,
        color: '#ffffff',
        fillColor: '#003366',
        alignment: 'center',
        margin: [0, 3, 0, 3]
      },
      // Nouveaux styles pour les textes administratifs
      official: {
        fontSize: 9,
        bold: true,
        color: '#003366',
        alignment: 'center'
      },
      stamp: {
        fontSize: 10,
        alignment: 'center',
        color: '#003366',
        bold: true
      },
      reference: {
        fontSize: 8,
        color: '#666666',
        alignment: 'right',
        margin: [0, 2, 0, 10]
      }
    },
    defaultStyle: {
      font: 'Roboto'
    },
    content: [
      // En-tête officielle
      {
        columns: [
          {
            width: 'auto',
            stack: [
              {text: "RÉPUBLIQUE DU SÉNÉGAL", fontSize: 12, bold: true, alignment: "center", color: "#000066"},
              {text: "Un Peuple, Un but, Une Foi", fontSize: 9, margin: [0, 2], alignment: "center", italics: true},
              {image: drapeau, width: 45, alignment: "center", margin: [0, 5]},
              {canvas: [{ type: 'line', x1: 0, y1: 5, x2: 150, y2: 5, lineWidth: 1, lineColor: '#000066' }], margin: [0, 5, 0, 5]},
              {text: "MINISTÈRE DE L'ENSEIGNEMENT SUPÉRIEUR", fontSize: 9, bold: true, margin: [0, 5], alignment: "center", color: "#000066"},
              {text: "CENTRE RÉGIONAL DES ŒUVRES UNIVERSITAIRES", fontSize: 9, bold: true, margin: [0, 2], alignment: "center", color: "#000066"},
              {text: "CROUS - ZIGUINCHOR", fontSize: 10, bold: true, margin: [0, 2], alignment: "center", color: "#000066"},
              {text: "SERVICE DE L'HEBERGEMENT", fontSize: 9, bold: true, margin: [0, 2], alignment: "center", color: "#000066"},
              {canvas: [{ type: 'line', x1: 0, y1: 5, x2: 150, y2: 5, lineWidth: 1, lineColor: '#000066' }], margin: [0, 5, 0, 0]},
            ]
          },
          {
            width: '*',
            text: ''
          },
          {
            width: 'auto',
            stack: [
              {image: logo, width: 85, alignment: "center"},
              {text: "CROUS/Z", fontSize: 16, bold: true, alignment: "center", margin: [0, 8], color: '#000066'},
              {text: "Gestion des résidents", fontSize: 10, alignment: "center", italics: true},
              {text: `Réf: ${dossier.numero || 'N/A'}-${new Date().getFullYear()}`, style: 'reference', margin: [0, 10, 0, 0]},
              {text: `NCS: ${etudiant.ncs || 'N/A'}`, style: 'reference'}
            ]
          }
        ]
      },
      
      // Ligne séparatrice
      {canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 1, lineColor: '#000066' }], margin: [0, 5, 0, 5]},
      
      // Titre du document avec date et tampon
      {
        text: 'FICHE DE DOSSIER RÉSIDENT',
        style: 'title',
        margin: [0, 10, 0, 20]
      },
      {
        text: `Année Universitaire: ${anneeUniv}`,
        style: 'stamp',
        margin: [0, 0, 0, 20]
      },
      
      // Section informations administratives avec bordure et fond légèrement coloré
      {
        stack: [
          {
            text: 'INFORMATIONS ADMINISTRATIVES',
            style: 'header',
            margin: [0, 5, 0, 10]
          },
          // Numéro de référence et tampon administratif
          {
            canvas: [
              {
                type: 'rect',
                x: 0,
                y: 0,
                w: 515,
                h: 20,
                r: 0,
                lineWidth: 1,
                lineColor: '#003366',
                fillColor: '#EBF1FA'
              }
            ]
          },
          {
            text: `N° ENREGISTREMENT: ${dossier.numero || 'NON ATTRIBUÉ'}`,
            fontSize: 10,
            bold: true,
            alignment: 'center',
            margin: [0, -15, 0, 10],
            color: '#003366'
          },
        ]
      },
      
      // Informations financières avec style administratif
      {
        stack: [
          {
            text: 'INFORMATIONS FINANCIÈRES',
            style: 'header',
            margin: [0, 10, 0, 5]
          },
          // Table financière avec design officiel
          {
            style: 'tableExample',
            table: {
              widths: ['40%', '20%', '40%'],
              body: [
                [
                  {text: 'Description', style: 'tableHeader'},
                  {text: 'Montant (FCFA)', style: 'tableHeader'},
                  {text: 'Observations', style: 'tableHeader'}
                ],
                [
                  {text: 'Caution versée', alignment: 'left', margin: [5, 2, 0, 2]},
                  {text: `${(dossier.caution || 0).toLocaleString()}`, alignment: 'center', bold: true},
                  {text: 'Payable une fois', alignment: 'center', italics: true}
                ],
                [
                  {text: 'Loyer mensuel', alignment: 'left', margin: [5, 2, 0, 2]},
                  {text: `${(dossier.taux_loyer_mensuelle || 0).toLocaleString()}`, alignment: 'center', bold: true},
                  {text: 'Payable mensuellement', alignment: 'center', italics: true}
                ],
                [
                  {text: 'Total annuel estimé', alignment: 'left', margin: [5, 2, 0, 2], bold: true},
                  {text: `${((dossier.taux_loyer_mensuelle || 0) * 12 + (dossier.caution || 0)).toLocaleString()}`, alignment: 'center', bold: true, fillColor: '#F0F5FF'},
                  {text: 'Caution + (Loyer × 12)', alignment: 'center'}
                ]
              ]
            },
            layout: {
              hLineWidth: function(i: number, node: PdfTableNode) { return (i === 0 || i === node.table.body.length) ? 2 : 1; },
              vLineWidth: function(i: number, node: PdfTableNode) { return (i === 0 || i === node.table.widths.length) ? 2 : 1; },
              hLineColor: function(i: number, node: PdfTableNode) { return (i === 0 || i === node.table.body.length) ? '#003366' : '#DDDDDD'; },
              vLineColor: function(i: number, node: PdfTableNode) { return (i === 0 || i === node.table.widths.length) ? '#003366' : '#DDDDDD'; },
            }
          }
        ],
        margin: [0, 0, 0, 10]
      },
      // Section photo d'identité et informations de l'étudiant
      {
        stack: [
          {
            text: 'FICHE D\'IDENTIFICATION DE L\'ÉTUDIANT',
            style: 'header',
            margin: [0, 10, 0, 5]
          },
          // Conteneur en ligne pour la photo et les informations
          {
            columns: [
              // Colonne pour la photo (remplacée par un cadre pour la photo)
              {
                width: '30%',
                stack: [
                  {
                    canvas: [
                      {
                        type: 'rect',
                        x: 0,
                        y: 0,
                        w: 120,
                        h: 130,
                        lineWidth: 1,
                        lineColor: '#003366',
                        dash: {length: 5}
                      }
                    ],
                    alignment: 'center'
                  },
                  {text: "Photo d'identité", alignment: 'center', fontSize: 8, margin: [0, 5, 0, 0]}
                ]
              },
              // Colonne pour les informations personnelles
              {
                width: '70%',
                stack: [
                  {
                    style: 'tableExample',
                    table: {
                      widths: ['30%', '70%'],
                      body: [
                        [{text: 'NOM', style: 'tableHeader'}, {text: etudiant.nom || 'NON RENSEIGNÉ', bold: true, margin: [5, 2, 0, 2]}],
                        [{text: 'PRÉNOM', style: 'tableHeader'}, {text: etudiant.prenom || 'NON RENSEIGNÉ', bold: true, margin: [5, 2, 0, 2]}],
                        [{text: 'CNI', style: 'tableHeader'}, {text: etudiant.cni || 'NON RENSEIGNÉ', bold: true, margin: [5, 2, 0, 2]}],
                        [{text: 'NCS', style: 'tableHeader'}, {text: etudiant.ncs || 'NON RENSEIGNÉ', bold: true, margin: [5, 2, 0, 2]}],
                        [{text: 'TÉLÉPHONE', style: 'tableHeader'}, {text: etudiant.telephone || 'NON RENSEIGNÉ', margin: [5, 2, 0, 2]}],
                        [{text: 'EMAIL', style: 'tableHeader'}, {text: etudiant.email || 'NON RENSEIGNÉ', italics: true, margin: [5, 2, 0, 2]}]
                      ]
                    },
                    layout: {
                      hLineWidth: function(i: number, node: PdfTableNode) { return (i === 0 || i === node.table.body.length) ? 2 : 1; },
                      vLineWidth: function(i: number, node: PdfTableNode) { return (i === 0 || i === node.table.widths.length) ? 2 : 1; },
                      hLineColor: function(i: number, node: PdfTableNode) { return (i === 0 || i === node.table.body.length) ? '#003366' : '#DDDDDD'; },
                      vLineColor: function(i: number, node: PdfTableNode) { return (i === 0 || i === node.table.widths.length) ? '#003366' : '#DDDDDD'; },
                    }
                  }
                ]
              }
            ],
            margin: [0, 0, 0, 20]
          }
        ]
      },
      
      // Informations de la chambre avec design amélioré
      {
        stack: [
          {
            text: 'AFFECTATION DE LOGEMENT',
            style: 'header',
            margin: [0, 10, 0, 10]
          },
          // Box de référence pour l'affectation
          {
            canvas: [
              {
                type: 'rect',
                x: 0,
                y: 0,
                w: 515,
                h: 25,
                lineWidth: 1,
                lineColor: '#003366',
                fillColor: '#F0F5FF'
              }
            ]
          },
          {
            text: `FICHE D'ATTRIBUTION - RÉFÉRENCE: ${dossier.numero || 'N/A'}/${anneeUniv}`,
            fontSize: 10,
            bold: true,
            alignment: 'center',
            margin: [0, -18, 0, 15],
            color: '#003366'
          },
          // Table des informations du logement avec design amélioré
          {
            style: 'tableExample',
            table: {
              widths: ['25%', '25%', '25%', '25%'],
              body: [
                [
                  {text: 'CAMPUS', style: 'tableHeader'},
                  {text: 'PAVILLON', style: 'tableHeader'},
                  {text: 'CHAMBRE', style: 'tableHeader'},
                  {text: 'DATE D\'ATTRIBUTION', style: 'tableHeader'}
                ],
                [
                  {text: chambreInfo.campus, alignment: 'center', bold: true},
                  {text: chambreInfo.pavillon, alignment: 'center', bold: true},
                  {text: chambreInfo.nom, alignment: 'center', bold: true},
                  {text: dossier.createdAt ? formatDate(new Date(dossier.createdAt)) : 'N/A', alignment: 'center'}
                ]
              ]
            },
            layout: {
              hLineWidth: function(i: number, node: PdfTableNode) { return (i === 0 || i === node.table.body.length) ? 2 : 1; },
              vLineWidth: function(i: number, node: PdfTableNode) { return (i === 0 || i === node.table.widths.length) ? 2 : 1; },
              hLineColor: function(i: number, node: PdfTableNode) { return (i === 0 || i === node.table.body.length) ? '#003366' : '#DDDDDD'; },
              vLineColor: function(i: number, node: PdfTableNode) { return (i === 0 || i === node.table.widths.length) ? '#003366' : '#DDDDDD'; },
            }
          },
          // Ajout de mentions légales pour l'attribution
          {
            text: 'Cette affectation est personnelle et ne peut être cédée. Le non-respect des conditions générales d\'occupation peut entraîner la résiliation du contrat.',
            fontSize: 8,
            italics: true,
            alignment: 'center',
            margin: [0, 10, 0, 0]
          }
        ],
        margin: [0, 0, 0, 20]
      },
      
      // Section situation financière
      {
        stack: [
          {
            canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#000066', dash: {length: 3, space: 2} }],
            margin: [0, 10, 0, 5]
          },
          {
            text: 'SITUATION FINANCIÈRE',
            style: 'header',
            margin: [0, 5, 0, 10]
          },
          // Résumé des paiements
          {
            columns: [
              {
                width: '40%',
                stack: [
                  {
                    text: 'Situation des paiements',
                    style: 'subheader',
                    margin: [0, 0, 0, 5]
                  },
                  {
                    canvas: [
                      {
                        type: 'rect',
                        x: 0,
                        y: 0,
                        w: 200,
                        h: 40,
                        lineWidth: 1,
                        lineColor: '#003366',
                        fillColor: '#EBF1FA'
                      }
                    ]
                  },
                  {
                    text: `Nombre de paiements: ${payments.length}`,
                    margin: [5, -35, 0, 0],
                    bold: true,
                    fontSize: 9
                  },
                  {
                    text: `Montant total payé: ${payments.reduce((sum, p) => sum + p.montant, 0).toLocaleString()} FCFA`,
                    margin: [5, 5, 0, 0],
                    bold: true,
                    fontSize: 9
                  },
                ]
              },
              {
                width: '60%',
                stack: [
                  payments.length > 0 ? {
                    style: 'tableExample',
                    table: {
                      widths: ['20%', '30%', '25%', '25%'],
                      headerRows: 1,
                      body: [
                        [
                          {text: 'Mois', style: 'tableHeader'},
                          {text: 'N° Facture', style: 'tableHeader'},
                          {text: 'Date', style: 'tableHeader'},
                          {text: 'Montant', style: 'tableHeader'},
                        ],
                        ...payments.map(payment => [
                          {text: payment.mois, alignment: 'center'},
                          {text: payment.numero_facture || 'N/A', alignment: 'center'},
                          {text: formatDate(new Date()), alignment: 'center'},
                          {text: `${payment.montant.toLocaleString()} FCFA`, alignment: 'right', bold: true},
                        ])
                      ]
                    },
                    layout: {
                      hLineWidth: function(i: number, node: PdfTableNode) { return (i === 0 || i === node.table.body.length) ? 2 : 1; },
                      vLineWidth: function(i: number, node: PdfTableNode) { return (i === 0 || i === node.table.widths.length) ? 2 : 1; },
                      hLineColor: function(i: number, node: PdfTableNode) { return (i === 0 || i === node.table.body.length) ? '#003366' : '#DDDDDD'; },
                      vLineColor: function(i: number, node: PdfTableNode) { return (i === 0 || i === node.table.widths.length) ? '#003366' : '#DDDDDD'; },
                    }
                  } : {
                    text: 'Aucun paiement enregistré',
                    style: 'normal',
                    alignment: 'center',
                    italics: true,
                    margin: [0, 10],
                    color: '#666666'
                  },
                ]
              }
            ],
            margin: [0, 0, 0, 20]
          },
          
          // Section des allocations matérielles (en utilisant les informations des mémoires)
          {
            text: 'ALLOCATIONS DE MATÉRIEL',
            style: 'header',
            margin: [0, 10, 0, 10]
          },
          {
            text: 'Liste du matériel alloué au résident pour l\'année universitaire en cours.',
            fontSize: 9,
            italics: true,
            margin: [0, 0, 0, 10]
          },
          // Tableau vide pour les allocations (pourrait être rempli avec des données réelles plus tard)
          {
            style: 'tableExample',
            table: {
              widths: ['10%', '40%', '20%', '30%'],
              headerRows: 1,
              body: [
                [
                  {text: 'N°', style: 'tableHeader'},
                  {text: 'Article', style: 'tableHeader'},
                  {text: 'État', style: 'tableHeader'},
                  {text: 'Date d\'allocation', style: 'tableHeader'},
                ],
                [
                  {text: '1', alignment: 'center'},
                  {text: 'Matelas', alignment: 'left', margin: [5, 2, 0, 2]},
                  {text: 'NEUF', alignment: 'center', color: '#006633', bold: true},
                  {text: formatDate(new Date()), alignment: 'center'},
                ],
                [
                  {text: '2', alignment: 'center'},
                  {text: 'Chaise', alignment: 'left', margin: [5, 2, 0, 2]},
                  {text: 'NEUF', alignment: 'center', color: '#006633', bold: true},
                  {text: formatDate(new Date()), alignment: 'center'},
                ],
                [
                  {text: '3', alignment: 'center'},
                  {text: 'Bureau', alignment: 'left', margin: [5, 2, 0, 2]},
                  {text: 'DÉTÉRIORÉ', alignment: 'center', color: '#990000', bold: true},
                  {text: formatDate(new Date()), alignment: 'center'},
                ]
              ]
            },
            layout: {
              hLineWidth: function(i: number, node: PdfTableNode) { return (i === 0 || i === node.table.body.length) ? 2 : 1; },
              vLineWidth: function(i: number, node: PdfTableNode) { return (i === 0 || i === node.table.widths.length) ? 2 : 1; },
              hLineColor: function(i: number, node: PdfTableNode) { return (i === 0 || i === node.table.body.length) ? '#003366' : '#DDDDDD'; },
              vLineColor: function(i: number, node: PdfTableNode) { return (i === 0 || i === node.table.widths.length) ? '#003366' : '#DDDDDD'; },
            }
          },
          // Note importante sur les allocations
          {
            text: 'NB: Le matériel doit être restitué à la fin de l\'année universitaire dans l\'état dans lequel il a été alloué. Tout matériel manquant ou dégradé sera facturé à l\'étudiant.',
            fontSize: 8,
            italics: true,
            alignment: 'center',
            margin: [0, 10, 0, 0],
            color: '#990000'
          }
        ]
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
              {text: '', margin: [0, 20]},
              {text: 'Le Chef de la division', style: 'signature'}
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
