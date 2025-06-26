import localFont from 'next/font/local'

export const mabryPro = localFont({
  src: [
    {
      path: '../../public/MabryPro/MabryPro-Light.ttf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../../public/MabryPro/MabryPro-LightItalic.ttf',
      weight: '300',
      style: 'italic',
    },
    {
      path: '../../public/MabryPro/MabryPro-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/MabryPro/MabryPro-Italic.ttf',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../../public/MabryPro/MabryPro-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/MabryPro/MabryPro-MediumItalic.ttf',
      weight: '500',
      style: 'italic',
    },
    {
      path: '../../public/MabryPro/MabryPro-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../../public/MabryPro/MabryPro-BoldItalic.ttf',
      weight: '700',
      style: 'italic',
    },
    {
      path: '../../public/MabryPro/MabryPro-Black.ttf',
      weight: '900',
      style: 'normal',
    },
    {
      path: '../../public/MabryPro/MabryPro-BlackItalic.ttf',
      weight: '900',
      style: 'italic',
    },
  ],
  variable: '--font-mabry-pro',
  display: 'swap',
}) 