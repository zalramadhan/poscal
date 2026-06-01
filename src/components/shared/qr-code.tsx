'use client'

import { useEffect, useState } from 'react'

interface QRCodeProps {
  value: string
  size?: number
}

export function QRCode({ value, size = 120 }: QRCodeProps) {
  const [qrUrl, setQrUrl] = useState<string>('')

  useEffect(() => {
    import('qrcode').then((QRCode) => {
      QRCode.toDataURL(value, {
        width: size,
        margin: 1,
        color: { dark: '#000000', light: '#ffffff' },
      }).then(setQrUrl)
    })
  }, [value, size])

  if (!qrUrl) return <div style={{ width: size, height: size }} />

  return <img src={qrUrl} alt="QR Code" width={size} height={size} />
}
