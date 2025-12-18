
export const CARD_BRANDS = [
  {
    value: 'visa',
    label: 'Visa',
    icon: `<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M6.102 6.953c-3.313 0-4.572 1.54-4.572 4.394v.054c0 2.14.912 3.42 2.764 4.045.24.08.48.134.717.188l.24.053-.027-.133c-.107-.563-.267-1.125-.455-1.66l-.268-.746-.267-.027c-.295-.026-.508-.053-.643-.08-.616-.134-1.07-.455-1.07-1.15 0-.59.482-.99 1.15-1.07.214-.027.48-.027.776-.027h.537v-1.123H6.102zM12.93 6.953h-2.51v7.41h2.51c2.43 0 3.937-1.31 3.937-3.704s-1.507-3.706-3.937-3.706zm1.738 3.706c0 1.124-.615 1.765-1.738 1.765h-.59v-3.53h.59c1.123 0 1.738.643 1.738 1.765zM22.427 11.23c0-2.17-1.31-3.623-3.785-3.623h-2.82v7.41h2.82c2.474 0 3.785-1.453 3.785-3.786zm-1.818-.027c0 1.07-.643 1.684-1.967 1.684h-.591V9.546h.59c1.325 0 1.968.617 1.968 1.657z" fill="#142688"/></svg>`
  },
  {
    value: 'mastercard',
    label: 'Mastercard',
    icon: `<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="8.5" cy="12" r="5.5" fill="#EA001B"/><circle cx="15.5" cy="12" r="5.5" fill="#F79E1B"/><path d="M12 8.5a5.5 5.5 0 0 0-3.5 1.458 5.5 5.5 0 0 1 0 4.084A5.5 5.5 0 0 0 12 15.5a5.5 5.5 0 0 0 3.5-1.458 5.5 5.5 0 0 1 0-4.084A5.5 5.5 0 0 0 12 8.5z" fill="#FF5F00"/></svg>`
  },
  {
    value: 'elo',
    label: 'Elo',
    icon: `<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="7" cy="12" r="4.5" fill="#f9b000"/><path d="M12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Z" fill="#231f20"/><path d="M14.727 7.5a4.5 4.5 0 1 1 0 9" fill="#e8530e"/></svg>`
  },
  {
    value: 'amex',
    label: 'American Express',
    icon: `<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" fill="#006FCF" rx="3"/><path d="M12 12.355h2.366l2.367 4.099H19.5L15.903 10.3l3.6-6.23h-2.766L14.37 8.17l-2.37-4.099H9.231l3.6 6.23-3.6 6.23h2.769l2.366-4.099L12 12.355zm-7.645-.259h3.718v.538H4.355v-.538zm.538 2.693h2.645v.538H4.893v-.538zm-.538-5.385h3.718v.538H4.355V9.404zm.538-2.692h2.645v.538H4.893V6.712z" fill="#fff"/></svg>`
  },
  {
    value: 'hipercard',
    label: 'Hipercard',
    icon: `<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M11.95 24l-.195-.002-9.37-8.156L2.31 4.053 11.83.187l9.734 11.72-9.615 12.092zm-.203-1.442L20.08 11.84 11.93 2.11 3.597 12.01l8.15 6.545z" fill="#D81C1C"/><path d="M12 12.007a.64.64 0 0 1-.64-.64V7.57a.64.64 0 1 1 1.28 0v3.796a.64.64 0 0 1-.64.64zm-.008 3.865a.86.86 0 0 1-.86-.86.86.86 0 0 1 .86-.86.86.86 0 0 1 .86.86.86.86 0 0 1-.86.86z" fill="#D81C1C"/></svg>`
  },
  {
    value: 'diners',
    label: 'Diners Club',
    icon: `<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10.667" fill="#0055A0"/><path d="M12 3a9 9 0 0 0-6.924 14.774A9.003 9.003 0 0 0 12 21a9 9 0 0 0 6.924-14.774A8.997 8.997 0 0 0 12 3Z" fill="#fff"/></svg>`
  },
  {
    value: 'discover',
    label: 'Discover',
    icon: `<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="12" fill="#FF6000"/><path d="M12 20a8 8 0 0 1-3.33-15.35A8 8 0 0 0 12 4a8 8 0 0 1 8 8 8 8 0 0 1-8 8Z" fill="#fff"/></svg>`
  },
  {
    value: 'jcb',
    label: 'JCB',
    icon: `<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect width="22" height="15" x="1" y="4.5" fill="#0055A0" rx="1.5"/><path d="M5.2 14V9.8h-2V14h2zm5.4 0V9.8h-2V14h2zm5.4 0V9.8h-2V14h2z" fill="#D81C1C"/><path d="M9.8 14l-1.4-2c-.1-.1-.2-.2-.3-.2H7.4v2.2H5.6V9.8h2.3c.9 0 1.5.6 1.5 1.3 0 .6-.3 1-.8 1.2l1.8 2.7H9.8zM8.3 11.2h.8c.4 0 .6-.2.6-.5s-.2-.5-.6-.5h-.8v1zm7.9 2.8l-1.4-2c-.1-.1-.2-.2-.3-.2h-.7v2.2h-1.8V9.8h2.3c.9 0 1.5.6 1.5 1.3 0 .6-.3 1-.8 1.2l1.8 2.7h-2zM16.2 11.2h.8c.4 0 .6-.2.6-.5s-.2-.5-.6-.5h-.8v1z" fill="#fff"/></svg>`
  },
  {
    value: 'aura',
    label: 'Aura',
    icon: `<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m18.42 22.8-6.41-6.42-6.42 6.42L.78 18.01l6.42-6.42L.78 5.18 5.58.39l6.42 6.41L18.42.39l4.79 4.79-6.41 6.42 6.41 6.41-4.8 4.79Z" fill="#FF8C00"/></svg>`
  },
];
