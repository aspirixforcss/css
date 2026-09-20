import './globals.css'

export const metadata = {
  title: 'ASPIRIX FOR CSS - Platform Prototype',
  description: 'Your Ultimate FPSC Journey Starts Here.',
  icons: {
    icon: [
      { url: '/css/favicon-light.png', media: '(prefers-color-scheme: light)' },
      { url: '/css/favicon-dark.png', media: '(prefers-color-scheme: dark)' }
    ]
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link href='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css' rel='stylesheet'/>
      </head>
      <body className="bg-bgLight text-slate-800 dark:bg-bgDark dark:text-slate-200 h-screen overflow-hidden antialiased transition-colors duration-300">
        {children}
      </body>
    </html>
  )
}
