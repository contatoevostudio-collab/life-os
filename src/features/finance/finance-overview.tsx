"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { SectionHeading } from "@/components/ui/section-heading";
import { Select } from "@/components/ui/select";
import { currency, formatDate } from "@/lib/utils";
import { useAppState } from "@/providers/app-state-provider";
import { useAuth } from "@/providers/auth-provider";
import type { FinancialTransaction } from "@/types/domain";

export function FinanceOverview() {
  const { transactions, addTransaction, searchQuery } = useAppState();
  const { user } = useAuth();
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("0");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("2026-04-10");
  const [description, setDescription] = useState("");

  const income = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((total, transaction) => total + transaction.amount, 0);
  const expense = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((total, transaction) => total + transaction.amount, 0);
  const filteredTransactions = transactions.filter(
    (transaction: FinancialTransaction) =>
      !searchQuery.trim() ||
      transaction.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <SectionHeading
        description="Fluxo financeiro direto, sem transformar o módulo em um sistema contábil."
        eyebrow="Módulo"
        title="Financeiro"
        action={<Badge>{transactions.length} lançamentos</Badge>}
      />

      <div className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
        <Card className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-sm text-text-soft">Saldo</p>
            <p className="mt-1 text-3xl font-semibold tracking-[-0.05em]">{currency(income - expense)}</p>
          </div>
          <div>
            <p className="text-sm text-text-soft">Entradas</p>
            <p className="mt-1 text-3xl font-semibold tracking-[-0.05em]">{currency(income)}</p>
          </div>
          <div>
            <p className="text-sm text-text-soft">Saídas</p>
            <p className="mt-1 text-3xl font-semibold tracking-[-0.05em]">{currency(expense)}</p>
          </div>
        </Card>

        <Card className="space-y-3">
          <p className="text-sm text-text-soft">Novo lançamento</p>
          <Select onChange={(event) => setType(event.target.value as "income" | "expense")} value={type}>
            <option value="income">Entrada</option>
            <option value="expense">Saída</option>
          </Select>
          <Input onChange={(event) => setAmount(event.target.value)} placeholder="Valor" type="number" value={amount} />
          <Input onChange={(event) => setCategory(event.target.value)} placeholder="Categoria" value={category} />
          <Input onChange={(event) => setDate(event.target.value)} type="date" value={date} />
          <Input onChange={(event) => setDescription(event.target.value)} placeholder="Descrição opcional" value={description} />
          <Button
            onClick={() => {
              addTransaction({
                userId: user?.id ?? "demo-user",
                type,
                amount: Number(amount),
                category,
                date,
                description
              });
            }}
          >
            Registrar
          </Button>
        </Card>
      </div>

      <div className="grid gap-3">
        {filteredTransactions.length ? (
          filteredTransactions.map((transaction) => (
            <Card className="flex items-center justify-between gap-4" key={transaction.id}>
              <div>
                <p className="font-medium">{transaction.category}</p>
                <p className="mt-1 text-sm text-text-soft">
                  {transaction.description ?? "Sem descrição"} • {formatDate(transaction.date)}
                </p>
              </div>
              <p className={transaction.type === "income" ? "text-success" : "text-danger"}>
                {transaction.type === "income" ? "+" : "-"} {currency(transaction.amount)}
              </p>
            </Card>
          ))
        ) : (
          <EmptyState
            description="Seus lançamentos aparecerão aqui assim que você registrar entradas ou saídas."
            title="Financeiro zerado"
          />
        )}
      </div>
    </div>
  );
}
