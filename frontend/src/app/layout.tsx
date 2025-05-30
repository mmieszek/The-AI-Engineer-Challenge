'use client';

import { Metadata } from 'next';
import StyledComponentsRegistry from './lib/registry';
import GlobalStyles from './styles/GlobalStyles';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>AI Engineer Challenge - GPT Chat</title>
        <meta name="description" content="Modern chat interface powered by GPT-4.1-nano via FastAPI" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <StyledComponentsRegistry>
          <GlobalStyles />
          {children}
        </StyledComponentsRegistry>
      </body>
    </html>
  );
} 