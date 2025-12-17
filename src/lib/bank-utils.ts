
export function getBankStyles(bankName: string): string {
  const name = bankName.toLowerCase();

  switch (name) {
    case 'nubank':
      return 'bg-gradient-to-br from-purple-800 to-purple-600 text-white';
    case 'inter':
      return 'bg-gradient-to-br from-orange-600 to-orange-400 text-white';
    case 'itaú':
    case 'itau':
      return 'bg-gradient-to-br from-blue-900 to-orange-500 text-white';
    case 'bradesco':
      return 'bg-gradient-to-br from-red-700 to-red-500 text-white';
    case 'santander':
      return 'bg-gradient-to-br from-red-800 to-red-600 text-white';
    case 'banco do brasil':
      return 'bg-gradient-to-br from-yellow-400 to-blue-800 text-white';
    case 'c6 bank':
      return 'bg-gradient-to-br from-slate-900 to-black text-white';
    case 'xp':
      return 'bg-gradient-to-br from-gray-900 to-yellow-500 text-white';
    default:
      return 'bg-gradient-to-br from-slate-700 to-slate-500 text-white';
  }
}
