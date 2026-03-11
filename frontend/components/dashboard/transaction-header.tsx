interface TransactionHeaderProps {
  address: string;
  transactionType: 'buy' | 'sell';
}

export function TransactionHeader({
  address,
  transactionType,
}: TransactionHeaderProps): JSX.Element {
  const typeLabel = transactionType === 'buy' ? 'Buyer Transaction' : 'Seller Transaction';

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-slate-500">
        EstateAI - Your AI Copilot for Buying a Home
      </p>
      <h1 className="mt-2 text-2xl font-semibold text-slate-900">{address}</h1>
      <p className="mt-1 text-sm text-slate-600">{typeLabel}</p>
    </section>
  );
}
