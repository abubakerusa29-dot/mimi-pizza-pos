/** Staff PIN shown before the email and password login: exactly 6 digits. */
export const isStaffPin = (pin: string) => /^\d{6}$/.test(pin);
