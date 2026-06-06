declare module 'html5-qrcode' {
  export interface Html5QrcodeCameraScanConfig {
    fps?: number
    qrbox?: number | { width: number; height: number }
    aspectRatio?: number
    disableFlip?: boolean
  }
  export interface Html5QrcodeConfig {
    verbose?: boolean
  }
  export class Html5Qrcode {
    constructor(elementId: string, config?: boolean | Html5QrcodeConfig)
    start(
      cameraIdOrConfig: string | { facingMode: 'user' | 'environment' },
      config: Html5QrcodeCameraScanConfig,
      onSuccess: (decodedText: string, result: any) => void,
      onError?: (errorMessage: string, error: any) => void,
    ): Promise<void>
    stop(): Promise<void>
    clear(): Promise<void>
  }
  export class Html5QrcodeScanner {
    constructor(elementId: string, config: any, verbose?: boolean)
  }
  const _default: { Html5Qrcode: typeof Html5Qrcode; Html5QrcodeScanner: typeof Html5QrcodeScanner }
  export default _default
}
