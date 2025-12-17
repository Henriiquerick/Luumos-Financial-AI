
export const TRANSLATIONS = {
  en: {
    dashboard: {
      greeting: 'Welcome,',
      welcome_back: 'Welcome to Lucent AI',
      subtitle: 'Here is the summary of your financial life.',
      balance: 'Available Balance',
      add_transaction: 'Add Transaction',
      recent_activity: 'Recent Activity',
      last_transactions: 'Your last 5 transactions.',
      installment_tunnel: 'Installment Tunnel',
      installment_subtitle: 'Your projected credit card bills for the next 6 months.',
    },
    transaction: {
      header: 'Transaction',
      date: 'Date',
      amount: 'Amount',
      no_transactions: 'No transactions yet. Add one to get started!',
    },
    chat: {
      agent_title: 'AI Financial Agent',
      acting_as: 'Acting as:',
      level: 'Level:',
      support_level: 'Support Level',
      personality: 'Personality',
      placeholder: 'Ask {personalityName} anything...',
      welcome: 'Hello! How can I help you today?',
    },
    header: {
      sign_out: 'Sign Out',
    },
    card: {
        add_new: 'Add New Card',
    },
  },
  pt: {
    dashboard: {
      greeting: 'Bem-vindo(a),',
      welcome_back: 'Bem-vindo(a) ao Lucent AI',
      subtitle: 'Aqui está o resumo da sua vida financeira.',
      balance: 'Saldo Disponível',
      add_transaction: 'Adicionar Transação',
      recent_activity: 'Atividade Recente',
      last_transactions: 'Suas últimas 5 transações.',
      installment_tunnel: 'Túnel de Parcelas',
      installment_subtitle: 'Suas faturas de cartão de crédito projetadas para os próximos 6 meses.',
    },
    transaction: {
      header: 'Transação',
      date: 'Data',
      amount: 'Valor',
      no_transactions: 'Nenhuma transação ainda. Adicione uma para começar!',
    },
    chat: {
      agent_title: 'Agente Financeiro IA',
      acting_as: 'Atuando como:',
      level: 'Nível:',
      support_level: 'Nível de Suporte',
      personality: 'Personalidade',
      placeholder: 'Pergunte qualquer coisa para {personalityName}...',
      welcome: 'Olá! Como posso ajudar hoje?',
    },
    header: {
      sign_out: 'Sair',
    },
    card: {
      add_new: 'Adicionar Novo Cartão',
    },
  },
  es: {
    dashboard: {
      greeting: 'Bienvenido(a),',
      welcome_back: 'Bienvenido(a) a Lucent AI',
      subtitle: 'Aquí está el resumen de tu vida financiera.',
      balance: 'Saldo Disponible',
      add_transaction: 'Añadir Transacción',
      recent_activity: 'Actividad Reciente',
      last_transactions: 'Tus últimas 5 transacciones.',
      installment_tunnel: 'Túnel de Cuotas',
      installment_subtitle: 'Las facturas de tu tarjeta de crédito proyectadas para los próximos 6 meses.',
    },
    transaction: {
      header: 'Transacción',
      date: 'Fecha',
      amount: 'Monto',
      no_transactions: 'Aún no hay transacciones. ¡Añade una para empezar!',
    },
    chat: {
      agent_title: 'Agente Financiero de IA',
      acting_as: 'Actuando como:',
      level: 'Nivel:',
      support_level: 'Nivel de Soporte',
      personality: 'Personalidad',
      placeholder: 'Pregúntale lo que sea a {personalityName}...',
      welcome: '¡Hola! ¿Cómo puedo ayudarte hoy?',
    },
    header: {
      sign_out: 'Cerrar Sesión',
    },
    card: {
        add_new: 'Añadir Nueva Tarjeta',
    },
  },
};

export type Language = keyof typeof TRANSLATIONS;
