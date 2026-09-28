export const libellesOperation = { DEPOT: 'Dépôt', RETRAIT: 'Retrait', VIREMENT: 'Virement' }
export const libellesTypeCompte = { COURANT: 'Compte courant', EPARGNE: 'Compte épargne' }

export function libelleOperation(operation) {
  if (operation.type_transaction !== 'VIREMENT') return libellesOperation[operation.type_transaction]
  const sens = operation.sens === 'CREDIT' ? 'reçu de' : 'vers'
  return `Virement ${sens} ${operation.contrepartie_numero ?? 'un autre compte'}`
}
