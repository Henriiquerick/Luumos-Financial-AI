# **App Name**: Luumos Financial AI

## Core Features:

- Transaction Input: Manually add income and expense transactions with details like amount, title, category, and date.
- Installment Management: Handles installment purchases by creating multiple transaction entries for future months based on the defined parameters. Includes logic to create the 'installment_group_id'.
- Real-time Balances: Calculate and display the user's current available balance.
- Projected Balance Timeline: Show a horizontal timeline of future months, displaying the projected available balance based on scheduled transactions and installment commitments. Includes a Firestore monthly summary.
- AI Finance Personalities: Allow users to select an AI finance personality, which will provide tailored financial advice.
- Intelligent Spend Categorization: AI tool that suggests transaction categories based on the description of the transaction, learning from user behavior to improve accuracy.
- User Preferences: Allows user to update preferences related to the AI personality.

## Style Guidelines:

- Primary color: Neon Green (#39FF14) for a futuristic and vibrant feel.
- Background color: Deep black (#080808) to enhance the neon colors.
- Accent color: Electric Blue (#7DF9FF) to highlight interactive elements.
- Body and headline font: 'Space Grotesk' (sans-serif) for a modern, techy appearance.
- Use minimalistic, geometric icons with neon outlines to maintain a clean, cyberpunk-inspired look.
- Use a card-based layout with rounded corners and subtle shadows to create depth. Cards should be clearly separated on the dark background.
- Implement smooth transitions and subtle animations on user interactions, such as expanding cards or updating balances. Micro-interactions that don't distract from the information architecture.