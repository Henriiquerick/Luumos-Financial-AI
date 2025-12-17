
export function getBankStyles(bankName: string): string {
  const name = bankName.toLowerCase();

  switch (name) {
    case 'nubank':
      // #820AD1
      return 'bg-gradient-to-br from-purple-800 to-purple-600 text-white';
    case 'inter':
       // #FF7A00
      return 'bg-gradient-to-br from-orange-600 to-orange-400 text-white';
    case 'itaú':
    case 'itau':
       // #EC7000
      return 'bg-gradient-to-br from-orange-700 to-orange-500 text-white';
    case 'bradesco':
      // #CC092F
      return 'bg-gradient-to-br from-red-800 to-red-600 text-white';
    case 'santander':
      // #EC0000
      return 'bg-gradient-to-br from-red-700 to-red-500 text-white';
    case 'banco do brasil':
      return 'bg-gradient-to-br from-yellow-400 to-blue-800 text-white';
    case 'c6 bank':
      return 'bg-gradient-to-br from-slate-900 to-black text-white';
    case 'xp':
      return 'bg-gradient-to-br from-gray-900 to-yellow-500 text-white';
    default:
      // #1A1A1A
      return 'bg-gradient-to-br from-gray-800 to-gray-900 text-white';
  }
}
