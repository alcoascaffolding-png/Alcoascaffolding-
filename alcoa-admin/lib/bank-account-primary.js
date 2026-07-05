/**
 * Ensure only one bank account is marked primary (quotation / PDF default).
 */
export async function clearOtherPrimaryAccounts(BankAccount, exceptId = null) {
  const filter = exceptId ? { _id: { $ne: exceptId } } : {};
  await BankAccount.updateMany(filter, { $set: { isPrimary: false } });
}

export async function setPrimaryBankAccount(BankAccount, accountId) {
  await clearOtherPrimaryAccounts(BankAccount, accountId);
  const doc = await BankAccount.findByIdAndUpdate(
    accountId,
    { $set: { isPrimary: true } },
    { new: true, runValidators: true }
  );
  return doc;
}

/** When saving with isPrimary true, unset all other primary flags first. */
export async function applyPrimaryOnBankAccountSave(BankAccount, patch, accountId = null) {
  if (patch.isPrimary === true) {
    await clearOtherPrimaryAccounts(BankAccount, accountId);
  }
  return patch;
}
