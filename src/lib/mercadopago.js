import { MercadoPagoConfig } from 'mercadopago';

export function getMercadoPagoClient() {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error('Falta configurar MERCADOPAGO_ACCESS_TOKEN en las variables de entorno.');
  }
  return new MercadoPagoConfig({ accessToken });
}
