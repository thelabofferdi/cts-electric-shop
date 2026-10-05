export const formatCfa = (value: number) => `${Math.round(value || 0).toLocaleString("fr-FR")} FCFA`;
export const cleanPhone = (value: string) => value.replace(/[^0-9]/g, "");
export const whatsappUrl = (phone: string, message: string) => `https://wa.me/${cleanPhone(phone)}?text=${encodeURIComponent(message)}`;
