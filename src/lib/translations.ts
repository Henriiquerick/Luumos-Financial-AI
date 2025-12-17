
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
      welcome_prompt: 'Try saying: "Add my new Nubank card with a $5000 limit" or "I just bought a coffee for $10".',
      error: 'Sorry, an error occurred. Please try again.',
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
        subtitle: 'Add a new income or expense to your account. AI can help you categorize it.',
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
          addIncome: 'Add Income'
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
              title: 'Add New Credit Card',
              subtitle: 'Enter the details for your new card.'
          },
          edit: {
              title: 'Edit Credit Card',
              subtitle: 'Update the details for your card.'
          },
          fields: {
              name: 'Card Name',
              limit: 'Total Limit',
              closingDay: 'Closing Day',
              color: 'Card Color',
              namePlaceholder: 'e.g., Nubank',
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
      welcome_prompt: 'Tente dizer: "Adicione meu novo cartão Nubank com limite de R$5000" ou "Acabei de comprar um café por R$10".',
      error: 'Desculpe, ocorreu um erro. Por favor, tente novamente.',
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
        subtitle: 'Adicione uma nova receita ou despesa à sua conta. A IA pode ajudar a categorizar.',
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
          addIncome: 'Adicionar Receita'
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
              title: 'Adicionar Novo Cartão de Crédito',
              subtitle: 'Insira os detalhes do seu novo cartão.'
          },
          edit: {
              title: 'Editar Cartão de Crédito',
              subtitle: 'Atualize os detalhes do seu cartão.'
          },
          fields: {
              name: 'Nome do Cartão',
              limit: 'Limite Total',
              closingDay: 'Dia de Fechamento',
              color: 'Cor do Cartão',
              namePlaceholder: 'ex: Nubank',
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
      welcome_prompt: 'Intenta decir: "Añade mi nueva tarjeta Nubank con un límite de $5000" o "Acabo de comprar un café por $10".',
      error: 'Lo siento, ocurrió un error. Por favor, inténtalo de nuevo.',
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
        subtitle: 'Añade un nuevo ingreso o gasto a tu cuenta. La IA puede ayudar a categorizarlo.',
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
          addIncome: 'Añadir Ingreso'
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
              closingDay: 'Día de Cierre',
              color: 'Color de la Tarjeta',
              namePlaceholder: 'ej: Nubank',
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
      }
    }
  },
};

export type Language = keyof typeof TRANSLATIONS;
