
export const TRANSLATIONS = {
  en: {
    dashboard: {
      greeting: 'Welcome,',
      welcome_back: 'Welcome to Lucent AI',
      subtitle: 'Here is the summary of your financial life.',
      balance: 'Available Balance',
      real_available: 'Real Available',
      in_account: 'In account:',
      add_transaction: 'Add Transaction',
      recent_activity: 'Recent Activity',
      last_transactions: 'Your last 5 transactions.',
      installment_tunnel: 'Installment Tunnel',
      installment_subtitle: 'Your projected credit card bills for the next 6 months.',
      daily_insight: 'Daily Insight',
      insight_error: '({personalityName}): The market is volatile, but I am watching. Try again later.',
      view_full_history: 'View Full History',
    },
    history: {
      title: 'Transaction History',
      subtitle: 'View, search, and filter your full transaction history.',
      filters: {
        period: 'Period',
        this_month: 'This Month',
        last_3_months: 'Last 3 Months',
        this_year: 'This Year',
        all_time: 'All Time',
      },
      load_more: 'Load More',
    },
    theme: {
        light: 'Light',
        dark: 'Dark',
        system: 'System',
    },
    transaction: {
      header: 'Transaction',
      date: 'Date',
      amount: 'Amount',
      actions: 'Actions',
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
      error: 'Sorry, an error occurred. Please try again.',
      welcomeMessages: {
        harvey: "Let's cut to the chase. What's the bottom line?",
        neytan: "LET'S GO, MONSTER! WHAT'S THE PLAN TODAY? IT'S SHOWTIME!",
        biris: "Hello! I'm here to help you with your finances. How can I assist you today?",
        rick: "Alright, Morty, what financial mess have you gotten yourself into this time? Don't waste my time.",
        biro: "Hey there, kiddo! Your cool uncle is here. What's on your mind? Let's figure this out together.",
        jorgin: "Hey, bestie! Spill the tea. What are we manifesting today, a million dollars or just brunch? ✨"
      }
    },
    header: {
      sign_out: 'Sign Out',
    },
    card: {
      add_new: 'Add New Card',
      menu: {
        edit: 'Edit Card',
        delete: 'Delete Card',
      },
      limit_info: '{available} available of {total}',
      valid_thru: 'VALID:',
    },
    toasts: {
      profile: {
        title: 'Profile Updated',
        description: 'Your information has been saved successfully.',
      },
      transaction: {
        title: 'Success!',
        description: 'Transaction of {amount} added.',
      },
      transaction_deleted: {
        title: 'Transaction Deleted',
        description: 'The transaction has been successfully removed.',
      },
      installments: {
        title: 'Success',
        description: '{count} installments were created.',
      },
      ai: {
        title: 'AI Suggestion',
        description: 'We\'ve categorized this as "{category}".',
      },
      card: {
        deleted: {
          title: 'Card Deleted',
          description: 'The card "{cardName}" and its transactions have been removed.',
        },
      },
      error: {
        title: 'Error',
        description: 'Could not complete the operation.',
      },
    },
    modals: {
      transaction: {
        title: 'Add Transaction',
        edit_title: 'Edit Transaction',
        subtitle: 'Add a new income or expense to your account. AI can help you categorize it.',
        edit_subtitle: 'Update the details of your transaction.',
        tabs: { expense: 'Expense', income: 'Income' },
        fields: {
          description: 'Description',
          amount: 'Amount',
          date: 'Date',
          category: 'Category',
          paymentMethod: 'Payment Method',
          card: 'Card',
          installments: 'Installment Purchase',
          installments_number: 'Number of Installments',
          placeholderDesc: 'e.g., Coffee shop',
          placeholderCategory: 'Select a category',
          placeholderPayment: 'Select a payment method',
          placeholderCard: 'Select a card',
          available: 'Available',
          cash: 'Cash / Debit',
          creditCard: 'Credit Card',
        },
        submit: {
          addExpense: 'Add Expense',
          addIncome: 'Add Income',
          save: 'Save Changes'
        }
      },
      profile: {
        title: 'Edit Your Profile',
        subtitle: 'Keep your information up to date. This helps the AI provide more personalized advice.',
        fields: {
          firstName: 'First Name',
          lastName: 'Last Name',
          birthDate: 'Date of Birth',
          city: 'City',
          job: 'Job Title',
          company: 'Company',
          cityPlaceholder: 'e.g., San Francisco',
          jobPlaceholder: 'e.g., Software Engineer',
          companyPlaceholder: 'e.g., Google',
        },
        save: 'Save Changes'
      },
      card: {
          add: {
              title: 'Add New Card',
              subtitle: 'Enter the details for your new card.'
          },
          edit: {
              title: 'Edit Card',
              subtitle: 'Update the details for your card.'
          },
          fields: {
              name: 'Card Name',
              limit: 'Total Limit',
              balance: 'Available Balance',
              closingDay: 'Closing Day',
              dueDay: 'Due Day',
              expiryDate: 'Expiry Date',
              color: 'Card Color',
              namePlaceholder: 'e.g., Main Card',
              dayPlaceholder: 'Select Day'
          },
          save: 'Save Card',
          save_changes: 'Save Changes'
      },
      delete_card: {
          title: 'Are you sure?',
          description: 'This will permanently delete the card "{cardName}" and all of its associated transactions. This action cannot be undone.',
          cancel: 'Cancel',
          confirm: 'Delete',
      },
      delete_transaction: {
          confirmation: 'Are you sure you want to delete this transaction?',
      }
    }
  },
  pt: {
    dashboard: {
      greeting: 'Bem-vindo(a),',
      welcome_back: 'Bem-vindo(a) ao Lucent AI',
      subtitle: 'Aqui está o resumo da sua vida financeira.',
      balance: 'Saldo Disponível',
      real_available: 'Disponível Real',
      in_account: 'Em conta:',
      add_transaction: 'Adicionar Transação',
      recent_activity: 'Atividade Recente',
      last_transactions: 'Suas últimas 5 transações.',
      installment_tunnel: 'Túnel de Parcelas',
      installment_subtitle: 'Suas faturas de cartão de crédito projetadas para os próximos 6 meses.',
      daily_insight: 'Insight Diário',
      insight_error: '({personalityName}): O mercado está volátil, mas estou de olho. Tente novamente mais tarde.',
      view_full_history: 'Ver Histórico Completo',
    },
    history: {
      title: 'Histórico de Transações',
      subtitle: 'Veja, pesquise e filtre todo o seu histórico de transações.',
      filters: {
        period: 'Período',
        this_month: 'Este Mês',
        last_3_months: 'Últimos 3 Meses',
        this_year: 'Este Ano',
        all_time: 'Desde o início',
      },
      load_more: 'Carregar Mais',
    },
    theme: {
        light: 'Claro',
        dark: 'Escuro',
        system: 'Sistema',
    },
    transaction: {
      header: 'Transação',
      date: 'Data',
      amount: 'Valor',
      actions: 'Ações',
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
      error: 'Desculpe, ocorreu um erro. Por favor, tente novamente.',
      welcomeMessages: {
        harvey: "Vamos direto ao ponto. Qual é o resumo da situação?",
        neytan: "BORA, MONSTRO! QUAL O PLANO DE HOJE? É HORA DO SHOW!",
        biris: "Olá! Estou aqui para te ajudar com suas finanças. Como posso te auxiliar hoje?",
        rick: "Certo, Morty, em que confusão financeira você se meteu dessa vez? Não me faça perder tempo.",
        biro: "E aí, filhão! O tio tá na área. O que tá pegando? Vamos resolver isso juntos.",
        jorgin: "E aí, mona! Me conta a fofoca. O que vamos manifestar hoje, um milhão ou só o brunch? ✨"
      }
    },
    header: {
      sign_out: 'Sair',
    },
    card: {
        add_new: 'Adicionar Novo Cartão',
        menu: {
          edit: 'Editar Cartão',
          delete: 'Excluir Cartão',
        },
        limit_info: '{available} disponíveis de {total}',
        valid_thru: 'VAL:',
    },
    toasts: {
      profile: {
        title: 'Perfil Atualizado',
        description: 'Suas informações foram salvas com sucesso.',
      },
      transaction: {
        title: 'Sucesso!',
        description: 'Transação de {amount} adicionada.',
      },
      transaction_deleted: {
        title: 'Transação Excluída',
        description: 'A transação foi removida com sucesso.',
      },
      installments: {
        title: 'Sucesso',
        description: '{count} parcelas foram criadas.',
      },
      ai: {
        title: 'Sugestão da IA',
        description: 'Categorizamos isso como "{category}".',
      },
      card: {
        deleted: {
          title: 'Cartão Excluído',
          description: 'O cartão "{cardName}" e suas transações foram removidos.',
        },
      },
      error: {
        title: 'Erro',
        description: 'Não foi possível completar a operação.',
      },
    },
    modals: {
      transaction: {
        title: 'Adicionar Transação',
        edit_title: 'Editar Transação',
        subtitle: 'Adicione uma nova receita ou despesa à sua conta. A IA pode ajudar a categorizar.',
        edit_subtitle: 'Atualize os detalhes da sua transação.',
        tabs: { expense: 'Despesa', income: 'Receita' },
        fields: {
          description: 'Descrição',
          amount: 'Valor',
          date: 'Data',
          category: 'Categoria',
          paymentMethod: 'Meio de Pagamento',
          card: 'Cartão',
          installments: 'Compra Parcelada',
          installments_number: 'Número de Parcelas',
          placeholderDesc: 'ex: Cafeteria',
          placeholderCategory: 'Selecione uma categoria',
          placeholderPayment: 'Selecione um meio de pagamento',
          placeholderCard: 'Selecione um cartão',
          available: 'Disponível',
          cash: 'Dinheiro / Débito',
          creditCard: 'Cartão de Crédito'
        },
        submit: {
          addExpense: 'Adicionar Despesa',
          addIncome: 'Adicionar Receita',
          save: 'Salvar Alterações'
        }
      },
      profile: {
        title: 'Editar Seu Perfil',
        subtitle: 'Mantenha suas informações atualizadas. Isso ajuda a IA a fornecer conselhos mais personalizados.',
        fields: {
          firstName: 'Nome',
          lastName: 'Sobrenome',
          birthDate: 'Data de Nascimento',
          city: 'Cidade',
          job: 'Cargo',
          company: 'Empresa',
          cityPlaceholder: 'ex: São Paulo',
          jobPlaceholder: 'ex: Engenheiro(a) de Software',
          companyPlaceholder: 'ex: Google',
        },
        save: 'Salvar Alterações'
      },
      card: {
          add: {
              title: 'Adicionar Novo Cartão',
              subtitle: 'Insira os detalhes do seu novo cartão.'
          },
          edit: {
              title: 'Editar Cartão',
              subtitle: 'Atualize os detalhes do seu cartão.'
          },
          fields: {
              name: 'Apelido do Cartão',
              limit: 'Limite Total',
              balance: 'Saldo Disponível',
              closingDay: 'Dia de Fechamento',
              dueDay: 'Dia de Vencimento',
              expiryDate: 'Data de Validade',
              color: 'Cor do Cartão',
              namePlaceholder: 'ex: Cartão Principal',
              dayPlaceholder: 'Selecione o Dia'
          },
          save: 'Salvar Cartão',
          save_changes: 'Salvar Alterações'
      },
      delete_card: {
          title: 'Você tem certeza?',
          description: 'Isso excluirá permanentemente o cartão "{cardName}" e todas as suas transações associadas. Esta ação não pode ser desfeita.',
          cancel: 'Cancelar',
          confirm: 'Excluir',
      },
      delete_transaction: {
          confirmation: 'Você tem certeza que deseja excluir esta transação?',
      }
    }
  },
  es: {
    dashboard: {
      greeting: 'Bienvenido(a),',
      welcome_back: 'Bienvenido(a) a Lucent AI',
      subtitle: 'Aquí está el resumen de tu vida financiera.',
      balance: 'Saldo Disponible',
      real_available: 'Disponible Real',
      in_account: 'En cuenta:',
      add_transaction: 'Añadir Transacción',
      recent_activity: 'Actividad Reciente',
      last_transactions: 'Tus últimas 5 transacciones.',
      installment_tunnel: 'Túnel de Cuotas',
      installment_subtitle: 'Las facturas de tu tarjeta de crédito proyectadas para los próximos 6 meses.',
      daily_insight: 'Insight Diario',
      insight_error: '({personalityName}): El mercado está volátil, pero estoy atento. Inténtalo de nuevo más tarde.',
      view_full_history: 'Ver Historial Completo',
    },
    history: {
      title: 'Historial de Transacciones',
      subtitle: 'Vea, busque y filtre su historial de transacciones completo.',
      filters: {
        period: 'Período',
        this_month: 'Este Mes',
        last_3_months: 'Últimos 3 Meses',
        this_year: 'Este Año',
        all_time: 'Desde el principio',
      },
      load_more: 'Cargar Más',
    },
    theme: {
        light: 'Claro',
        dark: 'Oscuro',
        system: 'Sistema',
    },
    transaction: {
      header: 'Transacción',
      date: 'Fecha',
      amount: 'Monto',
      actions: 'Acciones',
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
      error: 'Lo siento, ocurrió un error. Por favor, inténtalo de nuevo.',
      welcomeMessages: {
        harvey: "Vayamos al grano. ¿Cuál es el balance final?",
        neytan: "¡VAMOS, CAMPEÓN! ¿CUÁL ES EL PLAN DE HOY? ¡ES HORA DEL ESPECTÁCULO!",
        biris: "¡Hola! Estoy aquí para ayudarte con tus finanzas. ¿Cómo puedo asistirte hoy?",
        rick: "Muy bien, Morty, ¿en qué lío financiero te has metido esta vez? No me hagas perder el tiempo.",
        biro: "¡Hola, campeón! Tu tío favorito está aquí. ¿Qué te preocupa? Vamos a resolverlo juntos.",
        jorgin: "¡Hola, cari! Cuéntame el chisme. ¿Qué vamos a manifestar hoy, un millón de dólares o solo el brunch? ✨"
      }
    },
    header: {
      sign_out: 'Cerrar Sesión',
    },
    card: {
        add_new: 'Añadir Nueva Tarjeta',
        menu: {
          edit: 'Editar Tarjeta',
          delete: 'Eliminar Tarjeta',
        },
        limit_info: '{available} disponibles de {total}',
        valid_thru: 'VÁL:',
    },
    toasts: {
      profile: {
        title: 'Perfil Actualizado',
        description: 'Tu información ha sido guardada con éxito.',
      },
      transaction: {
        title: '¡Éxito!',
        description: 'Transacción de {amount} añadida.',
      },
      transaction_deleted: {
        title: 'Transacción Eliminada',
        description: 'La transacción ha sido eliminada con éxito.',
      },
      installments: {
        title: 'Éxito',
        description: 'Se crearon {count} cuotas.',
      },
ai: {
        title: 'Sugerencia de IA',
        description: 'Hemos categorizado esto como "{category}".',
      },
      card: {
        deleted: {
          title: 'Tarjeta Eliminada',
          description: 'La tarjeta "{cardName}" y sus transacciones han sido eliminadas.',
        },
      },
      error: {
        title: 'Error',
        description: 'No se pudo completar la operación.',
      },
    },
    modals: {
      transaction: {
        title: 'Añadir Transacción',
        edit_title: 'Editar Transacción',
        subtitle: 'Añade un nuevo ingreso o gasto a tu cuenta. La IA puede ayudar a categorizarlo.',
        edit_subtitle: 'Actualiza los detalles de tu transacción.',
        tabs: { expense: 'Gasto', income: 'Ingreso' },
        fields: {
          description: 'Descripción',
          amount: 'Monto',
          date: 'Fecha',
          category: 'Categoría',
          paymentMethod: 'Método de Pago',
          card: 'Tarjeta',
          installments: 'Compra a Plazos',
          installments_number: 'Número de Cuotas',
          placeholderDesc: 'ej: Cafetería',
          placeholderCategory: 'Selecciona una categoría',
          placeholderPayment: 'Selecciona un método de pago',
          placeholderCard: 'Selecciona una tarjeta',
          available: 'Disponible',
          cash: 'Efectivo / Débito',
          creditCard: 'Tarjeta de Crédito'
        },
        submit: {
          addExpense: 'Añadir Gasto',
          addIncome: 'Añadir Ingreso',
          save: 'Guardar Cambios'
        }
      },
      profile: {
        title: 'Editar Tu Perfil',
        subtitle: 'Mantén tu información actualizada. Esto ayuda a la IA a proporcionar consejos más personalizados.',
        fields: {
          firstName: 'Nombre',
          lastName: 'Apellido',
          birthDate: 'Fecha de Nacimiento',
          city: 'Ciudad',
          job: 'Puesto de Trabajo',
          company: 'Empresa',
          cityPlaceholder: 'ej: Madrid',
          jobPlaceholder: 'ej: Ingeniero(a) de Software',
          companyPlaceholder: 'ej: Google',
        },
        save: 'Guardar Cambios'
      },
      card: {
          add: {
              title: 'Añadir Nueva Tarjeta de Crédito',
              subtitle: 'Introduce los detalles de tu nueva tarjeta.'
          },
          edit: {
              title: 'Editar Tarjeta de Crédito',
              subtitle: 'Actualiza los detalles de tu tarjeta.'
          },
          fields: {
              name: 'Nombre de la Tarjeta',
              limit: 'Límite Total',
              balance: 'Saldo Disponible',
              closingDay: 'Día de Cierre',
              dueDay: 'Día de Vencimiento',
              expiryDate: 'Fecha de Caducidad',
              color: 'Color de la Tarjeta',
              namePlaceholder: 'ej: Tarjeta Principal',
              dayPlaceholder: 'Seleccione el Día'
          },
          save: 'Guardar Tarjeta',
          save_changes: 'Guardar Cambios'
      },
      delete_card: {
          title: '¿Estás seguro?',
          description: 'Esto eliminará permanentemente la tarjeta "{cardName}" y todas sus transacciones asociadas. Esta acción no se puede deshacer.',
          cancel: 'Cancelar',
          confirm: 'Eliminar',
      },
      delete_transaction: {
          confirmation: '¿Estás seguro de que quieres eliminar esta transacción?',
      }
    }
  },
};

export type Language = keyof typeof TRANSLATIONS;
