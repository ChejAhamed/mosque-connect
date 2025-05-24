export const metadata = {
  title: 'MosqueConnect',
  description: 'Connecting Muslims with their local community',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
